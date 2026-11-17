import { CartView } from "@/components/cart-view";
import { StorePage } from "@/components/store-page";
export const metadata = { title: "Your cart" };
export default function CartPage() {
  return (
    <StorePage title="Your cart">
      <CartView />
    </StorePage>
  );
}
