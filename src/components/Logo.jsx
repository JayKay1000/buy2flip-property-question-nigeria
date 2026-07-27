import React from "react";

const LOGO_URL =
  "https://media.base44.com/images/public/6a4d7c087d41148d5f9d3c8c/3aafb3510_Property_Question_logo-1-removebg-preview.png";

// Responsive heights — the logo scales with the `size` prop and the viewport,
// so it never overflows tight bars (e.g. the 56px mobile header) or crowds
// neighbouring icons on small screens.
const sizeMap = {
  sm: "h-8 sm:h-9 md:h-10",
  md: "h-10 sm:h-12 md:h-14 lg:h-16",
  lg: "h-12 sm:h-14 md:h-16 lg:h-20",
};

export default function Logo({ light = false, size = "md", className = "" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={LOGO_URL}
        alt="Property Question Nigeria"
        className={`${sizeMap[size]} w-auto object-contain max-h-full`}
      />
    </div>
  );
}