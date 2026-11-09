import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Mail, ShoppingCart, CheckCircle2, Info } from "lucide-react";
import { api, STORE_URL } from "../lib/api";
import { useOrders, customerName, customerPhone, customerEmail, type Order } from "../lib/orders";
import { inr, orderNo, timeAgo, waLink, dateTime, istDayStart } from "../lib/format";
import { Badge, Empty, PageHeader, Spinner, Tabs, Thumb } from "../components/ui";

type Prospect = {
  id: number;
  customerName?: string;
  guestPhone?: string;
  customerEmail?: string;
  shippingCity?: string;
  cartItems: { name: string; quantity: number; price: number; image?: string | null }[];
  totalAmount: number;
  orderDate: string;
  status: string;
};

type Row = {
  key: string;
  source: "payment" | "checkout";
  name: string;
  phone: string | null;
  email: string | null;
  city?: string | null;
  items: { name: string; qty: number; image?: string | null }[];
  value: number;
  at: string;
  recovered: boolean;
  order?: Order;
};

type View = "open" | "recovered" | "all";

function recoveryMessage(r: Row): string {
  const first = r.name.split(" ")[0] || "there";
  const what = r.items.length ? r.items[0].name + (r.items.length > 1 ? ` and ${r.items.length - 1} more` : "") : "your selection";
  return `Hi ${first}, this is Khatoon Collection. We noticed you were checking out ${what} but the order wasn't completed. Can we help you place it? Your size may sell out soon. Shop here: ${STORE_URL}`;
}

export default function Abandoned() {
  const { orders, loading } = useOrders();
  const [prospects, setProspects] = useState<Prospect[] | null>(null);
  const [prospectsError, setProspectsError] = useState(false);
  const [view, setView] = useState<View>("open");
  const [days, setDays] = useState(30);

  useEffect(() => {
    api<{ prospects: Prospect[] }>("/api/prospects?limit=500", { base: STORE_URL })
      .then((r) => setProspects(r.prospects || []))
      .catch(() => setProspectsError(true));
  }, []);

  const rows = useMemo(() => {
    const paid = orders.filter((o) => o.paymentStatus === "Paid");
    const boughtLater = (phone: string | null, email: string | null, at: string) =>
      paid.some(
        (p) =>
          new Date(p.orderDate) > new Date(at) &&
          ((phone && customerPhone(p)?.replace(/\D/g, "").endsWith(phone.replace(/\D/g, "").slice(-10))) ||
            (email && customerEmail(p)?.toLowerCase() === email.toLowerCase()))
      );

    const fromOrders: Row[] = orders
      .filter((o) => o.paymentStatus !== "Paid")
      .map((o) => {
        const phone = customerPhone(o);
        const email = customerEmail(o);
        return {
          key: `o${o.id}`,
          source: "payment" as const,
          name: customerName(o),
          phone,
          email,
          city: o.shippingCity,
          items: o.orderItems.map((i) => ({ name: i.productName, qty: i.quantity, image: i.imageUrl })),
          value: Number(o.totalAmount),
          at: o.orderDate,
          recovered: boughtLater(phone, email, o.orderDate),
          order: o,
        };
      });

    const fromProspects: Row[] = (prospects || [])
      .filter((p) => p.status !== "completed")
      .map((p) => ({
        key: `p${p.id}`,
        source: "checkout" as const,
        name: p.customerName || "Visitor",
        phone: p.guestPhone || null,
        email: p.customerEmail || null,
        city: p.shippingCity,
        items: (p.cartItems || []).map((i) => ({ name: i.name, qty: i.quantity, image: i.image })),
        value: Number(p.totalAmount) || 0,
        at: p.orderDate,
        recovered: boughtLater(p.guestPhone || null, p.customerEmail || null, p.orderDate),
      }));

    const from = istDayStart(-(days - 1));
    return [...fromOrders, ...fromProspects]
      .filter((r) => new Date(r.at).getTime() >= from)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [orders, prospects, days]);

  const shown = rows.filter((r) => (view === "all" ? true : view === "recovered" ? r.recovered : !r.recovered));
  const openValue = rows.filter((r) => !r.recovered).reduce((s, r) => s + r.value, 0);
  const recoveredCount = rows.filter((r) => r.recovered).length;

  if (loading) return <Spinner />;

  return (
    <>
      <PageHeader
        title="Abandoned checkouts"
        subtitle="Shoppers who started checkout but didn't pay. A quick WhatsApp often brings them back."
        actions={
          <select className="input w-auto" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-sm text-neutral-500">Not recovered</div>
          <div className="mt-1 text-2xl font-bold">{rows.length - recoveredCount}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-neutral-500">Value left in carts</div>
          <div className="mt-1 text-2xl font-bold text-rose-brand">{inr(openValue)}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-neutral-500">Came back and bought</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">
            {recoveredCount}
            <span className="ml-2 text-sm font-medium text-neutral-400">{rows.length ? Math.round((recoveredCount / rows.length) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      {prospectsError && (
        <div className="card mb-4 flex gap-3 border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info className="mt-0.5 h-4 w-4 flex-none" />
          Showing unpaid payment attempts only. Carts from customers who filled the checkout form but never clicked Pay will appear here once checkout capture is switched on.
        </div>
      )}

      <div className="mb-4">
        <Tabs<View>
          value={view}
          onChange={setView}
          options={[
            { value: "open", label: "To follow up", count: rows.length - recoveredCount },
            { value: "recovered", label: "Recovered", count: recoveredCount },
            { value: "all", label: "All", count: rows.length },
          ]}
        />
      </div>

      <div className="card divide-y divide-line">
        {shown.length === 0 && <Empty icon={<ShoppingCart className="h-8 w-8" />} title="Nothing to follow up" text="No abandoned checkouts in this period." />}
        {shown.map((r) => {
          const wa = waLink(r.phone, recoveryMessage(r));
          return (
            <div key={r.key} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <Thumb src={r.items[0]?.image} alt={r.items[0]?.name || ""} size={44} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{r.name}</span>
                    {r.recovered ? (
                      <Badge tone="green"><CheckCircle2 className="mr-1 h-3 w-3" />Bought later</Badge>
                    ) : r.source === "payment" ? (
                      <Badge tone="amber">Payment not completed</Badge>
                    ) : (
                      <Badge tone="violet">Left at checkout form</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-sm text-neutral-600">
                    {r.items.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(", ") || "Cart details not captured"}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-500" title={dateTime(r.at)}>
                    {timeAgo(r.at)} · {[r.city, r.phone, r.email].filter(Boolean).join(" · ")}
                    {r.order && (
                      <>
                        {" · "}
                        <Link to={`/orders/${r.order.id}`} className="underline">{orderNo(r.order.id)}</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:flex-none">
                <div className="mr-2 text-right font-bold">{inr(r.value)}</div>
                {wa && (
                  <a href={wa} target="_blank" rel="noreferrer" className="btn border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
                {r.email && (
                  <a
                    href={`mailto:${r.email}?subject=${encodeURIComponent("Your Khatoon Collection cart is waiting")}&body=${encodeURIComponent(recoveryMessage(r))}`}
                    className="btn-secondary"
                    title="Email"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
