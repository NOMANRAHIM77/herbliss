import { site } from "@/content/site";

export const productDetails = {
  viewDetails: "View details",
  home: "Home",
  collection: "Collection",
  size: "Size",
  quantity: "Quantity",
  decrease: "Decrease quantity",
  increase: "Increase quantity",
  addToCart: "Add to cart",
  viewCart: "View cart",
  added: "Added to your cart.",
  unavailable:
    "Available quantity is already in your cart, including any duo items.",
  quantityChanged:
    "That quantity is no longer available. Please choose a smaller quantity.",
  total: "Selected total",
  ingredients: "Key ingredients",
  ingredientsNote: "These are key ingredients, not a complete formulation.",
  usage: "How to use",
  description: "About this product",
  delivery: "Delivery across Pakistan",
  deliveryEstimate: `Estimated within ${site.shipping.estimatedWorkingDays} working days of placing your order.`,
  deliverySteps: ["Order created", "Dispatched", "Delivered"],
  freeDelivery: "Free delivery for your entire order with this duo.",
  pack: "1 bottle",
  duoPack: "Oil + shampoo set",
  collectionImage: "The complete collection",
  mainImage: "Product artwork",
  gallery: "Product images",
} as const;
