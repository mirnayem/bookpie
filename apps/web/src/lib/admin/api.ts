import type {
  AdminCustomerSummary,
  AdminDashboardSummary,
  AssignDeliveryRequest,
  Author,
  Book,
  Brand,
  Category,
  CreateSavedCardRequest,
  CreateSavedPaymentMethodRequest,
  CustomerProfile,
  InventoryItem,
  Order,
  Publisher,
  SavedCard,
  SavedPaymentMethod,
  StockMovement,
  UpdateOrderStatusRequest,
  UpdateProfileRequest,
  UpdateStockRequest,
  UpsertAddressRequest,
  UpsertAuthorRequest,
  UpsertBookRequest,
  UpsertBrandRequest,
  UpsertCategoryRequest,
  UpsertPublisherRequest,
} from "@bookpie/shared";

import { adminRequest } from "@/lib/api-client";

export type ListParams = {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  stockStatus?: string;
  bookId?: string;
};

function queryString(params: ListParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const value = searchParams.toString();
  return value ? `?${value}` : "";
}

export const adminApi = {
  dashboardSummary: (token: string | null) => adminRequest<AdminDashboardSummary>(token, "/admin/dashboard/summary"),
  books: (token: string | null, params?: ListParams) => adminRequest<Book[]>(token, `/books${queryString(params)}`),
  book: (token: string | null, slug: string) => adminRequest<Book>(token, `/books/${slug}`),
  createBook: (token: string | null, payload: UpsertBookRequest) => adminRequest<Book>(token, "/admin/books", { method: "POST", body: payload }),
  updateBook: (token: string | null, id: string, payload: UpsertBookRequest) => adminRequest<Book>(token, `/admin/books/${id}`, { method: "PATCH", body: payload }),
  deleteBook: (token: string | null, id: string) => adminRequest<void>(token, `/admin/books/${id}`, { method: "DELETE" }),
  authors: (token: string | null) => adminRequest<Author[]>(token, "/authors"),
  createAuthor: (token: string | null, payload: UpsertAuthorRequest) => adminRequest<Author>(token, "/admin/authors", { method: "POST", body: payload }),
  updateAuthor: (token: string | null, id: string, payload: UpsertAuthorRequest) => adminRequest<Author>(token, `/admin/authors/${id}`, { method: "PATCH", body: payload }),
  deleteAuthor: (token: string | null, id: string) => adminRequest<void>(token, `/admin/authors/${id}`, { method: "DELETE" }),
  publishers: (token: string | null) => adminRequest<Publisher[]>(token, "/publishers"),
  createPublisher: (token: string | null, payload: UpsertPublisherRequest) => adminRequest<Publisher>(token, "/admin/publishers", { method: "POST", body: payload }),
  updatePublisher: (token: string | null, id: string, payload: UpsertPublisherRequest) => adminRequest<Publisher>(token, `/admin/publishers/${id}`, { method: "PATCH", body: payload }),
  deletePublisher: (token: string | null, id: string) => adminRequest<void>(token, `/admin/publishers/${id}`, { method: "DELETE" }),
  brands: (token: string | null) => adminRequest<Brand[]>(token, "/brands"),
  createBrand: (token: string | null, payload: UpsertBrandRequest) => adminRequest<Brand>(token, "/admin/brands", { method: "POST", body: payload }),
  updateBrand: (token: string | null, id: string, payload: UpsertBrandRequest) => adminRequest<Brand>(token, `/admin/brands/${id}`, { method: "PATCH", body: payload }),
  deleteBrand: (token: string | null, id: string) => adminRequest<void>(token, `/admin/brands/${id}`, { method: "DELETE" }),
  categories: (token: string | null) => adminRequest<Category[]>(token, "/categories"),
  createCategory: (token: string | null, payload: UpsertCategoryRequest) => adminRequest<Category>(token, "/admin/categories", { method: "POST", body: payload }),
  updateCategory: (token: string | null, id: string, payload: UpsertCategoryRequest) => adminRequest<Category>(token, `/admin/categories/${id}`, { method: "PATCH", body: payload }),
  deleteCategory: (token: string | null, id: string) => adminRequest<void>(token, `/admin/categories/${id}`, { method: "DELETE" }),
  inventory: (token: string | null, params?: ListParams) => adminRequest<InventoryItem[]>(token, `/admin/inventory${queryString(params)}`),
  updateStock: (token: string | null, bookId: string, payload: UpdateStockRequest) => adminRequest<InventoryItem>(token, `/admin/inventory/${bookId}`, { method: "PATCH", body: payload }),
  movements: (token: string | null, bookId?: string) => adminRequest<StockMovement[]>(token, `/admin/inventory/movements${queryString({ bookId })}`),
  orders: (token: string | null, params?: ListParams) => adminRequest<Order[]>(token, `/admin/orders${queryString(params)}`),
  order: (token: string | null, id: string) => adminRequest<Order>(token, `/admin/orders/${id}`),
  updateOrderStatus: (token: string | null, id: string, payload: UpdateOrderStatusRequest) => adminRequest<Order>(token, `/admin/orders/${id}/status`, { method: "PATCH", body: payload }),
  assignDelivery: (token: string | null, id: string, payload: AssignDeliveryRequest) => adminRequest<Order>(token, `/admin/orders/${id}/delivery`, { method: "POST", body: payload }),
  customers: (token: string | null, params?: ListParams) => adminRequest<AdminCustomerSummary[]>(token, `/admin/customers${queryString(params)}`),
  customer: (token: string | null, id: string) => adminRequest<CustomerProfile>(token, `/admin/customers/${id}`),
  profile: (token: string | null) => adminRequest<CustomerProfile>(token, "/profile"),
  updateProfile: (token: string | null, payload: UpdateProfileRequest) => adminRequest<CustomerProfile>(token, "/profile", { method: "PATCH", body: payload }),
  createAddress: (token: string | null, payload: UpsertAddressRequest) => adminRequest(token, "/profile/addresses", { method: "POST", body: payload }),
  savedCards: (token: string | null) => adminRequest<SavedCard[]>(token, "/profile/saved-cards"),
  createSavedCard: (token: string | null, payload: CreateSavedCardRequest) => adminRequest<SavedCard>(token, "/profile/saved-cards", { method: "POST", body: payload }),
  setDefaultSavedCard: (token: string | null, id: string) => adminRequest<SavedCard>(token, `/profile/saved-cards/${id}/default`, { method: "PATCH" }),
  deleteSavedCard: (token: string | null, id: string) => adminRequest<void>(token, `/profile/saved-cards/${id}`, { method: "DELETE" }),
  savedPaymentMethods: (token: string | null) => adminRequest<SavedPaymentMethod[]>(token, "/profile/payment-methods"),
  createSavedPaymentMethod: (token: string | null, payload: CreateSavedPaymentMethodRequest) => adminRequest<SavedPaymentMethod>(token, "/profile/payment-methods", { method: "POST", body: payload }),
  setDefaultSavedPaymentMethod: (token: string | null, id: string) => adminRequest<SavedPaymentMethod>(token, `/profile/payment-methods/${id}/default`, { method: "PATCH" }),
  deleteSavedPaymentMethod: (token: string | null, id: string) => adminRequest<void>(token, `/profile/payment-methods/${id}`, { method: "DELETE" }),
};
