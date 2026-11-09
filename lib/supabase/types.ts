export type MaterialStatus = "pending" | "approved" | "rejected";
export type Profile = { id: string; full_name: string | null; role: "student" | "admin" };
export type Material = {
  id: string;
  title: string;
  description: string | null;
  resource_type: "lecture" | "tutorial" | "assignment" | "summary";
  status: MaterialStatus;
  storage_path: string;
  original_filename: string;
  created_at: string;
  course_id: string;
};
