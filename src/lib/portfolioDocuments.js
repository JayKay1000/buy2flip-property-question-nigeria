import { jsPDF } from "jspdf";
import { formatNaira, formatDate } from "./format";

const BRAND = [11, 61, 46];
const GOLD = [201, 162, 39];
const GREY = [120, 120, 120];

function header(doc, title) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PROPERTY QUESTION NIGERIA LIMITED", 14, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(201, 162, 39);
  doc.text("Land Banking Platform", 14, 19);
  doc.setTextColor(...BRAND);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, pageW / 2, 42, { align: "center" });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(pageW / 2 - 35, 46, pageW / 2 + 35, 46);
}

function footer(doc) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(14, pageH - 16, pageW - 14, pageH - 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GREY);
  doc.text("Property Question Nigeria Limited  ·  Suite 43, Ogba Shopping Arcade, Ijaiye Road, Ogba, Lagos", pageW / 2, pageH - 11, { align: "center" });
  doc.text(`Generated on ${formatDate(new Date().toISOString())}  ·  Ref: PQLB-${Date.now().toString(36).toUpperCase()}`, pageW / 2, pageH - 7, { align: "center" });
}

function newDoc(title) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  header(doc, title);
  return doc;
}

function save(doc, name) {
  doc.save(name);
}

export const generateAcknowledgementLetter = (profile, commitments) => {
  const doc = newDoc("Acknowledgement Letter");
  const name = profile?.full_name || "Participant";
  const active = commitments.filter((c) => c.status === "active" || c.status === "pending_payment");
  let y = 60;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text(formatDate(new Date().toISOString()), 14, y); y += 10;
  doc.text("Dear Participant,", 14, y); y += 10;
  const body = `This letter serves to acknowledge that ${name} has been duly enrolled as a participant on the Property Question Nigeria Limited Land Banking Platform. The participant's commitment(s) have been received and are being deployed in accordance with the terms of the selected commitment plan(s).`;
  doc.text(doc.splitTextToSize(body, 180), 14, y); y += 24;
  if (active.length) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...BRAND);
    doc.text("Active Commitment Summary", 14, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(40, 40, 40);
    active.forEach((c) => {
      doc.text(`- ${c.plan_name} Plan: ${formatNaira(c.amount)} over ${c.plan_duration_months} months`, 16, y);
      y += 6;
    });
    y += 4;
  }
  doc.text(doc.splitTextToSize("We thank you for your trust in Property Question Nigeria Limited and look forward to a rewarding partnership.", 180), 14, y); y += 18;
  doc.text("Yours faithfully,", 14, y); y += 14;
  doc.setFont("helvetica", "bold"); doc.setTextColor(...BRAND);
  doc.text("Property Question Nigeria Limited", 14, y);
  footer(doc);
  save(doc, `Acknowledgement_Letter.pdf`);
};

export const generatePaymentConfirmation = (profile, payments, commitments) => {
  const doc = newDoc("Payment Confirmation");
  let y = 60;
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(40, 40, 40);
  const name = profile?.full_name || "Participant";
  doc.text(`Participant: ${name}`, 14, y); y += 6;
  doc.text(`Date Issued: ${formatDate(new Date().toISOString())}`, 14, y); y += 12;
  const confirmed = payments.filter((p) => p.status === "confirmed");
  if (!confirmed.length) {
    doc.text("No confirmed payments on record.", 14, y);
  } else {
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...BRAND);
    doc.text("Confirmed Payments", 14, y); y += 6;
    doc.setFillColor(248, 248, 245); doc.rect(14, y, 182, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...GREY);
    doc.text("Date", 16, y + 5); doc.text("Amount", 70, y + 5); doc.text("Plan", 120, y + 5); doc.text("Status", 170, y + 5);
    y += 8;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(40, 40, 40);
    confirmed.forEach((p) => {
      const comm = commitments.find((c) => c.id === p.commitment_id);
      doc.text(formatDate(p.confirmed_at || p.created_date), 16, y + 5);
      doc.text(formatNaira(p.amount), 70, y + 5);
      doc.text(comm ? `${comm.plan_name}` : "—", 120, y + 5);
      doc.text("Confirmed", 170, y + 5);
      y += 8;
    });
    y += 8;
  }
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(40, 40, 40);
  doc.text(doc.splitTextToSize("This confirms that the payments listed above have been received and verified by Property Question Nigeria Limited.", 180), 14, y);
  footer(doc);
  save(doc, `Payment_Confirmation.pdf`);
};

