import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Mail, MessageCircle, Phone, Printer, Check, Loader2, Truck } from "lucide-react";
import { api } from "../lib/api";
import { useOrders, customerName, customerPhone, customerEmail, ORDER_STATUSES, type Order } from "../lib/orders";
import { dateTime, inr, orderNo, waLink } from "../lib/format";
import { Badge, ErrorNote, Spinner, StatusBadge, Thumb } from "../components/ui";

const NEXT_STEP: Record<string, { status: string; label: string } | undefined> = {
  Pending: { status: "Confirmed", label: "Confirm order" },
  Confirmed: { status: "Shipped", label: "Mark as shipped" },
  Shipped: { status: "Delivered", label: "Mark as delivered" },
};

function addressLines(o: Order): string[] {
  return [o.shippingAddress, [o.shippingCity, o.shippingPostalCode].filter(Boolean).join(" - "), o.shippingCountry].filter(Boolean) as string[];
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const { orders, loading, refresh } = useOrders();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (loading) return <Spinner />;
  const o = orders.find((x) => String(x.id) === id);
  if (!o) return <ErrorNote message="Order not found. It may be older than what's loaded; try refreshing." />;

  const phone = customerPhone(o);
  const email = customerEmail(o);
  const name = customerName(o);
  const itemsTotal = o.orderItems.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
  const next = o.paymentStatus === "Paid" ? NEXT_STEP[o.status] : undefined;
  const firstName = name.split(" ")[0];

  const setStatus = async (status: string) => {
    if (status === "Cancelled" && !window.confirm(`Cancel ${orderNo(o.id)}? The customer is not refunded automatically.`)) return;
    setBusy(status);
    setError(null);
    try {
      await api(`/orders/${o.id}/status`, { method: "PATCH", body: { status } });
      await refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const waMessages = [
    { label: "Order confirmed", text: `Hi ${firstName}, thank you for shopping with Khatoon Collection! Your order ${orderNo(o.id)} is confirmed and will be dispatched soon.` },
    { label: "Shipped", text: `Hi ${firstName}, good news! Your Khatoon Collection order ${orderNo(o.id)} has been shipped.${o.trackingUrl ? ` Track it here: ${o.trackingUrl}` : ""}` },
    { label: "Ask for review", text: `Hi ${firstName}, we hope you love your outfit from Khatoon Collection! It would mean a lot if you could share a review or a photo with us.` },
  ];

  const copyAddress = async () => {
    await navigator.clipboard.writeText([name, ...addressLines(o), phone].filter(Boolean).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="print:text-black">
      <Link to="/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 print:hidden">
        <ArrowLeft className="h-4 w-4" /> Orders
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-semibold text-brand-900">{orderNo(o.id)}</h1>
            <StatusBadge status={o.status} />
            <StatusBadge status={o.paymentStatus} />
          </div>
          <p className="mt-1 text-sm text-neutral-500">Placed {dateTime(o.orderDate)}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button className="btn-secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </button>
          {next && (
            <button className="btn-primary" disabled={!!busy} onClick={() => setStatus(next.status)}>
              {busy === next.status ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />} {next.label}
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-4"><ErrorNote message={error} /></div>}

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-4 lg:col-span-2 lg:space-y-6">
          <Section title={`Items (${o.orderItems.reduce((s, i) => s + i.quantity, 0)})`}>
            <div className="divide-y divide-line">
              {o.orderItems.map((it) => (
                <div key={it.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <Thumb src={it.imageUrl} alt={it.productName} size={56} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{it.productName}</div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-neutral-500">
                      {it.variantLabel && <span>{it.variantLabel}</span>}
                      {it.sku && <span>SKU {it.sku}</span>}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-neutral-500">{inr(it.unitPrice)} × {it.quantity}</div>
                    <div className="font-semibold">{inr(Number(it.unitPrice) * it.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between text-neutral-600"><span>Subtotal</span><span>{inr(itemsTotal)}</span></div>
              {Number(o.shippingFee) > 0 && <div className="flex justify-between text-neutral-600"><span>Shipping</span><span>{inr(o.shippingFee)}</span></div>}
              {Number(o.couponDiscount) > 0 && (
                <div className="flex justify-between text-emerald-700"><span>Coupon {o.couponCode}</span><span>−{inr(o.couponDiscount)}</span></div>
              )}
              <div className="flex justify-between pt-1 text-base font-bold"><span>Total</span><span>{inr(o.totalAmount)}</span></div>
            </div>
          </Section>

          <Section title="Payment">
            {(o.payments || []).length === 0 ? (
              <p className="text-sm text-neutral-500">No payment attempts recorded{o.paymentMethod ? ` · method ${o.paymentMethod}` : ""}.</p>
            ) : (
              <div className="space-y-2">
                {o.payments!.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium">{inr(p.amount)}</span>
                      <span className="ml-2 text-neutral-500">{p.paymentMethod || "Razorpay"} · {dateTime(p.createdAt)}</span>
                      {p.razorpayPaymentId && <div className="text-xs text-neutral-400">{p.razorpayPaymentId}</div>}
                    </div>
                    <StatusBadge status={p.paymentStatus} />
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Update status">
            <div className="flex flex-wrap gap-2 print:hidden">
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={!!busy || o.status === s}
                  onClick={() => setStatus(s)}
                  className={`btn ${o.status === s ? "bg-brand-800 text-white" : s === "Cancelled" ? "border border-red-200 bg-white text-red-600 hover:bg-red-50" : "btn-secondary"}`}
                >
                  {busy === s && <Loader2 className="h-4 w-4 animate-spin" />} {s}
                </button>
              ))}
            </div>
            {o.paymentStatus !== "Paid" && <p className="mt-3 text-xs text-amber-700">Payment not received yet. Don't ship until it shows Paid.</p>}
          </Section>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <Section title="Customer">
            <div className="font-semibold">{name}</div>
            {o.user ? <Badge tone="blue">Registered customer</Badge> : <Badge>Guest checkout</Badge>}
            <div className="mt-3 space-y-2 text-sm">
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2 text-neutral-700 hover:text-brand-800">
                  <Phone className="h-4 w-4 text-neutral-400" /> {phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}?subject=${encodeURIComponent(`Your Khatoon Collection order ${orderNo(o.id)}`)}`} className="flex items-center gap-2 break-all text-neutral-700 hover:text-brand-800">
                  <Mail className="h-4 w-4 flex-none text-neutral-400" /> {email}
                </a>
              )}
            </div>
          </Section>

          <Section
            title="Ship to"
            action={
              <button onClick={copyAddress} className="btn-ghost px-2 py-1 text-xs print:hidden">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
              </button>
            }
          >
            <div className="text-sm leading-relaxed text-neutral-700">
              <div className="font-medium text-neutral-900">{name}</div>
              {addressLines(o).map((l) => <div key={l}>{l}</div>)}
              {phone && <div>{phone}</div>}
            </div>
            {(o.trackingUrl || o.awbNumber || o.trackingCode) && (
              <div className="mt-3 rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                Tracking: {o.trackingUrl ? <a className="text-rose-brand underline" href={o.trackingUrl} target="_blank" rel="noreferrer">{o.awbNumber || o.trackingCode || "open"}</a> : o.awbNumber || o.trackingCode}
              </div>
            )}
          </Section>

          {phone && waLink(phone, "") && (
            <Section title="Message on WhatsApp">
              <div className="space-y-2 print:hidden">
                {waMessages.map((m) => (
                  <a key={m.label} href={waLink(phone, m.text)!} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm hover:border-emerald-300 hover:bg-emerald-50">
                    <MessageCircle className="h-4 w-4 text-emerald-600" /> {m.label}
                  </a>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
