import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Send,
  X,
} from "lucide-react";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

const MAX_DESCRIPTION = 500;

// Default categories for a barber service.
const CATEGORIES = [
  "Haircut",
  "Beard Trim",
  "Hot Towel Shave",
  "Fade",
  "Line Up",
  "Hair Coloring",
  "Kids Cut",
  "Styling",
  "Before & After",
  "Shop Update",
] as const;

export type Category = (typeof CATEGORIES)[number];

type Item = {
  id: string;
  file: File;
  url: string;
};

type CreatePostProps = {
  onPost?: (
    images: File[],
    description: string,
    category: Category | null
  ) => void | Promise<void>;
};

// File.type is sometimes empty for HEIC, so fall back to the extension.
const isAllowedImage = (file: File) =>
  /^image\/(jpeg|png|webp|heic|heif)$/.test(file.type) ||
  /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);

const hasFiles = (event: React.DragEvent) =>
  Array.from(event.dataTransfer.types).includes("Files");

export default function CreatePost({ onPost }: CreatePostProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFileOver, setIsFileOver] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // Release all object URLs on unmount.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const isFull = items.length >= MAX_IMAGES;
  const openPicker = () => fileInputRef.current?.click();

  /* ---------- Adding images ---------- */

  const addFiles = (incoming: File[]) => {
    if (!incoming.length || isPosting) return;

    const problems: string[] = [];

    const typeOk = incoming.filter(isAllowedImage);
    if (typeOk.length < incoming.length) {
      problems.push("Only JPEG, PNG, WebP, and HEIC images are supported.");
    }

    const sizeOk = typeOk.filter((file) => file.size <= MAX_SIZE_BYTES);
    if (sizeOk.length < typeOk.length) {
      problems.push(`Images must be under ${MAX_SIZE_MB} MB.`);
    }

    const slots = MAX_IMAGES - items.length;
    const accepted = sizeOk.slice(0, slots);
    if (sizeOk.length > slots) {
      problems.push(
        `You can add up to ${MAX_IMAGES} images. ${sizeOk.length - slots} skipped.`
      );
    }

    setError(problems.length ? problems.join(" ") : null);

    if (accepted.length) {
      setItems((current) => [
        ...current,
        ...accepted.map((file) => ({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
        })),
      ]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files || []));
    event.target.value = "";
  };

  /* ---------- Removing and reordering ---------- */

  const removeImage = (id: string) => {
    if (isPosting) return;
    const target = items.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setItems((current) => current.filter((item) => item.id !== id));
    setError(null);
  };

  const moveImage = (from: number, to: number) => {
    if (isPosting || from === to || to < 0 || to >= items.length) return;
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  /* ---------- Drag and drop: files in ---------- */

  const handleZoneDragOver = (event: React.DragEvent) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    if (!isPosting && !isFull) setIsFileOver(true);
  };

  const handleZoneDragLeave = (event: React.DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFileOver(false);
    }
  };

  const handleZoneDrop = (event: React.DragEvent) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    setIsFileOver(false);
    if (isFull) {
      setError(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }
    addFiles(Array.from(event.dataTransfer.files));
  };

  /* ---------- Drag and drop: reordering tiles ---------- */

  const endTileDrag = () => {
    setDraggedId(null);
    setDropTargetId(null);
  };

  const handleTileDrop = (event: React.DragEvent, targetId: string) => {
    if (!draggedId) return;
    event.preventDefault();
    event.stopPropagation();
    const from = items.findIndex((item) => item.id === draggedId);
    const to = items.findIndex((item) => item.id === targetId);
    moveImage(from, to);
    endTileDrag();
  };

  /* ---------- Posting ---------- */

  const handlePost = async () => {
    if (!items.length || isPosting) return;

    setError(null);
    setIsPosting(true);

    try {
      await onPost?.(
        items.map((item) => item.file),
        description.trim(),
        category
      );
      items.forEach((item) => URL.revokeObjectURL(item.url));
      setItems([]);
      setDescription("");
      setCategory(null);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Couldn't publish your post. Check your connection and try again."
      );
    } finally {
      setIsPosting(false);
    }
  };

  /* ---------- Render ---------- */

  const addTileClasses =
    "flex flex-col items-center justify-center rounded-2xl border border-dashed transition disabled:cursor-not-allowed disabled:opacity-40";
  const addTileIdle =
    "border-white/20 bg-white/[0.03] text-white/50 hover:border-white/40 hover:bg-white/[0.05] hover:text-white";
  const addTileActive = "border-white/60 bg-white/[0.08] text-white";

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold text-white">Create Post</h1>
          <p className="mt-0.5 text-sm text-white/50">Share your latest work</p>
        </div>

        {items.length > 0 && (
          <span className="text-xs text-white/40">
            {items.length}/{MAX_IMAGES} images
          </span>
        )}
      </div>

      {/* Content (scrollable) */}
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-5"
        onDragOver={handleZoneDragOver}
        onDragLeave={handleZoneDragLeave}
        onDrop={handleZoneDrop}
      >
        {/* Images */}
        <div className="flex flex-1 items-center justify-center">
          {items.length > 0 ? (
            <div className="w-full max-w-2xl">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {items.map((item, index) => {
                  const isDragged = draggedId === item.id;
                  const isTarget =
                    dropTargetId === item.id && draggedId !== item.id;

                  return (
                    <li
                      key={item.id}
                      draggable={!isPosting && items.length > 1}
                      onDragStart={(event) => {
                        setDraggedId(item.id);
                        event.dataTransfer.effectAllowed = "move";
                        // Firefox needs data set for a drag to start.
                        event.dataTransfer.setData("text/plain", item.id);
                      }}
                      onDragOver={(event) => {
                        if (!draggedId) return;
                        event.preventDefault();
                        setDropTargetId(item.id);
                      }}
                      onDrop={(event) => handleTileDrop(event, item.id)}
                      onDragEnd={endTileDrag}
                      className={`group relative aspect-square overflow-hidden rounded-2xl bg-black transition ${
                        isDragged ? "opacity-40" : ""
                      } ${isTarget ? "ring-2 ring-white/70" : ""}`}
                    >
                      <img
                        src={item.url}
                        alt={`Post image ${index + 1} of ${items.length}`}
                        draggable={false}
                        className="h-full w-full object-cover"
                      />

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeImage(item.id)}
                        disabled={isPosting}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md transition hover:bg-black disabled:opacity-40"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X size={16} />
                      </button>

                      {/* Position */}
                      <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                        {index === 0 ? "Cover" : index + 1}
                      </div>

                      {/* Reorder */}
                      {items.length > 1 && (
                        <div className="absolute bottom-2 right-2 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => moveImage(index, index - 1)}
                            disabled={isPosting || index === 0}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Move image ${index + 1} earlier`}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(index, index + 1)}
                            disabled={isPosting || index === items.length - 1}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Move image ${index + 1} later`}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}

                {/* Add image */}
                {!isFull && (
                  <li>
                    <button
                      type="button"
                      onClick={openPicker}
                      disabled={isPosting}
                      className={`${addTileClasses} aspect-square w-full ${
                        isFileOver ? addTileActive : addTileIdle
                      }`}
                    >
                      <ImagePlus size={28} strokeWidth={1.5} />
                      <span className="mt-2 text-xs">
                        {isFileOver ? "Drop to add" : "Add image"}
                      </span>
                    </button>
                  </li>
                )}
              </ul>

              {items.length > 1 && (
                <p className="mt-3 text-xs text-white/40">
                  Drag images or use the arrows to change their order. The first
                  image is the cover.
                </p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openPicker}
              disabled={isPosting}
              className={`${addTileClasses} aspect-square w-full max-w-md ${
                isFileOver ? addTileActive : addTileIdle
              }`}
            >
              <ImagePlus size={42} strokeWidth={1.5} />
              <span className="mt-4 text-sm font-medium">
                {isFileOver ? "Drop to add" : "Upload images"}
              </span>
              <span className="mt-1 text-xs text-white/40">
                Drag and drop or click. Up to {MAX_IMAGES} images, {MAX_SIZE_MB}{" "}
                MB each.
              </span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Controls */}
        <div className="mt-6 space-y-3">
          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((option) => {
                const selected = category === option;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={isPosting}
                    onClick={() =>
                      setCategory((current) =>
                        current === option ? null : option
                      )
                    }
                    aria-pressed={selected}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-40 ${
                      selected
                        ? "border-white bg-white text-black"
                        : "border-white/15 bg-white/[0.03] text-white/70 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="post-description"
              className="mb-1.5 block text-xs font-medium text-white/60"
            >
              Description
            </label>
            <textarea
              id="post-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value.slice(0, MAX_DESCRIPTION))
              }
              disabled={isPosting}
              rows={3}
              maxLength={MAX_DESCRIPTION}
              placeholder="Describe your work, the cut, products used, or anything else…"
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/40 focus:bg-white/[0.06] disabled:opacity-40"
            />
            <p className="mt-1 text-right text-[11px] text-white/40">
              {description.length}/{MAX_DESCRIPTION}
            </p>
          </div>

          {/* Error */}
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Pinned footer */}
      <div className="shrink-0 border-t border-white/10 bg-zinc-950 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          disabled={!items.length || isPosting}
          onClick={handlePost}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Send size={18} />
          {isPosting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}