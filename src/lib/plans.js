export const PLANS = [
  {
    name: "Silver",
    slug: "silver",
    durationMonths: 6,
    returnRate: 0.12,
    minimum: 1000000,
    tagline: "Your entry into strategic land banking",
    accent: "#94A3B8",
    benefits: [
      "6-month commitment period",
      "12% expected return on commitment",
      "Minimum commitment of ₦1,000,000",
      "Quarterly portfolio progress updates",
      "Digital commitment certificate",
      "Full access to referral reward programme",
      "Dedicated relationship officer support"
    ],
    timeline: [
      { phase: "Enrolment", detail: "Choose your plan and commitment amount" },
      { phase: "Payment", detail: "Transfer to the official company account" },
      { phase: "Activation", detail: "Portfolio goes live upon confirmation" },
      { phase: "Maturity", detail: "Receive principal plus expected return" }
    ],
    faqs: [
      { q: "What is the minimum commitment amount?", a: "The minimum commitment for the Silver Plan is ₦1,000,000. You may commit in multiples of ₦1,000,000." },
      { q: "When do I receive my returns?", a: "Expected returns are disbursed at the end of the 6-month commitment period to your preferred receiving bank account." },
      { q: "Can I withdraw my commitment early?", a: "Early withdrawal is not permitted. Commitments are held for the full duration to ensure optimal deployment." },
      { q: "How is my return calculated?", a: "Your expected return is calculated as 12% of your commitment amount, payable at maturity." }
    ],
    terms: [
      "The commitment period is fixed at 6 months from the activation date.",
      "The minimum commitment amount is ₦1,000,000.",
      "The expected return of 12% is calculated on the total commitment amount.",
      "Returns are disbursed only to the participant's verified receiving bank account.",
      "The participant must provide valid bank details before maturity.",
      "Property Question Nigeria Limited reserves the right to verify all payment evidence."
    ]
  },
  {
    name: "Gold",
    slug: "gold",
    durationMonths: 12,
    returnRate: 0.30,
    minimum: 1000000,
    tagline: "Accelerated wealth building with premium returns",
    accent: "#C9A227",
    benefits: [
      "12-month commitment period",
      "30% expected return on commitment",
      "Minimum commitment of ₦1,000,000",
      "Monthly portfolio progress updates",
      "Priority digital commitment certificate",
      "Enhanced referral reward programme",
      "Priority relationship officer support",
      "Invitation to exclusive property tours"
    ],
    timeline: [
      { phase: "Enrolment", detail: "Choose your plan and commitment amount" },
      { phase: "Payment", detail: "Transfer to the official company account" },
      { phase: "Activation", detail: "Portfolio goes live upon confirmation" },
      { phase: "Maturity", detail: "Receive principal plus expected return" }
    ],
    faqs: [
      { q: "What is the minimum commitment amount?", a: "The minimum commitment for the Gold Plan is ₦1,000,000. You may commit in multiples of ₦1,000,000." },
      { q: "When do I receive my returns?", a: "Expected returns are disbursed at the end of the 12-month commitment period to your preferred receiving bank account." },
      { q: "Can I add to my commitment mid-term?", a: "Additional commitments require a new plan enrolment. Each commitment runs for its full duration independently." },
      { q: "How is my return calculated?", a: "Your expected return is calculated as 30% of your commitment amount, payable at maturity." }
    ],
    terms: [
      "The commitment period is fixed at 12 months from the activation date.",
      "The minimum commitment amount is ₦1,000,000.",
      "The expected return of 30% is calculated on the total commitment amount.",
      "Returns are disbursed only to the participant's verified receiving bank account.",
      "The participant must provide valid bank details before maturity.",
      "Property Question Nigeria Limited reserves the right to verify all payment evidence."
    ]
  },
  {
    name: "Platinum",
    slug: "platinum",
    durationMonths: 18,
    returnRate: 0.50,
    minimum: 1000000,
    tagline: "The pinnacle of strategic land banking",
    accent: "#1A1A1A",
    benefits: [
      "18-month commitment period",
      "50% expected return on commitment",
      "Minimum commitment of ₦1,000,000",
      "Bi-weekly portfolio progress updates",
      "Premium commitment certificate",
      "Maximised referral reward programme",
      "Dedicated senior relationship officer",
      "Exclusive access to pre-launch developments",
      "Annual partner appreciation event"
    ],
    timeline: [
      { phase: "Enrolment", detail: "Choose your plan and commitment amount" },
      { phase: "Payment", detail: "Transfer to the official company account" },
      { phase: "Activation", detail: "Portfolio goes live upon confirmation" },
      { phase: "Maturity", detail: "Receive principal plus expected return" }
    ],
    faqs: [
      { q: "What is the minimum commitment amount?", a: "The minimum commitment for the Platinum Plan is ₦1,000,000. You may commit in multiples of ₦1,000,000." },
      { q: "When do I receive my returns?", a: "Expected returns are disbursed at the end of the 18-month commitment period to your preferred receiving bank account." },
      { q: "What makes Platinum different?", a: "The Platinum Plan offers the highest expected return of 50%, along with exclusive access to pre-launch developments and premium support." },
      { q: "How is my return calculated?", a: "Your expected return is calculated as 50% of your commitment amount, payable at maturity." }
    ],
    terms: [
      "The commitment period is fixed at 18 months from the activation date.",
      "The minimum commitment amount is ₦1,000,000.",
      "The expected return of 50% is calculated on the total commitment amount.",
      "Returns are disbursed only to the participant's verified receiving bank account.",
      "The participant must provide valid bank details before maturity.",
      "Property Question Nigeria Limited reserves the right to verify all payment evidence."
    ]
  }
];

export const getPlan = (slug) => PLANS.find((p) => p.slug === slug?.toLowerCase());

export const COMPANY_BANK = {
  bankName: "Guaranty Trust Bank",
  accountName: "Property Question Nigeria LTD",
  accountNumber: "0123783838"
};

export const AMOUNT_PRESETS = [1000000, 2000000, 3000000, 5000000, 10000000, 20000000];

export const REFERRAL_REWARDS = {
  direct: 0.02,
  indirect: 0.005
};

export const PAYMENT_EXPIRY_HOURS = 24;

export const HOW_IT_WORKS_STEPS = [
  { step: 1, title: "Create your account", detail: "Register with your details and verify your email" },
  { step: 2, title: "Verify email", detail: "Enter the 6-digit OTP sent to your email" },
  { step: 3, title: "Complete your profile", detail: "Add your personal and banking information" },
  { step: 4, title: "Choose a Commitment Plan", detail: "Select Silver, Gold, or Platinum" },
  { step: 5, title: "Select your preferred amount", detail: "Choose your commitment amount in multiples of ₦1,000,000" },
  { step: 6, title: "View company payment account", detail: "Transfer to the official company bank account" },
  { step: 7, title: "Upload payment evidence", detail: "Upload your payment receipt for verification" },
  { step: 8, title: "Confirmation", detail: "Your portfolio is activated upon verification" }
];