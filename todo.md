# NewMedica MVP To-Do List - PRIORITY BASED

This document outlines tasks to complete the MVP for NewMedica, **prioritized by blocking dependencies**. Follow GEMINI.md/WARP.md TDD approach: write tests first, implement minimal code, refactor.

**CRITICAL**: Address 🔴 BLOCKERS before any other work. These prevent MVP progress.

---

## 🔴 PHASE 0: CRITICAL REFACTOR

*Goal: Improve core functionality for long-term stability.*

### Task 0.1: Refactor Checkout Logic for Simplicity and Robustness
**Priority**: 🔴 CRITICAL
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

**Part 2: Frontend Implementation**
1.  **Add "Retry Payment" Button**: On the `/account/orders` page, add a "Retry Payment" button that is only visible for orders with a `payment_status` of `pending`.
2.  **Create Retry Endpoint**: Implement a new backend endpoint (e.g., `POST /api/v1/orders/{order_id}/retry-payment`) that generates a new Stripe session for an existing order.
3.  **Connect Frontend to Endpoint**: The "Retry Payment" button should call this new endpoint and redirect the user to Stripe.

**Acceptance Criteria**:
- [x] Backend tests are updated to reflect the new, simpler checkout logic and are all passing.
- [x] The `OrderService` no longer reuses pending orders.
- [ ] The user's cart is reliably cleared after a checkout is initiated.
- [ ] A "Retry Payment" button appears on the frontend for pending orders in the user's account.
- [ ] Clicking the button successfully redirects the user to a checkout page for that order.
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

### Task 3.10: Admin User Management (Backend & Frontend)
**Priority**: 🟡 High
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

### Task 3.11: Implement "Complete your profile" functionality
**Priority**: 🟠 Medium
**Dependencies**: None
**Estimated Time**: 3-4 hours

**Action Required**:
1.  Enable the "Complete your profile" section on the account page to be editable.
2.  Implement a backend endpoint to handle the profile update.
3.  Ensure the form is validated and the data is saved correctly.

**Acceptance Criteria**:
- [ ] Users can update their profile information from the "Complete your profile" section.
- [ ] The changes are reflected in the user's profile.

### Task 3.12: Implement "Change password" functionality
**Priority**: 🟠 Medium
**Dependencies**: None
**Estimated Time**: 4-6 hours

**Action Required**:
1.  Create a "Change Password" page or modal.
2.  Implement a backend endpoint to handle the password change.
3.  The user should be required to enter their old password and a new password.
4.  Implement a "Forgot Password" flow with email-based password reset.

**Acceptance Criteria**:
- [ ] Users can change their password.
- [ ] Users can reset their password if they forget it.

### Task 3.13: Implement "Verify email" functionality
**Priority**: 🟠 Medium
**Dependencies**: None
**Estimated Time**: 4-6 hours

**Action Required**:
1.  Implement a backend process to send a verification email to the user upon registration.
2.  Create a frontend page to handle the email verification link.
3.  Once verified, the user should be able to apply vouchers.
4.  The "Verify email" button on the account details page should trigger the verification email to be sent again.

**Acceptance Criteria**:
- [ ] Users receive a verification email upon registration.
- [ ] Users can verify their email by clicking a link.
- [ ] Unverified users cannot apply vouchers.

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
**Dependencies**: Task 3.10
**Estimated Time**: 8-12 hours

**Action Required**:
1.  Extend the admin panel to allow editing of homepage text content.
2.  Implement a mechanism to manage the content of the static pages (TOS, Privacy, etc.).
3.  The design for this will be provided later.

**Acceptance Criteria**:
- [ ] Admins can update the homepage content.
- [ ] Admins can update the content of the static pages.

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
