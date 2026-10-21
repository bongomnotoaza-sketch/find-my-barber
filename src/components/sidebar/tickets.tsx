import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "../../lib/superbase"; // adjust path

type Ticket = {
  id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  position: number;
  date: Date;
};

// Raw shape returned by the RPC
type TicketRow = {
  id: string;
  status: Ticket["status"];
  booking_date: string;
  ticket_index: number;
};

const statusStyles: Record<Ticket["status"], string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  confirmed: "bg-green-500/15 text-green-400",
  completed: "bg-blue-500/15 text-blue-400",
  cancelled: "bg-red-500/15 text-red-400",
};

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No user logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_user_booking_tickets", {
        p_user_id: user.id,
      });

      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        const mapped: Ticket[] = ((data ?? []) as TicketRow[]).map((row) => ({
          id: row.id,
          status: row.status,
          position: row.ticket_index,
          date: new Date(row.booking_date),
        }));
        setTickets(mapped);
      }
      setLoading(false);
    };

    fetchTickets();
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Your Tickets</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {loading && (
          <p className="text-white/50 text-sm text-center py-8">
            Loading...
          </p>
        )}

        {!loading && error && (
          <p className="text-red-400 text-sm text-center py-8">
            {error}
          </p>
        )}

        {!loading && !error && tickets.length === 0 && (
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
                  #{ticket.id.slice(0, 6).toUpperCase()}
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