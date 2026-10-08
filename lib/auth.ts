import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { createHash } from "crypto";

export const SESSION_COOKIE = "guruwali_session";

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash=createHash("sha256").update(token).digest("hex");
  const session=await prisma.session.findUnique({where:{tokenHash},include:{user:true}});
  if(!session||session.expiresAt<=new Date()||session.user.status!=="ACTIVE") return null;
  return session.user;
}

export function canAccessRole(role: string, allowed: string[]) {
  return allowed.includes(role);
}
