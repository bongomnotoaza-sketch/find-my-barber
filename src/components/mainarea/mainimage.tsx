import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "motion/react";

type MainImageProps = {
  images?: string[];
};

const defaultImages = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df",
  "https://images.unsplash.com/photo-1599351431202-1e0f0d4b1f1e",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70",
];

const AUTOPLAY_MS = 5000;

export default function MainImage({ images = defaultImages }: MainImageProps) {
  const displayImages = images.slice(0, 5);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /* -------- Sync Embla with React -------- */
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  /* -------- Autoplay -------- */
  useEffect(() => {
    if (!emblaApi || isPaused) return;

    const id = setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_MS);

    return () => clearInterval(id);
  }, [emblaApi, isPaused, selectedIndex]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  return (
    <div
      className="group relative h-full w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* EMBLA VIEWPORT */}
      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        <div className="flex h-full touch-pan-y">
          {displayImages.map((image, index) => {
            const isActive = index === selectedIndex;

            return (
              <div
                key={`${image}-${index}`}
                className="relative h-full min-w-0 flex-[0_0_100%]"
              >
                {/* Ken Burns + fade + blur via Motion */}
                <motion.img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                  initial={false}
                  animate={{
                    scale: isActive ? 1.12 : 1.02,
                    opacity: isActive ? 1 : 0.55,
                    filter: isActive ? "blur(0px)" : "blur(6px)",
                  }}
                  transition={{
                    scale: {
                      duration: isActive ? AUTOPLAY_MS / 1000 + 1 : 1.2,
                      ease: "easeOut",
                    },
                    opacity: { duration: 0.9, ease: "easeOut" },
                    filter: { duration: 0.9, ease: "easeOut" },
                  }}
                />

                {/* Cinematic gradient overlay */}
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"
                  animate={{ opacity: isActive ? 1 : 0.5 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />

                {/* Shine sweep on active slide */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key={`shine-${index}-${selectedIndex}`}
                      className="pointer-events-none absolute -inset-y-10 -left-1/3 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                      initial={{ x: "-40%", opacity: 0 }}
                      animate={{ x: "260%", opacity: [0, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 1.6,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.15,
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROGRESS BAR (autoplay) */}
      <div className="pointer-events-none absolute left-0 top-0 h-[2px] w-full overflow-hidden bg-white/10">
        <motion.div
          key={`${selectedIndex}-${isPaused}`}
          className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
          initial={{ width: "0%" }}
          animate={{ width: isPaused ? "0%" : "100%" }}
          transition={{
            duration: isPaused ? 0.3 : AUTOPLAY_MS / 1000,
            ease: "linear",
          }}
        />
      </div>

      {/* SLIDE INDICATORS — lifted above the Description + Footer stack */}
      <div className="absolute bottom-44 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {displayImages.map((_, index) => {
          const isActive = index === selectedIndex;

          return (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              className="relative flex h-2 items-center overflow-hidden rounded-full bg-white/30 backdrop-blur-sm"
              aria-label={`Go to slide ${index + 1}`}
            >
              <motion.span
                className="block h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]"
                animate={{ width: isActive ? 28 : 8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            </button>
          );
        })}
      </div>

      {/* COUNTER CHIP */}
      <motion.div
        key={selectedIndex}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md"
      >
        {String(selectedIndex + 1).padStart(2, "0")} /{" "}
        {String(displayImages.length).padStart(2, "0")}
      </motion.div>
    </div>
  );
}