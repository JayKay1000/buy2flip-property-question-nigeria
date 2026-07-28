import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// Runs 3 days after re-engagement emails were sent — checks which notified
// users have logged back in since the emails went out.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const userIds: string[] = Array.isArray(payload.user_ids) ? payload.user_ids : [];
    const sentAt = typeof payload.sent_at === "string" ? payload.sent_at : "";

    if (userIds.length === 0) {
      return Response.json({ success: true, checked_count: 0, re_engaged: [], still_inactive: [] });
    }

    const sentTs = sentAt ? new Date(sentAt).getTime() : 0;

    const loginActivity = await base44.asServiceRole.entities.LoginActivity.list(
      "-created_date",
      5000
    );

    const notifiedSet = new Set(userIds);
    const reEngagedSet = new Set<string>();

    loginActivity.forEach((a) => {
      const uid = a.created_by_id;
      if (!uid || !notifiedSet.has(uid)) return;
      const ts = new Date(a.created_date).getTime();
      if (ts >= sentTs) {
        reEngagedSet.add(uid);
      }
    });

    const reEngaged = Array.from(reEngagedSet);
    const stillInactive = userIds.filter((id) => !reEngagedSet.has(id));

    return Response.json({
      success: true,
      checked_count: userIds.length,
      re_engaged: reEngaged,
      still_inactive: stillInactive,
      re_engaged_count: reEngaged.length,
      still_inactive_count: stillInactive.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});