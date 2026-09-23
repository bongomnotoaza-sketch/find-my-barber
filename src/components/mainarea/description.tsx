import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type DescriptionProps = {
  username?: string;
  description?: string;
  verified?: boolean;
};

export default function Description({
  username = "Barber Name",
  description = "Professional barber providing quality haircuts and grooming services.",
  verified = true,
}: DescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute bottom-[35%] left-4 z-10 w-full max-w-[75%]">
      <div className="flex flex-row items-center">
        <span className="text-lg font-bold text-white">{username}</span>

        {verified && (
          <span className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-sky-500">
            <Check size={13} color="#ffffff" strokeWidth={3.5} />
          </span>
        )}
      </div>

      <p
        className={`mt-1 text-sm leading-5 text-zinc-300 ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {description}
      </p>

      {description.length > 100 && (
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