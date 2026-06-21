import type { Category } from "@/types/storefront";

export type NavigationItem = {
  label: string;
  href: string;
};

export const navigationItems: NavigationItem[] = [
  { label: "হোম", href: "/" },
  { label: "বই", href: "/general-books" },
  { label: "বিষয়", href: "/cat/books/subject" },
  { label: "লেখক", href: "/cat/books/author" },
  { label: "প্রকাশক", href: "/cat/books/publisher" },
  { label: "আজকের অফার", href: "/online-book-fair" },
  { label: "প্রি-অর্ডার", href: "/preorder" },
  { label: "ফুড", href: "/food-products" },
  { label: "লাইফস্টাইল", href: "/lifestyle-products" },
  { label: "গ্যাজেট", href: "/gadgets" },
  { label: "স্টেশনারী", href: "/cat/products/stationary-item" },
  { label: "কর্পোরেট", href: "/corporate" },
];

export function buildNavigationItems(categories: Category[] = []): NavigationItem[] {
  const categoryItems = categories.slice(0, 5).map((category) => ({
    label: category.title,
    href: category.href,
  }));

  if (categoryItems.length === 0) {
    return navigationItems;
  }

  return [
    { label: "হোম", href: "/" },
    { label: "বই", href: "/books" },
    { label: "সব বিভাগ", href: "/categories" },
    ...categoryItems,
    { label: "আজকের অফার", href: "/online-book-fair" },
    { label: "প্রি-অর্ডার", href: "/preorder" },
    { label: "কর্পোরেট", href: "/corporate" },
  ];
}
