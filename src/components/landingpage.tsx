// src/components/LandingPage.tsx

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Smartphone } from "lucide-react";
import { usePwaInstall } from "../lib/usePwaInstall";

interface LandingPageProps {
  /** Called when the user taps "Continue" or when the app is already installed. */
  onContinue: () => void;
}

export default function LandingPage({ onContinue }: LandingPageProps) {
  const { isInstalled, installPrompt, isIOS, promptInstall } = usePwaInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  // If the app is already installed (or was installed previously and we're
  // just opening in a browser tab), jump straight in — never show the landing.
  useEffect(() => {
    if (isInstalled) onContinue();
  }, [isInstalled, onContinue]);

  const handleInstall = async () => {
    if (isInstalled) {
      onContinue();
      return;
    }

    if (installPrompt) {
      const outcome = await promptInstall();
      if (outcome === "unavailable") setShowInstructions(true);
      return;
    }

    setShowInstructions(true);
  };

  if (isInstalled) return null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 py-12 text-white">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 35, -20, 0],
            y: [0, 25, -15, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-pink-600/20 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-orange-500/20 blur-[120px]"
        />
        <motion.div
          animate={{ opacity: [0.12, 0.3, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-red-600/20 blur-[120px]"
        />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-2xl"
      >
        <div className="flex flex-col items-center px-7 py-12 text-center sm:px-10">
          {/* App icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.06, rotate: 2 }}
            className="mb-7 rounded-[2rem] bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 p-[2px] shadow-lg shadow-red-500/20"
          >
            <div className="rounded-[calc(2rem-2px)] bg-black p-2">
              <img
                src="/pwa-512x512.png"
                alt="Find My Barber"
                className="h-24 w-24 rounded-2xl object-contain"
              />
            </div>
          </motion.div>

          {/* Branding */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-orange-400"
          >
            FIND MY BARBER
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-black tracking-tight sm:text-5xl"
          >
            Your next cut.
            <span className="mt-1 block bg-gradient-to-r from-pink-500 via-red-500 to-orange-400 bg-clip-text text-transparent">
              One tap away.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-5 max-w-xs text-sm leading-6 text-zinc-400"
          >
            Find your barber. Book your next cut. Get the app on your device.
          </motion.p>

          {/* Install button */}
          <motion.button
            type="button"
            onClick={handleInstall}
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="mt-9 flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 via-red-600 to-orange-500 px-4 text-base font-bold text-white shadow-lg shadow-red-500/20 transition-opacity hover:opacity-90"
          >
            <Download className="mr-2 h-5 w-5" />
            Install Find My Barber
          </motion.button>

          {/* Escape hatch — lets users continue in the browser without installing */}
          <button
            type="button"
            onClick={onContinue}
            className="mt-4 text-sm font-medium text-zinc-400 underline-offset-4 hover:text-white hover:underline"
          >
            Continue in browser
          </button>

          {/* Installation instructions */}
          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="w-full overflow-hidden"
              >
                <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-left">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                    <Smartphone className="h-4 w-4 text-orange-400" />
                    Install the app
                  </div>

                  <p className="text-sm leading-6 text-zinc-400">
                    {isIOS ? (
                      <>
                        Tap the{" "}
                        <strong className="text-white">Share</strong> button in
                        Safari, then select{" "}
                        <strong className="text-white">
                          Add to Home Screen
                        </strong>
                        .
                      </>
                    ) : (
                      <>
                        Open your browser menu and look for{" "}
                        <strong className="text-white">Install app</strong> or{" "}
                        <strong className="text-white">
                          Add to Home Screen
                        </strong>
                        .
                      </>
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="my-8 h-px w-full bg-white/10" />

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-2 text-xs text-zinc-500"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500" />
            Find your style. Find your barber.
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}