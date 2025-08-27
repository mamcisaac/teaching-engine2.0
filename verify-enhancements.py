#!/usr/bin/env python3
"""
Verify enhancements by comparing original vs enhanced lessons
"""

import json
from pathlib import Path

def compare_lesson(original_file, enhanced_file):
    """Compare original and enhanced versions"""
    
    # Load files
    with open(original_file, 'r', encoding='utf-8') as f:
        original = json.load(f)
    
    with open(enhanced_file, 'r', encoding='utf-8') as f:
        enhanced = json.load(f)
    
    # Get first lesson for comparison
    orig_lesson = original['lessons'][0]
    enh_lesson = enhanced['lessons'][0]
    
    print(f"\n{'='*60}")
    print(f"ENHANCEMENT VERIFICATION")
    print(f"{'='*60}")
    print(f"Unit: {original['unitTitle']}")
    print(f"Subject: {original['subject']}")
    print(f"Lesson 1: {orig_lesson['title']}")
    
    # Check decision points
    print(f"\n📍 DECISION POINTS:")
    print(f"Original:")
    orig_dp = orig_lesson.get('opening', {}).get('decisionPoints', [])
    print(f"  Opening: {len(orig_dp)} points")
    if orig_dp:
        for dp in orig_dp[:2]:
            print(f"    - {str(dp)[:60]}...")
    
    enh_dp = enh_lesson.get('opening', {}).get('decisionPoints', [])
    print(f"\nEnhanced:")
    print(f"  Opening: {len(enh_dp)} points")
    for dp in enh_dp:
        if isinstance(dp, str):
            print(f"    - {dp[:60]}...")
    
    # Check learning goal
    print(f"\n🎯 LEARNING GOAL:")
    print(f"Original: {orig_lesson['oneGoal'][:80]}...")
    print(f"Enhanced: {enh_lesson['oneGoal'][:80]}...")
    
    # Check materials
    print(f"\n📦 MATERIALS:")
    orig_mat = orig_lesson.get('opening', {}).get('materials', {}).get('required', [])
    enh_mat = enh_lesson.get('opening', {}).get('materials', {}).get('required', [])
    
    if orig_mat:
        print(f"Original first material:")
        if isinstance(orig_mat[0], dict):
            print(f"  Item: {orig_mat[0].get('item', 'N/A')}")
        else:
            print(f"  Item: {orig_mat[0]}")
    
    if enh_mat:
        print(f"\nEnhanced first material:")
        if isinstance(enh_mat[0], dict):
            print(f"  Item: {enh_mat[0].get('item', 'N/A')}")
            print(f"  Quantity: {enh_mat[0].get('quantity', 'N/A')}")
            print(f"  Source: {enh_mat[0].get('source', 'N/A')}")

# Find sample files to compare
math_orig = Path('generated-lessons/mathematiques/nombres-0-10-full.json')
math_enh = Path('generated-lessons/mathematiques/nombres-0-10-full-enhanced.json')

if math_orig.exists() and math_enh.exists():
    compare_lesson(math_orig, math_enh)

# Try French example
french_orig = Path('generated-lessons/francais/explorateurs-de-mots-full.json')
french_enh = Path('generated-lessons/francais/explorateurs-de-mots-full-enhanced.json')

if french_orig.exists() and french_enh.exists():
    compare_lesson(french_orig, french_enh)

# Count total enhancements
enhanced_files = list(Path('generated-lessons').glob('**/*-enhanced.json'))
print(f"\n{'='*60}")
print(f"SUMMARY")
print(f"{'='*60}")
print(f"Total enhanced unit files created: {len(enhanced_files)}")

# Sample check for decision points
sample = enhanced_files[0]
with open(sample, 'r') as f:
    data = json.load(f)
    
lessons_with_dp = 0
total_dps = 0

for lesson in data.get('lessons', []):
    for phase in ['opening', 'main', 'closing']:
        if phase in lesson:
            dps = lesson[phase].get('decisionPoints', [])
            if dps:
                lessons_with_dp += 1
                total_dps += len(dps)
                break  # Count lesson only once

print(f"\nSample unit: {sample.name}")
print(f"  Lessons with decision points: {lessons_with_dp}/{len(data.get('lessons', []))}")
print(f"  Average decision points per lesson: {total_dps/len(data.get('lessons', [])) if data.get('lessons') else 0:.1f}")