// lib/get_posts.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAvatarUrl } from './get_profile';

/* ============================================================
 * Constants (mirror the post side)
 * ============================================================ */

export const IMAGES_BUCKET = 'images' as const;
export const IMAGES_FOLDER = 'images' as const;

/* ============================================================
 * Types
 * ============================================================ */

export interface Post {
  readonly id: string;
  readonly barber_id: string;
  readonly category: string;
  readonly description: string | null;
  /** Song id from lib/songs.ts SONGS, or null. */
  readonly song: string | null;
  readonly likes: number;
  readonly comments: number;
  readonly favourites: number;
  readonly shares: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface PostMedia {
  readonly id: string;
  readonly post_id: string;
  readonly image_path: string;
  readonly media_index: number;
  readonly audio_path: string | null;
}

/** Media enriched with resolved public URLs for direct rendering. */
export interface PostMediaWithUrls extends PostMedia {
  readonly image_url: string;
  readonly audio_url: string | null;
}

/** A post plus its resolved media. */
export interface PostWithMedia extends Post {
  readonly media: readonly PostMediaWithUrls[];
}

/** A post in the feed, with the poster's display name + avatar. */
export interface FeedPost extends PostWithMedia {
  readonly barber_display_name: string | null;
  readonly barber_avatar_url: string | null;
}

export interface GetPostsOptions {
  /** Filter by barber. Omit for a global feed. */
  readonly barberId?: string;
  /** Filter by category. */
  readonly category?: string;
  /** Max rows to return. Defaults to 20. */
  readonly limit?: number;
  /** Rows to skip for pagination. Defaults to 0. */
  readonly offset?: number;
  /** Sort direction on created_at. Defaults to 'desc'. */
  readonly order?: 'asc' | 'desc';
}

/* ============================================================
 * Errors
 * ============================================================ */

export class GetPostError extends Error {
  readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'GetPostError';
    this.cause = cause;
  }
}

/* ============================================================
 * URL helper
 * ============================================================ */

