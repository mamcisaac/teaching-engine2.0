#!/bin/bash

# Fix unnecessary condition patterns in TypeScript files
find client/src server/src -name "*.ts" -o -name "*.tsx" | while read file; do
    # Skip node_modules and .git
    if [[ "$file" == *node_modules* ]] || [[ "$file" == *.git* ]]; then
        continue
    fi
    
    echo "Processing $file..."
    
    # Fix: variable !== null && variable !== undefined && variable !== '' patterns
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_.]*\) !== null && \1 !== undefined && \1 !== '\'''\''[[:space:]]*&&/\1 \&\&/g' "$file"
    
    # Fix: variable !== null && variable !== undefined patterns
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_.]*\) !== null && \1 !== undefined/\1/g' "$file"
    
    # Fix: variable === null || variable === undefined patterns  
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_.]*\) === null || \1 === undefined/!\1/g' "$file"
    
    # Fix: variable ?? [] patterns where variable is never null/undefined
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_.]*\)\.templates ?? \[\]/\1.templates || []/g' "$file"
    
    # Fix: condition ? value : undefined patterns where condition is always true
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_.]*\) !== '\'''\'' ? \1 : undefined/\1 || undefined/g' "$file"
    
    # Fix: value !== 0 && value patterns for numbers
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_.]*\) !== null && \1 !== undefined && \1 !== 0/\1 \&\& \1 !== 0/g' "$file"
    
    # Clean up backup files
    rm -f "$file.bak"
done

echo "Fixed patterns in TypeScript files"