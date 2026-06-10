import { getUserProfile } from "@/lib/get-user-profile";
import { db } from "@/lib/db";
import { EnderecosClient } from "./EnderecosClient";

export const metadata = { title: "Endereços" };

export default async function EnderecosPage() {
  const { profile } = await getUserProfile();

  const addresses = await db.address.findMany({
    where: { userId: profile.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return <EnderecosClient userId={profile.id} initialAddresses={addresses} />;
}
