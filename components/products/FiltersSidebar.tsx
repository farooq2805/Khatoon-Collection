

// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useEffect, useMemo, useState } from "react";

// type SubCategory = { id: number; name: string; slug: string };
// type Category = {
//   id: number;
//   name: string;
//   slug: string;
//   subCategories?: SubCategory[];
// };

// type Props = {
//   apiBase: string;
//   activeCategory: string;
//   activeSubCategory: string;
//   q: string;
//   minPrice: string;
//   maxPrice: string;
//   onApply: (next: {
//     category?: string;
//     subCategory?: string;
//     q?: string;
//     minPrice?: string;
//     maxPrice?: string;
//   }) => void;
//   theme?: string; // ✅ add this
//   onClear: () => void;

//   // for mobile sheet
//   variant?: "desktop" | "mobile";
//   onClose?: () => void;
// };

// const THEME = "#f57bb4";

// function useDebounced<T>(value: T, ms: number) {
//   const [v, setV] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setV(value), ms);
//     return () => clearTimeout(t);
//   }, [value, ms]);
//   return v;
// }

// export default function FiltersSidebar({
//   apiBase,
//   activeCategory,
//   activeSubCategory,
//   q,
//   minPrice,
//   maxPrice,
//   onApply,
//   onClear,
//   variant = "desktop",
//   onClose,
// }: Props) {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [localQ, setLocalQ] = useState(q || "");
//   const [localMin, setLocalMin] = useState(minPrice || "");
//   const [localMax, setLocalMax] = useState(maxPrice || "");

//   // accordions
//   const [openType, setOpenType] = useState(true);
//   const [openConcern, setOpenConcern] = useState(true);
//   const [openPrice, setOpenPrice] = useState(true);

//   // sync local inputs from URL
//   useEffect(() => setLocalQ(q || ""), [q]);
//   useEffect(() => setLocalMin(minPrice || ""), [minPrice]);
//   useEffect(() => setLocalMax(maxPrice || ""), [maxPrice]);

//   // load categories
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         const res = await fetch(`${apiBase}/categories`, { cache: "no-store" });
//         const json = await res.json();
//         if (!alive) return;
//         setCategories(Array.isArray(json?.data) ? json.data : []);
//       } catch {
//         if (!alive) return;
//         setCategories([]);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [apiBase]);

//   const activeCatObj = useMemo(
//     () => categories.find((c) => c.slug === activeCategory),
//     [categories, activeCategory]
//   );

//   // ✅ auto apply search & price with debounce
//   const dq = useDebounced(localQ, 350);
//   const dmin = useDebounced(localMin, 350);
//   const dmax = useDebounced(localMax, 350);

//   useEffect(() => {
//     // only apply if changed vs URL values
//     if (dq !== (q || "")) onApply({ q: dq || undefined });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dq]);

//   useEffect(() => {
//     if (dmin !== (minPrice || "") || dmax !== (maxPrice || "")) {
//       onApply({
//         minPrice: dmin || undefined,
//         maxPrice: dmax || undefined,
//       });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dmin, dmax]);

//   const shell =
//     variant === "desktop"
//       ? "bg-white border border-gray-200 rounded-2xl p-4 h-fit lg:sticky lg:top-24"
//       : "bg-white rounded-2xl p-4";

//   const Section = ({
//     title,
//     open,
//     setOpen,
//     children,
//     right,
//   }: any) => (
//     <div className="border-b border-gray-100 pb-4 mb-4">
//       <button
//         type="button"
//         className="w-full flex items-center justify-between text-left"
//         onClick={() => setOpen(!open)}
//       >
//         <div className="text-xs tracking-wide font-semibold text-gray-900">
//           {title.toUpperCase()}
//         </div>
//         <div className="flex items-center gap-2">
//           {right}
//           <span className="text-gray-500">{open ? "▲" : "▼"}</span>
//         </div>
//       </button>
//       {open ? <div className="mt-3">{children}</div> : null}
//     </div>
//   );

//   return (
//     <aside className={shell}>
//       <div className="flex items-center justify-between mb-3">
//         <div className="font-semibold text-gray-900">Filters</div>
//         <div className="flex items-center gap-3">
//           <button onClick={onClear} className="text-sm" style={{ color: THEME }}>
//             Clear all
//           </button>
//           {variant === "mobile" ? (
//             <button
//               onClick={onClose}
//               className="text-sm text-gray-700 border rounded-lg px-2 py-1"
//             >
//               Close
//             </button>
//           ) : null}
//         </div>
//       </div>

