import React from "react";

const HANDLE = "propertyquestionnigeria";

const socials = [
  {
    name: "Instagram",
    href: `https://instagram.com/${HANDLE}`,
    path: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>
    ),
  },
  {
    name: "X",
    href: `https://x.com/${HANDLE}`,
    path: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    ),
  },
  {
    name: "YouTube",
    href: `https://youtube.com/@${HANDLE}`,
    path: (
      <>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </>
    ),
  },
  {
    name: "Facebook",
    href: `https://facebook.com/${HANDLE}`,
    path: (
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    ),
  },
  {
    name: "LinkedIn",
    href: `https://linkedin.com/company/${HANDLE}`,
    path: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  {
    name: "TikTok",
    href: `https://tiktok.com/@${HANDLE}`,
    path: (
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v4a9 9 0 0 1-5-1.5V16a8 8 0 1 1-4-6.93z" />
    ),
  },
];

export default function SocialLinks({ variant = "light" }) {
  const colorClasses =
    variant === "light"
      ? "text-white/60 hover:text-white hover:border-gold/60 hover:bg-white/10"
      : "text-muted-foreground hover:text-primary hover:border-gold/60 hover:bg-accent";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          className={`flex items-center justify-center w-9 h-9 rounded-full border border-white/15 transition-all duration-200 ${colorClasses}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke={s.name === "Instagram" ? "currentColor" : "none"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            {s.path}
          </svg>
        </a>
      ))}
    </div>
  );
}