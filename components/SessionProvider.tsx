"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { Fn1Output } from "@/lib/functions/fn1";
import type { Fn2Output } from "@/lib/functions/fn2";
import type { Fn3Output } from "@/lib/functions/fn3";
import type { SessionRow, GenerationRow } from "@/lib/types";

interface Fields {
  company: string;
  product: string;
  audience: string;
  offer: string;
  objective: string;
  context: string;
}

interface Working {
  sessionId: string | null;
  fields: Fields;
  angles: { name: string; description: string }[];
  painPoints: string[];
  desires: string[];
  objections: string[];
  selectedAngle: string | null;
  selectedAngleDesc: string;
  primaryTexts: string[];
  headlines: string[];
  ctas: string[];
  selectedPrimary: string | null;
  brief: Fn3Output | null;
}

const emptyFields: Fields = {
  company: "",
  product: "",
  audience: "",
  offer: "",
  objective: "Lead generation",
  context: "",
};

const emptyWorking: Working = {
  sessionId: null,
  fields: { ...emptyFields },
  angles: [],
  painPoints: [],
  desires: [],
  objections: [],
  selectedAngle: null,
  selectedAngleDesc: "",
  primaryTexts: [],
  headlines: [],
  ctas: [],
  selectedPrimary: null,
  brief: null,
};

interface Ctx extends Working {
  creditsUsed: number;
  creditLimit: number | null;
  setField: (name: keyof Fields, value: string) => void;
  setSessionId: (id: string) => void;
  setCredits: (used: number, limit: number | null) => void;
  applyFn1: (out: Fn1Output) => void;
  applyFn2: (out: Fn2Output) => void;
  applyFn3: (out: Fn3Output) => void;
  selectAngle: (name: string, desc: string) => void;
  selectPrimary: (text: string) => void;
  loadSession: (session: SessionRow, generations: GenerationRow[]) => void;
  reset: () => void;
}

const SessionContext = createContext<Ctx | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

export function SessionProvider({
  children,
  initialCreditsUsed,
  initialCreditLimit,
}: {
  children: React.ReactNode;
  initialCreditsUsed: number;
  initialCreditLimit: number | null;
}) {
  const [w, setW] = useState<Working>(emptyWorking);
  const [creditsUsed, setCreditsUsed] = useState(initialCreditsUsed);
  const [creditLimit, setCreditLimit] = useState<number | null>(initialCreditLimit);

  const setField = useCallback((name: keyof Fields, value: string) => {
    setW((p) => ({ ...p, fields: { ...p.fields, [name]: value } }));
  }, []);

  const setSessionId = useCallback((id: string) => {
    setW((p) => ({ ...p, sessionId: id }));
  }, []);

  const setCredits = useCallback((used: number, limit: number | null) => {
    setCreditsUsed(used);
    setCreditLimit(limit);
  }, []);

  const applyFn1 = useCallback((out: Fn1Output) => {
    setW((p) => ({
      ...p,
      angles: out.angles,
      painPoints: out.pain_points,
      desires: out.desires,
      objections: out.objections,
      selectedAngle: out.angles[0]?.name ?? null,
      selectedAngleDesc: out.angles[0]?.description ?? "",
    }));
  }, []);

  const applyFn2 = useCallback((out: Fn2Output) => {
    setW((p) => ({
      ...p,
      primaryTexts: out.primary_texts,
      headlines: out.headlines,
      ctas: out.ctas,
      selectedPrimary: out.primary_texts[0] ?? null,
    }));
  }, []);

  const applyFn3 = useCallback((out: Fn3Output) => {
    setW((p) => ({ ...p, brief: out }));
  }, []);

  const selectAngle = useCallback((name: string, desc: string) => {
    setW((p) => ({ ...p, selectedAngle: name, selectedAngleDesc: desc }));
  }, []);

  const selectPrimary = useCallback((text: string) => {
    setW((p) => ({ ...p, selectedPrimary: text }));
  }, []);

  const loadSession = useCallback(
    (session: SessionRow, generations: GenerationRow[]) => {
      const latest = (key: string) =>
        [...generations].reverse().find((g) => g.function_key === key)?.output ??
        null;
      const f1 = latest("fn1") as Fn1Output | null;
      const f2 = latest("fn2") as Fn2Output | null;
      const f3 = latest("fn3") as Fn3Output | null;

      setW({
        sessionId: session.id,
        fields: {
          company: session.company ?? "",
          product: session.product ?? "",
          audience: session.audience ?? "",
          offer: session.offer ?? "",
          objective: session.objective ?? "Lead generation",
          context: session.context ?? "",
        },
        angles: f1?.angles ?? [],
        painPoints: f1?.pain_points ?? [],
        desires: f1?.desires ?? [],
        objections: f1?.objections ?? [],
        selectedAngle:
          session.selected_angle ?? f1?.angles[0]?.name ?? null,
        selectedAngleDesc:
          f1?.angles.find((a) => a.name === session.selected_angle)
            ?.description ??
          f1?.angles[0]?.description ??
          "",
        primaryTexts: f2?.primary_texts ?? [],
        headlines: f2?.headlines ?? [],
        ctas: f2?.ctas ?? [],
        selectedPrimary:
          session.selected_primary ?? f2?.primary_texts[0] ?? null,
        brief: f3,
      });
    },
    [],
  );

  const reset = useCallback(() => setW(emptyWorking), []);

  const value: Ctx = {
    ...w,
    creditsUsed,
    creditLimit,
    setField,
    setSessionId,
    setCredits,
    applyFn1,
    applyFn2,
    applyFn3,
    selectAngle,
    selectPrimary,
    loadSession,
    reset,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
