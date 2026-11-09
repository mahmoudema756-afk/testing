import { AuthForm } from "@/components/AuthForm";
import { Header } from "@/components/Header";
import { Suspense } from "react";
export default function LoginPage() { return <><Header/><main className="shell py-14 sm:py-20"><Suspense fallback={<p className="text-sm text-slate-500">Loading sign in…</p>}><AuthForm mode="login"/></Suspense></main></>; }
