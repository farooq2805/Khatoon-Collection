

/* eslint-disable @typescript-eslint/no-explicit-any */
// app/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";

export const revalidate = 3600;

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api";

type ApiResponse = { success: boolean; data?: any };

async function getProduct(slug: string) {
  const res = await fetch(`${API_URL}/publicproducts/slug/${slug}`, {
    next: { revalidate: 3600 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load product");

  const json = (await res.json()) as ApiResponse;
  return json?.data ?? null;
}

async function getRelated(slug: string) {
  const res = await fetch(`${API_URL}/publicproducts/related/${slug}?limit=8`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];
  const json = (await res.json()) as ApiResponse;
  return json?.data ?? [];
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelated(slug);

  return <ProductDetailsClient product={product} related={related} />;
}
