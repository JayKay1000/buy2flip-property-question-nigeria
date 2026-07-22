import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  FolderOpen, Upload, FileText, Download, Trash2, Edit3, Plus,
  BookOpen, MapPin, Shield, Tag, Clock, Eye, EyeOff, RefreshCw, AlertCircle
} from "lucide-react";

const docTypes = [
  { value: "brochure", label: "Brochure" },
  { value: "survey_plan", label: "Survey Plan" },
  { value: "title_document", label: "Title Document" },
  { value: "other", label: "Other" },
];

const accessLevels = [
  { value: "all_participants", label: "All Participants" },
  { value: "active_only", label: "Active Participants Only" },
];

const defaultForm = {
  project_name: "Colony Enclave",
  document_type: "brochure",
  title: "",
  description: "",
  file_url: "",
  version: "v1.0",
  version_notes: "",
  is_active: true,
  access_level: "all_participants",
};

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileError, setFileError] = useState("");

  useEffect(() => { loadDocs(); }, []);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const docs = await base44.entities.ProjectDocument.list("-created_date");
      setDocuments(docs);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxMB = 20;
    if (file.size > maxMB * 1024 * 1024) {
      setFileError(`File too large. Maximum ${maxMB}MB.`);
      return;
    }
    setFileError("");
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((prev) => ({ ...prev, file_url }));
    } catch {
      setFileError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file_url) { setFileError("Please upload a file."); return; }
    setSaving(true);
    try {
      if (editDoc) {
        // If replacing file, mark old as superseded
        const updated = await base44.entities.ProjectDocument.update(editDoc.id, form);
        setDocuments((prev) => prev.map((d) => d.id === editDoc.id ? updated : d));
      } else {
        const created = await base44.entities.ProjectDocument.create(form);
        setDocuments((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditDoc(null);
      setForm(defaultForm);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (doc) => {
    const updated = await base44.entities.ProjectDocument.update(doc.id, { is_active: !doc.is_active });
    setDocuments((prev) => prev.map((d) => d.id === doc.id ? updated : d));
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    await base44.entities.ProjectDocument.delete(doc.id);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };

  const openEdit = (doc) => {
    setEditDoc(doc);
    setForm({
      project_name: doc.project_name,
      document_type: doc.document_type,
      title: doc.title,
      description: doc.description || "",
      file_url: doc.file_url,
      version: doc.version || "",
      version_notes: doc.version_notes || "",
      is_active: doc.is_active,
      access_level: doc.access_level || "all_participants",
    });
    setShowForm(true);
  };

  const openNew = () => {
    setEditDoc(null);
    setForm(defaultForm);
    setFileError("");
    setShowForm(true);
  };

  const docTypeIcon = { brochure: BookOpen, survey_plan: MapPin, title_document: Shield, other: FileText };
  const docTypeLabel = { brochure: "Brochure", survey_plan: "Survey Plan", title_document: "Title Document", other: "Other" };

  const grouped = documents.reduce((acc, doc) => {
    const p = doc.project_name || "General";
    if (!acc[p]) acc[p] = [];
    acc[p].push(doc);
    return acc;
  }, {});

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Document Management</h1>
          <p className="text-muted-foreground mt-1">Upload and manage project documents for participants.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDocs}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
          <Button className="bg-brand hover:bg-brand-dark" onClick={openNew}>
            <Plus className="w-4 h-4 mr-2" /> Upload Document
          </Button>
        </div>
      </div>

      {/* Upload / Edit Form */}
      {showForm && (
        <Card className="p-6 mb-8 border-brand/20">
          <h2 className="font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand" />
            {editDoc ? "Edit Document" : "Upload New Document"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} placeholder="e.g. Colony Enclave" required />
            </div>
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={form.document_type} onValueChange={(v) => setForm({ ...form, document_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{docTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Document Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Colony Enclave Survey Plan" required />
            </div>
            <div className="space-y-2">
              <Label>Version</Label>
              <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="e.g. v1.0" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this document..." rows={2} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Version Notes (optional)</Label>
              <Textarea value={form.version_notes} onChange={(e) => setForm({ ...form, version_notes: e.target.value })} placeholder="What changed in this version..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select value={form.access_level} onValueChange={(v) => setForm({ ...form, access_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{accessLevels.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Upload File (PDF, max 20MB)</Label>
              <div className="flex gap-2 items-center">
                <Input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileChange} className="text-sm" />
                {uploading && <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin flex-shrink-0" />}
              </div>
              {fileError && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fileError}</p>}
              {form.file_url && !uploading && (
                <p className="text-xs text-brand flex items-center gap-1">✓ File ready to save</p>
              )}
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <Button type="submit" className="bg-brand hover:bg-brand-dark" disabled={saving || uploading}>
                {saving ? "Saving..." : editDoc ? "Save Changes" : "Upload Document"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditDoc(null); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Document list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No documents uploaded yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Upload Document" to add the first one.</p>
        </Card>
      ) : (
        Object.entries(grouped).map(([project, docs]) => (
          <div key={project} className="mb-8">
            <h2 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-brand" /> {project}
              <span className="text-xs text-muted-foreground font-normal">({docs.length} document{docs.length !== 1 ? "s" : ""})</span>
            </h2>
            <div className="space-y-3">
              {docs.map((doc) => {
                const Icon = docTypeIcon[doc.document_type] || FileText;
                return (
                  <Card key={doc.id} className={`p-5 transition-all ${!doc.is_active ? "opacity-50 bg-muted/30" : ""}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.is_active ? "bg-brand/10" : "bg-muted"}`}>
                        <Icon className={`w-5 h-5 ${doc.is_active ? "text-brand" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-foreground text-sm">{doc.title}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{docTypeLabel[doc.document_type]}</span>
                          {!doc.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Hidden</span>}
                        </div>
                        {doc.description && <p className="text-xs text-muted-foreground mb-1">{doc.description}</p>}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          {doc.version && <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {doc.version}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Uploaded {formatDate(doc.created_date)}</span>
                          <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {doc.download_count || 0} downloads</span>
                          <span className="flex items-center gap-1 capitalize">{(doc.access_level || "").replace(/_/g, " ")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => window.open(doc.file_url, "_blank")} title="Preview">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleActive(doc)} title={doc.is_active ? "Hide" : "Show"}>
                          {doc.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(doc)} title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)} className="text-destructive hover:text-destructive" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}