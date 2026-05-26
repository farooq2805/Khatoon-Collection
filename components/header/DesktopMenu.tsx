"use client";

import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import { useCatalogMenu } from "./CatalogMenuProvider";

export default function DesktopMenu() {
  const { menu } = useCatalogMenu();

  // ✅ old static links (as before)
  const staticLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Shop", href: "/products" },
  ];

  const extraLinks = [
    { label: "Contact Us", href: "/contact" },
    { label: "Blog", href: "#" },
    { label: "Career", href: "#" },
  ];

  return (
    <nav className="bg-white">
      <div className="mx-auto max-w-[1400px] px-1">
        <ul className="flex items-center justify-center gap-2 py-2">
          {/* ✅ Static links first */}
          {staticLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="capitalize menu-item text-[16px] text-black/70 hover:text-black"
              >
                {l.label}
              </Link>
            </li>
          ))}

          {/* ✅ API categories only */}
          {menu.map((cat) => {
            const hasChildren = !!cat.children?.length;

            return (
              <li key={cat.label} className="relative group">
                <Link
                  href={cat.href || "/products"}
                  className="capitalize menu-item text-[16px] text-black/70 hover:text-black inline-flex items-center gap-1"
                >
                  <span className="capitalize">{cat.label}</span>
                  {hasChildren && <FiChevronDown className="text-[14px]" />}
                </Link>

                {/* hover bridge */}
                {hasChildren && (
                  <div className="absolute left-0 top-full h-2 w-full" />
                )}

                {/* dropdown */}
                {hasChildren && (
                  <div className="absolute left-1/2 top-full z-50 hidden -translate-x-1/2 group-hover:block w-[260px] bg-white border border-black/10 shadow-lg rounded-md overflow-hidden">
                    {cat.children!.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block px-4 menu-item py-3 text-[16px] text-black/80 hover:bg-black/5 capitalize"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}

          {/* ✅ extra links at end */}
          {extraLinks.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="capitalize menu-item text-[16px] text-black/70 hover:text-black"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-black/10" />
    </nav>
  );
}
