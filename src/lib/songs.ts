// lib/songs.ts
export type Song = {
  /** Stable id — this is what gets persisted in `posts.song`. */
  id: string;
  /** Display title, prettified from the filename. */
  title: string;
  /** Optional artist label for the tile. */
  artist: string;
  /** Path under /public. */
  src: string;
};

export const SONGS: readonly Song[] = [
  {
    id: "sikhala-sonke",
    title: "Sikhala Sonke",
    artist: "Sikhala Sonke",
    src: "/u_iu7xltufu1-sikhala-sonke-prodbywizlee-166112.mp3",
  },
  {
    id: "atlas-rnb",
    title: "R&B",
    artist: "Atlas Audio",
    src: "/atlasaudio-rnb-589994.mp3",
  },
  {
    id: "killer-gqom",
    title: "Killer Gqom",
    artist: "DJ Brandon & Lady Vee",
    src: "/brandon008-dj-brandon-amp-lady-vee-killer-gqom-268487.mp3",
  },
  {
    id: "bravo-gqom",
    title: "Gqom",
    artist: "Bravo TDM",
    src: "/bravo-tdm-sa-gqom-178041.mp3",
  },
  {
    id: "bambelela",
    title: "Bambelela",
    artist: "Premium Music Odyssey",
    src: "/premiummusicodyssey-bambelela-amapiano-245451.mp3",
  },
  {
    id: "what-happen-gqom",
    title: "What Happen To Gqom",
    artist: "Unknown",
    src: "/u_yhzt5vkerg-what-happen-to-gqom-155972.mp3",
  },
  {
    id: "moon-shadows",
    title: "Moon Shadows",
    artist: "Kaazoom",
    src: "/kaazoom-moon-shadows-30-sec-edit-celtic-trip-hop-fusion-music-419545.mp3",
  },
  {
    id: "water-afro",
    title: "Water",
    artist: "Kontraa",
    src: "/kontraa-water-afro-pop-music-445661.mp3",
  },
  {
    id: "smooth-rnb",
    title: "Smooth R&B",
    artist: "Tunetank",
    src: "/tunetank-smooth-rnb-background-347901.mp3",
  },
  {
    id: "street-hiphop",
    title: "Street Hip Hop",
    artist: "Soundsurfer",
    src: "/soundsurfer-street-hip-hop-599534.mp3",
  },
  {
    id: "sad-soul",
    title: "Sad Soul Hip Hop",
    artist: "Alexgrohl",
    src: "/alexgrohl-sad-soul-hip-hop-185750(1).mp3",
  },
  {
    id: "hiphop-beat",
    title: "Hip Hop Beat",
    artist: "Pretty John",
    src: "/prettyjohn1-hip-hop-hip-hop-beat-525029.mp3",
  },
  {
    id: "our-father",
    title: "Our Father",
    artist: "Vicious Productions 808",
    src: "/vicious_productions808-our-father-1-326736.mp3",
  },
  {
    id: "alone-in-the-dark",
    title: "Alone In The Dark",
    artist: "White Records",
    src: "/white_records-alone-in-the-dark-cinematic-background-music-for-vlog-video-short-394176.mp3",
  },
];

export const SONG_BY_ID: ReadonlyMap<string, Song> = new Map(
  SONGS.map((s) => [s.id, s]),
);

export function getSong(id: string | null | undefined): Song | null {
  if (!id) return null;
  return SONG_BY_ID.get(id) ?? null;
}