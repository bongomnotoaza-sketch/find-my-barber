// useIsBarber.ts
import { useEffect, useState } from "react";
import { supabase } from "./superbase";

export function useIsBarber(userId: string | null | undefined) {
  const [isBarber, setIsBarber] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsBarber(false);
      return;
    }

    let cancelled = false;

    supabase
      .from("barber_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsBarber(!!data);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return isBarber; // null = still checking
}