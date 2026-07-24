// Builds and downloads CSV files for administrative record-keeping.

function escapeCell(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadCsv(filename, columns, rows) {
  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(row[c.key])).join(","))
    .join("\n");
  const csv = `${header}\n${body}`;
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const participantColumns = [
  { label: "Full Name", key: "full_name" },
  { label: "Phone Number", key: "phone_number" },
  { label: "Referral Code", key: "referral_code" },
  { label: "Referred By Code", key: "referred_by_code" },
  { label: "Status", key: "status" },
  { label: "Bank Name", key: "bank_name" },
  { label: "Account Number", key: "account_number" },
  { label: "Account Name", key: "account_name" },
  { label: "Relationship Officer", key: "relationship_officer" },
  { label: "Created Date", key: "created_date" },
];

export const commitmentColumns = [
  { label: "Plan Name", key: "plan_name" },
  { label: "Amount", key: "amount" },
  { label: "Expected Return", key: "expected_return" },
  { label: "Total Expected Value", key: "total_expected_value" },
  { label: "Return Rate", key: "plan_return_rate" },
  { label: "Duration (Months)", key: "plan_duration_months" },
  { label: "Start Date", key: "start_date" },
  { label: "Maturity Date", key: "maturity_date" },
  { label: "Status", key: "status" },
  { label: "Created By ID", key: "created_by_id" },
  { label: "Created Date", key: "created_date" },
];