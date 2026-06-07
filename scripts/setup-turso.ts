import "dotenv/config";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN!;

if (!url || !authToken) {
  console.error("TURSO_URL and TURSO_AUTH_TOKEN are required");
  process.exit(1);
}

const db = createClient({ url, authToken });

const SQL = `
CREATE TABLE IF NOT EXISTS User (
  id           TEXT PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  name         TEXT NOT NULL,
  cpf          TEXT UNIQUE,
  phone        TEXT,
  createdAt    TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Address (
  id          TEXT PRIMARY KEY,
  userId      TEXT,
  name        TEXT NOT NULL,
  cep         TEXT NOT NULL,
  logradouro  TEXT NOT NULL,
  numero      TEXT NOT NULL,
  complemento TEXT,
  bairro      TEXT NOT NULL,
  cidade      TEXT NOT NULL,
  estado      TEXT NOT NULL,
  isDefault   INTEGER NOT NULL DEFAULT 0,
  createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Category (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS Brand (
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  slug    TEXT UNIQUE NOT NULL,
  logoUrl TEXT
);

CREATE TABLE IF NOT EXISTS Product (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price       INTEGER NOT NULL,
  salePrice   INTEGER,
  onSale      INTEGER NOT NULL DEFAULT 0,
  saleEndsAt  TEXT,
  stock       INTEGER NOT NULL DEFAULT 0,
  sku         TEXT UNIQUE,
  featured    INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  categoryId  TEXT NOT NULL,
  createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (categoryId) REFERENCES Category(id)
);

CREATE TABLE IF NOT EXISTS ProductImage (
  id        TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  url       TEXT NOT NULL,
  alt       TEXT,
  position  INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ProductBrand (
  productId TEXT NOT NULL,
  brandId   TEXT NOT NULL,
  PRIMARY KEY (productId, brandId),
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
  FOREIGN KEY (brandId) REFERENCES Brand(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Order" (
  id                  TEXT PRIMARY KEY,
  userId              TEXT,
  guestEmail          TEXT,
  status              TEXT NOT NULL DEFAULT 'PENDING',
  subtotalCents       INTEGER NOT NULL,
  shippingCents       INTEGER NOT NULL,
  totalCents          INTEGER NOT NULL,
  shippingMethod      TEXT NOT NULL,
  shippingRegion      TEXT NOT NULL,
  stripePaymentIntent TEXT,
  paidAt              TEXT,
  createdAt           TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt           TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS OrderAddress (
  id          TEXT PRIMARY KEY,
  orderId     TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  cep         TEXT NOT NULL,
  logradouro  TEXT NOT NULL,
  numero      TEXT NOT NULL,
  complemento TEXT,
  bairro      TEXT NOT NULL,
  cidade      TEXT NOT NULL,
  estado      TEXT NOT NULL,
  FOREIGN KEY (orderId) REFERENCES "Order"(id)
);

CREATE TABLE IF NOT EXISTS OrderItem (
  id             TEXT PRIMARY KEY,
  orderId        TEXT NOT NULL,
  productId      TEXT NOT NULL,
  quantity       INTEGER NOT NULL,
  unitPriceCents INTEGER NOT NULL,
  productName    TEXT NOT NULL,
  productSku     TEXT,
  FOREIGN KEY (orderId) REFERENCES "Order"(id),
  FOREIGN KEY (productId) REFERENCES Product(id)
);

CREATE TABLE IF NOT EXISTS Coupon (
  id            TEXT PRIMARY KEY,
  code          TEXT UNIQUE NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL,
  value         INTEGER NOT NULL,
  minOrderCents INTEGER,
  maxUsage      INTEGER,
  usageCount    INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1,
  expiresAt     TEXT,
  createdAt     TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed default categories
INSERT OR IGNORE INTO Category (id, name, slug, description) VALUES
  ('cat_chicotes',   'Chicotes',     'chicotes',     'Chicotes elétricos para carros preparados'),
  ('cat_rele',       'Caixa de Relé','caixa-de-rele','Caixas de relé e fusíveis de alta performance'),
  ('cat_medidores',  'Medidores',    'medidores',    'Instrumentação e medidores automotivos'),
  ('cat_pecas',      'Peças',        'pecas',        'Peças e acessórios para preparação');

-- Seed default brands
INSERT OR IGNORE INTO Brand (id, name, slug) VALUES
  ('brand_vw',   'Volkswagen', 'volkswagen'),
  ('brand_ford', 'Ford',       'ford'),
  ('brand_chev', 'Chevrolet',  'chevrolet'),
  ('brand_fiat', 'Fiat',       'fiat');
`;

async function run() {
  console.log("🔗 Connecting to Turso:", url);
  const stmts = SQL.split(";").map(s => s.trim()).filter(Boolean);

  for (const stmt of stmts) {
    try {
      await db.execute(stmt + ";");
      const preview = stmt.slice(0, 60).replace(/\n/g, " ");
      console.log(`  ✓ ${preview}...`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Ignore "already exists" errors from ALTER TABLE
      if (!msg.includes("already exists") && !msg.includes("duplicate column")) {
        console.warn(`  ⚠ ${msg.slice(0, 80)}`);
      }
    }
  }

  console.log("\n✅ Turso schema ready!");
  db.close();
}

run().catch(console.error);
