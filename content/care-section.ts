import { products } from "@/content/products";
import { site } from "@/content/site";
import { formatPrice } from "@/lib/utils";

const duo = products.find((product) => product.category === "bundles");

export const careSection = {
  highlightsLabel: "The collection at a glance",
  highlights: [
    { value: "03", label: "Care essentials", detail: "Oil, shampoo & body lotion" },
    { value: "02", label: "Steps for your hair", detail: "Oil, then cleanse" },
    {
      value: formatPrice(site.shipping.feePaisa),
      label: "Nationwide delivery",
      detail: "Across Pakistan",
    },
    { value: "Free", label: "Delivery with the duo", detail: "For your whole order" },
  ],
  eyebrow: "Your next care ritual",
  title: "A little care.",
  titleAccent: "A routine of your own.",
  description:
    "Make room for a simple ritual with Husn E Zulf hair oil and shampoo, and Husn-e-Resham body lotion. Find your favourites, one essential at a time.",
  primaryAction: "Explore hair care",
  secondaryAction: "View all products",
  duoLabel: "Better together",
  duoDescription: `Oil + shampoo duo · ${formatPrice(duo?.pricePaisa ?? 200000)} · Free delivery`,
  cards: [
    {
      icon: "leaf",
      title: "Familiar herbal ingredients",
      description: "Amla, reetha and shikakai in our hair-care collection.",
      href: "#hair-oil",
    },
    {
      icon: "droplet",
      title: "Care beyond your hair",
      description: "Discover our glycerin-based moisturising body lotion.",
      href: "#body-lotion",
    },
    {
      icon: "package",
      title: "Your two-step duo",
      description: "120 ml hair oil and 250 ml shampoo, paired together.",
      href: "#bundles",
    },
    {
      icon: "truck",
      title: "From our collection to you",
      description: "Delivery across Pakistan. Add the duo for free delivery.",
      href: "#bundles",
    },
  ],
} as const;
