import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_BARBER_SERVICES,
  type BarberServiceCategory,
  type DefaultBarberService,
} from "../../lib/defaulcatalogue";

export type NewServicePayload = DefaultBarberService & { price: number };

type AddServiceModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (service: NewServicePayload) => void;
  /** Catalogue codes already on the shop's menu – these are hidden from the picker */
  existingCodes?: string[];
};

type CategoryFilter = "all" | BarberServiceCategory;

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hair", label: "Hair" },
  { value: "beard", label: "Beard" },
  { value: "shave", label: "Shave" },
  { value: "combined", label: "Combined" },
  { value: "kids", label: "Kids" },
];

const withImageParams = (url: string) =>
  `${url}?auto=format&fit=crop&w=400&q=80`;

export default function AddServiceModal({
  open,
  onClose,
  onAdd,
  existingCodes = [],
}: AddServiceModalProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [price, setPrice] = useState("");

  // Reset everything each time the popup opens
  useEffect(() => {
    if (open) {
      setCategory("all");
      setQuery("");
      setSelectedCode(null);
      setPrice("");
    }
  }, [open]);

  // Close on Escape + lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const available = useMemo(
    () =>
      DEFAULT_BARBER_SERVICES.filter((s) => !existingCodes.includes(s.code)),
    [existingCodes]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return available.filter(
      (s) =>
        (category === "all" || s.category === category) &&
        (q === "" || s.name.toLowerCase().includes(q))
    );
  }, [available, category, query]);

  const selected = available.find((s) => s.code === selectedCode) ?? null;
  const priceNumber = parseFloat(price);
  const priceValid = Number.isFinite(priceNumber) && priceNumber > 0;

  const handlePriceChange = (value: string) => {
    // digits and a single decimal point, max 2 decimals
    const cleaned = value.replace(/[^\d.]/g, "");
    const [whole, ...rest] = cleaned.split(".");
    const next = rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
    setPrice(next);
  };

  const handleConfirm = () => {
    if (!selected || !priceValid) return;
    onAdd({ ...selected, price: Math.round(priceNumber * 100) / 100 });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Add a service"
            className="relative w-full sm:max-w-lg max-h-[88vh] flex flex-col
              bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-white/10
              shadow-2xl overflow-hidden"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">Add service</h3>
                <p className="text-xs text-white/50">
                  Pick from the catalogue, then set your price
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10
                  text-white/70 hover:text-white transition-colors cursor-pointer
                  flex items-center justify-center"
              >
                <span className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 shrink-0">
              <div className="relative">
                <span
                  className="fa-solid fa-magnifying-glass absolute left-3 top-1/2
                    -translate-y-1/2 text-white/30 text-xs"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search services"
                  className="w-full h-10 rounded-xl bg-white/5 pl-9 pr-3 text-sm
                    text-white placeholder:text-white/30 outline-none
                    focus:ring-1 focus:ring-white/30"
                />
              </div>
            </div>

            {/* Category chips */}
            <div className="px-4 py-3 shrink-0 flex gap-2 overflow-x-auto">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`px-3 h-8 rounded-full text-xs font-semibold shrink-0
                    transition-colors cursor-pointer ${
                      category === c.value
                        ? "bg-white text-zinc-900"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Catalogue grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-[200px]">
              {filtered.length === 0 ? (
                <p className="text-white/50 text-sm text-center py-10">
                  {available.length === 0
                    ? "You've added every service in the catalogue"
                    : "No services match your search"}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filtered.map((s) => {
                    const isSelected = s.code === selectedCode;
                    return (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => setSelectedCode(s.code)}
                        aria-pressed={isSelected}
                        className={`relative rounded-xl overflow-hidden text-left
                          bg-white/5 cursor-pointer transition-all ${
                            isSelected
                              ? "ring-2 ring-white"
                              : "ring-1 ring-transparent hover:ring-white/30"
                          }`}
                      >
                        <img
                          src={withImageParams(s.imageUrl)}
                          alt={s.name}
                          loading="lazy"
                          className="w-full h-24 object-cover"
                        />
                        <div className="px-3 py-2">
                          <div className="text-sm font-semibold text-white leading-tight">
                            {s.name}
                          </div>
                          <div className="text-[11px] text-white/40 mt-0.5 capitalize">
                            {s.category}
                          </div>
                        </div>
                        {isSelected && (
                          <span
                            className="absolute top-2 right-2 h-6 w-6 rounded-full
                              bg-white text-zinc-900 text-xs flex items-center
                              justify-center"
                          >
                            <span className="fa-solid fa-check" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer: price + confirm */}
            <div className="shrink-0 border-t border-white/10 px-4 py-3 bg-zinc-900">
              {selected ? (
                <div className="flex flex-col gap-3">
                  <div className="text-xs text-white/50">
                    Selected:{" "}
                    <span className="text-white font-semibold">
                      {selected.name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2
                          text-sm text-white/50"
                      >
                        R
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                        placeholder="Price"
                        aria-label="Service price"
                        autoFocus
                        className="w-full h-11 rounded-xl bg-white/5 pl-7 pr-3
                          text-sm text-white placeholder:text-white/30
                          outline-none focus:ring-1 focus:ring-white/30"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={!priceValid}
                      className="h-11 px-5 rounded-xl bg-white text-zinc-900
                        text-sm font-semibold transition-opacity cursor-pointer
                        disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/40 text-center py-1">
                  Select a service above to set its price
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}