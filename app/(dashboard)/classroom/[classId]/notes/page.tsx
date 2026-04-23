import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NotesPageClient } from "@/components/classroom/NotesPageClient";

export default async function ClassroomNotesPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const session = await getServerSession(authOptions);

  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email || "" }
  });

  const [member, notes, subjects, folders] = await Promise.all([
    prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: dbUser?.id || "",
          classroomId: classId,
        },
      },
    }),
    prisma.notes.findMany({
      where: { classroomId: classId },
      include: {
        subject: true,
        folder: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subject.findMany({
      where: { classroomId: classId },
      orderBy: { name: "asc" },
    }),
    prisma.noteFolder.findMany({
      where: { classroomId: classId },
      orderBy: { name: "asc" },
    }),
  ]);

  const isTeacher = member?.role === "TEACHER";

  // Serialize dates to strings for client component
  const serializedNotes = notes.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <NotesPageClient
      classroomId={classId}
      isTeacher={isTeacher}
      notes={serializedNotes}
      subjects={subjects}
      folders={folders}
    />
  );
}
