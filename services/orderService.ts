// /* eslint-disable @typescript-eslint/no-explicit-any */
// // src/services/orderService.ts
// import { api } from "@/lib/api";
// import type { OrderDTO } from "@/lib/types";

// async function tryGet<T>(paths: string[]) {
//   let lastErr: any = null;
//   for (const p of paths) {
//     try {
//       return await api.get<T>(p);
//     } catch (e: any) {
//       lastErr = e;
//       if (![401, 403, 404].includes(e?.status)) throw e;
//     }
//   }
//   throw lastErr;
// }

// export const orderService = {
//   myOrders: async () => {
//     // ✅ Change ONLY here if your backend uses a specific route
//     const res = await tryGet<OrderDTO[]>([
//       "/orders/my",
//       "/orders/me",
//       "/orders?mine=true",
//       "/orders",
//     ]);
//     return res.data;
//   },
// };


/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/orderService.ts
import { api } from "@/lib/api";
import type { OrderDTO } from "@/lib/types";

async function tryGet<T>(paths: string[]) {
  let lastErr: any = null;
  for (const p of paths) {
    try {
      return await api.get<T>(p);
    } catch (e: any) {
      lastErr = e;
      // keep trying for common auth/404 mismatches
      if (![401, 403, 404].includes(e?.status)) throw e;
    }
  }
  throw lastErr;
}

export const orderService = {
  myOrders: async () => {
    const res = await tryGet<OrderDTO[]>([
      "/orders/my",
      "/orders/me",
      "/orders?mine=true",
      "/orders",
    ]);
    return res.data;
  },

  // ✅ NEW: single order (used by /account/orders/[id])
  getOrder: async (id: string | number) => {
    const res = await tryGet<OrderDTO>([
      `/orders/${id}`,
      `/orders/id/${id}`,
      `/orders/view/${id}`,
      `/orders/details/${id}`,
      `/orders/my/${id}`,
      `/orders/me/${id}`,
    ]);
    return res.data;
  },
};
