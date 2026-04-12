Pengerjaan website dibagi kepada 6 orang, untuk sekarang saya mendapatkan tanggung jawab mengerjakan front-end, untuk sementara gunakan mock data karena koneksi back-end akan dilakukan di waktu berikutnya. Struktur mock database (jika dibutuhkan desain) mengikuti 

## PLAYER PERSPECTIVE

### 3 Jenis Task:
    1. MyTask
        a. Adalah area personal dari player untuk membuat/menambah, menghapus, memantau task yang buatannya.
    2. P2P Card
        a. Adalah area 'umum' menampilkan list semua task dari player, dimana player lain dapat mengambil task dari sini untuk mendapatkan reward.
    3. Community Task
        a. Adalah area dimana Web Master yang membuat task area ini juga merupakan area umum untuk semua player GrowFriend mengambil untuk mengambil task dan mendapatkan reward.

Properties Card bedasarkan area (sementara)
    1. MyTask
        a. Frontside - card
            i. Details button (hanya saat berada di tampilan biasa bukan modals - klik untuk mendapat tampilan lebih besar sebagai modals)
            ii. Task Title
            iii. Instructions
            iv. Expired Date last
            v. Reward coins
            vi. Flip button - show the back of the card
            vii. X button (close button)
        b. Backside - card
            i. Time limit (in hours or days)
            ii. Objective/s
            iii. Reward coins (again)
            iv. If the status `taken`, show the assignee username
            v. Flip button - show the front of the card
            vi. X button (close button)
            
    2. P2PTask
        a. Frontside - card
            i. Details button (hanya saat berada di tampilan biasa bukan modals - klik untuk mendapat tampilan lebih besar sebagai modals)
            ii. Accept Button (hanya ada pada tampilan modals - klik untuk menerima task)
            iii. Task Title
            iv. Instructions
            v. Expired Date last
            vi. Reward coins
            vii. Flip button - show the back of the card
            viii. X button (close button)
            
        b. Backside - card
            i. Time limit (in hours or days)
            ii. Objective/s
            iii. Reward coins (again)
            iv. If the status `taken`, show the assignee username
            v. Flip button - show the front of the card
            vi. X button (close button)
            
    3. CommunityTask
        a. Frontside - card
            i. Details button (hanya saat berada di tampilan biasa bukan modals - klik untuk mendapat tampilan lebih besar sebagai modals)
            ii. Accept Button (hanya ada pada tampilan modals - klik untuk menerima task)
            iii. Task Title
            iv. Instructions
            v. Expired Date last
            vi. Reward coins
            vii. Flip button - show the back of the card
            viii. X button (close button)
            
        b. Backside - card
            i. Time limit (in hours or days)
            ii. Objective/s
            iii. Reward coins (again)
            iv. If the status `taken`, show the assignee username
            v. Flip button - show the front of the card
            vi. Difficulty (Easy/Medium/Hard)
            vii. X button (close button)

### 3 Jenis Modal

    Template Modal akan memiliki deskripsi tergantung jenis modal di area mana pada sisi kiri atas dan juga tombol [X] close modal. Tiap modal memiliki tombol navigasi ke 3 modal berbeda:
    
        1. MyTask
        2. P2PTask
        3. CommunityTask
        
        
