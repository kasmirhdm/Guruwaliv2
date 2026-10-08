# GuruWali V2

Platform administrasi guru dan sekolah. **Bukan** aplikasi Guru AI —
GuruWali v1 (generator AI) tetap berjalan terpisah di guruwali.web.id.

## Keputusan produk (2026-10-08, mengikat)

- V2 adalah platform administrasi guru/sekolah: kurikulum, perangkat ajar,
  dokumen, penilaian, rapor, dan wali kelas.
- AI **hanya** boleh dipakai sebagai fitur pendukung:
  **Generate Deskripsi Rapor**. Seluruh AI v1 tidak digabungkan ke v2.
- AI deskripsi rapor menerima: nama siswa, mata pelajaran, CP, TP, ATP,
  materi, nilai, predikat. AI hanya menghasilkan teks deskripsi dan
  **tidak boleh mengubah nilai**. Alur guru:
  Generate → Review → Edit → Regenerate → Simpan.
- Database target: **PostgreSQL di VPS** (bukan Supabase).
- Dilarang: menghapus fitur yang sudah ada, reset database, perubahan destruktif.
- Role: Admin GuruWali (super admin) → Admin Sekolah → Wali Kelas / Guru.

## Struktur kurikulum (WAJIB, jangan diubah urutannya)

Kurikulum → Fase → Mata Pelajaran → CP → TP → ATP → Materi → Perangkat Ajar

Pemetaan model Prisma: `Curriculum` → `Phase` → `MasterSubject`/`Subject` →
`LearningOutcome` (CP) → `LearningObjective` (TP) → `LearningSequence` (ATP) →
`LearningMaterial` (Materi) → `TeachingDevice` (Perangkat Ajar).

## Prioritas

1. Stabilkan Prisma schema + migration
2. PostgreSQL di VPS (deploy di VPS baru setelah semua terverifikasi)
3. Penilaian
4. Rekap nilai
5. Generate Deskripsi Rapor dengan AI
6. Review/edit/regenerate/simpan deskripsi oleh guru
7. Catatan Wali Kelas
8. Preview Rapor
9. PDF Rapor
10. PWA/offline
11. Bank Soal

## Pengembangan

```bash
npm install
npx prisma generate
npm run build
```

Database lokal/produksi melalui `DATABASE_URL` (PostgreSQL).
Migrasi: `npx prisma migrate deploy` (baseline + migration bertahap tersedia).
