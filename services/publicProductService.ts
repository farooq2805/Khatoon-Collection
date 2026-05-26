// services/publicProductService.ts
import { fetchJson, normalizeArray, normalizeMeta, qs } from "@/lib/publicApi";
import type { ProductListParams, ProductListResult } from "@/types/product";

// ✅ must match backend route exactly (case-sensitive on many servers)
const PRODUCTS_PATH = "/publicproducts";

export async function listProducts(params: ProductListParams): Promise<ProductListResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;

  // ✅ match your backend query params exactly
  const query = qs({
    q: params.q,
    page,
    limit,
    sort: params.sort,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    category: params.categorySlug,       // ✅ map frontend name -> backend name
    subCategory: params.subcategorySlug, // ✅ map frontend name -> backend name
  });

  const json = await fetchJson(`${PRODUCTS_PATH}${query}`);

  const items = normalizeArray(json);

  // ✅ normalizeMeta must read from json.pagination
  const meta = normalizeMeta(json, { page, limit });

  return { items, meta };
}
