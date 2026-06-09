"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
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
            <div className="auth-title">Welcome back</div>
          </div>
        </div>
        <div className="auth-sub">Sign in to your CreativeFlow AI workspace.</div>

        {err && <div className="auth-err">{err}</div>}

        <form className="form-stack" onSubmit={submit}>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button className="btn btn-primary" style={{ justifyContent: "center" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="auth-foot">
          No account? <Link href="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
