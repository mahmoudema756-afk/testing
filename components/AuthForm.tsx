"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const next = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/dashboard";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true); setMessage("");
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}` } });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (mode === "signup" && !result.data.session) { setMessage("Check your email to confirm your account, then sign in."); return; }
    router.replace(next);
    router.refresh();
  }

  const configured = isSupabaseConfigured();
  return <section className="surface mx-auto max-w-md rounded-2xl border border-[var(--must-line)] bg-white p-6"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--must-green-deep)]">Student access</p><h1 className="mt-3 text-2xl font-black text-[var(--must-navy-deep)]">{mode === "login" ? "Welcome back" : "Create your account"}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{mode === "login" ? "Sign in to submit materials and access your dashboard." : "Confirm your email before accessing protected features."}</p>{!configured ? <p className="mt-5 rounded-xl border border-[var(--must-green)]/25 bg-[var(--must-green-pale)] p-3 text-sm text-[var(--must-navy-deep)]">Supabase has not been configured for this deployment yet.</p> : <form className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm font-bold text-[var(--must-navy-deep)]">Email<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--must-line)] px-3 outline-none focus:border-[var(--must-green)] focus:ring-3 focus:ring-[var(--must-green-pale)]" /></label><label className="block text-sm font-bold text-[var(--must-navy-deep)]">Password<input required minLength={6} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={event => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--must-line)] px-3 outline-none focus:border-[var(--must-green)] focus:ring-3 focus:ring-[var(--must-green-pale)]" /></label><button disabled={busy} className="w-full rounded-lg bg-[var(--must-navy)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--must-green-deep)] disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button></form>}<div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-[var(--must-navy)] underline decoration-[var(--must-green)] underline-offset-4">{mode === "login" ? <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link> : <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in instead</Link>}<Link href="/forgot-password">Forgot password?</Link></div>{message && <p role="status" className="mt-4 text-sm text-[var(--must-green-deep)]">{message}</p>}</section>;
}
