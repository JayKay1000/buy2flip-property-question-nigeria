import { base44 } from "@/api/base44Client";

// Generates a unique-ish referral code from the participant's name.
export const generateReferralCode = (name) => {
  const clean = (name || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
  const prefix = (clean.slice(0, 4) || "PQLB").padEnd(4, "X");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${suffix}`;
};

// Guarantees every authenticated user has a ParticipantProfile with a referral
// code. Self-heals users whose profile creation failed at registration and
// Google sign-ups (which never created one). Returns the profile or null.
export async function ensureParticipantProfile(me) {
  const user = me || (await base44.auth.me().catch(() => null));
  if (!user) return null;

  try {
    const profiles = await base44.entities.ParticipantProfile.filter({ created_by_id: user.id });
    if (profiles && profiles[0]) return profiles[0];
  } catch {}

  const fullName = user.full_name || "Participant";
  for (let attempts = 0; attempts < 5; attempts += 1) {
    try {
      return await base44.entities.ParticipantProfile.create({
        full_name: fullName,
        phone_number: "",
        referral_code: generateReferralCode(fullName),
        referred_by_code: null,
        status: "pending",
      });
    } catch {
      // Referral-code collision or transient error — regenerate and retry.
    }
  }
  return null;
}