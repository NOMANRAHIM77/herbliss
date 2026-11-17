import { redirect } from "next/navigation";
import { storefrontCustomer } from "@/lib/storefront-session";
import { AuthForm } from "@/components/auth-form";
import { StorePage } from "@/components/store-page";
export const metadata = { title: "Log in" };
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next === "/checkout" ? "/checkout" : "/profile";
  if (await storefrontCustomer()) redirect(next);
  return (
    <StorePage title="Welcome back">
      <AuthForm mode="login" next={next} />
    </StorePage>
  );
}
