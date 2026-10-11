// components/mainarea/description.tsx
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type DescriptionProps = {
  username?: string;
  description?: string;
  verified?: boolean;
  /** Per-post avatar URL. Resolved by the feed loader. */
  userImage?: string;
  /** Per-post barber id — used when the avatar is tapped. */
  barberId?: string;
  /** Called with the poster's barber id when the avatar is tapped. */
  onUserPress?: (barberId?: string) => void;
};

const FALLBACK_USERNAME = "Barber Name";
const FALLBACK_DESCRIPTION =
  "Professional barber providing quality haircuts and grooming services.";

const FALLBACK_AVATAR = "https://i.pravatar.cc/100";

export default function Description({
  username,
  description,
  verified = true,
  userImage,
  barberId,
  onUserPress,
}: DescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  const displayUsername = username ?? FALLBACK_USERNAME;
  const displayDescription = description ?? FALLBACK_DESCRIPTION;
  const resolvedUserImage = userImage ?? FALLBACK_AVATAR;

  return (
    <div className="w-full max-w-[75%] px-4 pb-2">
      <div className="flex flex-row items-center">
        <button
          type="button"
          onClick={() => onUserPress?.(barberId)}
          className="mr-2 shrink-0"
        >
          <img
            src={resolvedUserImage}
            className="h-10 w-10 rounded-full object-cover"
            alt="User"
          />
        </button>

        <span className="text-lg font-bold text-white">{displayUsername}</span>

        {verified && (
          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500">
            <Check size={13} color="#ffffff" strokeWidth={3.5} />
          </span>
        )}
      </div>

      <p
        className={`mt-1 text-sm leading-5 text-zinc-300 ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {displayDescription}
      </p>

      {displayDescription.length > 100 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1 flex flex-row items-center"
        >
          <span className="text-xs font-semibold text-white">
            {expanded ? "Less" : "More"}
          </span>

          {expanded ? (
            <ChevronUp size={15} color="#ffffff" />
          ) : (
            <ChevronDown size={15} color="#ffffff" />
          )}
        </button>
      )}
    </div>
  );
}