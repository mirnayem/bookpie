# Wafilife Clone - Master Task List

## Phase 0 - Project Setup

* [x] Create monorepo
* [x] Setup pnpm workspace
* [x] Setup Rust workspace
* [x] Setup Docker environment
* [x] Setup PostgreSQL
* [x] Setup Redis
* [x] Setup Meilisearch
* [x] Setup MinIO
* [x] Setup NATS
* [x] Setup CI/CD pipeline
* [x] Setup GitHub Actions
* [x] Setup staging environment
* [x] Setup production environment
* [x] Setup monitoring
* [x] Setup logging
* [x] Setup OpenTelemetry
* [x] Add local demo seed data for users, catalog, carts, orders, inventory, and delivery

---

## Phase 1 - Design System

* [x] Install Tailwind
* [x] Install Shadcn UI
* [x] Create color tokens
* [x] Update primary brand palette to indigo/violet
* [x] Create typography tokens
* [x] Create spacing system
* [x] Create responsive breakpoints
* [x] Create Button component
* [x] Create Input component
* [x] Create Select component
* [x] Create Modal component
* [x] Create Drawer component
* [x] Create Toast component
* [x] Create Skeleton component
* [x] Create Product Card
* [x] Create Product Grid
* [x] Create Pagination
* [x] Create Address Card
* [x] Create Cart Drawer

---

## Phase 2 - Authentication

* [x] Register API
* [x] Login API
* [x] Refresh Token API
* [x] Logout API
* [x] Password Reset API
* [x] OTP Service
* [x] Email Verification
* [x] Phone Verification
* [x] JWT middleware
* [x] Role based authorization

Roles:

* Customer
* Warehouse Manager
* Delivery Agent
* Admin
* Super Admin

---

## Phase 3 - Customer Profiles

* [x] Customer model
* [x] Profile API
* [x] Update Profile API
* [x] Multiple Address Support
* [x] Default Address
* [x] Geo-location storage
* [x] Address validation
* [ ] Saved cards
* [ ] Saved payment methods

---

## Admin Dashboard Execution Plan

Goal: Build a backend-connected admin dashboard for managing BookPie bookstore operations. Admin UI must use existing APIs first, add backend gaps only when required, and keep all contracts in `packages/shared`.

### Admin Foundation

* [x] Create `/admin` route group in Next.js App Router
* [x] Create admin layout with sidebar, topbar, breadcrumbs, and content shell
* [x] Add protected admin route guard using auth state and admin roles
* [x] Add admin API client helpers using normalized API responses
* [x] Add TanStack Query provider usage for all admin reads/writes
* [x] Add shared admin table, empty state, loading state, error state, and confirm dialog components
* [x] Add admin dashboard navigation for Dashboard, Products, Orders, Customers, Inventory, Delivery, Reports, Settings
* [x] Add responsive admin layout for desktop, tablet, and mobile

### Admin Dashboard Overview

* [x] Connect dashboard summary cards to `/api/v1/admin/dashboard/summary`
* [x] Show total customers, books, orders, pending orders, low-stock books, and paid revenue
* [x] Add recent orders panel
* [x] Add low-stock inventory panel
* [x] Add quick actions for creating product, updating inventory, and reviewing pending orders
* [x] Add skeleton/loading/error states

### Product Management

* [x] Create products list page
* [x] Connect list to `/api/v1/books`
* [x] Add product search, pagination, and basic sorting
* [x] Add product create form using React Hook Form + Zod
* [x] Add product edit form using existing book details data
* [x] Connect create to `POST /api/v1/admin/books`
* [x] Connect update to `PATCH /api/v1/admin/books/{id}`
* [x] Connect delete to `DELETE /api/v1/admin/books/{id}`
* [x] Manage title, slug, description, author, publisher, categories, price, sale price, stock, and cover image URL
* [x] Validate sale price cannot exceed regular price
* [x] Show product status indicators for in stock, low stock, and out of stock
* [x] Add delete confirmation and mutation success/error toasts

### Author, Publisher, And Category Management

* [x] Create authors management page
* [x] Connect author CRUD to existing author admin endpoints
* [x] Create publishers management page
* [x] Connect publisher CRUD to existing publisher admin endpoints
* [x] Create categories management page
* [x] Connect category CRUD to existing category admin endpoints
* [x] Add reusable name/slug form component
* [x] Add duplicate/validation error display
* [x] Use these entities as selectable dependencies in product forms

### Inventory Management

