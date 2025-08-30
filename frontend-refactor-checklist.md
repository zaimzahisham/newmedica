## Frontend Refactoring Checklist

This document outlines the detailed functionalities, dependencies, refactoring steps, and manual verification checklists for each component or feature being refactored as part of Task 2.4: Frontend Architecture Refactoring (Feature-first).

---

### Phase 1: Authentication (`/login`)

**Status**: ✅ **COMPLETED**

**Refactoring Steps for `LoginPage`:**
1.  **Create Directory:** Created `newmedica-frontend/src/app/(auth)/` route group and subdirectories (`_lib`, `_components`).
2.  **Move Page:** Moved `login/page.tsx` to `src/app/(auth)/login/page.tsx`.
3.  **Move Validation File:** Moved `auth.ts` from `src/lib/validations/` to `src/app/(auth)/_lib/`.
4.  **Update Imports:** Updated import paths in `page.tsx`.
5.  **Verification:** `npm run build` completed successfully.

---

### Phase 2: Cart & Account (`/cart`, `/account`)

**Status**: ✅ **COMPLETED**

**Refactoring Steps:**
1.  **Create Directory Structure**: Created `newmedica-frontend/src/app/(dashboard)/` route group for `cart` and `account` pages.
2.  **Move Pages**: Moved all pages and components for cart and account into the new directory structure.
3.  **Update Imports**: Updated all import paths in the moved files.
4.  **Verification**: `npm run build` completed successfully.

---

### Phase 3: Checkout (`/checkout`)

**Status**: 🟡 **PENDING**

**Component: `CheckoutPage` (`newmedica-frontend/src/app/checkout/page.tsx`)**

**Functionalities:**
*   Displays a summary of the order.
*   Provides a form for shipping and billing information.
*   Integrates with Stripe for payment processing.

**Dependencies:**
*   **State Management:** `zustand` (`@/store/cartStore`).
*   **Components:** `OrderSummary` (likely in `/components`).
*   **API:** Backend order and checkout API endpoints.

**Refactoring Steps for `CheckoutPage`:**
1.  **Create Directory Structure**: Create `newmedica-frontend/src/app/(dashboard)/checkout/` and subdirectories (`_components`, `_hooks`, `_lib`).
2.  **Move Page**: Move `src/app/checkout/page.tsx` to `src/app/(dashboard)/checkout/page.tsx`.
3.  **Identify & Move Components**: Move `OrderSummary.tsx` and any other checkout-specific components from `src/components/` to `src/app/(dashboard)/checkout/_components/`.
4.  **Update Imports**: Update import paths in all moved files.
5.  **Verify**: Run `npm run build`.