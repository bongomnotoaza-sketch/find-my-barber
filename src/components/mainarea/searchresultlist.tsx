// src/components/mainarea/searchresultlist.tsx
import { useEffect, useState } from "react";
import MusicPlayer from "./searchresult";
import { supabase } from "../../lib/superbase";
import { getAvatarUrl } from "../../lib/get_profile";

// Raw shape from search_barbers_by_name
type BarbersSearchRow = {
  id: string;
  display_name: string | null;
  avatar_path: string | null;
  bio: string | null;
};

type Result = {
  id: string;
  image: string;
  barberName: string;
  bio: string;
};

type ResultsListProps = {
  /** Search term from the search overlay input. */
  searchTerm?: string;
  /** Called when the user taps a result card. */
  onBarberPress?: (barber: {
    id: string;
    name: string;
    avatarUrl: string;
  }) => void;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=80";

export default function ResultsList({
  searchTerm = "",
  onBarberPress,
}: ResultsListProps) {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = searchTerm.trim();

    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc("search_barbers_by_name", {
        p_search_term: trimmed,
      });

      if (cancelled) return;

      if (error) {
        console.error("Barber search failed:", error);
        setError(error.message);
        setResults([]);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as BarbersSearchRow[];

      const mapped: Result[] = rows.map((row) => ({
        id: row.id,
        image: row.avatar_path
          ? getAvatarUrl(row.avatar_path, "avatars") ?? FALLBACK_IMAGE
          : FALLBACK_IMAGE,
        barberName: row.display_name ?? "Barber",
        bio: row.bio ?? "",
      }));

      setResults(mapped);
      setLoading(false);
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchTerm]);

  return (
    <div className="w-full h-full min-h-0 overflow-y-auto overflow-x-hidden">
      {loading && (
        <p className="text-white/50 text-sm text-center py-8">Searching…</p>
      )}

      {!loading && error && (
        <p className="text-red-400 text-sm text-center py-8">{error}</p>
      )}

      {!loading && !error && searchTerm.trim() && results.length === 0 && (
        <p className="text-white/50 text-sm text-center py-8">
          No barbers found
        </p>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 p-3">
          {results.map((result) => (
            <div key={result.id} className="w-full aspect-[3/4] min-w-0">
              <MusicPlayer
                image={result.image}
                barberName={result.barberName}
                bio={result.bio}
                onPress={() =>
                  onBarberPress?.({
                    id: result.id,
                    name: result.barberName,
                    avatarUrl: result.image,
                  })
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}