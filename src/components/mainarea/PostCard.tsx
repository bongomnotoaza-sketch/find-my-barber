// components/mainarea/PostCard.tsx
import { motion } from "motion/react";
import { ImagePlus } from "lucide-react";
import MainImage from "./mainimage";
import Description from "./description";
import AppFooter from "./footer";
import type { FeedPost } from "../../lib/get_posts";

type PostCardProps = {
  post: FeedPost;
  /** Optional override; defaults to post.media[].image_url */
  images?: string[];
  /** Only mount heavy media when the card is on or next to the screen. */
  shouldLoad?: boolean;
  isBarber: boolean;
  canFollow: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  onFollowToggle: () => void;
  onPlusPress: () => void;
  /** Tapping the avatar / username — opens the barber's profile. */
  onUserPress: () => void;
  /** Tapping the profile icon in the bottom footer — opens the sidebar. */
  onSidebarPress: () => void;
};

export default function PostCard({
  post,
  images,
  shouldLoad = true,
  isBarber,
  canFollow,
  isFollowing,
  followLoading,
  onFollowToggle,
  onPlusPress,
  onUserPress,
  onSidebarPress,
}: PostCardProps) {
  const resolvedImages =
    images && images.length > 0
      ? images
      : post.media.map((m) => m.image_url);

  return (
    <section className="relative h-dvh w-full shrink-0 snap-start overflow-hidden bg-zinc-950">
      <div className="absolute inset-0">
        {shouldLoad && <MainImage images={resolvedImages} />}
      </div>

      {isBarber && (
        <motion.button
          type="button"
          onClick={onPlusPress}
          className="absolute bottom-28 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-lg"
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          aria-label="Book"
        >
          <ImagePlus size={22} />
        </motion.button>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col">
        <Description
          username={post.barber_display_name ?? undefined}
          description={post.description ?? undefined}
          userImage={post.barber_avatar_url ?? undefined}
          barberId={post.barber_id}
          onUserPress={onUserPress}
        />

        {/* Bottom footer — profile icon tap opens the sidebar */}
        <AppFooter
          onPlusPress={onPlusPress}
          onUserPress={onSidebarPress}
          canFollow={canFollow}
          isFollowing={isFollowing}
          followLoading={followLoading}
          onFollowToggle={onFollowToggle}
        />
      </div>
    </section>
  );
}