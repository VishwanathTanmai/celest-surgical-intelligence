import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "celest_enterprise_surgical_intelligence_key_2026"
);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, SECRET, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function login(user: { id: string; email: string; role: string; hospitalId: string; hospitalName?: string; name: string; department?: string; roleId?: string | null }) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt(user);

  cookies().set("session", session, { expires, httpOnly: true, secure: process.env.NODE_ENV === "production" });
}

export async function logout() {
  cookies().set("session", "", { expires: new Date(0) });
}

export async function getSession(): Promise<any | null> {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}
