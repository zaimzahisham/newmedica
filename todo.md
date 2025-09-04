# NewMedica MVP To-Do List - PRIORITY BASED

This document outlines tasks to complete the MVP for NewMedica, **prioritized by blocking dependencies**. Follow GEMINI.md/WARP.md TDD approach: write tests first, implement minimal code, refactor.

**CRITICAL**: Address 🔴 BLOCKERS before any other work. These prevent MVP progress.

---

## 🔴 PHASE 0: CRITICAL REFACTOR

*Goal: Improve core functionality for long-term stability.*

### ✅ Task 0.1: Refactor Checkout Logic for Simplicity and Robustness
**Priority**: ✅ COMPLETED
**Dependencies**: None
**Estimated Time**: 3-5 hours

**Analysis**:
The current logic for handling checkout retries is complex, as it tries to reuse a previous 'pending' order. This is brittle. A simpler, more robust approach has been approved:
1.  A checkout attempt from the cart will **always** create a new order.
2.  After the checkout is initiated (regardless of payment success), the user's cart will be cleared.
3.  A failed payment will leave a decoupled, `pending` order record.
4.  To retry payment, the user will go to their "Order History" page and click a "Retry Payment" button next to the pending order. Retry Payment will direct to checkout page with this order and user can continue checkout with any payment method (does not have to be the same as failed previously)

**Action Required (TDD)**:

**Part 1: Backend Refactor** **- ✅ COMPLETED**
1.  **Update Tests**: In `tests/integration/test_order_logic.py`, rewrite the existing tests to assert the new behavior. The test should confirm that a second checkout from a modified cart creates a **new, distinct** order, and that the cart is empty after the first checkout attempt.
2.  **Refactor `OrderService`**: Remove the logic that searches for and reuses existing `pending` orders. The `create_order_from_cart` method should always create a new `Order`.
3.  **Implement Cart Clearing**: Ensure that after an order is successfully created and a payment intent is generated, the user's cart is cleared.

**Part 2: Frontend Implementation** **- ✅ COMPLETED**
1.  **Add "Retry Payment" Button**: On the `/account/orders` page, add a "Retry Payment" button that is only visible for orders with a `payment_status` of `pending`.
2.  **Create Retry Endpoint**: Implement a new backend endpoint (e.g., `POST /api/v1/orders/{order_id}/retry-payment`) that generates a new Stripe session for an existing order.
3.  **Connect Frontend to Endpoint**: The "Retry Payment" button should call this new endpoint and redirect the user to Stripe.

**Acceptance Criteria**:
- [x] Backend tests are updated to reflect the new, simpler checkout logic and are all passing.
- [x] The `OrderService` no longer reuses pending orders.
- [x] The user's cart is reliably cleared after a checkout is initiated.
- [x] A "Retry Payment" button appears on the frontend for pending orders in the user's account.
- [x] Clicking the button successfully redirects the user to a checkout page for that order.
- [x] All existing tests pass, ensuring no regressions have been introduced.

---

## ✅ PHASE 1: HIGH PRIORITY MVP FEATURES - COMPLETED

*Goal: Implement core e-commerce functionality*

---

## ✅ PHASE 2: INFRASTRUCTURE & TOOLING - COMPLETED

*Goal: Production readiness and development efficiency*

---

## 🔵 PHASE 3: REMAINING MVP FEATURES

*Goal: Complete MVP feature set*

### ✅ Task 3.5: Implement Backend `extra_fields` Validation (TDD)
**Priority**: 🟢 Completed
**Dependencies**: None
**Estimated Time**: 3-4 hours
**Action Required**:
1. **Write Tests First**: Create unit/integration tests to verify `extra_fields` validation for different `UserType`s (Agent, Healthcare).
2. **Implement Validation Logic**: Add Pydantic validation to the `UserCreate` schema or a dedicated service layer to ensure `extra_fields` conform to the expected structure and required fields for each `UserType`.
3. **Integrate with Registration/Profile Update**: Ensure this validation is applied during user registration and profile updates.
4. **Make Tests Pass**: Ensure all validation tests pass.

