import { MapPin } from "lucide-react";

type LocationProps = {
  shopName: string;
  address: string;
};

export default function Location({ shopName, address }: LocationProps) {
  return (
    <div className="w-full h-full flex flex-row items-center px-4 py-4">
      <MapPin size={24} color="#ffffff" />

      <div className="ml-3 flex-1">
        <p className="text-base font-bold text-white">{shopName}</p>
        <p className="mt-1 text-sm text-zinc-400">{address}</p>
      </div>
    </div>
  );
}