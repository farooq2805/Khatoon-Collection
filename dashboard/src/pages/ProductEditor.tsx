import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Copy, ExternalLink, ImagePlus, Loader2, Plus, Star, Trash2, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { api, listFrom, STORE_URL } from "../lib/api";
import { uploadImage } from "../lib/upload";
import { usableImage } from "../lib/format";
import RichText from "../components/RichText";
import { ErrorNote, Spinner } from "../components/ui";

// ── Types (mirror the API / classic editor) ──────────────────────────────────
type Img = { url: string; altText?: string; sortOrder?: number; isMain?: boolean };
type VariantRow = {
  id?: number;
  weight: string;
  size: string;
  color: string;
  colorHex: string;
  colorImageUrl: string;
  price: string;
  discountPrice: string;
  stockQuantity: string;
  sku: string;
  isAutoSKU: boolean;
  images: Img[];
};
type ProductType = "simple" | "size" | "clothing" | "weight";
type Form = {
  name: string;
  slug: string;
  productCode: string;
  description: string;
  isActive: boolean;
  productType: ProductType;
  categoryId: string;
  subCategoryId: string;
  customShipping: boolean;
  shippingFeeMumbai: string;
  shippingFeeOutside: string;
  imageUrl: string;
  shortDescriptionHtml: string;
  apContentHtml: string;
  apContentImageUrl: string;
  apContentVideoUrl: string;
  tagIds: number[];
  images: Img[];
  variants: VariantRow[];
};
type Named = { id: number; name: string; categoryId?: number };

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL", "Free Size"];
const TYPE_OPTIONS: { value: ProductType; label: string; hint: string }[] = [
  { value: "clothing", label: "Sizes & colour", hint: "Suits, kaftans, co-ords" },
  { value: "size", label: "Sizes only", hint: "One colour, many sizes" },
  { value: "simple", label: "Single item", hint: "No size or colour" },
  { value: "weight", label: "By weight", hint: "Sold by weight" },
];

const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");

/** Same SKU pattern as the classic editor: NAME-COLOR-SIZE-n */
const autoSku = (name: string, v: Partial<VariantRow>, i: number) => {
  const base = (name || "PRODUCT").toUpperCase().replace(/\s+/g, "-").slice(0, 15);
  const parts: string[] = [];
  if (v.color) parts.push(v.color.toUpperCase());
  if (v.size) parts.push(v.size.toUpperCase());
  if (v.weight) parts.push(v.weight);
  return [base, ...parts, i + 1].join("-");
};

const emptyVariant = (name: string, i: number, extra: Partial<VariantRow> = {}): VariantRow => {
  const v: VariantRow = {
    weight: "",
    size: "",
    color: "",
    colorHex: "",
    colorImageUrl: "",
    price: "",
    discountPrice: "",
    stockQuantity: "",
    sku: "",
    isAutoSKU: true,
    images: [],
    ...extra,
  };
  if (v.isAutoSKU) v.sku = autoSku(name, v, i);
  return v;
};

const EMPTY: Form = {
  name: "",
  slug: "",
  productCode: "",
  description: "",
  isActive: true,
  productType: "clothing",
  categoryId: "",
  subCategoryId: "",
  customShipping: false,
  shippingFeeMumbai: "",
  shippingFeeOutside: "",
  imageUrl: "",
  shortDescriptionHtml: "",
  apContentHtml: "",
  apContentImageUrl: "",
  apContentVideoUrl: "",
  tagIds: [],
  images: [],
  variants: [emptyVariant("", 0)],
};

const num = (v: unknown) => (v === null || v === undefined ? "" : String(typeof v === "object" ? (v as any).toString() : v));

