import { products } from "@/content/products";
import { site } from "@/content/site";
import { formatPrice } from "@/lib/utils";

const oil = products.find(product => product.category === "hair-oil")!;
const shampoo = products.find(product => product.category === "shampoo")!;
const lotion = products.find(product => product.category === "body-lotion")!;
const duo = products.find(product => product.category === "bundles")!;

export const faqContent = {
  eyebrow: "A little clarity, before you choose",
  title: "Good questions. Simple answers.",
  introduction: "From your first oiling routine to delivery at your door, here are the details people usually want to know.",
  contactTitle: "Still wondering about something?",
  contactDescription: "Ask us about the collection, ingredients or delivery to your area.",
  contactAction: "Ask us on WhatsApp",
  ingredientLink: "Explore the ingredients",
  groups: [
    {
      id: "products",
      title: "Your hair & skin routine",
      questions: [
        {
          question: "Which product should I start with?",
          answer: `Choose the ${oil.size} hair oil for a pre-wash oiling step, the ${shampoo.size} herbal shampoo for cleansing, or the ${lotion.size} body lotion for moisturising. The duo pairs oil and shampoo if you want both hair-care steps together.`,
          link: { label: "Find your care essential", href: "/#collection" },
        },
        {
          question: "How do I use the hair oil and shampoo together?",
          answer: "Apply a small amount of oil to your scalp and hair lengths, and massage gently. Follow with shampoo on wet hair, working it through the scalp and lengths before rinsing thoroughly. Follow the product-label directions for application amounts and timing.",
          link: { label: "Explore the oil + shampoo duo", href: "/products/" + duo.slug },
        },
        {
          question: "What ingredients are in the hair-care products?",
          answer: "The hair oil contains amla, reetha, shikakai and coconut oil. The shampoo contains amla, reetha, shikakai, hibiscus, rosemary, flaxseed (alsi) and fenugreek seeds (methi dana). These are our supplied key ingredients; they are not complete formulation lists.",
          link: { label: "Meet each ingredient", href: "/#ingredient-library" },
        },
        {
          question: "How do I use the moisturising lotion?",
          answer: "Apply a small amount to clean body skin and massage gently until absorbed. Husn-e-Resham is a body lotion with glycerin, petroleum jelly and wax. See its product page for the supplied ingredients and follow any additional directions on the label.",
          link: { label: "View the body lotion", href: "/products/" + lotion.slug },
        },
        {
          question: "What comes in the duo, and is delivery free?",
          answer: `The duo includes one ${oil.size} hair oil and one ${shampoo.size} shampoo for ${formatPrice(duo.pricePaisa)}. Delivery is free across Pakistan for the entire order when the duo is included—even if you add lotion or other products.`,
          link: { label: "See the duo", href: "/products/" + duo.slug },
        },
      ],
    },
    {
      id: "orders",
      title: "Orders & delivery",
      questions: [
        {
          question: "Do you deliver across Pakistan, and how much does it cost?",
          answer: `Yes, delivery is available across Pakistan at ${formatPrice(site.shipping.feePaisa)} per order. Orders containing the oil + shampoo duo get free delivery. Delivery is estimated within ${site.shipping.estimatedWorkingDays} working days of placing your order.`,
        },
        {
          question: "Can I place an order on the website now?",
          answer: "Yes. Add items to your cart, sign in at checkout and submit your delivery and payment details. Open WhatsApp from the confirmation screen and send us your prepared order message so we can confirm it.",
        },
        {
          question: "Do I need an account, and will my cart be saved?",
          answer: "You can browse and add products to your cart without an account. Checkout asks you to sign up or log in, then brings you back with your cart intact. The cart is saved in the same browser when local storage is available.",
        },
        {
          question: "How can I pay for my order?",
          answer: "Choose cash on delivery to pay when your order arrives. To pay by Easypaisa, transfer the checkout total to the wallet shown on the website and upload your payment screenshot. We confirm the transfer manually.",
        },
        {
          question: "Where can I find the return and refund policy?",
          answer: "Our return and refund terms are still being finalised. Please ask us on WhatsApp about exchanges or returns before submitting your order.",
        },
      ],
    },
  ],
};
