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
    const now = new Date().toISOString();

    // --- Soft delete: locate the user by email and mark their profile ---
    // The account is deactivated (status → "deletion_requested") and a
    // timestamp is recorded. No data is hard-deleted; the admin reviews and
    // can permanently remove records later from the dashboard.
    let profileFound = false;
    let userName = "";
    try {
      const users = await base44.asServiceRole.entities.User.filter({ email });
      if (users && users.length > 0) {
        const user = users[0];
        userName = user.full_name || email;
        const profiles = await base44.asServiceRole.entities.ParticipantProfile.filter({
          created_by_id: user.id,
        });
        if (profiles && profiles.length > 0) {
          await base44.asServiceRole.entities.ParticipantProfile.update(
            profiles[0].id,
            {
              status: "deletion_requested",
              deletion_requested_at: now,
            }
          );
          profileFound = true;
        }
      }
    } catch {
      // User/profile lookup is best-effort — the SupportTicket below is the
      // fallback so the admin can locate the account manually if needed.
    }

    // --- Create a SupportTicket for admin tracking ---
    const profileNote = profileFound
      ? "Profile marked: Yes — status set to deletion_requested"
      : "Profile marked: No profile found for this email — admin must locate manually";
    const message = reason
      ? `Account deletion (soft delete) request from: ${email}\n\nReason: ${reason}\n\n${profileNote}`
      : `Account deletion (soft delete) request from: ${email}\n\n${profileNote}`;

    await base44.asServiceRole.entities.SupportTicket.create({
      subject: `Account Deletion Request — ${email}`,
      message,
      category: "account",
    });

    // --- Notify admin via email (non-blocking) ---
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "subscribe@buy2flip.net",
        subject: `Account Deletion Request — ${email}`,
        body: `A new account deletion request has been submitted.\n\nEmail: ${email}\nName: ${userName || "Unknown"}\nReason: ${reason || "Not provided"}\nProfile soft-deleted: ${profileFound ? "Yes" : "No (profile not found)"}\n\nPlease review in the admin dashboard under Support Tickets.`,
      });
    } catch {
      // Email delivery is best-effort; the SupportTicket is the source of truth
    }

    return Response.json({ success: true, profileFound });
  } catch (error) {
    return Response.json(
      { error: error.message || "Failed to submit request." },
      { status: 500 }
    );
  }
}