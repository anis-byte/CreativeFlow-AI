"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    // If email confirmation is disabled, a session is returned immediately.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setOk(
        "Account created. Check your email to confirm, then sign in. (Tip: disable email confirmation in Supabase → Auth → Providers for instant access during development.)",
      );
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="logo-mark">
            <svg viewBox="0 0 18 18" fill="none">
              <path d="M3 9C3 5.7 5.7 3 9 3" stroke="#0e0e12" strokeWidth="2" strokeLinecap="round" />
              <path d="M9 3C12.3 3 15 5.7 15 9" stroke="#0e0e12" strokeWidth="2" strokeLinecap="round" />
              <path d="M15 9C15 12.3 12.3 15 9 15" stroke="#0e0e12" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="9" r="2" fill="#0e0e12" />
            </svg>
          </div>
          <div>
            <div className="auth-title">Create your account</div>
          </div>
        </div>
        <div className="auth-sub">
          The first account created becomes the workspace admin.
        </div>

        {err && <div className="auth-err">{err}</div>}
        {ok && <div className="auth-ok">{ok}</div>}

        <form className="form-stack" onSubmit={submit}>
          <div className="fg">
            <label>Full name</label>
            <input
              className="fi"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anis N."
            />
          </div>
          <div className="fg">
            <label>Email</label>
            <input
              className="fi"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <div className="fg">
            <label>Password</label>
            <input
              className="fi"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <button className="btn btn-primary" style={{ justifyContent: "center" }} disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="auth-foot">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
