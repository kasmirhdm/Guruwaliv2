# Prisma database

Production database: PostgreSQL on the GuruWali VPS.

Set DATABASE_URL in the server environment. Never commit real credentials.

Initial workflow:
1. npm install
2. npx prisma generate
3. npx prisma migrate dev --name init (development)
4. npx prisma migrate deploy (production)
