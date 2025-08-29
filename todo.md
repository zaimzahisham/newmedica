# NewMedica MVP To-Do List - PRIORITY BASED

This document outlines tasks to complete the MVP for NewMedica, **prioritized by blocking dependencies**. Follow GEMINI.md/WARP.md TDD approach: write tests first, implement minimal code, refactor.

**CRITICAL**: Address 🔴 BLOCKERS before any other work. These prevent MVP progress.

---

## 🔴 PHASE 0: CRITICAL BLOCKERS (Fix Immediately)

*Goal: Resolve blockers preventing MVP development*

### Backend Priority 1 - Fix Data Models & Tests

#### Task 0.1: Add Timestamps to All Models (BLOCKER) - ✅ COMPLETED
**Priority**: 🔴 Critical - Blocks sorting functionality
**Estimated Time**: 2-3 hours
**TDD Approach**: 
1. Write tests expecting `created_at`/`updated_at` fields
2. Add timestamp fields to models
3. Generate Alembic migration
4. Run tests to confirm `cd newmedica-backend && uv run pytest tests/ -v`

**Files to Update**:
- `app/models/user.py`: Add `created_at: datetime, updated_at: datetime`
- `app/models/product.py`: Add timestamp fields
- `app/models/category.py`: Add timestamp fields  
- `app/models/product_media.py`: Add timestamp fields
- Generate migration: `alembic revision --autogenerate -m "add_timestamps"`
- Apply migration: `alembic upgrade head`

**Acceptance Criteria**:
- [x] All models have `created_at` and `updated_at` fields
- [x] Alembic migration applies cleanly
- [x] Product sorting by date works
- [x] All existing tests pass

#### Task 0.2: Fix Failing Test Suite (BLOCKER) - ✅ COMPLETED
**Priority**: 🔴 Critical - Blocks confident development
**Current Issues**:
- `test_get_products_filtered_by_category`: Returns 2 items instead of 1
- `test_get_products_sorted_by_price`: Incorrect sort order
- IMPORTANT SORT TESTS MISSING: missing test get products sorted_by alphabetical and updated_at as handled at /newmedica-backend/app/repositories/product_repository.py
    - IMPORTANT NOTE : at the frontend level, i am able to use the sort by filter just fine. meaning the api is working, but the test fails. 
    - IMPORTANT NOTE : double check how frontend handles the sort by filter along with how the current api works before updating the test
- Cart tests: Fixture name errors (`client` vs `async_client`)

**Action Required**:
1. Fix test data setup to ensure predictable filtering
2. Debug price sorting logic
3. Fix cart test fixtures
4. Run: `cd newmedica-backend && uv run pytest tests/ -v` until all pass

**Acceptance Criteria**:
- [x] All 16 tests pass without errors
- [x] Test coverage remains ≥80%

#### Task 0.3: Secure Environment Configuration (BLOCKER) - ✅ COMPLETED
**Priority**: 🔴 Critical Security Issue
**Action Required**:
1. Create `.env.example` file with template
2. Move hardcoded secrets from `app/core/settings.py` to environment variables
3. Update settings to read from `.env`
4. Add `.env` to `.gitignore`

**Files to Update**:
- Create `newmedica-backend/.env.example`
- Update `app/core/settings.py` to use environment variables
- Update `newmedica-backend/.gitignore`

#### Task 0.4: Address Backend Deprecation Warnings (BLOCKER) - ✅ COMPLETED
**Priority**: 🔴 Critical - Code quality and future compatibility
**Estimated Time**: 3-5 hours
**Action Required**:
1. Updated `datetime.datetime.utcnow()` to `datetime.datetime.now(timezone.utc)` where applicable.
2. Migrated Pydantic V1 `dict()` and `from_orm()` methods to Pydantic V2 `model_dump()` and `model_validate()` with `model_config['from_attributes']=True`.
3. Addressed all deprecation warnings identified during test runs, except for external library warnings.
4. Ran: `cd newmedica-backend && uv run pytest tests/ -v` and all tests passed with minimal external warnings.

