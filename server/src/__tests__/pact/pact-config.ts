import path from 'path';

export const pactVerifierConfig = {
  providerBaseUrl: 'http://localhost:3000',
  provider: 'TeachingEngineServer',
  providerVersion: process.env.npm_package_version || '0.0.0',
  pactUrls: [
    path.resolve(__dirname, '../../../client/pacts/teachingengineclient-teachingengineserver.json'),
  ],
  // Alternatively, use Pact Broker
  // pactBrokerUrl: process.env.PACT_BROKER_URL || 'http://localhost:9292',
  // pactBrokerUsername: process.env.PACT_BROKER_USERNAME,
  // pactBrokerPassword: process.env.PACT_BROKER_PASSWORD,
  // publishVerificationResult: true,
  logLevel: 'warn' as const,
  stateHandlers: {
    // Provider states will be defined here
  },
  // Custom headers for authentication
  customProviderHeaders: {
    'Authorization': 'Bearer test-token',
  },
  // Request filter to handle authentication
  requestFilter: (req: any, res: any, next: any) => {
    // Add authentication headers if needed
    if (!req.headers.authorization) {
      req.headers.authorization = 'Bearer test-token';
    }
    next();
  },
};