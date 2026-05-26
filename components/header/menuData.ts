export type MenuItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
  // for desktop mega preview bubbles (optional)
  bubbles?: { label: string; href: string; img?: string }[];
};

export const MENU: MenuItem[] = [
  {
    label: "skin",
    href: "/category/skin",
    children: [
      { label: "by product type", href: "/category/skin?view=type" },
      { label: "by ingredient", href: "/category/skin?view=ingredient" },
      { label: "combos", href: "/category/skin/combos" },
      { label: "see all", href: "/category/skin" },
    ],
    bubbles: [
      { label: "skincare", href: "/category/skin", img: "/demo/skincare.png" },
      { label: "bodycare", href: "/category/body", img: "/demo/body.png" },
      { label: "fragrance", href: "/category/fragrance", img: "/demo/fragrance.png" },
      { label: "haircare", href: "/category/hair", img: "/demo/hair.png" },
      { label: "combos", href: "/category/combos", img: "/demo/combos.png" },
    ],
  },
  { label: "body", href: "/category/body" },
  { label: "hair", href: "/category/hair" },
  { label: "fragrances", href: "/category/fragrance" },
  { label: "gifting", href: "/category/gifting" },
  { label: "makeup", href: "/category/makeup" },
  { label: "blogs & newsletters", href: "/blog" },
  { label: "get to know us", href: "/about" },
  { label: "help", href: "/help" },
  { label: "careers", href: "/careers" },
  { label: "bulk orders", href: "/bulk-orders" },
];
