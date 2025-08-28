#!/usr/bin/env python3
"""
Quick ETFO Compliance Check for Grade 1 French Immersion Curriculum
Focuses on key compliance indicators
"""

import json
from pathlib import Path

def quick_etfo_check(file_path):
    """Quick ETFO compliance check for a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'lessons' not in data:
            return None, "No lessons found"
        
        filename = file_path.name
        total_lessons = len(data['lessons'])
        compliant_lessons = 0
        issues = []
        
        for i, lesson in enumerate(data['lessons']):
            lesson_issues = []
            
            # Check 1: Three-part structure
            if not all(section in lesson for section in ['opening', 'main', 'closing']):
                lesson_issues.append("Missing lesson sections")
            
            # Check 2: Learning goal
            if 'oneGoal' not in lesson or not lesson['oneGoal'].strip():
                lesson_issues.append("Missing learning goal")
            
            # Check 3: Assessment criteria
            if 'assessmentCriteria' not in lesson:
                lesson_issues.append("Missing assessment criteria")
            else:
                assessment = lesson['assessmentCriteria']
                if not assessment.get('observable') or not assessment.get('checkpoints'):
                    lesson_issues.append("Incomplete assessment criteria")
            
            # Check 4: Differentiation
            if 'differentiation' not in lesson:
                lesson_issues.append("Missing differentiation")
            else:
                diff = lesson['differentiation']
                required_diff = ['pourDifficultés', 'pourAvancés', 'pourLangue', 'pourPEI']
                empty_diff = [cat for cat in required_diff if not diff.get(cat)]
                if empty_diff:
                    lesson_issues.append(f"Empty differentiation: {empty_diff}")
            
            # Check 5: Materials in sections
            sections_with_materials = 0
            for section_name in ['opening', 'main', 'closing']:
                if section_name in lesson:
                    section = lesson[section_name]
                    if section.get('materials'):
                        sections_with_materials += 1
            
            if sections_with_materials == 0:
                lesson_issues.append("No materials specified")
            
            if not lesson_issues:
                compliant_lessons += 1
            else:
                issues.append(f"Lesson {i+1}: {', '.join(lesson_issues)}")
        
        compliance_rate = (compliant_lessons / total_lessons) * 100 if total_lessons > 0 else 0
        
        return {
            'filename': filename,
            'subject': data.get('subject', 'Unknown'),
            'total_lessons': total_lessons,
            'compliant_lessons': compliant_lessons,
            'compliance_rate': round(compliance_rate, 1),
            'issues': issues[:5]  # Show only first 5 issues
        }, None
        
    except Exception as e:
        return None, str(e)

def main():
    """Quick ETFO compliance check for all files"""
    lessons_dir = Path("generated-lessons")
    if not lessons_dir.exists():
        print("❌ generated-lessons directory not found")
        return
    
    print("🔍 QUICK ETFO COMPLIANCE CHECK")
    print("=" * 50)
    
    all_results = []
    
    for json_file in lessons_dir.rglob("*-full.json"):
        if ".backup" in str(json_file):
            continue
        
        result, error = quick_etfo_check(json_file)
        if result:
            all_results.append(result)
            status = "✅" if result['compliance_rate'] >= 90 else "⚠️" if result['compliance_rate'] >= 70 else "❌"
            print(f"{status} {result['filename']}: {result['compliance_rate']}% ({result['compliant_lessons']}/{result['total_lessons']} lessons)")
            
            if result['issues']:
                print(f"   Issues: {len(result['issues'])} found")
        else:
            print(f"❌ {json_file.name}: Error - {error}")
    
    # Summary
    if all_results:
        print(f"\n📊 SUMMARY:")
        total_files = len(all_results)
        avg_compliance = sum(r['compliance_rate'] for r in all_results) / total_files
        high_compliance = len([r for r in all_results if r['compliance_rate'] >= 90])
        med_compliance = len([r for r in all_results if 70 <= r['compliance_rate'] < 90])
        low_compliance = len([r for r in all_results if r['compliance_rate'] < 70])
        
        print(f"Files checked: {total_files}")
        print(f"Average compliance: {avg_compliance:.1f}%")
        print(f"High compliance (≥90%): {high_compliance} files")
        print(f"Medium compliance (70-89%): {med_compliance} files") 
        print(f"Low compliance (<70%): {low_compliance} files")
        
        if low_compliance > 0:
            print(f"\n⚠️  Files needing attention:")
            low_files = sorted([r for r in all_results if r['compliance_rate'] < 70], 
                             key=lambda x: x['compliance_rate'])
            for result in low_files[:10]:  # Show top 10 needing attention
                print(f"   {result['filename']}: {result['compliance_rate']}%")

if __name__ == "__main__":
    main()