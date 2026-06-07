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

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  sku: string | null;
  featured: boolean;
  active: boolean;
  category: ProductCategory;
  images: ProductImage[];
  brands: ProductBrand[];
  createdAt: Date;
}
