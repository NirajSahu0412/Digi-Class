import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const classroomId = formData.get("classroomId") as string;
    const assignmentId = formData.get("assignmentId") as string;

    if (!file || !classroomId || !assignmentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify student membership
    const member = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: { userId: dbUser.id, classroomId },
      },
    });

    if (!member || member.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can submit" }, { status: 403 });
    }

    // Verify assignment exists and belongs to classroom
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment || assignment.classroomId !== classroomId) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalName = file.name;

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
      bytes: number;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `digi-class/submissions/${classroomId}/${assignmentId}`,
          resource_type: "auto",
          public_id: `${dbUser.id}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as any);
        }
      );
      uploadStream.end(buffer);
    });

    // Upsert submission (one per student per assignment)
    const existing = await prisma.submission.findFirst({
      where: { assignmentId, studentId: dbUser.id },
    });

    let submission;
    if (existing) {
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          fileUrl: uploadResult.secure_url,
          fileName: originalName,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          fileUrl: uploadResult.secure_url,
          fileName: originalName,
          status: "SUBMITTED",
          assignmentId,
          studentId: dbUser.id,
        },
      });
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Submission upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
