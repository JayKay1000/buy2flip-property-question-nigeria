import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// Runs from a scheduled workflow (no user session) — operates as service role.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Only admins (or scheduled system workflows, which run with an admin
    // context) may trigger this bulk email send — blocks unauthenticated calls.
    const caller = await base44.auth.me();
    if (!caller || caller.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const [users, loginActivity, documents] = await Promise.all([
      base44.asServiceRole.entities.User.list("-created_date", 5000),
      base44.asServiceRole.entities.LoginActivity.list("-created_date", 5000),
      base44.asServiceRole.entities.ProjectDocument.list("-created_date", 5000),
    ]);

    // Latest login activity per user (created_by_id -> most recent created_date)
    const lastActiveByUser = Object.create(null);
    loginActivity.forEach((a) => {
      const uid = a.created_by_id;
      if (!uid) return;
      const ts = new Date(a.created_date).getTime();
      if (lastActiveByUser[uid] === undefined || ts > lastActiveByUser[uid]) {
        lastActiveByUser[uid] = ts;
      }
    });

    // Re-engage participants (non-admin users) with no login activity in 30 days.
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const inactiveUsers = users.filter((u) => {
      if (u.role === "admin") return false;
      if (!u.email) return false;
      const last = lastActiveByUser[u.id];
      return last === undefined || last < cutoff;
    });

    // Latest active project documents to showcase.
    const latestDocs = documents
      .filter((d) => d.is_active !== false)
      .slice(0, 5)
      .map((d) => ({
        title: d.title || "Untitled document",
        project: d.project_name || "—",
        type: d.document_type || "other",
        description: d.description || "",
      }));

    const docList = latestDocs.length
      ? latestDocs
          .map(
            (d) =>
              `• ${d.title} (${d.type.replace("_", " ")}) — ${d.project}${
                d.description ? `\n  ${d.description}` : ""
              }`
          )
          .join("\n")
      : "New documents are being added regularly — log in to explore the latest project materials.";

    const notifiedUserIds: string[] = [];
    const failures: any[] = [];
    const sentAt = new Date().toISOString();

    for (const user of inactiveUsers) {
      const firstName = (user.full_name || "there").split(" ")[0];
      const body = [
        `Hello ${firstName},`,
        "",
        "We noticed you haven't logged into Property Question Nigeria Limited in a while, and we'd love to have you back.",
        "",
        "Here are some of the latest project documents now available on the platform:",
        "",
        docList,
        "",
        "Log in to your dashboard to review full document details, track your commitments, and stay up to date with our Land Banking programme.",
        "",
        "Warm regards,",
        "Property Question Nigeria Limited",
      ].join("\n");

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: "We miss you — see what's new on Property Question Nigeria Limited",
          body,
        });
        notifiedUserIds.push(user.id);
      } catch (e) {
        failures.push({ error: e.message });
      }
    }

    return Response.json({
      success: true,
      inactive_count: inactiveUsers.length,
      notified_count: notifiedUserIds.length,
      notified_user_ids: notifiedUserIds,
      sent_at: sentAt,
      documents_showcased: latestDocs.length,
      failures,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});