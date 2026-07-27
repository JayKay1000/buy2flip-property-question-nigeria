import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Network } from "lucide-react";
import { formatDate } from "@/lib/format";
import { downloadCsv } from "@/lib/exportCsv";

export default function ParticipantReferralNetwork({ participants, referrals }) {
  // Build lookups once.
  const { byCode, network } = useMemo(() => {
    const codeToName = {};
    participants.forEach((p) => {
      if (p.referral_code) codeToName[p.referral_code] = p.full_name;
    });

    const map = {};
    participants.forEach((p) => {
      map[p.referral_code] = { level1: [], level2: [] };
    });
    referrals.forEach((r) => {
      const bucket = map[r.referrer_code];
      if (!bucket) return;
      if (r.level === 1) bucket.level1.push(r);
      else if (r.level === 2) bucket.level2.push(r);
    });

    return { byCode: codeToName, network: map };
  }, [participants, referrals]);

  const rows = participants.map((p) => {
    const net = network[p.referral_code] || { level1: [], level2: [] };
    return {
      full_name: p.full_name,
      referral_code: p.referral_code,
      referred_by_code: p.referred_by_code || "",
      referred_by_name: p.referred_by_code ? byCode[p.referred_by_code] || "" : "",
      status: p.status,
      level1_count: net.level1.length,
      level1_names: net.level1.map((r) => r.referred_name).join("; "),
      level2_count: net.level2.length,
      level2_names: net.level2.map((r) => r.referred_name).join("; "),
      created_date: p.created_date,
    };
  });

  const columns = [
    { label: "Full Name", key: "full_name" },
    { label: "Referral Code", key: "referral_code" },
    { label: "Referred By Code", key: "referred_by_code" },
    { label: "Referred By Name", key: "referred_by_name" },
    { label: "Status", key: "status" },
    { label: "1st Line Count", key: "level1_count" },
    { label: "1st Line Referrals", key: "level1_names" },
    { label: "2nd Line Count", key: "level2_count" },
    { label: "2nd Line Referrals", key: "level2_names" },
    { label: "Created Date", key: "created_date" },
  ];

  const handleExport = () => {
    const exportRows = rows.map((r) => ({
      ...r,
      created_date: r.created_date ? formatDate(r.created_date) : "",
    }));
    downloadCsv("participants-referral-network.csv", columns, exportRows);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Network className="w-5 h-5 text-brand" /> Participant Referral Network
        </h2>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={rows.length === 0}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Every participant with their direct (1st-line) and indirect (2nd-line) downline. Click Export CSV to download the full list.
      </p>
      <div className="overflow-x-auto -mx-2 px-2 max-h-[28rem] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="py-2 pr-3 font-medium">Participant</th>
              <th className="py-2 pr-3 font-medium">Code</th>
              <th className="py-2 pr-3 font-medium">Referred By</th>
              <th className="py-2 pr-3 font-medium text-center">1st Line</th>
              <th className="py-2 pr-3 font-medium">1st-Line Names</th>
              <th className="py-2 pr-3 font-medium text-center">2nd Line</th>
              <th className="py-2 pr-3 font-medium">2nd-Line Names</th>
              <th className="py-2 pr-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border last:border-0 align-top">
                <td className="py-2 pr-3 font-medium text-foreground">{r.full_name}</td>
                <td className="py-2 pr-3 font-numeric text-xs text-muted-foreground">{r.referral_code}</td>
                <td className="py-2 pr-3 text-xs text-muted-foreground">
                  {r.referred_by_name ? `${r.referred_by_name}` : "—"}
                  {r.referred_by_code && <span className="block text-[10px]">{r.referred_by_code}</span>}
                </td>
                <td className="py-2 pr-3 text-center">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-medium">
                    {r.level1_count}
                  </span>
                </td>
                <td className="py-2 pr-3 text-xs text-muted-foreground max-w-[16rem]">{r.level1_names || "—"}</td>
                <td className="py-2 pr-3 text-center">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] px-2 py-0.5 rounded-full bg-gold/10 text-gold-dark text-xs font-medium">
                    {r.level2_count}
                  </span>
                </td>
                <td className="py-2 pr-3 text-xs text-muted-foreground max-w-[16rem]">{r.level2_names || "—"}</td>
                <td className="py-2 pr-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.status === "active" ? "bg-brand/10 text-brand" :
                    r.status === "suspended" ? "bg-destructive/10 text-destructive" :
                    "bg-gold/10 text-gold-dark"
                  }`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}