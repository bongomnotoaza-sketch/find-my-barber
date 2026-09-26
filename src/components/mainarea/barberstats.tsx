import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "motion/react";
import Contact from "./contacts";
import Location from "./location";
import PriceList from "./pricelist";
import Position from "./position";

type Service = {
  image: string;
  name: string;
  price: number | string;

  performedCount?: number;
  rating?: number;
  averageMinutes?: number;
};

type PositionData = {
  date: Date;
  position: number;
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

  onBook?: (service: Service, date: Date) => void;

  initialServiceIndex?: number;
};

const defaultServices: Service[] = [
  {
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
    name: "Haircut",
    price: 150,
    performedCount: 184,
    rating: 4.9,
    averageMinutes: 35,
  },
  {
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
    name: "Haircut + Beard",
    price: 200,
    performedCount: 126,
    rating: 4.8,
    averageMinutes: 50,
  },
  {
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0d4b1f1e",
    name: "Beard Trim",
    price: 80,
    performedCount: 97,
    rating: 4.9,
    averageMinutes: 20,
  },
];

/* -------- Default queue positions for the next 7 days -------- */

const defaultPositions: PositionData[] = Array.from(
  { length: 7 },
  (_, index) => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);

    return {
      date,
      position: [3, 5, 9, 4, 7, 2, 6][index],
    };
  }
);

