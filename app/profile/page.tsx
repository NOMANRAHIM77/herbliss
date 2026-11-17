import { redirect } from "next/navigation";
import { storefrontCustomer } from "@/lib/storefront-session";
import { StorePage } from "@/components/store-page";
import { LogoutButton } from "@/components/logout-button";
export const metadata = { title: "Your profile" };
export default async function ProfilePage() {
  const customer = await storefrontCustomer();
  if (!customer) redirect("/signup");
  return (
    <StorePage title="Your profile">
      <div className="bg-secondary mb-8 max-w-xl rounded-2xl border p-6">
        <h2 className="mb-6 text-xl font-semibold">Account details</h2>
        <dl className="space-y-5">
          {[
            ["Name", customer.name],
            ["Email", customer.email],
            ["Mobile number", customer.phone],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted-foreground text-sm">{label}</dt>
              <dd className="mt-1 font-medium break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <LogoutButton />
    </StorePage>
  );
}
