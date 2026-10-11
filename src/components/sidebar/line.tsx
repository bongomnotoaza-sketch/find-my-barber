import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "../../lib/superbase"; // 👈 adjust this path

type LineStatus = "pending" | "confirmed" | "completed" | "cancelled";

type LineCustomer = {
  name: string;
  status: LineStatus;
  position: number;
  bookingId: string;
};

// Raw shape returned by the RPC (matches jsonb_build_object keys in SQL)
type LineRow = {
  name: string;
  status: LineStatus;
  id: string;
  ticket_index: number;
};

const statusStyles: Record<LineStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  confirmed: "bg-green-500/15 text-green-400",
  completed: "bg-blue-500/15 text-blue-400",
  cancelled: "bg-red-500/15 text-red-400",
};

export default function Line() {
  const [customers, setCustomers] = useState<LineCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLine = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No user logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_barber_booking_tickets", {
        p_barber_id: user.id, // logged-in user is the barber
      });

      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        const mapped: LineCustomer[] = ((data ?? []) as LineRow[]).map(
          (row) => ({
            name: row.name,
            status: row.status,
            position: row.ticket_index,
            bookingId: row.id,
          })
        );
        setCustomers(mapped);
      }
      setLoading(false);
    };

    fetchLine();
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Line</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {loading && (
          <p className="text-white/50 text-sm text-center py-8">Loading...</p>
        )}

        {!loading && error && (
          <p className="text-red-400 text-sm text-center py-8">{error}</p>
        )}

        {!loading && !error && customers.length === 0 && (
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
                #{customer.bookingId.slice(0, 6)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}