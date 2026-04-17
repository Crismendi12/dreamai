// No longer used -- video generation now uses fal.subscribe() which blocks until done
// Kept for backwards compatibility
export async function POST() {
  return Response.json({ status: "DEPRECATED" });
}
