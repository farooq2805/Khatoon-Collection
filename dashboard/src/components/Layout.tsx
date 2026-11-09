import { useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Shirt,
  Plus,
  FolderTree,
  TicketPercent,
  Star,
  Images,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Store,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { useOrders, isToShip } from "../lib/orders";
import { STORE_URL } from "../lib/api";

// Pages not rebuilt yet open in the classic dashboard (same login).
const CLASSIC = (path: string) => `${window.location.origin}${path}`;

type Item = { to: string; label: string; icon: ReactNode; external?: boolean; badge?: number };

function NavItem({ item, onClick }: { item: Item; onClick?: () => void }) {
  const base = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition";
  if (item.external) {
    return (
      <a href={item.to} className={`${base} text-brand-100/80 hover:bg-white/5 hover:text-white`}>
        {item.icon}
        <span className="flex-1">{item.label}</span>
        <ExternalLink className="h-3.5 w-3.5 opacity-50" />
      </a>
    );
  }
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onClick}
      className={({ isActive }) =>
        `${base} ${isActive ? "bg-white/10 text-white" : "text-brand-100/80 hover:bg-white/5 hover:text-white"}`
      }
    >
      {item.icon}
      <span className="flex-1">{item.label}</span>
      {!!item.badge && <span className="rounded-full bg-rose-brand px-1.5 text-[11px] font-bold text-white">{item.badge}</span>}
    </NavLink>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const { orders } = useOrders();
  const toConfirm = orders.filter(isToShip).length;
  const icon = "h-4 w-4";

  const groups: { label: string; items: Item[] }[] = [
    {
      label: "Sell",
      items: [
        { to: "/", label: "Overview", icon: <LayoutDashboard className={icon} /> },
        { to: "/orders", label: "Orders", icon: <ShoppingBag className={icon} />, badge: toConfirm },
        { to: "/abandoned", label: "Abandoned checkouts", icon: <ShoppingCart className={icon} /> },
        { to: "/customers", label: "Customers", icon: <Users className={icon} /> },
      ],
    },
    {
      label: "Catalogue",
      items: [
        { to: "/products", label: "Products", icon: <Shirt className={icon} /> },
        { to: "/products/new", label: "Add product", icon: <Plus className={icon} /> },
        { to: CLASSIC("/categories"), label: "Categories", icon: <FolderTree className={icon} />, external: true },
      ],
    },
    {
      label: "Marketing & content",
      items: [
        { to: CLASSIC("/coupons"), label: "Coupons", icon: <TicketPercent className={icon} />, external: true },
        { to: CLASSIC("/reviews"), label: "Reviews", icon: <Star className={icon} />, external: true },
        { to: CLASSIC("/home-slider"), label: "Home banners", icon: <Images className={icon} />, external: true },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col bg-brand-900 text-white">
      <div className="px-5 pb-4 pt-6">
        <div className="font-serif text-xl tracking-wide">Khatoon</div>
        <div className="text-[10px] uppercase tracking-[0.35em] text-brand-200/70">Collection · Admin</div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-200/50">{g.label}</div>
            <div className="space-y-0.5">
              {g.items.map((i) => (
                <NavItem key={i.label} item={i} onClick={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a href={STORE_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-100/80 hover:bg-white/5 hover:text-white">
          <Store className="h-4 w-4" /> View store
        </a>
        <a href={CLASSIC("/dashboard")} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-100/80 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" /> Classic dashboard
        </a>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
            {(user?.firstName?.[0] || user?.email?.[0] || "A").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user?.firstName || "Admin"}</div>
            <div className="truncate text-xs text-brand-200/60">{user?.email}</div>
          </div>
          <button onClick={logout} title="Log out" className="rounded-md p-1.5 text-brand-200/70 hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-full">
      <aside className="hidden w-64 flex-none lg:block">
        <div className="fixed inset-y-0 w-64">
          <Sidebar />
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 shadow-2xl">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
          <button onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-full bg-white p-2 shadow" aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-white" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="font-serif text-lg text-brand-900">Khatoon Admin</div>
        </header>
        <main key={location.pathname} className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
