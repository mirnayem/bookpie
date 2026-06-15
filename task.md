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

---

## Phase 1 - Design System

* [x] Install Tailwind
* [x] Install Shadcn UI
* [x] Create color tokens
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

## Admin MVP Execution Plan

Backend-first admin/customer operations required before admin UI:

* [x] Profile and address database model
* [x] Customer profile read/update APIs
* [x] Customer address CRUD APIs
* [x] Admin customer list/detail APIs
* [x] Single warehouse inventory database model
* [x] Admin inventory list/update APIs
* [x] Stock movement log APIs
* [x] Order database model
* [x] Create order from cart API
* [x] Customer order history/detail APIs
* [x] Admin order list/detail/status APIs
* [x] Manual delivery assignment database model
* [x] Admin delivery assignment/update APIs
* [x] Admin dashboard summary API
* [x] Shared frontend contracts for profile, inventory, orders, delivery, admin dashboard
* [ ] Admin frontend shell
* [ ] Admin customer management UI
* [ ] Admin inventory management UI
* [ ] Admin order management UI
* [ ] Admin delivery assignment UI
* [ ] Admin profile/settings UI

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
