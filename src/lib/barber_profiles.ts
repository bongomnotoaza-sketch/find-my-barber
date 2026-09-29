// barber_profiles.ts
import { supabase } from "./superbase";
import type { User } from "@supabase/supabase-js";

/* ---------- Types ---------- */

export type BarberProfile = {
  id: string;
  shop_name: string;
  address: string;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  account_number: string;
  account_holder: string;
};

/**
 * Fields the caller must supply when creating a barber profile.
 * Everything else is filled in by defaults or the DB.
 */
export type CreateBarberProfileInput = {
  shop_name: string;
  address: string;
  account_number: string;
  account_holder: string;

  // optional
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
};

/**
 * Fields the caller can update. All optional.
 */
export type UpdateBarberProfileInput = Partial<CreateBarberProfileInput> & {
  is_active?: boolean;
};

export type BarberProfileResult<T = null> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

/* ---------- Constants ---------- */

const MAX_SHOP_NAME_LENGTH = 80;
const MAX_ADDRESS_LENGTH = 200;
const MAX_URL_LENGTH = 200;
const MAX_ACCOUNT_NUMBER_LENGTH = 20;

/* ---------- Helpers ---------- */

async function getSignedInUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

function trimOrNull(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/** Validate a create/update input. Returns an error string or null. */
function validateInput(input: Partial<CreateBarberProfileInput>): string | null {
  if (input.shop_name !== undefined) {
    const v = input.shop_name.trim();
    if (v.length === 0) return "Shop name cannot be empty.";
    if (v.length > MAX_SHOP_NAME_LENGTH)
      return `Shop name must be under ${MAX_SHOP_NAME_LENGTH} characters.`;
  }

  if (input.address !== undefined) {
    const v = input.address.trim();
    if (v.length === 0) return "Address cannot be empty.";
    if (v.length > MAX_ADDRESS_LENGTH)
      return `Address must be under ${MAX_ADDRESS_LENGTH} characters.`;
  }

  if (input.account_number !== undefined) {
    const v = input.account_number.trim();
    if (v.length === 0) return "Account number cannot be empty.";
    if (!/^\d+$/.test(v)) return "Account number must contain only digits.";
    if (v.length > MAX_ACCOUNT_NUMBER_LENGTH)
      return `Account number must be under ${MAX_ACCOUNT_NUMBER_LENGTH} digits.`;
  }

  if (input.account_holder !== undefined) {
    const v = input.account_holder.trim();
    if (v.length === 0) return "Account holder cannot be empty.";
  }

  const urlFields: (keyof CreateBarberProfileInput)[] = [
    "instagram",
    "facebook",
    "twitter",
  ];
  for (const field of urlFields) {
    const v = input[field];
    if (typeof v === "string" && v.length > MAX_URL_LENGTH) {
      return `${field} must be under ${MAX_URL_LENGTH} characters.`;
    }
  }

  return null;
}

/* ---------- Create ---------- */

/**
 * Create a barber_profiles row for the currently signed-in user.
 * `id` is taken from auth.uid(), so each user has exactly one barber profile.
 */
export async function createBarberProfile(
  input: CreateBarberProfileInput
): Promise<BarberProfileResult<BarberProfile>> {
  const user = await getSignedInUser();
  if (!user) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const validationError = validateInput(input);
  if (validationError) {
    return { success: false, data: null, error: validationError };
  }

  const payload = {
    id: user.id,
    shop_name: input.shop_name.trim(),
    address: input.address.trim(),
    account_number: input.account_number.trim(),
    account_holder: input.account_holder.trim(),
    whatsapp: trimOrNull(input.whatsapp),
    phone: trimOrNull(input.phone),
    email: trimOrNull(input.email),
    instagram: trimOrNull(input.instagram),
    facebook: trimOrNull(input.facebook),
    twitter: trimOrNull(input.twitter),
  };

  const { data, error } = await supabase
    .from("barber_profiles")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: data as BarberProfile, error: null };
}

/* ---------- Update ---------- */

/**
 * Update the signed-in user's barber profile.
 */
export async function updateBarberProfile(
  input: UpdateBarberProfileInput
): Promise<BarberProfileResult<BarberProfile>> {
  const user = await getSignedInUser();
  if (!user) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const validationError = validateInput(input);
  if (validationError) {
    return { success: false, data: null, error: validationError };
  }

  // Build a clean patch object with only the fields the caller supplied
  const patch: Record<string, unknown> = {};
  if (input.shop_name !== undefined) patch.shop_name = input.shop_name.trim();
  if (input.address !== undefined) patch.address = input.address.trim();
  if (input.account_number !== undefined)
    patch.account_number = input.account_number.trim();
  if (input.account_holder !== undefined)
    patch.account_holder = input.account_holder.trim();
  if (input.whatsapp !== undefined) patch.whatsapp = trimOrNull(input.whatsapp);
  if (input.phone !== undefined) patch.phone = trimOrNull(input.phone);
  if (input.email !== undefined) patch.email = trimOrNull(input.email);
  if (input.instagram !== undefined) patch.instagram = trimOrNull(input.instagram);
  if (input.facebook !== undefined) patch.facebook = trimOrNull(input.facebook);
  if (input.twitter !== undefined) patch.twitter = trimOrNull(input.twitter);
  if (input.is_active !== undefined) patch.is_active = input.is_active;

  if (Object.keys(patch).length === 0) {
    return { success: false, data: null, error: "Nothing to update." };
  }

  const { data, error } = await supabase
    .from("barber_profiles")
    .update(patch)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: data as BarberProfile, error: null };
}

/* ---------- Read ---------- */

/**
 * Fetch the signed-in user's own barber profile.
 */
export async function getMyBarberProfile(): Promise<
  BarberProfileResult<BarberProfile>
> {
  const user = await getSignedInUser();
  if (!user) {
    return { success: false, data: null, error: "Not signed in" };
  }

  const { data, error } = await supabase
    .from("barber_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { success: false, data: null, error: error.message };
  }
  if (!data) {
    return { success: false, data: null, error: "Barber profile not found." };
  }

  return { success: true, data: data as BarberProfile, error: null };
}

/**
 * Fetch any barber profile by user id (public read).
 */
export async function getBarberProfileById(
  id: string
): Promise<BarberProfileResult<BarberProfile>> {
  const { data, error } = await supabase
    .from("barber_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { success: false, data: null, error: error.message };
  }
  if (!data) {
    return { success: false, data: null, error: "Barber profile not found." };
  }

  return { success: true, data: data as BarberProfile, error: null };
}

/* ---------- Combined upsert ---------- */

/**
 * Create the barber profile if it doesn't exist yet, otherwise update it.
 * Handy for a single "save barber details" form.
 */
export async function saveBarberProfile(
  input: CreateBarberProfileInput
): Promise<BarberProfileResult<BarberProfile>> {
  const existing = await getMyBarberProfile();

  if (existing.success) {
    return updateBarberProfile(input);
  }

  // If it errored for any reason other than "not found", surface that error
  if (existing.error !== "Barber profile not found.") {
    return { success: false, data: null, error: existing.error };
  }

  return createBarberProfile(input);
}