**Acceptance Criteria**:
- [x] No `DeprecationWarning` messages related to `datetime.datetime.utcnow()` or Pydantic V1 methods are displayed during test runs.
- [x] All existing tests pass.

---

## 🟡 PHASE 1: HIGH PRIORITY MVP FEATURES

*Goal: Implement core e-commerce functionality*

### Backend Priority 2 - Cart & Order Domain

#### Task 1.10: Implement Backend Consistent Error Handling (TDD) - ✅ COMPLETED
**Priority**: 🟡 High - Required for consistent API responses
**Dependencies**: None
**Estimated Time**: 3-4 hours

**TDD Steps**:
1. **Write Tests First**: Create tests for various error scenarios (e.g., 404 Not Found, 400 Bad Request, 401 Unauthorized) expecting the consistent error format.
2. **Implement Error Handling Middleware/Exception Handlers**: Create a custom exception handler or middleware to catch `HTTPException` and other potential errors, formatting them into the `{"error": {"code": ..., "message": ...}}` structure.
3. **Update Existing Endpoints**: Modify existing endpoints to raise custom exceptions or use the new error handling mechanism.
4. **Make Tests Pass**: Ensure all error tests pass and existing functionality remains intact.

**Acceptance Criteria**:
- [x] All API error responses adhere to the `{"error": {"code": ..., "message": ...}}` format.
- [x] Appropriate HTTP status codes are returned for different error types.
- [x] Error messages are clear and informative.
- [x] All existing tests pass.


#### Task 1.1: Implement Cart Domain Models (TDD) - ✅ COMPLETED
**Priority**: 🟡 High - Required for MVP
**Estimated Time**: 4-6 hours

**TDD Steps**:
1. **Write Tests First**: Create `tests/integration/test_cart_complete.py`
2. **Create Models**: `Cart`, `CartItem` with relationships
3. **Create Schemas**: Request/response DTOs
4. **Create Repository**: Cart data access layer
5. **Create Service**: Cart business logic
6. **Create Controller**: Cart request handling
7. **Create Router**: Cart endpoints
8. **Make Tests Pass**: Iterative implementation

**Required Files** (Create using GEMINI.md/WARP.md structure):
- `app/models/cart.py`: Cart and CartItem models
- `app/schemas/cart.py`: Cart DTOs
- `app/repositories/cart_repository.py`: Data access
- `app/services/cart_service.py`: Business logic
- `app/controllers/cart_controller.py`: Request handling
- `app/api/v1/endpoints/cart.py`: API routes

**Required Endpoints**:
- ✅ `POST /api/v1/cart/items`: Add item to cart
- ✅ `GET /api/v1/cart`: Get user's cart
- ✅ `PUT /api/v1/cart/items/{item_id}`: Update quantity
- ✅ `DELETE /api/v1/cart/items/{item_id}`: Remove item

**Acceptance Criteria**:
- [x] All cart endpoints work with proper auth
- [x] Cart persists items across sessions
- [x] Quantity validation prevents negative/zero values
- [x] Price calculations are accurate
- [x] Tests cover happy path + edge cases (for implemented endpoints)

#### Task 1.2: Implement Order Domain Models (TDD) - ✅ COMPLETED
**Priority**: 🟡 High - Required for MVP checkout
**Dependencies**: Task 1.1 (Cart) must be complete
**Estimated Time**: 4-6 hours

**Required Models**: `Order`, `OrderItem` with status tracking
**Required Endpoints**:
- ✅ `POST /api/v1/orders`: Create order from cart
- ✅ `GET /api/v1/orders`: List user orders
- ✅ `GET /api/v1/orders/{order_id}`: Order details

#### Task 1.3: Add Refresh Token Support - ✅ COMPLETED
**Priority**: 🟡 High - Required by GEMINI.md/WARP.md
**Files to Update**:
- `app/api/v1/endpoints/auth.py`: Add `/refresh` endpoint
- `app/core/security.py`: Add refresh token logic
- `app/schemas/token.py`: Add refresh token response

### Frontend Priority 2 - MVP Pages

