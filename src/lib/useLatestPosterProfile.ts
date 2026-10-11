import { useEffect, useState } from "react";
import { supabase } from "./superbase";
import { getPosts, GetPostError } from "./get_posts";
import { getProfileById, getAvatarUrl, type Profile } from "./get_profile";

export type LatestPosterProfile = {
  barberId: string | null;
  profile: Profile | null;
  avatarUrl: string | null;
  displayName: string | null;
  postDescription: string | null;
  loading: boolean;
};

/**
 * Resolves the profile of the barber who authored the latest post.
 * Shared by <Description /> and <MainNav /> so both render the same author.
 */
export function useLatestPosterProfile(): LatestPosterProfile {
  const [state, setState] = useState<LatestPosterProfile>({
    barberId: null,
    profile: null,
    avatarUrl: null,
    displayName: null,
    postDescription: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const posts = await getPosts(supabase, { limit: 1, order: "desc" });
        if (cancelled) return;

        const latest = posts[0];
        if (!latest) {
          setState((s) => ({ ...s, loading: false }));
          return;
        }

        const profile = await getProfileById(latest.barber_id);
        if (cancelled) return;

        setState({
          barberId: latest.barber_id,
          profile,
          avatarUrl: getAvatarUrl(profile?.avatar_path ?? null, "avatars"),
          displayName: profile?.display_name ?? null,
          postDescription: latest.description ?? null,
          loading: false,
        });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof GetPostError) {
          console.error("Failed to resolve latest poster:", err.message);
        } else {
          console.error("Failed to resolve latest poster:", err);
        }
        setState((s) => ({ ...s, loading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}