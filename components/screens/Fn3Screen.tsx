"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/components/SessionProvider";
import { StepBar } from "@/components/StepBar";
import { EmptyCard, Loading, CopyButton } from "@/components/ui";

const FORMATS = ["Video ad (15–30s)", "Static image", "Carousel", "Story / Reel"];
const STYLES = ["Modern & clean", "Bold & energetic", "Minimal"];
const AI_FORMATS = ["Midjourney", "Ideogram", "Flux", "None"];

export function Fn3Screen() {
  const s = useSession();
  const [primary, setPrimary] = useState(s.selectedPrimary ?? s.primaryTexts[0] ?? "");
  const [format, setFormat] = useState(FORMATS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [aiFormat, setAiFormat] = useState(AI_FORMATS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPrimary = s.primaryTexts.length > 0;
  const brief = s.brief;

  async function run() {
    if (!s.selectedAngle) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        functionKey: "fn3",
        sessionId: s.sessionId,
        inputs: {
          angle: s.selectedAngle,
          selected_primary: primary,
          format,
          visual_style: style,
          ai_format: aiFormat,
        },
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Generation failed");
      return;
    }
    s.setSessionId(data.sessionId);
    s.setCredits(data.creditsUsed, data.creditLimit);
    s.selectPrimary(primary);
    s.applyFn3(data.output);
  }

  const copyAll = brief
    ? [
        `Hook: ${brief.hook}`,
        `Visual concept: ${brief.visual_concept}`,
        "Scene breakdown:",
        ...brief.scene_breakdown.map((sc) => `  ${sc.timestamp} — ${sc.description}`),
        aiFormat !== "None" ? `AI image prompt (${aiFormat}): ${brief.ai_image_prompt}` : "",
        `Designer notes:\n${brief.designer_notes}`,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return (
    <>
      <div className="page-hd">
        <h1>Creative brief generator</h1>
        <p>A production-ready brief for your designer or video editor, including an AI image prompt.</p>
      </div>
      <StepBar current={3} />
      {s.selectedAngle && (
        <div className="carry-banner">
          <i className="ti ti-link" />
          <span>Carried from Steps 1 &amp; 2 — angle locked, pick your primary text below</span>
        </div>
      )}
      <div className="two-col">
        <div className="card">
          <div className="card-hd">Brief configuration</div>
          <div className="form-stack">
            <div className="fg">
              <label>
                Locked angle <span style={{ color: "var(--txt3)", fontSize: 10 }}>(from Step 1)</span>
              </label>
              <input className="fi" readOnly value={s.selectedAngle ?? ""} />
            </div>
            <div className="fg">
              <label>
                Select primary text <span style={{ color: "var(--txt3)", fontSize: 10 }}>(from Step 2)</span>
              </label>
              {hasPrimary ? (
                <select className="fi" value={primary} onChange={(e) => setPrimary(e.target.value)}>
                  {s.primaryTexts.map((t, i) => (
                    <option key={i} value={t}>
                      {t.length > 80 ? t.slice(0, 80) + "…" : t}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ fontSize: 11, color: "var(--txt2)" }}>
                  No copy yet — <Link href="/fn/fn2" style={{ color: "var(--pblue)" }}>generate ads copy first</Link>.
                </div>
              )}
            </div>
            <Pills label="Format" options={FORMATS} value={format} onChange={setFormat} />
            <Pills label="Visual style" options={STYLES} value={style} onChange={setStyle} />
            <div className="fg">
              <label>AI image prompt format</label>
              <select className="fi" value={aiFormat} onChange={(e) => setAiFormat(e.target.value)}>
                {AI_FORMATS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="auth-err" style={{ marginTop: 12 }}>{error}</div>}
          <div className="divider" />
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={run}
            disabled={loading || !s.selectedAngle}
          >
            <i className="ti ti-sparkles" /> {loading ? "Writing brief…" : "Generate brief"}
          </button>
        </div>

        {loading ? (
          <Loading label="Writing brief…" />
        ) : !brief ? (
          <EmptyCard icon="ti-file-description" title="No output yet" sub="Select format and generate." />
        ) : (
          <div>
            <div className="out-panel">
              <div className="op-hd">
                <span className="op-title">Hook</span>
                <CopyButton text={brief.hook} />
              </div>
              <div style={{ fontSize: 12, color: "var(--txt1)", padding: "5px 0", lineHeight: 1.6 }}>{brief.hook}</div>
            </div>
            <div className="out-panel">
              <div className="op-hd">
                <span className="op-title">Visual concept</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--txt1)", padding: "5px 0", lineHeight: 1.6 }}>{brief.visual_concept}</div>
            </div>
            <div className="out-panel">
              <div className="op-title" style={{ marginBottom: 7 }}>Scene breakdown</div>
              {brief.scene_breakdown.map((sc, i) => (
                <div className="out-row" key={i}>
                  <span className="out-ts">{sc.timestamp}</span>
                  <span>{sc.description}</span>
                </div>
              ))}
            </div>
            {aiFormat !== "None" && (
              <div className="out-panel">
                <div className="op-hd">
                  <span className="op-title">AI image prompt ({aiFormat})</span>
                  <CopyButton text={brief.ai_image_prompt} />
                </div>
                <div style={{ fontSize: 11, color: "var(--txt2)", padding: "5px 0", lineHeight: 1.65, fontFamily: "monospace" }}>
                  {brief.ai_image_prompt}
                </div>
              </div>
            )}
            <div className="out-panel">
              <div className="op-title" style={{ marginBottom: 7 }}>Designer notes</div>
              <div style={{ fontSize: 11, color: "var(--txt2)", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {brief.designer_notes}
              </div>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <CopyButton text={copyAll} small={false} />
              <span style={{ fontSize: 11, color: "var(--txt3)", alignSelf: "center" }}>
                Saved to history automatically
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Pills({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="fg">
      <label>{label}</label>
      <div className="pill-row">
        {options.map((o) => (
          <span key={o} className={`pill${value === o ? " sel" : ""}`} onClick={() => onChange(o)}>
            {o}
          </span>
        ))}
      </div>
    </div>
  );
}
