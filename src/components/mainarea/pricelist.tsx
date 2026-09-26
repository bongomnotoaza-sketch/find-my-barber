import { Circle, CircleDot, Clock, Star, Scissors } from "lucide-react";

type PriceListProps = {
  image: string;
  name: string;
  price: number | string;
  selected?: boolean;
  onPress?: () => void;

  performedCount?: number;
  rating?: number;
  averageMinutes?: number;
};

export default function PriceList({
  image,
  name,
  price,
  selected = false,
  onPress,
  performedCount,
  rating,
  averageMinutes,
}: PriceListProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full flex flex-row items-center px-4 py-3 active:bg-white/5"
    >
      <img
        src={image}
        className="h-12 w-12 rounded-xl object-cover shrink-0"
        alt={name}
      />

      <div className="ml-3 flex-1 min-w-0 text-left">
        <div className="flex items-center">
          <span className="text-base font-medium text-white truncate">
            {name}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
          {performedCount !== undefined && (
            <span className="flex items-center gap-1">
              <Scissors size={12} />
              {performedCount} performed
            </span>
          )}

          {rating !== undefined && (
            <span className="flex items-center gap-1">
              <Star size={12} />
              {rating.toFixed(1)}
            </span>
          )}

          {averageMinutes !== undefined && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              ~{averageMinutes} min
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end ml-3 mr-4 shrink-0">
        <span className="text-base font-semibold text-white">
          R{price}
        </span>
      </div>

      {selected ? (
        <CircleDot size={22} color="#ffffff" />
      ) : (
        <Circle size={22} color="#71717a" />
      )}
    </button>
  );
}