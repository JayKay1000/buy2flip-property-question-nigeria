import React from "react";

const HANDLE_BUY2FLIP = "Buy2flip_";
const HANDLE_PQN = "propertyquestionnigeria";

const socials = [
  {
    name: "Instagram",
    href: `https://instagram.com/${HANDLE_BUY2FLIP}`,
    gradient: "linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)",
    path: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    name: "X",
    href: `https://x.com/${HANDLE_BUY2FLIP}`,
    gradient: "linear-gradient(135deg, #1A1A1A 0%, #000000 100%)",
    path: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    ),
  },
  {
    name: "TikTok",
    href: `https://tiktok.com/@${HANDLE_BUY2FLIP}`,
    gradient: "linear-gradient(135deg, #25F4EE 0%, #000000 45%, #FE2C55 100%)",
    path: (
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v4a9 9 0 0 1-5-1.5V16a8 8 0 1 1-4-6.93z" />
    ),
  },
  {
    name: "YouTube",
    href: `https://youtube.com/@${HANDLE_PQN}`,
    gradient: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
    path: (
      <>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </>
    ),
  },
  {
    name: "Facebook",
    href: `https://facebook.com/${HANDLE_PQN}`,
    gradient: "linear-gradient(135deg, #1877F2 0%, #0A5BC4 100%)",
    path: (
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    ),
  },
  {
    name: "LinkedIn",
    href: `https://linkedin.com/company/${HANDLE_PQN}`,
    gradient: "linear-gradient(135deg, #0A66C2 0%, #004182 100%)",
    path: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  {
    name: "Google Play",
    href: "https://play.google.com/store/apps/details?id=com.base6a4d7c087d41148d5f9d3c8c.app",
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    path: (
      <>
        <path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 0 1-.609-.92V2.734a1 1 0 0 1 .609-.92z" fill="#00C3FF" />
        <path d="M3.609 1.814L17.36 8.432 13.792 12 3.609 1.814z" fill="#00E976" />
        <path d="M13.792 12L17.36 8.432l3.562 2.055c.5.288.5 1.018 0 1.306L17.36 13.848 13.792 12z" fill="#FFC107" />
        <path d="M3.609 22.186L13.792 12l3.568 3.848-13.75 7.258a1 1 0 0 1-.609-.92z" fill="#FF003C" />
      </>
    ),
  },
];

export default function SocialLinks({ variant = "light" }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          title={s.name}
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md"
          style={{ background: s.gradient }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            className="w-5 h-5 text-white"
          >
            {s.path}
          </svg>
        </a>
      ))}
    </div>
  );
}