**Acceptance Criteria**:
- [x] `extra_fields` are correctly validated based on `UserType` during registration and profile updates.
- [x] Invalid `extra_fields` data results in appropriate error responses.
- [x] All existing tests pass.

### ✅ Task 3.11: Implement "Complete your profile" functionality
**Priority**: ✅ COMPLETED
**Dependencies**: None
**Estimated Time**: 3-4 hours

**Action Required**:
1.  Enable the "Complete your profile" section on the account page to be editable.
2.  Implement a backend endpoint to handle the profile update.
3.  Ensure the form is validated and the data is saved correctly.

**Acceptance Criteria**:
- [x] Users can update their profile information from the "Complete your profile" section.
- [x] The changes are reflected in the user's profile.

### ✅ Task 3.12: Implement "Change password" functionality
**Priority**: ✅ COMPLETED
**Dependencies**: None
**Estimated Time**: 4-6 hours

**Action Required**:
1.  Create a "Change Password" page or modal.
2.  Implement a backend endpoint to handle the password change.
3.  The user should be required to enter their old password and a new password.
4.  Implement a "Forgot Password" flow with email-based password reset.

**Acceptance Criteria**:
- [x] Users can change their password.
- [ ] Users can reset their password if they forget it.

### Task 3.13: Implement "Verify email" functionality (Backend)
**Priority**: 🟠 Medium
**Dependencies**: None
**Estimated Time**: 2-3 hours
**Status**: 🔵 Not Started

**Part 1: Database & Migration**
**Action Required**:
1.  Add `email_verified_at: datetime | None` to the `User` model.
2.  Generate and apply the Alembic migration script.
**Acceptance Criteria**:
- [ ] `User` model in `app/models/user.py` is updated.
- [ ] A new migration file exists in `app/db/alembic/versions/`.
- [ ] The database schema is successfully updated.

**Part 2: Core Verification Logic (TDD)**
**Action Required**:
1.  Create `tests/integration/test_email_verification.py` with failing tests for the verification flow.
2.  Create `app/services/email_service.py` for token generation and simulated email sending.
3.  Implement the verification logic in the `AuthService` or `UserService`.
4.  Update the registration logic to send a verification email.
5.  Update the `PricingService` to check for verification before applying vouchers.
**Acceptance Criteria**:
- [ ] New integration tests for email verification are created and pass.
- [ ] Unverified users cannot use vouchers.

**Part 3: API Endpoints**
**Action Required**:
1.  Create `POST /api/v1/auth/request-verification-token` endpoint.
2.  Create `GET /api/v1/auth/verify-email` endpoint.
**Acceptance Criteria**:
- [ ] Both new endpoints are implemented and tested.

### Task 3.14: Implement "Verify email" functionality (Frontend)
**Priority**: 🟠 Medium
**Dependencies**: Task 3.13 (Backend)
**Estimated Time**: 2-3 hours
**Status**: 🔵 Not Started

**Part 1: API Integration**
**Action Required**:
1.  Add new functions to `src/lib/api/auth.ts` to call the new backend endpoints.
**Acceptance Criteria**:
- [ ] API library is updated.

**Part 2: UI Implementation**
**Action Required**:
1.  Create the verification page at `/app/(auth)/verify-email/page.tsx`.
2.  Add the "Verify Your Email" banner and button to the account details page.
**Acceptance Criteria**:
- [ ] Users can complete the verification flow from the frontend.
- [ ] The account page correctly reflects the user's verification status.

---

## ⚪️ PHASE 4: POST-MVP FEATURES

*Goal: Add additional features and improvements after the MVP is launched.*

### Task 4.1: Implement static pages
**Priority**: 🔵 Low
**Dependencies**: None
**Estimated Time**: 2-3 hours

**Action Required**:
1.  Create pages for "Terms of Service", "Privacy Policy", and "Refund Policy".
2.  Add content to these pages.
3.  Link to these pages from the footer.

