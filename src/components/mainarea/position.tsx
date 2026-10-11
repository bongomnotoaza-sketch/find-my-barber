// src/components/mainarea/position.tsx
import { Circle, CircleDot, Users } from "lucide-react";

type PositionProps = {
  date: Date;
  position: number;
  loading?: boolean;
  selected?: boolean;
  onPress?: () => void;
};

export default function Position({
  date,
  position,
  loading = false,
  selected = false,
  onPress,
}: PositionProps) {
  const today = new Date();

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const dayName = new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
  }).format(date);

  const monthName = new Intl.DateTimeFormat("en-ZA", {
    month: "short",
  }).format(date);

  const dayNumber = date.getDate();

  // highest_ticket_index used as-is: the count of people already in
  // that day's queue. So position === peopleAhead.
  const peopleAhead = position;

  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full flex flex-row items-center px-4 py-3 active:bg-white/5"
    >
      {/* Date */}
      <div className="h-12 w-12 rounded-xl bg-white/10 flex flex-col items-center justify-center shrink-0">
        <span className="text-[10px] uppercase text-zinc-400">
          {dayName}
        </span>

        <span className="text-lg font-bold leading-none text-white">
          {dayNumber}
        </span>
      </div>

      {/* Information */}
      <div className="ml-3 flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-white">
            {isToday ? "Today" : `${dayName}, ${monthName}`}
          </span>

          {isToday && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-300">
              Today
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400">
          <Users size={12} />

          {loading
            ? "Loading…"
            : peopleAhead === 0
            ? "No one ahead"
            : `${peopleAhead} ${
                peopleAhead === 1 ? "person" : "people"
              } ahead`}
        </div>
      </div>

      {/* Position */}
      <div className="flex flex-col items-end mr-4 shrink-0">
        <span className="text-[10px] uppercase tracking-wide text-zinc-500">
          Position
        </span>

        <span className="text-xl font-bold text-white">
          #{position}
        </span>
      </div>

      {/* Selection */}
      {selected ? (
        <CircleDot size={22} color="#ffffff" />
      ) : (
        <Circle size={22} color="#71717a" />
      )}
    </button>
  );
}