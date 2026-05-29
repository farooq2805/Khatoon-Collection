import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Supabase environment variables are missing." },
        { status: 500 }
      );
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

    // Build mapping for columns to save in Supabase
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
      return NextResponse.json(
        { success: false, error: `Supabase error: ${errorText}` },
        { status: res.status }
      );
    }

    const data = isUpdate ? {} : await res.json();
    const prospect = isUpdate ? { id: body.id } : data[0];

    return NextResponse.json({ success: true, prospect });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
