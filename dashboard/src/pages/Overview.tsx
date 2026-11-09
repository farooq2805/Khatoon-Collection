import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, PackageCheck, ShoppingCart, Star, AlertTriangle, ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import { useOrders, isPaid, customerName, type Order } from "../lib/orders";
import { inr, istDayStart, orderNo, pctChange, timeAgo } from "../lib/format";
import { PageHeader, Spinner, StatusBadge, Tabs, Thumb, ErrorNote } from "../components/ui";

type Range = "today" | "7d" | "30d";
const RANGE_DAYS: Record<Range, number> = { today: 1, "7d": 7, "30d": 30 };

function inWindow(o: Order, from: number, to: number) {
  const t = new Date(o.orderDate).getTime();
  return t >= from && t < to;
}

function Kpi({ label, value, change, hint }: { label: string; value: string; change: number | null; hint: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-2 text-[26px] font-bold tracking-tight text-neutral-900">{value}</div>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        {change === null ? (
          <span className="text-neutral-400">No sales in previous period</span>
        ) : (
          <>
            <span className={`inline-flex items-center gap-0.5 font-semibold ${change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(change)}%
            </span>
            <span className="text-neutral-400">{hint}</span>
          </>
        )}
      </div>
    </div>
  );
}

function ActionCard({ to, icon, tone, title, count, text }: { to: string; icon: ReactNode; tone: string; title: string; count: number; text: string }) {
  const external = to.startsWith("http");
  const body = (
    <div className="card flex items-center gap-4 p-4 transition hover:border-brand-200 hover:shadow-sm">
      <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${tone}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold">{count}</span>
          <span className="text-sm font-medium text-neutral-800">{title}</span>
        </div>
        <div className="truncate text-xs text-neutral-500">{text}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-neutral-300" />
    </div>
  );
  return external ? <a href={to}>{body}</a> : <Link to={to}>{body}</Link>;
}

export default function Overview() {
  const { orders, loading, error } = useOrders();
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("7d");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api("/admin/dashboard/stats").then((r) => setStats(r.data)).catch(() => setStats(null));
  }, []);

  const m = useMemo(() => {
    const days = RANGE_DAYS[range];
    const to = Date.now();
    const from = istDayStart(-(days - 1));
    const prevFrom = istDayStart(-(2 * days - 1));
    const prevTo = range === "today" ? istDayStart(-1) + (to - istDayStart(0)) : from; // today vs same time yesterday

    const paid = orders.filter(isPaid);
    const cur = paid.filter((o) => inWindow(o, from, to));
    const prev = paid.filter((o) => inWindow(o, prevFrom, prevTo));
    const rev = (l: Order[]) => l.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
    const units = (l: Order[]) => l.reduce((s, o) => s + o.orderItems.reduce((a, i) => a + Number(i.quantity || 0), 0), 0);

    const started = orders.filter((o) => inWindow(o, from, to)).length;
    const conversion = started ? Math.round((cur.length / started) * 100) : 0;

    // 30-day daily revenue chart
    const chart = Array.from({ length: 30 }, (_, i) => {
      const s = istDayStart(i - 29);
      const e = istDayStart(i - 28);
      const dayOrders = paid.filter((o) => inWindow(o, s, e));
      return {
        day: new Date(s + 5.5 * 3600e3).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }),
        revenue: Math.round(rev(dayOrders)),
        orders: dayOrders.length,
      };
    });

    // Best sellers in the selected range
    const byProduct = new Map<string, { qty: number; revenue: number; image?: string | null }>();
    for (const o of cur)
      for (const it of o.orderItems) {
        const p = byProduct.get(it.productName) || { qty: 0, revenue: 0, image: it.imageUrl };
        p.qty += Number(it.quantity || 0);
        p.revenue += Number(it.quantity || 0) * Number(it.unitPrice || 0);
        byProduct.set(it.productName, p);
      }
    const top = [...byProduct.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);

    return {
      revenue: rev(cur),
      revenueChange: pctChange(rev(cur), rev(prev)),
      orders: cur.length,
      ordersChange: pctChange(cur.length, prev.length),
      aov: cur.length ? rev(cur) / cur.length : 0,
      aovChange: pctChange(cur.length ? rev(cur) / cur.length : 0, prev.length ? rev(prev) / prev.length : 0),
      units: units(cur),
      conversion,
      chart,
      top,
      toShip: orders.filter((o) => o.paymentStatus === "Paid" && o.status === "Confirmed"),
      unpaid: orders.filter((o) => o.status !== "Cancelled" && o.paymentStatus !== "Paid" && Date.now() - new Date(o.orderDate).getTime() < 7 * 86400e3),
      recent: orders.slice(0, 8),
    };
  }, [orders, range]);

  if (loading) return <Spinner label="Loading your store…" />;

  const hint = range === "today" ? "vs. yesterday" : `vs. previous ${RANGE_DAYS[range]} days`;
  const hour = new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" });
  const greeting = Number(hour) < 12 ? "Good morning" : Number(hour) < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        title={greeting}
        subtitle="Here's how Khatoon Collection is doing."
        actions={
          <Tabs<Range>
            value={range}
            onChange={setRange}
            options={[
              { value: "today", label: "Today" },
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
            ]}
          />
        }
      />
      {error && <div className="mb-4"><ErrorNote message={error} /></div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi label="Revenue" value={inr(m.revenue)} change={m.revenueChange} hint={hint} />
        <Kpi label="Paid orders" value={String(m.orders)} change={m.ordersChange} hint={hint} />
        <Kpi label="Average order value" value={inr(m.aov)} change={m.aovChange} hint={hint} />
        <div className="card p-5">
          <div className="text-sm text-neutral-500">Checkout completion</div>
          <div className="mt-2 text-[26px] font-bold tracking-tight">{m.conversion}%</div>
          <div className="mt-2 text-xs text-neutral-400">{m.units} items sold · paid ÷ checkouts started</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:mt-6 lg:grid-cols-4 lg:gap-4">
        <ActionCard to="/orders?tab=Confirmed" icon={<PackageCheck className="h-5 w-5" />} tone="bg-sky-50 text-sky-600" title="to ship" count={m.toShip.length} text="Paid and confirmed, not shipped yet" />
        <ActionCard to="/abandoned" icon={<ShoppingCart className="h-5 w-5" />} tone="bg-amber-50 text-amber-600" title="unpaid checkouts" count={m.unpaid.length} text="Last 7 days · follow up on WhatsApp" />
        <ActionCard to="/products?stock=low" icon={<AlertTriangle className="h-5 w-5" />} tone="bg-red-50 text-red-600" title="stock alerts" count={(stats?.outOfStockVariants ?? 0) + (stats?.lowStockVariants ?? 0)} text={`${stats?.outOfStockVariants ?? 0} sold out · ${stats?.lowStockVariants ?? 0} running low`} />
        <ActionCard to={`${window.location.origin}/reviews`} icon={<Star className="h-5 w-5" />} tone="bg-violet-50 text-violet-600" title="reviews to approve" count={stats?.pendingReviews ?? 0} text="Approve to show on product pages" />
      </div>

      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-3 lg:gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Revenue · last 30 days</h2>
            <span className="text-sm text-neutral-500">{inr(m.chart.reduce((s, d) => s + d.revenue, 0))}</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={m.chart} margin={{ left: -12, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c2185b" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#c2185b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f0ebe7" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} tickFormatter={(v) => inr(v, { compact: true })} />
                <Tooltip
                  formatter={(v: number, k: string) => (k === "revenue" ? [inr(v), "Revenue"] : [v, "Orders"])}
                  contentStyle={{ borderRadius: 12, border: "1px solid #ebe6e2", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#c2185b" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold">Best sellers</h2>
          <p className="text-xs text-neutral-500">By revenue, {range === "today" ? "today" : `last ${RANGE_DAYS[range]} days`}</p>
          <div className="mt-4 space-y-3">
            {m.top.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">No sales in this period yet</p>}
            {m.top.map(([name, p], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-4 text-xs font-semibold text-neutral-400">{i + 1}</span>
                <Thumb src={p.image} alt={name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{name}</div>
                  <div className="text-xs text-neutral-500">{p.qty} sold</div>
                </div>
                <div className="text-sm font-semibold">{inr(p.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-4 overflow-hidden lg:mt-6">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold">Latest orders</h2>
          <Link to="/orders" className="text-sm font-semibold text-rose-brand hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="table-head">
              <tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Status</th><th className="!text-right">Total</th></tr>
            </thead>
            <tbody>
              {m.recent.map((o) => (
                <tr key={o.id} className="table-row cursor-pointer hover:bg-brand-50/40" onClick={() => navigate(`/orders/${o.id}`)}>
                  <td>
                    <div className="font-semibold">{orderNo(o.id)}</div>
                    <div className="text-xs text-neutral-500">{timeAgo(o.orderDate)}</div>
                  </td>
                  <td className="max-w-[180px] truncate">{customerName(o)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Thumb src={o.orderItems[0]?.imageUrl} alt={o.orderItems[0]?.productName || ""} size={28} />
                      <span className="max-w-[200px] truncate text-neutral-600">
                        {o.orderItems[0]?.productName}
                        {o.orderItems.length > 1 && ` +${o.orderItems.length - 1}`}
                      </span>
                    </div>
                  </td>
                  <td><StatusBadge status={o.paymentStatus} /></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="text-right font-semibold">{inr(o.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
