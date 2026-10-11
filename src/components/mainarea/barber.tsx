// src/components/mainarea/barber.tsx
import { ChevronLeft } from "lucide-react";
import BarberHeader from "./barberheader";
import BarberStats from "./barberstats";
import MainImage from "./barberimage";
import CreatePost, { type Category } from "./createpost";

type Service = {
  id: string;
  image: string;
  name: string;
  price: number | string;
};

type BarberScreenProps = {
  isBarber?: boolean;
  /** The barber whose profile we're viewing (required in customer mode). */
  barberId?: string;
  /** Poster name from the tapped post, so the header matches the feed. */
  barberName?: string;
  /** Poster avatar URL from the tapped post, so the header matches the feed. */
  barberAvatar?: string;
  onBack?: () => void;
  onBook?: (service: Service, date: Date) => void;
  initialServiceIndex?: number;
  onCreatePost?: (
    images: File[],
    description: string,
    category: Category | null
  ) => void | Promise<void>;
};

export default function BarberScreen({
  isBarber = false,
  barberId,
  barberName,
  barberAvatar,
  onBack,
  onBook,
  initialServiceIndex,
  onCreatePost,
}: BarberScreenProps) {
  if (isBarber) {
    return (
      <div className="relative flex flex-col h-screen bg-zinc-950 overflow-hidden">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80 active:scale-95"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <CreatePost onPost={onCreatePost} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 overflow-hidden">
      <div className="h-[10%] shrink-0">
        <BarberHeader
          username={barberName}
          userImage={barberAvatar}
          verified
          rating={4.8}
          reviewCount={120}
          onBack={onBack}
        />
      </div>

      <div className="h-[30%] shrink-0">
        <MainImage />
      </div>

      <div className="h-[60%] overflow-y-auto">
        <BarberStats
          barberId={barberId}
          onBook={onBook}
          initialServiceIndex={initialServiceIndex}
        />
      </div>
    </div>
  );
}