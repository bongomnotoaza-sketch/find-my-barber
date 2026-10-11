import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "../../lib/superbase";

type ScheduleDay = {
  date: Date;
  bookings: number;
  closed?: boolean;
};

// Raw shape returned by the RPC
type ScheduleRow = {
  booking_date: string;
  highest_ticket_index: number;
};

export default function Schedule() {
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No user logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc(
        "get_barber_daily_ticket_count",
        { p_barber_id: user.id }
      );

      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        const mapped: ScheduleDay[] = ((data ?? []) as ScheduleRow[]).map(
          (row) => ({
            date: new Date(row.booking_date),
            bookings: row.highest_ticket_index,
            closed: false,
          })
        );
        setDays(mapped);
      }
      setLoading(false);
    };

    fetchSchedule();
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Schedule</h2>
      </div>

      {/* 7 Day Schedule */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {loading && (
          <p className="text-white/50 text-sm text-center py-8">
            Loading…
          </p>
        )}

        {!loading && error && (
          <p className="text-red-400 text-sm text-center py-8">{error}</p>
        )}

        {!loading && !error && days.length === 0 && (
          <p className="text-white/50 text-sm text-center py-8">
            No schedule data
          </p>
        )}

        {days.map((day, index) => {
          const dayName = new Intl.DateTimeFormat("en-ZA", {
            weekday: "long",
          }).format(day.date);

          const formattedDate = new Intl.DateTimeFormat("en-ZA", {
            day: "numeric",
            month: "short",
          }).format(day.date);

          return (
            <motion.div
              key={day.date.toISOString()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.04,
                ease: "easeOut",
              }}
              className="rounded-xl bg-white/5 px-4 py-3"
            >
              {/* Day + Date */}
              <div className="text-sm font-bold text-white capitalize">
                {dayName}
              </div>

              <div className="text-xs text-white/50 mt-0.5">
                {formattedDate}
              </div>

              {/* Bookings */}
              <div className="text-xs text-white/70 mt-2">
                {day.closed
                  ? "Closed"
                  : `${day.bookings} ${
                      day.bookings === 1 ? "booking" : "bookings"
                    }`}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}