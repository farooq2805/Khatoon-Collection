"use client";

import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import { useCatalogMenu } from "./CatalogMenuProvider";

export default function DesktopTopMenu() {
  const { menu } = useCatalogMenu();

  const staticLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "All Products", href: "/products" },
  ];

  const bottomLinks = [
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "#" },
    { label: "Career", href: "#" },
  ];

  return (
    <nav className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <ul className="flex items-center justify-center gap-8">
          {/* Static first (like Aachho) */}
          {staticLinks.map((l) => (
            <li key={l.href} className="relative">
              <Link
                href={l.href}
                className="inline-flex items-center py-3 text-[16px] font-semibold uppercase tracking-[0.18em] text-black hover:opacity-80"
              >
                {l.label}
              </Link>
            </li>
          ))}

          {/* Dynamic categories with hover dropdown */}
          {menu.map((cat) => {
            const hasChildren = !!cat.children?.length;

            return (
              <li key={cat.label} className="relative group">
                <Link
                  href={cat.href || "#"}
                  className="inline-flex items-center gap-1 py-3 text-[16px] font-semibold uppercase  text-black hover:opacity-80"
                >
                  <span className="capitalize tracking-[0.12em]">{cat.label}</span>
                  {hasChildren && <FiChevronDown className="text-[14px]" />}
                </Link>

                {/* hover bridge (flicker fix) */}
                {hasChildren && (
                  <div className="absolute left-0 top-full h-2 w-full" />
                )}

                {/* Mega dropdown (Aachho style wide) */}
                {hasChildren && (
                  <div
                    className="
                      absolute left-1/2 top-full z-50 hidden
                      -translate-x-1/2 group-hover:block
                      w-[860px] max-w-[92vw]
                      bg-white
                      border border-black/10
                      shadow-[0_14px_36px_rgba(0,0,0,0.14)]
                      rounded-xl overflow-hidden
                    "
                  >
                    <div className="grid grid-cols-3 gap-2 p-4">
                      {cat.children!.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className="
                            rounded-lg px-3 py-2
                            text-[16px] uppercase tracking-[0.10em]
                            text-black/80 hover:bg-black/5
                          "
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}

          {/* extra static links */}
          {bottomLinks.map((l) => (
            <li key={l.label} className="relative">
              <Link
                href={l.href}
                className="inline-flex items-center py-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-black hover:opacity-80"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
