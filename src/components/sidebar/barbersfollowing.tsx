import { useEffect, useState } from "react";
import { supabase } from "../../lib/superbase";

type Barber = {
  name: string;
};

// Raw shape returned by the RPC
type BarberRow = {
  name: string;
};

export default function BarbersFollowing() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBarbers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No user logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_followed_barbers", {
        p_user_id: user.id, // logged-in user
      });

      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        const mapped: Barber[] = ((data ?? []) as BarberRow[]).map((row) => ({
          name: row.name,
        }));
        setBarbers(mapped);
      }
      setLoading(false);
    };

    fetchBarbers();
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col">
          {loading && (
            <p className="text-white/50 text-sm text-center py-8">
              Loading…
            </p>
          )}

          {!loading && error && (
            <p className="text-red-400 text-sm text-center py-8">
              {error}
            </p>
          )}

          {!loading && !error && barbers.length === 0 && (
            <p className="text-white/50 text-sm text-center py-8">
              Not following any barbers yet
            </p>
          )}

          {barbers.map((barber, index) => (
            <div
              key={`${barber.name}-${index}`}
              className="w-full h-14 flex items-center gap-4 px-3
                border-b border-white/10
                transition-transform duration-300 ease-out
                hover:translate-x-2"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center
                bg-white/10 text-white shrink-0"
              >
                <span className="fa-solid fa-user" />
              </div>

              <div className="text-white font-medium font-sans">
                {barber.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}