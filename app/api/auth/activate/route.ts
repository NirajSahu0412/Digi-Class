import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
       return new NextResponse("Missing token", { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
       return new NextResponse("Invalid or expired token", { status: 400 });
    }

    if (verificationToken.expires < new Date()) {
       return new NextResponse("Token expired", { status: 400 });
    }

    // Update user
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { isActivated: true }
    });

    // Delete token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    return NextResponse.json({ message: "Account successfully activated." });

  } catch (error) {
    console.error("ACTIVATE_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
