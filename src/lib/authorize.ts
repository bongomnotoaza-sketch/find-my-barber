import { supabase } from "./superbase";
import type { User } from "@supabase/supabase-js";

/* ---------- Types ---------- */

export type Role = "user" | "barber";

export type AuthzResult =
  | { allowed: true; user: User; role: Role }
  | { allowed: false; reason: string };

/* ---------- Fetch the current user's role from `profiles` ---------- */

/**
 * Reads the `role` column from the `profiles` table for the given user.
 * Falls back to "user" if no profile row exists.
 */
async function fetchRole(userId: string): Promise<Role> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data?.role) return "user";
  return data.role as Role;
}

/* ---------- Core check ---------- */

/**
 * Check if the current user has one of the allowed roles.
 *
 * Usage:
 *   const check = await authorize(["barber"]);
 *   if (!check.allowed) return <AccessDenied reason={check.reason} />;
 */
export async function authorize(allowedRoles: Role[]): Promise<AuthzResult> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { allowed: false, reason: "Not signed in" };
  }

  const role = await fetchRole(user.id);

  if (!allowedRoles.includes(role)) {
    return {
      allowed: false,
      reason: `Requires role: ${allowedRoles.join(" or ")}`,
    };
  }

  return { allowed: true, user, role };
}

/* ---------- Convenience guards ---------- */

export async function requireBarber(): Promise<AuthzResult> {
  return authorize(["barber"]);
}

export async function requireUser(): Promise<AuthzResult> {
  // both roles are allowed
  return authorize(["user", "barber"]);
}

/* ---------- Get just the role (no gate) ---------- */

/**
 * Returns the current user's role, or null if not signed in.
 * Useful for conditionally rendering UI without blocking.
 */
export async function getMyRole(): Promise<Role | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return fetchRole(user.id);
}