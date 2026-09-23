import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "motion/react";
import { X } from "lucide-react";

type Service = {
  image: string;
  name: string;
  price: number | string;
};

type BookPopUpProps = {
  services: Service[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  onBook?: () => void;
  onClose?: () => void;
};

export default function BookPopUp({
  services,
  selectedIndex,
  onSelect,
  onBook,
  onClose,
}: BookPopUpProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    skipSnaps: false,
    containScroll: "trimSnaps",
  });

  const [activeIndex, setActiveIndex] = useState(
    selectedIndex ?? 0
  );

  /* -------- Sync Embla with React -------- */
  useEffect(() => {
    if (!emblaApi) return;

    const onSelectEmbla = () => {
      const i = emblaApi.selectedScrollSnap();
      setActiveIndex(i);
      onSelect?.(i);
    };

    // Jump to the externally-selected service on mount
    if (selectedIndex !== undefined) {
      emblaApi.scrollTo(selectedIndex, true);
    }

    onSelectEmbla();
    emblaApi.on("select", onSelectEmbla);
    emblaApi.on("reInit", onSelectEmbla);

    return () => {
      emblaApi.off("select", onSelectEmbla);
      emblaApi.off("reInit", onSelectEmbla);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emblaApi]);

  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  );

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="absolute top-[45%] left-0 right-0 h-[40%] z-50 flex flex-col overflow-hidden rounded-t-3xl bg-black/95 shadow-2xl"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 320,
          mass: 0.9,
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full bg-white/30" />
        </div>

        {/* Close button */}
        <motion.button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 active:bg-white/30"
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <X size={20} color="#ffffff" />
        </motion.button>

        {/* Embla viewport */}
        <div className="flex-1 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            {services.map((service, index) => {
              const isActive = index === activeIndex;

              return (
                <div
                  key={`${service.name}-${index}`}
                  className="relative h-full min-w-0 flex-[0_0_100%]"
                >
                  {/* Ken Burns background image */}
                  <motion.img
                    src={service.image}
                    alt={service.name}
                    draggable={false}
                    className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                    initial={false}
                    animate={{
                      scale: isActive ? 1.08 : 1.0,
                      opacity: isActive ? 0.55 : 0.15,
                      filter: isActive ? "blur(0px)" : "blur(8px)",
                    }}
                    transition={{
                      scale: {
                        duration: isActive ? 6 : 1.2,
                        ease: "easeOut",
                      },
                      opacity: { duration: 0.6, ease: "easeOut" },
                      filter: { duration: 0.6, ease: "easeOut" },
                    }}
                  />

                  {/* Gradient overlay for text readability */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />

                  {/* Service content */}
                  <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
                    <motion.h3
                      className="text-2xl font-bold text-white"
                      initial={false}
                      animate={{
                        y: isActive ? 0 : 8,
                        opacity: isActive ? 1 : 0.5,
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      {service.name}
                    </motion.h3>

                    <motion.p
                      className="mt-2 text-lg font-semibold text-orange-400"
                      initial={false}
                      animate={{
                        y: isActive ? 0 : 8,
                        opacity: isActive ? 1 : 0.5,
                      }}
                      transition={{
                        duration: 0.4,
                        ease: "easeOut",
                        delay: 0.05,
                      }}
                    >
                      R{service.price}
                    </motion.p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex items-center justify-center gap-2 py-3 shrink-0">
          {services.map((_, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={index}
                type="button"
                onClick={() => scrollTo(index)}
                className="relative flex h-1.5 items-center overflow-hidden rounded-full bg-white/25"
                aria-label={`Go to ${services[index].name}`}
              >
                <motion.span
                  className="block h-full rounded-full bg-white"
                  animate={{ width: isActive ? 24 : 6 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Book button */}
        <div className="px-4 pb-4 shrink-0">
          <motion.button
            type="button"
            onClick={onBook}
            className="flex h-14 w-full items-center justify-center rounded-xl bg-white active:bg-zinc-200"
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <span className="text-base font-bold text-black">Book</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}