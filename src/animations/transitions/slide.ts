import { useMemo } from "react";
import type { Variants } from "motion/react";

type SlideDirection = "left" | "right";

type SlideTransitionOptions = {
  duration?: number;
  direction?: SlideDirection;
};

export default function useSlideTransition({
  duration = 0.7,
  direction = "left",
}: SlideTransitionOptions = {}) {
  const enterX = direction === "left" ? "100%" : "-100%";
  const exitX = direction === "left" ? "-100%" : "100%";

  const variants = useMemo<Variants>(
    () => ({
      active: {
        x: "0%",
        opacity: 1,
        transition: {
          x: {
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
        x: exitX,
        opacity: 0,
        transition: {
          x: {
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
        x: enterX,
        opacity: 0,
      },
    }),
    [duration, enterX, exitX]
  );

  return {
    variants,
    activeVariant: "active",
    inactiveVariant: "inactive",
    enterVariant: "enter",
  };
}