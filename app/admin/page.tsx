import { AdminModeration } from "@/components/AdminModeration";
import { Header } from "@/components/Header";
import { requireUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function AdminPage() { const { user, supabase } = await requireUser("/admin"); const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single(); if (profile?.role !== "admin") redirect("/dashboard?error=admin"); return <><Header/><main className="shell py-14 sm:py-20"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--must-green-deep)]">Moderation</p><h1 className="mt-3 text-3xl font-black text-[var(--must-navy-deep)]">Review material submissions</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Approve a material to make it available through the protected download policy. Rejected materials remain private.</p><div className="mt-8"><AdminModeration/></div></main></>; }
