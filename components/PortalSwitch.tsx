"use client";

import { useRouter, usePathname } from "next/navigation";

// Top portal switcher. Admin tab only renders for admins.
export function PortalSwitch({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const onAdmin = pathname.startsWith("/admin");

  return (
    <div className="portal-switch">
      <span className="ps-logo">CreativeFlow AI</span>
      <div className="ps-sep" />
      <button
        className={`ps-tab${!onAdmin ? " on" : ""}`}
        onClick={() => router.push("/dashboard")}
      >
        <i className="ti ti-layout-dashboard" aria-hidden="true" /> Client portal
      </button>
      {isAdmin && (
        <button
          className={`ps-tab${onAdmin ? " on-admin" : ""}`}
          onClick={() => router.push("/admin/users")}
        >
          <i className="ti ti-shield-lock" aria-hidden="true" /> Admin portal
        </button>
      )}
    </div>
  );
}
