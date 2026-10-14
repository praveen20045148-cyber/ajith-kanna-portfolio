/**
 * ALL EDITABLE CONTENT LIVES HERE.
 * Videos live in /public/videos, video posters in /public/posters.
 */
import heroBg from "@/assets/hero-bg.jpg";
import aboutProfile from "@/assets/about-profile.jpg";
import thumb1 from "@/assets/thumb-1.jpg";
import thumb2 from "@/assets/thumb-2.jpg";
import thumb3 from "@/assets/thumb-3.jpg";
import thumb4 from "@/assets/thumb-4.jpg";
import thumb5 from "@/assets/thumb-5.jpg";
import thumb6 from "@/assets/thumb-6.jpg";

export const profile = {
  name: ["AJITH", "KANNA"],
  handle: "@ajay.efx",
  headline: "Video Editor · Content Creator",
  tagline: "Cinema-style edits with a photographer's eye.",
  location: "Chennai, Tamil Nadu",
  email: "ajayefx2021@gmail.com",
  phone: "9677194464",
  instagram: "https://instagram.com/ajay.efx",
  linktree: "https://linktr.ee/ajayefx2021",
  resume: "#", // TODO: put resume.pdf in /public and set "/resume.pdf"
  heroImage: heroBg,
  portrait: aboutProfile,
};

export type Reel = { title: string; views: string; poster: string; url: string; video: string; tag: string };

/** Works section — video files are in /public/videos */
export const reels: Reel[] = [
  { title: "F1-THE MOVIE", views: "1.4M", poster: "/posters/f1-the-movie.jpg", video: "/videos/f1-the-movie.mp4", url: "https://www.instagram.com/reels/DLc-_-eNPPy/", tag: "BEAT SYNC" },
  { title: "SUPER STAR RAJINIKANTH", views: "2.5M+", poster: "/posters/super-star.jpg", video: "/videos/super-star.mp4", url: "https://www.instagram.com/reels/DGFr2uVCDRZ/", tag: "Tribute" },
  { title: "THE-CINEMA", views: "1.3M", poster: "/posters/the-cinema.jpg", video: "/videos/the-cinema.mp4", url: "https://www.instagram.com/reels/DIDfLjdxpsy/", tag: "Cinema edit" },
  { title: "VIJAY-CARRER", views: "45.1K", poster: "/posters/vijay-career.jpg", video: "/videos/vijay-career.mp4", url: "https://www.instagram.com/reels/C9Zt5zpSjm8/", tag: "Fan edit" },
  // KARA_VIDEO.mp4 uploaded empty (0 bytes). Put the video at public/videos/kara-movie.mp4 and it will play.
  { title: "KARA-MOVIE", views: "—", poster: "/posters/kara-movie.jpg", video: "/videos/KARA VIDEO.mp4", url: "https://www.instagram.com/reels/DZXbGd_hcNs/", tag: "SFX" },
  { title: "KAMAL-HASSAN", views: "—", poster: "/posters/kamal-hassan.jpg", video: "/videos/kamal-hassan.mp4", url: "https://www.instagram.com/p/Ce_LCLnrMVl/?obrf=azltaHF6aTBnYThn", tag: "EFX" },
];

/** Thumbnail section — wide: true = landscape (16:9), false = portrait (4:5). Each ratio gets its own aligned row. */
export const thumbnails = [
  { src: thumb1, wide: true, alt: "Thumbnail 01 — God Mode" },
  { src: thumb2, wide: true, alt: "Thumbnail 02 — @ajay.efx" },
  { src: thumb3, wide: true, alt: "Thumbnail 03 — The Goat" },
  { src: thumb4, wide: false, alt: "Thumbnail 04 — Bheeshma" },
  { src: thumb5, wide: false, alt: "Thumbnail 05 — DC" },
  { src: thumb6, wide: false, alt: "Thumbnail 06 — Weeknd" },
];

export type RandomReel = { video: string; poster: string; alt: string; tall: boolean };

/** Contents section — random reels. Random_reel-3.mp4 uploaded empty (0 bytes): compress it, save as
 *  public/videos/random-3.mp4 + public/posters/random-3.jpg, then add a line here. */
export const randomReels: RandomReel[] = [
  { video: "/videos/random-1.mp4", poster: "/posters/random-1.jpg", alt: "Random reel 1", tall: true },
  { video: "/videos/random-2.mp4", poster: "/posters/random-2.jpg", alt: "Random reel 2", tall: false },
  { video: "/videos/random-4.mp4", poster: "/posters/random-4.jpg", alt: "Random reel 4", tall: false },
  { video: "/videos/random-5.mp4", poster: "/posters/random-5.jpg", alt: "Random reel 5", tall: true },
  { video: "/videos/random-6.mp4", poster: "/posters/random-6.jpg", alt: "Random reel 6", tall: true },
];

export const tools = ["CapCut", "Alight Motion", "InShot", "VN", "KineMaster", "Lightroom", "Picsart", "Snapseed"];
export const skills = ["Short-form editing", "Beat sync", "Transitions & FX", "Color correction", "Visual storytelling", "Photography"];
export const achievements = [
  "2nd Prize — Best Video Editor",
  "2nd Prize — Photography Competition",
  "District-level Volleyball Player",
];
export const stats = [
  { value: 15.6, suffix: "K", label: "Followers", decimals: 1 },
  { value: 378, suffix: "", label: "Posts", decimals: 0 },
  { value: 2.5, suffix: "M+", label: "Top reel views", decimals: 1 },
];
export const process = [
  { step: "Concept", tc: "00:00:04" },
  { step: "Shot Selection", tc: "00:00:09" },
  { step: "Edit", tc: "00:00:15" },
  { step: "Color & Sound", tc: "00:00:22" },
  { step: "Delivery", tc: "00:00:28" },
];
