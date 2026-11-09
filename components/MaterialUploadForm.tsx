"use client";

import { useEffect, useState } from "react";
import { courses } from "@/lib/courses";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

const resourceTypes = ["lecture", "tutorial", "assignment", "summary"] as const;
const maxFileSize = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export function MaterialUploadForm() {
  const [userId, setUserId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState(courses[0].code);
  const [resourceType, setResourceType] = useState<(typeof resourceTypes)[number]>("lecture");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => { const supabase = getSupabaseBrowserClient(); if (!supabase) return; supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !userId || !file) return;
    if (file.size > maxFileSize) { setMessage("Choose a file smaller than 10 MB."); return; }
    if (!allowedMimeTypes.has(file.type)) { setMessage("Only PDF, DOC, DOCX, PPT, and PPTX files are allowed."); return; }
    const course = courses.find(item => item.code === courseCode);
    if (!course) return;
    setBusy(true); setMessage("");
    const { data: courseRow, error: courseError } = await supabase.from("courses").select("id").eq("code", course.code).single();
    if (courseError || !courseRow) { setBusy(false); setMessage("This course has not been seeded in Supabase yet."); return; }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${userId}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("materials").upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) { setBusy(false); setMessage(uploadError.message); return; }
    const { error: insertError } = await supabase.from("materials").insert({ course_id: courseRow.id, uploader_id: userId, title, resource_type: resourceType, storage_path: storagePath, original_filename: file.name, mime_type: file.type, size_bytes: file.size });
    if (insertError) { await supabase.storage.from("materials").remove([storagePath]); setBusy(false); setMessage(insertError.message); return; }
    setBusy(false); setTitle(""); setFile(null); setMessage("Submitted for admin review. It will not be visible until approved.");
  }

  if (!configured) return <p className="rounded-xl border border-[var(--must-green)]/25 bg-[var(--must-green-pale)] p-4 text-sm text-[var(--must-navy-deep)]">Configure Supabase first to enable submissions.</p>;
  if (!userId) return <p className="rounded-xl border border-[var(--must-line)] bg-white p-4 text-sm text-slate-600">Please sign in before submitting a material.</p>;
  return <form onSubmit={upload} className="surface rounded-2xl border border-[var(--must-line)] bg-white p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-[var(--must-navy-deep)]">Title<input required value={title} onChange={e => setTitle(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--must-line)] px-3 outline-none focus:border-[var(--must-green)]" /></label><label className="text-sm font-bold text-[var(--must-navy-deep)]">Course<select value={courseCode} onChange={e => setCourseCode(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--must-line)] bg-white px-3 outline-none focus:border-[var(--must-green)]">{courses.map(course => <option key={course.code}>{course.code}</option>)}</select></label><label className="text-sm font-bold text-[var(--must-navy-deep)]">Category<select value={resourceType} onChange={event => setResourceType(event.target.value as (typeof resourceTypes)[number])} className="mt-2 h-11 w-full rounded-lg border border-[var(--must-line)] bg-white px-3 outline-none focus:border-[var(--must-green)]">{resourceTypes.map(type => <option key={type}>{type}</option>)}</select></label><label className="text-sm font-bold text-[var(--must-navy-deep)]">File (PDF, DOCX, PPTX, max 10 MB)<input required accept=".pdf,.doc,.docx,.ppt,.pptx" type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--must-green-pale)] file:px-3 file:py-2 file:font-bold file:text-[var(--must-navy-deep)]" /></label></div><button disabled={busy} className="mt-6 rounded-lg bg-[var(--must-green)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--must-green-deep)] disabled:opacity-60">{busy ? "Uploading…" : "Submit for review"}</button>{message && <p role="status" className="mt-4 text-sm text-[var(--must-green-deep)]">{message}</p>}</form>;
}
