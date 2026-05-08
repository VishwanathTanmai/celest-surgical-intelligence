"use server";

import nodemailer from "nodemailer";

export async function sendContactEmail(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { success: false, error: "All fields are required." };
  }

  try {
    // Note: To make this work in production, ensure SMTP credentials are set in .env
    // e.g. SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER || email}>`, 
      replyTo: email,
      to: "contactus@taureansurgical.com",
      subject: `New Contact Request from ${name} via CELEST Landing Page`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h3>New Contact Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    // If no auth is provided, we simulate success for demonstration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("No SMTP credentials found in .env. Simulating email delivery.");
      console.log("Simulated Email:", mailOptions);
      return { success: true, message: "Message sent successfully! (Simulated)" };
    }

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Message sent successfully!" };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message || "Failed to send message." };
  }
}
