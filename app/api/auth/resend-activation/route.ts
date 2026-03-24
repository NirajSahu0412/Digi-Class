import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendActivationEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const unactivatedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!unactivatedUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (unactivatedUser.isActivated) {
      return new NextResponse("Account is already activated", { status: 400 });
    }

    // Delete existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { email },
    });

    const token = crypto.randomUUID();

    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      },
    });

    await sendActivationEmail(email, token);

    return NextResponse.json({ message: "Activation email resent" });
  } catch (error) {
    console.error("RESEND_ACTIVATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
