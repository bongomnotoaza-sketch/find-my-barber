import { supabase } from "./superbase";
import type { AuthResult } from "./auth";

/* ---------- Constants ---------- */

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_DISPLAY_NAME_LENGTH = 40;
const MAX_BIO_LENGTH = 300;

/* ---------- Helpers ---------- */

/** avatar/image_{user_id} inside the `avatars` bucket */
function avatarPathFor(userId: string) {
  return `avatars/image_${userId}`;
}

/**
 * Returns the signed-in user or null.
 */
async function getSignedInUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/* ---------- Display name ---------- */

/**
 * Update the signed-in user's display name.
 */
export async function updateDisplayName(
  displayName: string
): Promise<AuthResult> {
  const user = await getSignedInUser();

  if (!user) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const trimmed = displayName.trim();

  if (trimmed.length === 0) {
    return { success: false, data: null, error: "Display name cannot be empty." };
  }

  if (trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      success: false,
      data: null,
      error: `Display name must be under ${MAX_DISPLAY_NAME_LENGTH} characters.`,
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed })
    .eq("id", user.id);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

/* ---------- Bio ---------- */

/**
 * Update the signed-in user's bio.
 */
export async function updateBio(bio: string): Promise<AuthResult> {
  const user = await getSignedInUser();

  if (!user) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const trimmed = bio.trim();

  if (trimmed.length > MAX_BIO_LENGTH) {
    return {
      success: false,
      data: null,
      error: `Bio must be under ${MAX_BIO_LENGTH} characters.`,
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ bio: trimmed })
    .eq("id", user.id);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}

/* ---------- Avatar ---------- */

/**
 * Upload (or replace) the signed-in user's avatar.
 * Stored at  avatar/image_{user_id}  in the `avatars` bucket,
 * and that path is saved to profiles.avatar_path.
 * Returns the public URL (with a cache-buster).
 */
export async function uploadAvatar(
  file: File
): Promise<AuthResult<{ path: string; url: string }>> {
  const user = await getSignedInUser();

  if (!user) {
    return { success: false, data: null, error: "Not signed in" };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, data: null, error: "File must be an image." };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return { success: false, data: null, error: "Image must be under 5 MB." };
  }

  const path = avatarPathFor(user.id);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      upsert: true, // overwrite the previous avatar
      contentType: file.type,
    });

  if (uploadError) {
    return { success: false, data: null, error: uploadError.message };
  }

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", user.id);

  if (dbError) {
    return { success: false, data: null, error: dbError.message };
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  return {
    success: true,
    data: { path, url: `${data.publicUrl}?t=${Date.now()}` },
    error: null,
  };
}

/* ---------- Combined ---------- */

/**
 * Convenience: update display name, bio, and/or avatar in one call.
 */
export async function updateProfile(input: {
  displayName?: string;
  bio?: string;
  avatarFile?: File | null;
}): Promise<AuthResult> {
  if (input.displayName !== undefined) {
    const res = await updateDisplayName(input.displayName);
    if (!res.success) return res;
  }

  if (input.bio !== undefined) {
    const res = await updateBio(input.bio);
    if (!res.success) return res;
  }

  if (input.avatarFile) {
    const res = await uploadAvatar(input.avatarFile);
    if (!res.success) return { success: false, data: null, error: res.error };
  }

  return { success: true, data: null, error: null };
}