#### Task 1.4: Implement Cart Page (TDD) - ✅ COMPLETED
**Priority**: 🟡 High - Core e-commerce functionality
**Path**: `/cart`
**Dependencies**: Backend Cart API (Task 1.1)

**Required Components** (create with TDD):
- `app/cart/page.tsx`: Main cart page
- `app/cart/_components/CartItem.tsx`: Individual cart item
- `app/cart/_components/EmptyCart.tsx`: Empty state

**Acceptance Criteria**:
- [x] Shows all cart items with images, names, prices
- [x] Quantity can be updated inline
- [x] Items can be removed
- [x] Price totals calculate correctly
- [x] "Proceed to Checkout" button works
- [x] Empty cart shows appropriate message
- [x] Cart items are sorted alphabetically by product name.
- [x] Navbar cart count correctly reflects total item quantity.

#### Task 1.4.1: Add "Request Quotation" Feature - ✅ COMPLETED
**Priority**: 🟡 High - Key feature for Agent/Healthcare users
**Path**: `/products/[id]`
**Dependencies**: User authentication

**Acceptance Criteria**:
- [x] "Request Quotation" button is visible only to Agent and Healthcare users.
- [x] Modal opens with a form pre-populated with user data.
- [x] Form submission is handled (simulated email).
- [x] Modal has smooth fade-in/fade-out animations.

#### Task 1.5: Implement Checkout Page & Stripe Webhook (TDD) - ✅ COMPLETED
**Priority**: 🟡 High - Required for MVP
**Path**: `/checkout`
**Dependencies**: Backend Order API (Task 1.2), Stripe integration, Frontend Address Management (Task 1.9)

**Work Completed**:
- ✅ UI layout created based on reference design.
- ✅ Form handling with validation (`react-hook-form`, `zod`) is implemented.
- ✅ Stripe client and API route for session creation are complete.
- ✅ Frontend logic to redirect to Stripe's hosted payment page is implemented.
- ✅ Numerous state management and dependency bugs have been resolved.
- ✅ Pre-fill shipping address form with user's primary address.
- ✅ **Config:** `STRIPE_WEBHOOK_SECRET` added to `.env` and `app/core/config.py`.
- ✅ **Endpoint:** `POST /api/v1/webhooks/stripe` created and functional.
- ✅ **Verification:** `stripe.Webhook.construct_event()` implemented to verify signatures.
- ✅ **Service Logic:** `mark_order_as_paid(order_id: int)` implemented in `OrderService`.
- ✅ **Event Handling:** Webhook correctly handles `checkout.session.completed` event.
- ✅ **Testing:** End-to-end flow confirmed to be working.

**Original Files to Create**:
- ✅ `app/checkout/page.tsx`: Checkout form
- ✅ `app/checkout/_components/OrderSummary.tsx`: Order review
- ✅ `lib/stripe.ts`: Stripe client setup

#### Task 1.11: Order Domain v2 — pricing, vouchers, shipping (TDD) - ✅ COMPLETED
**Priority**: 🟡 High - Required for production-ready checkout and reporting
**Dependencies**: Task 1.2 (baseline orders) ✅, Task 1.5 (checkout form) 🟡

**Business Rules Recap**:
- Users: Basic, Agent, Healthcare. Agent/Healthcare receive automatic user-type voucher on registration; admins can assign vouchers to users/user-types; vouchers may also be global.
- Shipping: dynamic, admin-configurable quantity-based fee (first item fee; additional item fee). Future: larger-product rules.

**Data Model Changes (Migrations)**:
1) Extend `order` with: `contact_email`, `payment_method`, `payment_intent_id`, `currency`, `remark`, `subtotal_amount`, `discount_amount`, `shipping_amount`, `total_amount`, `shipping_address` (JSON), `billing_address` (JSON).
2) Extend `order_item` with: `line_subtotal`, `discount_amount`, `line_total`, `snapshot_name`, `snapshot_price`, `snapshot_media_url`.
3) Create `voucher` table: `code`, `type` (percent|fixed), `value`, `scope` (global|user_type|user), `target_user_type` (nullable), `target_user_id` (nullable), `is_active`, `valid_from`, `valid_to`, `usage_limit`, timestamps.
4) Create `shipping_config` table: `base_fee_first_item`, `additional_fee_per_item`, optional `rules` JSON, `is_active`, `updated_at`. ✅ Done (migration applied)

