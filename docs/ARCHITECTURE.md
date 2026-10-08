# GuruWali V2 Architecture

## Account model
- Admin GuruWali: platform-wide administration.
- Admin Sekolah: manages one school.
- Guru: can start as Guru Individu or become Guru Sekolah.
- Wali Kelas is a teacher capability/assignment, not a separate account role.

## Teacher lifecycle
1. Teacher registers independently.
2. Account starts as Guru Individu.
3. Teacher can create personal teaching documents.
4. Teacher may request/join a school.
5. Admin Sekolah approves the membership.
6. The same account becomes connected to that school; no duplicate account.

## Data ownership
- Platform master data is controlled by Admin GuruWali.
- School operational data is controlled by Admin Sekolah.
- Personal teacher documents belong to the teacher until shared/attached to a school.
- School data is isolated by school_id.

## Curriculum hierarchy
Kurikulum -> Fase -> Mata Pelajaran -> CP -> TP -> ATP -> Materi -> Perangkat Ajar

## Deployment
- GitHub: source and CI.
- VPS: Next.js application, PostgreSQL, document storage, Nginx and SSL.
- No Supabase dependency.
