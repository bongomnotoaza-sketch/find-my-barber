import { useState } from "react";
import Contact from "./contacts";
import Location from "./location";
import PriceList from "./pricelist";

type Service = {
  image: string;
  name: string;
  price: number | string;
};

type BarberStatsProps = {
  shopName?: string;
  address?: string;
  services?: Service[];

  whatsapp?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;

  onBook?: (service: Service) => void;
};

const defaultServices: Service[] = [
  {
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
    name: "Haircut",
    price: 150,
  },
  {
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
    name: "Haircut + Beard",
    price: 200,
  },
  {
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0d4b1f1e",
    name: "Beard Trim",
    price: 80,
  },
];

export default function BarberStats({
  shopName = "Fresh Cuts Barber Shop",
  address = "12 Long Street, Cape Town",
  services = defaultServices,
  whatsapp = "+27 72 123 4567",
  phone = "+27 21 123 4567",
  email = "freshcuts@example.com",
  onBook,
}: BarberStatsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);

  const handleBookPress = () => {
    if (selectedIndex === undefined) return;
    onBook?.(services[selectedIndex]);
  };

  return (
    <div className="w-full h-full grid grid-rows-[20%_1fr_30%_auto] bg-zinc-950">
      {/* Location - 20% */}
      <div className="overflow-y-auto">
        <Location shopName={shopName} address={address} />
      </div>

      {/* Services & Pricing - flexible */}
      <div className="px-4 overflow-hidden flex flex-col min-h-0">
        <p className="mb-2 text-lg font-bold text-white shrink-0">
          Services & Pricing
        </p>

        <div className="flex-1 overflow-y-auto">
          {services.map((service, index) => (
            <PriceList
              key={`${service.name}-${index}`}
              image={service.image}
              name={service.name}
              price={service.price}
              selected={selectedIndex === index}
              onPress={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Contact - 30% */}
      <div className="overflow-y-auto min-h-0">
        <p className="mb-2 px-4 text-lg font-bold text-white">Contact</p>

        <Contact whatsapp={whatsapp} phone={phone} email={email} />
      </div>

      {/* Book Button - auto height, always visible */}
      <div className="px-4 py-3 flex items-center">
        <button
          type="button"
          onClick={handleBookPress}
          disabled={selectedIndex === undefined}
          className="h-12 w-full flex items-center justify-center rounded-xl bg-white active:bg-zinc-200 disabled:opacity-40"
        >
          <span className="text-base font-bold text-black">Book</span>
        </button>
      </div>
    </div>
  );
}