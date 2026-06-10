import { getUserProfile } from "@/lib/get-user-profile";
import { DadosClient } from "./DadosClient";

export const metadata = { title: "Meus Dados" };

export default async function DadosPage() {
  const { profile } = await getUserProfile();

  return (
    <DadosClient
      initialData={{
        name: profile.name,
        phone: profile.phone ?? "",
        cpf: profile.cpf ?? "",
        email: profile.email,
      }}
    />
  );
}
