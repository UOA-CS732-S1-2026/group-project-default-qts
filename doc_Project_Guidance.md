# Project Guideline

## GrowFriend — Current Working Version

## 1. Project Overview

GrowFriend is a productivity and task-management web application that uses virtual pet growth as a motivational system. The product combines task completion, focus sessions, item purchases, and pet progression to create a clearer and more engaging productivity experience.

In addition to individual productivity features, the project also includes a task system with three user-facing areas:

- SystemTask
- P2P
- MyTask

**SystemTask** refers to tasks created and managed by admins or organisations. These may include organisation tasks and activity-based tasks.

**P2P** refers to peer-to-peer tasks created by users for other users.

**MyTask** refers to the user’s private/personal task area.

This guideline is the team’s current working document for the final 1-month implementation period. It defines the agreed feature scope, team ownership, weekly plan, collaboration rules, testing expectations, and delivery priorities.

Where older documents conflict with this guideline, this guideline should be treated as the current source of truth.

---

## 2. Project Goal

The goal of this project is not to build the largest possible system.

The goal is to deliver a clear, usable, testable, and maintainable prototype within one month, with:

- A working end-to-end user flow
- Visible evidence of teamwork and version control
- Clear technical ownership across the team
- Testing evidence
- Deployment
- Complete project documentation in the README and Wiki

By the end of the project, the prototype should allow a user to:

- Register
- Log in
- View a dashboard
- Interact with an active pet
- Use focus mode to earn coins
- Purchase items
- Feed and grow a pet
- Access the basic SystemTask flow

---

## 3. Confirmed Scope

### 3.1 Must-have features

The following features are the minimum project scope and must be prioritised first:

- User authentication
- Dashboard
- Active pet display
- Store
- Inventory
- Pet feeding and growth
- Focus mode reward
- SystemTask basic flow
- Deployment

### 3.2 Should-have features

These should be implemented only if the core system is stable:

- Pet evolution
- MyTask basic flow
- Basic P2P task flow
- Basic admin approval flow
- Better UI polish

### 3.3 Nice-to-have features

These should only be considered after the must-have and should-have scope is stable:

- Animation
- Achievement system
- Emotional decay system
- AI naming or dialogue
- Advanced dispute handling

If the team falls behind, nice-to-have features must be cut early rather than delaying core delivery.

For the current implementation, task-related terminology in team documents should use **SystemTask**, **P2P**, and **MyTask** consistently, rather than mixing older terms such as Community Task, Personal Task, and MyTask interchangeably.

---

## 4. Confirmed Technical Direction

### 4.1 Stack

The project uses a MERN-style full-stack structure:

- Frontend: React
- Backend: Node.js + Express
- Database: MongoDB / MongoDB Atlas
- Authentication: password-based login with JWT
- Deployment: Vercel or Netlify for frontend, Render or Railway for backend

### 4.2 Task terminology

Task terminology for the current project:

- **SystemTask**: tasks created and managed by admins or organisations
  - SystemTask may include two subcategories: Organisation and Activity Task
- **P2P**: peer-to-peer tasks created by users for other users
- **MyTask**: the user’s private/personal task area

### 4.3 Authentication decision

The current implementation uses:

- Email + password registration
- Email + password login
- Password hashing
- JWT authentication
- Registration restricted to `@aucklanduni.ac.nz`
- One security question and answer during registration

The current MVP does not use real OAuth.

### 4.4 Core backend rules

The backend should follow these core rules:

- Coins are controlled by the backend only.
- The frontend must never directly modify coin balance.
- Every coin change must be recorded in `coinTransactions`.
- The dashboard should be served by a single aggregated endpoint.
- Backend and frontend must use consistent field names.

---

## 5. Team Structure and Ownership

The team has 6 members:

- 3 frontend members
- 3 backend members

Each person has:

- A main development role
- A shared project responsibility

This helps the team demonstrate both technical contribution and project management.

### 5.1 Frontend ownership

#### Frontend Member 1 — Authentication & Dashboard

Responsible for:

- Login / Register pages
- Dashboard layout
- User information display
- Active pet display
- Connecting frontend to auth and dashboard APIs

#### Frontend Member 2 — Pet, Store & Inventory UI

Responsible for:

- Store page
- Inventory page
- Pet feeding interface
- Purchase flow
- Pet growth / evolution UI

#### Frontend Member 3 — Focus Mode, SystemTask & Profile

Responsible for:

- Focus timer page
- SystemTask page
- MyTask page
- Profile page
- Basic loading / error states

### 5.2 Backend ownership

#### Backend Member 4 — Auth, User & Dashboard APIs

Responsible for:

