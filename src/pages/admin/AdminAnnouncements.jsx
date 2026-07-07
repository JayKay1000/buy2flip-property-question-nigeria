import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { Megaphone, Plus, Trash2, Edit, Bell, AlertCircle } from "lucide-react";

const categories = [
  { value: "general", label: "General" },
  { value: "update", label: "Update" },
  { value: "alert", label: "Alert" },
  { value: "maintenance", label: "Maintenance" },
];

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const anns = await base44.entities.Announcement.list("-created_date");
      setAnnouncements(anns);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await base44.entities.Announcement.update(editing.id, { title, body, category });
      } else {
        await base44.entities.Announcement.create({ title, body, category, active: true });
      }
      setTitle(""); setBody(""); setCategory("general"); setEditing(null);
      setShowForm(false);
      loadData();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ann) => {
    await base44.entities.Announcement.update(ann.id, { active: !ann.active });
    loadData();
  };

  const handleDelete = async (ann) => {
    if (!confirm("Delete this announcement?")) return;
    await base44.entities.Announcement.delete(ann.id);
    loadData();
  };

  const startEdit = (ann) => {
    setEditing(ann);
    setTitle(ann.title);
    setBody(ann.body);
    setCategory(ann.category);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Announcements</h1>
          <p className="text-muted-foreground mt-1">Manage platform-wide announcements.</p>
        </div>
        <Button className="bg-brand hover:bg-brand-dark" onClick={() => { setEditing(null); setTitle(""); setBody(""); setCategory("general"); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Announcement
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground">{editing ? "Edit Announcement" : "Create Announcement"}</h2>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ann-title">Title</Label>
              <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" className="h-11" required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-body">Message</Label>
              <Textarea id="ann-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your announcement..." rows={4} required />
            </div>
            <Button type="submit" className="bg-brand hover:bg-brand-dark" disabled={saving}>
              {saving ? "Saving..." : editing ? "Update Announcement" : "Publish Announcement"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <Card className="p-12 text-center">
            <Megaphone className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          </Card>
        ) : (
          announcements.map((ann) => (
            <Card key={ann.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    ann.category === "alert" ? "bg-destructive/10" :
                    ann.category === "update" ? "bg-gold/10" :
                    ann.category === "maintenance" ? "bg-muted" : "bg-brand/10"
                  }`}>
                    {ann.category === "alert" ? <AlertCircle className="w-5 h-5 text-destructive" /> :
                     ann.category === "update" ? <Bell className="w-5 h-5 text-gold-dark" /> :
                     <Megaphone className="w-5 h-5 text-brand" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-foreground">{ann.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        !ann.active ? "bg-muted text-muted-foreground" : "bg-brand/10 text-brand"
                      }`}>{ann.active ? "Active" : "Hidden"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ann.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(ann.created_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(ann)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(ann)}>{ann.active ? "Hide" : "Show"}</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(ann)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}