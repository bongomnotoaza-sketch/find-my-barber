// barber_services.ts
import { supabase } from "./superbase";
import type { User } from "@supabase/supabase-js";

/* ---------- Types ---------- */

export type BarberService = {
  id: string;
  barber_id: string;
  name: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  service_code: string | null;
};

/**
 * Fields the caller must supply when creating a barber service.
 * `id`, `is_active`, `created_at`, `updated_at` are handled by the DB.
 */
export type CreateBarberServiceInput = {
  name: string;
  price: number;
  service_code?: string | null;
  /** Defaults to the currently signed-in user if omitted. */
  barber_id?: string;
};

export type BarberServiceResult<T = null> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

/* ---------- Constants ---------- */

const MAX_NAME_LENGTH = 80;
const MAX_SERVICE_CODE_LENGTH = 40;

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

/** Validate a create input. Returns an error string or null. */
function validateInput(input: CreateBarberServiceInput): string | null {
  const name = input.name?.trim();
  if (!name) return "Service name cannot be empty.";
  if (name.length > MAX_NAME_LENGTH)
    return `Service name must be under ${MAX_NAME_LENGTH} characters.`;

  if (input.price === undefined || input.price === null)
    return "Price is required.";
  if (typeof input.price !== "number" || Number.isNaN(input.price))
    return "Price must be a number.";
  if (input.price < 0) return "Price cannot be negative.";

  if (typeof input.service_code === "string") {
    const code = input.service_code.trim();
    if (code.length > MAX_SERVICE_CODE_LENGTH)
      return `Service code must be under ${MAX_SERVICE_CODE_LENGTH} characters.`;
  }

  return null;
}

/* ---------- Create ---------- */

/**
 * Insert a new row into the `barber_services` table.
 *
 * - `barber_id` defaults to the signed-in user's id.
 * - `is_active`, `created_at`, `updated_at`, `id` are filled by the DB.
 */
export async function createBarberService(
  input: CreateBarberServiceInput
): Promise<BarberServiceResult<BarberService>> {
  // 1. Get the authenticated user.
  const user = await getSignedInUser();

  if (!user) {
    return {
      success: false,
      data: null,
      error: "Not signed in.",
    };
  }

  // 2. Validate the service input.
  const validationError = validateInput(input);

  if (validationError) {
    return {
      success: false,
      data: null,
      error: validationError,
    };
  }

  // 3. Retrieve the user's barber profile.
  const {
    data: barberProfile,
    error: profileError,
  } = await supabase
    .from("barber_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to retrieve barber profile:", profileError);

    return {
      success: false,
      data: null,
      error: `Failed to retrieve barber profile: ${profileError.message}`,
    };
  }

  if (!barberProfile) {
    console.error("No barber profile found for user:", user.id);

    return {
      success: false,
      data: null,
      error: "No barber profile exists for this account.",
    };
  }

  // 4. Prevent inserting services for another barber.
  if (
    input.barber_id !== undefined &&
    input.barber_id !== barberProfile.id
  ) {
    return {
      success: false,
      data: null,
      error: "You can only create services for your own barber profile.",
    };
  }

  // 5. Prepare the insert payload.
  const payload = {
    barber_id: barberProfile.id,
    name: input.name.trim(),
    price: input.price,
    service_code: trimOrNull(input.service_code),
  };

  // 6. Log the IDs and payload for debugging.
  console.log("Service insert debug:", {
    authenticatedUserId: user.id,
    barberId: barberProfile.id,
    payload,
  });

  // 7. Insert the service into Supabase.
  const { data, error } = await supabase
    .from("barber_services")
    .insert(payload)
    .select()
    .single();

  // 8. Handle any database or RLS error.
  if (error) {
    console.error("Failed to create barber service:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      authenticatedUserId: user.id,
      barberId: barberProfile.id,
      payload,
    });

    return {
      success: false,
      data: null,
      error: error.message,
    };
  }

  // 9. Return the created service.
  console.log("Barber service created successfully:", data);

  return {
    success: true,
    data: data as BarberService,
    error: null,
  };
}

/* ---------- Types ---------- */

export type BarberServiceSummary = {
  id: string;
  name: string;
  price: number;
  service_code: string | null;
};

/* ---------- Read ---------- */

/**
 * Fetch all services for a given barber.
 * Returns id, name, price, and service_code.
 */
export async function getBarberServices(
  barberId: string
): Promise<BarberServiceResult<BarberServiceSummary[]>> {
  if (!barberId) {
    return { success: false, data: null, error: "Barber id is required." };
  }

  const { data, error } = await supabase
    .from("barber_services")
    .select("id, name, price, service_code")
    .eq("barber_id", barberId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return {
    success: true,
    data: (data ?? []) as BarberServiceSummary[],
    error: null,
  };
}