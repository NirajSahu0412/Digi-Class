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
    const title = formData.get("title") as string;
    const subjectId = (formData.get("subjectId") as string) || null;
    const folderId = (formData.get("folderId") as string) || null;
    const folderName = (formData.get("folderName") as string) || null;

    if (!file || !classroomId || !title) {
      return NextResponse.json(
        { error: "Missing required fields: file, classroomId, title" },
        { status: 400 }
      );
    }

    // Verify membership and role
    const member = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: { userId: dbUser.id, classroomId },
      },
    });

    if (member?.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can upload notes" }, { status: 403 });
    }

    // Resolve folder: create new or use existing
    let resolvedFolderId = folderId;
    if (!folderId && folderName?.trim()) {
      const folder = await prisma.noteFolder.upsert({
        where: {
          name_classroomId: { name: folderName.trim(), classroomId },
        },
        update: {},
        create: { name: folderName.trim(), classroomId },
      });
      resolvedFolderId = folder.id;
    }

    // Convert File to buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine file extension
    const originalName = file.name;
    const ext = originalName.split(".").pop()?.toLowerCase() || "";

    // Upload to Cloudinary
    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
      bytes: number;
      format: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `digi-class/notes/${classroomId}`,
          resource_type: "auto",
          public_id: `${Date.now()}_${originalName.replace(/\.[^.]+$/, "")}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as any);
        }
      );
      uploadStream.end(buffer);
    });

    // Determine file type category
    const fileType = getFileType(ext);

    // Create note record
    const note = await prisma.notes.create({
      data: {
        title,
        fileUrl: uploadResult.secure_url,
        fileName: originalName,
        fileType,
        fileSize: uploadResult.bytes,
        publicId: uploadResult.public_id,
        uploadedBy: dbUser.id,
        classroomId,
        subjectId: subjectId || null,
        folderId: resolvedFolderId || null,
      },
      include: {
        subject: true,
        folder: true,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

function getFileType(ext: string): string {
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
  const docExts = ["doc", "docx", "odt", "rtf"];
  const spreadsheetExts = ["xls", "xlsx", "csv", "ods"];
  const presentationExts = ["ppt", "pptx", "odp"];

  if (ext === "pdf") return "pdf";
  if (imageExts.includes(ext)) return "image";
  if (docExts.includes(ext)) return "document";
  if (spreadsheetExts.includes(ext)) return "spreadsheet";
  if (presentationExts.includes(ext)) return "presentation";
  return "other";
}