**API Changes**:
- `POST /api/v1/orders`: Body includes `contact_email`, `payment_method`, `remark`, `shipping_address`, optional `billing_address`, optional `voucher_code`. Creates order from cart with pricing rules and item snapshots. Returns `OrderRead` with items and totals.
- `POST /api/v1/orders/{id}/mark-paid`: Keep existing.
- Admin (scaffold): `GET/PUT /api/v1/admin/shipping-config`. (Voucher CRUD can follow later.)

**Service Logic**:
- Compute subtotal from cart; auto-apply best applicable voucher (user-type/user/global); compute shipping via `shipping_config`; persist all amounts and addresses; default `payment_status=pending`.

**Frontend Changes**:
- Checkout submit should include payment method, shipping/billing addresses, contact email, remark, optional voucher code; use server totals for display after order creation. Stripe flow may create order pre-redirect, then mark-paid on success (current helper) — webhook later.

**Acceptance Criteria**:
- [x] Orders persist shipping/billing JSON, payment method, contact email, remark, currency, and computed amounts (subtotal/discount/shipping/total).
- [ ] Order items store snapshot fields and line totals.
- [x] Shipping fees sourced from `shipping_config` and can be updated without code.
- [x] Agent/Healthcare user-type vouchers apply for Barrier Cream as seeded; per-unit/min-qty logic works.
- [ ] `payment_status` transitions to `paid` via existing endpoint (webhook follow-up).
- [x] Migrations created and applied cleanly; existing orders backfilled (discount=0, shipping=0, subtotal=total).
- [x] Frontend: Product details page displays applicable vouchers in "Promotions" section.
- [x] Frontend: Order summary displays subtotal, discount, shipping, and total.

**Out of Scope (follow-up tasks)**:
- Stripe webhooks to auto-mark paid; voucher CRUD UI; advanced shipping rules; product-level price tiers.

#### Task 1.8: Implement Backend Address Management (TDD) - ✅ COMPLETED
**Priority**: 🟡 High - Required for user profiles and checkout
**Dependencies**: None
**Estimated Time**: 5-7 hours

**TDD Steps**:
1. **Write Tests First**: Create `tests/integration/test_address.py`
2. **Create Model**: `Address` model with one-to-many relationship to `User`
3. **Create Schemas**: Request/response DTOs for Address
4. **Create Repository/Service/Controller/Router**: Follow layered architecture
5. **Make Tests Pass**: Iterative implementation

**Required Endpoints**:
- ✅ `POST /api/v1/users/me/addresses`: Create a new address
- ✅ `GET /api/v1/users/me/addresses`: Get all addresses
- ✅ `PUT /api/v1/users/me/addresses/{address_id}`: Update an address
- ✅ `DELETE /api/v1/users/me/addresses/{address_id}`: Delete an address
- ✅ `POST /api/v1/users/me/addresses/{address_id}/set_primary`: Set as primary

#### Task 1.9: Implement Frontend Address Management - ✅ COMPLETED
**Priority**: 🟡 High - User-facing feature
**Dependencies**: Task 1.8 (Backend Address Management) - ✅ COMPLETED
**Path**: `/account/addresses`

**Acceptance Criteria**:
- [x] User can view all their addresses on the `/account/address` page.
- [x] User can add a new address via a form.
- [x] User can edit an existing address.
- [x] User can delete an address.
- [x] User can set an address as their primary address.
- [x] Checkout page form is pre-filled with the primary address details.

**Notes**:
- Added modal animations and `CustomAlert` notifications for create/update/delete/set-primary.
- Prefill implemented on `/checkout` with "Use saved address" dropdown and "New address" option.

#### Task 1.6: Setup Zustand State Management for Cart - ✅ COMPLETED
**Priority**: 🟡 High - Required by GEMINI.md/WARP.md
**Action Required**:
1. Install zustand: `npm install zustand`
2. Create `src/store/cartStore.ts`: Cart state management
3. Update components to use cart store

