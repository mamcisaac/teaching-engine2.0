#!/bin/bash

echo "🔧 Fixing syntax errors introduced by previous script"

# Fix the broken arrow functions - should be () => not () => =>
find client/src/api -name "*.ts" -type f -exec sed -i '' 's/onSuccess: () => =>/onSuccess: () =>/g' {} \;
find client/src/api -name "*.ts" -type f -exec sed -i '' 's/onError: () => =>/onError: () =>/g' {} \;

echo "✅ Syntax errors fixed!"