"use client";

import { useState } from "react";
import type { Prompt } from "@/lib/types";

// Badge style + label per function key (kept tiny + local to avoid pulling the
// server registry/zod into the client bundle).
const META: Record<string, { badge: string; num: number }> = {
  fn1: { badge: "b-blue", num: 1 },
  fn2: { badge: "b-mint", num: 2 },
  fn3: { badge: "b-lav", num: 3 },
};

export function PromptsManager({ initial }: { initial: Prompt[] }) {
  const [prompts, setPrompts] = useState<Prompt[]>(initial);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  function startEdit(p: Prompt) {
    setEditingKey(p.function_key);
    setDraft(p.system_prompt);
  }

  async function save(p: Prompt) {
    setBusy(true);
    const res = await fetch("/api/prompts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ function_key: p.function_key, system_prompt: draft }),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok && data.prompt) {
      setPrompts((list) => list.map((x) => (x.function_key === p.function_key ? data.prompt : x)));
      setEditingKey(null);
    }
  }

  return (
    <>
      <div className="page-hd">
        <h1>Prompt management</h1>
        <p>Edit the AI system prompt for each function. Changes apply immediately to all users.</p>
      </div>

      <div className="card">
        {prompts.map((p) => {
          const meta = META[p.function_key] ?? { badge: "b-dim", num: 0 };
          const editing = editingKey === p.function_key;
          return (
            <div className="prompt-row" key={p.function_key}>
              <div className="pr-name">
                <span className={`badge ${meta.badge}`} style={{ marginRight: 7 }}>
                  Function {meta.num}
                </span>
                {p.name}
              </div>
              <div className="pr-preview">{p.system_prompt}</div>
              <div className="pr-meta">
                Version <strong>v{p.version}</strong> &nbsp;·&nbsp;{" "}
                <a onClick={() => (editing ? setEditingKey(null) : startEdit(p))}>
                  {editing ? "Close" : "Edit prompt"}
                </a>
              </div>

              {editing && (
                <div className="pr-edit-area open">
                  <textarea
                    className="fi"
                    rows={10}
                    style={{ marginTop: 8, fontFamily: "monospace", fontSize: 11 }}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: 7, marginTop: 8 }}>
                    <button className="btn btn-admin btn-sm" onClick={() => save(p)} disabled={busy}>
                      <i className="ti ti-device-floppy" /> {busy ? "Saving…" : "Save"}
                    </button>
                    <button className="btn btn-sm" onClick={() => setEditingKey(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
