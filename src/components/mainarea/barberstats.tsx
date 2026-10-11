// src/components/mainarea/barberstats.tsx
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "motion/react";
import Contact from "./contacts";
import Location from "./location";
import PriceList from "./pricelist";
import Position from "./position";
import { getBarberServices } from "../../lib/create_service";
import { DEFAULT_BARBER_SERVICES } from "../../lib/defaulcatalogue";
import { supabase } from "../../lib/superbase";

/* ---------- Types ---------- */

type Service = {
  id: string;
  image: string;
  name: string;
  price: number | string;

  performedCount?: number;
  rating?: number;
  averageMinutes?: number;
};

type PositionRow = {
  booking_date: string; // "YYYY-MM-DD"
  highest_ticket_index: number;
};

type ShopDetailsRow = {
  shop_name: string | null;
  address: string | null;
};

type ContactDetailsRow = {
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
};

type BarberStatsProps = {
  /** The barber whose services to load. */
  barberId?: string;

  onBook?: (service: Service, date: Date) => void;

  initialServiceIndex?: number;
};

/* ---------- Front-end placeholders ---------- */

const CATALOGUE_BY_CODE = new Map(
  DEFAULT_BARBER_SERVICES.map((s) => [s.code, s])
);

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1";

const imageForCode = (code: string | null | undefined): string => {
  if (!code) return FALLBACK_IMAGE;
  const entry = CATALOGUE_BY_CODE.get(code);
  return entry ? entry.imageUrl : FALLBACK_IMAGE;
};

const PLACEHOLDER_STATS = {
  performedCount: 0,
  rating: 0,
  averageMinutes: 0,
};

/* -------- Default queue positions for the next 7 days -------- */

const defaultPositions = Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + index);
  return { date };
});

/* -------- Date → "YYYY-MM-DD" (local) -------- */

