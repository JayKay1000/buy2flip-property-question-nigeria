// Centralised referral-earnings maths shared by the withdrawal card, the
// withdrawal dialog and the referral analytics page.
//
// Model: each Referral record holds a running total `reward_amount` that is
// recomputed every time the referred participant's commitments change (active
// or completed), plus a cumulative `withdrawn_amount` tracking how much of
// that reward has already been paid out via an admin-processed withdrawal.
//
//   available per referral = reward_amount − withdrawn_amount
//
// This keeps new rewards withdrawable even after an earlier payout: when the
// downline makes a new commitment, `reward_amount` grows while
// `withdrawn_amount` stays at the previously-paid snapshot, so the difference
// (the new incremental reward) re-opens the balance and the Withdraw button
// becomes active again.
//
// Across all referrals, the withdrawable balance also subtracts amounts
// already locked inside active (not-yet-resolved) referral withdrawal
// requests, so a participant cannot re-request funds that are already pending
// payout:
//
//   available = (sum of per-referral balances) − (active request amounts)

const ACTIVE_REQUEST_STATUSES = ["requested", "processing"];

// Per-referral unwithdrawn balance — the core accrual primitive.
export const referralBalance = (r) =>
  (r?.reward_amount || 0) - (r?.withdrawn_amount || 0);

// "Accrued" = there is a positive unwithdrawn balance (reward computed, not
// fully paid out). Rewards awaiting the referred commitment's verification
// (reward_amount == 0) have a zero balance and are not yet withdrawable.
export const isAccrued = (r) => referralBalance(r) > 0;

export const accruedReferrals = (referrals) =>
  (referrals || []).filter(isAccrued);

export const totalAccrued = (referrals) =>
  accruedReferrals(referrals).reduce((sum, r) => sum + referralBalance(r), 0);

export const accruedByLevel = (referrals, level) =>
  accruedReferrals(referrals)
    .filter((r) => r.level === level)
    .reduce((sum, r) => sum + referralBalance(r), 0);

export const alreadyRequestedAmount = (requests) =>
  (requests || [])
    .filter(
      (r) =>
        r.request_type === "referral" &&
        ACTIVE_REQUEST_STATUSES.includes(r.status)
    )
    .reduce((sum, r) => sum + (r.amount || 0), 0);

export const availableToWithdraw = (referrals, requests) =>
  Math.max(0, totalAccrued(referrals) - alreadyRequestedAmount(requests));

// Total cumulative reward ever earned across all referrals (gross, before any
// payouts). This is the "earned" side of the earned-vs-withdrawn breakdown.
export const totalEarnedRewards = (referrals) =>
  (referrals || []).reduce((sum, r) => sum + (r?.reward_amount || 0), 0);

// Total cumulative amount already paid out to the participant via admin-
// processed referral withdrawals. This is the "withdrawn" side.
export const totalWithdrawnAmount = (referrals) =>
  (referrals || []).reduce((sum, r) => sum + (r?.withdrawn_amount || 0), 0);

// Human-readable per-referral state for badges: "available" when there is an
// unwithdrawn balance (includes referrals that were paid out before and have
// since accrued new rewards), "paid" when fully withdrawn, "pending" while the
// referred commitment is still awaiting verification (reward_amount == 0).
export const referralStatus = (r) => {
  if (referralBalance(r) > 0) return "available";
  if ((r?.reward_amount || 0) > 0) return "paid";
  return "pending";
};