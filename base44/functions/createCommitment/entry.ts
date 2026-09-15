import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Authoritative plan definitions — the single source of truth for return rates
// and durations. The client is never trusted to supply these values.
const PLAN_DEFS = {
  silver:   { name: "Silver",   durationMonths: 6,  returnRate: 0.12, minimum: 1000000 },
  gold:     { name: "Gold",     durationMonths: 12, returnRate: 0.30, minimum: 1000000 },
  platinum: { name: "Platinum", durationMonths: 18, returnRate: 0.50, minimum: 1000000 },
  diamond:  { name: "Diamond",  durationMonths: 24, returnRate: 0.65, minimum: 1000000 },
};

const COMPANY_BANK = {
  bankName: "Zenith Bank",
  accountName: "Property Question Nigeria",
  accountNumber: "1213875230",
};

const MILLION = 1000000;

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const planName = typeof body.planName === "string" ? body.planName.toLowerCase() : "";
    const amount = Number(body.amount);
    const evidenceUrl = typeof body.evidenceUrl === "string" ? body.evidenceUrl : "";

    const plan = PLAN_DEFS[planName];
    if (!plan) {
      return Response.json({ error: "Invalid commitment plan." }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount < plan.minimum || amount % MILLION !== 0) {
      return Response.json({ error: "Amount must be a multiple of ₦1,000,000 and at least ₦1,000,000." }, { status: 400 });
    }
    if (!evidenceUrl) {
      return Response.json({ error: "Payment evidence is required." }, { status: 400 });
    }

    // All financial values are computed server-side from authoritative plan data.
    const expectedReturn = Math.round(amount * plan.returnRate);
    const totalValue = amount + expectedReturn;
    const startDate = new Date().toISOString().split("T")[0];
    const maturityDate = addMonths(new Date(), plan.durationMonths);

    const commitment = await base44.entities.Commitment.create({
      plan_name: plan.name,
      plan_duration_months: plan.durationMonths,
      plan_return_rate: plan.returnRate,
      amount,
      expected_return: expectedReturn,
      total_expected_value: totalValue,
      start_date: startDate,
      maturity_date: maturityDate,
      status: "pending_payment",
    });

    const payment = await base44.entities.Payment.create({
      amount,
      status: "pending",
      evidence_url: evidenceUrl,
      commitment_id: commitment.id,
      company_bank_name: COMPANY_BANK.bankName,
      company_account_name: COMPANY_BANK.accountName,
      company_account_number: COMPANY_BANK.accountNumber,
    });

    return Response.json({ commitment, payment });
  } catch (error) {
    return Response.json({ error: error.message || "Failed to create commitment." }, { status: 500 });
  }
});