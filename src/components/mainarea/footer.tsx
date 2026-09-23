import { Compass, Plus, User } from "lucide-react";

type AppFooterProps = {
  onPlusPress?: () => void;
};

export default function AppFooter({ onPlusPress }: AppFooterProps) {
  return (
    <footer className="absolute top-[75%] left-0 right-0 h-[10%] z-10">
      <div className="flex h-full flex-row items-center justify-around px-6">
        {/* Categories */}
        <button type="button">
          <Compass size={25} color="#ffffff" />
        </button>

        {/* Add */}
        <button
          type="button"
          onClick={onPlusPress}
          className="h-12 w-12 flex items-center justify-center rounded-full active:opacity-70"
          style={{
            backgroundColor: "rgba(249, 115, 22, 0.4)",
            border: "1.5px solid rgba(249, 115, 22, 0.6)",
          }}
        >
          <Plus size={28} color="#ffffff" strokeWidth={2.5} />
        </button>

        {/* Account */}
        <button type="button">
          <User size={25} color="#ffffff" />
        </button>
      </div>
    </footer>
  );
}