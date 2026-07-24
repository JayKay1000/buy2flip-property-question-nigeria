import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { formatNaira } from "@/lib/format";
import { isSafeUrl } from "@/lib/urlSafe";
import {
  FileText, Download, MapPin, Info, Shield, BookOpen,
  Building2, ChevronDown, ChevronUp, Clock, Tag
} from "lucide-react";
import PullToRefresh from "@/components/PullToRefresh";
import DocumentCentreBanner from "@/components/DocumentCentreBanner";

const BROCHURE_URL = "https://media.base44.com/files/public/6a4d7c087d41148d5f9d3c8c/f478a8cea_FINALCOLONY_compressed.pdf";

const LAND_RATIO = 1; // 1 sq meter per ₦1,000,000

function calcLandAllocation(amountNaira) {
  return Math.floor(amountNaira / 1_000_000) * LAND_RATIO;
}

const docTypeLabel = {
  brochure: "Brochure",
  survey_plan: "Survey Plan",
  title_document: "Title Document",
  other: "Document",
};

const docTypeIcon = {
  brochure: BookOpen,
  survey_plan: MapPin,
  title_document: Shield,
  other: FileText,
};

export default function DocumentCentre() {
  const [profile, setProfile] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      const [profiles, comms, docs] = await Promise.all([
        base44.entities.ParticipantProfile.filter({ created_by_id: me.id }),
        base44.entities.Commitment.filter({ created_by_id: me.id, status: "active" }, "-created_date"),
        base44.entities.ProjectDocument.filter({ is_active: true }, "-created_date"),
      ]);
      setProfile(profiles[0] || null);
      setCommitments(comms);
      setDocuments(docs);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    if (!isSafeUrl(doc.file_url)) return;
    setDownloading(doc.id);
    try {
      // Increment download count
      await base44.entities.ProjectDocument.update(doc.id, {
        download_count: (doc.download_count || 0) + 1,
      });
      // Open file in new tab
      window.open(doc.file_url, "_blank", "noopener,noreferrer");
      // Update local state
      setDocuments((prev) =>
        prev.map((d) => d.id === doc.id ? { ...d, download_count: (d.download_count || 0) + 1 } : d)
      );
    } catch {
      window.open(doc.file_url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadBrochure = () => {
    window.open(BROCHURE_URL, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  const totalCommitted = commitments.reduce((s, c) => s + (c.amount || 0), 0);
  const landAllocation = calcLandAllocation(totalCommitted);
  const hasActiveCommitment = commitments.length > 0;

  // Group admin-uploaded docs by project
  const docsByProject = documents.reduce((acc, doc) => {
    const p = doc.project_name || "General";
    if (!acc[p]) acc[p] = [];
    acc[p].push(doc);
    return acc;
  }, {});

  return (
    <PullToRefresh onRefresh={loadData}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Banner */}
        <DocumentCentreBanner />

        {/* Legal disclaimer */}
        <div className="mb-6 p-4 rounded-xl border border-gold/30 bg-gold/5 flex items-start gap-3">
          <Info className="w-5 h-5 text-gold-dark flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/70 leading-relaxed">
            <span className="font-semibold text-foreground">Important Notice:</span> The land allocation ratio (₦1,000,000 = 1 m²) is a contractual business rule representing your proportional beneficial interest in the Colony Enclave project — it is not a direct legal title to a specific parcel of land. Please review the full Terms of Service and consult independent legal advice regarding your rights under Nigerian real estate regulations.
          </p>
        </div>

        {/* My Land Allocation Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-br from-brand to-brand-dark p-6 sm:p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider font-medium mb-1">My Land Allocation</p>
                <h2 className="font-display font-bold text-2xl sm:text-3xl">Colony Enclave, Epe</h2>
                <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Ijayo Village, Eyin-Osa, Epe, Lagos
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-gold" />
              </div>
            </div>

            {hasActiveCommitment ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Committed Amount</p>
                  <p className="font-numeric font-bold text-xl text-white">{formatNaira(totalCommitted)}</p>
                </div>
                <div className="bg-gold/20 rounded-xl p-4 border border-gold/30">
                  <p className="text-gold-light text-xs uppercase tracking-wider mb-1">Equivalent Land Allocation</p>
                  <p className="font-numeric font-bold text-xl text-white">
                    {landAllocation.toLocaleString()} m²
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">{landAllocation.toLocaleString()} Square Meter{landAllocation !== 1 ? "s" : ""}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Current Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="font-medium text-white text-sm">Land Backed</p>
                  </div>
                  <p className="text-white/50 text-xs mt-1">{commitments.length} active commitment{commitments.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 rounded-xl p-5 text-center">
                <p className="text-white/60 text-sm">No active commitments yet.</p>
                <p className="text-white/40 text-xs mt-1">Your land allocation will appear here once you have an active commitment.</p>
              </div>
            )}
          </div>

          {/* Ratio legend */}
          <div className="bg-card p-5 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Commitment-to-Land Ratio</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { amount: "₦1M", sqm: "1 m²" },
                { amount: "₦2M", sqm: "2 m²" },
                { amount: "₦5M", sqm: "5 m²" },
                { amount: "₦10M", sqm: "10 m²" },
                { amount: "₦25M", sqm: "25 m²" },
                { amount: "₦50M", sqm: "50 m²" },
              ].map((r) => (
                <div key={r.amount} className="text-center p-2 rounded-lg bg-muted/50 border border-border">
                  <p className="font-numeric font-bold text-xs text-foreground">{r.sqm}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{r.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Default Colony Enclave Documents */}
        <div className="mb-8">
          <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand" /> Colony Enclave — Project Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brochure — always present from the PDF */}
            <Card className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground text-sm">Colony Enclave Brochure</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand font-medium">Brochure</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Epe, Lagos — 32-page official project overview</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> v1.0</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> July 2026</span>
                  </div>
                </div>
              </div>
              <Button
                className="w-full mt-4 bg-brand hover:bg-brand-dark text-white"
                size="sm"
                onClick={handleDownloadBrochure}
              >
                <Download className="w-4 h-4 mr-2" /> Download Brochure
              </Button>
            </Card>

            {/* Survey Plan placeholder — admin uploads will override */}
            <Card className="p-5 border-dashed border-2 border-border/50 bg-muted/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm mb-1">Survey Plan</p>
                  <p className="text-xs text-muted-foreground">The official survey plan will be made available by your relationship officer upon commitment activation.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4" disabled>
                <Clock className="w-4 h-4 mr-2" /> Pending Upload
              </Button>
            </Card>
          </div>
        </div>

        {/* Admin-uploaded documents */}
        {Object.keys(docsByProject).length > 0 && (
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand" /> Additional Project Documents
            </h2>
            {Object.entries(docsByProject).map(([project, docs]) => (
              <div key={project} className="mb-6">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">{project}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {docs.map((doc) => {
                    const Icon = docTypeIcon[doc.document_type] || FileText;
                    return (
                      <Card key={doc.id} className="p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-brand" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-semibold text-foreground text-sm">{doc.title}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand font-medium">
                                {docTypeLabel[doc.document_type]}
                              </span>
                            </div>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground mb-1">{doc.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              {doc.version && <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {doc.version}</span>}
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(doc.created_date)}</span>
                              {doc.download_count > 0 && (
                                <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {doc.download_count}</span>
                              )}
                            </div>
                            {doc.version_notes && (
                              <button
                                onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                                className="mt-1 text-xs text-brand flex items-center gap-1 hover:underline"
                              >
                                Version notes {expandedDoc === doc.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            )}
                            {expandedDoc === doc.id && doc.version_notes && (
                              <p className="mt-1 text-xs text-muted-foreground bg-muted/50 rounded p-2">{doc.version_notes}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          className="w-full mt-4 bg-brand hover:bg-brand-dark text-white"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          disabled={downloading === doc.id}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {downloading === doc.id ? "Opening..." : "Download"}
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}