import SidebarBodyTop from "./sidebarbodytop";
import SidebarBodyBottom from "./sidebarbodybottom";

/* ---- CHANGED: added onOpenRefundsPolicy to props ---- */
type SidebarProps = {
  onSignOut: () => void | Promise<void>;
  onOpenRefundsPolicy: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenTerms: () => void;
};

export default function Sidebar({
  onSignOut,
  onOpenRefundsPolicy,
  onOpenPrivacyPolicy,
  onOpenTerms,          // <-- CHANGED: destructured new prop
}: SidebarProps) {
  return (
    <aside className="absolute inset-y-0 left-0 z-20 h-screen w-72 md:relative md:shrink-0 bg-black shadow-2xl border-r border-white/10 flex flex-col">
      <SidebarBodyTop />
      {/* ---- CHANGED: forwarded the new prop down ---- */}
      <SidebarBodyBottom
        onSignOut={onSignOut}
        onOpenRefundsPolicy={onOpenRefundsPolicy}
        onOpenPrivacyPolicy={onOpenPrivacyPolicy}
        onOpenTerms={onOpenTerms}  
      />
    </aside>
  );
}