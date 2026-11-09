import Link from "next/link";
import { Header } from "@/components/Header";
import { requireUser } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { user, supabase } = await requireUser("/dashboard");
  const { data: profile } = await supabase.from("profiles").select("full_name,role").eq("id", user.id).single();
  return <><Header/><main className="shell py-14 sm:py-20"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--must-green-deep)]">Your account</p><h1 className="mt-3 text-3xl font-black text-[var(--must-navy-deep)]">Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Use your account to submit study materials and follow their review status.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/submit" className="rounded-lg bg-[var(--must-green)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--must-green-deep)]">Submit material</Link>{profile?.role === "admin" && <Link href="/admin" className="rounded-lg border border-[var(--must-line)] px-4 py-3 text-sm font-bold text-[var(--must-navy)] hover:bg-[var(--must-navy-pale)]">Open moderation</Link>}</div></main></>;
}
