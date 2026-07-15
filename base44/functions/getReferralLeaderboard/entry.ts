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

    const leaderboard = Object.values(agg)
      .map((a) => ({
        ...a,
        name: codeToName[a.referral_code] || "Participant",
      }))
      .sort((a, b) => b.total_earnings - a.total_earnings || b.total_referrals - a.total_referrals)
      .slice(0, 20);

    const myCode = profiles.find((p) => p.created_by_id === user.id)?.referral_code;
    const myRank = myCode
      ? leaderboard.findIndex((e) => e.referral_code === myCode)
      : -1;

    return Response.json({ leaderboard, myCode, myRank });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});