#!/bin/bash

echo "🎯 APPLYING STRATEGIC REFINEMENTS - PHASE 2"
echo "==========================================="
echo ""
echo "This applies valuable timing/precision fixes from later scripts"
echo "WITHOUT touching the rich pedagogical content restored in Phase 1"
echo ""
echo "Strategic fixes to apply:"
echo "1. Strategic FPS hour redistribution (16+15+15+14+13)"
echo "2. Perfect alternating schedule with PEI holidays"
echo "3. Hour precision adjustments"
echo "4. Date range corrections"
echo ""
echo "⚠️  IMPORTANT: Run this AFTER restore-perfect-sequence.sh"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

cd archives/development-history-complete-20250819-222927/scripts

echo ""
echo "🔧 Phase 2-1: Strategic FPS Hour Redistribution"
echo "-----------------------------------------------"
tsx implement-fps-strategic-redistribution.ts

echo ""
echo "📅 Phase 2-2: Perfect Alternating Schedule Calculation"
echo "------------------------------------------------------"
tsx achieve-true-unit-perfection.ts

echo ""
echo "⚖️ Phase 2-3: Hour Precision Adjustments"
echo "----------------------------------------"
tsx fix-hour-precision.ts

echo ""
echo "📍 Phase 2-4: Date Range Corrections"
echo "------------------------------------"
tsx fix-all-date-ranges.ts

echo ""
echo "✨ Phase 2-5: Ultimate Timing Perfection (FIXED VERSION)"
echo "--------------------------------------------------------"
echo "This runs the FIXED version of ultimate-perfection.ts that"
echo "applies perfect timing WITHOUT destroying pedagogical content"
tsx ultimate-perfection-FIXED.ts

echo ""
echo "✅ STRATEGIC REFINEMENTS COMPLETE!"
echo "================================="
echo ""
echo "Your units now have:"
echo "- Rich pedagogical content (from Phase 1)"
echo "- Strategic FPS redistribution (16+15+15+14+13)"
echo "- Perfect alternating schedule calculation"
echo "- Precise hour targets and date ranges"
echo ""
echo "Final step: Re-lock units to protect this perfect state"