const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function BarberStats({
  barberId,
  onBook,
  initialServiceIndex,
}: BarberStatsProps) {
  /* =========================================================
     SHOP DETAILS — loaded from Supabase
  ========================================================= */

  const [shopName, setShopName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [loadingShop, setLoadingShop] = useState(true);

  useEffect(() => {
    if (!barberId) {
      setShopName("");
      setAddress("");
      setLoadingShop(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoadingShop(true);

      const { data, error } = await supabase.rpc("get_barber_shop_details", {
        p_barber_id: barberId,
      });

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch barber shop details:", error);
        setShopName("");
        setAddress("");
        setLoadingShop(false);
        return;
      }

      const row = data as ShopDetailsRow | null;

      setShopName(row?.shop_name ?? "");
      setAddress(row?.address ?? "");
      setLoadingShop(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [barberId]);

  /* =========================================================
     CONTACT DETAILS — loaded from Supabase
  ========================================================= */

  const [whatsapp, setWhatsapp] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loadingContact, setLoadingContact] = useState(true);

  useEffect(() => {
    if (!barberId) {
      setWhatsapp("");
      setPhone("");
      setEmail("");
      setLoadingContact(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoadingContact(true);

      const { data, error } = await supabase.rpc(
        "get_barber_contact_details",
        { p_barber_id: barberId }
      );

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch barber contact details:", error);
        setWhatsapp("");
        setPhone("");
        setEmail("");
        setLoadingContact(false);
        return;
      }

      const row = data as ContactDetailsRow | null;

      setWhatsapp(row?.whatsapp ?? "");
      setPhone(row?.phone ?? "");
      setEmail(row?.email ?? "");
      setLoadingContact(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [barberId]);

  /* =========================================================
     SERVICES — loaded from Supabase
  ========================================================= */

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  useEffect(() => {
    if (!barberId) {
      setServices([]);
      setLoadingServices(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoadingServices(true);
      setServicesError(null);

      const result = await getBarberServices(barberId);

      if (cancelled) return;

      if (!result.success) {
        setServicesError(result.error);
        setServices([]);
        setLoadingServices(false);
        return;
      }

      const mapped: Service[] = result.data.map((row) => ({
        id: row.id,
        image: imageForCode(row.service_code),
        name: row.name,
        price: row.price,
        ...PLACEHOLDER_STATS,
      }));

      setServices(mapped);
      setLoadingServices(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [barberId]);

  /* =========================================================
     QUEUE POSITIONS — loaded once, keyed by date
  ========================================================= */

  const [positionsByDate, setPositionsByDate] = useState<
    Record<string, number>
  >({});
  const [loadingPositions, setLoadingPositions] = useState(true);

  useEffect(() => {
    if (!barberId) {
      setPositionsByDate({});
      setLoadingPositions(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoadingPositions(true);

      const { data, error } = await supabase.rpc(
        "get_barber_daily_ticket_count",
        { p_barber_id: barberId }
      );

      if (cancelled) return;

      if (error) {
        console.error("get_barber_daily_ticket_count failed:", error);
        setPositionsByDate({});
        setLoadingPositions(false);
        return;
      }

      const lookup: Record<string, number> = {};
      for (const row of (data ?? []) as PositionRow[]) {
        lookup[row.booking_date] = row.highest_ticket_index;
      }

      setPositionsByDate(lookup);
      setLoadingPositions(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [barberId]);

  /* =========================================================
     SELECTED SERVICE
  ========================================================= */

  const [selectedServiceIndex, setSelectedServiceIndex] = useState<
    number | undefined
  >(initialServiceIndex);

  useEffect(() => {
    if (services.length === 0) {
      setSelectedServiceIndex(undefined);
      return;
    }
    if (
      selectedServiceIndex === undefined ||
      selectedServiceIndex >= services.length
    ) {
      setSelectedServiceIndex(0);
    }
  }, [services, selectedServiceIndex]);

  /* =========================================================
     SELECTED DATE
  ========================================================= */

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

  useEffect(() => {
    if (!servicesApi) return;
    if (initialServiceIndex === undefined) return;
    if (services.length === 0) return;
    servicesApi.scrollTo(initialServiceIndex, true);
  }, [servicesApi, initialServiceIndex, services.length]);

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

  /* =========================================================
     RENDER
  ========================================================= */

  const canBook =
    !loadingServices &&
    services.length > 0 &&
    selectedServiceIndex !== undefined &&
    selectedPositionIndex !== undefined;

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* LOCATION */}
      <div className="h-[18%] shrink-0 overflow-y-auto">
        <Location
          shopName={loadingShop ? "Loading…" : shopName}
          address={loadingShop ? "" : address}
        />
      </div>

      {/* SERVICES & PRICING */}
      <div className="h-[24%] shrink-0 px-4 overflow-hidden flex flex-col min-h-0">
        <p className="mb-2 text-lg font-bold text-white shrink-0">
          Services &amp; Pricing
        </p>

        <div className="flex-1 overflow-hidden" ref={servicesRef}>
          <div className="flex h-full touch-pan-y">
            {loadingServices && (
              <div className="flex-[0_0_100%] flex items-center justify-center">
                <span className="text-sm text-white/50">
                  Loading services…
                </span>
              </div>
            )}

            {!loadingServices && services.length === 0 && (
              <div className="flex-[0_0_100%] flex items-center justify-center">
                <span className="text-sm text-white/50">
                  {servicesError ?? "No services available"}
                </span>
              </div>
            )}

            {!loadingServices &&
              services.map((service, index) => {
                const isActive = index === selectedServiceIndex;

                return (
                  <div
                    key={service.id}
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

        {services.length > 1 && (
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
                    animate={{ width: isActive ? 20 : 6 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* AVAILABILITY / QUEUE POSITION */}
      <div className="h-[24%] shrink-0 px-4 overflow-hidden flex flex-col min-h-0">
        <p className="mb-2 text-lg font-bold text-white shrink-0">
          Your Position
        </p>

        <div className="flex-1 overflow-hidden" ref={positionRef}>
          <div className="flex h-full touch-pan-y">
            {defaultPositions.map((item, index) => {
              const isActive = index === selectedPositionIndex;

              const key = toDateKey(item.date);
              const position = positionsByDate[key] ?? 0;

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
                      position={position}
                      loading={loadingPositions}
                      selected={isActive}
                      onPress={() => scrollToPosition(index)}
                    />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

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
                  animate={{ width: isActive ? 20 : 6 }}
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

      {/* CONTACT */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <p className="mb-2 px-4 text-lg font-bold text-white">Contact</p>
        <Contact
          whatsapp={loadingContact ? undefined : whatsapp || undefined}
          phone={loadingContact ? undefined : phone || undefined}
          email={loadingContact ? undefined : email || undefined}
        />
      </div>

      {/* BOOK */}
      <div className="px-4 py-3 flex items-center shrink-0">
        <button
          type="button"
          onClick={handleBookPress}
          disabled={!canBook}
          className="h-12 w-full flex items-center justify-center rounded-xl bg-white active:bg-zinc-200 disabled:opacity-40"
        >
          <span className="text-base font-bold text-black">Book</span>
        </button>
      </div>
    </div>
  );
}