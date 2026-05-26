// src/lib/endpoints.ts
export const endpoints = {
  // auth
  login: "/auth/login",
  register: "/auth/register",
  me: "/me", // (fallback handled in getMe)

  // public catalog
  categories: "/public/categories",
  subcategories: "/public/subcategories",
  tags: "/public/tags",

  // products (example - adjust if your API path differs)
  products: "/products",
  productBySlug: (slug: string) => `/products/${slug}`,

  // cart
  cart: "/cart",
  cartAdd: "/cart/add",
  cartUpdate: "/cart/update",
  cartRemove: "/cart/remove",

  // checkout
  checkout: "/checkout",
};