Properties/fitur pada masing-masing modal:
    1. MyTask
        1. Filter
            i. Filter status card (`Open / Active / Cancelled / Expired`)
        2. Sort
            i. Reward
                1) Highest
                2) Lowest
            ii. Time Limit
                1) Longest
                2) Shortest
            iii. Expiry Date
                1) Earliest
                2) Latest
        3. Create Task
            i. Klik tombol Create (terdapat 2 entry point, dari tombol di atas list card bersama dengan tombol lain dan tombol pada layout card dengan tanda (+) hanya muncul jika list card belum terisi penuh pada dekstop) - Akan menampilkan modal yang berisi form:
                1) Judul
                2) Instruction
                3) Objective/s
                4) Time Limit
                5) Reward - in this area, there will be like note text or info hover textbox or clickable icon info for showing the rule for reward system, there is a bond coins for the created task, etc tbd later, show mock text first
                6) Create button
                7) X button (close button) inside the create task modal
                
        4. Edit Task
            i. Klik tombol Edit - Maka tombol akan shiny dan tampilan tombol overlay bersama card, jika mouse hovering ke arah card, maka akan muuncul tombol edit yang dapat diklik dan menampilkan modal edit:
                1) Modal edit seharusnya sama persis dengan create, namun sudah menampilkan semua isian dari masing-masing form -> player dapat mengganti isi form tersebut
                2) Tombol Done - Klik dan card kembali ke posisi awal dan isi akan berubah jika telah dilakukan edit
        5. Delete Task
            i. Klik tombol Delete - Maka tombol akan shiny dan tampilan tombol overlay bersama card, jika mouse hovering ke arah card, maka akan muuncul logo delete yang overlay terhadap card yang dapat diklik dan akan menampilkan warning ex: "Are you sure want to delete this task?" beserta tombol Yes/No
        6. Help
            i. Berisi list deskripsi fitur (tbd - mock it first)
        
    2. P2PTask
        1. Filter
            i. Filter status card (`Open / Active / Cancelled / Expired`)
        2. Sort
            i. Reward
                1) Highest
                2) Lowest
            ii. Time Limit
                1) Longest
                2) Shortest
            iii. Expiry Date
                1) Earliest
                2) Latest
        3. Help
            i. Berisi list deskripsi fitur (tbd - mock it first)
        
    3. CommunityTask
        1. Filter
            i. Filter status card (`Open / Active / Cancelled / Expired`)
        2. Sort
            i. Reward
                1) Highest
                2) Lowest
            ii. Time Limit
                1) Longest
                2) Shortest
            iii. Expiry Date
                1) Earliest
                2) Latest
        3. Help
            i. Berisi list deskripsi fitur (tbd - mock it first)



ADMIN PERSPECTIVE 
    -TBD
----------------------------------


---
## Tech Stack
### Backend (dikerjakan anggota lain)
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT (`jsonwebtoken`) — autentikasi
- bcryptjs — enkripsi password
- CORS, dotenv
- Nodemon (dev)
### Frontend (bagian Musa)
- React + Vite (JavaScript)
- React Router DOM
- Axios 1.15.0
- ESLint (dev)
---
### Sistem 1 — TaskCard (card flip animasi)
Card yang menampilkan task. Bisa di-klik untuk flip (animasi 3D bolak-balik).
**Sisi depan (front):**
- Judul task
- Reward coins (badge)
- Status chip (`open` / `in_progress` / `completed`)
- Tipe task chip (`p2p` / `public` / `personal`)
- Klik → flip ke belakang

**Sisi belakang (back):**
- Deskripsi lengkap task
- Nama pembuat task
- Deadline 
- Tombol aksi (Apply / Accept / Mark Done — tergantung tipe task)
- Klik tombol X atau area luar → flip balik ke depan
- Tanggal kadaluarsa Task (otomatis setelah create task expired adalah 5 hari)
**File yang dibutuhkan:**
```
src/components/task/
├── TaskCard.jsx        ← state isFlipped, wrapper animasi
├── TaskCardFront.jsx   ← sisi depan
├── TaskCardBack.jsx    ← sisi belakang
└── TaskCard.css        ← CSS 3D flip (perspective + rotateY)
```
**Teknik animasi:**
```css
/* Prinsip dasar — detail implementasi ada di TaskCard.css */
.card-inner {
  transition: transform 0.5s;
  transform-style: preserve-3d;
}
.card-inner.flipped {
  transform: rotateY(180deg);
}
.card-front, .card-back {
  backface-visibility: hidden;
  position: absolute;
}
.card-back {
  transform: rotateY(180deg);
}
```
---
### Sistem 2 — Modal System (3 jenis modal)
Modal berukuran ~3/4 halaman dengan blur overlay dan tombol X. Dipanggil dari `CommunityPage.jsx`.
**Arsitektur:**
```
src/components/modals/
├── ModalBase.jsx       ← wrapper: blur overlay + tombol X + children prop
├── P2PModal.jsx        ← modal buat/lihat P2P task
├── MyTaskModal.jsx     ← modal task pribadi user
└── CommunityModal.jsx  ← modal community/system task (admin-created)
```
**`ModalBase.jsx` — props yang diterima:**
```js
// isOpen: boolean
// onClose: function
// title: string
// children: ReactNode
```
**`useModal.js` — custom hook:**
```
src/hooks/
└── useModal.js
```
```js
// State: { isOpen: boolean, modalType: string | null }
// Returns: { isOpen, modalType, openModal(type), closeModal() }
// type bisa: 'p2p' | 'mytask' | 'community'
```
---
### Modals yang dikelola Musa
```
Ini adalah fitur inti dari website ini
1. Modals MyTasks
2. Modals Community Tasks
3. Modals P2P Tasks
4. Apply frontend system for all these modals
5. Task Card component, that will gonna use in those 3 different modals (the system not yet decided)
```

