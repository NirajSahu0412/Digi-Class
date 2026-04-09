import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser) {
      return new NextResponse("Unauthorized - User not found in DB", { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return new NextResponse("Missing class code", { status: 400 });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    if (!classroom) {
      return new NextResponse("Classroom not found", { status: 404 });
    }

    if (classroom.createdBy === dbUser.id) {
      return new NextResponse("You are already the creator (Teacher) of this class", { status: 400 });
    }

    if (classroom._count.members >= classroom.maxStudents) {
      return new NextResponse("Classroom is full", { status: 400 });
    }

    const existingMember = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: dbUser.id,
          classroomId: classroom.id
        }
      }
    });

    if (existingMember) {
      return new NextResponse("You are already a member of this class", { status: 400 });
    }

    await prisma.classroomMember.create({
      data: {
        role: "STUDENT",
        userId: dbUser.id,
        classroomId: classroom.id
      }
    });

    return NextResponse.json(classroom);
  } catch (error) {
    console.log("[CLASSROOM_JOIN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
