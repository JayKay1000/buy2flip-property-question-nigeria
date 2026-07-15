import { jsPDF } from "jspdf";
import { formatNaira, formatDate } from "./format";
import { addLogo } from "./docLogo";

export const generateCommitmentCertificate = async (commitment, participantName) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, "F");

  // Border frame
  doc.setDrawColor(11, 61, 46);
  doc.setLineWidth(2);
  doc.rect(8, 8, pageW - 16, pageH - 16);
  doc.setLineWidth(0.5);
  doc.setDrawColor(201, 162, 39);
  doc.rect(12, 12, pageW - 24, pageH - 24);

  // Logo + Header
  await addLogo(doc, { align: "center", y: 13, w: 30, h: 11 });
  doc.setTextColor(11, 61, 46);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PROPERTY QUESTION NIGERIA LIMITED", pageW / 2, 28, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Land Banking Platform", pageW / 2, 34, { align: "center" });

  // Gold divider
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(1);
  doc.line(pageW / 2 - 40, 38, pageW / 2 + 40, 38);

  // Title
  doc.setTextColor(11, 61, 46);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Commitment Certificate", pageW / 2, 50, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("This is to certify that", pageW / 2, 62, { align: "center" });

  // Participant name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(201, 162, 39);
  doc.text(participantName || "Participant", pageW / 2, 73, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text("has made a financial commitment under the", pageW / 2, 82, { align: "center" });

  // Plan name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(11, 61, 46);
  doc.text(`${commitment.plan_name} Plan`, pageW / 2, 93, { align: "center" });

  // Details box
  const boxY = 105;
  const boxH = 45;
  doc.setFillColor(248, 248, 245);
  doc.rect(30, boxY, pageW - 60, boxH, "F");
  doc.setDrawColor(220, 220, 215);
  doc.setLineWidth(0.3);
  doc.rect(30, boxY, pageW - 60, boxH);

  const colW = (pageW - 60) / 2;
  const labels = [
    { label: "Commitment Amount", value: formatNaira(commitment.amount) },
    { label: "Expected Return", value: formatNaira(commitment.expected_return) },
    { label: "Total Expected Value", value: formatNaira(commitment.total_expected_value) },
    { label: "Start Date", value: formatDate(commitment.start_date) },
    { label: "Maturity Date", value: formatDate(commitment.maturity_date) },
    { label: "Status", value: commitment.status?.replace(/_/g, " ").toUpperCase() },
  ];

  labels.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 35 + col * colW;
    const y = boxY + 12 + row * 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(item.label, x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(11, 61, 46);
    doc.text(item.value, x, y + 5);
  });

  // Footer
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(0.5);
  doc.line(pageW / 2 - 40, boxY + boxH + 15, pageW / 2 + 40, boxY + boxH + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("This certificate is issued by Property Question Nigeria Limited", pageW / 2, boxY + boxH + 23, { align: "center" });
  doc.text(`Certificate ID: LB-${Date.now().toString(36).toUpperCase()}`, pageW / 2, boxY + boxH + 28, { align: "center" });

  doc.save(`Commitment_Certificate_${commitment.plan_name}.pdf`);
};