// Centralised referral-earnings maths shared by the withdrawal card, the
// withdrawal dialog and the referral analytics page.
//
// Rule (per product requirement): a participant may only withdraw referral
// rewards they have NOT already requested. When a withdrawal request is
// created its amount is "locked" until the request is resolved (paid out or
// rejected). The withdrawable balance is therefore:
//
//   available = (accrued so far) − (sum of active referral withdrawal requests)
//
// "Accrued" = a reward has been computed (reward_amount > 0) and has not yet
// been paid out (withdrawn === false). Rewards awaiting the referred
// participant's commitment verification (reward_amount == 0) are not yet
// withdrawable. Once an admin pays a request the underlying referral records
// are marked withdrawn, which drops them out of "accrued" — so the subtraction
// only needs to cover the window between request creation and payout.
//
// Recurring: every new request subtracts from the running balance, and any
// rewards that accrue after a request become newly withdrawable.

const ACTIVE_REQUEST_STATUSES = ["requested", "processing"];

export const isAccrued = (r) => (r.reward_amount || 0) > 0 && !r.withdrawn;

export const accruedReferrals = (referrals) =>
  (referrals || []).filter(isAccrued);

export const totalAccrued = (referrals) =>
  accruedReferrals(referrals).reduce((sum, r) => sum + (r.reward_amount || 0), 0);

export const accruedByLevel = (referrals, level) =>
  accruedReferrals(referrals)
    .filter((r) => r.level === level)
    .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

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