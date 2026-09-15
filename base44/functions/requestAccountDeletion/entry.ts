import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const email = (body?.email || "").trim().toLowerCase();
    const reason = (body?.reason || "").trim();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const base44 = createClientFromRequest(req);

    // Create a SupportTicket as service role (no user context needed —
    // this endpoint is callable without authentication).
    const message = reason
      ? `Account deletion request from: ${email}\n\nReason: ${reason}`
      : `Account deletion request from: ${email}`;

    await base44.asServiceRole.entities.SupportTicket.create({
      subject: `Account Deletion Request — ${email}`,
      message,
      category: "account",
    });

    // Notify admin via email (non-blocking — ticket is already saved)
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "subscribe@buy2flip.net",
        subject: `Account Deletion Request — ${email}`,
        body: `A new account deletion request has been submitted.\n\nEmail: ${email}\nReason: ${reason || "Not provided"}\n\nPlease review this request in the admin dashboard under Support Tickets.`,
      });
    } catch {
      // Email delivery is best-effort; the SupportTicket is the source of truth
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error.message || "Failed to submit request." },
      { status: 500 }
    );
  }
}