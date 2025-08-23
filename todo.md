# NewMedica MVP To-Do List - PRIORITY BASED

This document outlines tasks to complete the MVP for NewMedica, **prioritized by blocking dependencies**. Follow GEMINI.md/WARP.md TDD approach: write tests first, implement minimal code, refactor.

**CRITICAL**: Address 🔴 BLOCKERS before any other work. These prevent MVP progress.

---

## 🔴 PHASE 0: CRITICAL BLOCKERS (Fix Immediately)

*Goal: Resolve blockers preventing MVP development*

### Backend Priority 1 - Fix Data Models & Tests

#### Task 0.1: Add Timestamps to All Models (BLOCKER)
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
- [ ] Product sorting by date works
- [x] All existing tests pass

#### Task 0.2: Fix Failing Test Suite (BLOCKER)
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
- [ ] All 16 tests pass without errors
- [ ] Test coverage remains ≥80%

#### Task 0.3: Secure Environment Configuration (BLOCKER)
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

---

## 🟡 PHASE 1: HIGH PRIORITY MVP FEATURES

*Goal: Implement core e-commerce functionality*

### Backend Priority 2 - Cart & Order Domain

#### Task 1.1: Implement Cart Domain Models (TDD)
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
- `POST /api/v1/cart/items`: Add item to cart
- `GET /api/v1/cart`: Get user's cart
- `PUT /api/v1/cart/items/{item_id}`: Update quantity
- `DELETE /api/v1/cart/items/{item_id}`: Remove item

**Acceptance Criteria**:
- [ ] All cart endpoints work with proper auth
- [ ] Cart persists items across sessions
- [ ] Quantity validation prevents negative/zero values
- [ ] Price calculations are accurate
- [ ] Tests cover happy path + edge cases

#### Task 1.2: Implement Order Domain Models (TDD)
**Priority**: 🟡 High - Required for MVP checkout
**Dependencies**: Task 1.1 (Cart) must be complete
**Estimated Time**: 4-6 hours

**Required Models**: `Order`, `OrderItem` with status tracking
**Required Endpoints**:
- `POST /api/v1/orders`: Create order from cart
- `GET /api/v1/orders`: List user orders
- `GET /api/v1/orders/{order_id}`: Order details

#### Task 1.3: Add Refresh Token Support
**Priority**: 🟡 High - Required by GEMINI.md/WARP.md
**Files to Update**:
- `app/api/v1/endpoints/auth.py`: Add `/refresh` endpoint
- `app/core/security.py`: Add refresh token logic
- `app/schemas/token.py`: Add refresh token response

### Frontend Priority 2 - MVP Pages

#### Task 1.4: Implement Cart Page (TDD)
**Priority**: 🟡 High - Core e-commerce functionality
**Path**: `/cart`
**Dependencies**: Backend Cart API (Task 1.1)

**Required Components** (create with TDD):
- `app/cart/page.tsx`: Main cart page
- `app/cart/_components/CartItem.tsx`: Individual cart item
- `app/cart/_components/CartSummary.tsx`: Price totals
- `app/cart/_components/EmptyCart.tsx`: Empty state

**Acceptance Criteria**:
- [ ] Shows all cart items with images, names, prices
- [ ] Quantity can be updated inline
- [ ] Items can be removed
- [ ] Price totals calculate correctly
- [ ] "Proceed to Checkout" button works
- [ ] Empty cart shows appropriate message

#### Task 1.5: Implement Checkout Page (TDD)
**Priority**: 🟡 High - Required for MVP
**Path**: `/checkout`
**Dependencies**: Backend Order API (Task 1.2), Stripe integration

**Integration Required**: Stripe Checkout sessions
**Files to Create**:
- `app/checkout/page.tsx`: Checkout form
- `app/checkout/_components/OrderSummary.tsx`: Order review
- `lib/stripe.ts`: Stripe client setup

#### Task 1.6: Setup Zustand State Management
**Priority**: 🟡 High - Required by GEMINI.md/WARP.md
**Action Required**:
1. Install zustand: `npm install zustand`
2. Create `src/store/cartStore.ts`: Cart state management
3. Create `src/store/authStore.ts`: Auth state (migrate from Context)
4. Update components to use stores instead of Context

---

## 🟠 PHASE 2: INFRASTRUCTURE & TOOLING

*Goal: Production readiness and development efficiency*

### Task 2.1: Setup Linting & Formatting
**Priority**: 🟠 Medium - Code quality

**Backend**: Configure Ruff, Black, mypy
**Frontend**: Configure ESLint, Prettier (already partially done)

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

### Task 3.1: Admin User Management
- `/admin` page for approving Agent/Healthcare users
- Admin endpoints for user approval/rejection

### Task 3.2: Profile Management
- Editable `/profile` page
- Update user details functionality

### Task 3.3: Order History
- `/orders` page showing user's order history
- Order status tracking

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
4. Always verify with tests before moving to next task