export default function BarberStats({
  shopName = "Fresh Cuts Barber Shop",
  address = "12 Long Street, Cape Town",
  services = defaultServices,
  whatsapp = "+27 72 123 4567",
  phone = "+27 21 123 4567",
  email = "freshcuts@example.com",
  onBook,
  initialServiceIndex,
}: BarberStatsProps) {
  /* -------- Selected service -------- */

  const [selectedServiceIndex, setSelectedServiceIndex] = useState<
    number | undefined
  >(initialServiceIndex);

  /* -------- Selected date -------- */

  const [selectedPositionIndex, setSelectedPositionIndex] = useState<
    number | undefined
  >(undefined);

  /* =========================================================
     SERVICES CAROUSEL
  ========================================================= */

  const [servicesRef, servicesApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    skipSnaps: false,
    containScroll: "trimSnaps",
    dragFree: false,
  });

  /* -------- Sync service carousel -------- */

  useEffect(() => {
    if (!servicesApi) return;

    const onSelectServices = () => {
      const index = servicesApi.selectedScrollSnap();
      setSelectedServiceIndex(index);
    };

    onSelectServices();

    servicesApi.on("select", onSelectServices);
    servicesApi.on("reInit", onSelectServices);

    return () => {
      servicesApi.off("select", onSelectServices);
      servicesApi.off("reInit", onSelectServices);
    };
  }, [servicesApi]);

  /* -------- Jump to incoming service on mount -------- */

  useEffect(() => {
    if (!servicesApi) return;
    if (initialServiceIndex === undefined) return;
    servicesApi.scrollTo(initialServiceIndex, true);
  }, [servicesApi, initialServiceIndex]);

  const scrollToService = useCallback(
    (index: number) => {
      servicesApi?.scrollTo(index);
    },
    [servicesApi]
  );

  /* =========================================================
     POSITION / DATE CAROUSEL
  ========================================================= */

  const [positionRef, positionApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    skipSnaps: false,
    containScroll: "trimSnaps",
    dragFree: false,
  });

  /* -------- Sync position carousel -------- */

  useEffect(() => {
    if (!positionApi) return;

    const onSelectPosition = () => {
      const index = positionApi.selectedScrollSnap();
      setSelectedPositionIndex(index);
    };

    onSelectPosition();

    positionApi.on("select", onSelectPosition);
    positionApi.on("reInit", onSelectPosition);

    return () => {
      positionApi.off("select", onSelectPosition);
      positionApi.off("reInit", onSelectPosition);
    };
  }, [positionApi]);

  const scrollToPosition = useCallback(
    (index: number) => {
      positionApi?.scrollTo(index);
    },
    [positionApi]
  );

  /* =========================================================
     BOOKING
  ========================================================= */

  const handleBookPress = () => {
    if (selectedServiceIndex === undefined) return;
    if (selectedPositionIndex === undefined) return;

    onBook?.(
      services[selectedServiceIndex],
      defaultPositions[selectedPositionIndex].date
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950 overflow-hidden">

      {/* =====================================================
          LOCATION
      ===================================================== */}

      <div className="h-[18%] shrink-0 overflow-y-auto">
        <Location
          shopName={shopName}
          address={address}
        />
      </div>

      {/* =====================================================
          SERVICES & PRICING
      ===================================================== */}

      <div className="h-[24%] shrink-0 px-4 overflow-hidden flex flex-col min-h-0">

        <p className="mb-2 text-lg font-bold text-white shrink-0">
          Services & Pricing
        </p>

        {/* Services viewport */}

        <div
          className="flex-1 overflow-hidden"
          ref={servicesRef}
        >
          <div className="flex h-full touch-pan-y">

            {services.map((service, index) => {
              const isActive = index === selectedServiceIndex;

              return (
                <div
                  key={`${service.name}-${index}`}
                  className="relative h-full min-w-0 flex-[0_0_100%]"
                >
                  <motion.div
                    className="h-full w-full"
                    initial={false}
                    animate={{
                      scale: isActive ? 1 : 0.9,
                      opacity: isActive ? 1 : 0.5,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 28,
                    }}
                  >
                    <PriceList
                      image={service.image}
                      name={service.name}
                      price={service.price}
                      performedCount={service.performedCount}
                      rating={service.rating}
                      averageMinutes={service.averageMinutes}
                      selected={isActive}
                      onPress={() => scrollToService(index)}
                    />
                  </motion.div>
                </div>
              );
            })}

          </div>
        </div>

        {/* Service pagination */}

        <div className="flex items-center justify-center gap-2 py-2 shrink-0">

          {services.map((_, index) => {
            const isActive = index === selectedServiceIndex;

            return (
              <button
                key={index}
                type="button"
                onClick={() => scrollToService(index)}
                className="relative flex h-1.5 items-center overflow-hidden rounded-full bg-white/25"
                aria-label={`Go to ${services[index].name}`}
              >
                <motion.span
                  className="block h-full rounded-full bg-white"
                  animate={{
                    width: isActive ? 20 : 6,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </button>
            );
          })}

        </div>
      </div>

      {/* =====================================================
          AVAILABILITY / QUEUE POSITION
      ===================================================== */}

      <div className="h-[24%] shrink-0 px-4 overflow-hidden flex flex-col min-h-0">

        <p className="mb-2 text-lg font-bold text-white shrink-0">
          Your Position
        </p>

        <div
          className="flex-1 overflow-hidden"
          ref={positionRef}
        >
          <div className="flex h-full touch-pan-y">

            {defaultPositions.map((item, index) => {
              const isActive = index === selectedPositionIndex;

              return (
                <div
                  key={item.date.toISOString()}
                  className="relative h-full min-w-0 flex-[0_0_100%]"
                >
                  <motion.div
                    className="h-full w-full"
                    initial={false}
                    animate={{
                      scale: isActive ? 1 : 0.9,
                      opacity: isActive ? 1 : 0.5,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 28,
                    }}
                  >
                    <Position
                      date={item.date}
                      position={item.position}
                      selected={isActive}
                      onPress={() => scrollToPosition(index)}
                    />
                  </motion.div>
                </div>
              );
            })}

          </div>
        </div>

        {/* Position pagination */}

        <div className="flex items-center justify-center gap-2 py-2 shrink-0">

          {defaultPositions.map((_, index) => {
            const isActive = index === selectedPositionIndex;

            return (
              <button
                key={index}
                type="button"
                onClick={() => scrollToPosition(index)}
                className="relative flex h-1.5 items-center overflow-hidden rounded-full bg-white/25"
                aria-label={`Go to day ${index + 1}`}
              >
                <motion.span
                  className="block h-full rounded-full bg-white"
                  animate={{
                    width: isActive ? 20 : 6,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </button>
            );
          })}

        </div>
      </div>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <div className="flex-1 min-h-0 overflow-y-auto">

        <p className="mb-2 px-4 text-lg font-bold text-white">
          Contact
        </p>

        <Contact
          whatsapp={whatsapp}
          phone={phone}
          email={email}
        />

      </div>

      {/* =====================================================
          BOOK BUTTON
      ===================================================== */}

      <div className="px-4 py-3 flex items-center shrink-0">

        <button
          type="button"
          onClick={handleBookPress}
          disabled={
            selectedServiceIndex === undefined ||
            selectedPositionIndex === undefined
          }
          className="h-12 w-full flex items-center justify-center rounded-xl bg-white active:bg-zinc-200 disabled:opacity-40"
        >
          <span className="text-base font-bold text-black">
            Book
          </span>
        </button>

      </div>

    </div>
  );
}