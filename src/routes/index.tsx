import { createFileRoute } from "@tanstack/react-router";
import { Marketplace } from "@/components/nestora/Marketplace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nestora — Find the home that feels like you" },
      { name: "description", content: "Explore thoughtfully chosen homes in Harborlight. Find your neighborhood, save the places you love, and meet a local Nestora guide." },
      { property: "og:title", content: "Nestora — Find the home that feels like you" },
      { property: "og:description", content: "Thoughtfully chosen homes, kind local guidance, and a more considered way to find home in Harborlight." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Marketplace />;
}
