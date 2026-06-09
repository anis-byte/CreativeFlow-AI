/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FunctionDef } from "@/lib/functions/types";
import { fn1 } from "@/lib/functions/fn1";
import { fn2 } from "@/lib/functions/fn2";
import { fn3 } from "@/lib/functions/fn3";

// Output type varies per function; `any` here only erases the generic so the
// differently-typed defs can share one collection. Each def stays fully typed.
type AnyFunctionDef = FunctionDef<any>;

// The chain, in order. Add a new function here and it appears in the sidebar,
// gets a generate endpoint, and joins the step bar — no other wiring needed.
export const FUNCTIONS: AnyFunctionDef[] = [fn1, fn2, fn3];

export const FUNCTION_BY_KEY: Record<string, AnyFunctionDef> =
  Object.fromEntries(FUNCTIONS.map((f) => [f.key, f]));

export function getFunction(key: string): AnyFunctionDef | undefined {
  return FUNCTION_BY_KEY[key];
}

// Lightweight metadata safe to send to client components (no zod/functions).
export interface FunctionMeta {
  key: string;
  step: number;
  navLabel: string;
  badgeLabel: string;
  navIcon: string;
  iconClass: string;
  badgeClass: string;
  title: string;
  subtitle: string;
}

export const FUNCTION_META: FunctionMeta[] = FUNCTIONS.map((f) => ({
  key: f.key,
  step: f.step,
  navLabel: f.navLabel,
  badgeLabel: f.badgeLabel,
  navIcon: f.navIcon,
  iconClass: f.iconClass,
  badgeClass: f.badgeClass,
  title: f.title,
  subtitle: f.subtitle,
}));
