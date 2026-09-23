import SidebarBodyTop from './sidebarbodytop';
import SidebarBodyBottom from './sidebarbodybottom';

export default function Sidebar() {
  return (
    <aside className="absolute inset-y-0 left-0 z-20 h-screen w-64 md:relative md:shrink-0 bg-[#2d2d2d] shadow-2xl border-r border-gray-700/50 flex flex-col">
      <SidebarBodyTop />
      <SidebarBodyBottom />
    </aside>
  );
}