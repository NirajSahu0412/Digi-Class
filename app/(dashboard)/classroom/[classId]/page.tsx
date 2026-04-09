import { redirect } from "next/navigation";

export default async function ClassroomPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  redirect(`/classroom/${classId}/stream`);
}
