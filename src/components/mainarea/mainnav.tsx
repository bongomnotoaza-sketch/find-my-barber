import { useState } from "react";
import { Heart, MessageCircle, Share2, Star } from "lucide-react";

type MainNavProps = {
  userImage?: string;
  likes?: number;
  comments?: number;
  favourites?: number;
  shares?: number;
  onUserPress?: () => void;
  onCommentsPress?: () => void;
};

export default function MainNav({
  userImage = "https://i.pravatar.cc/100",
  likes = 0,
  comments = 0,
  favourites = 0,
  shares = 0,
  onUserPress,
  onCommentsPress,
}: MainNavProps) {
  const [liked, setLiked] = useState(false);
  const [favourited, setFavourited] = useState(false);
  const [likeBurst, setLikeBurst] = useState(false);
  const [favBurst, setFavBurst] = useState(false);

  const handleLike = () => {
    setLiked((prev) => !prev);
    if (!liked) {
      setLikeBurst(true);
      setTimeout(() => setLikeBurst(false), 450);
    }
  };

  const handleFavourite = () => {
    setFavourited((prev) => !prev);
    if (!favourited) {
      setFavBurst(true);
      setTimeout(() => setFavBurst(false), 450);
    }
  };

  const likeCount = likes + (liked ? 1 : 0);
  const favCount = favourites + (favourited ? 1 : 0);

  return (
    <div className="absolute bottom-40 right-4 z-10 flex flex-col items-center">
      <button
        type="button"
        onClick={onUserPress}
        className="mb-5 flex flex-col items-center"
      >
        <img
          src={userImage}
          className="h-10 w-10 rounded-full object-cover"
          alt="User"
        />
      </button>

      {/* Like / Heart */}
      <button
        type="button"
        onClick={handleLike}
        className="mb-5 flex flex-col items-center"
      >
        <Heart
          size={28}
          color={liked ? "#ef4444" : "#ffffff"}
          fill={liked ? "#ef4444" : "none"}
          className={`transition-transform duration-300 ${
            liked ? "scale-110" : "scale-100"
          } ${likeBurst ? "animate-like-burst" : ""}`}
        />
        <span className="mt-1 text-xs font-medium text-white">{likeCount}</span>
      </button>

      {/* Comments */}
      <button
        type="button"
        onClick={onCommentsPress}
        className="mb-5 flex flex-col items-center"
      >
        <MessageCircle size={28} color="#ffffff" />
        <span className="mt-1 text-xs font-medium text-white">{comments}</span>
      </button>

      {/* Favourite / Star */}
      <button
        type="button"
        onClick={handleFavourite}
        className="mb-5 flex flex-col items-center"
      >
        <Star
          size={28}
          color={favourited ? "#facc15" : "#ffffff"}
          fill={favourited ? "#facc15" : "none"}
          className={`transition-transform duration-300 ${
            favourited ? "scale-110" : "scale-100"
          } ${favBurst ? "animate-fav-burst" : ""}`}
        />
        <span className="mt-1 text-xs font-medium text-white">{favCount}</span>
      </button>

      {/* Share */}
      <button type="button" className="flex flex-col items-center">
        <Share2 size={28} color="#ffffff" />
        <span className="mt-1 text-xs font-medium text-white">{shares}</span>
      </button>
    </div>
  );
}