import { ArrowLeft, Check, Star } from "lucide-react";

type BarberHeaderProps = {
  username?: string;
  userImage?: string;
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  onBack?: () => void;
};

export default function BarberHeader({
  username = "Barber Name",
  userImage = "https://i.pravatar.cc/100",
  verified = true,
  rating = 4.8,
  reviewCount = 120,
  onBack,
}: BarberHeaderProps) {
  return (
    <div className="w-full bg-white/5 h-full">
      <div className="flex flex-row items-center py-3">
        <button
          type="button"
          onClick={onBack}
          className="mr-4 h-10 w-10 flex items-center justify-center rounded-full active:bg-white/10"
        >
          <ArrowLeft size={25} color="#ffffff" />
        </button>

        <img src={userImage} className="h-12 w-12 rounded-full object-cover" alt={username} />

        <div className="ml-3">
          <div className="flex flex-row items-center">
            <span className="text-base font-semibold text-white">{username}</span>

            {verified && (
              <span className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-sky-500">
                <Check size={13} color="#ffffff" strokeWidth={3.5} />
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-row items-center">
            <Star size={15} color="#facc15" fill="#facc15" />
            <span className="ml-1 text-sm text-white">{rating}</span>
            <span className="ml-1 text-xs text-zinc-400">({reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
}