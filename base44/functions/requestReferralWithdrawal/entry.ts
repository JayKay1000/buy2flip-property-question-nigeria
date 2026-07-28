import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// Server-authoritative referral-earnings withdrawal. Computes the
// participant's true withdrawable balance from a FRESH fetch of their
// referrals and active referral withdrawal requests (not the client's
// possibly-stale state), so a request can never exceed what is actually
// available. This prevents the over-request bug where a second request
// failed to subtract an existing in-flight request and locked the user out.
//
// Model (kept in sync with src/lib/referralEarnings.js):
//   balance per referral = reward_amount − withdrawn_amount
//   totalAccrued         = sum of positive balances
//   available            = max(0, totalAccrued − active request amounts)

const ACTIVE_REQUEST_STATUSES = ["requested", "processing"];

const referralBalance = (r) => (r.reward_amount || 0) - (r.withdrawn_amount || 0);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Resolve the participant's profile (bank details + referral code).
    const profiles = await base44.entities.ParticipantProfile.filter({ created_by_id: user.id });
    const profile = profiles && profiles[0];
    if (!profile) return Response.json({ error: "Participant profile not found." }, { status: 404 });

    if (!profile.referral_code) {
      return Response.json({ error: "No referral code on your profile." }, { status: 400 });
    }

    const hasBank = !!(profile.bank_name && profile.account_number && profile.account_name);
    if (!hasBank) {
      return Response.json({ error: "Please add your bank details before requesting a referral earnings withdrawal." }, { status: 400 });
    }

    // Fresh, authoritative fetch of the participant's referrals and their
    // own withdrawal requests.
    const referrals = await base44.entities.Referral.filter({ referrer_code: profile.referral_code });
    const allReqs = await base44.entities.WithdrawalRequest.filter({ created_by_id: user.id });

    const activeReqAmt = (allReqs || [])
      .filter((r) => r.request_type === "referral" && ACTIVE_REQUEST_STATUSES.includes(r.status))
      .reduce((s, r) => s + (r.amount || 0), 0);

    const totalAccrued = (referrals || [])
      .filter((r) => referralBalance(r) > 0)
      .reduce((s, r) => s + referralBalance(r), 0);

    const available = Math.max(0, totalAccrued - activeReqAmt);
    if (available <= 0) {
      return Response.json({
        error: "Your accrued referral earnings are already covered by an active withdrawal request. New rewards will become available to withdraw as they accrue.",
      }, { status: 400 });
    }

    // Optional client-supplied amount (for partial withdrawals); clamped to
    // the true available balance. Defaults to the full available balance,
    // matching the "withdraw all available" behaviour of the dialog.
    const body = await req.json().catch(() => ({}));
    const requested = Number(body.amount);
    const amount = Number.isFinite(requested) && requested > 0
      ? Math.min(requested, available)
      : available;

    const created = await base44.entities.WithdrawalRequest.create({
      amount,
      request_type: "referral",
      status: "requested",
      bank_name: profile.bank_name,
      account_number: profile.account_number,
      account_name: profile.account_name,
    });

    return Response.json({ request: created, amount });
  } catch (error) {
    return Response.json({ error: error.message || "Failed to request referral withdrawal." }, { status: 500 });
  }
}