// create_booking.ts
import { supabase } from "./superbase";
import type { User } from "@supabase/supabase-js";

/* ---------- Types ---------- */

export type Booking = {
  id: string;
  user_id: string;
  barber_id: string;
  service_id: string;
  booking_date: string; // "YYYY-MM-DD"
  created_at: string;
  name: string;
};

/**
 * Fields the caller must supply when creating a booking.
 * `id` and `created_at` are filled in by the DB.
 */
export type CreateBookingInput = {
  barber_id: string;
  service_id: string;
  name: string;
  /** "YYYY-MM-DD" or a Date (will be formatted to "YYYY-MM-DD"). */
  booking_date: string | Date;
  /**
   * Defaults to the currently signed-in user.
   * Pass explicitly if you're booking on behalf of someone else.
   */
  user_id?: string;
};

export type BookingResult<T = null> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

/* ---------- Constants ---------- */

const MAX_NAME_LENGTH = 80;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/* ---------- Helpers ---------- */

async function getSignedInUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/** Convert a Date (or string) to "YYYY-MM-DD". */
function toDateString(value: string | Date): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return DATE_RE.test(trimmed) ? trimmed : null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const dd = String(value.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

/** Validate the input. Returns an error string or null. */
function validateInput(
  input: CreateBookingInput
): string | null {
  if (!input.barber_id?.trim()) return "Barber id is required.";
  if (!input.service_id?.trim()) return "Service id is required.";

  const name = input.name?.trim();
  if (!name) return "Name cannot be empty.";
  if (name.length > MAX_NAME_LENGTH)
    return `Name must be under ${MAX_NAME_LENGTH} characters.`;

  if (!toDateString(input.booking_date))
    return "Booking date must be a valid date (YYYY-MM-DD).";

  return null;
}

/* ---------- Create ---------- */

/**
 * Insert a new row into the `bookings` table.
 *
 * - `user_id` defaults to the signed-in user.
 * - `id` and `created_at` are filled by the DB.
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<BookingResult<Booking>> {
  // 1. Auth
  const user = await getSignedInUser();
  if (!user) {
    return { success: false, data: null, error: "Not signed in." };
  }

  // 2. Validate
  const validationError = validateInput(input);
  if (validationError) {
    return { success: false, data: null, error: validationError };
  }

  // 3. Build payload
  const payload = {
    user_id: input.user_id ?? user.id,
    barber_id: input.barber_id,
    service_id: input.service_id,
    name: input.name.trim(),
    booking_date: toDateString(input.booking_date)!,
  };

  // 4. Insert
  const { data, error } = await supabase
    .from("bookings")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: data as Booking, error: null };
}