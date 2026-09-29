// profile.ts
import { supabase } from "./superbase";
import type { User } from "@supabase/supabase-js";

/* ---------- Types ---------- */

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_path: string | null;
  bio: string | null;
};

export type ProfileResult =
  | { ok: true; profile: Profile; user: User }
  | { ok: false; reason: string; kind: "unauthenticated" | "profile" };

/* ---------- Fetch the logged-in user's profile ---------- */

/**
 * Fetches `display_name`, `avatar_path`, and `bio` from the `profiles`
 * table for the currently authenticated user.
 *
 * Usage:
 *   const result = await getMyProfile();
 *   if (!result.ok) return <p>{result.reason}</p>;
 *   const { display_name, avatar_path, bio } = result.profile;
 */
export async function getMyProfile(): Promise<ProfileResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("getUser failed:", authError);
    return { ok: false, reason: "Not signed in", kind: "unauthenticated" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_path, bio")
    .eq("id", user.id)
    .maybeSingle(); // returns null instead of erroring on 0 rows

  if (error) {
    console.error("profiles query failed:", error);
    return { ok: false, reason: error.message, kind: "profile" };
  }
  if (!data) {
    console.error("No profiles row for user", user.id);
    return { ok: false, reason: "Profile not found", kind: "profile" };
  }

  return { ok: true, profile: data as Profile, user };
}

/* ---------- Convenience: just the fields ---------- */

/**
 * Returns the profile fields directly, or `null` if not signed in / missing.
 * Useful when you don't need the error reason.
 */
export async function getMyProfileFields(): Promise<Profile | null> {
  const result = await getMyProfile();
  return result.ok ? result.profile : null;
}

/* ---------- Optional: resolve the avatar to a public URL ---------- */

/**
 * If `avatar_path` is stored in a Supabase Storage bucket, this converts
 * it into a public URL. Adjust the bucket name to match your setup.
 */
export function getAvatarUrl(
  avatarPath: string | null,
  bucket = "avatars"
): string | null {
  if (!avatarPath) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(avatarPath);
  return data.publicUrl;
}