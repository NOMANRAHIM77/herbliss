/** Public, editable store settings. NEVER place secrets in this file. */
export const site = {
  name: "The Herbliss",
  locale: "en-PK",
  currency: "PKR",
  logoRotation: 46,
  shipping: {
    country: "Pakistan",
    nationwide: true,
    feePaisa: 25000,
    freeShippingThresholdPaisa: null,
    freeShippingWithBundle: true,
    bundleFreeShippingScope: "entire-order",
  },
  payments: {
    methods: ["cod", "easypaisa-manual"],
    easypaisa: {
      number: "03352640676",
      accountTitle: null,
      requiresManualVerification: true,
    },
  },
  contact: {
    whatsapp: "923213857324",
    whatsappDisplay: "0321 3857324",
    email: null,
  },
  social: {
    instagram: null,
    facebook: null,
    tiktok: null,
    youtube: null,
    snapchat: null,
  },
  navigation: [
    { label: "Home", href: "#home" },
    { label: "Hair oil", href: "#hair-oil" },
    { label: "Shampoo", href: "#shampoo" },
    { label: "Body lotion", href: "#body-lotion" },
    { label: "The duo", href: "#bundles" },
  ],
} as const;

export const socialPlatforms = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "snapchat", label: "Snapchat" },
] as const;

/** Phase 0 preview copy. The full storefront is built in subsequent phases. */
export const homeContent = {
  announcement: "Delivery across Pakistan · Rs. 250",
  announcementOffer: "Free delivery with the oil + shampoo duo",
  socialLabel: "Social media",
  socialPending: "Link coming soon",
  previewLabel: "Storefront preview · Online ordering is not open yet",
  eyebrow: "Hair & skin care",
  title: "Complete hair\n& skin care.",
  description:
    "Discover Husn E Zulf hair oil and shampoo, and Husn-e-Resham moisturising lotion.",
  primaryAction: "Explore the collection",
  secondaryAction: "Discover the duo",
  collectionEyebrow: "The collection",
  collectionTitle: "Hair oil, shampoo & body lotion.",
  collectionDescription: "Three care essentials. One oil-and-shampoo duo.",
  imageAlt:
    "The Herbliss: Complete hair and skin care, The Natural Way. Landscape banner showing 120 ml hair oil, 250 ml shampoo and 150 ml moisturising lotion.",
  keyIngredients: "Key ingredients",
  bundleBadge: "Free delivery",
  draftNote:
    "Product descriptions and directions are drafts pending final label review.",
  footerText: "Hair oil, shampoo & body lotion. Delivered across Pakistan.",
  whatsappLabel: "Chat on WhatsApp",
  whatsappMessage: "Hello, I would like to know more about your products.",
  skipLink: "Skip to main content",
  backToCollection: "Back to the collection",
  notFoundTitle: "This page isn’t here yet.",
  notFoundDescription:
    "Explore the collection while we prepare the rest of the store.",
  errorTitle: "Something went wrong.",
  errorDescription: "Please try again in a moment.",
  retryLabel: "Try again",
  loadingLabel: "Loading the collection",
};
