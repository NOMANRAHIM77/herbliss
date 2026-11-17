export type IngredientProduct = "oil" | "shampoo" | "lotion";
export type IngredientEntry = {
  id: string;
  name: string;
  alternateName: string;
  family: string;
  benefit: string;
  description: string;
  products: IngredientProduct[];
  tone: "green" | "cream" | "rose" | "blue";
  alt: string;
  note?: string;
};

export const ingredientProducts = {
  oil: { label: "Hair oil", href: "/products/husn-e-zulf-herbal-hair-oil" },
  shampoo: { label: "Shampoo", href: "/products/husn-e-zulf-herbal-shampoo" },
  lotion: {
    label: "Body lotion",
    href: "/products/husn-e-resham-moisturising-lotion",
  },
} as const;

export const ingredientLibrary = {
  eyebrow: "Small ingredients. Everyday care.",
  title: "The ingredients behind your care",
  description:
    "Get to know the herbs, flowers, seeds and moisturising essentials in our collection—and the part each one plays.",
  motionHelp:
    "Ingredient cards move automatically. Drag, swipe, or use the arrow keys to browse. Focus a card with the keyboard to pause while reading.",
  foundIn: "Find it in",
  close: "Close ingredient image",
  enlarge: "Enlarge image of",
  imageNote:
    "AI-generated ingredient illustrations. These are the key ingredients supplied for our collection, not complete formulation lists.",
  roleNote:
    "Benefits describe general ingredient roles; the effect of a finished product depends on its formulation. Wax type is awaiting confirmation.",
};

export const ingredients: IngredientEntry[] = [
  {
    id: "amla",
    name: "Amla",
    alternateName: "Indian gooseberry",
    family: "Fruit",
    benefit: "Conditioning care",
    description:
      "A familiar fruit in traditional hair care. Amla preparations are used for conditioning, helping hair feel softer and more manageable.",
    products: ["oil", "shampoo"],
    tone: "green",
    alt: "Illustration of fresh green amla fruits and a cut half on an ivory dish.",
  },
  {
    id: "coconut-oil",
    name: "Coconut oil",
    alternateName: "Cocos nucifera oil",
    family: "Plant oil",
    benefit: "Softness & lubrication",
    description:
      "A rich oil that helps lubricate hair and reduce friction during grooming. It forms the base of our pre-wash herbal hair oil.",
    products: ["oil"],
    tone: "cream",
    alt: "Illustration of coconut halves with white flesh beside a clear bowl of coconut oil.",
  },
  {
    id: "hibiscus",
    name: "Hibiscus",
    alternateName: "The hair-care flower",
    family: "Flower",
    benefit: "A conditioned feel",
    description:
      "Traditionally used in hair preparations for a soft, conditioned feel. This bright flower is one of the botanicals in our herbal shampoo.",
    products: ["shampoo"],
    tone: "rose",
    alt: "Illustration of red hibiscus flowers with prominent stamens and green leaves.",
  },
  {
    id: "glycerin",
    name: "Glycerin",
    alternateName: "Also called glycerine",
    family: "Moisturising essential",
    benefit: "Attracts moisture",
    description:
      "A humectant that attracts and holds water. In moisturising formulas, it helps skin retain hydration and feel softer.",
    products: ["lotion"],
    tone: "blue",
    alt: "Illustration of clear glycerin in a glass vessel with a glossy droplet from a glass dropper.",
  },
  {
    id: "reetha",
    name: "Reetha",
    alternateName: "Soapnut · Rita",
    family: "Fruit shell",
    benefit: "Plant-based cleansing",
    description:
      "Soapnut shells contain saponins, natural compounds with cleansing properties. Reetha has long been used in herbal hair-washing preparations.",
    products: ["oil", "shampoo"],
    tone: "cream",
    alt: "Illustration of amber-brown dried reetha shells, including broken shells showing their hollow interiors.",
  },
  {
    id: "shikakai",
    name: "Shikakai",
    alternateName: "Soap pod",
    family: "Pod",
    benefit: "Cleansing support",
    description:
      "These distinctive pods contain saponins and are traditionally used to wash hair. Shikakai is part of the herbal blend in both our oil and shampoo.",
    products: ["oil", "shampoo"],
    tone: "green",
    alt: "Illustration of dark brown curved, segmented shikakai pods on an ivory dish.",
  },
  {
    id: "rosemary",
    name: "Rosemary",
    alternateName: "An aromatic leafy herb",
    family: "Leaf",
    benefit: "A fresh herbal character",
    description:
      "Rosemary is used in cosmetics for its aromatic character and conditioning role. Its familiar herbal notes bring a refreshing quality to hair care.",
    products: ["shampoo"],
    tone: "green",
    alt: "Illustration of fresh rosemary sprigs with narrow green leaves and a small pale blue flower.",
  },
  {
    id: "flaxseed",
    name: "Flaxseed",
    alternateName: "Alsi · Linseed",
    family: "Seed",
    benefit: "Slip & a smooth feel",
    description:
      "Flaxseeds contain mucilage, a water-loving plant material that forms a slippery gel. This texture is valued in conditioning preparations for a smooth feel.",
    products: ["shampoo"],
    tone: "cream",
    alt: "Illustration of small glossy brown flaxseeds in a shallow dish beside a wooden scoop.",
  },
  {
    id: "fenugreek",
    name: "Fenugreek",
    alternateName: "Methi dana",
    family: "Seed",
    benefit: "Traditional conditioning",
    description:
      "These golden seeds contain mucilage and are traditionally used in conditioning hair preparations. They add another familiar botanical to our shampoo blend.",
    products: ["shampoo"],
    tone: "cream",
    alt: "Illustration of golden angular fenugreek seeds with visible grooves in a ceramic dish.",
  },
  {
    id: "petroleum-jelly",
    name: "Petroleum jelly",
    alternateName: "Petrolatum",
    family: "Moisture-sealing essential",
    benefit: "Helps hold moisture in",
    description:
      "An occlusive ingredient that helps reduce moisture loss from the skin. It complements glycerin in moisturising care for dry-feeling skin.",
    products: ["lotion"],
    tone: "blue",
    alt: "Illustration of translucent pale petroleum jelly in an unlabelled glass jar with a cosmetic spatula.",
  },
  {
    id: "wax",
    name: "Wax",
    alternateName: "Texture-building ingredient",
    family: "Formula texture",
    benefit: "Body & consistency",
    description:
      "Waxes can give cosmetic formulas body and help shape how they spread. Their specific role depends on the wax selected.",
    products: ["lotion"],
    tone: "rose",
    alt: "Representative illustration of plain off-white cosmetic wax flakes in a dish; exact wax type unspecified.",
    note: "Representative image. The exact wax type in our lotion is awaiting confirmation.",
  },
];