**Acceptance Criteria**:
- [ ] The static pages are created and accessible.

### Task 4.2: Implement admin content management
**Priority**: 🔵 Low
**Estimated Time**: 8-12 hours

**Action Required**:
1.  Extend the admin panel to allow editing of homepage text content.
2.  Implement a mechanism to manage the content of the static pages (TOS, Privacy, etc.).
3.  The design for this will be provided later.

**Acceptance Criteria**:
- [ ] Admins can update the homepage content.
- [ ] Admins can update the content of the static pages.

### Task 4.3: Full Admin Dashboard (Post-MVP)
**Priority**: 🔵 Low
**Estimated Time**: 15-25 hours

**Analysis**:
While the backend has existing CRUD APIs for products, vouchers, and shipping, they are not accessible via a UI and require robust, admin-only security checks. This task involves hardening the backend with explicit admin authorization tests and then building the comprehensive frontend interface for site management.

**Part 1: Backend Hardening & Test Coverage (TDD)**

**Action Required**:
1.  **Write Failing Tests First**: For each data domain (Products, Categories, Vouchers, Shipping Config), create a new test file (e.g., `tests/integration/admin/test_admin_products.py`). In this file, write integration tests that attempt to access the existing CRUD endpoints (e.g., `POST /api/v1/products`, `PUT /api/v1/vouchers/{id}`) using a token from a **non-admin user**. Assert that the API returns a `403 Forbidden` status code.
2.  **Write Admin Access Tests**: Add tests to verify that a user with the `Admin` user type **can** successfully access these same endpoints.
3.  **Implement Admin Security**: Review and update the dependency injection for all relevant API endpoints to ensure they are protected by a role-check that requires the `Admin` user type. The existing `get_current_active_user` dependency can be extended or a new `get_current_admin_user` dependency can be created.
4.  **Run Full Test Suite**: After implementing the security layer, execute the entire backend test suite with `cd newmedica-backend && uv run pytest tests/ -v`. Confirm that all new tests pass and that no regressions have been introduced into existing functionality.

**Part 2: Frontend Implementation**

**Action Required**:
1.  **Design Admin Dashboard Layout**: Create a protected route group for `/admin`. Build a main layout that includes a sidebar or top navigation for managing Users, Products, Categories, Vouchers, and Shipping.
2.  **Implement CRUD Interfaces**: For each of the data domains, build the necessary frontend components:
    *   Use **TanStack Table** to display lists of data.
    *   Create forms (using React Hook Form + Zod) within modals or on dedicated pages for creating and editing items.
    *   Implement delete confirmation dialogs.
3.  **Connect to Backend**: Connect the frontend components to the newly secured backend APIs, ensuring that the admin user's authentication token is used for all requests.

**Acceptance Criteria**:
- [ ] New backend tests exist to verify that all data management endpoints are accessible only by `Admin` users.
- [ ] The entire backend test suite passes, confirming no regressions.
- [ ] A new, protected `/admin` section with a clear navigation structure is implemented on the frontend.
- [ ] Admin users can perform full CRUD operations on Products, Categories, Vouchers, and Shipping Configuration from the frontend UI.
- [ ] Non-admin users are redirected or shown an error when attempting to access any `/admin` URLs.

### Task 4.4: Admin User Management (Post-MVP)
**Priority**: 🔵 Low
**Dependencies**: None
**Estimated Time**: 6-8 hours
**Note**: This is a low priority task. It can be implemented later, potentially alongside the "Verify email" functionality.

**Backend Action Required**:
1. Implement `GET /api/v1/admin/users` to list pending Agent/Healthcare users.
2. Implement `POST /api/v1/admin/users/{id}/approve` to approve a user.

**Frontend Action Required**:
1. Create `/admin` page with a UI to list and approve/reject Agent/Healthcare users.

**Acceptance Criteria**:
- [ ] Admin users can view a list of pending Agent/Healthcare registrations.
- [ ] Admin users can approve or reject pending registrations.
- [ ] Backend endpoints are secured for admin access only.

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
