// footer.tsx
import { Plus, User, UserPlus, UserCheck, Loader2 } from "lucide-react";

type AppFooterProps = {
  onPlusPress?: () => void;
  onUserPress?: () => void;

  /** Follow button */
  canFollow?: boolean;         // show follow button only when barberId is known & not self
  isFollowing?: boolean;       // current follow state
  followLoading?: boolean;     // while inserting/deleting
  onFollowToggle?: () => void; // toggle handler
};

export default function AppFooter({
  onPlusPress,
  onUserPress,
  canFollow = false,
  isFollowing = false,
  followLoading = false,
  onFollowToggle,
}: AppFooterProps) {
  return (
    <footer className="w-full pb-6 pt-2">
      <div className="flex flex-row items-center justify-around px-6">
        {/* Follow / Following */}
        <button
          type="button"
          onClick={onFollowToggle}
          disabled={!canFollow || followLoading}
          aria-label={isFollowing ? "Unfollow" : "Follow"}
          className="flex flex-col items-center gap-1 disabled:opacity-40 active:opacity-70 transition-opacity"
        >
          {followLoading ? (
            <Loader2 size={25} color="#ffffff" className="animate-spin" />
          ) : isFollowing ? (
            <UserCheck size={25} color="#ffffff" />
          ) : (
            <UserPlus size={25} color="#ffffff" />
          )}
          <span className="text-[11px] font-medium text-white leading-none">
            {isFollowing ? "Following" : "Follow"}
          </span>
        </button>

        {/* Add */}
        <button
          type="button"
          onClick={onPlusPress}
          className="h-12 w-12 flex items-center justify-center rounded-full active:opacity-70"
          style={{
            backgroundColor: "rgba(249, 115, 22, 0.4)",
            border: "1.5px solid rgba(249, 115, 22, 0.6)",
          }}
        >
          <Plus size={28} color="#ffffff" strokeWidth={2.5} />
        </button>

        {/* Account */}
        <button
          type="button"
          onClick={onUserPress}
          className="flex flex-col items-center gap-1 active:opacity-70 transition-opacity"
        >
          <User size={25} color="#ffffff" />
        </button>
      </div>
    </footer>
  );
}