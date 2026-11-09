"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthControls({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const client = supabase;
    async function syncUser() {
      const { data } = await client.auth.getUser();
      setSignedIn(Boolean(data.user));
      if (!data.user) { setIsAdmin(false); return; }
      const { data: profile } = await client.from("profiles").select("role").eq("id", data.user.id).single();
      setIsAdmin(profile?.role === "admin");
    }
    void syncUser();
    const { data: listener } = client.auth.onAuthStateChange(() => { void syncUser(); });
    return () => listener.subscription.unsubscribe();
  }, []);
  async function signOut() { const supabase = getSupabaseBrowserClient(); await supabase?.auth.signOut(); onNavigate?.(); router.replace("/"); router.refresh(); }
  if (!signedIn) return <Link className={mobile ? "rounded-lg px-3 py-3 hover:bg-[var(--must-navy-pale)]" : "transition hover:text-[var(--must-green-deep)]"} href="/login" onClick={onNavigate}>Sign in</Link>;
  return <><Link className={mobile ? "rounded-lg px-3 py-3 hover:bg-[var(--must-navy-pale)]" : "transition hover:text-[var(--must-green-deep)]"} href="/dashboard" onClick={onNavigate}>Dashboard</Link>{isAdmin && <Link className={mobile ? "rounded-lg px-3 py-3 hover:bg-[var(--must-navy-pale)]" : "transition hover:text-[var(--must-green-deep)]"} href="/admin" onClick={onNavigate}>Admin</Link>}<button type="button" onClick={signOut} className={mobile ? "rounded-lg px-3 py-3 text-left hover:bg-[var(--must-navy-pale)]" : "transition hover:text-[var(--must-green-deep)]"}>Log out</button></>;
}
