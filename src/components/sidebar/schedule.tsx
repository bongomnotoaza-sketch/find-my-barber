
import { motion } from "motion/react";

type ScheduleDay = {
  date: Date;
  bookings: number;
  closed?: boolean;
};

type ScheduleProps = {
  days?: ScheduleDay[];
};

const createDefaultSchedule = (): ScheduleDay[] => {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      date,
      bookings: [8, 5, 11, 0, 7, 4, 9][index],
      closed: false,
    };
  });
};

export default function Schedule({
  days = createDefaultSchedule(),
}: ScheduleProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Schedule</h2>
      </div>

      {/* 7 Day Schedule */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
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
