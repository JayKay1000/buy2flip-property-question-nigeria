import React from "react";

const LOGO_URL = "https://media.base44.com/images/public/6a4d7c087d41148d5f9d3c8c/3aafb3510_Property_Question_logo-1-removebg-preview.png";

const sizeMap = {
  sm: "h-10 sm:h-11",
  md: "h-12 sm:h-14",
  lg: "h-16 sm:h-20",
};

export default function Logo({ light = false, size = "md", className = "" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={LOGO_URL}
        alt="Property Question Nigeria"
        className={`${sizeMap[size]} w-auto object-contain`}
        style={{ filter: light ? "none" : "none" }}
      />
    </div>
  );
}