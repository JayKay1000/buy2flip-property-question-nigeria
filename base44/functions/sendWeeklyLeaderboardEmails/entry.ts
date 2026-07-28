import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// Runs from a scheduled workflow (no user session) — operates as service role.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Only admins (or scheduled system workflows, which run with an admin
    // context) may trigger this bulk email send — blocks unauthenticated calls.
    const caller = await base44.auth.me();
    if (!caller || caller.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const [referrals, profiles, users] = await Promise.all([
      base44.asServiceRole.entities.Referral.list("-created_date", 5000),
      base44.asServiceRole.entities.ParticipantProfile.list("-created_date", 5000),
      base44.asServiceRole.entities.User.list("-created_date", 5000),
    ]);

    // Map referral_code -> profile (full name + owner id)
    const codeToProfile = Object.create(null);
    profiles.forEach((p) => {
      if (p.referral_code) {
        codeToProfile[p.referral_code] = p;
      }
    });

    // Aggregate referral counts per referrer code
    const agg = Object.create(null);
    referrals.forEach((r) => {
      const code = r.referrer_code;
      if (!code) return;
      if (!agg[code]) {
        agg[code] = { referral_code: code, total_referrals: 0, total_earnings: 0 };
      }
      agg[code].total_referrals += 1;
      agg[code].total_earnings += r.reward_amount || 0;
    });

    // Rank by total referrals (descending), then earnings as tiebreaker
    const ranked = Object.values(agg)
      .sort(
        (a: any, b: any) =>
          b.total_referrals - a.total_referrals ||
          b.total_earnings - a.total_earnings
      )
      .slice(0, 10);

    const userIdToEmail = Object.create(null);
    users.forEach((u) => {
      userIdToEmail[u.id] = u.email;
    });

    let sent = 0;
    const skipped: string[] = [];
    const failures: any[] = [];

    for (let i = 0; i < ranked.length; i++) {
      const entry: any = ranked[i];
      const profile = codeToProfile[entry.referral_code];
      const email = profile?.created_by_id
        ? userIdToEmail[profile.created_by_id]
        : null;
      const fullName = profile?.full_name || "Participant";
      const rank = i + 1;

      if (!email) {
        skipped.push(entry.referral_code);
        continue;
      }

      const ordinal = rank === 1 ? "1st" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : `${rank}th`;

      const body = [
        `Hello ${fullName},`,
        "",
        "Here is your weekly referral leaderboard update from Property Question Nigeria Limited.",
        "",
        `You are currently ranked ${ordinal} on the referral leaderboard.`,
        `You have ${entry.total_referrals} referral${entry.total_referrals === 1 ? "" : "s"} this period.`,
        "",
        entry.total_referrals > 0
          ? "Thank you for growing the Land Banking community — keep sharing your referral code to climb higher next week."
          : "Keep sharing your referral code to climb the leaderboard next week.",
        "",
        "Warm regards,",
        "Property Question Nigeria Limited",
      ].join("\n");

      try {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: `Your Weekly Referral Leaderboard Update — Rank ${ordinal}`,
          body,
        });
        sent++;
      } catch (e) {
        failures.push({ error: e.message });
      }
    }

    return Response.json({
      success: true,
      top_count: ranked.length,
      sent_count: sent,
      skipped,
      failures,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});