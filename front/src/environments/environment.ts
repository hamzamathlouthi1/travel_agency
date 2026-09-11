export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081/api',
  // Dedicated base URL for the user-service microservice (port 8081, see
  // docker-compose.yml / services/user-service/src/main/resources/application.yml).
  // Kept separate from apiBaseUrl so each microservice can move to its own
  // host/port independently as more services are added behind the gateway.
  userServiceUrl: 'http://localhost:8081/api',
  defaultLocale: 'fr-TN',
  defaultCurrency: 'TND',
};
