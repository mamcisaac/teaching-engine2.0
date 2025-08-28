#!/usr/bin/env python3
"""
Integration Test for Grade 1 French Immersion Curriculum
Tests if curriculum data can be loaded and parsed correctly by applications
"""

import json
import os
from pathlib import Path
import sys

def test_json_validity(file_path):
    """Test if JSON file is valid and parseable"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return True, None
    except json.JSONDecodeError as e:
        return False, f"JSON parsing error: {e}"
    except Exception as e:
        return False, f"File error: {e}"

def test_curriculum_structure(file_path):
    """Test if curriculum has expected structure for application consumption"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        issues = []
        
        # Check required top-level fields
        required_fields = ['unitTitle', 'subject', 'grade', 'lessons']
        for field in required_fields:
            if field not in data:
                issues.append(f"Missing required field: {field}")
        
        # Check lessons structure
        if 'lessons' in data and isinstance(data['lessons'], list):
            for i, lesson in enumerate(data['lessons']):
                # Check lesson structure
                lesson_required = ['lessonNumber', 'title', 'oneGoal', 'duration']
                for field in lesson_required:
                    if field not in lesson:
                        issues.append(f"Lesson {i+1} missing: {field}")
                
                # Check lesson sections
                sections = ['opening', 'main', 'closing']
                for section in sections:
                    if section in lesson:
                        section_data = lesson[section]
                        if not isinstance(section_data, dict):
                            issues.append(f"Lesson {i+1} {section} not an object")
                        else:
                            # Check section structure
                            if 'duration' not in section_data:
                                issues.append(f"Lesson {i+1} {section} missing duration")
                            if 'activity' not in section_data:
                                issues.append(f"Lesson {i+1} {section} missing activity")
                            if 'materials' not in section_data:
                                issues.append(f"Lesson {i+1} {section} missing materials")
        
        return len(issues) == 0, issues
        
    except Exception as e:
        return False, [f"Error testing structure: {e}"]

def test_data_completeness(file_path):
    """Test if curriculum data is complete enough for real teaching use"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        issues = []
        completeness_score = 0
        total_checks = 0
        
        if 'lessons' in data and isinstance(data['lessons'], list):
            for i, lesson in enumerate(data['lessons']):
                total_checks += 6
                
                # Check learning goal
                if lesson.get('oneGoal', '').strip():
                    completeness_score += 1
                else:
                    issues.append(f"Lesson {i+1}: Empty learning goal")
                
                # Check vocabulary
                if lesson.get('keyVocabulary') and len(lesson['keyVocabulary']) >= 3:
                    completeness_score += 1
                else:
                    issues.append(f"Lesson {i+1}: Insufficient vocabulary")
                
                # Check assessment
                assessment = lesson.get('assessmentCriteria', {})
                if assessment.get('observable') and assessment.get('checkpoints'):
                    completeness_score += 1
                else:
                    issues.append(f"Lesson {i+1}: Incomplete assessment criteria")
                
                # Check differentiation
                diff = lesson.get('differentiation', {})
                if all(diff.get(cat) for cat in ['pourDifficultés', 'pourAvancés', 'pourLangue', 'pourPEI']):
                    completeness_score += 1
                else:
                    issues.append(f"Lesson {i+1}: Incomplete differentiation")
                
                # Check materials
                materials_count = 0
                for section in ['opening', 'main', 'closing']:
                    if section in lesson and lesson[section].get('materials'):
                        materials_count += 1
                
                if materials_count >= 2:
                    completeness_score += 1
                else:
                    issues.append(f"Lesson {i+1}: Insufficient materials specified")
                
                # Check movement breaks
                movement_count = 0
                for section in ['opening', 'main', 'closing']:
                    if section in lesson and lesson[section].get('movementBreaks'):
                        movement_count += 1
                
                if movement_count >= 2:
                    completeness_score += 1
                else:
                    issues.append(f"Lesson {i+1}: Insufficient movement breaks")
        
        completeness_percentage = (completeness_score / total_checks * 100) if total_checks > 0 else 0
        
        return completeness_percentage >= 85, {
            'score': round(completeness_percentage, 1),
            'issues': issues[:10]  # Show first 10 issues only
        }
        
    except Exception as e:
        return False, {'score': 0, 'issues': [f"Error testing completeness: {e}"]}

def test_french_content(file_path):
    """Test if French content is appropriate and complete"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        issues = []
        
        # Check unit title is in French
        unit_title = data.get('unitTitle', '')
        if unit_title and any(word in unit_title.lower() for word in ['the', 'and', 'or', 'but', 'this', 'that']):
            issues.append("Unit title may contain English words")
        
        # Sample lesson checks
        if 'lessons' in data and data['lessons']:
            sample_lesson = data['lessons'][0]
            
            # Check decision points are in French
            for section_name in ['opening', 'main', 'closing']:
                if section_name in sample_lesson:
                    section = sample_lesson[section_name]
                    decision_points = section.get('decisionPoints', [])
                    for dp in decision_points[:3]:  # Check first 3
                        if dp and any(phrase in dp for phrase in ['If student', 'When student', 'Can student']):
                            issues.append(f"{section_name} has English decision points")
                            break
        
        return len(issues) == 0, issues
        
    except Exception as e:
        return False, [f"Error testing French content: {e}"]

