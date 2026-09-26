type Barber = {
  displayName: string;
};

const barbers: Barber[] = [
  {
    displayName: 'Fresh Cuts Barber Shop',
  },
  {
    displayName: 'The Gentlemen’s Cut',
  },
  {
    displayName: 'Urban Blade',
  },
  {
    displayName: 'Classic Barber Co.',
  },
];

export default function BarbersFollowing() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col">
          {barbers.map((barber, index) => (
            <div
              key={index}
              className="w-full h-14 flex items-center gap-4 px-3
                border-b border-white/10
                transition-transform duration-300 ease-out
                hover:translate-x-2"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center
                bg-white/10 text-white shrink-0"
              >
                <span className="fa-solid fa-user" />
              </div>

              <div className="text-white font-medium font-sans">
                {barber.displayName}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}