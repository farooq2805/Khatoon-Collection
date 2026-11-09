"use strict";
/**
 * Khatoon Collection: daily owner emails (revenue report + website health).
 *
 * Installed into the API at dist/services/reportEmails.js.
 *   - sendDailySalesReport()      : 8 AM IST revenue report (jobs/dailySalesReportCron.js)
 *   - sendHealthEmail(report)     : 6 AM IST health email, fed by runDailyHealthCheck()
 *
 * Revenue counts only orders whose payment succeeded (paymentStatus "Paid",
 * not cancelled). Orders still awaiting payment are reported separately.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDailySalesReport = sendDailySalesReport;
exports.sendHealthEmail = sendHealthEmail;
exports.buildSalesReport = buildSalesReport;
exports.buildHealthEmail = buildHealthEmail;

const prisma_1 = require("../lib/prisma");
const mailer_1 = require("../lib/mailer");

const prisma = prisma_1.prisma;
const REPORT_TO = "farooq2805@gmail.com"; // website health
const REVENUE_TO = ["farooq2805@gmail.com", "sabirpathan1987@gmail.com", "khatooncollectionkc@gmail.com"];
const SITE_URL = "https://khatooncollection.in";
const DASHBOARD_URL = "https://panel.khatooncollection.in";
const IST = "Asia/Kolkata";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// ── Brand palette ───────────────────────────────────────────────────────────
const C = {
    brand: "#4a2c21",
    accent: "#c2185b",
    ink: "#1f2937",
    muted: "#6b7280",
    line: "#ece7e4",
    bg: "#f6f3f1",
    card: "#ffffff",
    good: "#15803d",
    goodBg: "#ecfdf3",
    warn: "#b45309",
    warnBg: "#fffbeb",
    bad: "#b91c1c",
    badBg: "#fef2f2",
};
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// ── Helpers ─────────────────────────────────────────────────────────────────
function esc(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
function inr(n) {
    return "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
}
function orderNo(id) {
    return "#ORD-" + String(id).padStart(6, "0");
}
function sum(orders) {
    return orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
}
function fmtDate(d, opts) {
    return d.toLocaleDateString("en-IN", Object.assign({ timeZone: IST }, opts));
}
/** Start of the IST calendar day containing `date`, offset by `days`, as a UTC Date. */
function istDayStart(date, days = 0) {
    const ist = new Date(date.getTime() + IST_OFFSET_MS);
    const startIstAsUtc = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + days);
    return new Date(startIstAsUtc - IST_OFFSET_MS);
}
function istMonthStart(date) {
    const ist = new Date(date.getTime() + IST_OFFSET_MS);
    return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1) - IST_OFFSET_MS);
}
function changeLabel(current, previous) {
    if (!previous && !current)
        return { text: "No sales either day", color: C.muted };
    if (!previous)
        return { text: "▲ New sales vs. no sales the day before", color: C.good };
    const pct = Math.round(((current - previous) / previous) * 100);
    if (pct === 0)
        return { text: "Same as the day before", color: C.muted };
    return pct > 0
        ? { text: `▲ ${pct}% vs. the day before (${inr(previous)})`, color: C.good }
        : { text: `▼ ${Math.abs(pct)}% vs. the day before (${inr(previous)})`, color: C.bad };
}

