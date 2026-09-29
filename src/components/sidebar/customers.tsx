
import { motion } from "motion/react";

type Customer = {
  id: string;
  name: string;
  bookings: number;
  recentBooking: Date;
  rating: number;
};

type CustomersProps = {
  customers?: Customer[];
};

const defaultCustomers: Customer[] = [
  {
    id: "1",
    name: "John Mokoena",
    bookings: 5,
    recentBooking: new Date("2026-09-28"),
    rating: 4.8,
  },
  {
    id: "2",
    name: "Thabo Nkosi",
    bookings: 3,
    recentBooking: new Date("2026-09-25"),
    rating: 5.0,
  },
  {
    id: "3",
    name: "Sipho Khumalo",
    bookings: 8,
    recentBooking: new Date("2026-09-21"),
    rating: 4.5,
  },
];

export default function Customers({
  customers = defaultCustomers,
}: CustomersProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Customers</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {customers.length === 0 && (
          <p className="text-white/50 text-sm text-center py-8">
            No customers yet
          </p>
        )}

        {customers.map((customer, index) => {
          const formattedDate = new Intl.DateTimeFormat("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(customer.recentBooking);

          return (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.04,
                ease: "easeOut",
              }}
              className="rounded-xl bg-white/5 px-4 py-3"
            >
              {/* Customer name */}
              <div className="text-sm font-bold text-white">
                {customer.name}
              </div>

              {/* Customer stats */}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-white/70">
                  {customer.bookings}{" "}
                  {customer.bookings === 1 ? "booking" : "bookings"}
                </span>

                <span className="text-xs text-white/50">
                  {formattedDate}
                </span>

                <span className="text-xs text-white/70 flex items-center gap-1">
                  <span className="fa-solid fa-star text-[10px]" />
                  {customer.rating.toFixed(1)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
