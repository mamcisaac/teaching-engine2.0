#!/bin/bash

# Test Curriculum Coverage API Endpoints
# Run this script to verify the curriculum coverage endpoints are working

API_BASE="http://localhost:3000/api"
AUTH_TOKEN="your-auth-token-here" # Replace with actual token

echo "🧪 Testing Curriculum Coverage API Endpoints"
echo "==========================================="

# Test 1: Get overall coverage
echo ""
echo "Test 1: GET /api/curriculum-coverage"
curl -X GET \
  "$API_BASE/curriculum-coverage?grade=1" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test 2: Get coverage by subject
echo ""
echo "Test 2: GET /api/curriculum-coverage with subject filter"
curl -X GET \
  "$API_BASE/curriculum-coverage?grade=1&subject=Mathématiques" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test 3: Get uncovered expectations
echo ""
echo "Test 3: GET /api/curriculum-coverage/uncovered"
curl -X GET \
  "$API_BASE/curriculum-coverage/uncovered?grade=1&limit=5" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test 4: Get high priority uncovered expectations
echo ""
echo "Test 4: GET /api/curriculum-coverage/uncovered with priority filter"
curl -X GET \
  "$API_BASE/curriculum-coverage/uncovered?grade=1&priorityFilter=high&limit=5" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test 5: Generate quick plan (requires valid expectation ID)
echo ""
echo "Test 5: POST /api/curriculum-coverage/quick-plan"
echo "Note: Replace 'test-expectation-id' with an actual expectation ID"
curl -X POST \
  "$API_BASE/curriculum-coverage/quick-plan" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "expectationId": "test-expectation-id",
    "date": "'$(date -I)'"
  }' | jq '.'

echo ""
echo "✅ API Endpoint Tests Complete"
echo ""
echo "To use this script:"
echo "1. Start the server: cd server && npm run dev"
echo "2. Get an auth token by logging in"
echo "3. Replace AUTH_TOKEN in this script"
echo "4. Run: chmod +x test-coverage-api.sh && ./test-coverage-api.sh"