#### Task 1.7: Migrate Auth State to Zustand - ✅ COMPLETED
**Priority**: 🟠 Medium - Code quality & consistency
**Dependencies**: Task 1.6
**Status**: ✅ COMPLETED
**Action Required**:
1. ✅ Create `src/store/authStore.ts`
2. ✅ Migrate logic from `src/context/AuthContext.tsx` to the new store
3. ✅ Fix bugs in components using `useAuthStore`
4. ✅ Complete component migration and testing
5. ✅ Remove the old `AuthContext.tsx` file after all bugs fixed

---

## 🟠 PHASE 2: INFRASTRUCTURE & TOOLING

*Goal: Production readiness and development efficiency*

### Task 2.1: Setup Linting & Formatting (Backend ✅ COMPLETED, Frontend 🟡 PENDING)
**Priority**: 🟠 Medium - Code quality

**Backend**: Configure Ruff, Black, mypy.
- [x] Ruff, Black, mypy installed and configured.
- [x] Codebase formatted with Black.
- [x] Linter errors fixed with Ruff.
- [x] Mypy baseline established.

**Frontend**: Configure ESLint, Prettier.
- [ ] ESLint and Prettier installed and configured.
- [ ] Codebase formatted with Prettier.
- [ ] Linter errors fixed with ESLint.

### Task 2.4: Frontend Architecture Refactoring (Feature-first)
**Priority**: 🟠 Medium - Code quality and maintainability
**Dependencies**: None
**Estimated Time**: 8-12 hours
**Action Required**:
1. Refactor frontend file structure to align with GEMINI.md / Warp.md's feature-first architecture (e.g., `/app/(dashboard)/profile/_components/`).
2. Co-locate components, hooks, and schemas by feature.
3. Ensure all imports are updated correctly.
4. Verify application functionality after refactoring.

**Acceptance Criteria**:
- [ ] Frontend project structure adheres to the feature-first layout specified in GEMINI.md / Warp.md.
- [ ] All components, hooks, and schemas are logically grouped within their respective feature directories.
- [ ] The application builds and runs without errors.
- [ ] All existing frontend functionality remains intact.

### Task 2.2: Add Dockerization
**Priority**: 🟠 Medium - Deployment readiness

**Files to Create**:
- `newmedica-backend/Dockerfile`
- `newmedica-frontend/Dockerfile`
- `docker-compose.production.yml`

### Task 2.3: Setup CI/CD Pipeline
**Priority**: 🟠 Medium - Automated testing

**Files to Create**:
- `.github/workflows/test.yml`: Run tests on PR
- `.github/workflows/deploy.yml`: Deploy on merge to main

---

## 🔵 PHASE 3: REMAINING MVP FEATURES

*Goal: Complete MVP feature set*

### Task 3.1: Admin User Management (Backend & Frontend)
**Priority**: 🔵 Low - Admin functionality
**Dependencies**: None
**Estimated Time**: 6-8 hours

**Backend Action Required**:
1. Implement `GET /api/v1/admin/users` to list pending Agent/Healthcare users.
2. Implement `POST /api/v1/admin/users/{id}/approve` to approve a user.

**Frontend Action Required**:
1. Create `/admin` page with a UI to list and approve/reject Agent/Healthcare users.

**Acceptance Criteria**:
- [ ] Admin users can view a list of pending Agent/Healthcare registrations.
- [ ] Admin users can approve or reject pending registrations.
- [ ] Backend endpoints are secured for admin access only.

### Task 3.2: Profile Management (Frontend)
**Priority**: 🔵 Low - User-facing feature
**Dependencies**: Backend Profile Update (future task)
**Path**: `/account/details`
**Action Required**:
1. Implement form submission logic to update user details on the backend.
2. Ensure form fields are pre-filled with current user data.
3. Add validation for input fields.

**Acceptance Criteria**:
- [ ] User can update their profile information (e.g., name, email) via the `/account/details` page.
- [ ] Changes are successfully persisted to the backend.
- [ ] Form displays appropriate success/error messages.