//       {/* Search */}
//       <div className="mb-4">
//         <div className="text-sm font-medium text-gray-800 mb-2">Search</div>
//         <input
//           value={localQ}
//           onChange={(e) => setLocalQ(e.target.value)}
//           placeholder="Search products..."
//           className="w-full h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-[#f57bb4]/30"
//         />
//       </div>

//       {/* SHOP BY PRODUCT TYPE */}
//       <Section title="Shop by product type" open={openType} setOpen={setOpenType}>
//         <div className="space-y-2">
//           <button
//             onClick={() => {
//               onApply({ category: undefined, subCategory: undefined });
//               if (variant === "mobile") onClose?.();
//             }}
//             className="w-full text-left px-3 py-2 rounded-xl border"
//             style={{
//               borderColor: !activeCategory ? THEME : "#e5e7eb",
//               background: !activeCategory ? "#fdf2fb" : "white",
//               color: !activeCategory ? THEME : "#111827",
//               fontWeight: !activeCategory ? 700 : 500,
//             }}
//           >
//             All Products
//           </button>

//           {categories.map((c) => {
//             const isActive = c.slug === activeCategory;
//             return (
//               <button
//                 key={c.slug}
//                 onClick={() => {
//                   onApply({ category: c.slug, subCategory: undefined });
//                   if (variant === "mobile") onClose?.();
//                 }}
//                 className="w-full text-left px-3 py-2 rounded-xl border"
//                 style={{
//                   borderColor: isActive ? THEME : "#e5e7eb",
//                   background: isActive ? "#fdf2fb" : "white",
//                   color: isActive ? THEME : "#111827",
//                   fontWeight: isActive ? 700 : 500,
//                 }}
//               >
//                 {c.name}
//               </button>
//             );
//           })}
//         </div>

//         {/* Subcategories show only for active category */}
//         {activeCatObj?.subCategories?.length ? (
//           <div className="mt-4">
//             <div className="text-xs font-semibold text-gray-700 mb-2">SUB CATEGORY</div>
//             <div className="space-y-2">
//               <button
//                 onClick={() => {
//                   onApply({ subCategory: undefined });
//                   if (variant === "mobile") onClose?.();
//                 }}
//                 className="w-full text-left px-3 py-2 rounded-xl border"
//                 style={{
//                   borderColor: !activeSubCategory ? THEME : "#e5e7eb",
//                   background: !activeSubCategory ? "#fdf2fb" : "white",
//                   color: !activeSubCategory ? THEME : "#111827",
//                   fontWeight: !activeSubCategory ? 700 : 500,
//                 }}
//               >
//                 All
//               </button>

//               {activeCatObj.subCategories.map((s) => {
//                 const isActive = s.slug === activeSubCategory;
//                 return (
//                   <button
//                     key={s.slug}
//                     onClick={() => {
//                       onApply({ subCategory: s.slug });
//                       if (variant === "mobile") onClose?.();
//                     }}
//                     className="w-full text-left px-3 py-2 rounded-xl border"
//                     style={{
//                       borderColor: isActive ? THEME : "#e5e7eb",
//                       background: isActive ? "#fdf2fb" : "white",
//                       color: isActive ? THEME : "#111827",
//                       fontWeight: isActive ? 700 : 500,
//                     }}
//                   >
//                     {s.name}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         ) : null}
//       </Section>

//       {/* SHOP BY CONCERN (UI only for now; wire later when API is ready) */}
//       <Section title="Shop by concern" open={openConcern} setOpen={setOpenConcern}>
//         <div className="text-sm text-gray-500">
//           (UI ready) Concern filtering will be wired when you add tags/concern API.
//         </div>
//       </Section>

//       {/* PRICE */}
//       <Section
//         title="Price"
//         open={openPrice}
//         setOpen={setOpenPrice}
//         // right={
//         //   <button
//         //     type="button"
//         //     onClick={(e) => {
//         //       e.stopPropagation();
//         //       setLocalMin("");
//         //       setLocalMax("");
//         //       onApply({ minPrice: undefined, maxPrice: undefined });
//         //     }}
//         //     className="text-xs px-2 py-1 rounded-full border"
//         //   >
//         //     Clear
//         //   </button>
//         // }

//         right={
//   <span
//     role="button"
//     tabIndex={0}
//     onClick={(e) => {
//       e.stopPropagation();
//       setLocalMin("");
//       setLocalMax("");
//       onApply({ minPrice: undefined, maxPrice: undefined });
//     }}
//     onKeyDown={(e) => {
//       if (e.key === "Enter" || e.key === " ") {
//         e.preventDefault();
//         e.stopPropagation();
//         setLocalMin("");
//         setLocalMax("");
//         onApply({ minPrice: undefined, maxPrice: undefined });
//       }
//     }}
//     className="text-xs px-2 py-1 rounded-full border cursor-pointer select-none"
//   >
//     Clear
//   </span>
// }

