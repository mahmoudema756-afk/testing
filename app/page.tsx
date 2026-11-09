import Link from "next/link";
import { Header } from "@/components/Header";
import { LiveLibrary } from "@/components/LiveLibrary";
export default function Home(){return <><Header/><main><section className="study-hero"><div className="shell py-20"><p className="eyebrow">By students. For the next student.</p><h1>Good notes deserve<br/>a bigger audience.</h1><p className="max-w-xl text-lg">Share what helped you understand. Find lectures, practice sheets and revision notes reviewed by our student community.</p><div className="mt-8 flex gap-4 flex-wrap"><Link className="action" href="/#courses">Explore the library</Link><Link className="action secondary" href="/submit">Share a resource</Link></div></div></section><div className="shell py-16"><LiveLibrary/></div></main></>;}
