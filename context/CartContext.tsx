/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import toast from "react-hot-toast";
import { cartService } from "@/services/cartService";
import { useAuth } from "./AuthContext";

/* ---------------- TYPES ---------------- */

type CartItem = {
  variantId: number;
  productId: number;
  name: string;
  price: number;
  mrp?: number | null;
  quantity: number;
  imageUrl?: string;
  variant?: {
    size?: string;
    color?: string;
    weight?: string;
  };
};

type CartContextType = {
  
  cartItems: CartItem[];
  cartCount: number;
  cartLoading: boolean;
  addToCart: (
    variantId: number,
    quantity?: number,
    meta?: Partial<CartItem>
  ) => Promise<void>;
  updateQuantity: (
    variantId: number,
    quantity: number
  ) => Promise<void>;
  removeItem: (
    variantId: number
  ) => Promise<void>;
  clearCart: (
  force?: boolean
) => Promise<void>;
  loadCartItems: () => Promise<void>;
  refreshCartCount: () => Promise<void>;
  isMiniCartOpen: boolean;
  setMiniCartOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

const CartContext =
  createContext<CartContextType | null>(
    null
  );

const LS_KEY = "guestCart";

/* ---------------- HELPERS ---------------- */

function safeNum(
  v: any,
  fallback = 0
) {
  const n = Number(v);
  return Number.isFinite(n)
    ? n
    : fallback;
}

function normalizeCartItemFromApi(
  ci: any
): CartItem {
  const variant =
    ci?.variant ??
    ci?.productVariant ??
    null;

  const product =
    ci?.product ??
    variant?.product ??
    null;

  const productId =
    safeNum(ci?.productId, 0) ||
    safeNum(product?.id, 0) ||
    safeNum(
      variant?.productId,
      0
    );

  const variantId = safeNum(
    ci?.variantId ??
      variant?.id,
    0
  );

  const name =
    ci?.productName ||
    ci?.name ||
    product?.name ||
    "";

  const imageUrl =
    ci?.productImageUrl ||
    ci?.imageUrl ||
    product?.imageUrl ||
    product?.mainImageUrl ||
    "";

  const sellingPrice =
    safeNum(
      variant?.effectivePrice ??
        variant?.discountPrice ??
        variant?.price,
      0
    );

  const mrp =
    variant?.discountPrice !=
    null
      ? safeNum(
          variant?.price,
          0
        )
      : null;

  return {
    variantId,
    productId,
    name,
    imageUrl,
    price: sellingPrice,
    mrp,
    quantity: safeNum(
      ci?.quantity ??
        ci?.qty,
      1
    ),
    variant: {
      size:
        variant?.size ??
        undefined,
      color:
        variant?.color ??
        undefined,
      weight:
        variant?.weight ??
        undefined,
    },
  };
}

/* ---------------- PROVIDER ---------------- */

export const CartProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    token,
    loading: authLoading,
  } = useAuth();

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [cartCount, setCartCount] =
    useState(0);

  const [
    isMiniCartOpen,
    setMiniCartOpen,
  ] = useState(false);

  const [
  cartLoading,
  setCartLoading,
] = useState(false);

  const mergedRef =
    useRef(false);

  const prevTokenRef =
    useRef<string | null>(
      null
    );



    
  /* ---------- Guest helpers ---------- */

  const readGuest =
    (): CartItem[] => {
      try {
        const raw =
          JSON.parse(
            localStorage.getItem(
              LS_KEY
            ) || "[]"
          );

        return raw.map(
          (i: any) => ({
            ...i,
            quantity:
              Number(
                i.quantity ??
                  i.qty ??
                  1
              ),
          })
        );
      } catch {
        return [];
      }
    };

  const writeGuest = (
    items: CartItem[]
  ) => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify(items)
    );

    window.dispatchEvent(
      new Event(
        "cart:updated"
      )
    );
  };

  const recalcCount = (
    items: CartItem[]
  ) => {
    setCartCount(
      items.reduce(
        (sum, item) =>
          sum +
          safeNum(
            item.quantity,
            0
          ),
        0
      )
    );
  };

 /* ---------- Load cart ---------- */

const loadCartItems =
  useCallback(async () => {
    // guest mode
    if (!token) {
      const guest =
        readGuest();

      setCartItems([
        ...guest,
      ]);

      recalcCount(
        guest
      );

      return;
    }

    try {
      const res =
        await cartService.getCart();

      const rawItems =
        res?.data?.data
          ?.items ??
        res?.data?.items ??
        [];

      const items =
        rawItems.map(
          (ci: any) =>
            normalizeCartItemFromApi(
              ci
            )
        );

      setCartItems([
        ...items,
      ]);

      recalcCount(
        items
      );
    } catch (
      err: any
    ) {
      const message =
        err?.message ||
        "";

      console.error(
        "Load cart failed:",
        err
      );

      if (
        message.includes(
          "Session expired"
        ) ||
        message.includes(
          "Invalid token"
        ) ||
        message.includes(
          "Unauthorized"
        )
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "username"
        );

        window.dispatchEvent(
          new Event(
            "auth:logout"
          )
        );

        const guest =
          readGuest();

        setCartItems([
          ...guest,
        ]);

        recalcCount(
          guest
        );

        return;
      }

      setCartItems([]);
      setCartCount(0);
    }
  }, [token]);
  
  /* ---------- Merge guest cart ---------- */

