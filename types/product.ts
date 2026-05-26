// types/product.ts

export type ProductSize = {
  id: number;

  size?: string | null;
  weight?: string | null;

  price?: number | null;
  discountPrice?: number | null;
  effectivePrice?: number | null;

  stockQuantity?: number | null;

  sku?: string | null;

  images?: string[] | null;
};

export type ProductColor = {
  color: string;
  colorHex?: string | null;

  sizes: ProductSize[];
};

export type Product = {
  id: number | string;

  name: string;
  slug: string;

  price: number;
  mrp?: number | null;

  discountPrice?: number | null;
  effectivePrice?: number | null;

  image?: string | null;
  images?: string[] | null;

  shortDescription?: string | null;

  categoryId?: number | null;
  subCategoryId?: number | null;

  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;

  subCategory?: {
    id: number;
    name: string;
    slug: string;
    categoryId?: number | null;
  } | null;

  colors?: ProductColor[];

  isActive?: boolean | null;
};

export type ProductSort =
  | "newest"
  | "price_asc"
  | "price_desc";

export type ProductListParams = {
  q?: string;
  page?: number;
  limit?: number;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;

  categorySlug?: string;
  subcategorySlug?: string;
};

export type ListMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ProductListResult = {
  items: Product[];
  meta: ListMeta;
};