# Uji Lokal GuruWali V2 (tanpa VPS)

Catatan untuk menjalankan aplikasi + database PostgreSQL sepenuhnya lokal
sebelum deploy ke VPS baru.

## Database

- Produksi nanti: PostgreSQL di VPS baru (BUKAN Supabase).
- Uji lokal terbukti bekerja dengan `prisma migrate deploy` di database
  kosong: baseline + 3 migration lanjutan membuat seluruh 23 tabel model.
- Bila tidak ada PostgreSQL terpasang, binary portabel dapat diambil dari
  paket npm `embedded-postgres` (`@embedded-postgres/linux-x64/native`),
  disalin ke luar folder workspace (workspace tidak mengizinkan
  eksekusi/chown di tempat), lalu `initdb` + `pg_ctl` dijalankan manual
  sebagai user non-root (PostgreSQL menolak berjalan sebagai root).

## Server

```
DATABASE_URL=postgresql://user:pass@host:5432/db \
GEMINI_API_KEY=<key opsional> \
npm run build && npm start
```

`GEMINI_API_KEY` hanya dipakai endpoint generate deskripsi rapor
(`app/api/rapor/deskripsi/generate`); tanpa key fitur AI membalas 503
dengan pesan jelas dan fungsi lain tetap berjalan.

## Checklist regression (terverifikasi 2026-10-08, 25 skenario lulus)

1. `prisma migrate deploy` sukses di DB kosong.
2. Login guru/admin; kegagalan berulang kena rate limit (429 setelah 10x).
3. Input nilai: nilai akhir = rata-rata otomatis, predikat otomatis,
   upsert tanpa duplikat.
4. Guru tidak bisa mengubah nilai guru lain (403); Admin Sekolah bisa.
5. Guru tidak bisa membuat periode rapor (403 khusus Admin Sekolah).
6. Rekap: rata-rata/min/maks per mapel benar.
7. Generate deskripsi: tanpa key 503, siswa tanpa nilai 400, key salah
   502 terkendali — endpoint tidak pernah menulis nilai.
8. Catatan Wali Kelas: hanya wali kelas siswa (403 untuk guru lain).
9. Preview rapor JSON lengkap; PDF rapor HTTP 200 berisi kop sekolah,
   nilai, deskripsi, dan catatan (pdfkit butuh `serverExternalPackages`).
10. Bank Soal: buat/list, PG <2 opsi ditolak, hapus oleh non-pemilik 403.
11. PWA: `/manifest.json` dan `/sw.js` terlayani 200.
