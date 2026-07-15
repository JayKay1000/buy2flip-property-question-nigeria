import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import Footer from "@/components/landing/Footer";
import { ShieldCheck, FileText, Scale, AlertTriangle } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By registering an account, making a commitment, or otherwise using the Property Question Nigeria Limited land banking platform (the \"Platform\"), you confirm that you have read, understood, and agree to be bound by these Terms of Service (\"Terms\"). If you do not agree with any provision, you must not access or use the Platform.",
  },
  {
    title: "2. Definitions",
    body: "\"Company\" refers to Property Question Nigeria Limited. \"Participant\" refers to any registered user who makes a commitment through the Platform. \"Commitment\" refers to a structured financial contribution into a selected real estate-backed plan. \"Expected Return\" refers to the projected value payable at the maturity of a commitment, based on the selected plan's return rate.",
  },
  {
    title: "3. Eligibility",
    body: "You must be at least eighteen (18) years of age and legally capable of entering into binding contracts under Nigerian law to participate. By registering, you represent that all information provided is accurate and complete and that you are acting on your own behalf.",
  },
  {
    title: "4. Commitment Plans & Expected Returns",
    body: "The Platform offers structured commitment plans (Bronze, Silver, Gold, and Platinum) with defined durations and return rates. Commitments must be made in multiples of ₦1,000,000. Expected returns are projections based on the chosen plan and are not guaranteed profit. The Company deploys commitments into carefully selected real estate developments and disburses the total expected value at maturity, subject to the terms of the selected plan.",
  },
  {
    title: "5. Payments & Verification",
    body: "Participants fund commitments by transferring the commitment amount to the Company's designated bank account and uploading payment evidence for verification. A commitment remains in pending status until the Company confirms receipt of funds. The Company reserves the right to reject incomplete or unverifiable payment evidence.",
  },
  {
    title: "6. Withdrawals & Redemptions",
    body: "Returns and redemption values are disbursed to the participant's preferred receiving bank account at the maturity of the commitment. Early withdrawal is not permitted; commitments are held for the full plan duration to ensure optimal deployment of capital. Withdrawal requests are processed subject to verification and applicable compliance checks.",
  },
  {
    title: "7. Referral Program",
    body: "Participants may earn referral rewards of 2% on direct (first-line) referrals and 0.5% on indirect (second-line) referrals when referred participants make a verified commitment. Referral rewards are credited once the referred commitment is confirmed and may be subject to additional terms communicated by the Company.",
  },
  {
    title: "8. Regulatory Compliance",
    body: "The Company operates in accordance with applicable Nigerian laws and regulations governing real estate and financial services. The Platform facilitates structured commitments backed by real estate assets. Participants are encouraged to seek independent legal and financial advice regarding the regulatory implications of participating. These Terms shall be interpreted in compliance with the laws of the Federal Republic of Nigeria, and any dispute shall be resolved in accordance with Nigerian law.",
  },
  {
    title: "9. Risk Disclosure",
    body: "Land banking and real estate-backed commitments involve inherent risks, including but not limited to market fluctuations, development delays, and liquidity constraints. Expected returns are projections and not guarantees. Participants should only commit funds they can afford to hold for the full plan duration and should carefully consider their financial position before participating.",
  },
  {
    title: "10. Account Status & Suspension",
    body: "The Company reserves the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or provide false information. Suspended participants may not make new commitments or request withdrawals until the account is reinstated. Participants may request account deletion through the Platform, subject to review of active commitments.",
  },
  {
    title: "11. Privacy & Data Protection",
    body: "The Company handles participant data in accordance with applicable data protection laws. Personal information is used to administer commitments, process disbursements, and provide support. Payment evidence and banking details are stored securely and accessed only for verification and disbursement purposes.",
  },
  {
    title: "12. Limitation of Liability",
    body: "To the maximum extent permitted by law, the Company shall not be liable for indirect, incidental, or consequential damages arising from participation in the Platform. The Company's total liability shall not exceed the commitment amount associated with the claim in question.",
  },
  {
    title: "13. Governing Law & Dispute Resolution",
    body: "These Terms are governed by the laws of the Federal Republic of Nigeria. Any dispute arising from or relating to the Platform shall first be addressed through good-faith negotiation. Unresolved disputes shall be submitted to the jurisdiction of the competent courts of Lagos State, Nigeria.",
  },
  {
    title: "14. Amendments",
    body: "The Company may update these Terms from time to time. Material changes will be communicated to participants. Continued use of the Platform following changes constitutes acceptance of the revised Terms.",
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-brand transition-colors">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center gap-2 mb-4 text-gold">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-xs uppercase tracking-wider font-medium">Legal</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl mb-3">Terms of Service</h1>
          <p className="text-white/70 max-w-2xl leading-relaxed">
            The terms, regulatory compliance, and legal guidelines governing your participation
            in the Property Question Nigeria Limited land banking platform.
          </p>
          <p className="text-xs text-white/50 mt-4">Last updated: July 2026</p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick nav */}
          <aside className="md:col-span-1">
            <div className="sticky top-6 space-y-2">
              <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider font-medium">Contents</span>
              </div>
              {sections.map((s) => (
                <a
                  key={s.title}
                  href={`#${s.title.replace(/[^a-zA-Z0-9]/g, "")}`}
                  className="block text-sm text-muted-foreground hover:text-brand transition-colors py-1"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </aside>

          {/* Sections */}
          <div className="md:col-span-2 space-y-8">
            <div className="p-5 rounded-xl bg-gold/5 border border-gold/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-gold-dark flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80 leading-relaxed">
                Please read these Terms carefully before making any commitment. By participating,
                you acknowledge the risks and regulatory considerations associated with land banking.
              </p>
            </div>

            {sections.map((s) => (
              <section key={s.title} id={s.title.replace(/[^a-zA-Z0-9]/g, "")} className="scroll-mt-6">
                <h2 className="font-heading font-semibold text-lg text-foreground mb-2">{s.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </section>
            ))}

            <div className="p-5 rounded-xl bg-brand/5 border border-brand/20">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-brand" />
                <h3 className="font-heading font-semibold text-foreground">Contact</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For questions regarding these Terms, contact Property Question Nigeria Limited at
                <span className="text-foreground font-medium"> info@propertyquestion.net</span>,
                <span className="text-foreground font-medium"> +234 903 339 3000</span>, or Suite 43,
                Ogba Shopping Arcade, Ijaiye Road, Ogba, Lagos, Nigeria.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}