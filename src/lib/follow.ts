// lib/follows.ts
import { supabase } from "./superbase";

const TABLE = "Following";

export async function isFollowing(barberId: string, userId: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id")
    .eq("barber_id", barberId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data: !!data };
}

export async function followBarber(barberId: string, userId: string) {
  const { error } = await supabase
    .from(TABLE)
    .insert({ barber_id: barberId, user_id: userId });

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}

export async function unfollowBarber(barberId: string, userId: string) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("barber_id", barberId)
    .eq("user_id", userId);

  if (error) return { success: false as const, error: error.message };
  return { success: true as const };
}