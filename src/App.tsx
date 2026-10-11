// App.tsx
import { useState, useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "motion/react";
import { Search, ImagePlus } from "lucide-react";
import { getCurrentUser, onAuthStateChange, signOut } from "./lib/auth";
import { supabase } from "./lib/superbase";
import { updateProfile } from "./lib/profiles";
import { saveBarberProfile } from "./lib/barber_profiles";
import { createPostWithUploads, CreatePostError } from "./lib/posts";
// ── Feed loader + types live in get_posts.ts now
import { getFeedPosts, type FeedPost } from "./lib/get_posts";
import { createBooking } from "./lib/create_booking";
import { followBarber, unfollowBarber, isFollowing } from "./lib/follow";
import { useIsBarber } from "./lib/useIsBarber";
import { useLatestPosterProfile } from "./lib/useLatestPosterProfile";
import ResultsList from "./components/mainarea/searchresultlist";
import BookPopUp from "./components/mainarea/bookpopup";
import OrderSummary from "./components/mainarea/ordersummary";
import BarberScreen from "./components/mainarea/barber";
import CommentsPopUp from "./components/mainarea/comments";
import Login from "./components/mainarea/loginpage";
import Sidebar from "./components/sidebar/sidebar";
import SignUp from "./components/mainarea/signup";
import ProfileSetup from "./components/sidebar/set_profile";
import BarberProfileSetup from "./components/sidebar/barber_set_profile";
import RefundsPolicy from "./components/mainarea/refundspolicy";
import PrivacyPolicy from "./components/mainarea/privacypolicys";
import TermsPolicy from "./components/mainarea/termspolicys";
import CreatePost, { type Category } from "./components/mainarea/createpost";
import PostCard from "./components/mainarea/PostCard";

const MUSIC_SRC = "/u_iu7xltufu1-sikhala-sonke-prodbywizlee-166112.mp3"; // from /public
const PAGE_SIZE = 8;

/* ---------- Types ---------- */

type Service = {
  id: string;
  image: string;
  name: string;
  price: number | string;
};

type Comment = {
  id: string;
  username: string;
  text: string;
  likes: number;
};

type View =
  | "home"
  | "order-summary"
  | "barber"
  | "refunds-policy"
  | "privacy-policy"
  | "terms-policy";

type Feed = "barbers" | "general";
type Role = "user" | "barber";

export default function App() {
  /* ---------- Session & profile gating ---------- */

  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showBarberSetup, setShowBarberSetup] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [pendingRole, setPendingRole] = useState<Role>("user");

  /* ---------- View state ---------- */

  const [view, setView] = useState<View>("home");
  const [activeFeed, setActiveFeed] = useState<Feed>("barbers");
  const [showBookPopup, setShowBookPopup] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  /* ---------- Feed state ---------- */

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const loadingMoreRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);

  /* ---------- Feed scroll restoration ---------- */

  const feedScrollRef = useRef<HTMLDivElement | null>(null);
  const savedPostIndexRef = useRef<number>(0);

  /* ---------- Booking selection ---------- */

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // The barber whose profile the signed-in user is currently viewing.
  const [viewingBarberId, setViewingBarberId] = useState<string | null>(null);

  // Poster info captured from the tapped post so the barber header
  // matches what Description showed on the feed.
  const [viewingBarberName, setViewingBarberName] = useState<string | null>(
    null,
  );
  const [viewingBarberAvatar, setViewingBarberAvatar] = useState<string | null>(
    null,
  );

  const { barberId: posterBarberId } = useLatestPosterProfile();
  const activeBarberId = viewingBarberId ?? posterBarberId ?? undefined;

  // Display name used as a fallback for the booking `name` field.
  const [currentUserName, setCurrentUserName] = useState<string>("");

  // Payment submission state
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  /* ---------- Follow state ---------- */

  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  /* ---------- Role detection ---------- */

  const isBarber = useIsBarber(user?.id);

  /* ---------- Derived: is the main (home) screen actually showing? ---------- */

  const isOnMainView =
    !!user &&
    !checkingSession &&
    !checkingProfile &&
    !showProfileSetup &&
    !showBarberSetup &&
    view === "home";

  /* ---------- Effects ---------- */

  // Session on mount
  useEffect(() => {
    getCurrentUser().then((result) => {
      if (result.success) {
        setUser(result.data);
      }
      setCheckingSession(false);
    });

    const unsubscribe = onAuthStateChange((u) => {
      setUser(u);
    });

    return unsubscribe;
  }, []);

  // Profile gating
  useEffect(() => {
    if (!user) {
      setCheckingProfile(false);
      return;
    }

    setCheckingProfile(true);

    (async () => {
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      const needsProfile = profileErr || !profile?.display_name;

      if (needsProfile) {
        if (pendingRole === "barber") {
          setShowBarberSetup(true);
          setShowProfileSetup(false);
        } else {
          setShowProfileSetup(true);
          setShowBarberSetup(false);
        }
        setCheckingProfile(false);
        return;
      }

      const { data: barber } = await supabase
        .from("barber_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (barber) {
        setShowBarberSetup(false);
        setShowProfileSetup(false);
      } else if (pendingRole === "barber") {
        setShowBarberSetup(true);
        setShowProfileSetup(false);
      } else {
        setShowProfileSetup(false);
        setShowBarberSetup(false);
      }

      setCheckingProfile(false);
    })();
  }, [user, pendingRole]);

  // Load the feed whenever the user is signed in and profile gating is done.
  useEffect(() => {
    if (!user || checkingProfile) {
      setPosts([]);
      setHasMore(true);
      return;
    }

    let cancelled = false;
    setLoadingFeed(true);
    setFeedError(null);

    getFeedPosts(supabase, { limit: PAGE_SIZE })
      .then((rows) => {
        if (cancelled) return;
        setPosts([...rows]);
        setHasMore(rows.length === PAGE_SIZE);
        setActiveIndex(0);
      })
      .catch((err) => {
        if (!cancelled) {
          setFeedError(
            err instanceof Error ? err.message : "Failed to load feed",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingFeed(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, checkingProfile]);

  // Restore the feed's scroll position whenever we come back to "home".
  useEffect(() => {
    if (view !== "home") return;
    const el = feedScrollRef.current;
    if (!el) return;

    const id = requestAnimationFrame(() => {
      el.scrollTop = savedPostIndexRef.current * el.clientHeight;
      setActiveIndex(savedPostIndexRef.current);
    });
    return () => cancelAnimationFrame(id);
  }, [view]);

  // Fetch the next page when the user is within 3 posts of the end.
  useEffect(() => {
    if (posts.length > 0 && activeIndex >= posts.length - 3) {
      void loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, posts.length, hasMore]);

  // Load the signed-in user's display name for booking fallback
  useEffect(() => {
    if (!user) {
      setCurrentUserName("");
      return;
    }
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setCurrentUserName(data?.display_name ?? "Guest");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Load follow state whenever the viewer or the active barber changes
  useEffect(() => {
    if (!user || !activeBarberId || activeBarberId === user.id) {
      setFollowing(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const result = await isFollowing(activeBarberId, user.id);
      if (!cancelled && result.success) setFollowing(result.data);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, activeBarberId]);

  // Background music: plays only while the main (home) view is showing.
  useEffect(() => {
    if (!isOnMainView) return;

    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0.4;

    const gestureEvents = ["pointerdown", "touchstart", "keydown", "click"];

    const removeGestureListeners = () =>
      gestureEvents.forEach((e) =>
        window.removeEventListener(e, startOnGesture),
      );

    function startOnGesture() {
      if (document.hidden) return;
      audio
        .play()
        .then(removeGestureListeners)
        .catch((err) =>
          console.warn("Music play failed:", err.name, err.message),
        );
    }

    audio.play().catch((err) => {
      console.warn("Music autoplay failed:", err.name, err.message);
      if (err.name === "NotAllowedError") {
        gestureEvents.forEach((e) =>
          window.addEventListener(e, startOnGesture, { passive: true }),
        );
      }
    });

    const handleVisibility = () => {
      if (document.hidden) {
        audio.pause();
      } else {
        audio.play().catch(() => {
          /* will start on next gesture if still blocked */
        });
      }
    };

    const handlePageHide = () => audio.pause();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      removeGestureListeners();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, [isOnMainView]);

  /* ---------- Handlers ---------- */

  // Capture which post is currently snapped into view, so we can restore
  // it when the user returns to the home feed.
  const captureActivePostIndex = () => {
    const el = feedScrollRef.current;
    if (!el) return;
    const cardHeight = el.clientHeight;
    if (cardHeight <= 0) return;
    savedPostIndexRef.current = Math.round(el.scrollTop / cardHeight);
  };

  const loadMore = async () => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const rows = await getFeedPosts(supabase, {
        limit: PAGE_SIZE,
        offset: posts.length,
      });

      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...rows.filter((r) => !seen.has(r.id))];
      });
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      console.warn("Load more failed:", err);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  // Throttled to one update per frame.
  const handleFeedScroll = () => {
    if (scrollRafRef.current != null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const el = feedScrollRef.current;
      if (!el || el.clientHeight <= 0) return;
      const i = Math.round(el.scrollTop / el.clientHeight);
      setActiveIndex((prev) => (prev === i ? prev : i));
    });
  };

  // BookPopUp's "Book" → navigate to the barber's profile.
  const handleBook = () => {
    captureActivePostIndex();
    setShowBookPopup(false);
    setSelectedDate(undefined);

    if (posterBarberId) {
      setViewingBarberId(posterBarberId);
    }

    // No post context here — clear so header falls back to defaults.
    setViewingBarberName(null);
    setViewingBarberAvatar(null);

    setView("barber");
  };

  // BarberStats's "Book" → go to the summary with both service + date.
  const handleBarberBook = (service: Service, date: Date) => {
    setSelectedService(service);
    setSelectedDate(date);
    setView("order-summary");
  };

  // OrderSummary's "Pay Now" → actually insert into `bookings`.
  const handlePay = async (bookingForName: string) => {
    if (paying) return;

    if (!user) {
      setPayError("Not signed in.");
      return;
    }
    if (!activeBarberId) {
      setPayError("No barber selected.");
      return;
    }
    if (!selectedService?.id) {
      setPayError("No service selected.");
      return;
    }
    if (!selectedDate) {
      setPayError("No date selected.");
      return;
    }

    setPaying(true);
    setPayError(null);

    const result = await createBooking({
      user_id: user.id,
      barber_id: activeBarberId,
      service_id: selectedService.id,
      name: bookingForName.trim() || currentUserName || "Guest",
      booking_date: selectedDate,
    });

    setPaying(false);

    if (!result.success) {
      setPayError(result.error);
      return;
    }

    setSelectedService(null);
    setSelectedDate(undefined);
    setView("home");
  };

  const handleAddComment = (text: string) => {
    setComments((prev) => [
      ...prev,
      { id: Date.now().toString(), username: "you", text, likes: 0 },
    ]);
  };

  const handleCreatePost = async (
    images: File[],
    description: string,
    category: Category | null,
  ) => {
    if (!user) throw new Error("Not signed in.");
    if (images.length === 0) throw new Error("Add at least one image.");

    try {
      const result = await createPostWithUploads(supabase, {
        barber_id: user.id,
        category: category ?? "Haircut",
        description: description || null,
        media: images.map((file, index) => ({
          file,
          filename: file.name || `image-${index}.jpg`,
          audio: null,
        })),
      });

      console.log(
        "Post created:",
        result.post.id,
        `${result.media.length} media`,
      );
      setShowCreatePost(false);

      try {
        const rows = await getFeedPosts(supabase, { limit: PAGE_SIZE });
        setPosts([...rows]);
        setHasMore(rows.length === PAGE_SIZE);
        savedPostIndexRef.current = 0;
        setActiveIndex(0);
        if (feedScrollRef.current) feedScrollRef.current.scrollTop = 0;
      } catch (refreshErr) {
        console.warn("Feed refresh after post failed:", refreshErr);
      }
    } catch (err) {
      if (err instanceof CreatePostError) throw new Error(err.message);
      throw err;
    }
  };

  // Follow / Unfollow the currently active barber.
  const handleFollowToggle = async () => {
    if (!user || !activeBarberId || activeBarberId === user.id) return;
    if (followLoading) return;

    setFollowLoading(true);
    const currentlyFollowing = following;

    setFollowing(!currentlyFollowing);

    const result = currentlyFollowing
      ? await unfollowBarber(activeBarberId, user.id)
      : await followBarber(activeBarberId, user.id);

    if (!result.success) {
      console.error("Follow toggle failed:", result.error);
      setFollowing(currentlyFollowing);
    }

    setFollowLoading(false);
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.success) {
      console.error("Sign out failed:", result.error);
      return;
    }
    setShowSidebar(false);
  };

  const handleOpenRefundsPolicy = () => {
    setShowSidebar(false);
    setView("refunds-policy");
  };

  const handleOpenPrivacyPolicy = () => {
    setShowSidebar(false);
    setView("privacy-policy");
  };

  const handleOpenTerms = () => {
    setShowSidebar(false);
    setView("terms-policy");
  };

  // Avatar tap on the feed — opens the barber's profile with the
  // poster's display name and avatar so the header matches the feed.
  const handleOpenBarberProfile = (post: FeedPost) => {
    captureActivePostIndex();
    setViewingBarberId(post.barber_id);
    setViewingBarberName(post.barber_display_name ?? null);
    setViewingBarberAvatar(post.barber_avatar_url ?? null);
    setView("barber");
  };

  // Profile icon tap in the bottom footer — opens the sidebar.
  const handleOpenSidebar = () => {
    setShowSidebar(true);
  };

  /* ---------- Derived ---------- */

  const formattedDate = selectedDate
    ? new Intl.DateTimeFormat("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(selectedDate)
    : "";

  /* ---------- Early returns ---------- */

  if (checkingSession || (user && checkingProfile)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* splash */}
      </div>
    );
  }

  if (!user) {
    if (showSignUp) {
      return (
        <SignUp
          onClose={() => setShowSignUp(false)}
          onSignUpSuccess={(role) => {
            setPendingRole(role);
            setShowSignUp(false);
          }}
        />
      );
    }

    return (
      <Login
        onLoginSuccess={() => {}}
        onSignUpPress={() => setShowSignUp(true)}
      />
    );
  }

  // USER profile setup
  if (showProfileSetup) {
    return (
      <ProfileSetup
        onContinue={async (details) => {
          const result = await updateProfile({
            displayName: details.displayName,
            bio: details.bio,
            avatarFile:
              details.avatar.type === "upload" ? details.avatar.file : null,
          });

          if (!result.success) {
            console.error("Profile setup failed:", result.error);
            return;
          }

          setShowProfileSetup(false);
        }}
        onClose={async () => {
          await signOut();
          setShowProfileSetup(false);
        }}
      />
    );
  }

  // BARBER profile setup
  if (showBarberSetup) {
    return (
      <BarberProfileSetup
        onContinue={async (details) => {
          const profileResult = await updateProfile({
            displayName: details.displayName,
            bio: details.bio,
            avatarFile:
              details.avatar.type === "upload" ? details.avatar.file : null,
          });

          if (!profileResult.success) {
            console.error("Profile setup failed:", profileResult.error);
            return;
          }

          const barberResult = await saveBarberProfile({
            shop_name: details.barberProfile.shopName,
            address: details.barberProfile.address,
            account_number: details.barberProfile.accountNumber,
            account_holder: details.barberProfile.accountHolder,
            whatsapp: details.barberProfile.whatsapp,
            phone: details.barberProfile.phone,
            email: details.barberProfile.email,
            instagram: details.barberProfile.instagram,
            facebook: details.barberProfile.facebook,
            twitter: details.barberProfile.twitter,
          });

          if (!barberResult.success) {
            console.error("Barber profile save failed:", barberResult.error);
            return;
          }

          setShowBarberSetup(false);
        }}
        onClose={async () => {
          await signOut();
          setShowBarberSetup(false);
        }}
      />
    );
  }

  /* ---------- Main render ---------- */

  return (
    <>
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 z-30 bg-black/50"
            />
            <motion.div
              key="sidebar-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-40"
            >
              <Sidebar
                role={isBarber ? "barber" : "user"}
                onSignOut={handleSignOut}
                onOpenRefundsPolicy={handleOpenRefundsPolicy}
                onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
                onOpenTerms={handleOpenTerms}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {view === "barber" && (
        <BarberScreen
          isBarber={!!isBarber}
          barberId={isBarber ? user.id : activeBarberId}
          barberName={viewingBarberName ?? undefined}
          barberAvatar={viewingBarberAvatar ?? undefined}
          onBack={() => {
            setView("home");
            setViewingBarberId(null);
            setViewingBarberName(null);
            setViewingBarberAvatar(null);
          }}
          onBook={handleBarberBook}
          onCreatePost={handleCreatePost}
        />
      )}

      {view === "order-summary" && (
        <div className="flex flex-col h-dvh bg-zinc-950 p-4 overflow-hidden overflow-y-auto">
          <button
            type="button"
            onClick={() => setView("home")}
            className="text-white mb-4"
          >
            ← Back
          </button>

          <OrderSummary
            serviceName={selectedService?.name ?? ""}
            date={formattedDate}
            time="14:30"
            barberName="Fresh Cuts"
            total={selectedService?.price ?? ""}
            onPay={handlePay}
          />

          {payError && (
            <p className="mt-3 text-sm text-red-400">{payError}</p>
          )}

          {paying && (
            <p className="mt-3 text-sm text-white/60">Sending booking…</p>
          )}
        </div>
      )}

      {view === "refunds-policy" && (
        <RefundsPolicy onBack={() => setView("home")} />
      )}

      {view === "privacy-policy" && (
        <PrivacyPolicy onBack={() => setView("home")} />
      )}

      {view === "terms-policy" && (
        <TermsPolicy onBack={() => setView("home")} />
      )}

      {/* ───────────── HOME / FEED ───────────── */}
      {view === "home" && (
        <div className="relative h-dvh w-full overflow-hidden bg-zinc-950">
          {/* Floating top bar (search + feed tabs) */}
          <div className="absolute inset-x-0 top-3 z-30 h-10">
            <motion.button
              type="button"
              aria-label="Search"
              onClick={() => setShowSearch(true)}
              className="absolute left-3 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
            >
              <Search
                className="h-4.5 w-4.5"
                strokeWidth={2.2}
                style={{ stroke: "url(#search-gradient)" }}
              />
            </motion.button>

            <div className="flex h-full items-center justify-center gap-10">
              {(["barbers", "general"] as const).map((tab) => {
                const isActive = activeFeed === tab;
                const label = tab === "barbers" ? "Your Barbers" : "General";

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveFeed(tab)}
                    className="relative pb-1"
                  >
                    <span
                      className={`text-[15px] transition-colors duration-200 ${
                        isActive
                          ? "font-bold text-white"
                          : "font-medium text-white/60"
                      }`}
                    >
                      {label}
                    </span>

                    {isActive && (
                      <motion.span
                        layoutId="feed-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, #fb923c 0%, #ef4444 50%, #ec4899 100%)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient
                  id="search-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Scrollable feed of posts */}
          {loadingFeed && posts.length === 0 ? (
            <div className="flex h-full items-center justify-center text-white/60">
              Loading feed…
            </div>
          ) : feedError ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-red-400">
              {feedError}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex h-full items-center justify-center text-white/60">
              No posts yet.
            </div>
          ) : (
            <>
              <div
                ref={feedScrollRef}
                onScroll={handleFeedScroll}
                className="h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
              >
                {posts.map((post, index) => {
                  const isActiveBarber = activeBarberId === post.barber_id;

                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      shouldLoad={Math.abs(index - activeIndex) <= 1}
                      isBarber={!!isBarber}
                      canFollow={!!user && post.barber_id !== user.id}
                      isFollowing={isActiveBarber ? following : false}
                      followLoading={isActiveBarber ? followLoading : false}
                      onFollowToggle={() => {
                        setViewingBarberId(post.barber_id);
                        void handleFollowToggle();
                      }}
                      onPlusPress={() => {
                        setViewingBarberId(post.barber_id);
                        setViewingBarberName(post.barber_display_name ?? null);
                        setViewingBarberAvatar(post.barber_avatar_url ?? null);
                        setShowBookPopup(true);
                      }}
                      onUserPress={() => handleOpenBarberProfile(post)}
                      onSidebarPress={handleOpenSidebar}
                      
                    />
                  );
                })}
              </div>

              {loadingMore && (
                <div className="pointer-events-none absolute bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white/70">
                  Loading more…
                </div>
              )}
            </>
          )}

          {/* Barber-only floating create-post button */}
          {isBarber && (
            <motion.button
              type="button"
              onClick={() => setShowCreatePost(true)}
              className="absolute bottom-28 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-lg"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              aria-label="Create post"
            >
              <ImagePlus size={22} />
            </motion.button>
          )}

          <AnimatePresence>
            {showBookPopup && (
              <BookPopUp
                barberId={activeBarberId}
                onSelect={(_index, service) => setSelectedService(service)}
                onBook={handleBook}
                onClose={() => setShowBookPopup(false)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showComments && (
              <CommentsPopUp
                comments={comments}
                onClose={() => setShowComments(false)}
                onAddComment={handleAddComment}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                key="search-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex flex-col bg-zinc-950"
              >
                <div className="flex items-center gap-3 border-b border-white/10 p-3">
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="text-white text-2xl leading-none px-1"
                    aria-label="Close search"
                  >
                    ←
                  </button>
                  <input
                    type="text"
                    placeholder="Search barbers…"
                    className="flex-1 bg-transparent text-white placeholder-white/40 outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex-1 min-h-0">
                  <ResultsList />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            key="create-post"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-zinc-950"
          >
            <CreatePost onPost={handleCreatePost} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}