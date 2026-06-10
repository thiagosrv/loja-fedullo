import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://loja-fedullo.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/checkout/",
          "/carrinho",
          "/api/",
          "/conta/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
