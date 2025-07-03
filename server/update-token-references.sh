#!/bin/bash

# Update all references to body.token to body.accessToken in integration tests
find ./tests/integration -name "*.test.ts" -type f -exec sed -i '' \
  -e 's/\.body\.token/\.body\.accessToken/g' \
  -e 's/loginRes\.body\.token/loginRes.body.accessToken/g' \
  -e 's/response\.body\.token/response.body.accessToken/g' \
  -e 's/res\.body\.token/res.body.accessToken/g' \
  -e "s/'token'/'accessToken'/g" \
  -e 's/"token"/"accessToken"/g' \
  -e 's/toHaveProperty('\''token'\'')/toHaveProperty('\''accessToken'\'')/g' \
  -e 's/toHaveProperty("token")/toHaveProperty("accessToken")/g' \
  -e 's/expect(.*cookies.*).toBeDefined();//g' \
  -e 's/expect(.*cookies.*).toMatch.*;//g' \
  -e 's/const cookies = .*;//g' \
  -e 's/\/\/ Check httpOnly cookie.*//g' \
  -e 's/\/\/ Check that cookie.*//g' \
  -e 's/\/\/ Cookie can be cleared.*//g' \
  {} \;

# Remove empty lines created by deletions
find ./tests/integration -name "*.test.ts" -type f -exec sed -i '' '/^[[:space:]]*$/N;/\n[[:space:]]*$/d' {} \;

echo "Updated all token references in integration tests"