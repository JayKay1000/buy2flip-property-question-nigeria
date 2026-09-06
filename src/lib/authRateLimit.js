// Client-side rate limiting for login attempts, keyed by email.
// Tracks failed attempts in localStorage and enforces a temporary lockout
// once too many failures accumulate for a single account.
//
// This is a front-end deterrent (stops casual brute-forcing and shows the
// user clear feedback). The platform's auth backend remains the source of
// truth for actual authentication.

const STORAGE_KEY = "pqlb_login_rate_limit";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

const safeKey = (email) => `login:${String(email || "").trim().toLowerCase()}`;

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeStore = (store) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
};

// Returns the current rate-limit state for an email, or null if unrestricted.
export const getLoginRateLimit = (email) => {
  if (!email) return null;
  const store = readStore();
  const entry = store[safeKey(email)];
  if (!entry) return null;

  const now = Date.now();
  if (entry.lockedUntil && entry.lockedUntil > now) {
    return {
      locked: true,
      remainingMs: entry.lockedUntil - now,
      remainingAttempts: 0,
    };
  }

  // Lockout expired — reset the counter so the user gets a fresh slate.
  if (entry.lockedUntil && entry.lockedUntil <= now) {
    delete store[safeKey(email)];
    writeStore(store);
    return null;
  }

  return {
    locked: false,
    remainingMs: 0,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - (entry.count || 0)),
  };
};

// Record a failed attempt. Returns the updated state after recording.
export const recordFailedLogin = (email) => {
  if (!email) return null;
  const store = readStore();
  const key = safeKey(email);
  const entry = store[key] || { count: 0, lockedUntil: 0 };
  entry.count = (entry.count || 0) + 1;

  let locked = false;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS;
    locked = true;
  }
  store[key] = entry;
  writeStore(store);

  return {
    locked,
    remainingMs: locked ? entry.lockedUntil - Date.now() : 0,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - entry.count),
  };
};

// Clear the rate-limit state for an email (call on a successful login).
export const clearLoginRateLimit = (email) => {
  if (!email) return;
  const store = readStore();
  delete store[safeKey(email)];
  writeStore(store);
};

export const formatRemainingTime = (ms) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  return `${seconds}s`;
};