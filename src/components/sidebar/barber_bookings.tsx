
import { motion } from "motion/react";

type Booking = {
  serviceName: string;
  userName: string;
  date: Date;
};

type BookingsProps = {
  bookings?: Booking[];
};

const defaultBookings: Booking[] = [
  {
    serviceName: "Haircut + Beard",
    userName: "John Mokoena",
    date: new Date(),
  },
  {
    serviceName: "Haircut",
    userName: "Thabo Nkosi",
    date: new Date(Date.now() + 86400000),
  },
  {
    serviceName: "Beard Trim",
    userName: "Sipho Khumalo",
    date: new Date(Date.now() + 172800000),
  },
];

export default function Bookings({
  bookings = defaultBookings,
}: BookingsProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Bookings</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {bookings.length === 0 && (
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
