import Link from "next/link";
export default function NotFound() { return <main className="grid min-h-screen place-items-center p-6 text-center"><div><p className="text-sm font-bold text-blue-600">404</p><h1 className="mt-2 text-3xl font-bold">Course not found</h1><Link href="/" className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white">Back to courses</Link></div></main>; }
