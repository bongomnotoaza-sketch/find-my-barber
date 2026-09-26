type Booking = {
  serviceName: string;
  barberShopName: string;
  date: string;
};

const bookings: Booking[] = [
  {
    serviceName: 'Haircut',
    barberShopName: 'Fresh Cuts Barber Shop',
    date: '26 Sep 2026',
  },
  {
    serviceName: 'Haircut & Beard',
    barberShopName: 'The Gentlemen’s Cut',
    date: '18 Sep 2026',
  },
  {
    serviceName: 'Beard Trim',
    barberShopName: 'Urban Blade',
    date: '05 Sep 2026',
  },
  {
    serviceName: 'Haircut',
    barberShopName: 'Classic Barber Co.',
    date: '28 Aug 2026',
  },
];

export default function BookingsList() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col">
          {bookings.map((booking, index) => (
            <div
              key={index}
              className="py-4 border-b border-white/10"
            >
              <div className="text-white font-medium font-sans">
                {booking.serviceName}
              </div>

              <div className="mt-1 text-sm text-white/50 font-sans">
                {booking.barberShopName}
              </div>

              <div className="mt-1 text-xs text-white/35 font-sans">
                {booking.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}