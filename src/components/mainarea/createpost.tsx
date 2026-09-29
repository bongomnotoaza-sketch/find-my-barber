import { useRef, useState } from "react";
import { ImagePlus, Music, X, Send } from "lucide-react";

type CreatePostProps = {
  onPost?: (
    images: File[],
    song: string | null
  ) => void | Promise<void>;
};

export default function CreatePost({ onPost }: CreatePostProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [song, setSong] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const MAX_IMAGES = 5;

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const selectedFiles = files.slice(0, remainingSlots);

    const newPreviews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImages((current) => [...current, ...selectedFiles]);
    setImagePreviews((current) => [...current, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);

    setImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );

    setImagePreviews((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  const clearImages = () => {
    imagePreviews.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });

    setImages([]);
    setImagePreviews([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePost = async () => {
    if (!images.length || isPosting) return;

    try {
      setIsPosting(true);

      await onPost?.(images, song);

      clearImages();
      setSong(null);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold text-white">
            Create Post
          </h1>

          <p className="mt-0.5 text-sm text-white/50">
            Share your latest work
          </p>
        </div>

        {images.length > 0 && (
          <span className="text-xs text-white/40">
            {images.length}/{MAX_IMAGES} images
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto p-5">
        {/* Images */}
        <div className="flex flex-1 items-center justify-center">
          {images.length > 0 ? (
            <div className="w-full max-w-2xl">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={preview}
                    className="group relative aspect-square overflow-hidden rounded-2xl bg-black"
                  >
                    <img
                      src={preview}
                      alt={`Post image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {/* Remove image */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md transition hover:bg-black"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X size={16} />
                    </button>

                    {/* Image number */}
                    <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                      {index + 1}
                    </div>
                  </div>
                ))}

                {/* Add image */}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] text-white/50 transition hover:border-white/40 hover:bg-white/[0.05] hover:text-white"
                  >
                    <ImagePlus size={28} strokeWidth={1.5} />

                    <span className="mt-2 text-xs">
                      Add image
                    </span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square w-full max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] text-white/60 transition hover:border-white/40 hover:bg-white/[0.05] hover:text-white"
            >
              <ImagePlus size={42} strokeWidth={1.5} />

              <span className="mt-4 text-sm font-medium">
                Upload images
              </span>

              <span className="mt-1 text-xs text-white/40">
                Add up to 5 images
              </span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Controls */}
        <div className="mt-6 space-y-3">
          {/* Add Images */}
          {images.length > 0 && images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-white transition hover:bg-white/[0.06]"
            >
              <ImagePlus size={19} />

              <span>
                Add images
              </span>
            </button>
          )}

          {/* Song */}
          <button
            type="button"
            onClick={() => {
              // Replace with your song picker later.
              setSong(song ? null : "Selected Song");
            }}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.06]"
          >
            <div className="flex items-center gap-3">
              <Music size={19} className="text-white/70" />

              <div>
                <p className="text-sm font-medium text-white">
                  {song || "Choose a song"}
                </p>

                <p className="text-xs text-white/40">
                  Add music to your post
                </p>
              </div>
            </div>

            {song && (
              <X
                size={17}
                className="text-white/50"
                onClick={(event) => {
                  event.stopPropagation();
                  setSong(null);
                }}
              />
            )}
          </button>

          {/* Post */}
          <button
            type="button"
            disabled={!images.length || isPosting}
            onClick={handlePost}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Send size={18} />

            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}