#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, options = {}) {
  try {
    log(`Running: ${command}`, colors.blue);
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    log(`Command failed: ${command}`, colors.red);
    return false;
  }
}

function checkPactBroker() {
  try {
    execSync('curl -s http://localhost:9292/diagnostic/status/heartbeat', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  log('\n🤝 Teaching Engine 2.0 - Pact Contract Testing\n', colors.bright);

  switch (command) {
    case 'consumer':
      log('Running consumer contract tests...', colors.green);
      runCommand('pnpm --filter client test:pact');
      break;

    case 'provider':
      log('Running provider verification tests...', colors.green);
      runCommand('pnpm --filter server test:pact:verify');
      break;

    case 'all':
      log('Running all contract tests...', colors.green);
      const consumerSuccess = runCommand('pnpm --filter client test:pact');
      if (consumerSuccess) {
        runCommand('pnpm --filter server test:pact:verify');
      }
      break;

    case 'publish':
      log('Publishing contracts to broker...', colors.green);
      if (!checkPactBroker()) {
        log('Pact Broker not running. Starting it now...', colors.yellow);
        runCommand('docker-compose -f docker-compose.pact.yml up -d');
        // Wait for broker to be ready
        log('Waiting for Pact Broker to start...', colors.yellow);
        execSync('sleep 10');
      }
      runCommand('pnpm test:contract:publish');
      break;

    case 'broker':
      log('Managing Pact Broker...', colors.green);
      const brokerCmd = args[1];
      if (brokerCmd === 'start') {
        runCommand('docker-compose -f docker-compose.pact.yml up -d');
        log('\nPact Broker started at http://localhost:9292', colors.green);
        log('Default credentials: admin/admin', colors.yellow);
      } else if (brokerCmd === 'stop') {
        runCommand('docker-compose -f docker-compose.pact.yml down');
      } else if (brokerCmd === 'logs') {
        runCommand('docker-compose -f docker-compose.pact.yml logs -f pact-broker');
      } else {
        log('Usage: pnpm pact broker [start|stop|logs]', colors.yellow);
      }
      break;

    case 'can-i-deploy':
      log('Checking deployment compatibility...', colors.green);
      runCommand('pnpm pact:can-i-deploy');
      break;

    case 'help':
    default:
      log('Available commands:', colors.yellow);
      log('  pnpm pact consumer    - Run consumer contract tests');
      log('  pnpm pact provider    - Run provider verification tests');
      log('  pnpm pact all         - Run all contract tests');
      log('  pnpm pact publish     - Publish contracts to broker');
      log('  pnpm pact broker start - Start local Pact Broker');
      log('  pnpm pact broker stop  - Stop local Pact Broker');
      log('  pnpm pact broker logs  - View Pact Broker logs');
      log('  pnpm pact can-i-deploy - Check deployment compatibility');
      log('  pnpm pact help        - Show this help message');
      
      log('\nQuick start:', colors.green);
      log('  1. pnpm pact broker start  # Start Pact Broker');
      log('  2. pnpm pact all          # Run all tests');
      log('  3. pnpm pact publish      # Publish contracts');
      
      log('\nDocumentation:', colors.blue);
      log('  See docs/PACT_CONTRACT_TESTING.md for detailed guide');
      break;
  }
}

main().catch((error) => {
  log(`Error: ${error.message}`, colors.red);
  process.exit(1);
});