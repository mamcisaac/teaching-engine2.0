#!/usr/bin/env python3

import os

# Files needing prisma import (paths relative to the teaching-engine2.0 directory)
files_to_fix = [
    "server/src/middleware/studentArtifactUpload.ts",
    "server/src/routes/analytics.ts",
    "server/src/routes/artifacts.ts",
    "server/src/routes/assessments.ts",
    "server/src/routes/evidenceExport.ts",
    "server/src/routes/lesson-completions.ts",
    "server/src/routes/lesson-reflections.ts",
    "server/src/routes/masteryTracking.ts",
    "server/src/routes/reports.ts",
    "server/src/routes/student-progress.ts",
    "server/src/routes/students.ts",
    "server/src/services/fileProcessingService.ts",
    "server/src/services/queues/processors/audioProcessor.ts",
    "server/src/services/queues/processors/bulkProcessor.ts",
    "server/src/services/queues/processors/documentProcessor.ts",
    "server/src/services/queues/processors/imageProcessor.ts",
    "server/src/services/queues/processors/reportProcessor.ts",
    "server/src/services/queues/processors/videoProcessor.ts",
]

base_dir = "/Users/michaelmcisaac/Github/teaching-engine2.0"

for file_path in files_to_fix:
    full_path = os.path.join(base_dir, file_path)
    
    # Determine the import path based on file location
    if "middleware/" in file_path:
        import_line = "import { prisma } from '../prisma';\n"
    elif "routes/" in file_path:
        import_line = "import { prisma } from '../prisma';\n"
    elif "services/queues/processors/" in file_path:
        import_line = "import { prisma } from '../../../prisma';\n"
    elif "services/" in file_path:
        import_line = "import { prisma } from '../prisma';\n"
    
    # Read the file
    with open(full_path, 'r') as f:
        content = f.read()
    
    # Check if prisma is already imported
    if "import { prisma }" in content or "import {prisma}" in content:
        print(f"✓ {file_path} - Already has prisma import")
        continue
    
    # Find the first import line and add prisma import after it
    lines = content.split('\n')
    import_added = False
    
    for i, line in enumerate(lines):
        if line.strip().startswith('import '):
            # Insert the prisma import after the first import
            lines.insert(i + 1, import_line.rstrip())
            import_added = True
            break
    
    if not import_added:
        # If no imports found, add at the beginning after any comments
        for i, line in enumerate(lines):
            if not line.strip().startswith('//') and not line.strip().startswith('/*') and not line.strip().startswith('*') and line.strip():
                lines.insert(i, import_line.rstrip())
                break
    
    # Write the updated content back
    with open(full_path, 'w') as f:
        f.write('\n'.join(lines))
    
    print(f"✓ {file_path} - Added prisma import")

print("\nAll prisma imports have been added!")