import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const [referrals, profiles] = await Promise.all([
      base44.asServiceRole.entities.Referral.list(),
      base44.asServiceRole.entities.ParticipantProfile.list(),
    ]);

    const codeToName = Object.create(null);
    profiles.forEach((p) => {
      if (p.referral_code) codeToName[p.referral_code] = p.full_name;
    });

    const myCode = profiles.find((p) => p.created_by_id === user.id)?.referral_code;

    // Mask participant names so the public leaderboard never exposes full real names.
    const maskName = (full) => {
      if (!full) return "Participant";
      const parts = full.trim().split(/\s+/);
      if (parts.length === 1) return parts[0];
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    };

    const agg = Object.create(null);
    referrals.forEach((r) => {
      const code = r.referrer_code;
      if (!code) return;
      if (!agg[code]) {
        agg[code] = {
          referral_code: code,
          total_referrals: 0,
          paid_referrals: 0,
          total_earnings: 0,
        };
      }
      agg[code].total_referrals += 1;
      if (r.status === "paid") agg[code].paid_referrals += 1;
      agg[code].total_earnings += r.reward_amount || 0;
    });

    // Return only a limited, anonymized top-20 ranking — no referral codes or full names.
    const leaderboard = Object.values(agg)
      .sort((a, b) => b.total_earnings - a.total_earnings || b.total_referrals - a.total_referrals)
      .slice(0, 20)
      .map((a, i) => ({
        rank: i + 1,
        name: maskName(codeToName[a.referral_code]),
        total_referrals: a.total_referrals,
        paid_referrals: a.paid_referrals,
        total_earnings: a.total_earnings,
        is_current_user: myCode ? a.referral_code === myCode : false,
      }));

    const myRank = myCode
      ? leaderboard.findIndex((e) => e.is_current_user)
      : -1;

    return Response.json({ leaderboard, myCode, myRank });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});