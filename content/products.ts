export type ProductCategory =
  "hair-oil" | "shampoo" | "body-lotion" | "bundles";

/** Static preview data only. Inventory and checkout require database records. */
export type PreviewProduct = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: ProductCategory;
  size: string;
  /** Integer Pakistani paisa: 100 paisa = Rs. 1. */
  pricePaisa: number;
  /** Owner-supplied preview snapshot, never a live checkout stock source. */
  stock: number | null;
  /** Starting inventory for individual products; bundles share component stock. */
  initialStock: number | null;
  image: string;
  ingredients: string[];
  description: string;
  usage: string;
  shippingIncluded: boolean;
  contentStatus: "draft";
  bundleComponents?: { productId: string; quantity: number }[];
};

export const products: PreviewProduct[] = [
  {
    id: "preview-hair-oil",
    slug: "husn-e-zulf-herbal-hair-oil",
    name: "Husn E Zulf Premium Herbal Hair Oil",
    shortName: "Herbal Hair Oil",
    category: "hair-oil",
    size: "120 ml",
    pricePaisa: 74900,
    stock: 30,
    initialStock: 30,
    image: "/images/hair-oil.jpg",
    ingredients: [
      "Amla (Indian gooseberry)",
      "Reetha (soapnut)",
      "Shikakai (soap pod)",
      "Coconut oil",
    ],
    description:
      "A coconut-oil hair blend with amla, reetha, and shikakai for your hair-care routine.",
    usage:
      "Apply a small amount to the scalp and hair lengths. Massage gently, then wash out with shampoo. Follow any additional directions on the product label.",
    shippingIncluded: false,
    contentStatus: "draft",
  },
  {
    id: "preview-shampoo",
    slug: "husn-e-zulf-herbal-shampoo",
    name: "Husn E Zulf Premium Herbal Shampoo",
    shortName: "Herbal Shampoo",
    category: "shampoo",
    size: "250 ml",
    pricePaisa: 124900,
    stock: 30,
    initialStock: 30,
    image: "/images/shampoo.jpg",
    ingredients: [
      "Amla (Indian gooseberry)",
      "Reetha (soapnut)",
      "Shikakai (soap pod)",
      "Hibiscus",
      "Rosemary",
      "Flaxseed (alsi)",
      "Fenugreek seeds (methi dana)",
    ],
    description:
      "A herbal shampoo with amla, reetha, shikakai, hibiscus, rosemary, flaxseed, and fenugreek seeds for cleansing the scalp and hair.",
    usage:
      "Wet hair thoroughly. Apply a small amount, massage gently into the scalp, and work through the lengths. Rinse well.",
    shippingIncluded: false,
    contentStatus: "draft",
  },
  {
    id: "preview-body-lotion",
    slug: "husn-e-resham-moisturising-lotion",
    name: "Husn-e-Resham Moisturising Lotion",
    shortName: "Moisturising Lotion",
    category: "body-lotion",
    size: "150 ml",
    pricePaisa: 34000,
    stock: 30,
    initialStock: 30,
    image: "/images/lotion.jpg",
    ingredients: [
      "Glycerin (glycerine)",
      "Petroleum jelly (petrolatum)",
      "Wax (type not supplied)",
    ],
    description:
      "A body lotion with glycerin and petroleum jelly for everyday moisturising.",
    usage:
      "Apply a small amount to clean body skin and massage gently until absorbed.",
    shippingIncluded: false,
    contentStatus: "draft",
  },
  {
    id: "preview-duo",
    slug: "husn-e-zulf-oil-shampoo-duo",
    name: "Husn E Zulf Oil & Shampoo Duo",
    shortName: "Oil & Shampoo Duo",
    category: "bundles",
    size: "120 ml oil + 250 ml shampoo",
    pricePaisa: 200000,
    stock: null,
    initialStock: null,
    image: "/images/duo.jpg",
    ingredients: [
      "Hair oil: amla (Indian gooseberry), reetha (soapnut), shikakai (soap pod), coconut oil",
      "Shampoo: amla (Indian gooseberry), reetha (soapnut), shikakai (soap pod), hibiscus, rosemary, flaxseed (alsi), fenugreek seeds (methi dana)",
    ],
    description:
      "One 120 ml Husn E Zulf hair oil and one 250 ml Husn E Zulf shampoo, together with free delivery.",
    usage:
      "Use the hair oil and shampoo according to their individual directions.",
    shippingIncluded: true,
    contentStatus: "draft",
    bundleComponents: [
      { productId: "preview-hair-oil", quantity: 1 },
      { productId: "preview-shampoo", quantity: 1 },
    ],
  },
];