* [x] Create inventory list page
* [x] Connect inventory table to `/api/v1/admin/inventory`
* [x] Add filters for low stock, out of stock, and search
* [x] Add stock update dialog connected to `PATCH /api/v1/admin/inventory/{book_id}`
* [x] Require admin note for stock adjustments
* [x] Show stock movement history from `/api/v1/admin/inventory/movements`
* [x] Add inventory detail drawer with book info, current stock, and movement timeline
* [x] Prevent negative stock in UI validation
* [x] Show mutation success/error toasts

### Order Management

* [x] Create orders list page
* [x] Connect table to `/api/v1/admin/orders`
* [x] Add status filter for pending, confirmed, picking, packed, out for delivery, delivered, cancelled, refunded
* [x] Add order detail page or drawer connected to `/api/v1/admin/orders/{order_id}`
* [x] Show customer, address, items, totals, payment status, order status, and delivery assignment
* [x] Add order status update control connected to `PATCH /api/v1/admin/orders/{order_id}/status`
* [x] Add timeline display
* [x] Add cancellation/refund placeholders as disabled actions until backend support exists
* [x] Add printable invoice task placeholder

### Delivery Management

* [x] Create delivery assignments page
* [x] Use admin order data to show orders needing delivery assignment
* [x] Add delivery assignment form connected to `POST /api/v1/admin/orders/{order_id}/delivery`
* [x] Add delivery update form connected to `PATCH /api/v1/admin/orders/{order_id}/delivery`
* [x] Manage agent name, agent phone, delivery status, and note
* [x] Show delivery status badges
* [x] Add validation for agent phone and required agent name

### Customer And User Management

* [x] Create customers list page
* [x] Connect customers table to `/api/v1/admin/customers`
* [x] Create customer detail page connected to `/api/v1/admin/customers/{customer_id}`
* [x] Show profile, email, phone, addresses, and order history link
* [x] Add customer search task if backend query support is missing
* [x] Add user role management task if backend role update endpoint is missing
* [x] Add account status management task if backend active/blocked field is missing

### Admin Profile And Settings

* [x] Create admin profile page
* [x] Reuse profile APIs for admin profile read/update where compatible
* [x] Add password change task if backend endpoint is missing
* [x] Add admin session/logout action
* [x] Add basic store settings placeholder for contact info, payment methods, and delivery defaults
* [x] Keep unavailable settings visibly disabled until backend support exists

### Reports And Audit Readiness

* [x] Create reports overview page
* [x] Add sales summary placeholder using dashboard summary data
* [x] Add inventory report placeholder using inventory data
* [x] Add order export task if backend CSV/export endpoint is missing
* [x] Add audit log backend task for product, inventory, order, and user admin actions
* [x] Add activity feed placeholder once audit log API exists

### Shared Contracts And API Gaps

* [x] Add missing admin request/response schemas to `packages/shared`
* [x] Add admin list query schemas for pagination, search, status filters, and sorting
* [x] Add backend pagination metadata if current list APIs are insufficient
* [x] Add backend customer search/filter support if required by UI
* [x] Add backend user role/status update endpoints if required by admin user management
* [x] Add backend invoice/export endpoints if required by reports
* [x] Keep all frontend admin forms validated with shared Zod schemas

### Admin Testing And QA

* [x] Add component tests for admin layout, protected route guard, tables, and forms
* [x] Add mutation tests for product create/edit/delete UI states
* [x] Add mutation tests for order status and delivery assignment UI states
* [x] Add inventory stock update tests
* [x] Add Playwright smoke test for `/admin`
* [x] Add Playwright admin flows for product create, stock update, order status update, and delivery assignment
* [x] Verify no horizontal overflow at 1440px, 768px, and 390px
* [x] Verify Bengali and English text do not overlap in tables, badges, and forms
* [x] Run `pnpm --filter @bookpie/web test`
* [x] Run `pnpm --filter @bookpie/web lint`
* [x] Run `cargo test -p api`
* [x] Run `cargo clippy -p api --all-targets --all-features`

---

## Phase 4 - Catalog

### Categories

* [ ] Category CRUD
* [ ] Category hierarchy
* [ ] Category image upload

### Brands

* [ ] Brand CRUD
* [ ] Brand logo upload

### Products

* [ ] Product CRUD
* [ ] Product image upload
* [ ] Product gallery
* [ ] Product variants
* [ ] Product tags
* [ ] Product specifications
* [ ] Product attributes
* [ ] Product SEO
* [ ] Product barcode

### Pricing

* [ ] Base price
* [ ] Warehouse price
* [ ] Discount price
* [ ] Dynamic pricing

---

## Phase 5 - Inventory

* [ ] Warehouse model
* [ ] Shelf model
* [ ] SKU model
* [ ] Stock model
* [ ] Stock movement logs
* [ ] Purchase orders
* [ ] Supplier management
* [ ] Batch tracking
* [ ] Expiry tracking
* [ ] Damage tracking
* [ ] Inventory reconciliation
* [ ] Cycle counting

