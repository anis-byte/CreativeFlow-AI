"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/components/SessionProvider";
import { LogoMark } from "@/components/ui";
import { PortalSwitch } from "@/components/PortalSwitch";
import type { FunctionMeta } from "@/lib/functions/registry";
import type { Profile } from "@/lib/types";

function initials(name: string | null, email: string | null) {
  const base = (name || email || "U").trim();
  const parts = base.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

export function ClientChrome({
  profile,
  functions,
  children,
}: {
  profile: Profile;
  functions: FunctionMeta[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { creditsUsed, creditLimit, reset } = useSession();

  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/history": "Generation history",
  };
  functions.forEach((f) => (titles[`/fn/${f.key}`] = f.title));
  const title = titles[pathname] ?? "CreativeFlow AI";

  const remaining =
    creditLimit === null ? null : Math.max(0, creditLimit - creditsUsed);
  const fillPct =
    creditLimit && creditLimit > 0
      ? Math.min(100, Math.round((creditsUsed / creditLimit) * 100))
      : 0;

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function newCampaign() {
    reset();
    router.push("/fn/fn1");
  }

  const navActive = (href: string) =>
    pathname === href ? " active" : "";

  return (
    <>
      <PortalSwitch isAdmin={profile.role === "admin"} />
      <div className="portal active">
        <nav className="sidebar">
          <div className="s-logo">
            <div className="logo-row">
              <LogoMark />
              <div className="logo-wordmark">
                <div className="logo-name">Client portal</div>
                <div className="logo-tagline">Marketing workspace</div>
              </div>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-label">Workspace</div>
            <Link className={`nav-item${navActive("/dashboard")}`} href="/dashboard">
              <i className="ti ti-layout-dashboard" /> Dashboard
            </Link>
            {functions.map((f) => (
              <Link
                key={f.key}
                className={`nav-item${navActive(`/fn/${f.key}`)}`}
                href={`/fn/${f.key}`}
              >
                <i className={`ti ${f.navIcon}`} /> {f.navLabel}
              </Link>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-label">Records</div>
            <Link className={`nav-item${navActive("/history")}`} href="/history">
              <i className="ti ti-history" /> History
            </Link>
          </div>

          <div className="credit-bar">
            <div className="cb-top">
              <span className="cb-label">Monthly credits</span>
              <span className="cb-plan">{creditLimit === null ? "Unlimited" : "Pro plan"}</span>
            </div>
            <div className="cb-track">
              <div className="cb-fill" style={{ width: `${fillPct}%` }} />
            </div>
            <div className="cb-nums">
              <strong>{creditsUsed}</strong>
              {creditLimit === null ? " used" : ` / ${creditLimit}`}
              {remaining !== null && (
                <>
                  {" "}
                  ·  <strong>{remaining}</strong> left
                </>
              )}
            </div>
          </div>

          <div className="s-footer">
            <div className="user-row" onClick={signOut} title="Sign out">
              <div className="avatar">{initials(profile.name, profile.email)}</div>
              <div>
                <div className="u-name">{profile.name ?? profile.email}</div>
                <div className="u-role">
                  {profile.role === "admin" ? "Admin" : "User"} · sign out
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="main">
          <div className="topbar">
            <span className="tb-title">{title}</span>
            <button className="btn btn-icon btn-sm" aria-label="Notifications">
              <i className="ti ti-bell" />
            </button>
            <button className="btn btn-primary btn-sm" onClick={newCampaign}>
              <i className="ti ti-plus" /> New campaign
            </button>
          </div>
          <div className="content">{children}</div>
        </div>
      </div>
    </>
  );
}