export const generateAccountStatement = (profile, commitments, payments) => {
  const doc = newDoc("Account Statement");
  let y = 60;
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(40, 40, 40);
  const name = profile?.full_name || "Participant";
  doc.text(`Participant: ${name}`, 14, y); y += 6;
  doc.text(`Statement Period: All Time`, 14, y); y += 12;
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...BRAND);
  doc.text("Commitment History", 14, y); y += 6;
  doc.setFillColor(248, 248, 245); doc.rect(14, y, 182, 8, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...GREY);
  doc.text("Plan", 16, y + 5); doc.text("Amount", 50, y + 5); doc.text("Exp. Return", 90, y + 5); doc.text("Maturity", 135, y + 5); doc.text("Status", 175, y + 5);
  y += 8;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(40, 40, 40);
  commitments.forEach((c) => {
    doc.text(c.plan_name, 16, y + 5);
    doc.text(formatNaira(c.amount), 50, y + 5);
    doc.text(formatNaira(c.expected_return), 90, y + 5);
    doc.text(formatDate(c.maturity_date), 135, y + 5);
    doc.text(c.status?.replace(/_/g, " "), 175, y + 5);
    y += 8;
  });
  y += 6;
  const totalCommitted = commitments.reduce((s, c) => s + (c.amount || 0), 0);
  const totalReturn = commitments.reduce((s, c) => s + (c.expected_return || 0), 0);
  const totalPaid = payments.filter((p) => p.status === "confirmed").reduce((s, p) => s + (p.amount || 0), 0);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...BRAND);
  doc.text(`Total Committed: ${formatNaira(totalCommitted)}`, 14, y); y += 6;
  doc.text(`Total Expected Return: ${formatNaira(totalReturn)}`, 14, y); y += 6;
  doc.text(`Total Confirmed Payments: ${formatNaira(totalPaid)}`, 14, y);
  footer(doc);
  save(doc, `Account_Statement.pdf`);
};

export const generateCompletionCertificate = (profile, commitment) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(255, 255, 255); doc.rect(0, 0, pageW, pageH, "F");
  doc.setDrawColor(...BRAND); doc.setLineWidth(2); doc.rect(8, 8, pageW - 16, pageH - 16);
  doc.setLineWidth(0.5); doc.setDrawColor(...GOLD); doc.rect(12, 12, pageW - 24, pageH - 24);
  doc.setTextColor(...BRAND); doc.setFont("helvetica", "bold"); doc.setFontSize(14);
  doc.text("PROPERTY QUESTION NIGERIA LIMITED", pageW / 2, 25, { align: "center" });
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...GREY);
  doc.text("Land Banking Platform", pageW / 2, 31, { align: "center" });
  doc.setDrawColor(...GOLD); doc.setLineWidth(1); doc.line(pageW / 2 - 40, 35, pageW / 2 + 40, 35);
  doc.setTextColor(...BRAND); doc.setFont("helvetica", "bold"); doc.setFontSize(26);
  doc.text("Completion Certificate", pageW / 2, 50, { align: "center" });
  doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(...GREY);
  doc.text("This is to certify that", pageW / 2, 62, { align: "center" });
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(...GOLD);
  doc.text(profile?.full_name || "Participant", pageW / 2, 73, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(...GREY);
  doc.text(`has successfully completed the ${commitment.plan_name} Plan commitment`, pageW / 2, 82, { align: "center" });
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...BRAND);
  doc.text(`Total Value Realised: ${formatNaira(commitment.total_expected_value)}`, pageW / 2, 95, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GREY);
  doc.text(`Maturity Date: ${formatDate(commitment.maturity_date)}`, pageW / 2, 105, { align: "center" });
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
  doc.line(pageW / 2 - 40, 118, pageW / 2 + 40, 118);
  doc.setFontSize(8); doc.setTextColor(...GREY);
  doc.text("Issued by Property Question Nigeria Limited", pageW / 2, 126, { align: "center" });
  doc.text(`Certificate ID: CMP-${Date.now().toString(36).toUpperCase()}`, pageW / 2, 131, { align: "center" });
  save(doc, `Completion_Certificate_${commitment.plan_name}.pdf`);
};

export const generateReferralReport = (profile, referrals) => {
  const doc = newDoc("Referral Report");
  let y = 60;
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(40, 40, 40);
  doc.text(`Participant: ${profile?.full_name || "Participant"}`, 14, y); y += 6;
  doc.text(`Referral Code: ${profile?.referral_code || "—"}`, 14, y); y += 6;
  doc.text(`Date Issued: ${formatDate(new Date().toISOString())}`, 14, y); y += 12;
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...BRAND);
  doc.text("Referral Activity", 14, y); y += 6;
  if (!referrals.length) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(40, 40, 40);
    doc.text("No referrals on record.", 14, y);
  } else {
    doc.setFillColor(248, 248, 245); doc.rect(14, y, 182, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...GREY);
    doc.text("Name", 16, y + 5); doc.text("Level", 90, y + 5); doc.text("Commitment", 110, y + 5); doc.text("Reward", 150, y + 5); doc.text("Status", 180, y + 5);
    y += 8;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(40, 40, 40);
    referrals.forEach((r) => {
      doc.text(r.referred_name || "—", 16, y + 5);
      doc.text(`L${r.level}`, 90, y + 5);
      doc.text(formatNaira(r.commitment_amount || 0), 110, y + 5);
      doc.text(formatNaira(r.reward_amount || 0), 150, y + 5);
      doc.text(r.status || "—", 180, y + 5);
      y += 8;
    });
    y += 6;
    const totalEarnings = referrals.reduce((s, r) => s + (r.reward_amount || 0), 0);
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...BRAND);
    doc.text(`Total Referral Earnings: ${formatNaira(totalEarnings)}`, 14, y);
  }
  footer(doc);
  save(doc, `Referral_Report.pdf`);
};