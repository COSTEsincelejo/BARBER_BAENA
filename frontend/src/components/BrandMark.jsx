import React from "react";

/**
 * Lockup de marca estilo logo Baena Barber (BB + Barber Shop + título).
 * variant: "hero" | "nav" | "compact"
 */
export default function BrandMark({ variant = "hero", className = "" }) {
  return (
    <div className={`brand-mark-lockup brand-mark-${variant} ${className}`.trim()}>
      <div className="brand-mono" aria-hidden="true">
        BB
      </div>
      <div className="brand-shop-line">
        <span className="brand-rule" />
        <span className="brand-shop">Barber Shop</span>
        <span className="brand-rule" />
      </div>
      <p className="brand-title">
        <span>Baena</span>
        <span>Barber</span>
      </p>
      <div className="brand-razor" aria-hidden="true">
        <svg viewBox="0 0 64 24" width="56" height="21" fill="none">
          <path
            d="M4 16c8-10 18-12 28-8 6 2 10 4 14 4 4 0 8-1 12-3"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M48 9l8 3-3 5-9-2 4-6z"
            fill="currentColor"
            opacity="0.95"
          />
          <circle cx="10" cy="15" r="2.2" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
