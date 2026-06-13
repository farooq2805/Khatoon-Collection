/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useState } from "react";
import { FiChevronDown, FiX, FiUser } from "react-icons/fi";
import { useCatalogMenu } from "./CatalogMenuProvider";
import { useAuth } from "@/context/AuthContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function DesktopDrawerMenu({ open, onClose }: Props) {
  const { menu } = useCatalogMenu();
  const { username, logout } = useAuth();
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggle = (key: string) => setOpenKey((p) => (p === key ? null : key));

  const staticLinks = [
    { label: "Home", href: "/" },
    { label: "About us", href: "/about" },
    { label: "All products", href: "/products" },
  ];

  const bottomLinks = [{ label: "Contact", href: "/contact" }];

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-[70]" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-[80] h-[100dvh] w-[360px] bg-[#1f2430] transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Desktop Menu"
      >
        <div className="h-[74px] bg-white flex items-center justify-between px-4 border-b border-black/10">
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 grid place-items-center"
            aria-label="Close menu"
          >
            <FiX className="text-2xl text-black" />
          </button>

          <Link href="/" onClick={onClose} className="flex items-center">
            <img
              src="/logo.png"
              alt="Khatoon Collection"
              className="h-[84px] w-auto object-contain"
            />
          </Link>

          <div className="h-10 w-10" />
        </div>

        <div className="py-3">
          <div className="px-3">
            {staticLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                className="block rounded-lg px-3 py-3 text-white/95 text-[16px] font-semibold hover:bg-white/10"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="my-3 h-px bg-white/10" />

          <div className="px-3">
            {menu.map((item) => {
              const hasChildren = !!item.children?.length;
              const isOpen = openKey === item.label;

              return (
                <div key={item.label} className="mb-1">
                  <button
                    type="button"
                    onClick={() => (hasChildren ? toggle(item.label) : onClose())}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-3 text-white/95 hover:bg-white/10"
                  >
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          if (hasChildren) e.preventDefault();
                        }}
                        className="text-left text-[16px] font-semibold capitalize flex-1"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-left text-[16px] font-semibold capitalize flex-1">
                        {item.label}
                      </span>
                    )}

                    {hasChildren && (
                      <FiChevronDown
                        className={`text-lg transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {hasChildren && isOpen && (
                    <div className="ml-3 mr-1 mb-2 rounded-lg bg-white/5 overflow-hidden">
                      {item.children!.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          onClick={onClose}
                          className="block px-4 py-3 text-[14px] text-white/85 hover:bg-white/10 capitalize"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="my-3 h-px bg-white/10" />

          <div className="px-3">
            {bottomLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                className="block rounded-lg px-3 py-3 text-white/95 text-[16px] font-semibold hover:bg-white/10"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
          {username ? (
            <div className="flex items-center justify-between text-white/90">
              <div className="flex items-center gap-2">
                <FiUser />
                <span className="text-sm font-semibold">Hi, {username}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-sm font-semibold underline hover:opacity-90"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-2 text-white/90 font-semibold"
            >
              <FiUser />
              <span>Log in</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
