import React, { useRef, useState, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, QrCode, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ReferralQRCode({ referralUrl, referralCode }) {
  const wrapRef = useRef(null);
  const [saveImage, setSaveImage] = useState(null);

  const fileName =
    referralCode && referralCode !== "—"
      ? `buy2flip-referral-${referralCode}.png`
      : "buy2flip-referral-qr.png";

  const getCanvas = () => wrapRef.current?.querySelector("canvas");

  const handleDownload = useCallback(async () => {
    const canvas = getCanvas();
    if (!canvas) return;

    // Mobile WebViews often block the anchor "download" attribute on data
    // URLs. Prefer the native Web Share sheet (which lets the user "Save
    // Image") when available, then fall back to an anchor download (desktop).
    const shared = await new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve(false);
        const file = new File([blob], fileName, { type: "image/png" });
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: "Buy2Flip Referral QR Code" });
            return resolve(true);
          }
        } catch {
          /* user cancelled or share unavailable */
        }
        resolve(false);
      }, "image/png");
    });
    if (shared) return;

    // In native app WebViews the anchor "download" attribute is blocked, so
    // surface the PNG full-screen for a long-press → "Save Image" save.
    setSaveImage(canvas.toDataURL("image/png"));
  }, [fileName]);

  const handleShare = useCallback(async () => {
    const canvas = getCanvas();
    if (!canvas) return;
    try {
      if (navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], fileName, { type: "image/png" });
          try {
            await navigator.share({ files: [file], title: "My Buy2Flip Referral QR Code", text: referralUrl });
          } catch {
            try { await navigator.share({ title: "My Buy2Flip Referral QR Code", text: referralUrl }); } catch { /* cancelled */ }
          }
        }, "image/png");
      } else {
        navigator.clipboard.writeText(referralUrl);
        toast({ title: "Link copied", description: "Referral link copied to clipboard." });
      }
    } catch {
      navigator.clipboard.writeText(referralUrl);
      toast({ title: "Link copied", description: "Referral link copied to clipboard." });
    }
  }, [fileName, referralUrl]);

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-brand" />
        <h2 className="font-heading font-semibold text-foreground">My Referral QR Code</h2>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div ref={wrapRef} className="flex-shrink-0 p-4 bg-white rounded-xl border border-border shadow-sm">
          <QRCodeCanvas
            value={referralUrl}
            size={1024}
            level="H"
            marginSize={4}
            fgColor="#0B3D2E"
            bgColor="#ffffff"
            className="w-[72vw] sm:w-48 max-w-[300px] h-auto block mx-auto"
          />
        </div>
        <div className="flex-1 w-full text-center sm:text-left">
          <p className="text-sm text-muted-foreground mb-1">Scan to open your referral registration link.</p>
          <p className="text-xs text-muted-foreground break-all mb-4 font-numeric">{referralUrl}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
            <Button className="bg-brand hover:bg-brand-dark" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Download QR Code
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> Share QR Code
            </Button>
          </div>
        </div>
      </div>

      {saveImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setSaveImage(null); }}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            onClick={() => setSaveImage(null)}
            aria-label="Close"
          >
            <X className="w-7 h-7" />
          </button>
          <p className="text-white text-center text-sm mb-4 max-w-xs">
            Press and hold the image, then tap <span className="font-semibold">Save Image</span> / <span className="font-semibold">Download image</span> to keep it on your device.
          </p>
          <img
            src={saveImage}
            alt="Referral QR Code"
            className="w-[80vw] max-w-sm h-auto rounded-xl bg-white p-3"
            style={{ WebkitTouchCallout: "default", WebkitUserSelect: "auto", userSelect: "auto" }}
          />
        </div>
      )}
    </Card>
  );
}