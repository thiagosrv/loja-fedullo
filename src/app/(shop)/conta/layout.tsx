import { getUserProfile } from "@/lib/get-user-profile";
import { ContaSidebar } from "./ContaSidebar";

export const metadata = { title: "Minha Conta" };

export default async function ContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getUserProfile();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        <ContaSidebar name={profile.name} email={profile.email} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
