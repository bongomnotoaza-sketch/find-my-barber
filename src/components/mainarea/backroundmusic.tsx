import { useEffect, useRef } from "react";

type BackgroundMusicProps = {
  src: string;
  volume?: number;
  loop?: boolean;
  playing: boolean; // NEW — controls play/pause
};

export default function BackgroundMusic({
  src,
  volume = 0.3,
  loop = true,
  playing,
}: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const gestureCleanupRef = useRef<() => void>(() => {});

  // keep volume in sync without restarting playback
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // play/pause driven purely by the `playing` prop
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!playing) {
      audio.pause();
      gestureCleanupRef.current();
      return;
    }

    const attemptPlay = () => {
      audio.play().catch((err) => {
        console.warn("[BackgroundMusic] play blocked, waiting for gesture", err.name);

        const onGesture = () => {
          audio.play().catch(() => {});
          cleanupGesture();
        };

        const cleanupGesture = () => {
          document.removeEventListener("pointerdown", onGesture, true);
          document.removeEventListener("keydown", onGesture, true);
          document.removeEventListener("touchstart", onGesture, true);
        };

        document.addEventListener("pointerdown", onGesture, true);
        document.addEventListener("keydown", onGesture, true);
        document.addEventListener("touchstart", onGesture, true);

        gestureCleanupRef.current = cleanupGesture;
      });
    };

    attemptPlay();

    return () => {
      gestureCleanupRef.current();
    };
  }, [playing, src]);

  return <audio ref={audioRef} src={src} loop={loop} preload="auto" playsInline />;
}