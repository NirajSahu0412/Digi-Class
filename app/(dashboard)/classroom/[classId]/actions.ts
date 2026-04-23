"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(classroomId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) return { error: "User not found" };

  const member = await prisma.classroomMember.findUnique({
    where: { userId_classroomId: { userId: dbUser.id, classroomId } }
  });

  if (member?.role !== "TEACHER") return { error: "Unauthorized" };

  await (prisma as any).announcement.create({
    data: {
      content,
      classroomId,
      authorId: dbUser.id
    }
  });

  revalidatePath(`/classroom/${classroomId}/stream`);
  return { success: true };
}

export async function createAssignment(
  classroomId: string,
  title: string,
  description: string,
  deadline: string,
  subjectId?: string,
  totalMarks?: number
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) return { error: "User not found" };

  const member = await prisma.classroomMember.findUnique({
    where: { userId_classroomId: { userId: dbUser.id, classroomId } }
  });

  if (member?.role !== "TEACHER") return { error: "Unauthorized" };

  await prisma.assignment.create({
    data: {
      title,
      description,
      totalMarks: totalMarks || null,
      deadline: deadline ? new Date(deadline) : null,
      classroomId,
      subjectId: subjectId || null,
      createdBy: dbUser.id
    }
  });

  revalidatePath(`/classroom/${classroomId}/assignments`);
  return { success: true };
}

export async function gradeSubmission(
  classroomId: string,
  submissionId: string,
  marks: number,
  feedback?: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) return { error: "User not found" };

  const member = await prisma.classroomMember.findUnique({
    where: { userId_classroomId: { userId: dbUser.id, classroomId } }
  });

  if (member?.role !== "TEACHER") return { error: "Unauthorized" };

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: true }
  });

  if (!submission || submission.assignment.classroomId !== classroomId) {
    return { error: "Submission not found" };
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      marks,
      feedback: feedback || null,
      status: "EVALUATED"
    }
  });

  revalidatePath(`/classroom/${classroomId}/assignments/${submission.assignmentId}`);
  revalidatePath(`/classroom/${classroomId}/assignments`);
  return { success: true };
}

export async function deleteAssignment(classroomId: string, assignmentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) return { error: "User not found" };

  const member = await prisma.classroomMember.findUnique({
    where: { userId_classroomId: { userId: dbUser.id, classroomId } }
  });

  if (member?.role !== "TEACHER") return { error: "Unauthorized" };

  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.classroomId !== classroomId) return { error: "Assignment not found" };

  // Delete all submissions first, then the assignment
  await prisma.submission.deleteMany({ where: { assignmentId } });
  await prisma.assignment.delete({ where: { id: assignmentId } });

  revalidatePath(`/classroom/${classroomId}/assignments`);
  return { success: true };
}


export async function updateClassroom(classroomId: string, data: { name: string; academicYear: string; maxStudents: number }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) return { error: "User not found" };

  const member = await prisma.classroomMember.findUnique({
    where: { userId_classroomId: { userId: dbUser.id, classroomId } }
  });

  if (member?.role !== "TEACHER") return { error: "Unauthorized" };

  await prisma.classroom.update({
    where: { id: classroomId },
    data: {
      name: data.name,
      academicYear: data.academicYear,
      maxStudents: data.maxStudents
    }
  });

  revalidatePath(`/classroom/${classroomId}`);
  revalidatePath(`/classroom/${classroomId}/settings`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function createSubject(classroomId: string, name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) return { error: "User not found" };

  const member = await prisma.classroomMember.findUnique({
    where: { userId_classroomId: { userId: dbUser.id, classroomId } }
  });

  if (member?.role !== "TEACHER") return { error: "Unauthorized" };

  const subject = await prisma.subject.create({
    data: { name, classroomId }
  });

  revalidatePath(`/classroom/${classroomId}/settings`);
  return { success: true, subject };
}

export async function updateSubject(classroomId: string, subjectId: string, name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) return { error: "User not found" };

  const member = await prisma.classroomMember.findUnique({
    where: { userId_classroomId: { userId: dbUser.id, classroomId } }
  });

  if (member?.role !== "TEACHER") return { error: "Unauthorized" };

  // Verify the subject belongs to this classroom
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || subject.classroomId !== classroomId) return { error: "Subject not found" };

  await prisma.subject.update({
    where: { id: subjectId },
    data: { name }
  });

  revalidatePath(`/classroom/${classroomId}/settings`);
  return { success: true };
}

export async function deleteSubject(classroomId: string, subjectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) return { error: "User not found" };

  const member = await prisma.classroomMember.findUnique({
    where: { userId_classroomId: { userId: dbUser.id, classroomId } }
  });

  if (member?.role !== "TEACHER") return { error: "Unauthorized" };

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: { assignments: true, notes: true }
  });

  if (!subject || subject.classroomId !== classroomId) return { error: "Subject not found" };

  if (subject.assignments.length > 0 || subject.notes.length > 0) {
    return { error: "Cannot delete a subject that has assignments or notes. Remove them first." };
  }

  await prisma.subject.delete({ where: { id: subjectId } });

  revalidatePath(`/classroom/${classroomId}/settings`);
  return { success: true };
}

export async function deleteNote(classroomId: string, noteId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) return { error: "User not found" };

  const member = await prisma.classroomMember.findUnique({
    where: { userId_classroomId: { userId: dbUser.id, classroomId } }
  });

  if (member?.role !== "TEACHER") return { error: "Unauthorized" };

  const note = await prisma.notes.findUnique({ where: { id: noteId } });
  if (!note || note.classroomId !== classroomId) return { error: "Note not found" };

  // Delete from Cloudinary if publicId exists
  const notePublicId = (note as any).publicId as string | null;
  if (notePublicId) {
    try {
      const cloudinary = (await import("@/lib/cloudinary")).default;
      await cloudinary.uploader.destroy(notePublicId, { resource_type: "raw" });
    } catch (e) {
      console.error("Cloudinary delete error:", e);
      // Continue with DB deletion even if Cloudinary fails
    }
  }

  await prisma.notes.delete({ where: { id: noteId } });

  revalidatePath(`/classroom/${classroomId}/notes`);
  return { success: true };
}
