# MERPY HRIS — BACKEND IMPLEMENTATION PLAN

## Cara Pakai

1. Setiap fitur punya file plan sendiri (e.g., `plan-auth.md`, `plan-employee.md`).
2. Setiap fitur dipecah menjadi Phase A (Foundation & Core Logic) dan Phase B (Interface & Integration).
3. Copy template di bawah, ganti `[FITUR]`, `[MODULE]`, dan detailnya.
4. Prompt eksekusi untuk AI murah sudah ada di bagian bawah setiap phase.

---

# TEMPLATE: PLAN-[FITUR].MD

## Overview Fitur

- **Nama Fitur:** [Contoh: Authentication]
- **Module Utama:** [Contoh: src/module/auth]
- **Related API:** [Lihat CONTRACT.md section: Auth]
- **Priority:** [P0 / P1 / P2]
- **Dependensi:** [Fitur lain yang harus jadi dulu, e.g., "Prisma schema updated"]

---

## Phase A: Foundation & Core Logic (Schema, DTO, Service)

### Goal

Business logic dan layer database siap. Logic internal berfungsi 100% dan teruji dengan Unit Test.

### Database (Prisma)

- [ ] Update `prisma/schema.prisma`
- [ ] Run `npx prisma generate`
- [ ] [Optional] Buat migration: `npx prisma migrate dev --name [name]`

### DTOs & Types

- `src/module/[module]/dto/[fitur].dto.ts` — [Deskripsi DTO]
- `src/module/[module]/types/[fitur].type.ts` — [Deskripsi Types]

### Service Logic

- `src/module/[module]/[fitur].service.ts`
- Method: `[methodName]` — [Deskripsi logic]

### Unit Testing

- `src/module/[module]/[fitur].service.spec.ts`
- [ ] Mock Prisma Service
- [ ] Test success cases
- [ ] Test failure/exception cases (400, 401, 404, etc.)

### Acceptance Criteria Phase A

- [ ] Prisma schema sync dengan kebutuhan fitur
- [ ] Business logic di Service lengkap sesuai requirement
- [ ] Unit tests pass 100%
- [ ] Lint pass (`pnpm run lint`)

### Prompt Eksekusi untuk AI Murah (Phase A)

```
Eksekusi Phase A: [Nama Fitur] Foundation & Core Logic.

Konteks:
- Stack: NestJS, Prisma, Jest.
- Lihat CONTRACT.md section [Resource] untuk requirement logic.
- Ikuti pattern di module existing (Injectable Service, Prisma Service).

Tugas:
1. Update Prisma Schema: [detail field/model yang ditambah/ubah]
2. Jalankan prisma generate.
3. Buat/Update DTO di src/module/[module]/dto/. Gunakan class-validator.
4. Implementasi Business Logic di Service: [list method dan fungsinya].
5. Buat Unit Test di .spec.ts. Mock Prisma dependency. Cover success & error cases.

Constraint:
- JANGAN buat Controller dulu.
- JANGAN ubah global config kecuali diperlukan.
- Setelah selesai, jalankan: pnpm run lint dan jest [file path].
- Commit: "feat([fitur]): phase A — foundation and core logic"
```

---

## Phase B: Interface & Integration (Controller & API)

### Goal

Endpoint API terekspos, terproteksi, dan terintegrasi dengan Service. Teruji dengan Integration/E2E Test.

### Controller

- `src/module/[module]/[fitur].controller.ts`
- Endpoints:
  - `[METHOD] [path]` — [Deskripsi]

### Security & Guards

- [ ] `AuthGuard` (JWT)
- [ ] `RolesGuard` / `PermissionsGuard`
- [ ] Decorator: `@GetUser()`, `@Roles()`, dll.

### Integration/E2E Testing

- `test/[fitur].e2e-spec.ts`
- [ ] Test flow dari request ke response
- [ ] Validasi status code & response body

### Acceptance Criteria Phase B

- [ ] Endpoint bisa di akses via Postman/Thunder Client
- [ ] Input validation (DTO) bekerja (400 Bad Request)
- [ ] Security (Guards) bekerja (401 Unauthorized / 403 Forbidden)
- [ ] E2E tests pass 100%
- [ ] Build pass (`pnpm run build`)

### Prompt Eksekusi untuk AI Murah (Phase B)

```
Eksekusi Phase B: [Nama Fitur] Interface & Integration.

Konteks:
- Phase A sudah selesai. Service & Schema sudah siap.
- Lihat CONTRACT.md untuk endpoint detail.
- Stack: NestJS Controllers, Guards, Supertest.

Tugas:
1. Buat/Update Controller: [list endpoint].
2. Inject Service yang sudah dibuat di Phase A.
3. Gunakan Guards yang sesuai (e.g., @UseGuards(JwtAuthGuard)).
4. Gunakan Decorators untuk ambil user data jika perlu.
5. Buat E2E Test di folder test/ untuk cover main flow.

Constraint:
- JANGAN ubah business logic di Service (sudah beres di Phase A).
- Pastikan DTO validation sudah aktif di main.ts (ValidationPipe).
- Setelah selesai, jalankan: pnpm run build && pnpm run lint.
- Commit: "feat([fitur]): phase B — controller and integration"
```

---

## Catatan Review

### Phase A Review

- [ ] Logic approved / Perlu revisi: [catatan]
- [ ] Tanggal review:

### Phase B Review

- [ ] API approved / Perlu revisi: [catatan]
- [ ] Tanggal review:
- [ ] PR merged: [link PR]
