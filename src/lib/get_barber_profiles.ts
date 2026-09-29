// get_barber_profiles.ts
import { supabase } from "./superbase";
import type { User } from "@supabase/supabase-js";
import type { BarberProfile, BarberProfileResult } from "./barber_profiles";

/* ---------- Filters & pagination ---------- */

export type ListBarberProfilesOptions = {
  /** Only return barbers whose shop_name contains this (case-insensitive). */
  search?: string;
  /** Only return active barbers. Defaults to true. */
  activeOnly?: boolean;
  /** Only return verified barbers. Defaults to false. */
  verifiedOnly?: boolean;
  /** Page size. Defaults to 20. */
  limit?: number;
  /** Offset for pagination. Defaults to 0. */
  offset?: number;
  /** Column to sort by. Defaults to "created_at". */
  orderBy?:
    | "created_at"
    | "updated_at"
    | "shop_name"
    | "is_verified";
  /** Sort direction. Defaults to "desc". */
  ascending?: boolean;
};

/* ---------- Helpers ---------- */

async function getSignedInUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/* ---------- Get all barber profiles (with filters) ---------- */

/**
 * Fetch a list of barber profiles.
 * - Public by default (RLS permitting) — no sign-in required if your
 *   `barber_profiles` select policy allows anon reads.
 * - Supports search, filtering, sorting, and pagination.
 */
export async function getAllBarberProfiles(
  options: ListBarberProfilesOptions = {}
): Promise<BarberProfileResult<BarberProfile[]>> {
  const {
    search,
    activeOnly = true,
    verifiedOnly = false,
    limit = 20,
    offset = 0,
    orderBy = "created_at",
    ascending = false,
  } = options;

  let query = supabase
    .from("barber_profiles")
    .select("*")
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1);

  if (activeOnly) {
    query = query.eq("is_active", true);
  }
  if (verifiedOnly) {
    query = query.eq("is_verified", true);
  }
  if (search && search.trim().length > 0) {
    query = query.ilike("shop_name", `%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: (data ?? []) as BarberProfile[], error: null };
}

/* ---------- Get a single barber by user id ---------- */

/**
 * Fetch one barber profile by its `id` (which equals the owner's auth uid).
 */
export async function getBarberProfile(id: string): Promise<
  BarberProfileResult<BarberProfile>
> {
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

/* ---------- Get the signed-in user's own barber profile ---------- */

/**
 * Fetch the signed-in user's own barber profile (if they have one).
 */
export async function getMyBarberProfileRead(): Promise<
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

/* ---------- Count ---------- */

/**
 * Count barber profiles matching the given filters.
 * Useful for pagination UI.
 */
export async function countBarberProfiles(
  options: Pick<ListBarberProfilesOptions, "search" | "activeOnly" | "verifiedOnly"> = {}
): Promise<BarberProfileResult<number>> {
  const { search, activeOnly = true, verifiedOnly = false } = options;

  let query = supabase
    .from("barber_profiles")
    .select("*", { count: "exact", head: true });

  if (activeOnly) query = query.eq("is_active", true);
  if (verifiedOnly) query = query.eq("is_verified", true);
  if (search && search.trim().length > 0) {
    query = query.ilike("shop_name", `%${search.trim()}%`);
  }

  const { count, error } = await query;

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data: count ?? 0, error: null };
}

/* ---------- Convenience: just the array or null ---------- */

/**
 * Same as `getAllBarberProfiles` but returns the array directly (or null on error).
 * Handy when you don't need the error string.
 */
export async function getAllBarberProfilesOrNull(
  options: ListBarberProfilesOptions = {}
): Promise<BarberProfile[] | null> {
  const result = await getAllBarberProfiles(options);
  return result.success ? result.data : null;
}