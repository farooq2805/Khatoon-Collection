import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Download, Search, ShoppingBag, RefreshCw } from "lucide-react";
import { useOrders, customerName, customerPhone, customerEmail, type Order } from "../lib/orders";
import { dateTime, inr, istDayStart, orderNo, timeAgo } from "../lib/format";
import { Empty, ErrorNote, PageHeader, Spinner, StatusBadge, Tabs, Thumb } from "../components/ui";

type Tab = "all" | "Confirmed" | "unpaid" | "Shipped" | "Delivered" | "Cancelled";
type Period = "7" | "30" | "90" | "all";

const TAB_FILTERS: Record<Tab, (o: Order) => boolean> = {
  all: () => true,
  Confirmed: (o) => o.paymentStatus === "Paid" && o.status === "Confirmed",
  unpaid: (o) => o.paymentStatus !== "Paid" && o.status !== "Cancelled",
  Shipped: (o) => o.status === "Shipped",
  Delivered: (o) => o.status === "Delivered",
  Cancelled: (o) => o.status === "Cancelled",
};

function toCsv(rows: Order[]): string {
  const head = ["Order", "Date", "Customer", "Phone", "Email", "City", "Pincode", "Items", "Payment", "Status", "Total"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((o) =>
    [
      orderNo(o.id),
      dateTime(o.orderDate),
      customerName(o),
      customerPhone(o),
      customerEmail(o),
      o.shippingCity,
      o.shippingPostalCode,
      o.orderItems.map((i) => `${i.productName}${i.variantLabel ? ` (${i.variantLabel})` : ""} x${i.quantity}`).join("; "),
      o.paymentStatus,
      o.status,
      Number(o.totalAmount),
    ]
      .map(esc)
      .join(",")
  );
  return [head.map(esc).join(","), ...lines].join("\n");
}

export default function Orders() {
  const { orders, loading, error, refresh } = useOrders();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "all";
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState<Period>("30");
  const [refreshing, setRefreshing] = useState(false);

  const inPeriod = useMemo(() => {
    if (period === "all") return orders;
    const from = istDayStart(-(Number(period) - 1));
    return orders.filter((o) => new Date(o.orderDate).getTime() >= from);
  }, [orders, period]);

  const counts = useMemo(
    () => Object.fromEntries(Object.entries(TAB_FILTERS).map(([k, f]) => [k, inPeriod.filter(f).length])) as Record<Tab, number>,
    [inPeriod]
  );

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/^#?ord-0*/, "");
    return inPeriod.filter(TAB_FILTERS[tab]).filter((o) => {
      if (!needle) return true;
      return [String(o.id), customerName(o), customerPhone(o), customerEmail(o), o.shippingCity, ...o.orderItems.map((i) => i.productName)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle));
    });
  }, [inPeriod, tab, q]);

  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `khatoon-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading) return <Spinner label="Loading orders…" />;

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={`${rows.length} order${rows.length === 1 ? "" : "s"} · ${inr(rows.reduce((s, o) => s + (o.paymentStatus === "Paid" ? Number(o.totalAmount) : 0), 0))} paid`}
        actions={
          <>
            <button
              className="btn-secondary"
              onClick={async () => {
                setRefreshing(true);
                await refresh();
                setRefreshing(false);
              }}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button className="btn-secondary" onClick={exportCsv} disabled={!rows.length}>
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </>
        }
      />
      {error && <div className="mb-4"><ErrorNote message={error} /></div>}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs<Tab>
          value={tab}
          onChange={(t) => setParams(t === "all" ? {} : { tab: t })}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "Confirmed", label: "To ship", count: counts.Confirmed },
            { value: "unpaid", label: "Unpaid", count: counts.unpaid },
            { value: "Shipped", label: "Shipped", count: counts.Shipped },
            { value: "Delivered", label: "Delivered", count: counts.Delivered },
            { value: "Cancelled", label: "Cancelled", count: counts.Cancelled },
          ]}
        />
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input className="input pl-9" placeholder="Order no., name, phone, product…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input w-auto" value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <Empty icon={<ShoppingBag className="h-8 w-8" />} title="No orders here" text="Try another tab, period or search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="table-head">
                <tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Status</th><th className="!text-right">Total</th></tr>
              </thead>
              <tbody>
                {rows.slice(0, 300).map((o) => (
                  <tr key={o.id} className="table-row cursor-pointer hover:bg-brand-50/40" onClick={() => navigate(`/orders/${o.id}`)}>
                    <td>
                      <div className="font-semibold">{orderNo(o.id)}</div>
                      <div className="text-xs text-neutral-500" title={dateTime(o.orderDate)}>{timeAgo(o.orderDate)}</div>
                    </td>
                    <td>
                      <div className="max-w-[200px] truncate font-medium">{customerName(o)}</div>
                      <div className="text-xs text-neutral-500">{[o.shippingCity, customerPhone(o)].filter(Boolean).join(" · ")}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Thumb src={o.orderItems[0]?.imageUrl} alt={o.orderItems[0]?.productName || ""} size={30} />
                        <div className="min-w-0">
                          <div className="max-w-[220px] truncate">{o.orderItems[0]?.productName}</div>
                          <div className="text-xs text-neutral-500">
                            {o.orderItems.reduce((s, i) => s + i.quantity, 0)} item{o.orderItems.reduce((s, i) => s + i.quantity, 0) === 1 ? "" : "s"}
                          </div>
                        </div>
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
        )}
        {rows.length > 300 && <div className="border-t border-line px-4 py-3 text-center text-xs text-neutral-500">Showing 300 of {rows.length}. Narrow the period or search to see more.</div>}
      </div>
    </>
  );
}
