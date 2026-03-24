import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendActivationEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      password
    } = body;

    if (!email || !name || !password) {
      return new NextResponse("Missing info", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isActivated: false
      }
    });

    const token = crypto.randomUUID();
    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      }
    });

    await sendActivationEmail(email, token);

    return NextResponse.json({ message: "Account created! Please check your email for the activation link." });
  } catch (error: any) {
    console.log(error, 'REGISTRATION_ERROR');
    return new NextResponse("Internal Error", { status: 500 });
  }
}