def run_integration_tests():
    """Run complete integration test suite"""
    lessons_dir = Path("generated-lessons")
    if not lessons_dir.exists():
        print("❌ generated-lessons directory not found")
        return False
    
    print("🧪 CURRICULUM INTEGRATION TEST SUITE")
    print("=" * 60)
    
    total_files = 0
    passed_files = 0
    test_results = []
    
    # Test sample of files from each subject
    sample_files = []
    for subject_dir in lessons_dir.iterdir():
        if subject_dir.is_dir():
            json_files = list(subject_dir.glob("*-full.json"))
            if json_files:
                # Take first 2 files from each subject as samples
                sample_files.extend(json_files[:2])
    
    print(f"Testing {len(sample_files)} representative curriculum files...")
    
    for json_file in sample_files:
        if ".backup" in str(json_file):
            continue
        
        total_files += 1
        print(f"\n🔍 Testing {json_file.name}")
        
        file_result = {
            'filename': json_file.name,
            'subject': json_file.parent.name,
            'tests_passed': 0,
            'total_tests': 4,
            'issues': []
        }
        
        # Test 1: JSON validity
        valid, error = test_json_validity(json_file)
        if valid:
            file_result['tests_passed'] += 1
            print("  ✅ JSON validity: PASS")
        else:
            print(f"  ❌ JSON validity: FAIL - {error}")
            file_result['issues'].append(f"JSON: {error}")
        
        # Test 2: Curriculum structure
        valid, errors = test_curriculum_structure(json_file)
        if valid:
            file_result['tests_passed'] += 1
            print("  ✅ Structure: PASS")
        else:
            print(f"  ❌ Structure: FAIL - {len(errors)} issues")
            file_result['issues'].extend(errors[:3])  # First 3 issues
        
        # Test 3: Data completeness
        valid, result = test_data_completeness(json_file)
        if valid:
            file_result['tests_passed'] += 1
            print(f"  ✅ Completeness: PASS ({result['score']}%)")
        else:
            print(f"  ❌ Completeness: FAIL ({result['score']}%)")
            file_result['issues'].extend(result['issues'][:2])  # First 2 issues
        
        # Test 4: French content
        valid, errors = test_french_content(json_file)
        if valid:
            file_result['tests_passed'] += 1
            print("  ✅ French content: PASS")
        else:
            print(f"  ❌ French content: FAIL - {len(errors)} issues")
            file_result['issues'].extend(errors[:2])  # First 2 issues
        
        # Overall file result
        if file_result['tests_passed'] == file_result['total_tests']:
            passed_files += 1
            print(f"  🎉 Overall: PASS ({file_result['tests_passed']}/{file_result['total_tests']} tests)")
        else:
            print(f"  ⚠️  Overall: FAIL ({file_result['tests_passed']}/{file_result['total_tests']} tests)")
        
        test_results.append(file_result)
    
    # Summary report
    print(f"\n📊 INTEGRATION TEST SUMMARY")
    print("=" * 60)
    print(f"Files tested: {total_files}")
    print(f"Files passed: {passed_files}")
    print(f"Success rate: {(passed_files/total_files*100):.1f}%")
    
    if passed_files < total_files:
        print(f"\n⚠️  Files with issues:")
        failed_files = [r for r in test_results if r['tests_passed'] < r['total_tests']]
        for result in failed_files:
            print(f"  {result['filename']}: {result['tests_passed']}/{result['total_tests']} tests passed")
            if result['issues']:
                print(f"    Issues: {', '.join(result['issues'][:2])}")
    
    overall_success = passed_files == total_files
    
    print(f"\n{'✅ ALL TESTS PASSED' if overall_success else '❌ SOME TESTS FAILED'}")
    print("Curriculum is ready for application integration!" if overall_success else "Issues need to be resolved before deployment.")
    
    return overall_success

if __name__ == "__main__":
    success = run_integration_tests()
    sys.exit(0 if success else 1)