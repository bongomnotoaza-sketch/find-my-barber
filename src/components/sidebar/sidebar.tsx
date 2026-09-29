import SidebarBodyTop from "./sidebarbodytop";
import SidebarBodyBottom from "./sidebarbodybottom";

type SidebarProps = {
  role?: "user" | "barber";
  onSignOut: () => void | Promise<void>;
  onOpenRefundsPolicy: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenTerms: () => void;
};

export default function Sidebar({
  role = "user",
  onSignOut,
  onOpenRefundsPolicy,
  onOpenPrivacyPolicy,
  onOpenTerms,
}: SidebarProps) {
  return (
    <aside className="absolute inset-y-0 left-0 z-20 h-screen w-72 md:relative md:shrink-0 bg-black shadow-2xl border-r border-white/10 flex flex-col">
      <SidebarBodyTop />
      <SidebarBodyBottom
        role={role}
        onSignOut={onSignOut}
        onOpenRefundsPolicy={onOpenRefundsPolicy}
        onOpenPrivacyPolicy={onOpenPrivacyPolicy}
        onOpenTerms={onOpenTerms}
      />
    </aside>
  );
}