- Register / login APIs
- JWT authentication
- Restricting registration to `@aucklanduni.ac.nz`
- User/profile APIs
- Dashboard aggregation API

#### Backend Member 5 — Pet, Store & Inventory APIs

Responsible for:

- Pet schema / model
- Feeding logic
- Growth / evolution logic
- Store item APIs
- Purchase logic
- Inventory APIs

#### Backend Member 6 — Focus, Tasks & Transactions

Responsible for:

- Focus mode APIs
- SystemTask APIs
- MyTask APIs
- P2P task APIs
- Coin transaction logging
- Basic admin endpoints if needed

---

## 6. Shared Project Responsibilities

To support the rubric and make project management visible, the team also assigns the following shared responsibilities.

### Member 1 — README Owner

Responsible for:

- Project overview
- Feature list
- Setup instructions
- Run / test instructions
- Final README cleanup

### Member 2 — UI Consistency Owner

Responsible for:

- Consistent navigation
- Consistent button styles and layout
- General frontend polish

### Member 3 — Wiki / Meeting Minutes Owner

Responsible for:

- Weekly meeting minutes
- Task breakdown updates
- Recording decisions and blockers in the Wiki

### Member 4 — Git Workflow Coordinator

Responsible for:

- Branch naming convention
- Pull request / merge workflow
- Reminding the team to commit regularly and clearly

### Member 5 — Testing Coordinator

Responsible for:

- Manual testing checklist
- Bug tracking list
- Confirming core flows are tested before final submission

### Member 6 — Deployment Owner

Responsible for:

- Frontend deployment
- Backend deployment
- Environment variable documentation
- Final live demo link

These roles should be maintained throughout the project even if coding tasks shift slightly.

---

## 7. Development Plan

## Week 1 — Planning, Setup, and Project Skeleton

### Goal

Set up the project so frontend and backend can work in parallel.

### Whole team

- Finalise feature scope
- Confirm tech stack
- Confirm Git workflow
- Create GitHub project board / task board
- Create initial README structure
- Create Wiki structure
- Hold the first formal team meeting and record minutes

### Frontend

- Set up React project
- Set up routing
- Build page skeletons
- Create shared components
- Use mock data for early UI work

### Backend

- Set up Express project
- Connect MongoDB / MongoDB Atlas
- Create initial folder structure
- Draft main schemas / models
- Draft API contracts
- Create starter endpoints

### Week 1 deliverables

- Frontend and backend both run locally
- Initial API list
- Schema/model draft
- Initial page layouts
- README draft
- First meeting minutes

---

## Week 2 — Core MVP

### Goal

Get the essential product flow working.

### Backend priorities

- `POST /auth/register`
- `POST /auth/login`
- JWT middleware
- `GET /users/me`
- `GET /dashboard`
- `GET /pets/active`
- `GET /store/items`
- `GET /inventory`
- Basic purchase logic

### Frontend priorities

- Connect Login / Register pages
- Connect Dashboard to real API
- Connect Store page to real API
- Connect Inventory page to real API
- Add basic error/loading states

### Team priorities

- Start using feature branches consistently
- Make regular commits
- Begin integration testing for core pages

### Week 2 deliverables

- User can register and log in
- Dashboard shows real data
- Store and inventory load real data
- Clear GitHub activity from all members

---

## Week 3 — Core Gameplay Loop + Task Features

### Goal

Make the system playable and aligned with the project concept.

### Backend priorities

- Feed pet API
- Growth point update logic
- Pet evolution logic
- Focus mode completion and reward
- SystemTask listing and apply flow
- Coin transaction logging

### Frontend priorities

- Feed pet interaction
- Growth bar update
- Focus timer and completion UI
- SystemTask listing / apply UI
- Pet evolution UI

### Team priorities

- Hold the second formal meeting
- Update the Wiki with blockers and scope changes
- Build the manual testing checklist

### Week 3 deliverables

- Full core loop works:
  - Login
  - Dashboard
  - Focus mode
  - Earn coins
  - Buy item
  - Feed pet
  - Grow pet
- SystemTask basic flow works
- Testing has started

---

## Week 4 — Integration, Testing, Deployment, and Polish

### Goal

Turn the prototype into a stable and presentable final submission.

### Backend priorities

- Fix bugs
- Add input validation
- Improve error handling
- Complete either MyTask basic flow, P2P basic flow, or admin basic flow
- Finalise API documentation

### Frontend priorities

- UI polish
- Improve consistency
- Improve user feedback messages
- Make the demo flow smooth

### Team priorities

- Test all core flows
- Prepare demo / sample data
- Deploy frontend and backend
- Finalise README
- Finalise Wiki and meeting minutes
- Check `.gitignore`
- Review the main branch before submission
- Ensure task-related page names and backend terminology are consistent across SystemTask, P2P, and MyTask before final submission

