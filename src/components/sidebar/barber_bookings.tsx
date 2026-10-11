import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "../../lib/superbase"; // adjust path

type Booking = {
  serviceName: string;
  userName: string;
  date: Date;
};

// Raw shape returned by the RPC
type BookingRow = {
  service_name: string;
  name: string;
  booking_date: string;
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No user logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_barber_booking_details", {
        p_barber_id: user.id, // logged-in user is the barber
      });

      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        const mapped: Booking[] = ((data ?? []) as BookingRow[]).map((row) => ({
          serviceName: row.service_name,
          userName: row.name,
          date: new Date(row.booking_date),
        }));
        setBookings(mapped);
      }
      setLoading(false);
    };

    fetchBookings();
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Bookings</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {loading && (
          <p className="text-white/50 text-sm text-center py-8">Loading...</p>
        )}

        {!loading && error && (
          <p className="text-red-400 text-sm text-center py-8">{error}</p>
        )}

        {!loading && !error && bookings.length === 0 && (
          <p className="text-white/50 text-sm text-center py-8">
            No bookings yet
          </p>
        )}

        {bookings.map((booking, index) => {
          const formattedDate = new Intl.DateTimeFormat("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(booking.date);

          return (
            <motion.div
              key={`${booking.userName}-${booking.date.getTime()}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.04,
                ease: "easeOut",
              }}
              className="rounded-xl bg-white/5 px-4 py-3"
            >
              {/* Service */}
              <div className="text-sm font-bold text-white">
                {booking.serviceName}
              </div>

              {/* Customer + Date */}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-white/70">
                  {booking.userName}
                </span>

                <span className="text-xs text-white/50">
                  {formattedDate}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}