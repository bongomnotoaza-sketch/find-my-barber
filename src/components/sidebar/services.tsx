
import { motion } from "motion/react";
import { useState } from "react";

type Service = {
  id: string;
  name: string;
  bookingsToday: number;
};

type ServicesProps = {
  services?: Service[];
  onAddService?: () => void;
  onRemoveService?: (service: Service) => void;
};

const defaultServices: Service[] = [
  {
    id: "1",
    name: "Haircut",
    bookingsToday: 12,
  },
  {
    id: "2",
    name: "Haircut + Beard",
    bookingsToday: 7,
  },
  {
    id: "3",
    name: "Beard Trim",
    bookingsToday: 3,
  },
];

export default function Services({
  services = defaultServices,
  onAddService,
  onRemoveService,
}: ServicesProps) {
  const [serviceList, setServiceList] = useState(services);

  const handleRemove = (service: Service) => {
    setServiceList((current) =>
      current.filter((item) => item.id !== service.id)
    );

    onRemoveService?.(service);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Services</h2>
      </div>

      {/* Service List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {serviceList.length === 0 && (
          <p className="text-white/50 text-sm text-center py-8">
            No services available
          </p>
        )}

        {serviceList.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.04,
              ease: "easeOut",
            }}
            className="rounded-xl bg-white/5 px-4 py-3"
          >
            {/* Service name */}
            <div className="text-sm font-bold text-white">
              {service.name}
            </div>

            {/* Bookings today */}
            <div className="text-xs text-white/50 mt-1">
              {service.bookingsToday}{" "}
              {service.bookingsToday === 1 ? "booking" : "bookings"} today
            </div>

            {/* Remove */}
            <button
              type="button"
              onClick={() => handleRemove(service)}
              className="mt-3 text-xs text-red-400 hover:text-red-300
                transition-colors cursor-pointer"
            >
              Remove service
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add Service */}
      <div className="px-4 py-3 shrink-0 border-t border-white/10">
        <button
          type="button"
          onClick={onAddService}
          className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10
            text-white text-sm font-semibold transition-colors cursor-pointer
            flex items-center justify-center gap-2"
        >
          <span className="fa-solid fa-plus" />
          Add Service
        </button>
      </div>
    </div>
  );
}
