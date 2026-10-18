// src/components/mainarea/searchresult.tsx
import { Check } from "lucide-react";

type MusicPlayerProps = {
  image: string;
  barberName: string;
  bio: string;
  onPress?: () => void;
};

export default function MusicPlayer({
  image,
  barberName,
  bio,
  onPress,
}: MusicPlayerProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full h-full grid grid-rows-[70%_30%] text-left active:opacity-90"
    >
      {/* Top section: Image */}
      <div className="w-full h-full overflow-hidden">
        <img
          src={image}
          alt={barberName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bottom section: Barber information */}
      <div className="w-full h-full min-h-0 overflow-hidden bg-white border-b-4 border-b-transparent [border-image:linear-gradient(to_right,#ec4899,#ef4444,#f97316)_1] flex flex-col items-start justify-start p-3">
        {/* Barber name and verification badge */}
        <div className="flex items-center gap-1 w-full min-w-0">
          <h2 className="font-semibold text-base truncate bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
            {barberName}
          </h2>

          {/* Blue badge with white tick */}
          <div className="w-4 h-4 shrink-0 rounded-full bg-blue-500 flex items-center justify-center">
            <Check size={11} strokeWidth={3} className="text-white" />
          </div>
        </div>

        {/* Barber bio */}
        <p className="mt-1 text-xs text-black leading-relaxed line-clamp-3">
          {bio}
        </p>
      </div>
    </button>
  );
}