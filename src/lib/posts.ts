import type { SupabaseClient } from '@supabase/supabase-js';

/* ============================================================
 * Constants
 * ============================================================ */

export const IMAGES_BUCKET = 'images' as const;
export const IMAGES_FOLDER = 'images' as const;

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
  readonly media: readonly PostMediaInput[];
}

export interface Post {
  readonly id: string;
  readonly barber_id: string;
  readonly category: string;
  readonly description: string | null;
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
  readonly media: readonly MediaFileInput[];
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
 * Image compression (runs in the browser before upload)
 * ============================================================ */

const MAX_DIMENSION = 1280; // longest side, in px
const JPEG_QUALITY = 0.78;

export async function compressImage(
  file: File | Blob,
  filename: string,
): Promise<{ file: File | Blob; filename: string }> {
  const original = { file, filename };

  // Leave non-photos alone (GIFs would lose animation, SVGs are already tiny).
  if (
    !file.type.startsWith('image/') ||
    file.type === 'image/gif' ||
    file.type === 'image/svg+xml'
  ) {
    return original;
  }

  try {
    // 'from-image' applies the EXIF rotation, so phone photos don't come out sideways.
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

    // White background so transparent PNGs don't turn black as JPEG.
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    );

    // If compression didn't help (already small), keep the original.
    if (!blob || blob.size >= file.size) return original;

    const newName = `${filename.replace(/\.[^./]+$/, '')}.jpg`;
    return {
      file: new File([blob], newName, { type: 'image/jpeg' }),
      filename: newName,
    };
  } catch {
    // Never block a post because compression failed.
    return original;
  }
}

/* ============================================================
 * Storage helpers
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

export function getPublicUrl(
  supabase: SupabaseClient,
  path: string,
): string {
  return supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

/* ============================================================
 * DB-only helper (no uploads)
 * ============================================================ */

export async function createPostWithMedia(
  supabase: SupabaseClient,
  input: CreatePostInput,
): Promise<CreatePostResult> {
  const { barber_id, category, description, media } = input;

  if (media.length === 0) {
    throw new CreatePostError('At least one media item is required');
  }

  const { data, error } = await supabase.rpc('create_post_with_media', {
    p_barber_id: barber_id,
    p_category: category,
    p_description: description ?? null,
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
 * Full helper: upload files + insert DB rows
 * ============================================================ */

export async function createPostWithUploads(
  supabase: SupabaseClient,
  input: CreatePostWithUploadsInput,
): Promise<CreatePostResult> {
  const { barber_id, category, description, media } = input;

  if (media.length === 0) {
    throw new CreatePostError('At least one media item is required');
  }

  const uploadedPaths: string[] = [];

  try {
    // 1. Upload all files in parallel
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

    // 2. Insert DB rows atomically via RPC
    const mediaPayload = uploaded.map((u, index) => ({
      image_path: u.image.path,
      media_index: index,
      audio_path: u.audio?.path ?? null,
    }));

    const { data, error } = await supabase.rpc('create_post_with_media', {
      p_barber_id: barber_id,
      p_category: category,
      p_description: description ?? null,
      p_media: mediaPayload,
    });

    if (error) throw new CreatePostError(error.message, error);
    if (!data) throw new CreatePostError('No data returned from RPC');

    return data as CreatePostResult;
  } catch (err) {
    // 3. Roll back uploaded files if anything failed
    await deleteFiles(supabase, uploadedPaths).catch(() => {
      /* swallow — we already have an error to report */
    });

    if (err instanceof CreatePostError) throw err;
    throw new CreatePostError('Failed to create post with uploads', err);
  }
}