import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Buy2Flip Official Launch Data Reset — one-time, admin-only operation.
// Marks all pre-launch TEST commitments as status="void" (preserving an audit
// trail), deletes test referral/downline relationships, clears the parent
// referrer link on participant profiles (each user's own referral_code is kept),
// and removes test payment evidence + withdrawal requests. User accounts,
// profiles, and auth records are never deleted. Records a LaunchResetAudit
// entry with a compact backup snapshot and full counts.

const CONFIRM_PHRASE = "RESET BUY2FLIP LAUNCH";
const BACKUP_CAP = 200;

function cap(arr, map) {
  return {
    total: arr.length,
    truncated: arr.length > BACKUP_CAP,
    records: arr.slice(0, BACKUP_CAP).map(map),
  };
}

function buildSnapshot(commitments, referrals, payments, withdrawals) {
  return JSON.stringify({
    generated_at: new Date().toISOString(),
    commitments: cap(commitments, (c) => ({
      id: c.id, plan: c.plan_name, amount: c.amount, status: c.status,
      user: c.created_by_id, created: c.created_date,
    })),
    referrals: cap(referrals, (r) => ({
      id: r.id, referrer_code: r.referrer_code, referred_email: r.referred_email,
      level: r.level, reward: r.reward_amount, status: r.status,
    })),
    payments: cap(payments, (p) => ({
      id: p.id, amount: p.amount, status: p.status, commitment: p.commitment_id,
    })),
    withdrawals: cap(withdrawals, (w) => ({
      id: w.id, amount: w.amount, type: w.request_type, status: w.status,
    })),
  });
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: administrator access required.' }, { status: 403 });
    }

    let body = {};
    try { body = await req.json(); } catch { body = {}; }
    const confirm = typeof body.confirm === 'string' ? body.confirm.trim() : '';
    const force = body.force === true;

    if (confirm !== CONFIRM_PHRASE) {
      return Response.json({
        error: 'Confirmation phrase does not match. Type exactly: RESET BUY2FLIP LAUNCH',
      }, { status: 400 });
    }

    const svc = base44.asServiceRole;

    // Prevent accidental repeated execution once a launch reset has completed.
    const prior = await svc.entities.LaunchResetAudit.filter({ status: 'completed' }, '-created_date');
    if (prior.length > 0 && !force) {
      return Response.json({
        error: 'Launch reset has already been completed. Re-running requires explicit admin approval (enable "Allow re-run").',
        already_completed: true,
        last_run: prior[0],
      }, { status: 409 });
    }

    // Snapshot the affected test records before mutation.
    const [commitments, referrals, profiles, withdrawals, payments] = await Promise.all([
      svc.entities.Commitment.filter({}),
      svc.entities.Referral.filter({}),
      svc.entities.ParticipantProfile.filter({}),
      svc.entities.WithdrawalRequest.filter({}),
      svc.entities.Payment.filter({}),
    ]);

    const downlinesAffected = profiles.filter((p) => p.referred_by_code).length;
    const backupSnapshot = buildSnapshot(commitments, referrals, payments, withdrawals);

    // Execute reset. If any mutation fails we still record a failed audit so the
    // partial state is visible to admins.
    let status = 'completed';
    let failureNote = '';
    try {
      // 1. Void all test commitments (excluded from every live calculation).
      await svc.entities.Commitment.updateMany(
        { status: { $ne: 'void' } },
        { $set: { status: 'void' } }
      );
      // 2. Remove all test referral / downline relationships.
      await svc.entities.Referral.deleteMany({});
      // 3. Clear the parent/referrer link on profiles (keep own referral_code).
      await svc.entities.ParticipantProfile.updateMany(
        { referred_by_code: { $exists: true } },
        { $unset: { referred_by_code: '' } }
      );
      // 4. Remove test withdrawal requests.
      await svc.entities.WithdrawalRequest.deleteMany({});
      // 5. Remove test payment evidence.
      await svc.entities.Payment.deleteMany({});
    } catch (mutationError) {
      status = 'failed';
      failureNote = mutationError?.message || String(mutationError);
    }

    // Post-reset verification.
    const [vCommitments, vReferrals, vProfiles] = await Promise.all([
      svc.entities.Commitment.filter({ status: 'active' }),
      svc.entities.Referral.filter({}),
      svc.entities.ParticipantProfile.filter({}),
    ]);
    const verification = {
      active_commitments_remaining: vCommitments.length,
      referrals_remaining: vReferrals.length,
      profiles_with_referrer_remaining: vProfiles.filter((p) => p.referred_by_code).length,
      clean: vCommitments.length === 0 && vReferrals.length === 0,
    };

    // Record the audit entry.
    await svc.entities.LaunchResetAudit.create({
      reset_type: 'buy2flip_launch',
      executed_by: user.id,
      executed_by_name: user.full_name || user.email || 'admin',
      executed_at: new Date().toISOString(),
      users_affected: profiles.length,
      commitments_affected: commitments.length,
      referrals_affected: referrals.length,
      downlines_affected: downlinesAffected,
      payments_affected: payments.length,
      withdrawals_affected: withdrawals.length,
      status,
      notes: failureNote,
      backup_snapshot: backupSnapshot,
    });

    if (status === 'failed') {
      return Response.json({
        error: 'Reset failed during mutation: ' + failureNote,
        verification,
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'Buy2Flip launch reset completed successfully. All test commitments, balances, referral and downline data have been reset to a clean starting state. User accounts and profiles were not deleted.',
      summary: {
        users_affected: profiles.length,
        commitments_affected: commitments.length,
        referrals_affected: referrals.length,
        downlines_affected: downlinesAffected,
        payments_affected: payments.length,
        withdrawals_affected: withdrawals.length,
      },
      verification,
    });
  } catch (error) {
    return Response.json({
      error: error?.message || 'Unexpected error during launch reset.',
    }, { status: 500 });
  }
}