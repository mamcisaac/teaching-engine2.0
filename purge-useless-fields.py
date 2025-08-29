#!/usr/bin/env python3
"""
Purge useless fields from curriculum JSON files
Removes: troubleshooting, realWorldConnection
Keeps: visualSupports (has valuable content in many files)
"""

import json
import os
from pathlib import Path

def purge_useless_fields(file_path):
    """Remove troubleshooting and realWorldConnection from a JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        original_size = os.path.getsize(file_path)
        changes_made = False
        fields_removed = {'troubleshooting': 0, 'realWorldConnection': 0}
        
        # Process each lesson
        if 'lessons' in data and isinstance(data['lessons'], list):
            for lesson in data['lessons']:
                # Remove troubleshooting
                if 'troubleshooting' in lesson:
                    del lesson['troubleshooting']
                    fields_removed['troubleshooting'] += 1
                    changes_made = True
                
                # Remove realWorldConnection
                if 'realWorldConnection' in lesson:
                    del lesson['realWorldConnection']
                    fields_removed['realWorldConnection'] += 1
                    changes_made = True
        
        if changes_made:
            # Write back to file with proper formatting
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            new_size = os.path.getsize(file_path)
            size_reduction = original_size - new_size
            reduction_percent = (size_reduction / original_size) * 100
            
            print(f"✅ {file_path.name}")
            if fields_removed['troubleshooting'] > 0:
                print(f"   Removed {fields_removed['troubleshooting']} troubleshooting fields")
            if fields_removed['realWorldConnection'] > 0:
                print(f"   Removed {fields_removed['realWorldConnection']} realWorldConnection fields")
            print(f"   Size reduced by {size_reduction:,} bytes ({reduction_percent:.1f}%)")
            
            return True, size_reduction, fields_removed
        else:
            print(f"⚪ {file_path.name} - no changes needed")
            return False, 0, fields_removed
    
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False, 0, {'troubleshooting': 0, 'realWorldConnection': 0}

def main():
    """Purge useless fields from all curriculum files"""
    lessons_dir = Path("generated-lessons")
    if not lessons_dir.exists():
        print("❌ generated-lessons directory not found")
        return
    
    print("🧹 PURGING USELESS FIELDS FROM CURRICULUM")
    print("=" * 60)
    print("Removing: troubleshooting, realWorldConnection")
    print("Keeping: visualSupports (has valuable content)")
    print("=" * 60)
    
    total_files = 0
    modified_files = 0
    total_size_reduction = 0
    total_fields_removed = {'troubleshooting': 0, 'realWorldConnection': 0}
    
    # Process all JSON files
    for json_file in lessons_dir.rglob("*-full.json"):
        total_files += 1
        modified, size_reduction, fields_removed = purge_useless_fields(json_file)
        
        if modified:
            modified_files += 1
            total_size_reduction += size_reduction
            total_fields_removed['troubleshooting'] += fields_removed['troubleshooting']
            total_fields_removed['realWorldConnection'] += fields_removed['realWorldConnection']
    
    # Summary report
    print("\n" + "=" * 60)
    print("📊 PURGE SUMMARY")
    print("=" * 60)
    print(f"Files processed: {total_files}")
    print(f"Files modified: {modified_files}")
    print(f"Fields removed:")
    print(f"  - troubleshooting: {total_fields_removed['troubleshooting']}")
    print(f"  - realWorldConnection: {total_fields_removed['realWorldConnection']}")
    print(f"Total size reduction: {total_size_reduction:,} bytes ({total_size_reduction/1024:.1f} KB)")
    
    if total_size_reduction > 0:
        print(f"\n✅ Successfully purged useless fields!")
        print(f"Curriculum is now cleaner and more efficient.")
    else:
        print(f"\n⚪ No fields needed to be removed.")

if __name__ == "__main__":
    main()