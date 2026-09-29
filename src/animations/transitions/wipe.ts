import { useMemo } from "react";
import type { Variants } from "motion/react";

type WipeDirection = "left" | "right";

type WipeTransitionOptions = {
  duration?: number;
  direction?: WipeDirection;
};

export default function useWipeTransition({
  duration = 0.8,
  direction = "left",
}: WipeTransitionOptions = {}) {
  const initialClip =
    direction === "left"
      ? "inset(0 100% 0 0)"
      : "inset(0 0 0 100%)";

  const variants = useMemo<Variants>(
    () => ({
      active: {
        clipPath: "inset(0 0% 0 0%)",
        opacity: 1,
        transition: {
          clipPath: {
            duration,
            ease: [0.22, 1, 0.36, 1],
          },
          opacity: {
            duration: duration * 0.5,
            ease: "easeOut",
          },
        },
      },

      inactive: {
        clipPath: "inset(0 100% 0 0%)",
        opacity: 0,
        transition: {
          clipPath: {
            duration: duration * 0.7,
            ease: "easeInOut",
          },
          opacity: {
            duration: duration * 0.5,
            ease: "easeIn",
          },
        },
      },

      enter: {
        clipPath: initialClip,
        opacity: 0,
      },
    }),
    [duration, initialClip]
  );

  return {
    variants,
    activeVariant: "active",
    inactiveVariant: "inactive",
    enterVariant: "enter",
  };
}