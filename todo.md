# NewMedica MVP To-Do List

This document outlines the necessary tasks to complete the Minimum Viable Product (MVP) for the NewMedica platform, following the guidelines in `GEMINI.md`. Tasks are broken down by backend and frontend.

---

## Phase 0: UI/UX Refinements & Data Seeding

*Goal: Address existing UI inconsistencies and ensure sufficient test data is available before implementing new features.*

### Frontend

1.  **Re-implement Product Search & Sort**
    *   Enable the `SearchBar` and `SortDropdown` components on the `/products` and `/products/category/[category]` pages.
    *   Connect the components to the `getProducts` API service, passing the search term and sort parameters as query arguments to the backend.
    *   The page should re-render with the filtered/sorted data from the API.

2.  **Redesign Product Detail Page**
    *   Update the `/products/[id]/page.tsx` component to match the design provided in `gemini-image-references/product-page.jpeg`.
    *   This includes:
        *   A main image with a gallery of thumbnails below it.
        *   Product title, price, and description.
        *   A quantity selector component.
        *   An "Add to Cart" button (this will be fully implemented in Phase 2).
        *   A "You may also like" section displaying related products.

### Backend

1.  **Add More Seed Data**
    *   Add at least one more product to the `app/db/seed.py` script to ensure the product carousel on the homepage has enough items to scroll.
    *   Re-run the seed script to apply the changes to the database.

---

## Phase 1: Core Product & Category Management (Completed)

*Goal: Replace static product data with a dynamic, database-driven catalog.*

### Backend (Completed)

1.  **TDD: Test Product & Category API**
2.  **Implement Models**
3.  **Run Migrations**
4.  **Implement Schemas**
5.  **Implement Repositories & Services**
6.  **Implement API Endpoints**

### Frontend (Completed)

1.  **Create Product API Service**
2.  **Refactor Product Pages**
3.  **Refactor Homepage Carousel**

---

## Phase 2: Shopping Cart & Checkout

*Goal: Allow users to add products to a cart and initiate a checkout session.* 

### Backend

1.  **TDD: Test Cart API**
    *   Write tests (`tests/integration/test_cart.py`) for:
        *   `GET /api/v1/cart`: Get the current user's cart.
        *   `POST /api/v1/cart/items`: Add an item to the cart.
        *   `PUT /api/v1/cart/items/{product_id}`: Update item quantity.
        *   `DELETE /api/v1/cart/items/{product_id}`: Remove an item.

2.  **Implement Cart Models & Logic**
    *   Create `app/models/cart.py` with `Cart` and `CartItem` models.
    *   Implement the corresponding schemas, repositories, and services.
    *   Implement the cart API endpoints.

3.  **TDD: Test Checkout API**
    *   Write a test (`tests/integration/test_checkout.py`) for `POST /api/v1/checkout`.
    *   This test should mock the Stripe API.

4.  **Implement Stripe Checkout**
    *   Integrate the Stripe SDK.
    *   Implement the `/api/v1/checkout` endpoint to create a Stripe Checkout Session based on the user's cart.

### Frontend

1.  **Implement Cart State Management**
    *   Integrate `Zustand` for global cart state management (`src/store/cartStore.ts`).
    *   The store should hold cart items and provide actions to add, update, and remove items.

2.  **Update Product Components**
    *   Add "Add to Cart" buttons to `ProductCard` and the product detail page.
    *   On click, these buttons should call the backend cart API and update the Zustand store.

3.  **Create Cart Page**
    *   Create a new page at `src/app/cart/page.tsx`.
    *   Display items from the cart store.
    *   Allow users to update quantities and remove items.
    *   Display a cart summary (subtotal, etc.).

4.  **Implement Checkout Flow**
    *   Add a "Checkout" button to the cart page.
    *   On click, call the backend `/api/v1/checkout` endpoint.
    *   Redirect the user to the Stripe Checkout page using the URL from the API response.

---

## Phase 3: User Profile & Admin

*Goal: Allow users to manage their profiles and enable admins to approve special accounts.*

### Backend

1.  **TDD: Test User Update API**
    *   Write tests for `PUT /api/v1/users/me` to allow users to update their `extra_fields`.

2.  **Implement User Update Logic**
    *   Create a `UserUpdate` schema.
    *   Implement the service and endpoint logic for updating user profiles.

3.  **TDD: Test Admin Approval API**
    *   Write tests for `POST /api/v1/admin/users/{user_id}/approve`.
    *   This should require Admin privileges.

4.  **Implement Admin Approval Logic**
    *   Add an `is_active` or `is_approved` field to the `User` model.
    *   Implement the admin endpoint to set this flag to true.

### Frontend

1.  **Implement Profile Update Form**
    *   Make the form in `src/app/account/details/page.tsx` functional.
    *   On submit, it should call the `PUT /api/v1/users/me` endpoint.

2.  **Implement Address Management**
    *   Create forms for adding/editing addresses on the `src/app/account/address/page.tsx`.
    *   Connect these forms to corresponding (yet to be created) backend endpoints.

3.  **Create Admin Approval UI**
    *   Create a new page at `/admin` (route-protected for Admins).
    *   Fetch a list of unapproved `Agent` and `Healthcare` users.
    *   Provide buttons to approve or reject users, calling the backend admin API.


## Phase 4: Deployment & Observability

*Goal: Deploy the MVP to a live environment.*

1.  **Dockerize Frontend**
    *   Create a `Dockerfile` for the Next.js application.
    *   Update `docker-compose.yml` to include the frontend service.

2.  **Set Up Reverse Proxy**
    *   Add Caddy or Traefik to `docker-compose.yml` to handle routing and TLS.

3.  **Configure CI/CD**
    *   Create a GitHub Actions workflow to:
        *   Run linting and tests on push.
        *   Build and push Docker images to a registry.
        *   Deploy to the Linode server.

4.  **Implement Backups**
    *   Create a script to run `pg_dump` and upload the backup to Linode Object Storage.
    *   Schedule this script to run nightly.

5.  **Integrate Sentry**
    *   Add the Sentry SDK to both the backend and frontend.
    *   Configure it to capture errors in production.
