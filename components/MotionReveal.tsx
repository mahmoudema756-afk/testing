"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function MotionReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0, y: 14 }} whileInView={reduced ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.32, delay, ease: "easeOut" }}>{children}</motion.div>;
}
