/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";

export default async function Page({ params }: any) {
  // Works whether Next gives params as an object or a Promise
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug as string;

  redirect(`/products?category=${encodeURIComponent(slug)}`);
}
