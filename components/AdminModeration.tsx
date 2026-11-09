"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Material } from "@/lib/supabase/types";
type MaterialRow = Material & { courses: { code: string; title: string }[] | null };

export function AdminModeration() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [items, setItems] = useState<MaterialRow[]>([]);
  const [message, setMessage] = useState("");
  async function load() { const supabase = getSupabaseBrowserClient(); if (!supabase) return; const { data: auth } = await supabase.auth.getUser(); if (!auth.user) { setAuthorized(false); return; } const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single(); if (profile?.role !== "admin") { setAuthorized(false); return; } setAuthorized(true); const { data, error } = await supabase.from("materials").select("id,title,description,resource_type,status,storage_path,original_filename,created_at,course_id,courses(code,title)").eq("status", "pending").order("created_at", { ascending: true }); if (error) setMessage(error.message); else setItems((data ?? []) as MaterialRow[]); }
  // The asynchronous Supabase session query synchronizes external auth state on first render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isSupabaseConfigured()) void load(); }, []);
  async function review(item: MaterialRow, status: "approved" | "rejected") { const supabase = getSupabaseBrowserClient(); if (!supabase) return; const { data: auth } = await supabase.auth.getUser(); if (!auth.user) return; const { error } = await supabase.from("materials").update({ status, reviewed_by: auth.user.id, reviewed_at: new Date().toISOString() }).eq("id", item.id); if (error) { setMessage(error.message); return; } setItems(current => current.filter(material => material.id !== item.id)); setMessage(`${item.title} was ${status}.`); }
  if (!isSupabaseConfigured()) return <p className="rounded-xl border border-[var(--must-green)]/25 bg-[var(--must-green-pale)] p-4 text-sm text-[var(--must-navy-deep)]">Configure Supabase to use moderation.</p>;
  if (authorized === null) return <p className="text-sm text-slate-500">Checking administrator access…</p>;
  if (!authorized) return <p className="rounded-xl border border-[var(--must-line)] bg-white p-4 text-sm text-slate-600">Administrator access is required for this page.</p>;
  return <div className="space-y-4">{message && <p role="status" className="text-sm text-[var(--must-green-deep)]">{message}</p>}{items.length ? items.map(item => <article key={item.id} className="surface rounded-2xl border border-[var(--must-line)] bg-white p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-xs font-bold uppercase tracking-wider text-[var(--must-green-deep)]">{item.courses?.[0]?.code ?? "Course"} · {item.resource_type}</p><h2 className="mt-2 text-lg font-black text-[var(--must-navy-deep)]">{item.title}</h2><p className="mt-1 text-sm text-slate-500">{item.original_filename}</p></div><div className="flex gap-2 self-start"><button type="button" onClick={() => review(item, "approved")} className="rounded-lg bg-[var(--must-green)] px-3 py-2 text-sm font-bold text-white hover:bg-[var(--must-green-deep)]">Approve</button><button type="button" onClick={() => review(item, "rejected")} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">Reject</button></div></div></article>) : <div className="rounded-2xl border border-dashed border-[var(--must-line)] bg-white p-10 text-center text-sm text-slate-500">There are no materials waiting for review.</div>}</div>;
}
