# NewMedica MVP To-Do List - PRIORITY BASED

This document outlines tasks to complete the MVP for NewMedica, **prioritized by blocking dependencies**. Follow GEMINI.md/WARP.md TDD approach: write tests first, implement minimal code, refactor.

**CRITICAL**: Address 🔴 BLOCKERS before any other work. These prevent MVP progress.

---

## 🔴 PHASE 0: CRITICAL BUG FIXES

*Goal: Resolve critical bugs affecting core functionality.*

### Task 0.1: Fix Incorrect Order Subtotal on Checkout Retry
**Priority**: 🔴 CRITICAL
**Dependencies**: None
**Estimated Time**: 2-3 hours

**Analysis**:
When a user cancels a checkout, modifies their cart, and then checks out again, the system reuses the previous 'pending' order. However, it fails to update the `subtotal_amount` and `order_items` to reflect the new cart state, leading to incorrect order data, although the final `total_amount` is calculated correctly.

**Action Required (TDD)**:
1.  **Write a Failing Test**: In `tests/integration/test_order_logic.py`, create a test that replicates the bug's flow:
    *   Create a user and product.
    *   Add the product to the cart.
    *   Simulate a checkout to create a `pending` order.
    *   Modify the cart (e.g., increase item quantity).
    *   Simulate a second checkout.
    *   Assert that the final `Order` has the correctly updated `subtotal_amount` and that `order_items` reflect the new quantity.
2.  **Implement the Fix**: In the `OrderService` (`app/services/order_service.py`), modify the logic that handles existing `pending` orders. Ensure that when a pending order is reused, it is entirely updated with the new cart's state, including `subtotal_amount`, `discount_amount`, `shipping_amount`, and all `order_items`.
3.  **Verify**: Run the new test to ensure it passes and run the full test suite to check for regressions.

**Acceptance Criteria**:
- [ ] A failing test is created that reproduces the bug.
- [ ] The `OrderService` is updated to correctly recalculate all order fields when retrying a checkout.
- [ ] The new test passes.
- [ ] All existing tests pass.

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