"use client";

import { useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthPanel() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = isSupabaseConfigured();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true); setMessage("");
    const result = mode === "sign-in" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    setBusy(false);
    setMessage(result.error ? result.error.message : mode === "sign-up" ? "Check your email to confirm your account." : "Signed in. You can now submit materials.");
  }

  return <section className="surface mx-auto max-w-md rounded-2xl border border-[var(--must-line)] bg-white p-6"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--must-green-deep)]">Student access</p><h1 className="mt-3 text-2xl font-black text-[var(--must-navy-deep)]">{mode === "sign-in" ? "Sign in to contribute" : "Create your account"}</h1><p className="mt-2 text-sm leading-6 text-slate-500">Your account is used to submit and track materials. Submitted files are reviewed before anyone else can access them.</p>{!configured ? <p className="mt-5 rounded-xl border border-[var(--must-green)]/25 bg-[var(--must-green-pale)] p-3 text-sm text-[var(--must-navy-deep)]">Supabase has not been configured for this deployment yet.</p> : <form className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm font-bold text-[var(--must-navy-deep)]">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--must-line)] px-3 outline-none focus:border-[var(--must-green)] focus:ring-3 focus:ring-[var(--must-green-pale)]" /></label><label className="block text-sm font-bold text-[var(--must-navy-deep)]">Password<input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--must-line)] px-3 outline-none focus:border-[var(--must-green)] focus:ring-3 focus:ring-[var(--must-green-pale)]" /></label><button disabled={busy} className="w-full rounded-lg bg-[var(--must-navy)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--must-green-deep)] disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}</button></form>}<button type="button" onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setMessage(""); }} className="mt-4 text-sm font-bold text-[var(--must-navy)] underline decoration-[var(--must-green)] underline-offset-4">{mode === "sign-in" ? "New here? Create an account" : "Already have an account? Sign in"}</button>{message && <p role="status" className="mt-4 text-sm text-[var(--must-green-deep)]">{message}</p>}</section>;
}
