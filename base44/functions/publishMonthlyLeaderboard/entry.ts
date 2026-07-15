import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const [referrals, profiles] = await Promise.all([
      base44.asServiceRole.entities.Referral.list(),
      base44.asServiceRole.entities.ParticipantProfile.list(),
    ]);

    const codeToName = {};
    profiles.forEach((p) => {
      if (p.referral_code) codeToName[p.referral_code] = p.full_name;
    });

    const agg = {};
    referrals.forEach((r) => {
      const code = r.referrer_code;
      if (!code) return;
      if (!agg[code]) {
        agg[code] = { referral_code: code, total_referrals: 0, total_earnings: 0 };
      }
      agg[code].total_referrals += 1;
      agg[code].total_earnings += r.reward_amount || 0;
    });

    const entries = Object.values(agg)
      .map((a) => ({ ...a, name: codeToName[a.referral_code] || 'Participant' }))
      .sort((a, b) => b.total_earnings - a.total_earnings || b.total_referrals - a.total_referrals)
      .slice(0, 10)
      .map((a, idx) => ({
        rank: idx + 1,
        name: a.name,
        referral_code: a.referral_code,
        total_referrals: a.total_referrals,
        total_earnings: a.total_earnings,
      }));

    const now = new Date();
    const period_label = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const snapshot = await base44.asServiceRole.entities.LeaderboardSnapshot.create({
      period_label,
      entries,
      published_by: user.full_name || user.email,
    });

    return Response.json({ snapshot, entries });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});