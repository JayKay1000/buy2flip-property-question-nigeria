import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// Reward fractions — kept in sync with recordReferral / applyReferralRewards.
const REWARD_BY_LEVEL = { 1: 0.02, 2: 0.005 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Only admins (or the entity-triggered system workflow, which runs with an
    // admin context) may process referral rewards and trigger notification emails.
    const caller = await base44.auth.me();
    if (!caller || caller.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const referralId = typeof body.referralId === "string" ? body.referralId : "";
    if (!referralId) {
      return Response.json({ error: "Missing referralId." }, { status: 400 });
    }

    // 1. Load the newly recorded referral (service role bypasses RLS).
    let referral = null;
    try {
      referral = await base44.asServiceRole.entities.Referral.get(referralId);
    } catch {
      return Response.json({ processed: false, reason: "Referral not found." });
    }
    if (!referral) {
      return Response.json({ processed: false, reason: "Referral not found." });
    }

    // 2. Resolve the referrer's participant profile.
    const code = (referral.referrer_code || "").trim().toUpperCase();
    let referrerProfile = null;
    if (code) {
      try {
        const profiles = await base44.asServiceRole.entities.ParticipantProfile.filter({ referral_code: code });
        referrerProfile = profiles && profiles[0];
      } catch {}
    }
    if (!referrerProfile) {
      return Response.json({ processed: false, verified: false, reason: "Referrer profile not found." });
    }

    // 3. Verification gate — the referrer's account must be admin-verified (active).
    const verified = referrerProfile.status === "active";
    if (!verified) {
      return Response.json({ processed: false, verified: false, reason: "Referrer account not verified." });
    }

    // 4. Apply the referral reward. Basis = the referred participant's active +
    //    completed commitments (0 at the moment of recording, accrues later).
    let basis = 0;
    const referredEmail = (referral.referred_email || "").toLowerCase();
    if (referredEmail) {
      try {
        const users = await base44.asServiceRole.entities.User.list("-created_date", 500);
        const referredUser = users.find((u) => (u.email || "").toLowerCase() === referredEmail);
        if (referredUser) {
          const comms = await base44.asServiceRole.entities.Commitment.filter({ created_by_id: referredUser.id });
          basis = comms
            .filter((c) => c.status === "active" || c.status === "completed")
            .reduce((sum, c) => sum + (c.amount || 0), 0);
        }
      } catch {}
    }

    const pct = referral.reward_percentage || REWARD_BY_LEVEL[referral.level] || 0;
    const rewardAmount = Math.round(basis * pct);

    // Reward amount is stored but status stays "pending" until the participant
    // requests a withdrawal and an admin processes it.
    await base44.asServiceRole.entities.Referral.update(referral.id, {
      commitment_amount: basis,
      reward_amount: rewardAmount,
    });

    // 5. Send a congratulatory notification email to the referrer (registered user).
    let emailed = false;
    const referrerUserId = referrerProfile.created_by_id || referral.referrer_user_id;
    if (referrerUserId) {
      try {
        const referrerUser = await base44.asServiceRole.entities.User.get(referrerUserId);
        const referrerEmail = referrerUser?.email || "";
        if (referrerEmail) {
          const levelLabel = referral.level === 1 ? "direct" : "indirect";
          const rewardPctText = (pct * 100).toFixed(1) + "%";
          const emailBody = [
            `Hello ${referrerUser.full_name || "Participant"},`,
            "",
            `Congratulations! A new ${levelLabel} referral has just been recorded on your account.`,
            "",
            `Referred participant: ${referral.referred_name || referredEmail}`,
            `Your referral reward rate: ${rewardPctText}`,
            "",
            "Your referral reward will accrue as your referred participant makes commitment payments, and you will be able to request a payout once the rewards are confirmed.",
            "",
            "Keep sharing your referral code to grow your earnings.",
            "",
            "— Property Question Nigeria Limited",
          ].join("\n");
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: referrerEmail,
            subject: "Congratulations! A New Referral Has Been Recorded",
            body: emailBody,
          });
          emailed = true;
        }
      } catch {}
    }

    return Response.json({
      processed: true,
      verified: true,
      reward_amount: rewardAmount,
      basis,
      emailed,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Failed to process referral reward." },
      { status: 500 }
    );
  }
});