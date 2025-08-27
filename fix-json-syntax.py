#!/usr/bin/env python3
"""
Fix JSON syntax issues in sciences-humaines files
"""
import re

def fix_json_syntax(filename):
    """Fix common JSON syntax issues"""
    print(f"Fixing JSON syntax in {filename}...")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix trailing commas in arrays
    content = re.sub(r',(\s*])', r'\1', content)
    
    # Fix trailing commas in objects  
    content = re.sub(r',(\s*})', r'\1', content)
    
    # Write the fixed content back
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Fixed JSON syntax in {filename}")

# Fix the two files with JSON issues
files_to_fix = [
    'generated-lessons/sciences-humaines/ma-famille-et-mon-foyer-full.json',
    'generated-lessons/sciences-humaines/notre-quartier-et-voisinage-full.json'
]

for filename in files_to_fix:
    fix_json_syntax(filename)

print("JSON syntax fixed - ready for template replacement!")