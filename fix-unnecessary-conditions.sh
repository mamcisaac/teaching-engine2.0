#!/bin/bash

# Fix common unnecessary condition patterns in TypeScript files

echo "Fixing unnecessary condition violations..."

# Find all TypeScript files in client/src
find client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Fix pattern: !== null && !== undefined && !== ''
  sed -i '' 's/!== null && [^[:space:]]*\..*!== undefined && [^[:space:]]*\..*!== '\'''\''//g' "$file"
  
  # Fix pattern: !== null && !== undefined
  sed -i '' 's/ !== null && [^[:space:]]*\..*!== undefined//g' "$file"
  
  # Fix pattern: === null || === undefined || === ''
  sed -i '' 's/ === null || [^[:space:]]*\..*=== undefined || [^[:space:]]*\..*=== '\'''\''//g' "$file"
  
  # Fix pattern: === null || === undefined
  sed -i '' 's/ === null || [^[:space:]]*\..*=== undefined//g' "$file"
done

echo "Fixed common unnecessary condition patterns"