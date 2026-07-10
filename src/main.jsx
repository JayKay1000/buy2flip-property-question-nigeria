import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// ── System dark-mode listener ──────────────────────────────────
// Applies the `.dark` class to <html> based on the OS-level
// `prefers-color-scheme` media query, and keeps it in sync when
// the user changes their system theme while the app is open.
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function applySystemTheme() {
  document.documentElement.classList.toggle('dark', mediaQuery.matches);
}

applySystemTheme();

if (mediaQuery.addEventListener) {
  mediaQuery.addEventListener('change', applySystemTheme);
} else if (mediaQuery.addListener) {
  // Safari < 14 fallback
  mediaQuery.addListener(applySystemTheme);
}
// ────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)