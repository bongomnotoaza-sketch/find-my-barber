import type { SupabaseClient } from '@supabase/supabase-js';

/* ============================================================
 * Constants
 * ============================================================ */

export const IMAGES_BUCKET = 'images' as const;
export const IMAGES_FOLDER = 'images' as const;
export const MAX_IMAGES_PER_POST = 5 as const;

/* ============================================================
 * Types
 * ============================================================ */

export interface PostMediaInput {
  readonly image_path: string;
  readonly media_index: number;
  readonly audio_path?: string | null;
}

export interface CreatePostInput {
  readonly barber_id: string;
  readonly category: string;
  readonly description?: string | null;
  /** Song id from lib/songs.ts SONGS, or null. */
  readonly song?: string | null;
  readonly media: readonly PostMediaInput[];
}

export interface UpdatePostInput {
  readonly post_id: string;
  readonly category?: string;
  readonly description?: string | null;
  /** Song id from lib/songs.ts SONGS, or null to clear. */
  readonly song?: string | null;
  /** Full desired media list (index 0..n-1). Missing indices are deleted. */
  readonly media?: readonly PostMediaInput[];
}

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

export interface CreatePostResult {
  readonly post: Post;
  readonly media: readonly PostMedia[];
}

export interface UploadResult {
  readonly path: string;
  readonly fullPath: string;
}

export interface MediaFileInput {
  readonly file: File | Blob;
  readonly filename: string;
  readonly audio?: {
    readonly file: File | Blob;
    readonly filename: string;
  } | null;
}

export interface CreatePostWithUploadsInput {
  readonly barber_id: string;
  readonly category: string;
  readonly description?: string | null;
  /** Song id from lib/songs.ts SONGS, or null. */
  readonly song?: string | null;
  readonly media: readonly MediaFileInput[];
}

/**
 * For an update, each slot is either:
 *  - `kept`: reuse the existing DB row (PUT) — the file is unchanged.
 *  - `new`: upload this file and insert a new DB row (POST).
 * `null` means "remove this slot" (DELETE).
 */
export type MediaSlotInput =
  | { readonly kind: 'kept'; readonly media: PostMedia }
  | { readonly kind: 'new'; readonly file: MediaFileInput }
  | null;

export interface UpdatePostWithUploadsInput {
  readonly post_id: string;
  readonly category?: string;
  readonly description?: string | null;
  /** Song id from lib/songs.ts SONGS, or null to clear. */
  readonly song?: string | null;
  /**
   * Desired slots, in order. Slot 0 is the first image, slot 1 the second, etc.
   * Anything past the end of this array is deleted.
   * This is how "4 → 3" (delete one) and "1 → 3" (PUT 1 + POST 2) both work.
   */
  readonly slots: readonly MediaSlotInput[];
}

/* ============================================================
 * Errors
 * ============================================================ */

export class CreatePostError extends Error {
  readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'CreatePostError';
    this.cause = cause;
  }
}

/* ============================================================
 * Path builders
 * ============================================================ */

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function buildImagePath(barberId: string, filename: string): string {
  return `${IMAGES_FOLDER}/${barberId}/${crypto.randomUUID()}-${sanitizeFilename(filename)}`;
}

export function buildAudioPath(barberId: string, filename: string): string {
  return `${IMAGES_FOLDER}/${barberId}/audio/${crypto.randomUUID()}-${sanitizeFilename(filename)}`;
}

/* ============================================================
 * Image compression (unchanged)
 * ============================================================ */

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.78;

export async function compressImage(
  file: File | Blob,
  filename: string,
): Promise<{ file: File | Blob; filename: string }> {
  const original = { file, filename };

  if (
    !file.type.startsWith('image/') ||
    file.type === 'image/gif' ||
    file.type === 'image/svg+xml'
  ) {
    return original;
  }

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return original;
    }

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    );

    if (!blob || blob.size >= file.size) return original;

    const newName = `${filename.replace(/\.[^./]+$/, '')}.jpg`;
    return {
      file: new File([blob], newName, { type: 'image/jpeg' }),
      filename: newName,
    };
  } catch {
    return original;
  }
}

/* ============================================================
 * Storage helpers (unchanged)
 * ============================================================ */

