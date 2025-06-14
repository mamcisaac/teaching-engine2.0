#!/bin/bash

# This script tests the curriculum import without modifying the database
# It validates that the PDF parsing works and counts the outcomes found

echo "Testing PEI French Immersion Grade 1 curriculum import..."
echo "====================================================================================="

# Run the import script with the --dry-run flag (this will be added in the import script)
# We're using NODE_OPTIONS='--no-warnings' to suppress ESM warnings
cd $(dirname $0) && NODE_OPTIONS='--no-warnings' pnpm tsx importPeiFrenchOutcomes.ts --dry-run

echo "====================================================================================="
echo "If you see a significant number of outcomes above, the parser is working correctly."
echo "To perform the actual import, run: pnpm curriculum:import pei-fi-1"
echo "To reset existing outcomes first, add --overwrite flag."