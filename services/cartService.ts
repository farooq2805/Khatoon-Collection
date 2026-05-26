/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL =
  `${process.env.NEXT_PUBLIC_API_URL}/cart`;

function getAuthHeaders() {
  const token =
    localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),
  };
}

async function handleResponse(
  res: Response
) {
  let data: any = {};

  try {
    data = await res.json();
  } catch {
    data = {};
  }

  // session expired
  if (res.status === 401) {
    console.warn(
      "Session expired"
    );

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

    // return safe response
    return {
      data: {
        items: [],
      },
    };
  }

  if (!res.ok) {
    throw new Error(
      data?.message ||
        "Request failed"
    );
  }

  return data;
}

export const cartService = {
  async getCart() {
    const res = await fetch(
      API_URL,
      {
        headers:
          getAuthHeaders(),
      }
    );

    return handleResponse(res);
  },

  async addToCart(
    variantId: number,
    quantity: number
  ) {
    const res = await fetch(
      API_URL,
      {
        method: "POST",
        headers:
          getAuthHeaders(),
        body: JSON.stringify({
          variantId,
          quantity,
        }),
      }
    );

    return handleResponse(res);
  },

  async updateQuantity(
    variantId: number,
    quantity: number
  ) {
    const res = await fetch(
      `${API_URL}/${variantId}`,
      {
        method: "PUT",
        headers:
          getAuthHeaders(),
        body: JSON.stringify({
          quantity,
        }),
      }
    );

    return handleResponse(res);
  },

  async removeItem(
    variantId: number
  ) {
    const res = await fetch(
      `${API_URL}/${variantId}`,
      {
        method: "DELETE",
        headers:
          getAuthHeaders(),
      }
    );

    return handleResponse(res);
  },

async clearCart() {
  const token =
    localStorage.getItem(
      "token"
    );

  const res = await fetch(
    `${API_URL}/clear`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  await handleResponse(res);
},
};