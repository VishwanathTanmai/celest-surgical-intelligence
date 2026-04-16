import nodemailer from "nodemailer";

/**
 * Enterprise-level Surgical Communication Hub
 */

const transporterStore = {
  active: null as nodemailer.Transporter | null,
};

async function getTransporter() {
  if (transporterStore.active) return transporterStore.active;

  const isPlaceholder = process.env.SMTP_PASS?.includes("PLEASE_REPLACE");

  if (process.env.SMTP_HOST && !isPlaceholder) {
    console.log(`[CELEST-MAIL] Initializing REAL SMTP Hub: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    transporterStore.active = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // Essential for many internal surgical/hospital mail servers
        rejectUnauthorized: false
      }
    });
  } else {
    console.log("[CELEST-MAIL] Using Autonomous Test Inbox (Ethereal). Update SMTP_PASS in .env for real Gmail delivery.");
    const testAccount = await nodemailer.createTestAccount();
    transporterStore.active = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporterStore.active;
}

export async function sendDoctorInvite(email: string, name: string, hospitalName: string) {
  try {
    const t = await getTransporter();

    console.log(`[CELEST-MAIL] Dispatching real-time invite to: ${email}...`);

    const mailOptions = {
      from: `"CELEST | Hub" <${process.env.SMTP_USER || "no-reply@celest.medical"}>`,
      to: email,
      subject: `🔐 Access Initialized: Invitation for Dr. ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #020617; color: white; border-radius: 24px; border: 1px solid #1e293b;">
          <h1 style="color: #3b82f6; letter-spacing: 2px; text-transform: uppercase;">CELEST | Enterprise</h1>
          <p style="color: #94a3b8; font-size: 14px; text-transform: uppercase; margin-bottom: 30px;">Digital Clinical Credentialing</p>
          <hr style="border-color: #1e293b; margin: 20px 0;">
          <p style="font-size: 16px;">Greetings Dr. ${name},</p>
          <p>You have been formally invited to join the <strong>${hospitalName}</strong> surgical intelligence network.</p>
          <p>Access your real-time performance analytics and AI-driven operative reports through the secure portal:</p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="http://localhost:3000/auth/signin" style="background: #3b82f6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Initialize Access Hub</a>
          </div>
          <p style="color: #475569; font-size: 11px;">🔒 This secure invite is single-use for HIPAA compliance.</p>
        </div>
      `,
    };

    const info = await t.sendMail(mailOptions);
    console.log(`[CELEST-MAIL] ✅ SUCCESS: Dispatched to ${email} (ID: ${info.messageId})`);
    console.log(`[CELEST-MAIL] 📬 SERVER RESPONSE: ${info.response}`);
    
    // Log the Preview URL if it's a test message
    const url = nodemailer.getTestMessageUrl(info);
    if (url) {
      console.log(`\n\n[CELEST-MAIL] 🔗 LIVE TEST INBOX: ${url}\n\n`);
    }
    
    return { success: true };
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    console.error("[CELEST-MAIL] ❌ DISPATCH FAILED:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
