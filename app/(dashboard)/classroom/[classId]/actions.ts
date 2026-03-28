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

export async function createAssignment(classroomId: string, title: string, description: string, deadline: string) {
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
      deadline: deadline ? new Date(deadline) : null,
      classroomId,
      createdBy: dbUser.id
    }
  });

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
