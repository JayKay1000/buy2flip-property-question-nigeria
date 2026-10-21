import React from "react";

// New brand logo — white "Buy", gold "2" and "Flip" on a solid black plate.
const LOGO_URL =
  "https://media.base44.com/images/public/6a4d7c087d41148d5f9d3c8c/9d82bd40b_DoneLogoBuy2flip1.png";

// Responsive heights — the logo scales with the `size` prop and the viewport,
// so it never overflows tight bars (e.g. the 56px mobile header) or crowds
// neighbouring icons on small screens.
const sizeMap = {
  sm: "h-8 sm:h-9 md:h-10",
  md: "h-10 sm:h-12 md:h-14 lg:h-16",
  lg: "h-12 sm:h-14 md:h-16 lg:h-20",
};

export default function Logo({ light = false, size = "md", className = "" }) {
  // `light` = the logo sits on a dark or transparent surface, so the artwork is
  // shown as-is (white + gold on black) and `screen` blends the black plate into
  // whatever is behind it. Everywhere else — light surfaces — the colours are
  // inverted (white plate, black + gold text) and `multiply` drops that plate.
  const style = light
    ? { mixBlendMode: "screen" }
    : { filter: "invert(1) hue-rotate(180deg)", mixBlendMode: "multiply" };

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={LOGO_URL}
        alt="Buy2Flip"
        className={`${sizeMap[size]} w-auto object-contain max-h-full`}
        style={style}
      />
    </div>
  );
}