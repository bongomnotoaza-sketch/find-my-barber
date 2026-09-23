import { Circle, CircleDot } from "lucide-react";

type PriceListProps = {
  image: string;
  name: string;
  price: number | string;
  selected?: boolean;
  onPress?: () => void;
};

export default function PriceList({
  image,
  name,
  price,
  selected = false,
  onPress,
}: PriceListProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full h-full flex flex-row items-center px-4 py-3 active:bg-white/5"
    >
      <img src={image} className="h-12 w-12 rounded-xl object-cover" alt={name} />

      <span className="ml-3 flex-1 text-left text-base font-medium text-white">
        {name}
      </span>

      <span className="mr-4 text-base font-semibold text-white">
        R{price}
      </span>

      {selected ? (
        <CircleDot size={22} color="#ffffff" />
      ) : (
        <Circle size={22} color="#71717a" />
      )}
    </button>
  );
}