/* ---------- Merge guest cart ---------- */

const mergeGuestToUserCart =
  useCallback(async () => {
    if (!token)
      return false;

    const guest =
      readGuest();

    // no guest cart
    if (
      !guest.length ||
      mergedRef.current
    ) {
      return false;
    }

    try {
      console.log(
        "Starting guest merge..."
      );

      // fetch server cart
      const cartRes =
        await cartService.getCart();

      const serverItems =
        cartRes?.data?.data
          ?.items ??
        cartRes?.data
          ?.items ??
        [];

      // merge only missing variants
      for (const item of guest) {
        const existing =
          serverItems.find(
            (
              s: any
            ) =>
              Number(
                s.variantId ??
                  s.variant
                    ?.id
              ) ===
              Number(
                item.variantId
              )
          );

        // skip duplicate variant
        if (existing) {
          console.log(
            `Skipping variant ${item.variantId}`
          );
          continue;
        }

        try {
          await cartService.addToCart(
            item.variantId,
            item.quantity
          );

          console.log(
            `Merged variant ${item.variantId}`
          );
        } catch (
          err: any
        ) {
          console.warn(
            `Failed to merge variant ${item.variantId}`,
            err?.message
          );
        }
      }

      // clear guest AFTER merge
      writeGuest([]);

      // prevent rerun
      mergedRef.current =
        true;

      console.log(
        "Guest merge complete"
      );

      return true;
    } catch (err) {
      console.error(
        "Guest merge failed:",
        err
      );

      return false;
    }
  }, [token]);
 

  /* ---------- Add to cart ---------- */

 const addToCart = async (
  variantId: number,
  quantity = 1,
  meta?: Partial<CartItem>
): Promise<void> => {
  if (!variantId)
    return;

  // ----------------
  // GUEST
  // ----------------
  if (!token) {
    const guest =
      readGuest();

    const found =
      guest.find(
        (i) =>
          i.variantId ===
          variantId
      );

    if (found) {
      found.quantity +=
        quantity;
    } else {
      guest.push({
        variantId,
        productId:
          meta?.productId ||
          0,
        name:
          meta?.name ||
          "",
        price:
          safeNum(
            meta?.price,
            0
          ),
        mrp:
          meta?.mrp ??
          null,
        imageUrl:
          meta?.imageUrl ||
          "",
        quantity,
        variant:
          meta?.variant,
      });
    }

    writeGuest(
      guest
    );

    setCartItems([
      ...guest,
    ]);

    recalcCount(
      guest
    );

    toast.success(
      "Added to cart"
    );

    return;
  }

  // ----------------
  // AUTH USER
  // ----------------
  try {
    setCartLoading(
      true
    );

    setMiniCartOpen(
      true
    );

    // wait server add
    await cartService.addToCart(
      variantId,
      quantity
    );

    // get latest cart
    await loadCartItems();

    toast.success(
      "Added to cart"
    );
  } catch (
    err: any
  ) {
    console.error(
      err
    );

    toast.error(
      err?.message ||
        "Failed to add item"
    );
  } finally {
    setCartLoading(
      false
    );
  }
};

 const updateQuantity = async (
  variantId: number,
  quantity: number
): Promise<void> => {
  const q = Math.max(
    1,
    safeNum(quantity, 1)
  );

  // optimistic update
  setCartItems((prev) => {
    const updated = prev.map(
      (item) =>
        item.variantId ===
        variantId
          ? {
              ...item,
              quantity: q,
            }
          : item
    );

    recalcCount(updated);
    return updated;
  });

  // guest mode
  if (!token) {
    const guest =
      readGuest().map(
        (i) =>
          i.variantId ===
          variantId
            ? {
                ...i,
                quantity: q,
              }
            : i
      );

   writeGuest(
  guest
);

setCartItems([
  ...guest,
]);

recalcCount(
  guest
);

return;
   
  }

  try {
    await cartService.updateQuantity(
      variantId,
      q
    );

    await loadCartItems();
  } catch (err: any) {
    const message =
      err?.message || "";

    if (
      message.includes(
        "Session expired"
      ) ||
      message.includes(
        "Invalid token"
      )
    ) {
     localStorage.removeItem(
  "token"
);

localStorage.removeItem(
  "username"
);

window.dispatchEvent(
  new Event(
    "auth:logout"
  )
);

const guest =
  readGuest().map(
    (i) =>
      i.variantId ===
      variantId
        ? {
            ...i,
            quantity: q,
          }
        : i
  );

writeGuest(
  guest
);

setCartItems([
  ...guest,
]);

recalcCount(
  guest
);

return;
    }

    toast.error(
      "Failed to update cart"
    );
  }
};

