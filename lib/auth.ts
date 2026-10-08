import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "guruwali_session";

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  // Session persistence will be connected to a database-backed session table
  // in the next authentication step. This function intentionally returns null
  // until a verified session exists.
  return null;
}

export function canAccessRole(role: string, allowed: string[]) {
  return allowed.includes(role);
}
