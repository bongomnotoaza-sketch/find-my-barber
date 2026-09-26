import BarberHeader from "./barberheader";
import BarberStats from "./barberstats";
import MainImage from "./barberimage";

type Service = {
  image: string;
  name: string;
  price: number | string;
};

type BarberScreenProps = {
  onBack?: () => void;
  onBook?: (service: Service, date: Date) => void;
  initialServiceIndex?: number;
};

export default function BarberScreen({
  onBack,
  onBook,
  initialServiceIndex,
}: BarberScreenProps) {
  return (
    <div className="flex flex-col h-screen bg-zinc-950 overflow-hidden">
      {/* Header - 10% */}
      <div className="h-[10%] shrink-0">
        <BarberHeader
          username="Barber Name"
          userImage="https://i.pravatar.cc/100"
          verified
          rating={4.8}
          reviewCount={120}
          onBack={onBack}
        />
      </div>

      {/* Image - 40% */}
      <div className="h-[30%] shrink-0">
        <MainImage />
      </div>

      {/* Stats - 50% */}
      <div className="h-[60%] overflow-y-auto">
        <BarberStats
          onBook={onBook}
          initialServiceIndex={initialServiceIndex}
        />
      </div>
    </div>
  );
}