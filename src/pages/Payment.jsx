import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPlan, PLANS, COMPANY_BANK, PAYMENT_EXPIRY_HOURS, isWelcomePackageEligible } from "@/lib/plans";
import CommitmentAmountSlider from "@/components/CommitmentAmountSlider";
import { formatNaira } from "@/lib/format";
import {
  Copy, Check, Upload, FileCheck, ArrowRight, ArrowLeft, Clock,
  Building2, AlertCircle, CheckCircle2, Loader2, X, Gift
} from "lucide-react";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planSlug = searchParams.get("plan");
  const initialPlan = getPlan(planSlug) || PLANS[0];

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [amount, setAmount] = useState(initialPlan.minimum);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [createdCommitment, setCreatedCommitment] = useState(null);
  const [countdown, setCountdown] = useState(PAYMENT_EXPIRY_HOURS * 3600);

  useEffect(() => {
    if (step >= 2) {
      const timer = setInterval(() => {
        setCountdown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const validAmount = amount;
  const expectedReturn = validAmount * selectedPlan.returnRate;
  const totalValue = validAmount + expectedReturn;

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(COMPANY_BANK.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCountdown = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const proceedToAccount = () => {
    if (validAmount < selectedPlan.minimum || validAmount % 1000000 !== 0) {
      setError(`Amount must be a multiple of ₦1,000,000 and at least ${formatNaira(selectedPlan.minimum)}`);
      return;
    }
    setError("");
    setStep(2);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setError("File size must not exceed 10MB");
      return;
    }
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(f.type)) {
      setError("Only PDF, JPG, JPEG, and PNG files are allowed");
      return;
    }
    setError("");
    setFile(f);
  };

  const submitEvidence = async () => {
    if (!file) {
      setError("Please upload your payment evidence");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setError("");
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 15, 85));
      }, 200);

      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Financial values are computed server-side to prevent client-side tampering.
      const { data } = await base44.functions.invoke("createCommitment", {
        planName: selectedPlan.name,
        amount: validAmount,
        evidenceUrl: file_url,
      });
      const commitment = data?.commitment;

      setCreatedCommitment(commitment);
      setStep(4);
    } catch (err) {
      setError(err.message || "Failed to submit evidence. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const steps = [
    { num: 1, label: "Select Plan" },
    { num: 2, label: "Company Account" },
    { num: 3, label: "Upload Evidence" },
    { num: 4, label: "Confirmation" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Complete Your Commitment</h1>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= s.num ? "bg-brand text-white" : "bg-muted text-muted-foreground"
              }`}>
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-[10px] mt-1.5 text-center ${step >= s.num ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 -mt-5 transition-all ${step > s.num ? "bg-brand" : "bg-border"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Step 1: Select plan + amount */}
      {step === 1 && (
        <Card className="p-6 space-y-6">
          <div>
            <Label className="mb-3 block">Select Commitment Plan</Label>
            <div className="grid grid-cols-3 gap-3">
              {PLANS.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => { setSelectedPlan(p); setAmount(p.minimum); }}
                  className={`p-4 rounded-xl text-center transition-all border-2 ${
                    selectedPlan.slug === p.slug ? "border-brand bg-brand/5" : "border-border hover:border-gold/40"
                  }`}
                >
                  <p className="font-heading font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(p.returnRate * 100).toFixed(0)}% · {p.durationMonths}m</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Select Commitment Amount</Label>
            <CommitmentAmountSlider value={validAmount} onChange={setAmount} minimum={selectedPlan.minimum} />
          </div>

          <div className="bg-muted/50 rounded-xl p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Commitment Amount</span>
              <span className="font-numeric font-semibold">{formatNaira(validAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expected Return ({(selectedPlan.returnRate * 100).toFixed(0)}%)</span>
              <span className="font-numeric font-semibold text-brand">{formatNaira(expectedReturn)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-border">
              <span className="font-medium text-foreground">Total at Maturity</span>
              <span className="font-numeric font-bold text-lg text-gold-dark">{formatNaira(totalValue)}</span>
            </div>
          </div>

          {isWelcomePackageEligible(selectedPlan.name) && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gold/5 border border-gold/20">
            <Gift className="w-5 h-5 text-gold-dark flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">1% Welcome Package — {formatNaira(Math.round(validAmount * 0.01))}</p>
              <p className="text-xs text-muted-foreground mt-0.5">You'll receive a 1% welcome package of your commitment, withdrawable immediately once your payment is verified by our team.</p>
            </div>
          </div>
          )}

          <Button className="w-full h-12 bg-brand hover:bg-brand-dark" onClick={proceedToAccount}>
            Proceed to Payment <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      )}

      {/* Step 2: Company account */}
      {step === 2 && (
        <Card className="p-6 space-y-6">
          {/* Countdown */}
          <div className="flex items-center justify-between bg-gold/10 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-dark" />
              <span className="text-sm font-medium text-foreground">Complete payment before expiry</span>
            </div>
            <span className="font-numeric font-bold text-lg text-gold-dark">{formatCountdown(countdown)}</span>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-foreground mb-1">Official Company Account</h3>
            <p className="text-sm text-muted-foreground mb-4">Transfer exactly {formatNaira(validAmount)} to the account below.</p>
          </div>

          <div className="bg-brand rounded-2xl p-6 text-white space-y-4">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Building2 className="w-4 h-4" /> {COMPANY_BANK.bankName}
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Account Name</p>
              <p className="font-medium">{COMPANY_BANK.accountName}</p>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Account Number</p>
              <div className="flex items-center justify-between gap-3">
                <p className="font-numeric font-bold text-2xl tracking-wide">{COMPANY_BANK.accountNumber}</p>
                <button
                  onClick={copyAccountNumber}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                >
                  {copied ? <><Check className="w-4 h-4 text-gold" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">Amount to Transfer</p>
            <p className="font-numeric font-bold text-2xl text-foreground">{formatNaira(validAmount)}</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button className="flex-1 h-12 bg-brand hover:bg-brand-dark" onClick={() => setStep(3)}>
              I've Made Payment <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Upload evidence */}
      {step === 3 && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-1">Upload Payment Evidence</h3>
            <p className="text-sm text-muted-foreground">Upload your payment receipt for verification.</p>
          </div>

          {!file ? (
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl py-12 cursor-pointer hover:border-gold/50 hover:bg-muted/30 transition-all">
              <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-brand" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground text-sm">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, JPEG, PNG · Max 10MB</p>
              </div>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="border border-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              {uploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-brand transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-gold-dark flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Your portfolio will be activated once our team verifies your payment. This typically takes 1-2 business hours.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(2)} disabled={uploading}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button className="flex-1 h-12 bg-gold hover:bg-gold-dark text-white border-0" onClick={submitEvidence} disabled={!file || uploading}>
              {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : <>Submit Evidence <CheckCircle2 className="w-4 h-4 ml-2" /></>}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <Card className="p-8 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-brand" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-foreground">Evidence Submitted!</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              Thank you. Your payment evidence has been received. Your portfolio will be activated
              once our team verifies your payment (typically 1-2 business hours).
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-5 text-left space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-numeric font-medium">{formatNaira(validAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expected Return</span>
              <span className="font-numeric font-medium text-brand">{formatNaira(expectedReturn)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground">Total at Maturity</span>
              <span className="font-numeric font-bold text-gold-dark">{formatNaira(totalValue)}</span>
            </div>
            {isWelcomePackageEligible(selectedPlan.name) && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">1% Welcome Package</span>
              <span className="font-numeric font-medium text-gold-dark">{formatNaira(Math.round(validAmount * 0.01))}</span>
            </div>
            )}
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => navigate("/portfolio")}>View Portfolio</Button>
            <Button className="bg-brand hover:bg-brand-dark" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          </div>
        </Card>
      )}
    </div>
  );
}