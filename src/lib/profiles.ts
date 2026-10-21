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

async function getSignedInUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/* ---------- PUT (update only) ---------- */

/**
 * PUT-style update of the signed-in user's profile.
 *
 * The profile row is assumed to always exist, so every field is written
 * with a single `.update()` (no insert / no existence check).
 *
 * - `email` and `phone_number` are guaranteed to exist and are written
 *   as-is (no checks).
 * - `display_name`, `bio`, and the avatar keep their existing validation.
 *
 * Only supplied fields are written.
 */
export async function putProfile(input: {
  displayName?: string;
  bio?: string;
  email?: string;
  phoneNumber?: string;
  avatarFile?: File | null;
}): Promise<AuthResult> {
  const user = await getSignedInUser();
  if (!user) {
    return { success: false, data: null, error: "Not signed in" };
  }

  /* ---------- display name (existing checks) ---------- */
  if (input.displayName !== undefined) {
    const trimmed = input.displayName.trim();
    if (trimmed.length === 0) {
      return {
        success: false,
        data: null,
        error: "Display name cannot be empty.",
      };
    }
    if (trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
      return {
        success: false,
        data: null,
        error: `Display name must be under ${MAX_DISPLAY_NAME_LENGTH} characters.`,
      };
    }
  }

  /* ---------- bio (existing checks) ---------- */
  if (input.bio !== undefined) {
    if (input.bio.trim().length > MAX_BIO_LENGTH) {
      return {
        success: false,
        data: null,
        error: `Bio must be under ${MAX_BIO_LENGTH} characters.`,
      };
    }
  }

  /* ---------- avatar (existing checks) ---------- */
  if (input.avatarFile) {
    if (!input.avatarFile.type.startsWith("image/")) {
      return { success: false, data: null, error: "File must be an image." };
    }
    if (input.avatarFile.size > MAX_AVATAR_BYTES) {
      return { success: false, data: null, error: "Image must be under 5 MB." };
    }
  }

  // email + phoneNumber: no checks — they always exist, write as-is.

  /* ---------- upload avatar first (if any) ---------- */
  const path = avatarPathFor(user.id);
  if (input.avatarFile) {
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, input.avatarFile, {
        upsert: true,
        contentType: input.avatarFile.type,
      });
    if (uploadError) {
      return { success: false, data: null, error: uploadError.message };
    }
  }

  /* ---------- build payload (only supplied fields) ---------- */
  const payload: Record<string, unknown> = {};
  if (input.displayName !== undefined)
    payload.display_name = input.displayName.trim();
  if (input.bio !== undefined) payload.bio = input.bio.trim();
  if (input.email !== undefined) payload.email = input.email;
  if (input.phoneNumber !== undefined)
    payload.phone_number = input.phoneNumber;
  if (input.avatarFile) payload.avatar_path = path;

  if (Object.keys(payload).length === 0) {
    return { success: true, data: null, error: null };
  }

  /* ---------- PUT: update the existing row ---------- */
  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: null, error: null };
}