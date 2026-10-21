// profile.ts
import { supabase } from "./superbase";
import type { User } from "@supabase/supabase-js";

/* ---------- Types ---------- */

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_path: string | null;
  bio: string | null;
  email: string | null;
  phone_number: string | null;
};

export type ProfileResult =
  | { ok: true; profile: Profile; user: User }
  | { ok: false; reason: string; kind: "unauthenticated" | "profile" };

/* ---------- Fetch the logged-in user's profile ---------- */

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
    .select("id, display_name, avatar_path, bio, email, phone_number")
    .eq("id", user.id)
    .maybeSingle();

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

/* ---------- Fetch any profile by id ---------- */

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_path, bio, email, phone_number")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("profiles query failed:", error);
    return null;
  }

  return (data as Profile) ?? null;
}

/* ---------- Convenience: just the fields ---------- */

export async function getMyProfileFields(): Promise<Profile | null> {
  const result = await getMyProfile();
  return result.ok ? result.profile : null;
}

/* ---------- Optional: resolve the avatar to a public URL ---------- */

export function getAvatarUrl(
  avatarPath: string | null,
  bucket = "avatars"
): string | null {
  if (!avatarPath) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(avatarPath);
  return data.publicUrl;
}