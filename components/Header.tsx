"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthControls } from "./AuthControls";
import { BrandMark } from "./BrandMark";

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <header className="sticky top-0 z-30 border-b border-[var(--must-line)] bg-white/95 backdrop-blur"><div className="shell flex h-20 items-center justify-between gap-4"><Link href="/" className="flex items-center gap-3" onClick={close}><BrandMark/><span><b className="block text-sm tracking-tight text-[var(--must-navy-deep)]">MUST CS Materials Hub</b><small className="text-xs text-slate-500">Independent student platform</small></span></Link><nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex" aria-label="Primary navigation"><Link className="transition hover:text-[var(--must-green-deep)]" href="/#courses">Courses</Link><AuthControls/><a className="transition hover:text-[var(--must-green-deep)]" href="#about">About</a><Link href="/submit" className="rounded-lg border border-[var(--must-green)]/35 bg-[var(--must-green-pale)] px-4 py-2 text-sm font-bold text-[var(--must-navy-deep)] transition hover:-translate-y-0.5 hover:bg-[var(--must-green)] hover:text-white">Submit material</Link></nav><button type="button" aria-expanded={open} aria-controls="mobile-menu" className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--must-line)] text-[var(--must-navy)] md:hidden" onClick={() => setOpen(!open)}><span className="sr-only">Toggle navigation</span><span className="text-xl leading-none">{open ? "×" : "☰"}</span></button></div>{open && <div id="mobile-menu" className="border-t border-[var(--must-line)] bg-white px-5 pb-5 pt-3 md:hidden"><nav className="shell grid gap-1 text-sm font-semibold text-slate-700" aria-label="Mobile navigation"><Link className="rounded-lg px-3 py-3 hover:bg-[var(--must-navy-pale)]" href="/#courses" onClick={close}>Courses</Link><AuthControls mobile onNavigate={close}/><a className="rounded-lg px-3 py-3 hover:bg-[var(--must-navy-pale)]" href="#about" onClick={close}>About</a><Link href="/submit" onClick={close} className="mt-2 rounded-lg bg-[var(--must-navy)] px-3 py-3 text-left text-white transition hover:bg-[var(--must-green-deep)]">Submit material</Link></nav></div>}</header>;
}
