import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, MessageCircle, Search, Users } from "lucide-react";
import { useOrders, customerName, customerPhone, customerEmail } from "../lib/orders";
import { dateShort, inr, orderNo, waLink } from "../lib/format";
import { Badge, Empty, PageHeader, Spinner, Tabs } from "../components/ui";

type Customer = {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  orders: number;
  spent: number;
  first: string;
  last: string;
  lastOrderId: number;
  registered: boolean;
};

type Segment = "all" | "repeat" | "vip" | "lapsed";

export default function Customers() {
  const { orders, loading } = useOrders();
  const [q, setQ] = useState("");
  const [segment, setSegment] = useState<Segment>("all");

  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const o of orders) {
      if (o.paymentStatus !== "Paid" || o.status === "Cancelled") continue;
      const phone = customerPhone(o);
      const email = customerEmail(o);
      const key = (phone ? phone.replace(/\D/g, "").slice(-10) : "") || email?.toLowerCase() || `order-${o.id}`;
      const c = map.get(key) || {
        key,
        name: customerName(o),
        phone,
        email,
        city: o.shippingCity || null,
        orders: 0,
        spent: 0,
        first: o.orderDate,
        last: o.orderDate,
        lastOrderId: o.id,
        registered: !!o.user,
      };
      c.orders += 1;
      c.spent += Number(o.totalAmount) || 0;
      if (new Date(o.orderDate) < new Date(c.first)) c.first = o.orderDate;
      if (new Date(o.orderDate) >= new Date(c.last)) {
        c.last = o.orderDate;
        c.lastOrderId = o.id;
        c.name = customerName(o);
        c.city = o.shippingCity || c.city;
      }
      c.email ||= email;
      c.phone ||= phone;
      c.registered ||= !!o.user;
      map.set(key, c);
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  const vipThreshold = useMemo(() => {
    const sorted = customers.map((c) => c.spent).sort((a, b) => b - a);
    return sorted[Math.max(0, Math.floor(sorted.length * 0.1) - 1)] || Infinity;
  }, [customers]);

  const SEGMENTS: Record<Segment, (c: Customer) => boolean> = {
    all: () => true,
    repeat: (c) => c.orders > 1,
    vip: (c) => c.spent >= vipThreshold,
    lapsed: (c) => Date.now() - new Date(c.last).getTime() > 60 * 86400e3,
  };

  const rows = customers.filter(SEGMENTS[segment]).filter((c) => {
    const n = q.trim().toLowerCase();
    return !n || [c.name, c.phone, c.email, c.city].some((v) => v && v.toLowerCase().includes(n));
  });

  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      ["Name", "Phone", "Email", "City", "Orders", "Total spent", "First order", "Last order"].map(esc).join(","),
      ...rows.map((c) => [c.name, c.phone, c.email, c.city, c.orders, Math.round(c.spent), dateShort(c.first), dateShort(c.last)].map(esc).join(",")),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `khatoon-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) return <Spinner />;
  const repeatRate = customers.length ? Math.round((customers.filter((c) => c.orders > 1).length / customers.length) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} paying customers · ${repeatRate}% have ordered more than once`}
        actions={
          <button className="btn-secondary" onClick={exportCsv} disabled={!rows.length}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs<Segment>
          value={segment}
          onChange={setSegment}
          options={[
            { value: "all", label: "All", count: customers.length },
            { value: "repeat", label: "Repeat buyers", count: customers.filter(SEGMENTS.repeat).length },
            { value: "vip", label: "Top 10%", count: customers.filter(SEGMENTS.vip).length },
            { value: "lapsed", label: "No order in 60 days", count: customers.filter(SEGMENTS.lapsed).length },
          ]}
        />
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input className="input pl-9" placeholder="Name, phone, email, city…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <Empty icon={<Users className="h-8 w-8" />} title="No customers match" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="table-head">
                <tr><th>Customer</th><th>Contact</th><th className="!text-center">Orders</th><th className="!text-right">Total spent</th><th>Last order</th><th /></tr>
              </thead>
              <tbody>
                {rows.slice(0, 300).map((c) => {
                  const wa = waLink(c.phone, `Hi ${c.name.split(" ")[0]}, this is Khatoon Collection. `);
                  return (
                    <tr key={c.key} className="table-row">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                            {c.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{c.name}</div>
                            <div className="flex gap-1 text-xs text-neutral-500">
                              {c.city}
                              {c.spent >= vipThreshold && <Badge tone="violet">Top 10%</Badge>}
                              {c.registered && <Badge tone="blue">Account</Badge>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-neutral-600">
                        <div>{c.phone || "—"}</div>
                        <div className="max-w-[220px] truncate text-xs text-neutral-500">{c.email}</div>
                      </td>
                      <td className="text-center font-semibold">{c.orders}</td>
                      <td className="text-right font-semibold">{inr(c.spent)}</td>
                      <td>
                        <Link to={`/orders/${c.lastOrderId}`} className="text-sm hover:underline">{orderNo(c.lastOrderId)}</Link>
                        <div className="text-xs text-neutral-500">{dateShort(c.last)}</div>
                      </td>
                      <td className="text-right">
                        {wa && (
                          <a href={wa} target="_blank" rel="noreferrer" className="btn-ghost px-2" title="WhatsApp">
                            <MessageCircle className="h-4 w-4 text-emerald-600" />
                          </a>
                        )}
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
