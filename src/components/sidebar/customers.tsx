import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "../../lib/superbase"; // 👈 same path as Line

type Follower = {
  display_name: string;
  avatar_path: string | null;
};

export default function Customers() {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No user logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_barber_followers", {
        p_barber_id: user.id, // 👈 same pattern as Line
      });

      if (error) {
        console.error("Error fetching barber followers:", error);
        setError(error.message);
        setFollowers([]);
      } else {
        setFollowers(data?.followers ?? []);
      }

      setLoading(false);
    };

    fetchFollowers();
  }, []);

  const resolveAvatarUrl = (path: string | null): string | null => {
    if (!path) return null;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Customers</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {loading && (
          <p className="text-white/50 text-sm text-center py-8">Loading…</p>
        )}

        {!loading && error && (
          <p className="text-red-400 text-sm text-center py-8">{error}</p>
        )}

        {!loading && !error && followers.length === 0 && (
          <p className="text-white/50 text-sm text-center py-8">
            No customers yet
          </p>
        )}

        {!loading &&
          !error &&
          followers.map((follower, index) => {
            const avatarUrl = resolveAvatarUrl(follower.avatar_path);

            return (
              <motion.div
                key={`${follower.display_name}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.04,
                  ease: "easeOut",
                }}
                className="rounded-xl bg-white/5 px-4 py-3 flex items-center gap-3"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={follower.display_name}
                    className="h-9 w-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="fa-solid fa-user text-white/60 text-xs" />
                  </div>
                )}

                <span className="text-sm font-bold text-white truncate">
                  {follower.display_name}
                </span>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}