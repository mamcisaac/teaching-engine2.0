import path from 'path';

export const pactVerifierConfig = {
  providerBaseUrl: 'http://localhost:3000',
  provider: 'TeachingEngineServer',
  providerVersion: process.env.npm_package_version || '0.0.0',
  pactUrls: [
    path.resolve(__dirname, '../../../../client/pacts/teachingengineclient-teachingengineserver.json'),
  ],
  // Alternatively, use Pact Broker
  // pactBrokerUrl: process.env.PACT_BROKER_URL || 'http://localhost:9292',
  // pactBrokerUsername: process.env.PACT_BROKER_USERNAME,
  // pactBrokerPassword: process.env.PACT_BROKER_PASSWORD,
  // publishVerificationResult: true,
  logLevel: 'warn' as const,
  stateHandlers: {
    // Provider states will be defined here
    'user is authenticated': () => Promise.resolve('User authenticated'),
    'a lesson plan exists': () => Promise.resolve('Lesson plan exists'),
    'a unit plan exists': () => Promise.resolve('Unit plan exists'),
    'a daybook entry exists': () => Promise.resolve('Daybook entry exists'),
    'user is authenticated and lesson plan exists': () => Promise.resolve('User authenticated and lesson plan exists'),
    'user is authenticated and long range plan exists': () => Promise.resolve('User authenticated and long range plan exists'),
  },
  // Custom headers for authentication
  customProviderHeaders: {
    'Authorization': 'Bearer test-token',
  },
  // Request filter to handle authentication
  requestFilter: (req: unknown, res: unknown, next: unknown) => {
    // Add authentication headers if needed
    if (!req.headers.authorization) {
      req.headers.authorization = 'Bearer test-token';
    }
    next();
  },
};