### Week 4 deliverables

- Deployed version available
- README complete
- Wiki complete
- Weekly meeting records complete
- Regular contributions from every member
- Core flows are demo-ready

---

## 8. Delivery Priorities by System Phase

To reduce integration risk, the implementation order should follow this structure.

### Phase 1 — Frontend dependency

These should be implemented first so the frontend can stop relying on mock data:

- Auth
- `/users/me`
- `/dashboard`
- `/pets/active`
- `/store/items`
- `/inventory`

### Phase 2 — Core gameplay loop

These make the system actually playable:

- Feed pet
- Purchase item
- Complete focus session and reward coins
- Pet evolution

### Phase 3 — Advanced / differentiating features

These are important, but should come after the MVP path is stable:

- SystemTask
- MyTask
- P2P
- Admin features

This priority order should guide task decisions when time is limited.

---

## 9. Git Workflow Rules

To demonstrate good version control practice, the team will follow these rules.

### Branching

Do not commit directly to `main` unless the team agrees.

Use feature branches such as:

- `feature/auth-api`
- `feature/dashboard-ui`
- `feature/store-page`
- `fix/focus-bug`

### Commits

Commits should be:

- Regular
- Small and fine-grained
- Descriptive

Examples:

- `add user schema and auth routes`
- `implement dashboard API`
- `create store page layout`
- `connect focus timer to backend`

### Merging

Before merging into `main`:

- Confirm the feature works
- Ask for at least one teammate review if possible

This workflow is mandatory because the project must show evidence of collaboration and controlled integration.

---

## 10. Meetings and Communication

The team will use:

- Discord for communication
- Google Docs / Google Drive for shared working documents
- GitHub Project Board for task tracking
- GitHub repository and pull requests for version control

Each meeting record should include:

- Date and attendees
- What was completed this week
- What will be done next week
- Task allocation
- Blockers / risks
- Scope changes
- Next meeting time

Members who cannot attend must notify the team in advance and provide progress updates.

---

## 11. Testing Plan

The team does not need overly complex automated testing for this prototype, but it must show clear evidence of testing.

### Manual testing checklist

Examples include:

- Register with valid UoA email
- Register with valid security question and answer
- Reject invalid email domain
- Login with correct credentials
- Load dashboard correctly
- Purchase store item successfully
- Feed pet and update growth
- Complete focus session and receive coins
- Apply for SystemTask successfully

### API testing

Use:

- Postman
- Thunder Client
- Bruno

### Bug tracking

Maintain a small bug list in:

- GitHub Issues
- Project Wiki

The testing coordinator is responsible for making sure testing evidence is visible before submission.

---

## 12. Deployment Plan

The project should be deployed before the final week ends.

Suggested deployment:

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: MongoDB Atlas

Important rules:

- Do not commit `.env`
- Do not commit `node_modules`
- Keep `.gitignore` correct
- Record the final live demo link in the README / Wiki

Deployment is part of the must-have delivery scope, not an optional extra.

---

## 13. Documentation Structure

The team should maintain the following documents:

- `PROJECT_GUIDELINE.md` — project-wide working rules and delivery plan
- `BACKEND_CANONICAL_SPEC.md` — final backend schema, rules, and API definitions
- `FRONTEND_INTEGRATION_CONTRACT.md` — frontend-facing request / response guide
- `README.md` — setup, run, and project overview
- Wiki / Meeting & Testing Log — meeting notes, blockers, testing, and deployment evidence

This separation helps keep project management, technical implementation, and evidence documentation clear and easy to update.

---

## 14. Risk and Scope Control

If the team falls behind, lower-priority features must be cut early.

The first features to cut are:

- Advanced animations
- Achievements
- Emotional decay
- AI naming / dialogue
- Advanced dispute handling
- QR-based check-in

The following must be protected as core scope:

- Auth
- Dashboard
- Store
- Inventory
- Focus reward
- Pet feeding / growth
- SystemTask basic flow
- Deployment

If major blockers appear, the team should:

- Document them in the Wiki / board
- Reassign work quickly if needed
- Focus on MVP stability over feature expansion
- Seek teaching staff support if a blocker remains unresolved

This follows the same MVP-first direction already described in the earlier proposal and risk plan.

---

## 15. Final Success Criteria

By submission time, the project will be considered successful if it demonstrates:

- A working prototype
- A clear user flow
- Regular Git contributions from all members
- Clear team ownership
- Testing evidence
- Deployment
- Complete README and Wiki documentation

The final result should be stable, understandable, and demo-ready, even if some advanced features are intentionally excluded.