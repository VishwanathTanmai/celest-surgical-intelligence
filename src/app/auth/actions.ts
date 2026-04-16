"use server";

import { prisma } from "@/lib/db";
import { hashPassword, comparePasswords, login, logout } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signUpHospital(formData: FormData) {
  const hospitalName = formData.get("hospitalName") as string;
  const location = formData.get("location") as string;
  const adminName = formData.get("adminName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!hospitalName || !adminName || !email || !password) {
    return { error: "Missing required fields" };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "An clinical account already exists with this email. Please utilize the 'Portal Access' tab to sign in." };

    const hospital = await prisma.hospital.create({
      data: { name: hospitalName, location }
    });

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: adminName,
        role: "ADMIN",
        hospitalId: hospital.id
      }
    });

    await login({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      hospitalId: user.hospitalId, 
      hospitalName: hospital.name,
      department: user.department,
      name: user.name 
    });
  } catch (err: any) {
    return { error: err.message };
  }

  redirect("/admin");
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Missing required fields" };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "Unregistered Clinical Account. Please initialize your Hospital Registry first." };

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) return { error: "Invalid Security Credentials. Please verify your access key." };

    const hospital = user.hospitalId ? await prisma.hospital.findUnique({ where: { id: user.hospitalId } }) : null;
    await login({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      hospitalId: user.hospitalId, 
      hospitalName: hospital?.name || "General Hospital",
      department: user.department,
      name: user.name 
    });
    
    // Redirect logic moved outside or handled after login...
  } catch (err: any) {
    // Next.js redirect calls throw an error that should not be caught here
    if (err.message?.includes("NEXT_REDIRECT")) throw err;
    return { error: err.message };
  }

  // Final Redirection based on role
  const user = await prisma.user.findUnique({ where: { email: formData.get("email") as string } });
  if (user?.role === "ADMIN") redirect("/admin");
  redirect("/");
}

export async function signOutAction() {
  await logout();
  redirect("/admin/login");
}

import { sendDoctorInvite } from "@/lib/mail";

export async function inviteDoctor(formData: FormData) {
  const doctorName = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const department = formData.get("department") as string;
  const hospitalId = formData.get("hospitalId") as string;

  try {
    const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
    if (!hospital) return { error: "Hospital not found" };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Re-dispatch if already registered (useful for retrying failed emails)
      const mailRes = await sendDoctorInvite(email, doctorName, hospital.name);
      if (!mailRes.success) {
        return { error: `Practitioner found in database, but invitation re-dispatch failed: ${mailRes.error}` };
      }
      return { success: true, message: "Invitation re-dispatched successfully." };
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.create({
      data: {
        name: doctorName,
        email,
        password: hashedPassword,
        department: department || "General Surgery",
        role: "DOCTOR",
        hospitalId
      } as any
    });

    console.log(`Practitioner created: ${email} for hospital ${hospitalId}`);

    // Real-time dispatch
    const mailRes = await sendDoctorInvite(email, doctorName, hospital.name);
    if (!mailRes.success) {
      console.warn(`Doctor ${email} added, but email failed:`, mailRes.error);
      return { error: `Doctor added to database, but invitation email failed: ${mailRes.error}` };
    }
    
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Critical Invitation Error:", err);
    return { error: err.message };
  }
}

