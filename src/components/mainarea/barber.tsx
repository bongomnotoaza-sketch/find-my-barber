// src/components/mainarea/barber.tsx
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import BarberHeader from "./barberheader";
import BarberStats from "./barberstats";
import MainImage from "./barberimage";
import CreatePost, {
  type Category,
  type OrderedMedia,
} from "./createpost";
import {
  getBarberProfileById,
  getBarberLocationImageUrl,
} from "../../lib/barber_profiles";

type Service = {
  id: string;
  image: string;
  name: string;
  price: number | string;
};

type BarberScreenProps = {
  isBarber?: boolean;
  isCreatingPost?: boolean;
  barberId?: string;
  barberName?: string;
  barberAvatar?: string;
  onBack?: () => void;
  onBook?: (service: Service, date: Date) => void;
  initialServiceIndex?: number;
  onCreatePost?: (
    orderedMedia: OrderedMedia[],
    description: string,
    category: Category | null,
    existingPostId: string | null,
    songId: string | null,
  ) => void | Promise<void>;
};

export default function BarberScreen({
  
  isCreatingPost = false,
  barberId,
  barberName,
  barberAvatar,
  onBack,
  onBook,
  initialServiceIndex,
  onCreatePost,
}: BarberScreenProps) {
  // Barber's business location image (resolved public URL, or null).
  const [locationImage, setLocationImage] = useState<string | null>(null);

  useEffect(() => {
    if (!barberId) {
      setLocationImage(null);
      return;
    }

    let cancelled = false;

    (async () => {
      const result = await getBarberProfileById(barberId);

      if (cancelled) return;

      if (result.success) {
        setLocationImage(
          getBarberLocationImageUrl(result.data.buisness_loction_image_path)
        );
      } else {
        // Not found / error → fall back to the default image.
        setLocationImage(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [barberId]);

  // Explicit create-post mode. Only the white create-post FAB on the feed
  // sets this — so barbers tapping their own avatar (or anyone else's)
  // get the normal barber profile view and can book haircuts like users.
  if (isCreatingPost) {
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
        <CreatePost barberId={barberId} onPost={onCreatePost} />
      </div>
    );
  }

  // Normal barber profile — rendered for every profile navigation,
  // whether the viewer is a regular user or a barber.
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
        {/* Uses the barber's uploaded business location image, or falls
            back to MainImage's default when none exists. */}
        <MainImage image={locationImage ?? undefined} />
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