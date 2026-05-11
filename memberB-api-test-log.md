# Backend API Test Log - Member B

## Test Environment

| Item | Value |
|---|---|
| Backend branch | BE_MAB_merge |
| Base URL | http://localhost:5001 |
| Database | MongoDB Atlas - growfriend |
| Auth | JWT Bearer token |
| Test tool | Postman / Thunder Client |
| Tester | Your Name |
| Date | YYYY-MM-DD |

---

## API Test Table

| No. | Module | API | Method | Git Branch | Test Scenario | Auth Required | Request Body / Params | Expected Result | Actual Result | Status | Notes / Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Store | /api/store/items | GET | BE_MAB_merge | Load store items | No | N/A | Return store item list |  | Pass / Fail |  |
## Member B API Test Cases

| No. | Module | API | Method | Git Branch | Test Scenario | Auth Required | Request Body / Params | Expected Result | Actual Result | Status | Notes / Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Store | /api/store/items | GET | BE_MAB_merge | Load store item list | No | N/A | 200 OK, return SNACK, MEAL, FEAST, RANDOM_EGG |  |  |  |
| 2 | Pet | /api/pets/active | GET | BE_MAB_merge | Missing token | Yes | No Authorization header | 401, missing/invalid Authorization header |  |  |  |
| 3 | Pet | /api/pets/active | GET | BE_MAB_merge | Load active pet with token | Yes | Header: Bearer token | 200 OK, return active pet with speciesCode, speciesName, level, growthPoints |  |  |  |
| 4 | Inventory | /api/inventory | GET | BE_MAB_merge | Missing token | Yes | No Authorization header | 401, missing/invalid Authorization header |  |  |  |
| 5 | Inventory | /api/inventory | GET | BE_MAB_merge | Load user inventory | Yes | Header: Bearer token | 200 OK, return itemCode, itemName, type, quantity |  |  |  |
| 6 | Inventory | /api/inventory | GET | BE_MAB_merge | Empty inventory | Yes | User has no inventory items | 200 OK, return empty array |  |  |  |
| 7 | Store | /api/store/purchase | POST | BE_MAB_merge | FOOD purchase success | Yes | { "itemCode": "SNACK", "quantity": 2 } | coins decrease, ledger created, inventory quantity increases |  |  |  |
| 8 | Store | /api/store/purchase | POST | BE_MAB_merge | Insufficient coins | Yes | { "itemCode": "FEAST", "quantity": 999 } | 400, INSUFFICIENT_COINS |  |  |  |
| 9 | Store | /api/store/purchase | POST | BE_MAB_merge | Invalid item code | Yes | { "itemCode": "INVALID_ITEM", "quantity": 1 } | 404, STORE_ITEM_NOT_FOUND |  |  |  |
| 10 | Store | /api/store/purchase | POST | BE_MAB_merge | Random Egg locked | Yes | { "itemCode": "RANDOM_EGG", "quantity": 1 } while active pet is not max | 400, STORE_ITEM_LOCKED |  |  |  |
| 11 | Store | /api/store/purchase | POST | BE_MAB_merge | Random Egg unlocked | Yes | { "itemCode": "RANDOM_EGG", "quantity": 1 } while active pet is ADULT level 10 | coins decrease, ledger created, new inventory pet created |  |  |  |
| 12 | Pet | /api/pets/:id/feed | POST | BE_MAB_merge | Feed success | Yes | { "itemCode": "SNACK" } | inventory quantity decreases by 1, pet growthPoints increases |  |  |  |
| 13 | Pet | /api/pets/:id/feed | POST | BE_MAB_merge | Missing inventory item | Yes | { "itemCode": "FEAST" } when user has no FEAST | 404, INVENTORY_ITEM_NOT_FOUND |  |  |  |
| 14 | Pet | /api/pets/:id/feed | POST | BE_MAB_merge | Invalid feed item | Yes | { "itemCode": "RANDOM_EGG" } | 400, INVALID_FEED_ITEM |  |  |  |
| 15 | Pet | /api/pets/:id/feed | POST | BE_MAB_merge | Pet requires evolution | Yes | Feed pet when isGrowthFrozen = true | 400, PET_EVOLVE_REQUIRED |  |  |  |
| 16 | Pet | /api/pets/:id/evolve | POST | BE_MAB_merge | Evolve Egg to Kid success | Yes | Pet stage = EGG, level = 4, evolutionReady = true | 200 OK, stage becomes KID, level becomes 5, growthPoints reset |  |  |  |
| 17 | Pet | /api/pets/:id/evolve | POST | BE_MAB_merge | Evolve Kid to Adult success | Yes | Pet stage = KID, level = 9, evolutionReady = true | 200 OK, stage becomes ADULT, level becomes 10 |  |  |  |
| 18 | Pet | /api/pets/:id/evolve | POST | BE_MAB_merge | Not ready to evolve | Yes | Pet evolutionReady = false | 400, PET_NOT_ELIGIBLE_TO_EVOLVE |  |  |  |
| 19 | Pet | /api/pets/:id/evolve | POST | BE_MAB_merge | Adult cannot evolve | Yes | Pet stage = ADULT | 400, PET_ALREADY_MAX_STAGE |  |  |  |
| 20 | Pet | /api/pets/:id/activate | PATCH | BE_MAB_merge | Activate pet success | Yes | Target pet belongs to current user | target pet becomes ACTIVE, previous active pet becomes INVENTORY, users.activePetId updated |  |  |  |
| 21 | Pet | /api/pets/:id/activate | PATCH | BE_MAB_merge | Pet not owned | Yes | Target pet belongs to another user | 403, PET_NOT_OWNED |  |  |  |
| 22 | Pet | /api/pets/:id/activate | PATCH | BE_MAB_merge | Pet not found | Yes | Invalid or non-existing pet id | 404, PET_NOT_FOUND or 400 INVALID_PET_ID |  |  |  |