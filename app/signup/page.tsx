import { redirect } from "next/navigation";
import { storefrontCustomer } from "@/lib/storefront-session";
import { AuthForm } from "@/components/auth-form";
import { StorePage } from "@/components/store-page";
export const metadata = { title: "Create account" };
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next === "/checkout" ? "/checkout" : "/profile";
  if (await storefrontCustomer()) redirect(next);
  return (
    <StorePage title="Create your account">
      <p className="text-muted-foreground mb-6">
        Save your details for your next visit.
      </p>
      <AuthForm mode="signup" next={next} />
    </StorePage>
  );
}