// ── Shared layout ───────────────────────────────────────────────────────────
function layout({ preheader, title, subtitle, body }) {
    return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:${C.card};border-radius:12px;overflow:hidden;border:1px solid ${C.line};">
  <tr><td style="background:${C.brand};padding:26px 32px;">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:4px;color:#f3d9c9;text-transform:uppercase;">Khatoon Collection</div>
    <div style="font-family:${FONT};font-size:22px;font-weight:700;color:#ffffff;margin-top:8px;">${esc(title)}</div>
    <div style="font-family:${FONT};font-size:13px;color:#e7d3c8;margin-top:4px;">${esc(subtitle)}</div>
  </td></tr>
  ${body}
  <tr><td style="padding:20px 32px 28px;border-top:1px solid ${C.line};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:${FONT};font-size:12px;color:${C.muted};line-height:18px;">
        Automated report from your store's server.<br>
        <a href="${SITE_URL}" style="color:${C.accent};text-decoration:none;">khatooncollection.in</a> &nbsp;·&nbsp;
        <a href="${DASHBOARD_URL}" style="color:${C.accent};text-decoration:none;">Open admin dashboard</a>
      </td>
    </tr></table>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
function section(title, inner, note) {
    return `<tr><td style="padding:24px 32px 0;">
    <div style="font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${C.muted};margin-bottom:10px;">${esc(title)}</div>
    ${inner}
    ${note ? `<div style="font-family:${FONT};font-size:12px;color:${C.muted};margin-top:8px;">${note}</div>` : ""}
  </td></tr>`;
}
function statGrid(stats) {
    const cells = stats.map((s) => `<td width="50%" valign="top" style="padding:6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.line};border-radius:10px;">
        <tr><td style="padding:14px 16px;">
          <div style="font-family:${FONT};font-size:12px;color:${C.muted};">${esc(s.label)}</div>
          <div style="font-family:${FONT};font-size:22px;font-weight:700;color:${s.color || C.ink};margin-top:4px;">${esc(s.value)}</div>
          ${s.sub ? `<div style="font-family:${FONT};font-size:12px;color:${s.subColor || C.muted};margin-top:4px;">${esc(s.sub)}</div>` : ""}
        </td></tr>
      </table>
    </td>`);
    const rows = [];
    for (let i = 0; i < cells.length; i += 2)
        rows.push(`<tr>${cells[i]}${cells[i + 1] || '<td width="50%"></td>'}</tr>`);
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 -6px;">${rows.join("")}</table>`;
}
function table(headers, rows, emptyText) {
    const th = headers.map((h) => `<th align="${h.align || "left"}" style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:${C.muted};padding:10px 12px;border-bottom:1px solid ${C.line};background:#faf8f7;">${esc(h.label)}</th>`).join("");
    const body = rows.length
        ? rows.map((r) => `<tr>${r.map((cell, i) => `<td align="${headers[i].align || "left"}" valign="top" style="font-family:${FONT};font-size:13px;color:${C.ink};padding:10px 12px;border-bottom:1px solid ${C.line};">${cell}</td>`).join("")}</tr>`).join("")
        : `<tr><td colspan="${headers.length}" style="font-family:${FONT};font-size:13px;color:${C.muted};padding:16px 12px;text-align:center;">${esc(emptyText)}</td></tr>`;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.line};border-radius:10px;border-collapse:separate;overflow:hidden;"><tr>${th}</tr>${body}</table>`;
}
function pill(text, color, bg) {
    return `<span style="display:inline-block;font-family:${FONT};font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;color:${color};background:${bg};white-space:nowrap;">${esc(text)}</span>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Daily revenue report
// ═══════════════════════════════════════════════════════════════════════════
const PAID = { paymentStatus: "Paid", status: { not: "Cancelled" } };
const ORDER_SELECT = {
    id: true,
    totalAmount: true,
    customerName: true,
    customerEmail: true,
    paymentMethod: true,
    paymentStatus: true,
    status: true,
    orderDate: true,
    orderItems: { select: { productName: true, quantity: true, unitPrice: true, imageUrl: true } },
};

// Photos on the disabled Cloudinary accounts no longer load; skip them.
function usableImage(url) {
    return typeof url === "string" && /^https:\/\//.test(url) && !/res\.cloudinary\.com\/(techsrow|ifm9ihwo)\//.test(url);
}
function thumb(url, alt, size = 44) {
    const h = Math.round(size * 1.3);
    return usableImage(url)
        ? `<img src="${esc(url)}" alt="${esc(alt)}" width="${size}" height="${h}" style="display:block;width:${size}px;height:${h}px;object-fit:cover;border-radius:6px;border:1px solid ${C.line};">`
        : `<div style="width:${size}px;height:${h}px;border-radius:6px;background:#f3ece8;"></div>`;
}
function productCell(name, url, extra) {
    return `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td valign="top" style="padding-right:10px;">${thumb(url, name)}</td>
      <td valign="middle" style="font-family:${FONT};font-size:13px;color:${C.ink};">${esc(name)}${extra ? `<br><span style="color:${C.muted};font-size:12px;">${extra}</span>` : ""}</td>
    </tr></table>`;
}

async function buildSalesReport(now = new Date()) {
    const yStart = istDayStart(now, -1);
    const tStart = istDayStart(now, 0);
    const dbStart = istDayStart(now, -2);
    const weekStart = istDayStart(now, -7);
    const mStart = istMonthStart(yStart);

    const [week, yPending, yFailed, todayPaid, monthPaid, allPaid] = await Promise.all([
        prisma.order.findMany({ where: Object.assign({ orderDate: { gte: weekStart, lt: tStart } }, PAID), select: ORDER_SELECT, orderBy: { orderDate: "asc" } }),
        prisma.order.findMany({ where: { orderDate: { gte: yStart, lt: tStart }, paymentStatus: "Pending", status: { not: "Cancelled" } }, select: ORDER_SELECT }),
        prisma.order.findMany({ where: { orderDate: { gte: yStart, lt: tStart }, OR: [{ status: "Cancelled" }, { paymentStatus: "Failed" }] }, select: ORDER_SELECT, orderBy: { orderDate: "asc" } }),
        prisma.order.findMany({ where: Object.assign({ orderDate: { gte: tStart } }, PAID), select: { totalAmount: true } }),
        prisma.order.findMany({ where: Object.assign({ orderDate: { gte: mStart, lt: tStart } }, PAID), select: { totalAmount: true } }),
        prisma.order.aggregate({ where: PAID, _sum: { totalAmount: true }, _count: { _all: true } }),
    ]);
    const yPaid = week.filter((o) => new Date(o.orderDate) >= yStart);
    const prevPaid = week.filter((o) => new Date(o.orderDate) >= dbStart && new Date(o.orderDate) < yStart);

    const revenue = sum(yPaid);
    const itemsSold = yPaid.reduce((s, o) => s + o.orderItems.reduce((a, it) => a + Number(it.quantity || 0), 0), 0);
    const aov = yPaid.length ? revenue / yPaid.length : 0;
    const change = changeLabel(revenue, sum(prevPaid));
    const dateLabel = fmtDate(yStart, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const shortDate = fmtDate(yStart, { day: "2-digit", month: "short", year: "numeric" });

    // Last 7 days, one row per IST day (oldest first)
    const days = [];
    for (let d = -7; d <= -1; d++) {
        const start = istDayStart(now, d);
        const end = istDayStart(now, d + 1);
        const orders = week.filter((o) => new Date(o.orderDate) >= start && new Date(o.orderDate) < end);
        days.push({ label: fmtDate(start, { weekday: "short", day: "numeric", month: "short" }), orders: orders.length, revenue: sum(orders) });
    }
    const weekRevenue = days.reduce((s, d) => s + d.revenue, 0);
    const bestDay = Math.max(1, ...days.map((d) => d.revenue));
    const bar = (v) => {
        const w = Math.max(2, Math.round((v / bestDay) * 160));
        return `<div style="width:${w}px;height:8px;border-radius:4px;background:${v ? C.accent : C.line};"></div>`;
    };

    // Best sellers over the last 7 days (with product photo)
    const byProduct = new Map();
    for (const o of week)
        for (const it of o.orderItems) {
            const p = byProduct.get(it.productName) || { qty: 0, revenue: 0, image: null };
            p.qty += Number(it.quantity || 0);
            p.revenue += Number(it.quantity || 0) * Number(it.unitPrice || 0);
            if (!p.image && usableImage(it.imageUrl))
                p.image = it.imageUrl;
            byProduct.set(it.productName, p);
        }
    const topProducts = [...byProduct.entries()].sort((a, b) => b[1].qty - a[1].qty || b[1].revenue - a[1].revenue).slice(0, 5);

    const itemsCell = (o) => o.orderItems.map((it) => productCell(it.productName, it.imageUrl, `Qty ${esc(it.quantity)} · ${inr(it.unitPrice)}`)).join(`<div style="height:8px;"></div>`);
    const methodLabel = (m) => ({ UPI: "UPI", CARD: "Card", NETBANKING: "Net banking", WALLET: "Wallet" })[m] || (m ? String(m) : "Online");

    const body = [
        `<tr><td style="padding:28px 32px 0;">
          <div style="font-family:${FONT};font-size:13px;color:${C.muted};">Revenue · ${esc(dateLabel)}</div>
          <div style="font-family:${FONT};font-size:36px;font-weight:800;color:${C.ink};margin-top:6px;letter-spacing:-.5px;">${inr(revenue)}</div>
          <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${change.color};margin-top:6px;">${esc(change.text)}</div>
        </td></tr>`,
        section("Yesterday at a glance", statGrid([
            { label: "Paid orders", value: String(yPaid.length) },
            { label: "Average order value", value: inr(aov) },
            { label: "Items sold", value: String(itemsSold) },
            {
                label: "Awaiting payment",
                value: inr(sum(yPending)),
                sub: `${yPending.length} order${yPending.length === 1 ? "" : "s"} · not counted in revenue`,
            },
        ])),
        section("Running totals", statGrid([
            { label: "Today so far", value: inr(sum(todayPaid)), sub: `${todayPaid.length} paid order${todayPaid.length === 1 ? "" : "s"}` },
            { label: `${fmtDate(yStart, { month: "long" })} to date`, value: inr(sum(monthPaid)), sub: `${monthPaid.length} paid orders` },
            { label: "All-time revenue", value: inr(allPaid._sum.totalAmount || 0), sub: `${allPaid._count._all} paid orders` },
            {
                label: "Cancelled / failed yesterday",
                value: String(yFailed.length),
                sub: yFailed.length ? `${inr(sum(yFailed))} not collected` : "None",
                color: yFailed.length ? C.bad : C.ink,
            },
        ])),
        section("Last 7 days", table([{ label: "Day" }, { label: "Orders", align: "center" }, { label: "" }, { label: "Revenue", align: "right" }], days.map((d) => [
            esc(d.label),
            String(d.orders),
            bar(d.revenue),
            d.revenue ? `<strong>${inr(d.revenue)}</strong>` : `<span style="color:${C.muted};">—</span>`,
        ]).concat([[`<strong>Total</strong>`, `<strong>${week.length}</strong>`, "", `<strong>${inr(weekRevenue)}</strong>`]]), "")),
        section("Best sellers · last 7 days", table([{ label: "Product" }, { label: "Units", align: "center" }, { label: "Revenue", align: "right" }], topProducts.map(([name, p]) => [productCell(name, p.image), String(p.qty), `<strong>${inr(p.revenue)}</strong>`]), "No sales in the last 7 days")),
        section(`Yesterday's paid orders (${yPaid.length})`, table([{ label: "Order" }, { label: "Customer" }, { label: "Items" }, { label: "Amount", align: "right" }], yPaid.slice(0, 30).map((o) => [
            `<strong style="white-space:nowrap;">${orderNo(o.id)}</strong><br><span style="color:${C.muted};font-size:12px;">${esc(methodLabel(o.paymentMethod))}</span>`,
            esc(o.customerName || "—"),
            itemsCell(o),
            `<strong>${inr(o.totalAmount)}</strong>`,
        ]), "No paid orders yesterday"), yPaid.length > 30 ? `Showing 30 of ${yPaid.length}. See all in the admin dashboard.` : ""),
    ];
    if (yFailed.length) {
        body.push(section(`Cancelled or failed (${yFailed.length})`, table([{ label: "Order" }, { label: "Customer" }, { label: "Status" }, { label: "Amount", align: "right" }], yFailed.slice(0, 15).map((o) => [
            `<span style="white-space:nowrap;">${orderNo(o.id)}</span>`,
            `${esc(o.customerName || "—")}${o.customerEmail ? `<br><span style="color:${C.muted};font-size:12px;">${esc(o.customerEmail)}</span>` : ""}`,
            pill(o.paymentStatus === "Failed" ? "Payment failed" : "Cancelled", C.bad, C.badBg),
            inr(o.totalAmount),
        ]), ""), "Unpaid online orders are cancelled automatically after 30 minutes. Customers who abandoned payment may be worth a WhatsApp follow-up."));
    }
    body.push(`<tr><td style="padding:24px 32px 0;">
      <a href="${DASHBOARD_URL}/orders" style="display:inline-block;font-family:${FONT};font-size:13px;font-weight:700;color:#ffffff;background:${C.accent};text-decoration:none;padding:11px 20px;border-radius:8px;">View orders in dashboard</a>
    </td></tr>`);

    return {
        subject: `Daily revenue · ${shortDate} · ${inr(revenue)} from ${yPaid.length} order${yPaid.length === 1 ? "" : "s"}`,
        html: layout({
            preheader: `${inr(revenue)} from ${yPaid.length} paid orders. ${change.text}.`,
            title: "Daily Revenue Report",
            subtitle: dateLabel,
            body: body.join(""),
        }),
    };
}