//       >
//         <div className="flex gap-2">
//           <input
//             value={localMin}
//             onChange={(e) => setLocalMin(e.target.value)}
//             placeholder="Min"
//             className="w-1/2 h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-[#f57bb4]/30"
//           />
//           <input
//             value={localMax}
//             onChange={(e) => setLocalMax(e.target.value)}
//             placeholder="Max"
//             className="w-1/2 h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-[#f57bb4]/30"
//           />
//         </div>
//       </Section>
//     </aside>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";

type SubCategory = { id: number; name: string; slug: string };
type Category = {
  id: number;
  name: string;
  slug: string;
  subCategories?: SubCategory[];
};

type Props = {
  apiBase: string;
  activeCategory: string;
  activeSubCategory: string;
  q: string;
  minPrice: string;
  maxPrice: string;
  onApply: (next: {
    category?: string;
    subCategory?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
  }) => void;
  theme?: string;
  onClear: () => void;

  variant?: "desktop" | "mobile";
  onClose?: () => void;
};

const THEME = "#f57bb4";

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function FiltersSidebar({
  apiBase,
  activeCategory,
  activeSubCategory,
  q,
  minPrice,
  maxPrice,
  onApply,
  onClear,
  variant = "desktop",
  onClose,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [localQ, setLocalQ] = useState(q || "");
  const [localMin, setLocalMin] = useState(minPrice || "");
  const [localMax, setLocalMax] = useState(maxPrice || "");

  const [openType, setOpenType] = useState(true);
  const [openConcern, setOpenConcern] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);

  useEffect(() => setLocalQ(q || ""), [q]);
  useEffect(() => setLocalMin(minPrice || ""), [minPrice]);
  useEffect(() => setLocalMax(maxPrice || ""), [maxPrice]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/categories`, { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        setCategories(Array.isArray(json?.data) ? json.data : []);
      } catch {
        if (!alive) return;
        setCategories([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [apiBase]);

  const activeCatObj = useMemo(
    () => categories.find((c) => c.slug === activeCategory),
    [categories, activeCategory]
  );

  const dq = useDebounced(localQ, 350);
  const dmin = useDebounced(localMin, 350);
  const dmax = useDebounced(localMax, 350);

  useEffect(() => {
    if (dq !== (q || "")) onApply({ q: dq || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq]);

  useEffect(() => {
    if (dmin !== (minPrice || "") || dmax !== (maxPrice || "")) {
      onApply({
        minPrice: dmin || undefined,
        maxPrice: dmax || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dmin, dmax]);

  const isDesktop = variant === "desktop";

  // ✅ only UI tweaks here
  const shell = isDesktop
    ? "bg-white border border-gray-200 rounded-2xl p-3 h-fit lg:sticky lg:top-24"
    : "bg-white rounded-2xl p-4";

  const sectionWrap = isDesktop
    ? "border-b border-gray-100 pb-3 mb-3"
    : "border-b border-gray-100 pb-4 mb-4";

  const sectionTitle = isDesktop
    ? "text-[11px] tracking-wide font-bold text-gray-900"
    : "text-xs tracking-wide font-semibold text-gray-900";

  const sectionBodyGap = isDesktop ? "mt-2" : "mt-3";

  const inputH = isDesktop ? "h-10" : "h-11";
  const inputText = isDesktop ? "text-[13px]" : "text-sm";
  const labelText = isDesktop ? "text-[13px]" : "text-sm";

  const pill =
    "w-full text-left rounded-xl border transition hover:border-gray-300";
  const pillPad = isDesktop ? "px-3 py-2" : "px-3 py-2";

  const Section = ({ title, open, setOpen, children, right }: any) => (
    <div className={sectionWrap}>
      <button
        type="button"
        className="w-full flex items-center justify-between text-left"
        onClick={() => setOpen(!open)}
      >
        <div className={sectionTitle}>{title.toUpperCase()}</div>
        <div className="flex items-center gap-2">
          {right}
          <span className={isDesktop ? "text-gray-400 text-[11px]" : "text-gray-500"}>
            {open ? "▲" : "▼"}
          </span>
        </div>
      </button>
      {open ? <div className={sectionBodyGap}>{children}</div> : null}
    </div>
  );

  return (
    <aside className={shell}>
      <div className={isDesktop ? "flex items-center justify-between mb-2" : "flex items-center justify-between mb-3"}>
        <div className={isDesktop ? "font-semibold text-[14px] text-gray-900" : "font-semibold text-gray-900"}>
          Filters
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className={isDesktop ? "text-[12px] font-semibold" : "text-sm"}
            style={{ color: THEME }}
          >
            Clear all
          </button>

          {variant === "mobile" ? (
            <button
              onClick={onClose}
              className="text-sm text-gray-700 border rounded-lg px-2 py-1"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>

      {/* Search */}
      <div className={isDesktop ? "mb-3" : "mb-4"}>
        <div className={isDesktop ? "text-[12px] font-semibold text-gray-800 mb-2" : "text-sm font-medium text-gray-800 mb-2"}>
          Search
        </div>
        <input
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder="Search products..."
          className={`w-full ${inputH} ${inputText} rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-[#f57bb4]/30`}
        />
      </div>

      {/* SHOP BY PRODUCT TYPE */}
      <Section title="Shop by product type" open={openType} setOpen={setOpenType}>
        <div className={isDesktop ? "space-y-1.5" : "space-y-2"}>
          <button
            onClick={() => {
              onApply({ category: undefined, subCategory: undefined });
              if (variant === "mobile") onClose?.();
            }}
            className={`${pill} ${pillPad} ${labelText}`}
            style={{
              borderColor: !activeCategory ? THEME : "#e5e7eb",
              background: !activeCategory ? "#fdf2fb" : "white",
              color: !activeCategory ? THEME : "#111827",
              fontWeight: !activeCategory ? 700 : 500,
            }}
          >
            All Products
          </button>

          {categories.map((c) => {
            const isActive = c.slug === activeCategory;
            return (
              <button
                key={c.slug}
                onClick={() => {
                  onApply({ category: c.slug, subCategory: undefined });
                  if (variant === "mobile") onClose?.();
                }}
                className={`${pill} ${pillPad} ${labelText}`}
                style={{
                  borderColor: isActive ? THEME : "#e5e7eb",
                  background: isActive ? "#fdf2fb" : "white",
                  color: isActive ? THEME : "#111827",
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Subcategories */}
        {activeCatObj?.subCategories?.length ? (
          <div className={isDesktop ? "mt-3" : "mt-4"}>
            <div className={isDesktop ? "text-[11px] font-bold text-gray-700 mb-2" : "text-xs font-semibold text-gray-700 mb-2"}>
              SUB CATEGORY
            </div>

            <div className={isDesktop ? "space-y-1.5" : "space-y-2"}>
              <button
                onClick={() => {
                  onApply({ subCategory: undefined });
                  if (variant === "mobile") onClose?.();
                }}
                className={`${pill} ${pillPad} ${labelText}`}
                style={{
                  borderColor: !activeSubCategory ? THEME : "#e5e7eb",
                  background: !activeSubCategory ? "#fdf2fb" : "white",
                  color: !activeSubCategory ? THEME : "#111827",
                  fontWeight: !activeSubCategory ? 700 : 500,
                }}
              >
                All
              </button>

              {activeCatObj.subCategories.map((s) => {
                const isActive = s.slug === activeSubCategory;
                return (
                  <button
                    key={s.slug}
                    onClick={() => {
                      onApply({ subCategory: s.slug });
                      if (variant === "mobile") onClose?.();
                    }}
                    className={`${pill} ${pillPad} ${labelText}`}
                    style={{
                      borderColor: isActive ? THEME : "#e5e7eb",
                      background: isActive ? "#fdf2fb" : "white",
                      color: isActive ? THEME : "#111827",
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </Section>

      {/* SHOP BY CONCERN */}
      <Section title="Shop by concern" open={openConcern} setOpen={setOpenConcern}>
        <div className={isDesktop ? "text-[12px] text-gray-500 leading-relaxed" : "text-sm text-gray-500"}>
          (UI ready) Concern filtering will be wired when you add tags/concern API.
        </div>
      </Section>

      {/* PRICE */}
      <Section
        title="Price"
        open={openPrice}
        setOpen={setOpenPrice}
        right={
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setLocalMin("");
              setLocalMax("");
              onApply({ minPrice: undefined, maxPrice: undefined });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                setLocalMin("");
                setLocalMax("");
                onApply({ minPrice: undefined, maxPrice: undefined });
              }
            }}
            className={isDesktop ? "text-[11px] px-2 py-1 rounded-full border cursor-pointer select-none text-gray-700" : "text-xs px-2 py-1 rounded-full border cursor-pointer select-none"}
          >
            Clear
          </span>
        }
      >
        <div className="flex gap-2">
          <input
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            placeholder="Min"
            className={`w-1/2 ${inputH} ${inputText} rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-[#f57bb4]/30`}
          />
          <input
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            placeholder="Max"
            className={`w-1/2 ${inputH} ${inputText} rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-[#f57bb4]/30`}
          />
        </div>
      </Section>
    </aside>
  );
}


