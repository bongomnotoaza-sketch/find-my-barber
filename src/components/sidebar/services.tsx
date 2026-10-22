// src/components/sidebar/services.tsx
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import AddServiceModal, { type NewServicePayload } from "./Addservicemodal ";
import { createBarberService } from "../../lib/create_service";
import {
  DEFAULT_BARBER_SERVICES,
  applyImageFallback,
  APP_LOGO_URL,
  type BarberServiceCategory,
} from "../../lib/defaulcatalogue";
import { supabase } from "../../lib/superbase";

type Service = {
  id: string;
  /** Catalogue code (e.g. "H002"). Absent on legacy/custom services. */
  code?: string;
  name: string;
  price?: number;
  bookingsToday: number;
  imageUrl: string;
  /** Needed by applyImageFallback for the SVG placeholder step. */
  category: BarberServiceCategory;
  /** Needed by applyImageFallback for the logo step. */
  fallbackImageUrl: string;
};

type ServicesProps = {
  barberId?: string;
  onAddService?: (service: Service) => void;
  onRemoveService?: (service: Service) => void;
};

type ServiceRow = {
  service_name: string;
  price: number;
  bookings_today: number;
};

/* ---------- Catalogue lookup ---------- */

const FALLBACK_IMAGE = APP_LOGO_URL;

const normalise = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const CATALOGUE_BY_NORMALISED_NAME = new Map(
  DEFAULT_BARBER_SERVICES.map((s) => [normalise(s.name), s])
);

const catalogueEntryForName = (name: string) =>
  CATALOGUE_BY_NORMALISED_NAME.get(normalise(name));

/** Resolve everything the card + fallback chain needs from just a name. */
const resolveServiceVisuals = (
  name: string,
): { imageUrl: string; category: BarberServiceCategory; fallbackImageUrl: string } => {
  const entry = catalogueEntryForName(name);
  return {
    imageUrl: entry ? entry.imageUrl : FALLBACK_IMAGE,
    category: entry?.category ?? "hair", // safe default for legacy/custom
    fallbackImageUrl: APP_LOGO_URL,
  };
};

const formatPrice = (price: number) =>
  `R${price.toLocaleString("en-ZA", {
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

export default function Services({
  barberId,
  onAddService,
  onRemoveService,
}: ServicesProps) {
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Load services from Supabase ---------- */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      let targetId = barberId;
      if (!targetId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        targetId = user?.id;
      }

      if (!targetId) {
        if (!cancelled) {
          setError("Not signed in.");
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase.rpc(
        "get_barber_services_with_bookings",
        { p_barber_id: targetId }
      );

      if (cancelled) return;

      if (error) {
        console.error(error);
        setError(error.message);
        setLoading(false);
        return;
      }

      const mapped: Service[] = ((data ?? []) as ServiceRow[]).map(
        (row, index) => {
          const entry = catalogueEntryForName(row.service_name);
          const visuals = resolveServiceVisuals(row.service_name);
          return {
            id: entry?.code ?? `${row.service_name}-${index}`,
            code: entry?.code,
            name: row.service_name,
            price: row.price,
            bookingsToday: row.bookings_today,
            ...visuals,
          };
        }
      );

      setServiceList(mapped);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [barberId]);

  /* ---------- Add / Remove ---------- */

  const handleRemove = (service: Service) => {
    setServiceList((current) =>
      current.filter((item) => item.id !== service.id)
    );
    onRemoveService?.(service);
  };

  const handleAdd = async (picked: NewServicePayload) => {
    if (saving) return;
    setSaving(true);
    setError(null);

    const result = await createBarberService({
      name: picked.name,
      price: picked.price,
      service_code: picked.code,
    });

    if (!result.success) {
      setError(result.error);
      setSaving(false);
      return;
    }

    const visuals = resolveServiceVisuals(result.data.name);

    const newService: Service = {
      id: result.data.id,
      code: result.data.service_code ?? picked.code,
      name: result.data.name,
      price: result.data.price,
      bookingsToday: 0,
      ...visuals,
    };

    setServiceList((current) => [...current, newService]);
    onAddService?.(newService);
    setSaving(false);
    setModalOpen(false);
  };

  /* ---------- Render ---------- */

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-zinc-950">
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Services</h2>
      </div>

      {error && (
        <div className="mx-4 mb-2 shrink-0 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-300 hover:text-red-100 cursor-pointer"
            aria-label="Dismiss"
          >
            <span className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {loading && (
          <p className="text-white/50 text-sm text-center py-8">
            Loading services…
          </p>
        )}

        {!loading && serviceList.length === 0 && (
          <p className="text-white/50 text-sm text-center py-8">
            No services available
          </p>
        )}

        {!loading &&
          serviceList.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.04,
                ease: "easeOut",
              }}
              className="rounded-xl bg-white/5 overflow-hidden flex h-[120px] shrink-0"
            >
              <div className="flex-1 px-4 py-3 flex flex-col justify-between min-w-0">
                <div>
                  <div className="text-sm font-bold text-white truncate">
                    {service.name}
                  </div>

                  {service.price !== undefined && (
                    <div className="text-sm font-semibold text-emerald-400 mt-0.5">
                      {formatPrice(service.price)}
                    </div>
                  )}

                  <div className="text-xs text-white/50 mt-1">
                    {service.bookingsToday}{" "}
                    {service.bookingsToday === 1 ? "booking" : "bookings"} today
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(service)}
                  className="mt-3 self-start text-xs text-red-400 hover:text-red-300
                    transition-colors cursor-pointer"
                >
                  Remove service
                </button>
              </div>

              <div className="w-32 shrink-0">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  onError={(e) => applyImageFallback(e.currentTarget, service)}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          ))}
      </div>

      <div className="px-4 py-3 shrink-0 border-t border-white/10">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={saving || loading}
          className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10
            text-white text-sm font-semibold transition-colors cursor-pointer
            flex items-center justify-center gap-2
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            className={`fa-solid ${
              saving ? "fa-spinner fa-spin" : "fa-plus"
            }`}
          />
          {saving ? "Saving…" : "Add Service"}
        </button>
      </div>

      <AddServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        existingCodes={serviceList.flatMap((s) => (s.code ? [s.code] : []))}
      />
    </div>
  );
}