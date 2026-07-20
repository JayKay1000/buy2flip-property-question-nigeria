import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const payload = await req.json();
    const { payment_id, amount, commitment_id, company_bank_name, company_account_name, company_account_number, user_id } = payload;

    let participantName = 'A participant';
    if (user_id) {
      try {
        const user = await base44.asServiceRole.entities.User.get(user_id);
        if (user) participantName = user.full_name || user.email || participantName;
      } catch {}
    }

    const amountText = amount ? Number(amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }) : '';

    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    if (!admins || admins.length === 0) {
      return Response.json({ error: 'No admin users found to notify' }, { status: 404 });
    }

    const subject = `New Payment Submitted — ${participantName} (${amountText})`;
    const emailBody = [
      'Hello Admin,',
      '',
      `A participant has just submitted a payment that needs your confirmation.`,
      '',
      `Participant: ${participantName}`,
      `Payment ID: ${payment_id || '—'}`,
      `Amount: ${amountText}`,
      `Commitment ID: ${commitment_id || '—'}`,
      `Paid To Bank: ${company_bank_name || '—'}`,
      `Company Account Name: ${company_account_name || '—'}`,
      `Company Account Number: ${company_account_number || '—'}`,
      '',
      'Please log into the admin portal to review the payment evidence and confirm or reject it promptly.',
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