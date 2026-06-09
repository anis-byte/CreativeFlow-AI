"use client";

import { useState } from "react";
import type { Profile, Role, UserStatus } from "@/lib/types";

const LIMIT_OPTIONS: { label: string; value: number | null }[] = [
  { label: "100 credits", value: 100 },
  { label: "200 credits", value: 200 },
  { label: "500 credits", value: 500 },
  { label: "Unlimited", value: null },
];

function initials(name: string | null, email: string | null) {
  const base = (name || email || "U").trim().split(/\s+/);
  return ((base[0]?.[0] ?? "") + (base[1]?.[0] ?? "")).toUpperCase() || "U";
}

const statusBadge = (s: UserStatus) =>
  s === "active" ? "b-success" : s === "invited" ? "b-warn" : "b-danger";

export function UsersManager({ initial }: { initial: Profile[] }) {
  const [users, setUsers] = useState<Profile[]>(initial);
  const [showInvite, setShowInvite] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Invite form
  const [iName, setIName] = useState("");
  const [iEmail, setIEmail] = useState("");
  const [iLimit, setILimit] = useState<number | null>(500);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function invite() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: iName, email: iEmail, credit_limit: iLimit }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Invite failed");
      return;
    }
    setUsers((u) => [...u, data.profile]);
    setShowInvite(false);
    setIName("");
    setIEmail("");
    setNotice(
      `Invited ${data.profile.email}. Temporary password: ${data.tempPassword} — share it so they can sign in (then change it).`,
    );
  }

  async function patch(id: string, fields: Partial<Profile>) {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...fields }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((u) => u.map((x) => (x.id === id ? data.profile : x)));
    }
  }

  return (
    <>
      <div className="page-hd">
        <h1>Users</h1>
        <p>Manage who has access to the client portal and their roles.</p>
      </div>

      {notice && (
        <div className="auth-ok" style={{ marginBottom: 10 }}>
          {notice}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="btn btn-admin btn-sm" onClick={() => setShowInvite((v) => !v)}>
          <i className="ti ti-user-plus" /> Invite user
        </button>
      </div>

      <div className="card">
        {users.map((u) => (
          <div key={u.id}>
            <div className="utr">
              <div className="avatar av-admin">{initials(u.name, u.email)}</div>
              <div className="utr-info">
                <div className="utr-name">{u.name ?? "—"}</div>
                <div className="utr-email">{u.email}</div>
              </div>
              <span className={`badge ${u.role === "admin" ? "b-rose" : "b-dim"}`}>
                {u.role === "admin" ? "Admin" : "User"}
              </span>
              <div className="utr-credits">
                {u.credit_limit === null ? "Unlimited" : `${u.credits_used} / ${u.credit_limit} cr`}
              </div>
              <span className={`badge ${statusBadge(u.status)}`}>
                {u.status[0].toUpperCase() + u.status.slice(1)}
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
                <button className="btn btn-sm" onClick={() => setEditingId(editingId === u.id ? null : u.id)}>
                  <i className="ti ti-edit" />
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: "var(--danger-bg)", color: "var(--danger)", borderColor: "var(--danger)" }}
                  title={u.status === "disabled" ? "Re-activate" : "Disable"}
                  onClick={() => patch(u.id, { status: u.status === "disabled" ? "active" : "disabled" })}
                >
                  <i className={`ti ${u.status === "disabled" ? "ti-user-check" : "ti-user-off"}`} />
                </button>
              </div>
            </div>

            {editingId === u.id && (
              <div style={{ padding: "10px 0 14px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div className="fg" style={{ minWidth: 130 }}>
                  <label>Role</label>
                  <select
                    className="fi"
                    defaultValue={u.role}
                    onChange={(e) => patch(u.id, { role: e.target.value as Role })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="fg" style={{ minWidth: 150 }}>
                  <label>Credit limit</label>
                  <select
                    className="fi"
                    defaultValue={String(u.credit_limit)}
                    onChange={(e) =>
                      patch(u.id, {
                        credit_limit: e.target.value === "null" ? null : Number(e.target.value),
                      })
                    }
                  >
                    {LIMIT_OPTIONS.map((o) => (
                      <option key={o.label} value={String(o.value)}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-sm" onClick={() => setEditingId(null)}>
                  Done
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showInvite && (
        <div className="modal-wrap">
          <div className="modal">
            <div className="modal-title">Invite new user</div>
            {err && <div className="auth-err">{err}</div>}
            <div className="form-stack">
              <div className="fg">
                <label>Full name</label>
                <input className="fi" value={iName} onChange={(e) => setIName(e.target.value)} placeholder="e.g. Sarah Ahmad" />
              </div>
              <div className="fg">
                <label>Email address</label>
                <input className="fi" type="email" value={iEmail} onChange={(e) => setIEmail(e.target.value)} placeholder="sarah@company.com" />
              </div>
              <div className="fg">
                <label>Credit limit / month</label>
                <select
                  className="fi"
                  value={String(iLimit)}
                  onChange={(e) => setILimit(e.target.value === "null" ? null : Number(e.target.value))}
                >
                  {LIMIT_OPTIONS.map((o) => (
                    <option key={o.label} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 7, marginTop: 14 }}>
              <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowInvite(false)}>
                Cancel
              </button>
              <button className="btn btn-admin" style={{ flex: 1, justifyContent: "center" }} onClick={invite} disabled={busy || !iEmail}>
                <i className="ti ti-send" /> {busy ? "Inviting…" : "Send invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
