import { supabase } from "./superbase";
import type { User, Session, AuthError } from "@supabase/supabase-js";

/* ---------- Types ---------- */

export type AuthResult<T = null> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

/* ---------- Helpers ---------- */

/**
 * Format any Supabase error into a friendly string.
 */
function formatError(error: AuthError | null): string {
  if (!error) return "Unknown error";
  // Optional: map common codes to nicer messages
  switch (error.message) {
    case "Invalid login credentials":
      return "Wrong email or password.";
    case "User already registered":
      return "That email is already registered.";
    case "Email not confirmed":
      return "Please confirm your email first.";
    default:
      return error.message;
  }
}

/* ---------- Core API ---------- */

/**
 * Sign up a new user with email + password.
 * Returns the created user (and session if email confirmation is disabled).
 */
export async function signUp(
  email: string,
  password: string
): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { success: false, data: null, error: formatError(error) };
  }

  return {
    success: true,
    data: { user: data.user, session: data.session },
    error: null,
  };
}

/**
 * Sign in an existing user with email + password.
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult<{ user: User; session: Session }>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, data: null, error: formatError(error) };
  }

  return {
    success: true,
    data: { user: data.user, session: data.session },
    error: null,
  };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, data: null, error: formatError(error) };
  }

  return { success: true, data: null, error: null };
}

/**
 * Get the currently signed-in user (from local session, no network call).
 */
export async function getCurrentUser(): Promise<AuthResult<User>> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { success: false, data: null, error: formatError(error) };
  }
  if (!user) {
    return { success: false, data: null, error: "Not signed in" };
  }

  return { success: true, data: user, error: null };
}

/**
 * Send a password reset email.
 */
export async function sendPasswordReset(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    return { success: false, data: null, error: formatError(error) };
  }

  return { success: true, data: null, error: null };
}

/**
 * Subscribe to auth state changes (sign-in, sign-out, token refresh).
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}