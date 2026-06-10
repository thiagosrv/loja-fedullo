import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * Validates the Supabase session and lazily upserts the Prisma User profile.
 * Wrapped with React.cache() so layout + page share one DB call per request.
 */
export const getUserProfile = cache(
  async (redirectTo = "/login?redirect=/conta") => {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      redirect(redirectTo);
    }

    // Lazy-create the Prisma profile on first account area visit
    let profile = await db.user.findUnique({ where: { email: user.email } });

    if (!profile) {
      const meta = user.user_metadata as Record<string, string> | undefined;
      try {
        profile = await db.user.create({
          data: {
            email: user.email,
            name: meta?.name ?? user.email.split("@")[0],
            passwordHash: "supabase_managed",
            cpf: meta?.cpf || null,
            phone: meta?.phone || null,
          },
        });
      } catch {
        // Could be concurrent creation; try fetching again
        profile = await db.user.findUniqueOrThrow({
          where: { email: user.email },
        });
      }
    }

    return { user, profile };
  }
);
