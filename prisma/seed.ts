import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  // Categories
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: "chicotes" },
      update: {},
      create: { name: "Chicotes", slug: "chicotes", description: "Chicotes elétricos para carros preparados" },
    }),
    db.category.upsert({
      where: { slug: "caixa-de-rele" },
      update: {},
      create: { name: "Caixa de Relé", slug: "caixa-de-rele", description: "Caixas de relé e fusíveis de alta performance" },
    }),
    db.category.upsert({
      where: { slug: "medidores" },
      update: {},
      create: { name: "Medidores", slug: "medidores", description: "Instrumentação e medidores automotivos" },
    }),
    db.category.upsert({
      where: { slug: "pecas" },
      update: {},
      create: { name: "Peças", slug: "pecas", description: "Peças e acessórios para preparação" },
    }),
  ]);

  const [chicotes, caixaRele, medidores, pecas] = categories;

  // Car brands
  const brands = await Promise.all([
    db.brand.upsert({ where: { slug: "volkswagen" }, update: {}, create: { name: "Volkswagen", slug: "volkswagen" } }),
    db.brand.upsert({ where: { slug: "ford" }, update: {}, create: { name: "Ford", slug: "ford" } }),
    db.brand.upsert({ where: { slug: "chevrolet" }, update: {}, create: { name: "Chevrolet", slug: "chevrolet" } }),
    db.brand.upsert({ where: { slug: "fiat" }, update: {}, create: { name: "Fiat", slug: "fiat" } }),
  ]);

  const [vw, ford, chevrolet, fiat] = brands;

  // Products
  const products = [
    {
      name: "Chicote Universal de Ignição 8 Vias",
      slug: "chicote-universal-ignicao-8-vias",
      description: "Chicote elétrico de ignição com 8 vias, compatível com a maioria dos sistemas de preparação. Cabos de alta temperatura e conectores de qualidade.",
      price: 38900,
      stock: 15,
      sku: "CHI-IGN-8V",
      featured: true,
      active: true,
      categoryId: chicotes.id,
      brands: [vw.id, ford.id],
    },
    {
      name: "Chicote Motor AP 1.8 Turbo",
      slug: "chicote-motor-ap-18-turbo",
      description: "Chicote completo para motor AP 1.8 turbo, adaptado para uso com injeção eletrônica de alta performance.",
      price: 58900,
      stock: 8,
      sku: "CHI-AP18T",
      featured: true,
      active: true,
      categoryId: chicotes.id,
      brands: [vw.id],
    },
    {
      name: "Caixa de Relé 12 Circuitos c/ Fusíveis",
      slug: "caixa-rele-12-circuitos",
      description: "Caixa de relé modular com 12 circuitos independentes, fusíveis de proteção e terminais de alta corrente. Ideal para instalações complexas.",
      price: 24900,
      stock: 22,
      sku: "CX-RELE-12C",
      featured: true,
      active: true,
      categoryId: caixaRele.id,
      brands: [vw.id, ford.id, chevrolet.id, fiat.id],
    },
    {
      name: "Caixa de Relé 6 Circuitos Compacta",
      slug: "caixa-rele-6-circuitos-compacta",
      description: "Versão compacta com 6 circuitos, perfeita para instalações menores ou como caixa auxiliar.",
      price: 15900,
      stock: 30,
      sku: "CX-RELE-6C",
      featured: false,
      active: true,
      categoryId: caixaRele.id,
      brands: [vw.id, ford.id, chevrolet.id, fiat.id],
    },
    {
      name: "Medidor de Pressão de Boost 52mm",
      slug: "medidor-pressao-boost-52mm",
      description: "Medidor de pressão de boost com visor de 52mm, escala 0-2 bar. Fundo preto com ponteiro branco iluminado. Acompanha kit de fixação.",
      price: 12900,
      stock: 40,
      sku: "MED-BOOST-52",
      featured: true,
      active: true,
      categoryId: medidores.id,
      brands: [vw.id, ford.id, chevrolet.id, fiat.id],
    },
    {
      name: "Medidor de Temperatura do Cabeçote 52mm",
      slug: "medidor-temperatura-cabecote-52mm",
      description: "Medidor de temperatura do cabeçote com escala 40-140°C, sensor tipo J incluído.",
      price: 13900,
      stock: 25,
      sku: "MED-TEMP-52",
      featured: false,
      active: true,
      categoryId: medidores.id,
      brands: [vw.id, ford.id, chevrolet.id, fiat.id],
    },
    {
      name: "Relé de Corrente 40A com Suporte",
      slug: "rele-corrente-40a",
      description: "Relé de 40A com suporte de fixação em chapa, ideal para ventiladores, injeção e sistemas de alto consumo.",
      price: 3900,
      stock: 100,
      sku: "REL-40A",
      featured: false,
      active: true,
      categoryId: pecas.id,
      brands: [vw.id, ford.id, chevrolet.id, fiat.id],
    },
    {
      name: "Chicote Painel Gol/Voyage G3",
      slug: "chicote-painel-gol-voyage-g3",
      description: "Chicote de painel completo para Gol e Voyage G3, com todos os conectores originais e cabos de alta qualidade.",
      price: 34900,
      stock: 10,
      sku: "CHI-GOL-G3",
      featured: false,
      active: true,
      categoryId: chicotes.id,
      brands: [vw.id],
    },
  ];

  for (const p of products) {
    const { brands: brandIds, ...productData } = p;

    await db.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productData,
        brands: {
          create: brandIds.map((brandId) => ({ brandId })),
        },
      },
    });
  }

  console.log("✅ Seed concluído com sucesso!");
  console.log(`   ${categories.length} categorias`);
  console.log(`   ${brands.length} marcas`);
  console.log(`   ${products.length} produtos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
