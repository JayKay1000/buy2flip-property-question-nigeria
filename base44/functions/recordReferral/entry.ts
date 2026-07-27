import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// Reward fractions — the single source of truth for the referral programme.
const DIRECT_PCT = 0.02;
const INDIRECT_PCT = 0.005;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const referrerCode = typeof body.referrerCode === "string" ? body.referrerCode.trim().toUpperCase() : "";
    const referredName = typeof body.referredName === "string" ? body.referredName.trim() : "";
    const referredEmail = typeof body.referredEmail === "string" ? body.referredEmail.trim().toLowerCase() : "";

    if (!referrerCode || !referredEmail) {
      return Response.json({ error: "Missing referrer code or referred email." }, { status: 400 });
    }

    // Look up the direct referrer's profile (service role bypasses RLS so we can
    // see another participant's record and resolve the grandparent referrer).
    const profiles = await base44.asServiceRole.entities.ParticipantProfile.filter({ referral_code: referrerCode });
    const referrerProfile = profiles && profiles[0];
    if (!referrerProfile) {
      return Response.json({ created: false, reason: "Referrer code not found." });
    }
    const referrerUserId = referrerProfile.created_by_id || null;

    // Level 1 — direct referrer earns 2% on this participant's commitments.
    await base44.asServiceRole.entities.Referral.create({
      referrer_code: referrerCode,
      referrer_user_id: referrerUserId,
      referred_name: referredName,
      referred_email: referredEmail,
      level: 1,
      reward_percentage: DIRECT_PCT,
      status: "pending",
    });

    // Level 2 — the referrer's own referrer (grandparent) earns 0.5% on this
    // participant's commitments. This is the "2-in-line" record.
    const grandparentCode = referrerProfile.referred_by_code;
    if (grandparentCode) {
      const gpProfiles = await base44.asServiceRole.entities.ParticipantProfile.filter({ referral_code: grandparentCode });
      const grandparentProfile = gpProfiles && gpProfiles[0];
      const grandparentUserId = grandparentProfile?.created_by_id || null;
      await base44.asServiceRole.entities.Referral.create({
        referrer_code: grandparentCode,
        referrer_user_id: grandparentUserId,
        referred_name: referredName,
        referred_email: referredEmail,
        level: 2,
        reward_percentage: INDIRECT_PCT,
        status: "pending",
      });
    }

    return Response.json({ created: true });
  } catch (error) {
    return Response.json({ error: error.message || "Failed to record referral." }, { status: 500 });
  }
}