"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function PasswordResetForm({ reset }: { reset?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    setBusy(true); setMessage("");
    const result = reset ? await supabase.auth.updateUser({ password }) : await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (reset) { router.replace("/dashboard"); router.refresh(); } else setMessage("Check your email for a password reset link.");
  }
  return <section className="panel mx-auto max-w-md"><h1 className="text-2xl">{reset ? "Choose a new password" : "Reset your password"}</h1>{!isSupabaseConfigured() ? <p className="diagnostic mt-5">Supabase has not been configured for this deployment yet.</p> : <form className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm font-bold">{reset ? "New password" : "Email"}<input required type={reset ? "password" : "email"} minLength={reset ? 6 : undefined} autoComplete={reset ? "new-password" : "email"} value={reset ? password : email} onChange={event => reset ? setPassword(event.target.value) : setEmail(event.target.value)} className="mt-2" /></label><button disabled={busy} className="action w-full">{busy ? "Please wait…" : reset ? "Update password" : "Send reset link"}</button></form>}{message && <p role="status" className="mt-4 text-sm text-emerald-200">{message}</p>}</section>;
}
