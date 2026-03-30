import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateAgoraToken } from "@/lib/video";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classroomId } = await req.json();

    if (!classroomId) {
      return NextResponse.json({ error: "Classroom ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { members: true },
    });

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
    }

    const isMember = classroom.members.some(member => member.userId === user.id);
    const isOwner = classroom.createdBy === user.id;

    if (!isMember && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isHost = isOwner || classroom.members.some(member => member.userId === user.id && member.role === "TEACHER");

    // Look for an existing live session
    let videoSession = await prisma.videoSession.findFirst({
      where: {
        classroomId,
        isLive: true,
      },
    });

    if (!videoSession) {
      if (!isHost) {
        return NextResponse.json({ error: "No live session found and you are not a host" }, { status: 404 });
      }

      videoSession = await prisma.videoSession.create({
        data: {
          classroomId,
          hostId: user.id,
          isLive: true,
          meetingLink: `/classroom/${classroomId}/video`,
        },
      });
    }

    const uid = Math.floor(Math.random() * 100000);
    const channelName = videoSession.id;

    // Generate token allowing everyone to publish (two-way video)
    const token = generateAgoraToken(channelName, uid, 'publisher');
    const appId = process.env.AGORA_APP_ID;

    return NextResponse.json({
      videoSession,
      token,
      uid,
      channelName,
      appId,
      isHost,
    });
  } catch (error: any) {
    console.error("Video Session Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoSessionId } = await req.json();

    if (!videoSessionId) {
      return NextResponse.json({ error: "Video session ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const videoSession = await prisma.videoSession.findUnique({
      where: { id: videoSessionId },
    });

    if (!videoSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (videoSession.hostId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.videoSession.update({
      where: { id: videoSessionId },
      data: { isLive: false },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Video Session Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
