import { Header } from "@/components/Header";
import { CourseSuggestion } from "@/components/CourseSuggestion";
import { requireUser } from "@/lib/supabase/server";
export default async function Page(){await requireUser("/suggest");return <><Header/><main className="shell py-14"><p className="eyebrow">Build the library together</p><h1>Missing a course?</h1><p>Suggest it here. Approved suggestions appear in the library.</p><CourseSuggestion/></main></>;}