export function getPublicUrl(supabase: SupabaseClient, path: string): string {
  return supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

/* ============================================================
 * Get a single post (with media)
 * ============================================================ */

export async function getPostById(
  supabase: SupabaseClient,
  postId: string,
): Promise<PostWithMedia | null> {
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .maybeSingle();

  if (postError) throw new GetPostError(postError.message, postError);
  if (!post) return null;

  const { data: media, error: mediaError } = await supabase
    .from('post_media')
    .select('*')
    .eq('post_id', postId)
    .order('media_index', { ascending: true });

  if (mediaError) throw new GetPostError(mediaError.message, mediaError);

  return {
    ...(post as Post),
    media: (media ?? []).map((m) => decorateMedia(supabase, m as PostMedia)),
  };
}

/* ============================================================
 * Get many posts (with media)
 * ============================================================ */

export async function getPosts(
  supabase: SupabaseClient,
  options: GetPostsOptions = {},
): Promise<readonly PostWithMedia[]> {
  const {
    barberId,
    category,
    limit = 20,
    offset = 0,
    order = 'desc',
  } = options;

  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  if (barberId) query = query.eq('barber_id', barberId);
  if (category) query = query.eq('category', category);

  const { data: posts, error: postsError } = await query;
  if (postsError) throw new GetPostError(postsError.message, postsError);
  if (!posts || posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);

  const { data: media, error: mediaError } = await supabase
    .from('post_media')
    .select('*')
    .in('post_id', postIds)
    .order('media_index', { ascending: true });

  if (mediaError) throw new GetPostError(mediaError.message, mediaError);

  // Group media by post_id
  const mediaByPost = new Map<string, PostMediaWithUrls[]>();
  for (const row of (media ?? []) as PostMedia[]) {
    const list = mediaByPost.get(row.post_id) ?? [];
    list.push(decorateMedia(supabase, row));
    mediaByPost.set(row.post_id, list);
  }

  return posts.map((post) => ({
    ...(post as Post),
    media: mediaByPost.get(post.id) ?? [],
  }));
}

/* ============================================================
 * Feed loader — newest → oldest, includes barber name + avatar
 * ============================================================ */

export interface GetFeedPostsOptions
  extends Omit<GetPostsOptions, 'barberId'> {
  /** Optional: restrict the feed to barbers this user follows. */
  readonly followerId?: string;
}

/**
 * Load a feed of posts, newest first, with media URLs and the poster's
 * display name + avatar URL already attached. No pagination unless you
 * pass limit/offset.
 *
 * Implementation note: two queries instead of an embedded join, because
 * `posts.barber_id` sometimes references `auth.users` rather than
 * `public.profiles`, which makes PostgREST joins fragile. This is
 * deterministic and works with either FK setup.
 */
export async function getFeedPosts(
  supabase: SupabaseClient,
  options: GetFeedPostsOptions = {},
): Promise<readonly FeedPost[]> {
  const { limit = 50, offset = 0, order = 'desc', category } = options;

  const posts = await getPosts(supabase, {
    limit,
    offset,
    order,
    category,
  });

  if (posts.length === 0) return [];

  const barberIds = Array.from(new Set(posts.map((p) => p.barber_id)));

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_path')
    .in('id', barberIds);

  if (profilesError) {
    throw new GetPostError(profilesError.message, profilesError);
  }

  const profileById = new Map<
    string,
    { display_name: string | null; avatar_path: string | null }
  >();
  for (const p of (profiles ?? []) as {
    id: string;
    display_name: string | null;
    avatar_path: string | null;
  }[]) {
    profileById.set(p.id, {
      display_name: p.display_name,
      avatar_path: p.avatar_path,
    });
  }

  return posts.map((post) => {
    const profile = profileById.get(post.barber_id);
    return {
      ...post,
      barber_display_name: profile?.display_name ?? null,
      barber_avatar_url: getAvatarUrl(
        profile?.avatar_path ?? null,
        'avatars',
      ),
    };
  });
}

/* ============================================================
 * Convenience: feed for a barber / by category
 * ============================================================ */

export function getPostsByBarber(
  supabase: SupabaseClient,
  barberId: string,
  options: Omit<GetPostsOptions, 'barberId'> = {},
): Promise<readonly PostWithMedia[]> {
  return getPosts(supabase, { ...options, barberId });
}

export function getPostsByCategory(
  supabase: SupabaseClient,
  category: string,
  options: Omit<GetPostsOptions, 'category'> = {},
): Promise<readonly PostWithMedia[]> {
  return getPosts(supabase, { ...options, category });
}

/* ============================================================
 * Internal
 * ============================================================ */

function decorateMedia(
  supabase: SupabaseClient,
  media: PostMedia,
): PostMediaWithUrls {
  return {
    ...media,
    image_url: getPublicUrl(supabase, media.image_path),
    audio_url: media.audio_path
      ? getPublicUrl(supabase, media.audio_path)
      : null,
  };
}

/* ============================================================
 * Convenience: the single post owned by a barber
 * ============================================================ */

/**
 * Returns the barber's post (with resolved media URLs), or `null` if they
 * haven't created one yet. Deterministic: if duplicates ever exist, the
 * oldest wins — "their post", not "their latest post".
 *
 * This is the read side of the one-post-per-barber loop. The write side
 * (create-or-update) lands in a later pass.
 */
export async function getPostByBarber(
  supabase: SupabaseClient,
  barberId: string,
): Promise<PostWithMedia | null> {
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('barber_id', barberId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (postError) throw new GetPostError(postError.message, postError);
  if (!post) return null;

  const { data: media, error: mediaError } = await supabase
    .from('post_media')
    .select('*')
    .eq('post_id', post.id)
    .order('media_index', { ascending: true });

  if (mediaError) throw new GetPostError(mediaError.message, mediaError);

  return {
    ...(post as Post),
    media: (media ?? []).map((m) => decorateMedia(supabase, m as PostMedia)),
  };
}