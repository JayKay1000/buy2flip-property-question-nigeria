// Centralised "void" handling for commitment records.
//
// The Buy2Flip official launch reset marks all pre-launch TEST commitment
// records as status = "void" rather than deleting them, so an audit trail is
// preserved. Every live calculation (balances, totals, dashboard stats) already
// filters by an explicit live status (active / pending_payment / completed),
// so void records never contribute to those. This helper is for the few places
// that display commitments WITHOUT a status filter (recent-activity lists),
// so void records stay hidden there too.

export const VOID_STATUS = "void";

export const isVoidCommitment = (c) => c?.status === VOID_STATUS;

// Returns only non-void commitments — safe to use for any list/summary display.
export const liveCommitments = (commitments) =>
  (commitments || []).filter((c) => c?.status !== VOID_STATUS);