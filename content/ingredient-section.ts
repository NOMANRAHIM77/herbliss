import { site } from "@/content/site";

export const ingredientSection = {
  eyebrow: "Rooted in familiar ingredients",
  title: `Why choose ${site.name}?`,
  introduction:
    "From amla and shikakai to coconut oil and hibiscus, our hair-care collection brings familiar botanical ingredients into a simple everyday ritual.",
  reasons: [
    {
      title: "Herbs at the heart of hair care",
      text: "Explore the amla, reetha and shikakai shared by our hair oil and shampoo.",
    },
    {
      title: "An oil-and-cleanse ritual",
      text: "Begin with a coconut-based hair oil, then follow with our herbal shampoo on wash day.",
    },
    {
      title: "Get to know your care",
      text: "Find key ingredients and directions on each product page, so you can choose your next essential.",
    },
  ],
  action: "Discover the hair-care duo",
  actionHref: "/products/husn-e-zulf-oil-shampoo-duo",
  ingredientsEyebrow: "Inside the collection",
  ingredientsTitle: "Leaves, flowers, seeds. A little care from nature.",
  cards: [
    {
      icon: "leaf",
      tone: "cream",
      category: "The herbal foundation",
      title: "Amla, reetha & shikakai",
      description:
        "Indian gooseberry, soapnut and soap pod: three familiar herbal ingredients that connect our oil and shampoo.",
      linkLabel: "Meet the hair oil",
      href: "/products/husn-e-zulf-herbal-hair-oil",
    },
    {
      icon: "droplet",
      tone: "mint",
      category: "The oil base",
      title: "Coconut oil",
      description:
        "The base of our herbal hair oil, ready for a slow scalp massage and a little attention to your hair lengths before washing.",
      linkLabel: "Explore the blend",
      href: "/products/husn-e-zulf-herbal-hair-oil",
    },
    {
      icon: "flower",
      tone: "rose",
      category: "Flowers & leaves",
      title: "Hibiscus & rosemary",
      description:
        "A floral and leafy pairing in our shampoo, alongside amla, reetha and shikakai for your cleansing routine.",
      linkLabel: "Discover the shampoo",
      href: "/products/husn-e-zulf-herbal-shampoo",
    },
    {
      icon: "sprout",
      tone: "sage",
      category: "Small seeds, familiar names",
      title: "Flaxseed & fenugreek",
      description:
        "Known as alsi and methi dana, these seeds complete the list of botanical ingredients supplied for our herbal shampoo.",
      linkLabel: "See the ingredients",
      href: "/products/husn-e-zulf-herbal-shampoo",
    },
  ],
} as const;
