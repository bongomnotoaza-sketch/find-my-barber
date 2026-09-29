// sidebarbodytop.tsx
import { useEffect, useMemo, useState } from "react";
import {
  getMyProfile,
  getAvatarUrl,
  type Profile,
} from "../../lib/get_profile";

type DefaultAvatar = {
  emoji: string;
  background: string;
};

const avatarEmojis = [
  "😎", "🧔🏽", "👨🏾‍🦱", "👨🏿‍🦲", "👨🏼‍🎨", "👨🏽‍🚀",
  "🧑🏾‍💻", "🧑🏽‍🎤", "🤠", "🥸", "😈", "👽",
];

const avatarBackgrounds = [
  "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500",
  "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
  "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500",
  "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500",
  "bg-rose-500",
];

const defaultAvatars: DefaultAvatar[] = avatarEmojis.map((emoji, index) => ({
  emoji,
  background: avatarBackgrounds[index % avatarBackgrounds.length],
}));

export default function SidebarBodyTop() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ kind: string; reason: string } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    getMyProfile().then((res) => {
      if (cancelled) return;

      if (res.ok === false) {
        setError({ kind: res.kind, reason: res.reason });
      } else {
        setProfile(res.profile);
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const avatarUrl = profile ? getAvatarUrl(profile.avatar_path) : null;

  // Pick a stable random default avatar for this profile
  const defaultAvatar = useMemo(() => {
    const seed = profile?.id ?? profile?.display_name ?? "guest";
    // Simple deterministic hash so the same user always gets the same avatar
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return defaultAvatars[Math.abs(hash) % defaultAvatars.length];
  }, [profile]);

  return (
    <div className="h-[10%] shrink-0 border-b border-white/10 flex items-center justify-start px-3">
      {/* User Icon */}
      <div className="p-[2px] rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-red-500 shrink-0">
        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile?.display_name ?? "User avatar"}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div
              className={`w-full h-full rounded-full flex items-center justify-center text-lg ${defaultAvatar.background}`}
              role="img"
              aria-label={profile?.display_name ?? "Default avatar"}
            >
              {defaultAvatar.emoji}
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="ml-3 min-w-0 flex flex-col justify-center">
        <div className="text-sm font-semibold text-white truncate">
          {loading
            ? "Loading…"
            : error
            ? error.kind === "unauthenticated"
              ? "Guest"
              : "Profile error"
            : profile?.display_name ?? "Unnamed"}
        </div>

        <div className="text-xs text-zinc-500 mt-0.5 truncate">
          {loading ? "" : error ? error.reason : profile?.bio ?? "No bio yet"}
        </div>
      </div>
    </div>
  );
}