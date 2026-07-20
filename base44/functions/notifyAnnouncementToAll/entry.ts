import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const payload = await req.json();
    const { title, message } = payload;

    if (!title || !message) {
      return Response.json({ error: 'Missing title or message' }, { status: 400 });
    }

    let users = [];
    try {
      users = await base44.asServiceRole.entities.User.list('-created_date', 500);
    } catch (e) {
      return Response.json({ error: 'Could not list users' }, { status: 500 });
    }

    let sent = 0;
    const failures = [];
    for (const user of users) {
      if (!user.email) continue;
      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `New Announcement: ${title}`,
          body: [
            `Hello ${user.full_name || 'Participant'},`,
            '',
            title,
            '',
            message,
            '',
            '— Property Question Nigeria Limited'
          ].join('\n')
        });
        sent++;
      } catch (e) {
        failures.push({ email: user.email, error: e.message });
      }
    }

    return Response.json({ success: true, sent_count: sent, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});