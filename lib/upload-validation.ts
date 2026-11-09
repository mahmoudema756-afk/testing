export const maxMaterialBytes = 10 * 1024 * 1024;

const mimeByExtension: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export type UploadCandidate = { name: string; size: number; type: string };

export function resolveMaterialMime(file: UploadCandidate) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const expected = mimeByExtension[extension];
  if (!expected) return null;
  if (file.type && file.type !== expected) return null;
  return expected;
}

export function validateMaterialUpload(file: UploadCandidate | null) {
  if (!file) return "Choose a PDF, DOC, DOCX, PPT, or PPTX file first.";
  if (file.size <= 0) return "The selected file is empty.";
  if (file.size > maxMaterialBytes) return "Choose a file smaller than 10 MB.";
  if (!resolveMaterialMime(file)) return "Only PDF, DOC, DOCX, PPT, and PPTX files are allowed.";
  return null;
}