### Task 3.3: Order History (Frontend)
**Priority**: 🔵 Low - User-facing feature
**Dependencies**: Backend Order API (Task 1.2) - ✅ COMPLETED
**Path**: `/orders`

**Action Required**:
1. Create `/orders` page to display a list of the user's past orders.
2. Fetch order data from the backend `/api/v1/orders` endpoint.
3. Display order details (e.g., order ID, total amount, payment status, items).

**Acceptance Criteria**:
- [ ] User can view a list of their past orders on the `/orders` page.
- [ ] Each order displays relevant details.
- [ ] Navigation to individual order details is possible (if applicable).

### Task 3.5: Implement Backend `extra_fields` Validation (TDD)
**Priority**: 🔵 Low - Data integrity
**Dependencies**: None
**Estimated Time**: 3-4 hours
**Action Required**:
1. **Write Tests First**: Create unit/integration tests to verify `extra_fields` validation for different `UserType`s (Agent, Healthcare).
2. **Implement Validation Logic**: Add Pydantic validation to the `UserCreate` schema or a dedicated service layer to ensure `extra_fields` conform to the expected structure and required fields for each `UserType`.
3. **Integrate with Registration/Profile Update**: Ensure this validation is applied during user registration and profile updates.
4. **Make Tests Pass**: Ensure all validation tests pass.

**Acceptance Criteria**:
- [ ] `extra_fields` are correctly validated based on `UserType` during registration and profile updates.
- [ ] Invalid `extra_fields` data results in appropriate error responses.
- [ ] All existing tests pass.

### Task 3.6: Implement Automatic Voucher Assignment (TDD) - ✅ COMPLETED
**Priority**: 🟡 High - Core business logic
**Dependencies**: None
**Estimated Time**: 3-4 hours
**Action Required**:
1. **Write Tests First**: Create tests to verify that a new `Agent` or `Healthcare` user has the appropriate default voucher assigned to them after registration.
2. **Modify Registration Service**: Update the user creation logic in `app/services/user_service.py` to find the default voucher for the user's type and create a `UserVoucher` link.
3. **Make Tests Pass**: Ensure the new tests pass and that the standard registration process is not broken.

**Acceptance Criteria**:
- [ ] A new `Agent` user automatically receives the default 'Agent' voucher upon registration.
- [ ] A new `Healthcare` user automatically receives the default 'Healthcare' voucher upon registration.
- [ ] Basic users do not receive any voucher upon registration.

### Task 3.7: Implement Admin Management APIs (Vouchers & Shipping)
**Priority**: 🟠 Medium - Core business logic
**Dependencies**: None
**Estimated Time**: 4-6 hours
**Action Required**:
1. **Voucher Management**: Create CRUD endpoints for vouchers at `/api/v1/admin/vouchers`.
2. **Shipping Management**: Create GET and PUT endpoints for shipping config at `/api/v1/admin/shipping-config`.
3. **Security**: Ensure all endpoints are protected and only accessible by `Admin` users.
4. **Note**: This task is for the backend APIs only. A separate task will be needed for the frontend UI.

**Acceptance Criteria**:
- [ ] Admins can create, read, update, and delete vouchers.
- [ ] Admins can read and update the shipping configuration.
- [ ] Non-admin users receive a 403 Forbidden error when trying to access these endpoints.

---

## GEMINI CLI WORKING INSTRUCTIONS

**WHEN STARTING WORK**:
1. Always run tests first: `cd newmedica-backend && uv run pytest tests/ -v`
2. Check current working directory - should match the component you're working on
3. Follow TDD: Write failing tests → Implement → Make tests pass → Refactor

**TASK COMPLETION CRITERIA**:
- All tests pass
- Code follows GEMINI.md/WARP.md conventions
- Update this todo.md marking tasks complete
- Update project-state.md with progress

**PRIORITY SEQUENCE**:
1. **Never skip 🔴 BLOCKERS** - They prevent all other work
2. Complete Phase 0 entirely before starting Phase 1
3. Within each phase, complete tasks in numerical order
4. Always verify with tests before moving to next tasking to next task