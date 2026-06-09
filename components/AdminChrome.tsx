"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/ui";
import { PortalSwitch } from "@/components/PortalSwitch";
import type { Profile } from "@/lib/types";

function initials(name: string | null, email: string | null) {
  const base = (name || email || "A").trim();
  const parts = base.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "A";
}

const NAV = [
  { href: "/admin/users", label: "Users", icon: "ti-users", group: "Manage" },
  { href: "/admin/prompts", label: "Prompts", icon: "ti-prompt", group: "Manage" },
  { href: "/admin/log", label: "Generation log", icon: "ti-activity", group: "Monitor" },
];

const TITLES: Record<string, string> = {
  "/admin/users": "Users",
  "/admin/prompts": "Prompt management",
  "/admin/log": "Generation log",
};

export function AdminChrome({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <PortalSwitch isAdmin={true} />
      <div className="portal active">
        <nav className="sidebar">
          <div className="s-logo">
            <div className="logo-row">
              <LogoMark admin />
              <div className="logo-wordmark">
                <div className="logo-name">Admin portal</div>
                <div className="logo-tagline">Manage &amp; configure</div>
              </div>
            </div>
          </div>

          {["Manage", "Monitor"].map((group) => (
            <div className="nav-section" key={group}>
              <div className="nav-label">{group}</div>
              {NAV.filter((n) => n.group === group).map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`nav-item${pathname === n.href ? " active-admin" : ""}`}
                >
                  <i className={`ti ${n.icon}`} /> {n.label}
                </Link>
              ))}
            </div>
          ))}

          <div className="s-footer">
            <div className="user-row" onClick={signOut} title="Sign out">
              <div className="avatar av-admin">{initials(profile.name, profile.email)}</div>
              <div>
                <div className="u-name">{profile.name ?? profile.email}</div>
                <div className="u-role">Administrator · sign out</div>
              </div>
            </div>
          </div>
        </nav>

        <div className="main">
          <div className="topbar">
            <span className="tb-title">{TITLES[pathname] ?? "Admin"}</span>
            <span
              style={{
                fontSize: 11,
                background: "var(--plav-dk)",
                color: "var(--plav)",
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              Admin
            </span>
          </div>
          <div className="content">{children}</div>
        </div>
      </div>
    </>
  );
}
