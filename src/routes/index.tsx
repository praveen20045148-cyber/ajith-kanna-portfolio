import { createFileRoute } from "@tanstack/react-router";
import { Portfolio } from "@/components/site/Portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ajith Kanna — Video Editor & Photographer | @ajay.efx" },
      { name: "description", content: "Cinema-style edits with a photographer's eye. Reels, tribute and cinema edits, color grading and photography from Chennai." },
      { property: "og:title", content: "Ajith Kanna — Video Editor & Photographer" },
      { property: "og:description", content: "Cinema-style edits with a photographer's eye. 1.9M top reel views." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});
