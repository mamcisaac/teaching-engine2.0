#!/bin/bash

# Test the server endpoint
echo "Testing server endpoint..."

# Send a GET request to the test endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/test)

# Check the response status code
if [ "$response" -eq 200 ]; then
  echo "✅ Server is running and responding correctly"
  
  # Get and display the response body
  echo -e "\nResponse body:"
  curl -s http://localhost:3001/api/test | jq
else
  echo "❌ Server returned status code: $response"
  exit 1
fi