/** Sends through the shared transporter and logs the mail server's answer. */
async function deliver(to, subject, html) {
    const info = await mailer_1.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
    });
    console.log(`   ↳ accepted=${JSON.stringify(info.accepted)} rejected=${JSON.stringify(info.rejected)} id=${info.messageId} response="${info.response}"`);
}

async function sendDailySalesReport() {
    try {
        const { subject, html } = await buildSalesReport();
        await deliver(REVENUE_TO, subject, html);
        console.log(`✅ Daily revenue report sent to ${REVENUE_TO.join(", ")}: ${subject}`);
    }
    catch (err) {
        console.error("❌ Failed to send daily revenue report:", err);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Website health email
// ═══════════════════════════════════════════════════════════════════════════
async function probe(url) {
    const started = Date.now();
    try {
        const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
        return { ok: res.ok, status: res.status, ms: Date.now() - started };
    }
    catch (err) {
        return { ok: false, status: err && err.name === "TimeoutError" ? "Timeout" : "Unreachable", ms: Date.now() - started };
    }
}
const LEVEL = {
    ok: { label: "Healthy", color: C.good, bg: C.goodBg },
    warn: { label: "Needs attention", color: C.warn, bg: C.warnBg },
    bad: { label: "Action required", color: C.bad, bg: C.badBg },
};

async function buildHealthEmail(report) {
    const [store, products, dashboard] = await Promise.all([
        probe(`${SITE_URL}/`),
        probe(`${SITE_URL}/products`),
        probe(`${DASHBOARD_URL}/`),
    ]);

    const img = report.productImages || {};
    const inv = report.inventory || {};
    const siteLevel = (p) => (!p.ok ? "bad" : p.ms > 3000 ? "warn" : "ok");
    const siteDetail = (p) => (p.ok ? `Online · loaded in ${(p.ms / 1000).toFixed(1)}s` : `Not responding (${p.status})`);

    const checks = [
        { name: "Storefront home page", level: siteLevel(store), detail: siteDetail(store) },
        { name: "Product listing page", level: siteLevel(products), detail: siteDetail(products) },
        { name: "Admin dashboard", level: siteLevel(dashboard), detail: siteDetail(dashboard) },
        {
            name: "Database",
            level: report.dbStatus !== "OPERATIONAL" ? "bad" : report.loadSpeedMs > 500 ? "warn" : "ok",
            detail: report.dbStatus !== "OPERATIONAL" ? "Error reading from database" : `Responding in ${report.loadSpeedMs} ms`,
        },
        {
            name: "Payments (Razorpay)",
            level: report.razorpayStatus === "OPERATIONAL" ? "ok" : "bad",
            detail: report.razorpayStatus === "OPERATIONAL" ? "Connected" : report.razorpayStatus === "NOT_CONFIGURED" ? "Not configured" : "Connection failed",
        },
        {
            name: "Product images",
            level: img.brokenCount > 0 ? "warn" : "ok",
            detail: img.brokenCount > 0 ? `${img.brokenCount} of ${img.totalChecked} images not loading` : `All ${img.totalChecked || 0} checked images load`,
        },
        {
            name: "Inventory",
            level: inv.outOfStockCount > 0 ? "warn" : "ok",
            detail: `${inv.outOfStockCount || 0} out of stock · ${inv.lowStockCount || 0} running low (5 or fewer)`,
        },
    ];
    const worst = checks.some((c) => c.level === "bad") ? "bad" : checks.some((c) => c.level === "warn") ? "warn" : "ok";
    const attention = checks.filter((c) => c.level !== "ok").length;
    const headline = worst === "ok" ? "All systems operational" : `${attention} item${attention === 1 ? "" : "s"} need${attention === 1 ? "s" : ""} attention`;
    const dateLabel = fmtDate(new Date(), { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const shortDate = fmtDate(new Date(), { day: "2-digit", month: "short", year: "numeric" });

    const body = [
        `<tr><td style="padding:28px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LEVEL[worst].bg};border-radius:10px;">
            <tr><td style="padding:16px 18px;">
              <div style="font-family:${FONT};font-size:18px;font-weight:700;color:${LEVEL[worst].color};">${esc(headline)}</div>
              <div style="font-family:${FONT};font-size:13px;color:${C.ink};margin-top:4px;">Checked ${esc(new Date().toLocaleString("en-IN", { timeZone: IST, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }))} IST</div>
            </td></tr>
          </table>
        </td></tr>`,
        section("System checks", table([{ label: "Check" }, { label: "Result" }, { label: "Status", align: "right" }], checks.map((c) => [
            `<strong>${esc(c.name)}</strong>`,
            esc(c.detail),
            pill(LEVEL[c.level].label, LEVEL[c.level].color, LEVEL[c.level].bg),
        ]), "")),
    ];
    if (report.autoFixesApplied && report.autoFixesApplied.length) {
        body.push(section("Fixed automatically", `<div style="font-family:${FONT};font-size:13px;color:${C.ink};line-height:20px;">${report.autoFixesApplied.map((f) => `✓ ${esc(f)}`).join("<br>")}</div>`));
    }
    if (inv.outOfStockItems && inv.outOfStockItems.length) {
        body.push(section(`Out of stock (${inv.outOfStockCount})`, table([{ label: "Product / variant" }, { label: "SKU" }], inv.outOfStockItems.slice(0, 15).map((i) => [esc(i.name), esc(i.sku || "—")]), ""), inv.outOfStockCount > 15 ? "Showing the first 15." : "Restock or hide these so customers don't hit sold-out sizes."));
    }
    if (inv.lowStockItems && inv.lowStockItems.length) {
        body.push(section(`Running low (${inv.lowStockCount})`, table([{ label: "Product / variant" }, { label: "Left", align: "center" }], inv.lowStockItems.slice(0, 15).map((i) => [esc(i.name), `<strong>${esc(i.stock)}</strong>`]), "")));
    }
    if (img.brokenItems && img.brokenItems.length) {
        body.push(section(`Images not loading (${img.brokenCount})`, table([{ label: "Product" }, { label: "Product ID", align: "center" }, { label: "Error", align: "right" }], img.brokenItems.slice(0, 15).map((b) => [esc(b.productName), esc(b.productId), esc(b.statusCode)]), ""), "Re-upload these photos in the dashboard. Most are links to the old, disabled Cloudinary account."));
    }

    return {
        subject: `Website health · ${shortDate} · ${headline}`,
        html: layout({
            preheader: `${headline}. Storefront ${store.ok ? "online" : "DOWN"}, payments ${report.razorpayStatus === "OPERATIONAL" ? "connected" : "need attention"}.`,
            title: "Website Health Report",
            subtitle: dateLabel,
            body: body.join(""),
        }),
    };
}

async function sendHealthEmail(report) {
    try {
        const { subject, html } = await buildHealthEmail(report);
        await deliver(REPORT_TO, subject, html);
        console.log(`📧 [Health Check] Report emailed to ${REPORT_TO}: ${subject}`);
    }
    catch (err) {
        console.error("❌ [Health Check] Failed to email report:", err);
    }
}
