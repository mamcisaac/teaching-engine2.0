#!/usr/bin/env bash
# Wait for backend readiness before running tests or deployments
# Usage: ./scripts/wait-for-readyz.sh [port]

set -euo pipefail

# Configuration
PORT="${1:-3000}"
MAX_ATTEMPTS=40
WAIT_TIME=0.5
URL="http://localhost:${PORT}/readyz"

echo "⏳ Waiting for backend readiness on port ${PORT}..."

# Wait loop
for i in $(seq 1 $MAX_ATTEMPTS); do
  if curl -fsS --max-time 1 "$URL" >/dev/null 2>&1; then
    echo "✅ Backend ready! (attempt $i/$MAX_ATTEMPTS)"
    
    # Show readiness details if available
    if command -v jq &> /dev/null; then
      echo "📊 Readiness status:"
      curl -sS "$URL" | jq '.'
    fi
    
    exit 0
  fi
  
  echo "⏳ Waiting for backend... ($i/$MAX_ATTEMPTS)"
  sleep "$WAIT_TIME"
done

echo "❌ Backend failed readiness check after $MAX_ATTEMPTS attempts"
echo "💡 Check if the server is running and accessible on port ${PORT}"

# Try to show what's available at the health endpoint
echo "🔍 Attempting basic health check:"
curl -fsS --max-time 1 "http://localhost:${PORT}/healthz" && echo "" || echo "Health check also failed"

exit 1