import { NextResponse } from "next/server";

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "100";

    const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/prospects?select=*&order=created_at.desc&limit=${limit}`;

    const headers: HeadersInit = {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    };

    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      const errRes = NextResponse.json(
        { success: false, error: `Supabase error: ${errorText}` },
        { status: res.status }
      );
      errRes.headers.set("Access-Control-Allow-Origin", "*");
      return errRes;
    }

    const data = await res.json();
    
    const prospects = data.map((p: any) => ({
      id: p.id,
      customerName: p.full_name,
      guestPhone: p.phone,
      customerEmail: p.email,
      shippingAddress: p.address_line1,
      shippingCity: p.city,
      shippingState: p.state,
      shippingPostalCode: p.pincode,
      cartItems: p.cart_items || [],
      totalAmount: p.cart_total,
      orderDate: p.created_at,
      status: p.status || "Abandoned",
      isProspect: true
    }));

    const response = NextResponse.json({ success: true, prospects });
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  } catch (error: any) {
    const errRes = NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
    errRes.headers.set("Access-Control-Allow-Origin", "*");
    return errRes;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const errRes = NextResponse.json(
        { success: false, error: "Supabase environment variables are missing." },
        { status: 500 }
      );
      errRes.headers.set("Access-Control-Allow-Origin", "*");
      return errRes;
    }

    const isUpdate = !!body.id;
    const url = isUpdate 
      ? `${supabaseUrl.replace(/\/$/, "")}/rest/v1/prospects?id=eq.${body.id}`
      : `${supabaseUrl.replace(/\/$/, "")}/rest/v1/prospects`;

    const method = isUpdate ? "PATCH" : "POST";
    const headers: HeadersInit = {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    };

    if (!isUpdate) {
      headers["Prefer"] = "return=representation";
    }

    const payload: any = {};
    if (body.fullName !== undefined) payload.full_name = body.fullName;
    if (body.phone !== undefined) payload.phone = body.phone;
    if (body.email !== undefined) payload.email = body.email || null;
    if (body.addressLine1 !== undefined) payload.address_line1 = body.addressLine1;
    if (body.addressLine2 !== undefined) payload.address_line2 = body.addressLine2 || null;
    if (body.city !== undefined) payload.city = body.city;
    if (body.state !== undefined) payload.state = body.state;
    if (body.pincode !== undefined) payload.pincode = body.pincode;
    if (body.cartItems !== undefined) payload.cart_items = body.cartItems;
    if (body.cartTotal !== undefined) payload.cart_total = body.cartTotal;
    if (body.status !== undefined) payload.status = body.status;

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      const errRes = NextResponse.json(
        { success: false, error: `Supabase error: ${errorText}` },
        { status: res.status }
      );
      errRes.headers.set("Access-Control-Allow-Origin", "*");
      return errRes;
    }

    const data = isUpdate ? {} : await res.json();
    const prospect = isUpdate ? { id: body.id } : data[0];

    const response = NextResponse.json({ success: true, prospect });
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  } catch (error: any) {
    const errRes = NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
    errRes.headers.set("Access-Control-Allow-Origin", "*");
    return errRes;
  }
}
