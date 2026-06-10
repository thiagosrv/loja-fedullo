import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://loja-fedullo.vercel.app";

  /* Static pages */
  const statics: MetadataRoute.Sitemap = [
    { url: baseUrl,                          priority: 1,    changeFrequency: "weekly" },
    { url: `${baseUrl}/chicotes`,            priority: 0.9,  changeFrequency: "weekly" },
    { url: `${baseUrl}/caixa-de-rele`,       priority: 0.9,  changeFrequency: "weekly" },
    { url: `${baseUrl}/medidores`,           priority: 0.9,  changeFrequency: "weekly" },
    { url: `${baseUrl}/pecas`,               priority: 0.9,  changeFrequency: "weekly" },
    { url: `${baseUrl}/marcas`,              priority: 0.7,  changeFrequency: "monthly" },
  ];

  /* Products */
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await db.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    productEntries = products.map((p) => ({
      url: `${baseUrl}/produto/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    }));
  } catch {
    /* DB may not be reachable at build time — sitemap still works with statics */
  }

  /* Brands */
  let brandEntries: MetadataRoute.Sitemap = [];
  try {
    const brands = await db.brand.findMany({ select: { slug: true } });
    brandEntries = brands.map((b) => ({
      url: `${baseUrl}/marcas/${b.slug}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    }));
  } catch {
    /* ignore */
  }

  return [...statics, ...productEntries, ...brandEntries];
}