export async function uploadImage(
  supabase: SupabaseClient,
  barberId: string,
  file: File | Blob,
  filename: string,
): Promise<UploadResult> {
  const path = buildImagePath(barberId, filename);

  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file instanceof File ? file.type : undefined,
    });

  if (error) throw new CreatePostError(`Failed to upload image: ${error.message}`, error);

  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
  return { path, fullPath: data.publicUrl };
}

export async function uploadAudio(
  supabase: SupabaseClient,
  barberId: string,
  file: File | Blob,
  filename: string,
): Promise<UploadResult> {
  const path = buildAudioPath(barberId, filename);

  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file instanceof File ? file.type : undefined,
    });

  if (error) throw new CreatePostError(`Failed to upload audio: ${error.message}`, error);

  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
  return { path, fullPath: data.publicUrl };
}

export async function deleteFiles(
  supabase: SupabaseClient,
  paths: readonly string[],
): Promise<void> {
  if (paths.length === 0) return;
  await supabase.storage.from(IMAGES_BUCKET).remove([...paths]);
}

export function getPublicUrl(supabase: SupabaseClient, path: string): string {
  return supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

/* ============================================================
 * Validation
 * ============================================================ */

function assertImageCount(count: number, label = 'post'): void {
  if (count < 1) {
    throw new CreatePostError(`${label} must have at least 1 image`);
  }
  if (count > MAX_IMAGES_PER_POST) {
    throw new CreatePostError(
      `${label} can have at most ${MAX_IMAGES_PER_POST} images`,
    );
  }
}

/* ============================================================
 * Fetch existing post media (ordered by media_index)
 * ============================================================ */

export async function getPostMedia(
  supabase: SupabaseClient,
  postId: string,
): Promise<readonly PostMedia[]> {
  const { data, error } = await supabase
    .from('post_media')
    .select('id, post_id, image_path, media_index, audio_path')
    .eq('post_id', postId)
    .order('media_index', { ascending: true });

  if (error) throw new CreatePostError(error.message, error);
  return (data ?? []) as PostMedia[];
}

/* ============================================================
 * DB-only helper (no uploads) — insert path
 * ============================================================ */

export async function createPostWithMedia(
  supabase: SupabaseClient,
  input: CreatePostInput,
): Promise<CreatePostResult> {
  const { barber_id, category, description, song, media } = input;

  assertImageCount(media.length, 'post');

  const { data, error } = await supabase.rpc('create_post_with_media', {
    p_barber_id: barber_id,
    p_category: category,
    p_description: description ?? null,
    p_song: song ?? null,
    p_media: media.map((m) => ({
      image_path: m.image_path,
      media_index: m.media_index,
      audio_path: m.audio_path ?? null,
    })),
  });

  if (error) throw new CreatePostError(error.message, error);
  if (!data) throw new CreatePostError('No data returned from create_post_with_media');

  return data as CreatePostResult;
}

/* ============================================================
 * DB-only helper (no uploads) — PUT path
 * ============================================================ */

/**
 * Update a post's fields and reconcile its media rows.
 *
 * Reconciliation (per index):
 *   - existing + desired   → PUT  (update post_media row)
 *   - desired only         → POST (insert new post_media row)
 *   - existing only        → DELETE (remove row + storage file)
 *
 * So:
 *   - 4 → 3  ⇒ PUT 3, DELETE 1
 *   - 1 → 3  ⇒ PUT 1, POST 2
 *   - 3 → 3  ⇒ PUT 3 (in place)
 */
export async function updatePostWithMedia(
  supabase: SupabaseClient,
  input: UpdatePostInput,
): Promise<CreatePostResult> {
  const { post_id, category, description, song } = input;

  // 1. Update post fields (if any were provided).
  const postPatch: Record<string, unknown> = {};
  if (category !== undefined) postPatch.category = category;
  if (description !== undefined) postPatch.description = description;
  if (song !== undefined) postPatch.song = song;
  if (Object.keys(postPatch).length > 0) {
    const { error } = await supabase
      .from('posts')
      .update(postPatch)
      .eq('id', post_id);
    if (error) throw new CreatePostError(error.message, error);
  }

  // 2. If media was supplied, reconcile it.
  const filesToDelete: string[] = [];

  if (input.media !== undefined) {
    assertImageCount(input.media.length, 'post');

    const existing = await getPostMedia(supabase, post_id);
    const byIndex = new Map<number, PostMedia>(
      existing.map((m) => [m.media_index, m]),
    );

    const desiredIndexes = new Set(input.media.map((m) => m.media_index));

    // 2a. PUT: update rows that exist at the same index.
    // 2b. POST: insert rows for new indexes.
    // 2c. DELETE: remove rows whose index is no longer present.
    const putOps: Promise<void>[] = [];
    const postOps: Promise<void>[] = [];

    for (const m of input.media) {
      const row = byIndex.get(m.media_index);

      if (row) {
        // PUT — same index, update the existing row.
        putOps.push(
          (async () => {
            const { error } = await supabase
              .from('post_media')
              .update({
                image_path: m.image_path,
                audio_path: m.audio_path ?? null,
              })
              .eq('id', row.id);
            if (error) throw new CreatePostError(error.message, error);
          })(),
        );
      } else {
        // POST — new index, insert a row.
        postOps.push(
          (async () => {
            const { error } = await supabase.from('post_media').insert({
              post_id,
              image_path: m.image_path,
              media_index: m.media_index,
              audio_path: m.audio_path ?? null,
            });
            if (error) throw new CreatePostError(error.message, error);
          })(),
        );
      }
    }

    // DELETE — rows whose index is no longer wanted.
    const deleteIds: string[] = [];
    for (const row of existing) {
      if (!desiredIndexes.has(row.media_index)) {
        deleteIds.push(row.id);
        filesToDelete.push(row.image_path);
        if (row.audio_path) filesToDelete.push(row.audio_path);
      }
    }

    await Promise.all([...putOps, ...postOps]);

    if (deleteIds.length > 0) {
      const { error } = await supabase
        .from('post_media')
        .delete()
        .in('id', deleteIds);
      if (error) throw new CreatePostError(error.message, error);

      // Clean up the now-orphaned storage files (best-effort).
      await deleteFiles(supabase, filesToDelete).catch(() => {
        /* swallow — DB is already consistent */
      });
    }
  }

  // 3. Return fresh post + media.
  const [{ data: post, error: postErr }, media] = await Promise.all([
    supabase.from('posts').select('*').eq('id', post_id).single(),
    getPostMedia(supabase, post_id),
  ]);
  if (postErr) throw new CreatePostError(postErr.message, postErr);
  if (!post) throw new CreatePostError('Post not found after update');

  return { post: post as Post, media };
}

/* ============================================================
 * Full helper: create + upload files
 * ============================================================ */

export async function createPostWithUploads(
  supabase: SupabaseClient,
  input: CreatePostWithUploadsInput,
): Promise<CreatePostResult> {
  const { barber_id, category, description, song, media } = input;

  assertImageCount(media.length, 'post');

  const uploadedPaths: string[] = [];

  try {
    const uploaded = await Promise.all(
      media.map(async (item) => {
        const [image, audio] = await Promise.all([
          uploadImage(supabase, barber_id, item.file, item.filename),
          item.audio
            ? uploadAudio(supabase, barber_id, item.audio.file, item.audio.filename)
            : Promise.resolve(null),
        ]);

        uploadedPaths.push(image.path);
        if (audio) uploadedPaths.push(audio.path);

        return { image, audio };
      }),
    );

    const mediaPayload = uploaded.map((u, index) => ({
      image_path: u.image.path,
      media_index: index,
      audio_path: u.audio?.path ?? null,
    }));

    const { data, error } = await supabase.rpc('create_post_with_media', {
      p_barber_id: barber_id,
      p_category: category,
      p_description: description ?? null,
      p_song: song ?? null,
      p_media: mediaPayload,
    });

    if (error) throw new CreatePostError(error.message, error);
    if (!data) throw new CreatePostError('No data returned from RPC');

    return data as CreatePostResult;
  } catch (err) {
    await deleteFiles(supabase, uploadedPaths).catch(() => {});
    if (err instanceof CreatePostError) throw err;
    throw new CreatePostError('Failed to create post with uploads', err);
  }
}

/* ============================================================
 * Full helper: update + upload/reconcile files  (PUT main path)
 * ============================================================ */

/**
 * Update a post, uploading any *new* files and reconciling rows:
 *   - slots[i] = { kind: 'kept', media }  → PUT   (no upload, row untouched)
 *   - slots[i] = { kind: 'new', file }    → POST  (upload + insert)
 *   - slots[i] = null                     → DELETE (row + storage files)
 *
 * "4 → 3"  → slot 4 is null ⇒ DELETE 1.
 * "1 → 3"  → slot 0 kept ⇒ PUT 1, slots 1 & 2 new ⇒ POST 2.
 * "3 → 3"  → all three kept ⇒ PUT 3 in place (no file moves).
 */
export async function updatePostWithUploads(
  supabase: SupabaseClient,
  input: UpdatePostWithUploadsInput,
): Promise<CreatePostResult> {
  const { post_id, category, description, song, slots } = input;

  // Trim trailing nulls so "remove everything after N" works.
  const trimmed = [...slots];
  while (trimmed.length > 0 && trimmed[trimmed.length - 1] === null) {
    trimmed.pop();
  }

  assertImageCount(trimmed.length, 'post');

  // Resolve the barber_id — needed for the storage path.
  const { data: postRow, error: postErr } = await supabase
    .from('posts')
    .select('barber_id')
    .eq('id', post_id)
    .single();
  if (postErr) throw new CreatePostError(postErr.message, postErr);
  if (!postRow) throw new CreatePostError('Post not found');

  const barberId = (postRow as { barber_id: string }).barber_id;

  const uploadedPaths: string[] = [];

  try {
    // 1. Upload only the "new" files, keep the rest as-is.
    const media: PostMediaInput[] = [];

    for (let index = 0; index < trimmed.length; index++) {
      const slot = trimmed[index];

      if (slot && slot.kind === 'kept') {
        media.push({
          image_path: slot.media.image_path,
          media_index: index,
          audio_path: slot.media.audio_path,
        });
      } else if (slot && slot.kind === 'new') {
        const [image, audio] = await Promise.all([
          uploadImage(supabase, barberId, slot.file.file, slot.file.filename),
          slot.file.audio
            ? uploadAudio(supabase, barberId, slot.file.audio.file, slot.file.audio.filename)
            : Promise.resolve(null),
        ]);

        uploadedPaths.push(image.path);
        if (audio) uploadedPaths.push(audio.path);

        media.push({
          image_path: image.path,
          media_index: index,
          audio_path: audio?.path ?? null,
        });
      }
      // slot === null → simply omit it from `media`; reconciliation deletes it.
    }

    // 2. Reconcile DB + storage via the PUT helper.
    return await updatePostWithMedia(supabase, {
      post_id,
      category,
      description,
      song,
      media,
    });
  } catch (err) {
    // Roll back files uploaded during this call; leave old files alone
    // (they were never deleted yet if we failed before reconciliation).
    await deleteFiles(supabase, uploadedPaths).catch(() => {});
    if (err instanceof CreatePostError) throw err;
    throw new CreatePostError('Failed to update post with uploads', err);
  }
}

/* ============================================================
 * Delete a post and its storage objects
 * ============================================================ */

/**
 * Deletes a post row (cascading `post_media`) and best-effort removes the
 * underlying storage objects. Row delete first — if that fails we throw and
 * leave storage untouched, so the user can retry without losing files.
 * If storage cleanup fails after the row is gone, we log and move on; the
 * post is already deleted from the user's perspective.
 */
export async function deletePostWithMedia(
  supabase: SupabaseClient,
  postId: string,
): Promise<void> {
  // 1. Collect storage paths before the rows disappear.
  const { data: media, error: mediaErr } = await supabase
    .from("post_media")
    .select("image_path, audio_path")
    .eq("post_id", postId);

  if (mediaErr) {
    throw new CreatePostError(mediaErr.message);
  }

  const paths = (media ?? []).flatMap((m) =>
    [m.image_path, m.audio_path].filter(
      (p): p is string => typeof p === "string" && p.length > 0,
    ),
  );

  // 2. Delete the post row (post_media cascades).
  const { error: delErr } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (delErr) {
    throw new CreatePostError(delErr.message);
  }

  // 3. Best-effort storage cleanup — never throw here.
  if (paths.length > 0) {
    const { error: storageErr } = await supabase.storage
      .from(IMAGES_BUCKET)
      .remove(paths);

    if (storageErr) {
      console.warn("Storage cleanup failed for post", postId, storageErr);
    }
  }
}