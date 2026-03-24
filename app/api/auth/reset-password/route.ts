import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return new NextResponse("All fields are required", { status: 400 });
    }

    const verificationToken = await (prisma as any).verificationToken.findFirst({
      where: { email, token },
    });

    if (!verificationToken) {
      return new NextResponse("Invalid or expired OTP", { status: 400 });
    }

    if (new Date() > verificationToken.expires) {
      await (prisma as any).verificationToken.delete({ 
        where: { id: verificationToken.id } 
      });
      return new NextResponse("OTP has expired", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete verification token after successful reset
    await (prisma as any).verificationToken.delete({
      where: { id: verificationToken.id }
    });

    return new NextResponse("Password reset successfully", { status: 200 });
  } catch (error) {
    console.error("[RESET_PASSWORD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
