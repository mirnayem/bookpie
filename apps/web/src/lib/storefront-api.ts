import type {
  Book,
  Cart,
  Category as ApiCategory,
  CouponValidation,
  CreateOrderRequest,
  CustomerAddress,
  Order,
  UpsertAddressRequest,
  ValidateCouponRequest,
} from "@bookpie/shared";

import { makeBookCover, makeCircleImage } from "@/lib/svg-images";
import { products as fallbackProducts } from "@/data/storefront";
import type { Category, Product, ProductSection } from "@/types/storefront";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1";

type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export async function storefrontRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers,
    cache: options.cache ?? "no-store",
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message ?? response.statusText ?? "Request failed");
  }

  return payload.data as T;
}

export async function getStorefrontBooks(limit = 100) {
  try {
    const books = await storefrontRequest<Book[]>(`/books?limit=${limit}&offset=0`);
    return books.map(bookToProduct);
  } catch {
    return fallbackProducts;
  }
}

export async function getStorefrontBook(slug: string) {
  try {
    const book = await storefrontRequest<Book>(`/books/${encodeURIComponent(slug)}`);
    return bookToProduct(book);
  } catch {
    const decodedSlug = decodeURIComponent(slug);
    return (
      fallbackProducts.find((item) => item.slug === decodedSlug)
      ?? fallbackProducts.find((item) => item.title === decodedSlug)
      ?? fallbackProducts.find((item) => item.slug.includes(decodedSlug) || decodedSlug.includes(item.slug))
      ?? fallbackProducts[0]
    );
  }
}

export async function getStorefrontCategories() {
  try {
    const categories = await storefrontRequest<ApiCategory[]>("/categories");
    return categories.map(categoryToStorefrontCategory);
  } catch {
    return [];
  }
}

export function buildProductSections(products: Product[]): ProductSection[] {
  const safeProducts = products.length ? products : fallbackProducts;
  const byCategory = (needle: string) =>
    safeProducts.filter((product) =>
      product.categoryNames?.some((name) => name.toLowerCase().includes(needle))
      || product.title.toLowerCase().includes(needle),
    );
  const newBooks = safeProducts.slice(0, 10);
  const safeFood = byCategory("food").concat(safeProducts).slice(0, 10);
  const trending = [...safeProducts].sort((left, right) => (right.discountPercent ?? 0) - (left.discountPercent ?? 0)).slice(0, 10);
  const preOrder = safeProducts.filter((product) => (product.stock ?? 0) <= 5).concat(safeProducts).slice(0, 10);
  const islamic = byCategory("islam").concat(safeProducts).slice(0, 10);
  const seerah = byCategory("seerah").concat(islamic).concat(safeProducts).slice(0, 10);
  const history = byCategory("history").concat(safeProducts).slice(0, 10);
  const family = byCategory("family").concat(safeProducts).slice(0, 10);

  return [
    { id: "new", title: "নতুন প্রকাশিত বই", href: "/books/new", products: uniqueProducts(newBooks) },
    { id: "safe-food", title: "সেফ ফুড", href: "/categories/safe-food", products: uniqueProducts(safeFood) },
    { id: "trending", title: "ট্রেন্ডিং বই", href: "/books/trending", products: uniqueProducts(trending) },
    { id: "pre-order", title: "প্রি-অর্ডার", href: "/books/pre-order", products: uniqueProducts(preOrder) },
    { id: "islamic", title: "কুরআনের তরজমা ও তাফসীর", href: "/categories/tafsir", products: uniqueProducts(islamic) },
    { id: "seerah", title: "সীরাতে রাসূলুল্লাহ", href: "/categories/seerah", products: uniqueProducts(seerah) },
    { id: "history", title: "ইতিহাস ও ঐতিহ্য", href: "/categories/history", products: uniqueProducts(history) },
    { id: "family", title: "Families", href: "/categories/family", products: uniqueProducts(family) },
  ];
}

export function bookToProduct(book: Book): Product {
  const originalPrice = book.price;
  const price = book.salePrice || book.price;
  const discountPercent = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined;

  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author?.name,
    publisher: book.publisher?.name,
    description: book.description,
    image: book.coverImageUrl ?? makeBookCover("Book", book.title.slice(0, 16), "#14532d", "#16a34a"),
    price,
    originalPrice: originalPrice > price ? originalPrice : undefined,
    discountPercent,
    stock: book.stock,
    categoryIds: book.categories.map((category) => category.id),
    categoryNames: book.categories.map((category) => category.name),
  };
}

export function cartItemToProduct(item: Cart["items"][number]): Product {
  const originalPrice = item.originalPrice;
  const price = item.unitPrice;
  const discountPercent = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined;

  return {
    id: item.bookId,
    slug: item.slug,
    title: item.title,
    image: item.coverImageUrl ?? makeBookCover("Book", item.title.slice(0, 16), "#14532d", "#16a34a"),
    price,
    originalPrice: originalPrice > price ? originalPrice : undefined,
    discountPercent,
    stock: item.availableStock,
    categoryIds: [],
  };
}

export async function getApiCart(token: string) {
  return storefrontRequest<Cart>("/cart", { token });
}

export async function addApiCartItem(token: string, bookId: string, quantity: number) {
  return storefrontRequest<Cart>("/cart/items", { method: "POST", token, body: { bookId, quantity } });
}

export async function updateApiCartItem(token: string, bookId: string, quantity: number) {
  return storefrontRequest<Cart>(`/cart/items/${bookId}`, { method: "PATCH", token, body: { quantity } });
}

export async function removeApiCartItem(token: string, bookId: string) {
  return storefrontRequest<Cart>(`/cart/items/${bookId}`, { method: "DELETE", token });
}

export async function clearApiCart(token: string) {
  return storefrontRequest<Cart>("/cart", { method: "DELETE", token });
}

export async function validateApiCoupon(payload: ValidateCouponRequest) {
  return storefrontRequest<CouponValidation>("/promotions/coupons/validate", { method: "POST", body: payload });
}

export async function createApiOrder(token: string, payload: CreateOrderRequest) {
  return storefrontRequest<Order>("/orders", { method: "POST", token, body: payload });
}

export async function createApiAddress(token: string, payload: UpsertAddressRequest) {
  return storefrontRequest<CustomerAddress>("/profile/addresses", { method: "POST", token, body: payload });
}

function categoryToStorefrontCategory(category: ApiCategory): Category {
  return {
    id: category.id,
    title: category.name,
    href: `/categories/${category.slug}`,
    image: category.imageUrl ?? makeCircleImage(category.name.slice(0, 12), "#14532d"),
  };
}

function uniqueProducts(products: Product[]) {
  return Array.from(new Map(products.map((product) => [product.id, product])).values()).slice(0, 10);
}