function fromApi(p: any): Form {
  return {
    name: p.name || "",
    slug: p.slug || slugify(p.name || ""),
    productCode: p.productCode || "",
    description: p.description || "",
    isActive: p.isActive ?? true,
    productType: (p.productType || "simple") as ProductType,
    categoryId: p.categoryId ? String(p.categoryId) : "",
    subCategoryId: p.subCategoryId ? String(p.subCategoryId) : "",
    customShipping: (p.shippingFeeMumbai ?? "") !== "" || (p.shippingFeeOutside ?? "") !== "",
    shippingFeeMumbai: num(p.shippingFeeMumbai),
    shippingFeeOutside: num(p.shippingFeeOutside),
    imageUrl: p.imageUrl || "",
    shortDescriptionHtml: p.shortDescriptionHtml || "",
    apContentHtml: p.apContentHtml || "",
    apContentImageUrl: p.apContentImageUrl || "",
    apContentVideoUrl: p.apContentVideoUrl || "",
    tagIds: (p.productTags || []).map((t: any) => t.tagId || t.tag?.id).filter(Boolean),
    images: (p.images || [])
      .map((i: any) => ({ url: i.url, altText: i.altText || "", sortOrder: i.sortOrder ?? 0, isMain: !!i.isMain }))
      .sort((a: Img, b: Img) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    variants: (p.variants || []).length
      ? p.variants.map((v: any) => ({
          id: v.id,
          weight: v.weight || "",
          size: v.size || "",
          color: v.color || "",
          colorHex: v.colorHex || "",
          colorImageUrl: v.colorImageUrl || "",
          price: num(v.price),
          discountPrice: num(v.discountPrice),
          stockQuantity: num(v.stockQuantity),
          sku: v.sku || "",
          isAutoSKU: false,
          images: (v.images || []).map((i: any) => ({ url: i.url, altText: i.altText || "", sortOrder: i.sortOrder ?? 0 })),
        }))
      : [emptyVariant(p.name || "", 0)],
  };
}

// ── Small layout helpers ─────────────────────────────────────────────────────
function Card({ title, hint, children, action }: { title: string; hint?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs text-neutral-400">{hint}</span>}
    </label>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ProductEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const copyFrom = params.get("from");
  const editing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(0);

  const [categories, setCategories] = useState<Named[]>([]);
  const [subcategories, setSubcategories] = useState<Named[]>([]);
  const [tags, setTags] = useState<Named[]>([]);
  const [groups, setGroups] = useState<Named[]>([]);

  // Colour group ("design group"): links colour versions of the same design
  const [groupId, setGroupId] = useState("");
  const [originalGroupId, setOriginalGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [groupColor, setGroupColor] = useState("");
  const [groupHex, setGroupHex] = useState("");
  const [groupImage, setGroupImage] = useState("");

  const galleryInput = useRef<HTMLInputElement>(null);

  // Load lists + product
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [c, s, t, g] = await Promise.all([
          api("/categories"),
          api("/subcategories"),
          api("/tags").catch(() => ({ data: [] })),
          api("/admin/design-groups").catch(() => ({ data: [] })),
        ]);
        if (!alive) return;
        setCategories(listFrom(c));
        setSubcategories(listFrom(s));
        setTags(listFrom(t));
        setGroups(listFrom(g));

        const sourceId = id || copyFrom;
        if (sourceId) {
          const res = await api(`/products/${sourceId}`);
          const p = res.data;
          const f = fromApi(p);
          const m = p.designGroupMemberships?.[0];
          if (copyFrom && !id) {
            // Duplicate: same details, new name/slug, fresh sizes (no ids), new SKUs
            f.name = `${f.name} (copy)`;
            f.slug = "";
            f.isActive = false;
            f.variants = f.variants.map((v, i) => {
              const nv = { ...v, id: undefined, isAutoSKU: true };
              nv.sku = autoSku(f.name, nv, i);
              return nv;
            });
            if (m) setGroupId(String(m.groupId));
          } else if (m) {
            setGroupId(String(m.groupId));
            setOriginalGroupId(String(m.groupId));
            setGroupColor(m.color || "");
            setGroupHex(m.colorHex || "");
            setGroupImage(m.imageUrl || "");
          }
          setForm(f);
        }
      } catch (e: any) {
        setError(e.message || "Could not load the product");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, copyFrom]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const hasSize = form.productType === "size" || form.productType === "clothing";
  const hasColor = form.productType === "clothing";
  const hasWeight = form.productType === "weight";
  const subOptions = useMemo(
    () => (form.categoryId ? subcategories.filter((s) => String(s.categoryId) === form.categoryId) : []),
    [subcategories, form.categoryId]
  );

  // ── Variants ───────────────────────────────────────────────────────────────
  const updateVariant = (i: number, k: keyof VariantRow, v: string) =>
    setForm((f) => {
      const variants = f.variants.map((row, idx) => {
        if (idx !== i) return row;
        const next = { ...row, [k]: v } as VariantRow;
        if (k === "sku") next.isAutoSKU = false;
        if (next.isAutoSKU) next.sku = autoSku(f.name, next, idx);
        return next;
      });
      setDirty(true);
      return { ...f, variants };
    });

  const addVariant = (extra: Partial<VariantRow> = {}) =>
    setForm((f) => {
      const last = f.variants[f.variants.length - 1];
      const row = emptyVariant(f.name, f.variants.length, {
        price: last?.price || "",
        discountPrice: last?.discountPrice || "",
        color: hasColor ? last?.color || "" : "",
        colorHex: hasColor ? last?.colorHex || "" : "",
        ...extra,
      });
      setDirty(true);
      // Replace the untouched starter row instead of adding next to it
      const starter = f.variants.length === 1 && !f.variants[0].id && !f.variants[0].size && !f.variants[0].stockQuantity;
      return { ...f, variants: starter ? [{ ...row, sku: autoSku(f.name, row, 0) }] : [...f.variants, row] };
    });

  const addSize = (size: string) => {
    if (form.variants.some((v) => v.size === size && (!hasColor || v.color === form.variants[form.variants.length - 1]?.color))) return;
    addVariant({ size });
  };

  const removeVariant = (i: number) =>
    setForm((f) => {
      setDirty(true);
      const variants = f.variants.filter((_, idx) => idx !== i);
      return { ...f, variants: variants.length ? variants : [emptyVariant(f.name, 0)] };
    });

  const applyToAll = (k: "price" | "discountPrice" | "stockQuantity") => {
    const v = form.variants[0]?.[k];
    if (v === undefined) return;
    setForm((f) => ({ ...f, variants: f.variants.map((row) => ({ ...row, [k]: v })) }));
    setDirty(true);
  };

  // Regenerate automatic SKUs when the name changes
  const setName = (name: string) =>
    setForm((f) => {
      setDirty(true);
      return {
        ...f,
        name,
        slug: editing ? f.slug : slugify(name),
        variants: f.variants.map((v, i) => (v.isAutoSKU ? { ...v, sku: autoSku(name, v, i) } : v)),
      };
    });

  // ── Photos ─────────────────────────────────────────────────────────────────
  const uploadGallery = async (files: FileList | null) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const url = await uploadImage(file, "products/gallery");
        setForm((f) => {
          const images = [...f.images, { url, altText: "", sortOrder: f.images.length, isMain: f.images.length === 0 }];
          return { ...f, images, imageUrl: f.imageUrl || url };
        });
        setDirty(true);
      } catch (e: any) {
        setError(`${file.name}: ${e.message}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const setMain = (i: number) => {
    setForm((f) => ({ ...f, imageUrl: f.images[i].url, images: f.images.map((img, idx) => ({ ...img, isMain: idx === i })) }));
    setDirty(true);
  };

  const moveImage = (i: number, dir: -1 | 1) => {
    setForm((f) => {
      const j = i + dir;
      if (j < 0 || j >= f.images.length) return f;
      const images = [...f.images];
      [images[i], images[j]] = [images[j], images[i]];
      return { ...f, images: images.map((img, idx) => ({ ...img, sortOrder: idx })) };
    });
    setDirty(true);
  };

  const removeImage = (i: number) => {
    setForm((f) => {
      const removed = f.images[i];
      const images = f.images.filter((_, idx) => idx !== i).map((img, idx) => ({ ...img, sortOrder: idx }));
      if (images.length && !images.some((img) => img.isMain)) images[0] = { ...images[0], isMain: true };
      const imageUrl = removed.url === f.imageUrl ? images.find((img) => img.isMain)?.url || "" : f.imageUrl;
      return { ...f, images, imageUrl };
    });
    setDirty(true);
  };

  // ── Save (same sequence as the classic editor) ─────────────────────────────
  const buildPayload = () => {
    const name = form.name.trim();
    if (!name) throw new Error("Please enter a product name");
    if (!form.categoryId) throw new Error("Please choose a category");

    const skus = new Set<string>();
    const variants = form.variants.map((v, i) => {
      const n = i + 1;
      const price = Number(v.price);
      const stock = Number(v.stockQuantity);
      if (hasSize && !v.size) throw new Error(`Row ${n}: choose a size`);
      if (hasColor && !v.color) throw new Error(`Row ${n}: enter a colour`);
      if (!Number.isFinite(price) || price <= 0) throw new Error(`Row ${n}: MRP must be more than 0`);
      if (v.discountPrice !== "") {
        const sp = Number(v.discountPrice);
        if (!Number.isFinite(sp) || sp <= 0) throw new Error(`Row ${n}: selling price must be more than 0`);
        if (sp > price) throw new Error(`Row ${n}: selling price can't be more than MRP`);
      }
      if (v.stockQuantity === "" || !Number.isFinite(stock) || stock < 0) throw new Error(`Row ${n}: enter stock (0 or more)`);
      const sku = (v.sku || autoSku(name, v, i)).trim();
      if (skus.has(sku.toUpperCase())) throw new Error(`Row ${n}: SKU "${sku}" is used twice`);
      skus.add(sku.toUpperCase());
      return {
        weight: hasWeight ? v.weight || null : null,
        size: hasSize ? v.size || null : null,
        color: hasColor ? v.color || null : null,
        colorHex: hasColor ? v.colorHex || null : null,
        colorImageUrl: hasColor ? v.colorImageUrl || null : null,
        price,
        discountPrice: v.discountPrice === "" ? null : Number(v.discountPrice),
        stockQuantity: stock,
        sku,
        images: (v.images || []).map((img, idx) => ({ url: img.url, altText: img.altText || null, sortOrder: img.sortOrder ?? idx })),
      };
    });
    if (!variants.length) throw new Error("Add at least one size/price row");

    const fee = (v: string) => (form.customShipping && v !== "" && !isNaN(Number(v)) ? Number(v) : null);
    return {
      product: {
        name,
        slug: slugify(form.slug || name),
        productCode: form.productCode.trim() || null,
        description: form.description || null,
        imageUrl: form.imageUrl.trim() || form.images.find((i) => i.isMain)?.url || form.images[0]?.url || null,
        isActive: form.isActive,
        productType: form.productType,
        categoryId: Number(form.categoryId),
        subCategoryId: form.subCategoryId ? Number(form.subCategoryId) : null,
        shippingFeeMumbai: fee(form.shippingFeeMumbai),
        shippingFeeOutside: fee(form.shippingFeeOutside),
        shortDescriptionHtml: form.shortDescriptionHtml || null,
        apContentHtml: form.apContentHtml || null,
        apContentImageUrl: form.apContentImageUrl || null,
        apContentVideoUrl: form.apContentVideoUrl || null,
        tagIds: form.tagIds,
        images: form.images.map((img, idx) => ({ url: img.url, altText: img.altText || null, sortOrder: idx, isMain: !!img.isMain })),
      },
      variants,
    };
  };

  const syncGroup = async (productId: number) => {
    let target = groupId === "__new" ? "" : groupId;
    if (groupId === "__new" && newGroupName.trim()) {
      const created = await api("/admin/design-groups", { method: "POST", body: { name: newGroupName.trim(), description: null } });
      target = String(created?.data?.id || "");
    }
    if (target) {
      await api(`/admin/design-groups/${target}/members`, {
        method: "POST",
        body: { productId, color: groupColor.trim() || "Default", colorHex: groupHex.trim() || null, imageUrl: groupImage.trim() || form.imageUrl || null },
      });
    }
    if (originalGroupId && originalGroupId !== target) {
      await api(`/admin/design-groups/${originalGroupId}/members/${productId}`, { method: "DELETE" }).catch(() => undefined);
    }
  };

  const save = async () => {
    setError(null);
    let payload: ReturnType<typeof buildPayload>;
    try {
      payload = buildPayload();
    } catch (e: any) {
      setError(e.message);
      return;
    }
    setSaving(true);
    try {
      let productId = Number(id);
      if (editing) {
        await api(`/products/${productId}`, { method: "PUT", body: payload.product });
        const existing = listFrom<{ id: number }>(await api(`/products/${productId}/variants`));
        const keep = new Set<number>();
        for (let i = 0; i < form.variants.length; i++) {
          const row = form.variants[i];
          if (row.id) {
            await api(`/products/${productId}/variants/${row.id}`, { method: "PUT", body: payload.variants[i] });
            keep.add(row.id);
          } else {
            await api(`/products/${productId}/variants`, { method: "POST", body: payload.variants[i] });
          }
        }
        for (const v of existing) if (!keep.has(v.id)) await api(`/products/variants/${v.id}`, { method: "DELETE" }).catch(() => undefined);
      } else {
        const created = await api("/products", { method: "POST", body: { ...payload.product, variants: payload.variants } });
        productId = created?.data?.id;
        if (!productId) throw new Error("The product was not created");
      }
      await syncGroup(productId);
      setDirty(false);
      setSavedAt(Date.now());
      if (!editing) navigate(`/products/${productId}/edit`, { replace: true });
      else {
        // Reload so new size rows get their ids
        const res = await api(`/products/${productId}`);
        setForm(fromApi(res.data));
        setOriginalGroupId(groupId === "__new" ? "" : groupId);
      }
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading product…" />;

  const mainImg = form.images.find((i) => i.isMain)?.url || form.imageUrl;
  const totalStock = form.variants.reduce((s, v) => s + (Number(v.stockQuantity) || 0), 0);

  return (
    <div className="pb-24">
      <Link to="/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800">
        <ArrowLeft className="h-4 w-4" /> Products
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-brand-900 sm:text-[28px]">
            {editing ? form.name || "Edit product" : copyFrom ? "Duplicate product" : "Add product"}
          </h1>
          {editing && <p className="mt-1 text-sm text-neutral-500">ID {id} · {totalStock} pieces in stock</p>}
        </div>
        {editing && (
          <div className="flex gap-2">
            <Link to={`/products/new?from=${id}`} className="btn-secondary">
              <Copy className="h-4 w-4" /> Duplicate
            </Link>
            {form.slug && (
              <a href={`${STORE_URL}/products/${form.slug}`} target="_blank" rel="noreferrer" className="btn-secondary">
                <ExternalLink className="h-4 w-4" /> View on store
              </a>
            )}
          </div>
        )}
      </div>

      {copyFrom && !editing && (
        <div className="card mb-4 border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          Copied from product {copyFrom}. Change the name, colour and photos, then save. It starts as <strong>hidden</strong> until you switch it live.
        </div>
      )}
      {error && <div className="mb-4"><ErrorNote message={error} /></div>}

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {/* ── Main column ── */}
        <div className="space-y-4 lg:col-span-2 lg:space-y-6">
          <Card title="Details">
            <div className="space-y-4">
              <Field label="Product name">
                <input className="input" value={form.name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mocha Brown Embroidered Farshi Suit Set" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Web address" hint={`khatooncollection.in/products/${slugify(form.slug || form.name) || "…"}`}>
                  <input className="input" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from name" />
                </Field>
                <Field label="Product code (optional)">
                  <input className="input" value={form.productCode} onChange={(e) => set("productCode", e.target.value)} placeholder="e.g. KC-1203" />
                </Field>
              </div>
              <div>
                <span className="label">Description</span>
                <div className="mt-1.5">
                  <RichText value={form.description} onChange={(v) => set("description", v)} placeholder="Fabric, work, what's included, fit, wash care…" />
                </div>
              </div>
            </div>
          </Card>

          <Card
            title={`Photos (${form.images.length})`}
            hint="First photo with the star is the main one. Large photos are resized automatically."
            action={
              <button type="button" className="btn-secondary" onClick={() => galleryInput.current?.click()} disabled={uploading > 0}>
                {uploading > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}
              </button>
            }
          >
            <input ref={galleryInput} type="file" accept="image/*" multiple hidden onChange={(e) => { uploadGallery(e.target.files); e.target.value = ""; }} />
            {form.images.length === 0 ? (
              <button
                type="button"
                onClick={() => galleryInput.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); uploadGallery(e.dataTransfer.files); }}
                className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-line py-10 text-sm text-neutral-500 hover:border-brand-200 hover:bg-brand-50/40"
              >
                <ImagePlus className="mb-2 h-6 w-6 text-brand-200" />
                Drop photos here or click to upload
              </button>
            ) : (
              <div
                className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); uploadGallery(e.dataTransfer.files); }}
              >
                {form.images.map((img, i) => (
                  <div key={img.url + i} className={`group relative overflow-hidden rounded-xl border-2 ${img.isMain ? "border-rose-brand" : "border-transparent"}`}>
                    <div className="aspect-[3/4] bg-brand-50">
                      {usableImage(img.url) ? <img src={img.url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-red-500">Broken</div>}
                    </div>
                    {img.isMain && <span className="absolute left-1.5 top-1.5 rounded-full bg-rose-brand px-2 py-0.5 text-[10px] font-bold text-white">MAIN</span>}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <div className="flex gap-1">
                        <button type="button" title="Move left" onClick={() => moveImage(i, -1)} className="rounded bg-white/90 p-1"><ChevronLeft className="h-3.5 w-3.5" /></button>
                        <button type="button" title="Move right" onClick={() => moveImage(i, 1)} className="rounded bg-white/90 p-1"><ChevronRight className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="flex gap-1">
                        {!img.isMain && <button type="button" title="Make main photo" onClick={() => setMain(i)} className="rounded bg-white/90 p-1"><Star className="h-3.5 w-3.5" /></button>}
                        <button type="button" title="Remove" onClick={() => removeImage(i)} className="rounded bg-white/90 p-1 text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Sizes, prices & stock"
            hint="MRP is the crossed-out price. Selling price is what the customer pays."
            action={
              <select className="input w-auto" value={form.productType} onChange={(e) => set("productType", e.target.value as ProductType)}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            }
          >
            {hasSize && (
              <div className="mb-4">
                <div className="mb-1.5 text-xs text-neutral-500">Quick add sizes (copies the last row's price{hasColor ? " and colour" : ""}):</div>
                <div className="flex flex-wrap gap-1.5">
                  {SIZES.map((s) => {
                    const present = form.variants.some((v) => v.size === s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addSize(s)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${present ? "border-brand-800 bg-brand-800 text-white" : "border-line bg-white hover:border-brand-500"}`}
                      >
                        {present && <Check className="mr-1 inline h-3 w-3" />}{s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    {hasSize && <th className="pb-2 pr-2">Size</th>}
                    {hasColor && <th className="pb-2 pr-2">Colour</th>}
                    {hasWeight && <th className="pb-2 pr-2">Weight</th>}
                    <th className="pb-2 pr-2">MRP ₹</th>
                    <th className="pb-2 pr-2">Selling ₹</th>
                    <th className="pb-2 pr-2">Stock</th>
                    <th className="pb-2 pr-2">SKU</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {form.variants.map((v, i) => (
                    <tr key={v.id ?? `new-${i}`} className="border-t border-line">
                      {hasSize && (
                        <td className="py-2 pr-2">
                          <input className="input w-24" list="kc-sizes" value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} placeholder="M" />
                        </td>
                      )}
                      {hasColor && (
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-1.5">
                            <input type="color" className="h-9 w-9 flex-none cursor-pointer rounded border border-line" value={v.colorHex || "#cccccc"} onChange={(e) => updateVariant(i, "colorHex", e.target.value)} title="Colour swatch" />
                            <input className="input w-28" value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} placeholder="Maroon" />
                          </div>
                        </td>
                      )}
                      {hasWeight && (
                        <td className="py-2 pr-2">
                          <input className="input w-24" value={v.weight} onChange={(e) => updateVariant(i, "weight", e.target.value)} placeholder="500g" />
                        </td>
                      )}
                      <td className="py-2 pr-2"><input className="input w-24" inputMode="decimal" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} placeholder="2499" /></td>
                      <td className="py-2 pr-2">
                        <input className="input w-24" inputMode="decimal" value={v.discountPrice} onChange={(e) => updateVariant(i, "discountPrice", e.target.value)} placeholder="1699" />
                        {Number(v.price) > 0 && Number(v.discountPrice) > 0 && Number(v.discountPrice) < Number(v.price) && (
                          <div className="mt-0.5 text-[11px] font-semibold text-emerald-600">{Math.round((1 - Number(v.discountPrice) / Number(v.price)) * 100)}% off</div>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        <input className={`input w-20 ${v.stockQuantity === "0" ? "border-red-300 bg-red-50" : ""}`} inputMode="numeric" value={v.stockQuantity} onChange={(e) => updateVariant(i, "stockQuantity", e.target.value)} placeholder="5" />
                      </td>
                      <td className="py-2 pr-2"><input className="input w-44 font-mono text-xs" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} /></td>
                      <td className="py-2 text-right">
                        <button type="button" onClick={() => removeVariant(i)} className="btn-ghost px-2 text-neutral-400 hover:text-red-600" title="Remove row">
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <datalist id="kc-sizes">{SIZES.map((s) => <option key={s} value={s} />)}</datalist>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" className="btn-secondary" onClick={() => addVariant()}>
                <Plus className="h-4 w-4" /> Add row
              </button>
              {form.variants.length > 1 && (
                <>
                  <span className="ml-1 text-xs text-neutral-400">Copy first row's value to all rows:</span>
                  <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => applyToAll("price")}>MRP</button>
                  <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => applyToAll("discountPrice")}>Selling price</button>
                  <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => applyToAll("stockQuantity")}>Stock</button>
                </>
              )}
            </div>
          </Card>

          <Card title="Highlights (optional)" hint="Short points shown near the price on the product page.">
            <RichText value={form.shortDescriptionHtml} onChange={(v) => set("shortDescriptionHtml", v)} placeholder="• Pure cotton • Hand embroidered neckline • 3-piece set" />
          </Card>
        </div>

        {/* ── Side column ── */}
        <div className="space-y-4 lg:space-y-6">
          <Card title="Visibility">
            <button type="button" onClick={() => set("isActive", !form.isActive)} className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left">
              <div>
                <div className="font-medium">{form.isActive ? "Live on the store" : "Hidden"}</div>
                <div className="text-xs text-neutral-500">{form.isActive ? "Customers can see and buy it" : "Only visible here"}</div>
              </div>
              <span className={`relative h-6 w-11 flex-none rounded-full transition ${form.isActive ? "bg-emerald-500" : "bg-neutral-300"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${form.isActive ? "left-[22px]" : "left-0.5"}`} />
              </span>
            </button>
            {mainImg && (
              <div className="mt-4 flex items-center gap-3">
                <img src={mainImg} alt="" className="h-16 w-12 rounded-lg object-cover ring-1 ring-line" />
                <div className="text-xs text-neutral-500">Main photo shown on the store and in orders</div>
              </div>
            )}
          </Card>

          <Card title="Category">
            <div className="space-y-4">
              <Field label="Category">
                <select className="input" value={form.categoryId} onChange={(e) => { set("categoryId", e.target.value); set("subCategoryId", ""); }}>
                  <option value="">Choose…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              {subOptions.length > 0 && (
                <Field label="Sub-category (optional)">
                  <select className="input" value={form.subCategoryId} onChange={(e) => set("subCategoryId", e.target.value)}>
                    <option value="">None</option>
                    {subOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
              )}
              {tags.length > 0 && (
                <div>
                  <span className="label">Tags</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {tags.map((t) => {
                      const on = form.tagIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => set("tagIds", on ? form.tagIds.filter((x) => x !== t.id) : [...form.tagIds, t.id])}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${on ? "border-brand-800 bg-brand-800 text-white" : "border-line hover:border-brand-500"}`}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Other colours of this design" hint="Links colour versions so shoppers can switch colours on the product page.">
            <div className="space-y-3">
              <select className="input" value={groupId} onChange={(e) => { setGroupId(e.target.value); setDirty(true); }}>
                <option value="">Not linked</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                <option value="__new">+ New colour group…</option>
              </select>
              {groupId === "__new" && <input className="input" placeholder="Group name, e.g. Farshi Suit Set" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />}
              {groupId && (
                <div className="flex items-center gap-2">
                  <input type="color" className="h-9 w-9 flex-none cursor-pointer rounded border border-line" value={groupHex || "#cccccc"} onChange={(e) => { setGroupHex(e.target.value); setDirty(true); }} />
                  <input className="input" placeholder="This product's colour, e.g. Maroon" value={groupColor} onChange={(e) => { setGroupColor(e.target.value); setDirty(true); }} />
                </div>
              )}
            </div>
          </Card>

          <Card title="Shipping fee">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.customShipping} onChange={(e) => set("customShipping", e.target.checked)} />
              Use a special shipping fee for this product
            </label>
            {form.customShipping && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Mumbai ₹"><input className="input" inputMode="decimal" value={form.shippingFeeMumbai} onChange={(e) => set("shippingFeeMumbai", e.target.value)} /></Field>
                <Field label="Outside ₹"><input className="input" inputMode="decimal" value={form.shippingFeeOutside} onChange={(e) => set("shippingFeeOutside", e.target.value)} /></Field>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <div className="text-sm text-neutral-500">
            {saving ? "Saving…" : dirty ? "Unsaved changes" : savedAt ? <span className="text-emerald-600">✓ Saved</span> : editing ? "No changes" : "New product"}
          </div>
          <div className="flex gap-2">
            <Link to="/products" className="btn-secondary">Cancel</Link>
            <button type="button" className="btn-primary min-w-[120px]" onClick={save} disabled={saving || uploading > 0}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editing ? "Save changes" : "Create product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
