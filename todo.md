# NewMedica MVP To-Do List

This document outlines the necessary tasks to complete the Minimum Viable Product (MVP) for the NewMedica platform, following the guidelines in `GEMINI.md`. Tasks are broken down by backend and frontend.

---

## Phase 0: UI/UX Refinements & Data Seeding

*Goal: Address existing UI inconsistencies and ensure sufficient test data is available before implementing new features.*

### Backend

1.  **FIX: Add Timestamps to All Models & Resolve Migration Issue**
    *   Add `created_at` and `updated_at` fields to all database models (`User`, `UserType`, `Product`, `Category`, `ProductMedia`).
    *   Investigate and fix the Alembic "broken map" dependency issue to allow `alembic revision --autogenerate` to work correctly.
    *   Generate and apply the migration to update the database schema.
    *   This is a **blocker** for completing the sorting functionality.

### Frontend

1.  **Re-implement Product Search & Sort (Completed)**
    *   Enable the `SearchBar` and `SortDropdown` components on the `/products` and `/products/category/[category]` pages.
    *   Connect the components to the `getProducts` API service, passing the search term and sort parameters as query arguments to the backend.
    *   The page should re-render with the filtered/sorted data from the API.

2.  **Redesign Product Detail Page (Completed)**
    *   Update the `/products/[id]/page.tsx` component to match the design provided in `gemini-image-references/product-page.jpeg`.
    *   This includes:
        *   A main image with a gallery of thumbnails below it.
        *   Product title, price, and description with rich text rendering.
        *   A quantity selector component.
        *   A dynamic promotions section based on user type.
        *   An "Add to Cart" button and confirmation modal.
        *   A "You may also like" section displaying related products.

---

## Phase 1: Core Product & Category Management (Completed)

*Goal: Replace static product data with a dynamic, database-driven catalog.*

### Backend (Completed)
... (rest of the file is unchanged)