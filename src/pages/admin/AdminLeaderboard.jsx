import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNaira, formatDate } from "@/lib/format";
import { Trophy, Sparkles, Loader2, History } from "lucide-react";

export default function AdminLeaderboard() {
  const [snapshots, setSnapshots] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadSnapshots = async () => {
    try {
      const list = await base44.entities.LeaderboardSnapshot.list("-created_date");
      setSnapshots(list);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSnapshots();
  }, []);

  const handlePublish = async () => {
    setPublishing(true);
    setMessage("");
    try {
      const res = await base44.functions.invoke("publishMonthlyLeaderboard", {});
      if (res.data?.snapshot) {
        setMessage(`Published ${res.data.snapshot.period_label} leaderboard with ${res.data.snapshot.entries.length} leaders.`);
        await loadSnapshots();
      } else if (res.data?.error) {
        setMessage(res.data.error);
      }
    } catch (err) {
      setMessage(err.message || "Failed to publish leaderboard");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Leaderboard Publishing</h1>
          <p className="text-muted-foreground mt-1">Publish the monthly Top 10 referral leaders for participants to see.</p>
        </div>
        <Button onClick={handlePublish} disabled={publishing} className="bg-gold hover:bg-gold-dark text-white border-0">
          {publishing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing...</> : <><Sparkles className="w-4 h-4 mr-2" />Publish This Month's Top 10</>}
        </Button>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-brand/10 text-brand text-sm font-medium border border-brand/20">
          {message}
        </div>
      )}

      {/* Latest published */}
      {snapshots.length > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-gold" />
            <h2 className="font-heading font-semibold text-foreground">{snapshots[0].period_label} Leaders</h2>
            <span className="ml-auto text-xs text-muted-foreground">Published {formatDate(snapshots[0].created_date)}</span>
          </div>
          <div className="space-y-2">
            {(snapshots[0].entries || []).map((entry) => {
              const medal = entry.rank === 1 ? "bg-gold text-white" : entry.rank === 2 ? "bg-muted-foreground text-white" : entry.rank === 3 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground";
              return (
                <div key={entry.referral_code} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-numeric font-bold text-sm flex-shrink-0 ${medal}`}>
                    {entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.total_referrals} referrals</p>
                  </div>
                  <p className="font-numeric font-semibold text-sm text-gold-dark flex-shrink-0">{formatNaira(entry.total_earnings)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* History */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-heading font-semibold text-foreground">Publishing History</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : snapshots.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No leaderboards published yet. Click "Publish This Month's Top 10" to get started.</p>
        ) : (
          <div className="space-y-2">
            {snapshots.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.period_label}</p>
                  <p className="text-xs text-muted-foreground">Published {formatDate(s.created_date)} by {s.published_by || "Admin"}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-brand/10 text-brand font-medium">{(s.entries || []).length} leaders</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}