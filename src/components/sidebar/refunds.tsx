import { motion } from "motion/react";

type Refund = {
  service: string;
  amount: number | string;
  status: "pending" | "approved" | "rejected" | "processed";
  dateRequested: Date;
};

type RefundsProps = {
  refunds?: Refund[];
};

const defaultRefunds: Refund[] = [
  {
    service: "Haircut + Beard",
    amount: 200,
    status: "approved",
    dateRequested: new Date(),
  },
  {
    service: "Beard Trim",
    amount: 80,
    status: "pending",
    dateRequested: new Date(Date.now() - 86400000),
  },
  {
    service: "Haircut",
    amount: 150,
    status: "processed",
    dateRequested: new Date(Date.now() - 3 * 86400000),
  },
];

const statusStyles: Record<Refund["status"], string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
  processed: "bg-blue-500/15 text-blue-400",
};

export default function Refunds({ refunds = defaultRefunds }: RefundsProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Your Refunds</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {refunds.length === 0 && (
          <p className="text-white/50 text-sm text-center py-8">
            No refunds yet
          </p>
        )}

        {refunds.map((refund, index) => {
          const formattedDate = new Intl.DateTimeFormat("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(refund.dateRequested);

          return (
            <motion.div
              key={`${refund.service}-${index}`}
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
                {refund.service}
              </div>

              {/* Status */}
              <div className="mt-1">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                    statusStyles[refund.status]
                  }`}
                >
                  {refund.status}
                </span>
              </div>

              {/* Amount + Date */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-white/70">
                  R{refund.amount}
                </span>

                <span className="text-sm text-white/50">
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