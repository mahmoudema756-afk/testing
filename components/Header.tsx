"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "./BrandMark";

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur"><div className="shell flex h-20 items-center justify-between gap-4"><Link href="/" className="flex items-center gap-3" onClick={close}><BrandMark/><span><b className="block text-sm tracking-tight text-[#071d49]">MUST CS Materials Hub</b><small className="text-xs text-slate-500">Independent student platform</small></span></Link><nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex" aria-label="Primary navigation"><Link className="transition hover:text-[#071d49]" href="/#courses">Courses</Link><a className="transition hover:text-[#071d49]" href="#about">About</a><button type="button" className="rounded-lg border border-[#c89b3c]/50 bg-[#fbf5e7] px-4 py-2 text-sm font-bold text-[#071d49] transition hover:bg-[#f4e6c2]">Demo upload</button></nav><button type="button" aria-expanded={open} aria-controls="mobile-menu" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-[#071d49] md:hidden" onClick={() => setOpen(!open)}><span className="sr-only">Toggle navigation</span><span className="text-xl leading-none">{open ? "×" : "☰"}</span></button></div>{open && <div id="mobile-menu" className="border-t border-slate-100 bg-white px-5 pb-5 pt-3 md:hidden"><nav className="shell grid gap-1 text-sm font-semibold text-slate-700" aria-label="Mobile navigation"><Link className="rounded-lg px-3 py-3 hover:bg-slate-50" href="/#courses" onClick={close}>Courses</Link><a className="rounded-lg px-3 py-3 hover:bg-slate-50" href="#about" onClick={close}>About</a><button type="button" className="mt-2 rounded-lg bg-[#071d49] px-3 py-3 text-left text-white">Demo upload</button></nav></div>}</header>;
}
