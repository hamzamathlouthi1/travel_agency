export const environment = {
  production: true,
  apiBaseUrl: '/api',
  // Same-origin path — the SSR server (server.ts) proxies this to
  // USER_SERVICE_URL (http://user-service:8081 in docker-compose.yml).
  userServiceUrl: '/api',
  defaultLocale: 'fr-TN',
  defaultCurrency: 'TND',
};
