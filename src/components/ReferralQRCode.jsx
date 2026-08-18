import React, { useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, QrCode } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ReferralQRCode({ referralUrl, referralCode }) {
  const wrapRef = useRef(null);

  const fileName =
    referralCode && referralCode !== "—"
      ? `buy2flip-referral-${referralCode}.png`
      : "buy2flip-referral-qr.png";

  const getCanvas = () => wrapRef.current?.querySelector("canvas");

  const handleDownload = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
            className="w-44 h-44 sm:w-52 sm:h-52 block"
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
    </Card>
  );
}