---

## Phase 6 - Search

* [ ] Meilisearch integration
* [ ] Product indexing
* [ ] Category indexing
* [ ] Search API
* [ ] Autocomplete
* [ ] Synonym support
* [ ] Bengali search support
* [ ] Search analytics

---

## Phase 7 - Customer Storefront

### Home

* [ ] Hero banners
* [ ] Featured products
* [ ] Trending products
* [ ] Flash sale section
* [ ] Recommended section

### Product Listing

* [ ] Filters
* [ ] Sorting
* [ ] Infinite scroll
* [ ] Pagination

### Product Details

* [ ] Image gallery
* [ ] Product reviews
* [ ] Ratings
* [ ] Related products
* [ ] Frequently bought together

---

## Phase 8 - Cart

* [ ] Add to cart
* [ ] Update quantity
* [ ] Remove item
* [ ] Save for later
* [ ] Cart persistence
* [ ] Guest cart
* [ ] Merge cart after login

---

## Phase 9 - Checkout

* [ ] Delivery slot selection
* [ ] Address selection
* [ ] Coupon application
* [ ] Payment selection
* [ ] Order summary
* [ ] Tax calculation
* [ ] Shipping calculation

---

## Phase 10 - Payments

### SSLCommerz

* [ ] Initiate payment
* [ ] Validation callback
* [ ] Refund support

### Stripe

* [ ] PaymentIntent
* [ ] Stripe Elements
* [ ] Webhook handling

### bKash

* [ ] Create payment
* [ ] Execute payment
* [ ] Refund support

### Nagad

* [ ] Payment initiation
* [ ] Verification

---

## Phase 11 - Orders

* [x] Order creation
* [x] Order confirmation
* [ ] Order cancellation
* [ ] Order refund
* [ ] Order return
* [x] Order timeline
* [ ] Invoice generation

Order States:

* Pending
* Confirmed
* Picking
* Packed
* Out for Delivery
* Delivered
* Cancelled
* Refunded

---

## Phase 12 - Warehouse Management

* [ ] Picking queue
* [ ] Packing queue
* [ ] Batch picking
* [ ] Picker assignment
* [ ] Barcode scanning
* [ ] Packing verification
* [ ] Dispatch management

---

## Phase 13 - Delivery Management

* [ ] Delivery zones
* [ ] Delivery fee engine
* [ ] Rider management
* [ ] Rider onboarding
* [ ] Rider app API
* [ ] Route optimization
* [ ] Live tracking
* [ ] Delivery proof upload
* [ ] Failed delivery workflow

---

## Phase 14 - Promotions

* [ ] Coupon engine
* [ ] Buy X Get Y
* [ ] Flash sales
* [ ] Referral system
* [ ] Loyalty points
* [ ] Cashback engine
* [ ] Membership plans

---

## Phase 15 - Notifications

* [ ] Email service
* [ ] SMS service
* [ ] Push notifications
* [ ] WhatsApp integration
* [ ] Order notifications
* [ ] Marketing notifications

---

## Phase 16 - Reviews

* [ ] Product reviews
* [ ] Product ratings
* [ ] Review moderation
* [ ] Photo reviews

---

## Phase 17 - Analytics

* [ ] Dashboard metrics
* [ ] GMV reports
* [ ] Revenue reports
* [ ] Inventory reports
* [ ] Warehouse reports
* [ ] Delivery reports
* [ ] Cohort analysis
* [ ] Customer retention

---

## Phase 18 - Admin Portal

Track detailed implementation in `Admin Dashboard Execution Plan`.

* [ ] User management
* [ ] Product management
* [ ] Inventory management
* [ ] Warehouse management
* [ ] Order management
* [ ] Promotion management
* [ ] Delivery management
* [ ] Analytics dashboard

---

## Phase 19 - Security

* [ ] Rate limiting
* [ ] CSRF protection
* [ ] XSS protection
* [ ] Audit logging
* [ ] RBAC
* [ ] Secrets management

---

## Phase 20 - Performance

* [ ] Redis caching
* [ ] CDN integration
* [ ] Image optimization
* [ ] Query optimization
* [ ] Database indexing
* [ ] Load testing

---

## Phase 21 - Mobile App API Readiness

* [ ] Versioned APIs
* [ ] OpenAPI docs
* [ ] Swagger UI
* [ ] Mobile auth flow
* [ ] Push token support

---

## Phase 22 - Production Launch

* [ ] Backup strategy
* [ ] Disaster recovery
* [ ] Blue/green deployment
* [ ] Monitoring alerts
* [ ] SLA dashboard
* [ ] Penetration testing
* [ ] Launch checklist
