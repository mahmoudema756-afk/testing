"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthControls } from "./AuthControls";
import { BrandMark } from "./BrandMark";

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <header className="glass-nav sticky top-4 z-30 mx-auto w-[min(1180px,calc(100%-28px))] rounded-2xl backdrop-blur-xl"><div className="shell flex h-18 items-center justify-between gap-4"><Link href="/" className="flex items-center gap-3" onClick={close}><BrandMark/><span><b className="block text-sm tracking-tight text-white">MUST CS Materials Hub</b><small className="text-xs text-slate-300">Independent student platform</small></span></Link><nav className="hidden items-center gap-7 text-sm font-semibold text-slate-200 md:flex" aria-label="Primary navigation"><Link className="transition hover:text-cyan-200" href="/#courses">Courses</Link><AuthControls/><a className="transition hover:text-cyan-200" href="#about">About</a><Link href="/submit" className="action !m-0 !min-h-0 !px-4 !py-2">Submit material</Link></nav><button type="button" aria-expanded={open} aria-controls="mobile-menu" className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 text-white md:hidden" onClick={() => setOpen(!open)}><span className="sr-only">Toggle navigation</span><span className="text-xl leading-none">{open ? "×" : "☰"}</span></button></div>{open && <div id="mobile-menu" className="border-t border-white/15 px-5 pb-5 pt-3 md:hidden"><nav className="shell grid gap-1 text-sm font-semibold text-slate-100" aria-label="Mobile navigation"><Link className="rounded-lg px-3 py-3 hover:bg-white/10" href="/#courses" onClick={close}>Courses</Link><AuthControls mobile onNavigate={close}/><a className="rounded-lg px-3 py-3 hover:bg-white/10" href="#about" onClick={close}>About</a><Link href="/submit" onClick={close} className="action">Submit material</Link></nav></div>}</header>;
}
