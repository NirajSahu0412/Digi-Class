import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, return success even if user doesn't exist to prevent email enumeration
      return new NextResponse("If an account exists, an OTP has been sent.", { status: 200 });
    }

    // Generate 6 digit OTP
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clear existing tokens for this email and create new one
    await (prisma as any).verificationToken.deleteMany({
      where: { email }
    });

    await (prisma as any).verificationToken.create({
      data: { email, token, expires },
    });

    // Send email
    await sendEmail({
      to: email,
      subject: "Your Password Reset OTP",
      body: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <h2 style="color: #333;">Password Reset Requested</h2>
          <p>Your OTP for resetting your password is: <strong>${token}</strong></p>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return new NextResponse("OTP sent successfully", { status: 200 });
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
