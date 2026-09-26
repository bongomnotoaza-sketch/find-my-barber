import SidebarBodyTop from "./sidebarbodytop";
import SidebarBodyBottom from "./sidebarbodybottom";

type SidebarProps = {
  onSignOut: () => void | Promise<void>;
};

export default function Sidebar({ onSignOut }: SidebarProps) {
  return (
    <aside className="absolute inset-y-0 left-0 z-20 h-screen w-72 md:relative md:shrink-0 bg-black shadow-2xl border-r border-white/10 flex flex-col">
      <SidebarBodyTop />
      <SidebarBodyBottom onSignOut={onSignOut} />
    </aside>
  );
}