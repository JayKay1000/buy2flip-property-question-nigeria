import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Increments the download counter for a project document on the server side.
// Clients never get direct write access to ProjectDocument metadata — only the
// download_count field is mutated here, and only by authenticated users.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const documentId = typeof body.documentId === "string" ? body.documentId : "";
    if (!documentId) {
      return Response.json({ error: "documentId is required." }, { status: 400 });
    }

    // Read the current record (read-only SDK call, respects RLS read rules).
    const doc = await base44.asServiceRole.entities.ProjectDocument.get(documentId);
    if (!doc) {
      return Response.json({ error: "Document not found." }, { status: 404 });
    }

    // Only the download_count field is ever mutated — no client-supplied fields.
    const next = (Number(doc.download_count) || 0) + 1;
    await base44.asServiceRole.entities.ProjectDocument.update(documentId, {
      download_count: next,
    });

    return Response.json({ download_count: next });
  } catch (error) {
    return Response.json({ error: error.message || "Failed to increment download count." }, { status: 500 });
  }
});