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
    estimatedWorkingDays: 5,
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
    instagram:
      "https://www.instagram.com/husn_ezulf?utm_source=qr&vrfl=MXV4OHo3MXJ3aGVmZw%3D%3D",
  },
  navigation: [
    { label: "Home", href: "#home" },
    { label: "Hair oil", href: "/products/husn-e-zulf-herbal-hair-oil" },
    { label: "Shampoo", href: "/products/husn-e-zulf-herbal-shampoo" },
    { label: "Body lotion", href: "/products/husn-e-resham-moisturising-lotion" },
    { label: "The duo", href: "#bundles" },
    { label: "FAQs", href: "#faq" },
    { label: "Why choose us", href: "#why-choose-us" },
    { label: "Ingredients", href: "#ingredient-library" },
  ],
} as const;

export const socialPlatforms = [
  { id: "instagram", label: "Instagram" },
] as const;

export const footerContent = {
  tagline: "A little care. Every day.",
  quickLinksTitle: "Quick links",
  quickLinks: [
    { label: "Home", href: "#home" },
    { label: "Shop the collection", href: "#collection" },
    { label: "Frequently asked questions", href: "#faq" },
    { label: "Oil + shampoo duo", href: "#bundles" },
    { label: "Contact us", href: "#contact" },
  ],
  careTitle: "Customer care",
  carePending: [
    "Track your order",
    "Shipping policy",
    "Return policy",
    "Privacy policy",
    "Terms of service",
  ],
  pendingLabel: "Coming soon",
  contactTitle: "Contact us",
  delivery: "Delivery across Pakistan",
  deliveryDetails: "Rs. 250 · Free with the duo",
  newsletterTitle: "Newsletter",
  newsletterDescription:
    "A little Herbliss in your inbox. Offers, care tips and new arrivals.",
  newsletterPending: "Newsletter signup is coming soon.",
  emailLabel: "Email address",
  emailPlaceholder: "Enter your email",
  subscribeLabel: "Subscribe",
  rights: "All rights reserved.",
  privacy: "Privacy",
  terms: "Terms",
};

/** Phase 0 preview copy. The full storefront is built in subsequent phases. */
export const homeContent = {
  announcement: "Delivery across Pakistan · Rs. 250",
  announcementOffer: "Free delivery with the oil + shampoo duo",
  socialLabel: "Social media",
  socialPending: "Link coming soon",
  previewLabel: "Order with cash on delivery or manual Easypaisa and confirm on WhatsApp.",
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
