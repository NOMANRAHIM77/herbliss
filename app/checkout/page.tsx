import { redirect } from "next/navigation";
import { storefrontCustomer } from "@/lib/storefront-session";
import { CartView } from "@/components/cart-view";
import { StorePage } from "@/components/store-page";
export const metadata = { title: "Checkout" };
export default async function CheckoutPage() {
  const customer = await storefrontCustomer();
  if (!customer) redirect("/signup?next=/checkout");
  return (
    <StorePage title="Review your order" compact>
      <p className="text-muted-foreground mb-5 text-sm">
        Signed in as{" "}
        <span className="text-foreground font-medium">{customer.email}</span>
      </p>
      <CartView
        customer={{
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
        }}
      />
    </StorePage>
  );
}
