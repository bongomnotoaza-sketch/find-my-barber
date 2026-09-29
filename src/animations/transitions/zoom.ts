import { useMemo } from "react";
import type { Variants } from "motion/react";

type ZoomDirection = "in" | "out";

type ZoomTransitionOptions = {
  duration?: number;
  direction?: ZoomDirection;
};

export default function useZoomTransition({
  duration = 0.9,
  direction = "in",
}: ZoomTransitionOptions = {}) {
  const enterScale = direction === "in" ? 1.15 : 0.85;
  const exitScale = direction === "in" ? 0.85 : 1.15;

  const variants = useMemo<Variants>(
    () => ({
      active: {
        scale: 1,
        opacity: 1,
        transition: {
          scale: {
            duration,
            ease: [0.22, 1, 0.36, 1],
          },
          opacity: {
            duration: duration * 0.7,
            ease: "easeOut",
          },
        },
      },

      inactive: {
        scale: exitScale,
        opacity: 0,
        transition: {
          scale: {
            duration,
            ease: [0.22, 1, 0.36, 1],
          },
          opacity: {
            duration: duration * 0.7,
            ease: "easeOut",
          },
        },
      },

      enter: {
        scale: enterScale,
        opacity: 0,
      },
    }),
    [duration, enterScale, exitScale]
  );

  return {
    variants,
    activeVariant: "active",
    inactiveVariant: "inactive",
    enterVariant: "enter",
  };
}