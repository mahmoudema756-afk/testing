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
  const nextParam = searchParams.get("next");
  const next = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

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
  return <section className="panel mx-auto max-w-md"><p className="eyebrow">Student access</p><h1 className="mt-3 text-2xl">{mode === "login" ? "Welcome back" : "Create your account"}</h1><p className="mt-2 text-sm">{mode === "login" ? "Sign in to submit materials and access your dashboard." : "Confirm your email before accessing protected features."}</p>{!configured ? <p className="diagnostic mt-5">Supabase has not been configured for this deployment yet.</p> : <form className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm font-bold">Email<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2" /></label><label className="block text-sm font-bold">Password<input required minLength={6} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={event => setPassword(event.target.value)} className="mt-2" /></label><button disabled={busy} className="action w-full">{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button></form>}<div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-cyan-100 underline decoration-emerald-300 underline-offset-4">{mode === "login" ? <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link> : <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in instead</Link>}<Link href="/forgot-password">Forgot password?</Link></div>{message && <p role="status" className="mt-4 text-sm text-emerald-200">{message}</p>}</section>;
}
