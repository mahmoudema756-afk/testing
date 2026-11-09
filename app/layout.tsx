import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "MUST CS Materials Hub", description: "Unofficial student-built CS study materials hub." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}<Footer/></body></html>; }