> **CommunityPage** adalah halaman utama yang menggunakan TaskCard dan semua modal.
---
## Mock Data (Week 1 — sebelum API tersedia)
Format mock data **harus identik** dengan MongoDB schema supaya nanti Week 2 tinggal ganti import ke Axios.
### MongoDB Task Schema (disepakati tim):
```js
{
  _id: ObjectId,
  title: String,
  description: String,
  type: { type: String, enum: ['p2p', 'public', 'personal'] },
  createdBy: ObjectId,      // referensi ke user
  assignedTo: ObjectId,     // referensi ke user (nullable)
  status: { type: String, enum: ['open', 'in_progress', 'completed'] },
  reward: Number,           // dalam coins
  createdAt: Date
}
```
### File mock data:
```
src/data/
├── mockP2PTasks.js
├── mockPublicTasks.js
└── mockMyTasks.js
```
### Contoh format mock:

// mockP2PTasks.js
export const mockP2PTasks = [
  {
    _id: 'p2p-001',
    title: 'Help pick up parcel from library',
    description: 'I need someone to pick up a parcel from the main library counter. Will take about 10 minutes.',
    type: 'p2p',
    createdBy: { _id: 'user-001', name: 'Alex' },
    assignedTo: null,
    status: 'open',
    reward: 30,
    createdAt: '2026-04-10T09:00:00Z'
  },
  {
    _id: 'p2p-002',
    title: 'Proofread my 500-word essay',
    description: 'Need someone to check grammar and flow on a short essay due tomorrow.',
    type: 'p2p',
    createdBy: { _id: 'user-002', name: 'Sarah' },
    assignedTo: null,
    status: 'open',
    reward: 50,
    createdAt: '2026-04-10T10:30:00Z'
  }
]
```
---
## Desain Aplikasi
- **Hanya 2 halaman nyata:** Login + Dashboard
- **Sisanya modal** — ukuran ~4/5 halaman, blur overlay, tombol X di pojok kanan atas
- Store dan Inventory bukan bagian Musa (dikerjakan Aidil)
---
## 3 Jenis Task
| Jenis | Dibuat oleh | Siapa bisa lihat | Reward |
|---|---|---|---|
| P2P Task | User biasa | Semua user | Ditentukan pembuat |
| Public Task | Admin/sistem | Semua user | 8 / 15 / 21 coins |
| My Task (personal) | Pemilik akun | Hanya pemilik | — |
---
## API Endpoints yang Akan Dikonsumsi Musa (Week 2)
> Belum tersedia di Week 1 — pakai mock data dulu.
> Backend dikerjakan Yang (Backend Member 6).
```
GET    /api/tasks              ← semua task (filter by type via query param)
GET    /api/tasks/:id          ← detail satu task
POST   /api/tasks              ← buat task baru (P2P / personal)
POST   /api/tasks/:id/apply    ← apply ke community task
PATCH  /api/tasks/:id/status   ← update status task
```
---
## Git Workflow
- Branch format: `feat/nama-fitur`, `fix/nama-bug`, `chore/nama-task`
- Commit format: `feat:`, `fix:`, `chore:`, `docs:`
- Tidak commit langsung ke `main`
- PR minimal 1 reviewer sebelum merge
- Branch protection aktif di `main`
**Branch yang relevan untuk Musa:**
```
feat/task-card-system
feat/modal-system
feat/focus-page
feat/community-page
feat/profile-page
```
## Urutan Pengerjaan
1. `useModal.js` — hook dulu, fondasi semua modal
2. `ModalBase.jsx` — wrapper generik, tulis sekali pakai banyak
3. `TaskCard.jsx` + `TaskCard.css` + `TaskCardFront.jsx` + `TaskCardBack.jsx`
4. `P2PModal.jsx` — modal P2P task
5. `MyTaskModal.jsx` — modal personal task
6. `CommunityModal.jsx` — modal community/public task
7. `mockP2PTasks.js` + `mockPublicTasks.js` + `mockMyTasks.js`
8. `CommunityPage.jsx` — rangkai semua komponen di atas
---
