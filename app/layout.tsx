import "./globals.css";

import { Playfair_Display, Montserrat } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Header from "@/components/header/Header";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CatalogMenuProvider } from "@/components/header/CatalogMenuProvider";

import ToasterClient from "@/components/ToasterClient"; // ✅ client wrapper
import SalesNotification from "@/components/SalesNotification"; // ✅ purchase popup wrapper
import WhatsAppFloating from "@/components/WhatsAppFloating"; // ✅ WhatsApp chat floating widget


import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico?v=3" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=3" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css';
                link.media = 'all';
                document.head.appendChild(link);
              })();
            `,
          }}
        />
      </head>

      <body className="font-sans text-dark pb-16 min-h-screen overflow-x-hidden">
        <AuthProvider>
          <CartProvider>
            {/* ✅ NO endpoints prop */}
            <CatalogMenuProvider>
              {/* HEADER */}
            <Suspense fallback={null}>
          <Header />
        </Suspense>

              {/* PAGE CONTENT */}
              <Suspense fallback={null}>{children}</Suspense>

              {/* CLIENT-ONLY */}

              <ToasterClient />
              <SalesNotification />
              <WhatsAppFloating />


              <Footer />
              <Suspense fallback={null}>
                <MobileBottomNav />
              </Suspense>
            </CatalogMenuProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
