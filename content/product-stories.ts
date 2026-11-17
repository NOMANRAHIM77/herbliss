import type { ProductCategory } from "@/content/products";

type ProductStory = {
  paragraphs: string[];
  highlights: { icon: string; text: string }[];
  closing: string;
};

/** Draft marketing copy for owner review; not verified performance claims. */
export const productStories = {
  "hair-oil": {
    paragraphs: [
      "Husn E Zulf Premium Herbal Hair Oil brings together coconut oil, amla, reetha and shikakai in a nourishing blend for your hair-care routine. Designed for a relaxing pre-wash massage, it helps condition dry-feeling hair and leaves the lengths looking smoother and shinier.",
      "Coconut oil forms the base of this herbal blend, complemented by familiar ingredients from traditional hair care. Massage a small amount into your scalp and through the lengths, then follow with shampoo to complete your wash-day ritual. The 120 ml bottle makes it easy to add an oiling step to your regular routine.",
    ],
    highlights: [
      { icon: "🌿", text: "With amla, reetha and shikakai" },
      { icon: "🥥", text: "Nourishing coconut-oil base" },
      { icon: "💆", text: "A relaxing pre-wash scalp massage ritual" },
      { icon: "✨", text: "Helps hair feel softer and look smoother" },
      { icon: "🧴", text: "120 ml bottle for your hair-care routine" },
      { icon: "🚚", text: "Delivery across Pakistan" },
    ],
    closing:
      "Give your wash-day routine a nourishing first step with Husn E Zulf Premium Herbal Hair Oil. Pair it with Husn E Zulf Herbal Shampoo for a simple oil-and-cleanse ritual.",
  },
  shampoo: {
    paragraphs: [
      "Husn E Zulf Premium Herbal Shampoo is a cleansing companion for hair that needs a fresh start. Made with amla, reetha, shikakai, hibiscus, rosemary, flaxseed and fenugreek seeds, it brings a blend of herbal ingredients to your regular wash-day routine.",
      "The shampoo helps wash away everyday dirt, excess oil and product buildup from the scalp and hair. Work it through wet hair, massage the scalp and rinse thoroughly for a clean, refreshed feel. Use it after your hair-oil treatment or as the cleansing step in your usual routine.",
    ],
    highlights: [
      { icon: "🌿", text: "With amla, reetha and shikakai" },
      { icon: "🌺", text: "Includes hibiscus and rosemary" },
      { icon: "🌱", text: "With flaxseed and fenugreek seeds" },
      { icon: "🫧", text: "Cleanses everyday dirt, excess oil and buildup" },
      { icon: "💧", text: "Leaves the scalp and hair feeling refreshed" },
      { icon: "🧴", text: "250 ml bottle for regular hair washing" },
      { icon: "🚚", text: "Delivery across Pakistan" },
    ],
    closing:
      "Refresh your hair-care routine with Husn E Zulf Premium Herbal Shampoo and enjoy the simple comfort of freshly washed hair. Complete the routine with our herbal hair oil before washing.",
  },
  "body-lotion": {
    paragraphs: [
      "Husn-e-Resham Moisturising Lotion is an everyday body-care essential designed to help dry-feeling skin feel softer and smoother. Its blend of glycerin, petroleum jelly and wax adds a moisturising step to your routine, whether you are caring for your hands, arms or body.",
      "Glycerin helps attract moisture, while petroleum jelly helps hold moisture at the skin's surface. Together, these ingredients support a comfortably moisturised feel. Massage a small amount onto clean body skin, paying particular attention to areas that feel dry, and follow the directions on the product label.",
    ],
    highlights: [
      { icon: "💧", text: "Glycerin-based moisturising care" },
      { icon: "🤲", text: "Helps dry-feeling skin feel soft and smooth" },
      { icon: "🛡️", text: "With petroleum jelly to help retain moisture" },
      { icon: "✨", text: "A simple addition to your body-care routine" },
      { icon: "🧴", text: "150 ml bottle for hands and body" },
      { icon: "🚚", text: "Delivery across Pakistan" },
    ],
    closing:
      "Make everyday moisturising a moment of care with Husn-e-Resham Moisturising Lotion. Keep it close for a softer, smoother skin feel whenever your routine calls for a little extra moisture.",
  },
  bundles: {
    paragraphs: [
      "Husn E Zulf Oil & Shampoo Duo brings together our Premium Herbal Hair Oil and Premium Herbal Shampoo in one convenient hair-care set. Designed around two simple steps—oil, then cleanse—it pairs a nourishing pre-wash treatment with a refreshing wash for softer-feeling, smoother-looking hair.",
      "The 120 ml hair oil combines amla, reetha and shikakai in a coconut-oil base for your scalp and hair massage. The 250 ml shampoo features amla, reetha, shikakai, hibiscus, rosemary, flaxseed and fenugreek seeds to help cleanse everyday dirt, excess oil and buildup. Use each product according to its directions to create a routine that fits your wash days.",
    ],
    highlights: [
      { icon: "🌿", text: "Herbal ingredients across both hair-care essentials" },
      { icon: "🥥", text: "120 ml coconut-based herbal hair oil" },
      { icon: "🫧", text: "250 ml herbal cleansing shampoo" },
      { icon: "💆", text: "A simple oil-and-cleanse routine" },
      { icon: "✨", text: "Care for softer-feeling, smoother-looking hair" },
      { icon: "📦", text: "Two complementary products in one set" },
      { icon: "🚚", text: "Free delivery across Pakistan for your entire order" },
    ],
    closing:
      "Bring your wash-day essentials together with the Husn E Zulf Oil & Shampoo Duo. Enjoy a complete two-step ritual, with free delivery even when you add other products to your order.",
  },
} satisfies Record<ProductCategory, ProductStory>;
