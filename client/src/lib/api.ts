const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function createAssignment(formData: FormData): Promise<{ assignmentId: string }> {
  const res = await fetch(`${API_URL}/assignments`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Failed to create assignment");
  }
  return res.json();
}

export async function getAssignment(id: string) {
  const res = await fetch(`${API_URL}/assignments/${id}`);
  if (!res.ok) throw new Error("Assignment not found");
  return res.json();
}

export async function listAssignments() {
  const res = await fetch(`${API_URL}/assignments`);
  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json();
}

export async function deleteAssignment(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/assignments/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}