import { ArrowLeft, Check, Star, Scissors, Users, Award } from "lucide-react";

type BarberHeaderProps = {
  username?: string;
  userImage?: string;
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  bio?: string;
  haircutsCompleted?: number;
  clientsServed?: number;
  yearsExperience?: number;
  onBack?: () => void;
};

export default function BarberHeader({
  username = "Barber Name",
  userImage = "https://i.pravatar.cc/100",
  verified = true,
  rating = 4.8,
  reviewCount = 120,
  bio = "Passionate barber with a sharp eye for detail. Specializing in fades, beard grooming, and classic cuts.",
  haircutsCompleted = 1240,
  clientsServed = 380,
  yearsExperience = 6,
  onBack,
}: BarberHeaderProps) {
  return (
    <div className="w-full bg-white/5 h-full relative">
      {/* Back button stays pinned to the left */}
      <button
        type="button"
        onClick={onBack}
        className="absolute left-0 top-0 h-10 w-10 flex items-center justify-center rounded-full active:bg-white/10"
      >
        <ArrowLeft size={25} color="#ffffff" />
      </button>

      <div className="flex flex-col items-center text-center px-4 pt-2">
        <img
          src={userImage}
          className="h-16 w-16 rounded-full object-cover"
          alt={username}
        />

        <div className="mt-2 flex flex-row items-center justify-center">
          <span className="text-base font-semibold text-white">{username}</span>

          {verified && (
            <span className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-sky-500">
              <Check size={13} color="#ffffff" strokeWidth={3.5} />
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-row items-center justify-center">
          <Star size={15} color="#facc15" fill="#facc15" />
          <span className="ml-1 text-sm text-white">{rating}</span>
          <span className="ml-1 text-xs text-zinc-400">({reviewCount} reviews)</span>
        </div>

        {/* Bio */}
        <p className="mt-3 max-w-xs text-sm text-zinc-300 leading-relaxed">
          {bio}
        </p>

        {/* Small stats row */}
        <div className="mt-4 flex flex-row items-center justify-center gap-6">
          <div className="flex flex-col items-center">
            <Scissors size={16} color="#a1a1aa" />
            <span className="mt-1 text-sm font-semibold text-white">
              {haircutsCompleted.toLocaleString()}
            </span>
            <span className="text-[11px] text-zinc-400">Haircuts</span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex flex-col items-center">
            <Users size={16} color="#a1a1aa" />
            <span className="mt-1 text-sm font-semibold text-white">
              {clientsServed.toLocaleString()}
            </span>
            <span className="text-[11px] text-zinc-400">Clients</span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex flex-col items-center">
            <Award size={16} color="#a1a1aa" />
            <span className="mt-1 text-sm font-semibold text-white">
              {yearsExperience}
            </span>
            <span className="text-[11px] text-zinc-400">Years exp.</span>
          </div>
        </div>
      </div>
    </div>
  );
}