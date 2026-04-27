# Frontend Integration Contract

## GrowFriend — Current Frontend Source of Truth

## 1. Purpose

This document defines how the frontend should integrate with the backend for the current 1-month GrowFriend implementation.

It is written for frontend developers first, so it focuses on:

- Page-to-endpoint mapping
- Request and response shapes
- Frontend field names
- Authentication handling
- Loading, empty, and error states
- Integration order by phase

This document should be treated as the frontend-facing API contract for the current implementation period.

It follows the agreed project priorities:

- Week 2 focuses on auth, dashboard, active pet, store, and inventory.
- Week 3 expands into pet growth, focus mode, and SystemTask flow.

---

## 2. Current Integration Principles

The frontend must follow these rules:

- Coins are controlled by the backend only.
- The frontend must never directly calculate or mutate the user’s real coin balance.
- The dashboard must be loaded from a single aggregated endpoint.
- The frontend should use the backend’s canonical field names consistently.
- The frontend should not depend on database-internal names beyond this contract.

This contract also follows the revised naming direction for pets and tasks:

- `SystemTask` is the frontend/product name for backend task type `SYSTEM`.
- `MyTask` is the frontend/product name for backend task type `PERSONAL`.
- `P2P` is used consistently in both frontend and backend.

---

## 3. Frontend Module Ownership

This contract aligns with the current frontend team split.

## 3.1 Frontend Member 1 — Authentication & Dashboard

Responsible for:

- Login / Register pages
- Dashboard layout
- User information display
- Active pet display
- Integration with auth and dashboard APIs

---

## 3.2 Frontend Member 2 — Pet, Store & Inventory UI

Responsible for:

- Store page
- Inventory page
- Pet feeding interaction
- Purchase flow
- Pet growth / evolution UI

---

## 3.3 Frontend Member 3 — Focus Mode, SystemTask & Profile

Responsible for:

- Focus timer page
- SystemTask page
- MyTask page
- Profile page
- Basic loading / error states

---

## 4. Environment and Base URL

The frontend should use one configurable backend base URL.

Recommended frontend environment variable:

```env id="lvd51e"
VITE_API_BASE_URL=https://your-backend-domain/api