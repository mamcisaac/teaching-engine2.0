#!/bin/bash

echo "🔄 RESTORING PERFECT UNIT PLANS - CHRONOLOGICAL SEQUENCE"
echo "========================================================="
echo ""
echo "This will run all scripts from Aug 19 morning to evening"
echo "STOPPING BEFORE ultimate-perfection.ts at 19:09 that damaged content"
echo ""
echo "Scripts to run in order:"
echo "1. 08:23 - create-truly-perfect-flexible-math-units.ts"
echo "2. 09:01 - manually-perfect-units.ts"
echo "3. 10:08 - perfect-french-units-manually.ts"
echo "4. 10:10 - perfect-science-units-manually.ts"
echo "5. 10:12 - perfect-arts-units-manually.ts"
echo "6. 10:20 - perfect-health-fps-units-manually.ts"
echo "7. 10:41 - perfect-social-studies-units-manually.ts"
echo "8. 14:09 - create-perfect-units-manually.ts"
echo "9. 19:02 - final-qa-verification.ts"
echo "10. 19:04 - corrected-qa-verification.ts"
echo ""
echo "⛔ WILL NOT RUN: 19:09 - ultimate-perfection.ts (overwrote content)"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

cd archives/development-history-complete-20250819-222927/scripts

echo ""
echo "📚 Running Script 1/10: create-truly-perfect-flexible-math-units.ts (08:23)"
echo "---------------------------------------------------------"
tsx create-truly-perfect-flexible-math-units.ts

echo ""
echo "📚 Running Script 2/10: manually-perfect-units.ts (09:01)"
echo "---------------------------------------------------------"
tsx manually-perfect-units.ts

echo ""
echo "📚 Running Script 3/10: perfect-french-units-manually.ts (10:08)"
echo "---------------------------------------------------------"
tsx perfect-french-units-manually.ts

echo ""
echo "📚 Running Script 4/10: perfect-science-units-manually.ts (10:10)"
echo "---------------------------------------------------------"
tsx perfect-science-units-manually.ts

echo ""
echo "📚 Running Script 5/10: perfect-arts-units-manually.ts (10:12)"
echo "---------------------------------------------------------"
tsx perfect-arts-units-manually.ts

echo ""
echo "📚 Running Script 6/10: perfect-health-fps-units-manually.ts (10:20)"
echo "---------------------------------------------------------"
tsx perfect-health-fps-units-manually.ts

echo ""
echo "📚 Running Script 7/10: perfect-social-studies-units-manually.ts (10:41)"
echo "---------------------------------------------------------"
tsx perfect-social-studies-units-manually.ts

echo ""
echo "📚 Running Script 8/10: create-perfect-units-manually.ts (14:09)"
echo "---------------------------------------------------------"
tsx create-perfect-units-manually.ts

echo ""
echo "📚 Running Script 9/10: final-qa-verification.ts (19:02)"
echo "---------------------------------------------------------"
tsx final-qa-verification.ts

echo ""
echo "📚 Running Script 10/10: corrected-qa-verification.ts (19:04)"
echo "---------------------------------------------------------"
tsx corrected-qa-verification.ts

echo ""
echo "✅ RESTORATION COMPLETE!"
echo "========================"
echo ""
echo "Your unit plans should now have:"
echo "- Rich pedagogical content from morning scripts"
echo "- All timing fixes applied up to 19:04"
echo "- NO generic CORE+EXTENSION overwrite from ultimate-perfection.ts"
echo ""
echo "Next steps:"
echo "1. Verify the units have rich content"
echo "2. Re-lock the units if desired"
echo "3. Back up this perfect state immediately!"