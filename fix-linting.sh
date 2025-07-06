#!/bin/bash

# Script to fix linting errors directory by directory

echo "Starting systematic linting fixes..."

# Create a log file
LOG_FILE="linting-fix-progress.log"
echo "Linting Fix Progress - $(date)" > $LOG_FILE

# Function to fix a directory
fix_directory() {
    local dir=$1
    echo "Fixing $dir..."
    echo "Fixing $dir at $(date)" >> $LOG_FILE
    
    # Run auto-fix with timeout
    timeout 60s pnpm eslint --config .eslintrc.strict.json "$dir" --fix --max-warnings=0 2>&1 | tail -20 >> $LOG_FILE
    
    # Check remaining errors
    local errors=$(pnpm eslint --config .eslintrc.strict.json "$dir" 2>&1 | grep -E "problems" | tail -1)
    echo "  Result: $errors" | tee -a $LOG_FILE
    echo ""
}

# Fix directories one by one
directories=(
    "client/src/api/**/*.{ts,tsx}"
    "client/src/hooks/**/*.{ts,tsx}"
    "client/src/components/ui/**/*.{ts,tsx}"
    "client/src/components/layout/**/*.{ts,tsx}"
    "client/src/components/common/**/*.{ts,tsx}"
    "client/src/components/daybook/**/*.{ts,tsx}"
    "client/src/components/longRangePlans/**/*.{ts,tsx}"
    "client/src/components/settings/**/*.{ts,tsx}"
    "client/src/components/unitPlans/**/*.{ts,tsx}"
    "client/src/routes/**/*.{ts,tsx}"
    "client/src/services/**/*.{ts,tsx}"
    "client/src/utils/**/*.{ts,tsx}"
    "server/src/controllers/**/*.ts"
    "server/src/middleware/**/*.ts"
    "server/src/routes/**/*.ts"
    "server/src/services/**/*.ts"
    "server/src/utils/**/*.ts"
)

for dir in "${directories[@]}"; do
    fix_directory "$dir"
done

echo "Auto-fix complete. Checking overall status..."
pnpm lint:strict 2>&1 | grep -E "problems|errors|warnings" | tail -5

echo "See $LOG_FILE for detailed progress"