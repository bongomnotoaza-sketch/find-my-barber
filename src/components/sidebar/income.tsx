
import { motion } from "motion/react";

type ServiceIncome = {
  id: string;
  name: string;
  amount: number;
};

type EarningsData = {
  monthlyIncome: number;
  monthlyTarget: number;
  todayIncome: number;
  todayBookings: number;
  weeklyIncome: number;
  weeklyBookings: number;
  completedBookings: number;
  serviceIncome: ServiceIncome[];
};

type EarningsProps = {
  data?: EarningsData;
};

const defaultData: EarningsData = {
  monthlyIncome: 18450,
  monthlyTarget: 25000,
  todayIncome: 850,
  todayBookings: 6,
  weeklyIncome: 4750,
  weeklyBookings: 31,
  completedBookings: 112,
  serviceIncome: [
    {
      id: "1",
      name: "Haircut",
      amount: 9600,
    },
    {
      id: "2",
      name: "Haircut + Beard",
      amount: 6800,
    },
    {
      id: "3",
      name: "Beard Trim",
      amount: 2050,
    },
  ],
};

export default function Earnings({
  data = defaultData,
}: EarningsProps) {
  const remaining = Math.max(
    data.monthlyTarget - data.monthlyIncome,
    0
  );

  const progress =
    data.monthlyTarget > 0
      ? Math.min(
          (data.monthlyIncome / data.monthlyTarget) * 100,
          100
        )
      : 0;

  const averagePerBooking =
    data.completedBookings > 0
      ? data.monthlyIncome / data.completedBookings
      : 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Earnings</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">

        {/* Monthly Income */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-white/5 px-4 py-4"
        >
          <div className="text-xs uppercase tracking-wide text-white/50">
            This Month
          </div>

          <div className="text-2xl font-bold text-white mt-1">
            {formatCurrency(data.monthlyIncome)}
          </div>

          <div className="text-xs text-white/50 mt-1">
            {data.completedBookings} completed bookings
          </div>
        </motion.div>

        {/* Monthly Target */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
          className="rounded-xl bg-white/5 px-4 py-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-white/50">
              Monthly Target
            </span>

            <span className="text-xs font-semibold text-white/70">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="text-lg font-bold text-white mt-1">
            {formatCurrency(data.monthlyTarget)}
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mt-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
              }}
              className="h-full rounded-full bg-white"
            />
          </div>

          <div className="text-xs text-white/50 mt-2">
            {remaining > 0
              ? `${formatCurrency(remaining)} remaining`
              : "Monthly target reached"}
          </div>
        </motion.div>

        {/* Today */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="rounded-xl bg-white/5 px-4 py-3"
        >
          <div className="text-xs uppercase tracking-wide text-white/50">
            Today
          </div>

          <div className="flex items-end justify-between mt-1">
            <span className="text-lg font-bold text-white">
              {formatCurrency(data.todayIncome)}
            </span>

            <span className="text-xs text-white/50">
              {data.todayBookings}{" "}
              {data.todayBookings === 1
                ? "booking"
                : "bookings"}
            </span>
          </div>
        </motion.div>

        {/* This Week */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="rounded-xl bg-white/5 px-4 py-3"
        >
          <div className="text-xs uppercase tracking-wide text-white/50">
            This Week
          </div>

          <div className="flex items-end justify-between mt-1">
            <span className="text-lg font-bold text-white">
              {formatCurrency(data.weeklyIncome)}
            </span>

            <span className="text-xs text-white/50">
              {data.weeklyBookings} bookings
            </span>
          </div>
        </motion.div>

        {/* Average */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="rounded-xl bg-white/5 px-4 py-3"
        >
          <div className="text-xs uppercase tracking-wide text-white/50">
            Average per Booking
          </div>

          <div className="text-lg font-bold text-white mt-1">
            {formatCurrency(averagePerBooking)}
          </div>
        </motion.div>

        {/* Income by Service */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-xl bg-white/5 px-4 py-3"
        >
          <div className="text-xs uppercase tracking-wide text-white/50 mb-3">
            Income by Service
          </div>

          <div className="flex flex-col gap-2">
            {data.serviceIncome.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-white">
                  {service.name}
                </span>

                <span className="text-sm font-semibold text-white/70">
                  {formatCurrency(service.amount)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
