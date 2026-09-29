import { useMemo } from "react";
import type { Variants } from "motion/react";

type FadeTransitionOptions = {
  duration?: number;
  activeOpacity?: number;
  inactiveOpacity?: number;
};

export default function useFadeTransition({
  duration = 0.8,
  activeOpacity = 1,
  inactiveOpacity = 0,
}: FadeTransitionOptions = {}) {
  const variants = useMemo<Variants>(
    () => ({
      active: {
        opacity: activeOpacity,
        transition: {
          duration,
          ease: "easeOut",
        },
      },

      inactive: {
        opacity: inactiveOpacity,
        transition: {
          duration,
          ease: "easeOut",
        },
      },

      enter: {
        opacity: 0,
      },
    }),
    [duration, activeOpacity, inactiveOpacity]
  );

  return {
    variants,
    activeVariant: "active",
    inactiveVariant: "inactive",
    enterVariant: "enter",
  };
}