import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db, ensureStorefrontSchema } from "@/lib/db";

// Checkout prospects: shoppers who filled the checkout form. The checkout page
// saves them (POST); the admin dashboard lists them (GET, admin login required).

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api";
const ADMIN_ORIGINS = ["https://panel.khatooncollection.in", "https://dashboard.khatooncollection.in"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function withCors(res: NextResponse, request: Request): NextResponse {
  const origin = request.headers.get("origin") || "";
  if (ADMIN_ORIGINS.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
  }
  return res;
}

function json(request: Request, body: unknown, status = 200) {
  return withCors(NextResponse.json(body, { status }), request);
}

/** The bearer token must belong to an admin of the store API. */
async function isAdmin(request: Request): Promise<boolean> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: auth },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return false;
    const profile = await res.json();
    return /admin/i.test(String(profile?.data?.role || ""));
  } catch {
    return false;
  }
}

const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) || null : null);

export async function OPTIONS(request: Request) {
  const res = withCors(new NextResponse(null, { status: 204 }), request);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function GET(request: Request) {
  if (!(await isAdmin(request))) return json(request, { success: false, error: "Unauthorized" }, 401);

  try {
    await ensureStorefrontSchema();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "200", 10) || 200, 1), 1000);
    const { rows } = await db().query(
      `SELECT id, full_name, phone, email, address_line1, city, state, pincode,
              cart_items, cart_total, status, created_at, updated_at
         FROM storefront.checkout_prospects
        ORDER BY created_at DESC
        LIMIT $1`,
      [limit]
    );
    const prospects = rows.map((p) => ({
      id: Number(p.id),
      customerName: p.full_name,
      guestPhone: p.phone,
      customerEmail: p.email,
      shippingAddress: p.address_line1,
      shippingCity: p.city,
      shippingState: p.state,
      shippingPostalCode: p.pincode,
      cartItems: p.cart_items || [],
      totalAmount: Number(p.cart_total) || 0,
      orderDate: p.created_at,
      updatedAt: p.updated_at,
      status: p.status,
      isProspect: true,
    }));
    return json(request, { success: true, prospects });
  } catch (error: any) {
    console.error("Prospects GET failed:", error);
    return json(request, { success: false, error: "Could not load prospects" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await ensureStorefrontSchema();

    const token = typeof body.id === "string" && UUID_RE.test(body.id) ? body.id : null;

    // Mark completed (after successful payment)
    if (token && body.status === "completed") {
      await db().query(`UPDATE storefront.checkout_prospects SET status = 'completed', updated_at = now() WHERE token = $1`, [token]);
      return json(request, { success: true, prospect: { id: token } });
    }

    const cartItems = Array.isArray(body.cartItems)
      ? body.cartItems.slice(0, 50).map((i: any) => ({
          id: i?.id ?? null,
          name: str(i?.name, 200),
          price: Number(i?.price) || 0,
          quantity: Math.max(1, Math.min(99, parseInt(i?.quantity, 10) || 1)),
          image: str(i?.image, 500),
          variant: str(i?.variant, 100),
        }))
      : [];
    const values = [
      str(body.fullName, 120),
      str(body.phone, 20),
      str(body.email, 200),
      str(body.addressLine1),
      str(body.addressLine2),
      str(body.city, 100),
      str(body.state, 100),
      str(body.pincode, 12),
      JSON.stringify(cartItems),
      Number(body.cartTotal) || 0,
    ];

    if (token) {
      const { rowCount } = await db().query(
        `UPDATE storefront.checkout_prospects
            SET full_name = $2, phone = $3, email = $4, address_line1 = $5, address_line2 = $6,
                city = $7, state = $8, pincode = $9, cart_items = $10::jsonb, cart_total = $11, updated_at = now()
          WHERE token = $1 AND status <> 'completed'`,
        [token, ...values]
      );
      if (rowCount) return json(request, { success: true, prospect: { id: token } });
    }

    const newToken = randomUUID();
    await db().query(
      `INSERT INTO storefront.checkout_prospects
         (token, full_name, phone, email, address_line1, address_line2, city, state, pincode, cart_items, cart_total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)`,
      [newToken, ...values]
    );
    return json(request, { success: true, prospect: { id: newToken } });
  } catch (error: any) {
    console.error("Prospects POST failed:", error);
    return json(request, { success: false, error: "Could not save checkout" }, 500);
  }
}
