import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, body }: { to: string; subject: string; body: string }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: body,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email", error);
    throw new Error("Failed to send email");
  }
};

export const sendActivationEmail = async (email: string, token: string) => {
  const activationLink = `${process.env.NEXTAUTH_URL}/activate/${token}`;

  const subject = "Activate your DigiKlass Account";
  const body = `
    <h1>Account Activation</h1>
    <p>Please click the link below to activate your account:</p>
    <a href="${activationLink}">${activationLink}</a>
  `;

  await sendEmail({ to: email, subject, body });
};
