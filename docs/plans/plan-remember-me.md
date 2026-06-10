# MERPY HRIS — IMPLEMENTATION PLAN: REMEMBER ME

## Overview Fitur
- **Nama Fitur:** Remember Me Authentication
- **Module Utama:** src/module/auth
- **Related API:** POST /auth/login (Update), POST /auth/refresh (Update)
- **Priority:** P1
- **Dependensi:** Auth Module existing

---

## Phase A: Foundation & Core Logic (Schema & Service)

### Goal
Menambahkan kemampuan sistem untuk mengenali session yang berumur panjang (long-lived) di database dan logic internal.

### Database (Prisma)
- [ ] Update `prisma/schema.prisma`: Tambahkan field `isRememberMe Boolean @default(false)` ke model `Sessions`.
- [ ] Run `npx prisma generate`.

### DTOs & Types
- Update `src/module/auth/dto/login.dto.ts`: Tambahkan `rememberMe?: boolean`.

### Service Logic
- `src/module/auth/auth.service.ts`
- Update `login()`:
  - Jika `rememberMe` true, set `expiresAt` session ke 30 hari.
  - Simpan flag `isRememberMe` ke database.
  - Set cache TTL sesuai durasi (30 hari vs 7 hari default).
- Update `refresh()`:
  - Cek flag `isRememberMe` dari session lama.
  - Jika true, perpanjang `expiresAt` token baru tetap 30 hari.

### Unit Testing
- `src/module/auth/auth.service.spec.ts`
- [ ] Test `login` dengan `rememberMe: true` -> cek `expiresAt` dan `isRememberMe` di session.
- [ ] Test `login` dengan `rememberMe: false` -> cek default expiry (7 hari).
- [ ] Test `refresh` untuk session yang punya `isRememberMe: true`.

### Acceptance Criteria Phase A
- [ ] Schema Prisma mendukung penyimpanan status Remember Me.
- [ ] `AuthService` bisa membedakan durasi session berdasarkan input.
- [ ] Unit tests pass.

### Prompt Eksekusi untuk AI Murah (Phase A)
```
Eksekusi Phase A: Remember Me Foundation & Core Logic.

Konteks:
- Sistem menggunakan Session-based refresh token (tersimpan di DB model Sessions).
- Expiry default saat ini adalah 7 hari.

Tugas:
1. Update Prisma Schema: Tambahkan field `isRememberMe Boolean @default(false)` di model `Sessions`. Jalankan `npx prisma generate`.
2. Update `LoginDto`: Tambahkan properti `rememberMe` (boolean, optional).
3. Update `AuthService.login()`:
   - Ambil `rememberMe` dari DTO.
   - Jika true, hitung `expiresAt` untuk 30 hari kedepan.
   - Jika false (default), tetap 7 hari.
   - Simpan `isRememberMe` saat create session di DB.
   - Update `cacheService.set` TTL agar sinkron dengan `expiresAt`.
4. Update `AuthService.refresh()`:
   - Saat update session, ambil info `isRememberMe` dari session yang sedang di-refresh (cari dulu session-nya).
   - Pertahankan durasi (30 hari jika `isRememberMe` true).
5. Tambahkan unit test di `auth.service.spec.ts` untuk memverifikasi perbedaan durasi session.

Constraint:
- JANGAN ubah logic JWT token generation (AccessToken & RefreshToken expiry di config tetap sama, yang berubah adalah session expiry di DB/Cache).
- Gunakan `dayjs` atau native `Date` untuk kalkulasi waktu.
- Commit: "feat(auth): phase A — remember me logic and schema"
```

---

## Phase B: Interface & Integration (Controller)

### Goal
Mengekspos input `rememberMe` di API login dan memastikan integrasi end-to-end bekerja.

### Controller
- `src/module/auth/auth.controller.ts`
- Update `POST /auth/login`: Pastikan DTO baru diterima dan diteruskan ke Service.

### Integration/E2E Testing
- `test/auth.e2e-spec.ts`
- [ ] Login dengan `rememberMe: true`, cek di DB apakah `isRememberMe` true.
- [ ] Login, lalu panggil `/refresh` beberapa kali, pastikan session tetap valid sesuai durasi panjangnya.

### Acceptance Criteria Phase B
- [ ] API `/auth/login` menerima field `rememberMe`.
- [ ] Session di database benar-benar berumur 30 hari saat flag aktif.
- [ ] E2E tests pass.

### Prompt Eksekusi untuk AI Murah (Phase B)
```
Eksekusi Phase B: Remember Me Interface & Integration.

Konteks:
- Phase A (Service & Schema) sudah selesai.

Tugas:
1. Update `AuthController.login`: Pastikan `LoginDto` yang sudah diupdate di Phase A digunakan dengan benar.
2. Buat/Update E2E Test di `test/auth.e2e-spec.ts`:
   - Skenario 1: Login dengan `rememberMe: true`. Verifikasi record di tabel `Sessions` punya `isRememberMe: true` dan `expiresAt` sekitar 30 hari dari sekarang.
   - Skenario 2: Login normal. Verifikasi `expiresAt` sekitar 7 hari.
   - Skenario 3: Refresh session yang `rememberMe: true`. Verifikasi `expiresAt` baru tetap berdurasi panjang.

Constraint:
- Pastikan `ValidationPipe` global di `main.ts` menangani DTO baru dengan benar.
- Setelah selesai, jalankan `npm run build` untuk memastikan tidak ada breaking changes.
- Commit: "feat(auth): phase B — remember me api integration"
```

---

## Catatan Review

### Phase A Review
- [ ] Logic approved / Perlu revisi: ___________
- [ ] Tanggal: ___________

### Phase B Review
- [ ] Integration approved / Perlu revisi: ___________
- [ ] Tanggal: ___________
- [ ] PR merged: ___________
