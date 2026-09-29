
import { motion } from "motion/react";

type LineStatus = "pending" | "confirmed" | "completed" | "cancelled";

type LineCustomer = {
  name: string;
  status: LineStatus;
  position: number;
  bookingId: string;
};

type LineProps = {
  customers?: LineCustomer[];
};

const defaultCustomers: LineCustomer[] = [
  {
    name: "John M.",
    status: "confirmed",
    position: 1,
    bookingId: "BKG-1042",
  },
  {
    name: "Thabo N.",
    status: "confirmed",
    position: 2,
    bookingId: "BKG-1043",
  },
  {
    name: "Sipho K.",
    status: "pending",
    position: 3,
    bookingId: "BKG-1044",
  },
  {
    name: "David M.",
    status: "confirmed",
    position: 4,
    bookingId: "BKG-1045",
  },
];

const statusStyles: Record<LineStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  confirmed: "bg-green-500/15 text-green-400",
  completed: "bg-blue-500/15 text-blue-400",
  cancelled: "bg-red-500/15 text-red-400",
};

export default function Line({ customers = defaultCustomers }: LineProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Line</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {customers.length === 0 && (
          <p className="text-white/50 text-sm text-center py-8">
            No customers in line
          </p>
        )}

        {customers.map((customer, index) => (
          <motion.div
            key={customer.bookingId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.04,
              ease: "easeOut",
            }}
            className="rounded-xl bg-white/5 px-4 py-3"
          >
            {/* Name + Status */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">
                {customer.name}
              </span>

              <span
                className={`text-[11px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                  statusStyles[customer.status]
                }`}
              >
                {customer.status}
              </span>
            </div>

            {/* Position + Booking ID */}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-white/70">
                Position #{customer.position}
              </span>

              <span className="text-xs text-white/50">
                {customer.bookingId}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
