#\!/bin/bash

echo "🚨 EMERGENCY RESTORATION: Restoring all backup files..."

# Counter for tracking progress
count=0
total=0

# First, count total files
echo "📊 Counting backup files..."
total=$(find . -name "*.bak" -not -path "./node_modules/*" | wc -l)
echo "Found $total backup files to restore"

# Create log file
log_file="restoration_log_$(date +%Y%m%d_%H%M%S).txt"
echo "📝 Logging to: $log_file"

echo "🔄 Starting restoration process..."

# Restore each backup file
while IFS= read -r -d '' backup_file; do
    # Get the original file path by removing .bak extension
    original_file="${backup_file%.bak}"
    
    # Skip if original file doesn't exist (means it's a new backup)
    if [[ -f "$original_file" ]]; then
        # Restore the file
        cp "$backup_file" "$original_file"
        count=$((count + 1))
        
        # Log the restoration
        echo "✅ Restored: $original_file" >> "$log_file"
        
        # Progress indicator every 50 files
        if (( count % 50 == 0 )); then
            echo "📈 Progress: $count/$total files restored"
        fi
    else
        echo "⚠️  Original not found: $original_file" >> "$log_file"
    fi
    
done < <(find . -name "*.bak" -not -path "./node_modules/*" -print0)

echo ""
echo "🎉 RESTORATION COMPLETE\!"
echo "📊 Total files restored: $count"
echo "📝 See details in: $log_file"
echo ""
echo "🔍 Next steps:"
echo "  1. Verify build: npm run build"
echo "  2. Verify TypeScript: npm run typecheck"  
echo "  3. Run tests: npm run test"

