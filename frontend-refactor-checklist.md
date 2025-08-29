## Frontend Refactoring Checklist

This document outlines the detailed functionalities, dependencies, refactoring steps, and manual verification checklists for each component or feature being refactored as part of Task 2.4: Frontend Architecture Refactoring (Feature-first).

---

### Refactoring Target: `/login` page

**Component: `LoginPage` (`newmedica-frontend/src/app/login/page.tsx`)**

**Functionalities:**
*   Displays a combined Login/Sign Up form.
*   Allows switching between Login and Sign Up modes.
*   Handles user login: authentication via `useAuthStore().login`, redirection to `/account`, API error display.
*   Handles user registration (Sign Up): common fields + conditional fields based on `userType` (Healthcare Professional or Agent), sends data to backend API, displays success toast, switches to Login mode on success, API error display.
*   Form validation using `react-hook-form` and `zodResolver`, displays validation errors.

**Dependencies:**
*   **React Hooks:** `useState`, `useRouter`, `useForm`, `SubmitHandler`, `watch`.
*   **External Libraries/Utilities:** `@hookform/resolvers/zod`, `@/store/authStore`, `@/lib/validations/auth` (schemas), `@/components/CustomAlert` (`showSuccessToast`).
*   **Backend API Endpoint:** `http://127.0.0.1:8000/api/v1/auth/register`.
*   **Styling:** Tailwind CSS classes.

**Refactoring Steps for `LoginPage`:**
1.  **Create `newmedica-frontend/src/app/login/_lib/`:** This directory will house the `auth` validation schemas.
2.  **Move `auth.ts` from `src/lib/validations/` to `src/app/login/_lib/validations/`:** This co-locates the validation logic with the login feature.
3.  **Update imports in `page.tsx`:** Adjust the import path for `auth` schemas.

**Manual Verification Checklist for `LoginPage` (after refactoring):**
*   **Initial Load:**
    *   Navigate to `/login`.
    *   Verify the page loads without console errors.
    *   Confirm "Sign up" and "Login" tabs are visible.
*   **Tab Switching:**
    *   Click "Sign up" tab: Verify form switches to registration fields.
    *   Click "Login" tab: Verify form switches back to login fields.
*   **Login Functionality:**
    *   Attempt successful login with valid credentials. Verify redirection to `/account`.
    *   Attempt failed login with invalid credentials. Verify "Login failed" error message appears.
    *   Attempt login with empty fields. Verify validation errors appear.
*   **Registration Functionality (Basic User):**
    *   Switch to "Sign up" tab.
    *   Fill in valid basic user details.
    *   Submit form. Verify "Registration successful!" toast appears and form switches to Login.
    *   Attempt to log in with the newly registered basic user.
*   **Registration Functionality (Healthcare Professional):**
    *   Switch to "Sign up" tab.
    *   Select "Healthcare Professional" from user type dropdown.
    *   Verify conditional fields appear.
    *   Fill in valid details and submit. Verify success.
*   **Registration Functionality (Agent):**
    *   Switch to "Sign up" tab.
    *   Select "Agent" from user type dropdown.
    *   Verify conditional fields appear.
    *   Fill in valid details and submit. Verify success.
*   **Registration Validation:**
    *   Attempt registration with empty/invalid fields for various user types. Verify appropriate validation error messages appear.
    *   Verify password and confirm password mismatch shows error.
*   **Error Display:**
    *   Verify `apiError` messages are displayed correctly for both login and registration.