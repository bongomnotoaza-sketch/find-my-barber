import { useEffect, useState } from 'react';
import { supabase } from '../../lib/superbase'; // adjust path to your supabase client

type Booking = {
  service_name: string;
  shop_name: string;
  booking_date: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('No user logged in');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_user_bookings', {
        p_user_id: user.id,
      });

      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        setBookings(data ?? []);
      }
      setLoading(false);
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-white/50 text-sm font-sans">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-red-400 text-sm font-sans">
            Failed to load bookings: {error}
          </div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-white/50 text-sm font-sans">
            No bookings yet.
          </div>
        </div>
      </div>
    );
  }

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
                {booking.service_name}
              </div>

              <div className="mt-1 text-sm text-white/50 font-sans">
                {booking.shop_name}
              </div>

              <div className="mt-1 text-xs text-white/35 font-sans">
                {formatDate(booking.booking_date)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}