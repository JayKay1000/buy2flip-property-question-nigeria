import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// Reward fractions keyed by referral level — level 1 (direct) = 2%, level 2 (indirect) = 0.5%.
const REWARD_BY_LEVEL = { 1: 0.02, 2: 0.005 };

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const commitmentId = typeof body.commitmentId === "string" ? body.commitmentId : "";
    if (!commitmentId) return Response.json({ error: "Missing commitmentId." }, { status: 400 });

    // Load the commitment (service role) and resolve the owner's email.
    let commitment = null;
    try {
      commitment = await base44.asServiceRole.entities.Commitment.get(commitmentId);
    } catch {
      return Response.json({ updated: 0, reason: "Commitment not found." });
    }
    if (!commitment) return Response.json({ updated: 0, reason: "Commitment not found." });
    const ownerId = commitment.created_by_id;
    if (!ownerId) return Response.json({ updated: 0 });

    let email = "";
    try {
      const owner = await base44.asServiceRole.entities.User.get(ownerId);
      email = (owner?.email || "").toLowerCase();
    } catch {}
    if (!email && typeof body.ownerEmail === "string") email = body.ownerEmail.toLowerCase();
    if (!email) return Response.json({ updated: 0 });

    // Find every referral record pointing at this participant (direct + indirect).
    const allRefs = await base44.asServiceRole.entities.Referral.list();
    const refs = allRefs.filter((r) => (r.referred_email || "").toLowerCase() === email);
    if (refs.length === 0) return Response.json({ updated: 0 });

    // Reward basis = total of the participant's active + completed commitments.
    const userComms = await base44.asServiceRole.entities.Commitment.filter({ created_by_id: ownerId });
    const basis = userComms
      .filter((c) => c.status === "active" || c.status === "completed")
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    let updated = 0;
    for (const r of refs) {
      const pct = REWARD_BY_LEVEL[r.level];
      if (!pct) continue;
      const rewardAmount = Math.round(basis * pct);
      // Compute and store the reward amount, but keep status "pending" — a referral
      // reward is only marked "paid" once the participant manually requests a
      // withdrawal and an administrator manually processes it.
      await base44.asServiceRole.entities.Referral.update(r.id, {
        commitment_amount: basis,
        reward_amount: rewardAmount,
      });
      updated += 1;
    }

    return Response.json({ updated, basis });
  } catch (error) {
    return Response.json({ error: error.message || "Failed to apply referral rewards." }, { status: 500 });
  }
}