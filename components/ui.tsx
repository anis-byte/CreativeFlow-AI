"use client";

import { useState } from "react";

export function LogoMark({ admin = false }: { admin?: boolean }) {
  return (
    <div className={`logo-mark${admin ? " admin-mark" : ""}`}>
      {admin ? (
        <svg viewBox="0 0 18 18" fill="none">
          <path
            d="M9 2L11 7H16L12 10L13.5 15L9 12L4.5 15L6 10L2 7H7L9 2Z"
            stroke="#3a3470"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 18 18" fill="none">
          <path d="M3 9C3 5.7 5.7 3 9 3" stroke="#0e0e12" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 3C12.3 3 15 5.7 15 9" stroke="#0e0e12" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 9C15 12.3 12.3 15 9 15" stroke="#0e0e12" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="9" r="2" fill="#0e0e12" />
        </svg>
      )}
    </div>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <div className="loading-label">{label}</div>
    </div>
  );
}

export function EmptyCard({
  icon,
  title,
  sub,
}: {
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="empty-card">
      <i className={`ti ${icon} empty-icon`} aria-hidden="true" />
      <div className="empty-title">{title}</div>
      <div className="empty-sub">{sub}</div>
    </div>
  );
}

export function OutList({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, i) => (
        <div className="out-row" key={i}>
          <span className="out-n">{i + 1}</span>
          <span>{item}</span>
        </div>
      ))}
    </>
  );
}

export function CopyButton({
  text,
  small = true,
}: {
  text: string;
  small?: boolean;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={`btn${small ? " btn-sm" : ""}`}
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 900);
        });
      }}
    >
      <i className={`ti ${done ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
      {!small && (done ? " Copied" : " Copy")}
    </button>
  );
}
