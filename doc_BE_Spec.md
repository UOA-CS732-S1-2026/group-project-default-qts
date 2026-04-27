# Backend Canonical Spec

## GrowFriend — Current Backend Source of Truth

## 1. Purpose and Status

This document defines the current canonical backend specification for GrowFriend.

Its purpose is to unify the backend team around one consistent set of rules for:

- Schema naming
- Authentication
- API design
- Business logic
- Implementation priority
- Backend ownership

This document should be treated as the backend source of truth for the current 1-month implementation period.

If older backend notes, draft schemas, or early support documents conflict with this document, this document takes precedence.

This spec is aligned with:

- The current project plan
- The revised database structure
- The backend ownership model agreed by the team
- The current MVP implementation direction

---

## 2. Scope of This Spec

This spec covers:

- Backend technical direction
- Canonical naming conventions
- Database collections and core fields
- Business rules
- Authentication approach
- API phases and endpoint list
- Request / response conventions
- Ownership across backend members
- Seed data and implementation notes

This spec does not replace:

- The full project-wide guideline
- The README
- The frontend integration contract

Those documents should remain separate.

---

## 3. Canonical Decisions That Resolve Earlier Conflicts

## 3.1 Authentication

Authentication uses:

- Email + password registration
- Email + password login
- Password hashing
- JWT for protected routes
- Registration restricted to `@aucklanduni.ac.nz` email addresses
- One security question selected during registration
- One security answer provided during registration

The current MVP does not use real OAuth or third-party identity providers.

For simplicity, the security question is treated as an additional account-recovery-related field in the user authentication profile.

---

## 3.2 Pet Naming and Structure

The canonical pet model uses:

- `petSpecies` for static species definitions
- `userPets` for user-owned pet instances
- `speciesId` instead of `petId` or `petType`
- `evolutionReady` instead of `evolveReady`
- `status` instead of `isActive`
- `isGrowthFrozen` as a progression-control field

`isGrowthFrozen` is used when a pet has reached an evolution boundary and the user chooses not to evolve it immediately.

In that state, further growth is blocked until the user performs the evolve action.

This means:

- `status` controls whether the pet is `ACTIVE` or in `INVENTORY`
- `evolutionReady` controls whether the pet is eligible to evolve
- `isGrowthFrozen` controls whether further feeding/growth is currently blocked

---

## 3.3 Task Structure

The canonical task design uses:

- One main table: `tasks`
- Supporting subtables:
  - `taskApplications`
  - `taskAssignments`
  - `taskEscrows`

Older split-table approaches such as separate `communityTasks`, `communityApplications`, and `myTasks` are not the final canonical model for the database.

The revised design uses the main-table + subtable pattern to reduce duplication and simplify maintenance.

---

## 3.4 Coin Handling

Coins are controlled by the backend only.

Core rules:

- `users.coins` is the current balance snapshot
- `coinTransactions` is the audit ledger
- Every coin change must create a ledger record
- Any operation that changes coins and another collection together should be treated as one backend-controlled operation

This is a core system rule and should never be bypassed by frontend logic.

---

## 3.5 Dashboard Strategy

The dashboard must be served by a single aggregated endpoint.

Frontend should not compose dashboard data by manually calling multiple unrelated endpoints.

---

## 4. Deprecated / Non-Canonical Terms

The following older terms should not be used in current backend code or API contracts:

| Deprecated / Old Term | Canonical Term |
|---|---|
| `petId` / `petType` | `speciesId` |
| `isActive` | `status` |
| `evolveReady` | `evolutionReady` |
| `inventory` | `inventoryItems` |
| `COMMUNITY` as final DB tables | `SYSTEM` + subtables |
| `MYTASK` as a database task type | `PERSONAL` in backend |
| `userAuthProviders` | Not used in current local-auth MVP |

`MyTask` can still be used as the frontend/product name, but in backend data modelling it should be represented consistently as a personal/private task concept.

This section exists to reduce naming drift across schema, controller code, and frontend contracts.

---

## 5. Backend Technical Direction

## 5.1 Stack

The backend uses:

- Node.js
- Express.js
- MongoDB / MongoDB Atlas
- Mongoose
- JWT
- bcrypt

---

## 5.2 Recommended Backend Structure

Recommended folder structure:

```txt
backend/
  src/
    config/
    models/
    routes/
    controllers/
    middleware/
    services/
    utils/
    seeds/
    app.js
    server.js