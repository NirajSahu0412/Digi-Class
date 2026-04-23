import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AssignmentDetailClient } from "@/components/classroom/AssignmentDetailClient";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ classId: string; assignmentId: string }>;
}) {
  const { classId, assignmentId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!dbUser) redirect("/login");

  const member = await prisma.classroomMember.findUnique({
    where: {
      userId_classroomId: { userId: dbUser.id, classroomId: classId },
    },
  });

  if (!member) redirect(`/classroom/${classId}`);

  const isTeacher = member.role === "TEACHER";

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      subject: true,
      creator: { select: { name: true } },
    },
  });

  if (!assignment || assignment.classroomId !== classId) {
    redirect(`/classroom/${classId}/assignments`);
  }

  let submissions: any[] = [];
  let mySubmission: any = null;

  if (isTeacher) {
    // Get all classroom students and their submissions
    const students = await prisma.classroomMember.findMany({
      where: { classroomId: classId, role: "STUDENT" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const existingSubmissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });

    const submissionMap = new Map(
      existingSubmissions.map((s) => [s.studentId, s])
    );

    // Create virtual "PENDING" entries for students who haven't submitted
    submissions = students.map((m) => {
      const existing = submissionMap.get(m.userId);
      if (existing) {
        return {
          ...existing,
          submittedAt: existing.submittedAt.toISOString(),
        };
      }
      return {
        id: `pending_${m.userId}`,
        fileUrl: null,
        fileName: null,
        marks: null,
        feedback: null,
        status: "PENDING" as const,
        submittedAt: new Date().toISOString(),
        student: m.user,
      };
    });
  } else {
    // Student: get own submission
    const sub = await prisma.submission.findFirst({
      where: { assignmentId, studentId: dbUser.id },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });
    mySubmission = sub
      ? { ...sub, submittedAt: sub.submittedAt.toISOString() }
      : null;
  }

  const a = assignment as any;
  const serializedAssignment = {
    ...assignment,
    totalMarks: a.totalMarks ?? null,
    deadline: assignment.deadline?.toISOString() || null,
    createdAt: (a.createdAt ?? new Date()).toISOString ? (a.createdAt).toISOString() : new Date().toISOString(),
  };

  return (
    <AssignmentDetailClient
      assignment={serializedAssignment}
      submissions={submissions}
      mySubmission={mySubmission}
      classroomId={classId}
      isTeacher={isTeacher}
    />
  );
}
