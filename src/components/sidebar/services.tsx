// src/components/sidebar/services.tsx
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import AddServiceModal, { type NewServicePayload } from "./Addservicemodal ";
import { createBarberService } from "../../lib/create_service";
import { DEFAULT_BARBER_SERVICES } from "../../lib/defaulcatalogue";
import { supabase } from "../../lib/superbase";

type Service = {
  id: string;
  /** Catalogue code (e.g. "H002"). Absent on legacy/custom services. */
  code?: string;
  name: string;
  price?: number;
  bookingsToday: number;
  imageUrl: string;
};

type ServicesProps = {
  /** The barber whose services to load. Defaults to the signed-in user's. */
  barberId?: string;
  onAddService?: (service: Service) => void;
  onRemoveService?: (service: Service) => void;
};

/* ---------- Raw shape from get_barber_services_with_bookings ---------- */

type ServiceRow = {
  service_name: string;
  price: number;
  bookings_today: number;
};

/* ---------- Front-end-only helpers ---------- */

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=500&q=80";

// Match catalogue entries by name (case-insensitive) since the RPC
// doesn't return service_code.
const CATALOGUE_BY_NAME = new Map(
  DEFAULT_BARBER_SERVICES.map((s) => [s.name.toLowerCase(), s])
);

const imageForName = (name: string): string => {
  const entry = CATALOGUE_BY_NAME.get(name.toLowerCase());
  return entry
    ? `${entry.imageUrl}?auto=format&fit=crop&w=500&q=80`
    : FALLBACK_IMAGE;
};

const codeForName = (name: string): string | undefined => {
  const entry = CATALOGUE_BY_NAME.get(name.toLowerCase());
  return entry?.code;
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

      // If no explicit barberId, fall back to the signed-in user.
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
        (row, index) => ({
          // RPC has no id — derive a stable one from name so React keys
          // and remove-logic still work. Swap for a real id once the
          // function returns one.
          id: codeForName(row.service_name) ?? `${row.service_name}-${index}`,
          code: codeForName(row.service_name),
          name: row.service_name,
          price: row.price,
          bookingsToday: row.bookings_today,
          imageUrl: imageForName(row.service_name),
        })
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

    const newService: Service = {
      id: result.data.id,
      code: result.data.service_code ?? picked.code,
      name: result.data.name,
      price: result.data.price,
      bookingsToday: 0,
      imageUrl: imageForName(result.data.name),
    };

    setServiceList((current) => [...current, newService]);
    onAddService?.(newService);
    setSaving(false);
    setModalOpen(false);
  };

  /* ---------- Render ---------- */

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Services</h2>
      </div>

      {/* Error banner */}
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

      {/* Service List */}
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
              {/* Service Info */}
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

              {/* Service Image */}
              <div className="w-32 shrink-0">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          ))}
      </div>

      {/* Add Service */}
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