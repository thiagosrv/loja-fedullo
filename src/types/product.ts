export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductBrand {
  brand: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductTag {
  tag: {
    id: string;
    name: string;
    type: string;
    color: string;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string;
  dimensions: string | null;
  observations: string | null;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  saleEndsAt: Date | null;
  stock: number;
  sku: string | null;
  featured: boolean;
  active: boolean;
  category: ProductCategory;
  images: ProductImage[];
  brands: ProductBrand[];
  tags: ProductTag[];
  createdAt: Date;
}
