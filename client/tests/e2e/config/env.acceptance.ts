export const ENV = {
  UI_BASE_URL: process.env.UI_BASE_URL ?? 'http://localhost:5173',
  API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:3000',
  TZ: process.env.TZ ?? 'America/Halifax',
  EMILY_EMAIL: process.env.E2E_EMILY_EMAIL ?? 'emmcisaac@gmail.com',
  EMILY_PASSWORD: process.env.E2E_EMILY_PASSWORD ?? 'myhusbandisthebest',
  WRITE_TESTS: (process.env.WRITE_TESTS ?? 'false').toLowerCase() === 'true',
  E2E_DB_IS_COPY: (process.env.E2E_DB_IS_COPY ?? 'false').toLowerCase() === 'true',
};