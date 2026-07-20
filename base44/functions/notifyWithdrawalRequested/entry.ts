import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const payload = await req.json();
    const { withdrawal_id, amount, bank_name, account_number, account_name, user_id } = payload;

    // Resolve participant name
    let participantName = 'A participant';
    if (user_id) {
      try {
        const user = await base44.asServiceRole.entities.User.get(user_id);
        if (user) participantName = user.full_name || user.email || participantName;
      } catch {}
    }
    if (!user_id) {
      try {
        const profiles = await base44.asServiceRole.entities.ParticipantProfile.filter({});
        if (profiles && profiles.length) participantName = profiles[profiles.length - 1].full_name || participantName;
      } catch {}
    }

    const amountText = amount ? Number(amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }) : '';

    // Email all admins
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    if (!admins || admins.length === 0) {
      return Response.json({ error: 'No admin users found to notify' }, { status: 404 });
    }

    const subject = `New Withdrawal Request — ${participantName}`;
    const emailBody = [
      'Hello Admin,',
      '',
      `A new withdrawal request has just been submitted by ${participantName} and requires your attention.`,
      '',
      `Request ID: ${withdrawal_id || '—'}`,
      `Amount: ${amountText}`,
      `Bank: ${bank_name || '—'}`,
      `Account Name: ${account_name || '—'}`,
      `Account Number: ${account_number || '—'}`,
      '',
      'Please log into the admin portal to review and process this withdrawal promptly.',
      '',
      '— Property Question Nigeria Limited'
    ].join('\n');

    const results = [];
    for (const admin of admins) {
      if (admin.email) {
        try {
          await base44.integrations.Core.SendEmail({ to: admin.email, subject, body: emailBody });
          results.push(admin.email);
        } catch (e) {
          results.push(`${admin.email} (failed: ${e.message})`);
        }
      }
    }

    return Response.json({ success: true, sent_to: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});