"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }
    setPassword("");
    setConfirm("");
    setOk("Password updated. Use your new password next time you sign in.");
  }

  return (
    <>
      <div className="page-hd">
        <h1>Account settings</h1>
        <p>Update the password for your CreativeFlow AI account.</p>
      </div>

      <div className="card" style={{ maxWidth: 460 }}>
        <span className="card-hd">Change password</span>

        {err && <div className="auth-err">{err}</div>}
        {ok && <div className="auth-ok">{ok}</div>}

        <form className="form-stack" onSubmit={submit}>
          <div className="fg">
            <label>New password</label>
            <input
              className="fi"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>
          <div className="fg">
            <label>Confirm new password</label>
            <input
              className="fi"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? "Saving…" : "Update password"}
          </button>
        </form>
      </div>
    </>
  );
}
