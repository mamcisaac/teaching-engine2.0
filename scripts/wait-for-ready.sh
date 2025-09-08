#!/bin/bash
# Wait for backend to be ready (checking /readyz endpoint)

echo "⏳ Waiting for backend to be ready..."

for i in {1..30}; do
  if curl -fsS --max-time 1 http://localhost:3000/readyz 2>/dev/null | grep -q '"status":"ok"'; then
    echo "✅ Backend is ready!"
    exit 0
  fi
  echo "⏳ Waiting for backend... ($i/30)"
  sleep 1
done

echo "❌ Backend failed to become ready after 30 seconds"
exit 1