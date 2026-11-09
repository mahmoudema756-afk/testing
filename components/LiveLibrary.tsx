"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type CourseRow = { id: string; code: string; title: string; academic_year: string | null; semester: string; level: string; description: string; is_active: boolean; suggestion_status: string };
export function LiveLibrary({ code }: { code?: string }) {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [materials, setMaterials] = useState<{id:string; title:string; resource_type:string; storage_path:string; original_filename:string}[]>([]);
  const [query, setQuery] = useState("");
  const [semester, setSemester] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function load() {
      const db = getSupabaseBrowserClient();
      if (!db) throw new Error("The library is not connected yet. Please try again later.");
      const result = await db.from("courses").select("*").eq("is_active", true).eq("suggestion_status", "approved").order("code");
      if (result.error) throw result.error;
      if (!active) return;
      setCourses(result.data);
      const course = result.data.find(c => c.code.toLowerCase() === code?.toLowerCase());
      if (course) {
        const files = await db.from("materials").select("id,title,resource_type,storage_path,original_filename").eq("course_id", course.id).eq("status", "approved").order("created_at", { ascending:false });
        if (files.error) throw files.error;
        if (active) setMaterials(files.data);
      }
    }
    void load().catch(e => { if(active) setError(e.message); }).finally(() => { if(active) setLoading(false); });
    return () => { active = false; };
  }, [code]);
  async function download(path:string, name:string) {
    const db = getSupabaseBrowserClient(); if(!db) return;
    const {data,error} = await db.storage.from("materials").download(path);
    if(error) { setError("This file could not be downloaded. Please try again."); return; }
    const url = URL.createObjectURL(data); const a = document.createElement("a"); a.href=url; a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  if(loading) return <p role="status" className="panel">Loading the library…</p>;
  if(error) return <p role="alert" className="panel">{error}</p>;
  const course = courses.find(c=>c.code.toLowerCase()===code?.toLowerCase());
  if(code) return course ? <><Link href="/#courses">← Course library</Link><div className="panel"><p className="eyebrow">{course.code} · {course.academic_year} · {course.semester}</p><h1>{course.title}</h1><p>{course.description}</p><Link className="action" href="/submit">Contribute a material</Link></div><div className="grid gap-5 md:grid-cols-2">{["lecture","tutorial","assignment","summary"].map(kind=><section className="panel" key={kind}><h2 className="capitalize">{kind}s</h2>{materials.filter(m=>m.resource_type===kind).map(m=><button className="resource" key={m.id} onClick={()=>download(m.storage_path,m.original_filename)}>{m.title}<span>Download ↓</span></button>)}{!materials.some(m=>m.resource_type===kind)&&<p>No approved materials yet. Be the first to contribute.</p>}</section>)}</div></> : <div className="panel"><h1>Course unavailable</h1><Link href="/">Return to the library</Link></div>;
  const filtered=courses.filter(c=>(c.code+" "+c.title).toLowerCase().includes(query.trim().toLowerCase())&&(!semester||c.semester===semester));
  return <section id="courses"><div className="section-heading"><div><p className="eyebrow">The shared library</p><h2>Find your next study session.</h2></div><Link className="action" href="/suggest">Suggest a course</Link></div><div className="panel flex flex-wrap gap-3"><input aria-label="Search courses" placeholder="Course code or title" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Semester" value={semester} onChange={e=>setSemester(e.target.value)}><option value="">All semesters</option>{[...new Set(courses.map(c=>c.semester))].map(s=><option key={s}>{s}</option>)}</select></div><p role="status">{filtered.length} courses</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(c=><Link className="panel course-tile" href={"/courses/"+encodeURIComponent(c.code)} key={c.id}><p className="eyebrow">{c.code} · {c.semester}</p><h3>{c.title}</h3><p>{c.description}</p><span>{c.academic_year} · Open course →</span></Link>)}</div>{!filtered.length&&<div className="panel"><h3>No courses match yet</h3><p>Try a different search or suggest the course you need.</p><button onClick={()=>{setQuery("");setSemester("");}}>Clear filters</button></div>}</section>;
}
