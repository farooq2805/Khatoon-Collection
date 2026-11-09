import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ExternalLink, Pencil, Plus, Search, Shirt } from "lucide-react";
import { api, listFrom, STORE_URL } from "../lib/api";
import { inr } from "../lib/format";
import { Badge, Empty, ErrorNote, PageHeader, Spinner, Tabs, Thumb } from "../components/ui";

type Variant = { id: number; size?: string | null; color?: string | null; stockQuantity?: number; isActive?: boolean };
type Product = {
  id: number;
  name: string;
  slug: string;
  isActive?: boolean;
  price?: string | number;
  discountPrice?: string | number | null;
  mainImageUrl?: string | null;
  imageUrl?: string | null;
  images?: ({ url?: string } | string)[];
  category?: { name?: string } | string | null;
  variants?: Variant[];
};

type Filter = "all" | "active" | "hidden" | "low" | "out";

// Product editing still lives in the classic dashboard (same login).
const classic = (path: string) => `${window.location.origin}${path}`;

const imageOf = (p: Product) =>
  p.mainImageUrl || p.imageUrl || (Array.isArray(p.images) && p.images[0] ? (typeof p.images[0] === "string" ? p.images[0] : p.images[0].url) : null);
const stockOf = (p: Product) => (p.variants?.length ? p.variants.reduce((s, v) => s + Number(v.stockQuantity || 0), 0) : null);
const soldOutSizes = (p: Product) => (p.variants || []).filter((v) => v.isActive !== false && Number(v.stockQuantity || 0) <= 0);
const lowSizes = (p: Product) => (p.variants || []).filter((v) => v.isActive !== false && Number(v.stockQuantity || 0) > 0 && Number(v.stockQuantity) <= 5);
const categoryOf = (p: Product) => (typeof p.category === "string" ? p.category : p.category?.name) || "";

export default function Products() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const filter = (params.get("stock") === "low" ? "low" : params.get("filter")) as Filter || "all";
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    api("/products/admin/all")
      .then((r) => setProducts(listFrom<Product>(r)))
      .catch((e) => setError(e.message));
  }, []);

  const FILTERS: Record<Filter, (p: Product) => boolean> = {
    all: () => true,
    active: (p) => p.isActive !== false,
    hidden: (p) => p.isActive === false,
    low: (p) => lowSizes(p).length > 0,
    out: (p) => soldOutSizes(p).length > 0,
  };

  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (products || [])
      .filter(FILTERS[filter] || FILTERS.all)
      .filter((p) => !n || p.name.toLowerCase().includes(n) || String(p.id) === n || categoryOf(p).toLowerCase().includes(n));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, filter, q]);

  const toggle = async (p: Product) => {
    setBusy(p.id);
    try {
      await api(`/products/${p.id}/active`, { method: "PATCH", body: { isActive: p.isActive === false } });
      setProducts((list) => (list || []).map((x) => (x.id === p.id ? { ...x, isActive: p.isActive === false } : x)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  if (!products && !error) return <Spinner label="Loading products…" />;
  const count = (f: Filter) => (products || []).filter(FILTERS[f]).length;
  const hasStock = (products || []).some((p) => p.variants?.length);

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${count("active")} live on the store · ${count("hidden")} hidden`}
        actions={
          <a href={classic("/products/new")} className="btn-primary">
            <Plus className="h-4 w-4" /> Add product
          </a>
        }
      />
      {error && <div className="mb-4"><ErrorNote message={error} /></div>}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs<Filter>
          value={filter}
          onChange={(f) => setParams(f === "all" ? {} : { filter: f })}
          options={[
            { value: "all", label: "All", count: count("all") },
            { value: "active", label: "Live", count: count("active") },
            { value: "hidden", label: "Hidden", count: count("hidden") },
            ...(hasStock
              ? [
                  { value: "low" as Filter, label: "Low stock", count: count("low") },
                  { value: "out" as Filter, label: "Sizes sold out", count: count("out") },
                ]
              : []),
          ]}
        />
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input className="input pl-9" placeholder="Name, ID or category…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <Empty icon={<Shirt className="h-8 w-8" />} title="No products match" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="table-head">
                <tr><th>Product</th><th>Category</th><th className="!text-right">Price</th><th>Stock</th><th>On store</th><th /></tr>
              </thead>
              <tbody>
                {rows.slice(0, 400).map((p) => {
                  const stock = stockOf(p);
                  const out = soldOutSizes(p);
                  const low = lowSizes(p);
                  const price = Number(p.discountPrice || p.price || 0);
                  return (
                    <tr key={p.id} className={`table-row ${p.isActive === false ? "opacity-60" : ""}`}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Thumb src={imageOf(p)} alt={p.name} size={40} />
                          <div className="min-w-0">
                            <div className="max-w-[320px] truncate font-medium">{p.name}</div>
                            <div className="text-xs text-neutral-500">ID {p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-neutral-600">{categoryOf(p) || "—"}</td>
                      <td className="text-right font-semibold">{price ? inr(price) : "—"}</td>
                      <td>
                        {stock === null ? (
                          <span className="text-neutral-400">—</span>
                        ) : (
                          <div>
                            <div className="font-medium">{stock} pcs</div>
                            <div className="flex flex-wrap gap-1">
                              {out.length > 0 && <Badge tone="red">{out.map((v) => v.size || v.color).filter(Boolean).join(", ") || out.length} sold out</Badge>}
                              {low.length > 0 && <Badge tone="amber">{low.length} low</Badge>}
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => toggle(p)}
                          disabled={busy === p.id}
                          className={`relative h-6 w-11 rounded-full transition ${p.isActive === false ? "bg-neutral-300" : "bg-emerald-500"}`}
                          title={p.isActive === false ? "Hidden. Click to show on store" : "Live. Click to hide from store"}
                        >
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${p.isActive === false ? "left-0.5" : "left-[22px]"}`} />
                        </button>
                      </td>
                      <td className="whitespace-nowrap text-right">
                        <a href={`${STORE_URL}/products/${p.slug}`} target="_blank" rel="noreferrer" className="btn-ghost px-2" title="View on store">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <a href={classic(`/products/${p.id}/edit`)} className="btn-ghost px-2" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