const removeItem = async (
  variantId: number
): Promise<void> => {
  // optimistic UI remove
  setCartItems((prev) => {
    const updated =
      prev.filter(
        (i) =>
          i.variantId !==
          variantId
      );

    recalcCount(
      updated
    );

    return updated;
  });

  // ---------- GUEST ----------
  if (!token) {
    const guest =
      readGuest().filter(
        (i) =>
          i.variantId !==
          variantId
      );

    writeGuest(
      guest
    );

    // rerender instantly
    setCartItems([
      ...guest,
    ]);

    recalcCount(
      guest
    );

    return;
  }

  try {
    await cartService.removeItem(
      variantId
    );

    await loadCartItems();
  } catch (err: any) {
    const message =
      err?.message || "";

    // seamless fallback
    if (
      message.includes(
        "Session expired"
      ) ||
      message.includes(
        "Invalid token"
      ) ||
      message.includes(
        "Unauthorized"
      )
    ) {
      // remove stale auth
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "username"
      );

      // sync AuthContext
      window.dispatchEvent(
        new Event(
          "auth:logout"
        )
      );

      const guest =
        readGuest().filter(
          (i) =>
            i.variantId !==
            variantId
        );

      writeGuest(
        guest
      );

      setCartItems([
        ...guest,
      ]);

      recalcCount(
        guest
      );

      return;
    }

    toast.error(
      "Failed to remove item"
    );
  }
};

 const clearCart = async (
  force = false
): Promise<void> => {
  // prevent accidental clear
  // only clear after payment success
if (!force) {
  throw new Error(
    "clearCart requires force=true"
  );
}

  // ---------- GUEST ----------
  if (!token) {
    writeGuest([]);

    setCartItems([]);
    setCartCount(0);

    return;
  }

  try {
    await cartService.clearCart();

    setCartItems([]);
    setCartCount(0);

    // keep guest storage clean
    writeGuest([]);
  } catch (err: any) {
    console.error(
      "Clear cart failed:",
      err
    );

    const message =
      err?.message || "";

    // seamless auth fallback
    if (
      message.includes(
        "Session expired"
      ) ||
      message.includes(
        "Invalid token"
      ) ||
      message.includes(
        "Unauthorized"
      )
    ) {
      // clear stale auth
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "username"
      );

      // notify auth context
      window.dispatchEvent(
        new Event(
          "auth:logout"
        )
      );

      // switch to guest mode
      const guest =
        readGuest();

      setCartItems([
        ...guest,
      ]);

      recalcCount(
        guest
      );

      return;
    }

    toast.error(
      "Failed to clear cart"
    );
  }
};

  const refreshCartCount =
    async () => {
      await loadCartItems();
    };

  /* ---------- Effects ---------- */

useEffect(() => {
  if (authLoading)
    return;

  const storedToken =
    localStorage.getItem(
      "token"
    );

  // ----------------
  // Guest mode
  // ----------------
  if (!storedToken) {
    mergedRef.current =
      false;

    prevTokenRef.current =
      null;

    void loadCartItems();

    return;
  }

  // wait auth context
  if (!token)
    return;

  // prevent rerun
  if (
    prevTokenRef.current ===
    token
  ) {
    return;
  }

  prevTokenRef.current =
    token;

  const initCart =
    async () => {
      try {
        const guestCart =
          readGuest();

        const hasGuestCart =
          guestCart.length >
          0;

        console.log(
          "Guest cart:",
          guestCart
        );

        // STEP 1
        // MERGE FIRST
        if (
          hasGuestCart &&
          !mergedRef.current
        ) {
          console.log(
            "Merging guest cart..."
          );

          await mergeGuestToUserCart();
        }

        // STEP 2
        // THEN LOAD FINAL SERVER CART
        await loadCartItems();

        console.log(
          "Cart initialized"
        );
      } catch (error) {
        console.error(
          "Cart init failed:",
          error
        );
      }
    };

  void initCart();
}, [
  token,
  authLoading,
  loadCartItems,
  mergeGuestToUserCart,
]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
          cartLoading,

        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        loadCartItems,
        refreshCartCount,
        isMiniCartOpen,
        setMiniCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useCart =
  () => {
    const ctx =
      useContext(
        CartContext
      );

    if (!ctx) {
      throw new Error(
        "useCart must be used inside CartProvider"
      );
    }

    return ctx;
  };