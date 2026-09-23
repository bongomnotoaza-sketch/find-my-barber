import { useState } from "react";

type Comment = {
  id: string;
  username: string;
  text: string;
  likes: number;
};

type CommentsPopUpProps = {
  comments?: Comment[];
  onClose?: () => void;
  onAddComment?: (text: string) => void;
};

export default function CommentsPopUp({
  comments = [],
  onClose,
  onAddComment,
}: CommentsPopUpProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onAddComment?.(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-[999] grid grid-rows-[80%_20%] bg-zinc-950 text-white"
      style={{ height: "40%" }}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-3 text-white/60 text-sm"
        >
          ✕
        </button>
      )}

      {/* 80% — comments list */}
      <div className="overflow-y-auto px-4 pt-8 pb-2">
        {comments.length === 0 ? (
          <div className="flex h-full items-center justify-center text-white/50 text-sm">
            No comments yet. Be the first to comment.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((comment) => (
              <li key={comment.id} className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-sm font-semibold">{comment.username}</p>
                  <p className="text-sm text-white/90">{comment.text}</p>
                </div>
                <div className="flex flex-col items-center text-white/60 text-xs shrink-0">
                  <span>♥</span>
                  <span>{comment.likes}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 20% — input box */}
      <div className="flex items-center gap-2 border-t border-white/10 px-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          className="flex-1 bg-zinc-900 text-white placeholder-white/40 rounded-full px-4 py-2 text-sm outline-none"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="text-sm font-semibold text-white/90 px-2"
        >
          Post
        </button>
      </div>
    </div>
  );
}