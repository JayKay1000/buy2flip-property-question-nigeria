import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const payload = await req.json();
    const { commitment_id, plan_name, old_status, new_status, amount, user_id } = payload;

    if (!user_id || !new_status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await base44.asServiceRole.entities.User.get(user_id);
    if (!user || !user.email) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const statusLabels = {
      pending_payment: 'Pending Payment',
      active: 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };

    const oldLabel = statusLabels[old_status] || old_status || '—';
    const newLabel = statusLabels[new_status] || new_status;
    const amountText = amount ? Number(amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }) : '';

    const subject = `Commitment Status Update — ${plan_name || 'Your Plan'}`;
    const emailBody = [
      `Hello ${user.full_name || 'Participant'},`,
      '',
      `The status of your commitment${plan_name ? ` on the ${plan_name} plan` : ''}${amountText ? ` (${amountText})` : ''} has been updated.`,
      '',
      `Previous status: ${oldLabel}`,
      `New status: ${newLabel}`,
      '',
      'You can view the full details by logging into your Property Question Nigeria Limited dashboard.',
      '',
      '— Property Question Nigeria Limited'
    ].join('\n');

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject,
      body: emailBody
    });

    return Response.json({ success: true, sent_to: user.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});