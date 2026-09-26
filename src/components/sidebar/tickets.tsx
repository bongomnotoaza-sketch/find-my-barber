import { motion } from "motion/react";

type Ticket = {
  id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  position: number;
  date: Date;
};

type TicketsProps = {
  tickets?: Ticket[];
};

const defaultTickets: Ticket[] = [
  {
    id: "TCK-1042",
    status: "confirmed",
    position: 3,
    date: new Date(),
  },
  {
    id: "TCK-1041",
    status: "pending",
    position: 7,
    date: new Date(Date.now() + 86400000),
  },
  {
    id: "TCK-1039",
    status: "completed",
    position: 2,
    date: new Date(Date.now() - 86400000),
  },
];

const statusStyles: Record<Ticket["status"], string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  confirmed: "bg-green-500/15 text-green-400",
  completed: "bg-blue-500/15 text-blue-400",
  cancelled: "bg-red-500/15 text-red-400",
};

export default function Tickets({ tickets = defaultTickets }: TicketsProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Your Tickets</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {tickets.length === 0 && (
          <p className="text-white/50 text-sm text-center py-8">
            No tickets yet
          </p>
        )}

        {tickets.map((ticket, index) => {
          const formattedDate = new Intl.DateTimeFormat("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(ticket.date);

          return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.04,
                ease: "easeOut",
              }}
              className="rounded-xl bg-white/5 px-4 py-3"
            >
              {/* Top row: ID + Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">
                  {ticket.id}
                </span>

                <span
                  className={`text-[11px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                    statusStyles[ticket.status]
                  }`}
                >
                  {ticket.status}
                </span>
              </div>

              {/* Bottom row: Date + Position */}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-white/50">
                  {formattedDate}
                </span>

                <span className="text-xs text-white/70">
                  Position #{ticket.position}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}