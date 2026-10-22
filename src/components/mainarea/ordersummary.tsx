import { useState } from "react";

type OrderSummaryProps = {
  serviceName: string;
  date: string;
  time: string;
  barberName: string;
  total: number | string;
  onPay?: (bookingForName: string) => void;
};

export default function OrderSummary({
  serviceName,
  date,
  time,
  barberName,
  total,
  onPay,
}: OrderSummaryProps) {
  const [bookingForName, setBookingForName] = useState("");

  // Don't render anything if no service was selected
  if (!serviceName) {
    return null;
  }

  return (
    <div className="w-full rounded-2xl bg-black/70 px-5 py-5">
      {/* Title */}
      <p className="mb-5 text-xl font-bold text-white">Order Summary</p>

      {/* What you booked */}
      <div className="mb-4 flex flex-row justify-between">
        <span className="text-sm text-zinc-400">Service</span>
        <span className="max-w-[60%] text-right text-base font-medium text-white">
          {serviceName}
        </span>
      </div>

      {/* When */}
      <div className="mb-4 flex flex-row justify-between">
        <span className="text-sm text-zinc-400">Date</span>
        <span className="text-base font-medium text-white">{date}</span>
      </div>

      <div className="mb-4 flex flex-row justify-between">
        <span className="text-sm text-zinc-400">Time</span>
        <span className="text-base font-medium text-white">{time}</span>
      </div>

      {/* From whom */}
      <div className="mb-5 flex flex-row justify-between">
        <span className="text-sm text-zinc-400">Barber</span>
        <span className="max-w-[60%] text-right text-base font-medium text-white">
          {barberName}
        </span>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px w-full bg-white/10" />

      {/* Booking for someone else */}
      <div className="mb-5">
        <label className="mb-2 block text-sm text-zinc-400">
          Booking for someone else? (leave empty if it's you)
        </label>
        <input
          type="text"
          value={bookingForName}
          onChange={(e) => setBookingForName(e.target.value)}
          placeholder="Enter their name"
          className="w-full rounded-xl bg-white/10 px-4 py-3 text-base text-white placeholder-zinc-500 outline-none"
        />
      </div>

      {/* Divider */}
      <div className="mb-4 h-px w-full bg-white/10" />

      {/* Total */}
      <div className="mb-5 flex flex-row items-center justify-between">
        <span className="text-base font-semibold text-zinc-300">Total to pay</span>
        <span className="text-xl font-bold text-white">R{total}</span>
      </div>

      {/* Pay button */}
      <button
        type="button"
        onClick={() => onPay?.(bookingForName)}
        className="h-14 w-full flex items-center justify-center rounded-xl bg-orange-500 active:bg-orange-600"
      >
        <span className="text-base font-bold text-white">Book Now</span>
      </button>
    </div>
  );
}