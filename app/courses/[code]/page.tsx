import { Header } from "@/components/Header";
import { LiveLibrary } from "@/components/LiveLibrary";
export default async function Page({params}:{params:Promise<{code:string}>}){const {code}=await params;return <><Header/><main className="shell py-14"><LiveLibrary code={code}/></main></>;}
