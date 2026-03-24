import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, academicYear, subjects, maxStudents } = await req.json();

    if (!name || !academicYear || !maxStudents) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Generate unique code
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();

    const classroom = await prisma.classroom.create({
      data: {
        name,
        academicYear,
        maxStudents: parseInt(maxStudents, 10),
        code,
        createdBy: session.user.id,
        members: {
          create: {
            role: "TEACHER",
            userId: session.user.id,
          }
        },
        subjects: {
          create: subjects?.map((sub: string) => ({ name: sub })) || []
        }
      }
    });

    return NextResponse.json(classroom);
  } catch (error) {
    console.log("[CLASSROOM_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
