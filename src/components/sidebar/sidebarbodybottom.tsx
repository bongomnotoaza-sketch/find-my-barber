const toggleOptions = [
  'all', 'unread', 'important', 'announcement',
  'course', 'event', 'assignment', 'system'
] as const;

type ToggleOption = typeof toggleOptions[number];

const icons: Record<ToggleOption, string> = {
  all: 'fa-list',
  unread: 'fa-envelope',
  important: 'fa-star',
  announcement: 'fa-bullhorn',
  course: 'fa-book',
  event: 'fa-calendar-check',
  assignment: 'fa-pencil-alt',
  system: 'fa-server'
};

const unread = '12';

export default function SidebarBodyBottom() {
  return (
    <div className="flex flex-col gap-1 p-2 overflow-y-auto flex-1">
      {toggleOptions.map((option) => (
        <div
          key={option}
          className="w-full h-12 md:h-14 grid grid-cols-[20%_60%_20%] overflow-hidden
            transition-transform duration-300 ease-out hover:translate-x-2"
        >
          <div className="flex items-center justify-center text-white font-sans">
            <span className={`fa-solid ${icons[option]}`} />
          </div>
          <div className="flex items-center justify-start text-white font-medium font-sans">
            {option}
          </div>
          <div className="flex items-center justify-center text-white font-semibold font-sans">
            {unread}
          </div>
        </div>
      ))}
    </div>
  );
}