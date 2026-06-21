import type {
  AdminCustomerSummary,
  AdminDashboardSummary,
  AdminUpdateUserRequest,
  BuyXGetYRule,
  CashbackRule,
  AssignDeliveryRequest,
  Author,
  BatchPickingRequest,
  Book,
  Brand,
  Category,
  Coupon,
  DashboardMetrics,
  CreateSavedCardRequest,
  CreateSavedPaymentMethodRequest,
  CustomerProfile,
  DeliveryReport,
  DispatchRequest,
  FlashSaleCampaign,
  InventoryItem,
  InventoryReport,
  MembershipPlan,
  MoneyReport,
  Order,
  PackingVerificationRequest,
  PaginatedResponse,
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
  UpsertCouponRequest,
  UpsertPublisherRequest,
  WarehouseOrder,
  WarehouseReport,
  CohortReport,
  RetentionReport,
  User,
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
  analyticsDashboard: (token: string | null) => adminRequest<DashboardMetrics>(token, "/admin/analytics/dashboard"),
  gmvReport: (token: string | null) => adminRequest<MoneyReport>(token, "/admin/analytics/gmv"),
  revenueReport: (token: string | null) => adminRequest<MoneyReport>(token, "/admin/analytics/revenue"),
  inventoryReport: (token: string | null) => adminRequest<InventoryReport>(token, "/admin/analytics/inventory"),
  warehouseReport: (token: string | null) => adminRequest<WarehouseReport>(token, "/admin/analytics/warehouse"),
  deliveryReport: (token: string | null) => adminRequest<DeliveryReport>(token, "/admin/analytics/delivery"),
  cohortReport: (token: string | null) => adminRequest<CohortReport>(token, "/admin/analytics/cohorts"),
  retentionReport: (token: string | null) => adminRequest<RetentionReport>(token, "/admin/analytics/retention"),
  books: (token: string | null, params?: ListParams) => adminRequest<PaginatedResponse<Book>>(token, `/books${queryString(params)}`),
  book: (token: string | null, slug: string) => adminRequest<Book>(token, `/books/${slug}`),
  createBook: (token: string | null, payload: UpsertBookRequest) => adminRequest<Book>(token, "/admin/books", { method: "POST", body: payload }),
  updateBook: (token: string | null, id: string, payload: UpsertBookRequest) => adminRequest<Book>(token, `/admin/books/${id}`, { method: "PATCH", body: payload }),
  deleteBook: (token: string | null, id: string) => adminRequest<void>(token, `/admin/books/${id}`, { method: "DELETE" }),
  authors: (token: string | null) => adminRequest<Author[]>(token, "/authors"),
  adminAuthors: (token: string | null, params?: ListParams) => adminRequest<PaginatedResponse<Author>>(token, `/admin/authors${queryString(params)}`),
  createAuthor: (token: string | null, payload: UpsertAuthorRequest) => adminRequest<Author>(token, "/admin/authors", { method: "POST", body: payload }),
  updateAuthor: (token: string | null, id: string, payload: UpsertAuthorRequest) => adminRequest<Author>(token, `/admin/authors/${id}`, { method: "PATCH", body: payload }),
  deleteAuthor: (token: string | null, id: string) => adminRequest<void>(token, `/admin/authors/${id}`, { method: "DELETE" }),
  publishers: (token: string | null) => adminRequest<Publisher[]>(token, "/publishers"),
  adminPublishers: (token: string | null, params?: ListParams) => adminRequest<PaginatedResponse<Publisher>>(token, `/admin/publishers${queryString(params)}`),
  createPublisher: (token: string | null, payload: UpsertPublisherRequest) => adminRequest<Publisher>(token, "/admin/publishers", { method: "POST", body: payload }),
  updatePublisher: (token: string | null, id: string, payload: UpsertPublisherRequest) => adminRequest<Publisher>(token, `/admin/publishers/${id}`, { method: "PATCH", body: payload }),
  deletePublisher: (token: string | null, id: string) => adminRequest<void>(token, `/admin/publishers/${id}`, { method: "DELETE" }),
  brands: (token: string | null) => adminRequest<Brand[]>(token, "/brands"),
  adminBrands: (token: string | null, params?: ListParams) => adminRequest<PaginatedResponse<Brand>>(token, `/admin/brands${queryString(params)}`),
  createBrand: (token: string | null, payload: UpsertBrandRequest) => adminRequest<Brand>(token, "/admin/brands", { method: "POST", body: payload }),
  updateBrand: (token: string | null, id: string, payload: UpsertBrandRequest) => adminRequest<Brand>(token, `/admin/brands/${id}`, { method: "PATCH", body: payload }),
  deleteBrand: (token: string | null, id: string) => adminRequest<void>(token, `/admin/brands/${id}`, { method: "DELETE" }),
  categories: (token: string | null) => adminRequest<Category[]>(token, "/categories"),
  adminCategories: (token: string | null, params?: ListParams) => adminRequest<PaginatedResponse<Category>>(token, `/admin/categories${queryString(params)}`),
  createCategory: (token: string | null, payload: UpsertCategoryRequest) => adminRequest<Category>(token, "/admin/categories", { method: "POST", body: payload }),
  updateCategory: (token: string | null, id: string, payload: UpsertCategoryRequest) => adminRequest<Category>(token, `/admin/categories/${id}`, { method: "PATCH", body: payload }),
  deleteCategory: (token: string | null, id: string) => adminRequest<void>(token, `/admin/categories/${id}`, { method: "DELETE" }),
  inventory: (token: string | null, params?: ListParams) => adminRequest<PaginatedResponse<InventoryItem>>(token, `/admin/inventory${queryString(params)}`),
  updateStock: (token: string | null, bookId: string, payload: UpdateStockRequest) => adminRequest<InventoryItem>(token, `/admin/inventory/${bookId}`, { method: "PATCH", body: payload }),
  movements: (token: string | null, bookId?: string) => adminRequest<StockMovement[]>(token, `/admin/inventory/movements${queryString({ bookId })}`),
  pickingQueue: (token: string | null) => adminRequest<WarehouseOrder[]>(token, "/admin/warehouse/picking-queue"),
  packingQueue: (token: string | null) => adminRequest<WarehouseOrder[]>(token, "/admin/warehouse/packing-queue"),
  batchPicking: (token: string | null, payload: BatchPickingRequest) => adminRequest<WarehouseOrder[]>(token, "/admin/warehouse/batch-picking", { method: "POST", body: payload }),
  verifyPacking: (token: string | null, payload: PackingVerificationRequest) => adminRequest<WarehouseOrder[]>(token, "/admin/warehouse/packing-verification", { method: "POST", body: payload }),
  dispatchOrder: (token: string | null, payload: DispatchRequest) => adminRequest<WarehouseOrder[]>(token, "/admin/warehouse/dispatch", { method: "POST", body: payload }),
  orders: (token: string | null, params?: ListParams) => adminRequest<PaginatedResponse<Order>>(token, `/admin/orders${queryString(params)}`),
  order: (token: string | null, id: string) => adminRequest<Order>(token, `/admin/orders/${id}`),
  updateOrderStatus: (token: string | null, id: string, payload: UpdateOrderStatusRequest) => adminRequest<Order>(token, `/admin/orders/${id}/status`, { method: "PATCH", body: payload }),
  assignDelivery: (token: string | null, id: string, payload: AssignDeliveryRequest) => adminRequest<Order>(token, `/admin/orders/${id}/delivery`, { method: "POST", body: payload }),
  coupons: (token: string | null) => adminRequest<Coupon[]>(token, "/admin/promotions/coupons"),
  createCoupon: (token: string | null, payload: UpsertCouponRequest) => adminRequest<Coupon>(token, "/admin/promotions/coupons", { method: "POST", body: payload }),
  buyXGetYRules: (token: string | null) => adminRequest<BuyXGetYRule[]>(token, "/admin/promotions/buy-x-get-y"),
  flashSales: (token: string | null) => adminRequest<FlashSaleCampaign[]>(token, "/admin/promotions/flash-sales"),
  cashbackRules: (token: string | null) => adminRequest<CashbackRule[]>(token, "/admin/promotions/cashback-rules"),
  membershipPlans: (token: string | null) => adminRequest<MembershipPlan[]>(token, "/admin/promotions/memberships"),
  customers: (token: string | null, params?: ListParams) => adminRequest<PaginatedResponse<AdminCustomerSummary>>(token, `/admin/customers${queryString(params)}`),
  customer: (token: string | null, id: string) => adminRequest<CustomerProfile>(token, `/admin/customers/${id}`),
  updateUser: (token: string | null, id: string, payload: AdminUpdateUserRequest) => adminRequest<User>(token, `/auth/admin/users/${id}`, { method: "PATCH", body: payload }),
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
