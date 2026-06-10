import { getSupabaseServer } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * Validates the Supabase session and lazily upserts the Prisma User profile.
 * Call this in any Server Component that requires authentication.
 */
export async function getUserProfile(redirectTo = "/login?redirect=/conta") {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(redirectTo);
  }

  // Lazy-create the Prisma profile the first time the user visits the account area
  let profile = await db.user.findUnique({ where: { email: user.email } });

  if (!profile) {
    const meta = user.user_metadata as Record<string, string> | undefined;
    try {
      profile = await db.user.create({
        data: {
          email: user.email,
          name: meta?.name ?? user.email.split("@")[0],
          passwordHash: "supabase_managed",
          cpf: meta?.cpf ?? null,
          phone: meta?.phone ?? null,
        },
      });
    } catch {
      // Profile may have been created concurrently — fetch again
      profile = await db.user.findUniqueOrThrow({ where: { email: user.email } });
    }
  }

  return { user, profile };
}
