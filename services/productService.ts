/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchJson, normalizeArray, normalizeMeta, qs } from "@/lib/publicApi";

const PRODUCTS_PATH = "/Publicproducts";


export const productService = {
  // ✅ universal list (search + category + subcategory + paging)
  async list(params: any = {}) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 12;

    const query = qs({
      q: params.q,
      page,
      limit,
      sort: params.sort,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      categorySlug: params.categorySlug,
      subcategorySlug: params.subcategorySlug,
    });

    const json = await fetchJson(`${PRODUCTS_PATH}${query}`);
    const items = normalizeArray(json);
    const meta = normalizeMeta(json, { page, limit });

    return { items, meta };
  },

  // ✅ backward compatible for your old code
  async getAll() {
    const { items } = await this.list({ page: 1, limit: 200 });
    return items;
  },

  // ✅ detail (adjust if backend differs)
  async getById(idOrSlug: string) {
    return fetchJson(`${PRODUCTS_PATH}/${encodeURIComponent(idOrSlug)}`);
  },
};
