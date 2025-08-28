#!/usr/bin/env python3
"""
ETFO Compliance Verification for Grade 1 French Immersion Curriculum
Systematically checks all lessons against ETFO standards
"""

import json
import os
from pathlib import Path

# ETFO Compliance Checklist for Grade 1
ETFO_REQUIREMENTS = {
    'lesson_structure': {
        'name': 'Three-part lesson structure (Opening/Main/Closing)',
        'required_fields': ['opening', 'main', 'closing'],
        'weight': 20
    },
    'time_allocation': {
        'name': 'Appropriate time allocation for each section',
        'check': 'duration_balance',
        'weight': 10
    },
    'learning_goal': {
        'name': 'Clear, measurable learning goal',
        'required_fields': ['oneGoal'],
        'weight': 15
    },
    'assessment': {
        'name': 'Balanced assessment (FOR/AS/OF learning)',
        'required_fields': ['assessmentCriteria'],
        'weight': 20
    },
    'differentiation': {
        'name': 'Differentiated instruction for all learners',
        'required_fields': ['differentiation'],
        'weight': 15
    },
    'vocabulary': {
        'name': 'Grade-appropriate vocabulary (3-5 words)',
        'required_fields': ['keyVocabulary'],
        'weight': 10
    },
    'materials': {
        'name': 'Realistic, obtainable materials listed',
        'required_fields': ['materials'],
        'weight': 10
    }
}

def check_lesson_structure(lesson):
    """Check if lesson has proper three-part structure"""
    required_sections = ['opening', 'main', 'closing']
    score = 0
    issues = []
    
    for section in required_sections:
        if section in lesson:
            # Check if section has required subsections
            section_data = lesson[section]
            if isinstance(section_data, dict):
                if 'duration' in section_data and 'activity' in section_data:
                    score += 1
                else:
                    issues.append(f"{section} missing duration or activity")
            else:
                issues.append(f"{section} is not properly structured")
        else:
            issues.append(f"Missing {section} section")
    
    return (score / len(required_sections)) * 100, issues

def check_time_allocation(lesson):
    """Check if time allocation is balanced and appropriate"""
    score = 100
    issues = []
    
    if 'duration' in lesson:
        total_duration = lesson['duration']
        
        # Check individual section durations
        opening_duration = lesson.get('opening', {}).get('duration', 0)
        main_duration = lesson.get('main', {}).get('duration', 0)
        closing_duration = lesson.get('closing', {}).get('duration', 0)
        
        section_total = opening_duration + main_duration + closing_duration
        
        # Should match total duration (within 2 minutes tolerance)
        if abs(section_total - total_duration) > 2:
            score -= 30
            issues.append(f"Section durations ({section_total}min) don't match total ({total_duration}min)")
        
        # Main section should be longest
        if main_duration <= opening_duration or main_duration <= closing_duration:
            score -= 20
            issues.append("Main section should be the longest part of the lesson")
        
        # Opening and closing should be reasonable lengths
        if opening_duration < 5 or opening_duration > 15:
            score -= 15
            issues.append(f"Opening duration ({opening_duration}min) outside recommended range (5-15min)")
        
        if closing_duration < 5 or closing_duration > 15:
            score -= 15
            issues.append(f"Closing duration ({closing_duration}min) outside recommended range (5-15min)")
    else:
        score = 0
        issues.append("No total duration specified")
    
    return max(0, score), issues

def check_learning_goal(lesson):
    """Check if lesson has clear, measurable learning goal"""
    score = 0
    issues = []
    
    if 'oneGoal' in lesson:
        goal = lesson['oneGoal'].strip()
        if goal:
            score = 100
            # Additional quality checks
            if len(goal) < 20:
                score -= 20
                issues.append("Learning goal is quite brief")
            if not any(verb in goal.lower() for verb in ['explorer', 'créer', 'comprendre', 'développer', 'identifier', 'utiliser', 'démontrer']):
                score -= 15
                issues.append("Goal could use more specific action verbs")
        else:
            issues.append("Learning goal is empty")
    else:
        issues.append("No learning goal specified")
    
    return score, issues

def check_assessment(lesson):
    """Check if lesson has balanced assessment approaches"""
    score = 0
    issues = []
    
    if 'assessmentCriteria' in lesson:
        assessment = lesson['assessmentCriteria']
        
        # Check for observable behaviors
        if 'observable' in assessment and assessment['observable']:
            score += 50
            # Check quality of observable criteria
            observables = assessment['observable']
            if all(obs.strip() for obs in observables):
                score += 20
            else:
                issues.append("Some observable criteria are empty")
        else:
            issues.append("Missing observable assessment criteria")
        
        # Check for checkpoints
        if 'checkpoints' in assessment and assessment['checkpoints']:
            score += 30
            checkpoints = assessment['checkpoints']
            if all(cp.strip() for cp in checkpoints):
                # Already good
                pass
            else:
                issues.append("Some checkpoints are empty")
        else:
            issues.append("Missing assessment checkpoints")
            
    else:
        issues.append("No assessment criteria specified")
    
    return min(100, score), issues

def check_differentiation(lesson):
    """Check if lesson provides differentiated instruction"""
    score = 0
    issues = []
    
    if 'differentiation' in lesson:
        diff = lesson['differentiation']
        categories = ['pourDifficultés', 'pourAvancés', 'pourLangue', 'pourPEI']
        
        for category in categories:
            if category in diff and diff[category]:
                if all(strategy.strip() for strategy in diff[category]):
                    score += 25
                else:
                    score += 10  # Partial credit for having the category
                    issues.append(f"{category} has empty strategies")
            else:
                issues.append(f"Missing {category} strategies")
    else:
        issues.append("No differentiation strategies provided")
    
    return min(100, score), issues

def check_vocabulary(lesson):
    """Check if vocabulary is appropriate for Grade 1"""
    score = 100
    issues = []
    
    if 'keyVocabulary' in lesson:
        vocab = lesson['keyVocabulary']
        if isinstance(vocab, list):
            if len(vocab) == 0:
                score = 0
                issues.append("No vocabulary specified")
            elif len(vocab) < 3:
                score = 70
                issues.append(f"Only {len(vocab)} vocabulary words (recommend 3-5)")
            elif len(vocab) > 8:
                score = 60
                issues.append(f"{len(vocab)} vocabulary words might be too many for Grade 1")
            else:
                # Check for appropriate length words
                long_words = [word for word in vocab if len(word) > 12]
                if long_words:
                    score -= 10
                    issues.append(f"Some vocabulary words may be too long for Grade 1: {long_words}")
        else:
            score = 0
            issues.append("Vocabulary is not properly formatted as a list")
    else:
        score = 0
        issues.append("No vocabulary field found")
    
    return score, issues

def check_materials(lesson):
    """Check if materials are realistic and obtainable"""
    score = 100
    issues = []
    sections_with_materials = 0
    sections_checked = 0
    
    for section_name in ['opening', 'main', 'closing']:
        if section_name in lesson:
            sections_checked += 1
            section = lesson[section_name]
            if 'materials' in section:
                materials = section['materials']
                if isinstance(materials, list) and materials:
                    sections_with_materials += 1
                    # Check for empty materials
                    empty_materials = [m for m in materials if not m.strip()]
                    if empty_materials:
                        score -= 15
                        issues.append(f"{section_name} has empty material entries")
                else:
                    issues.append(f"{section_name} has no materials specified")
    
    if sections_with_materials == 0:
        score = 0
        issues.append("No materials specified in any section")
    elif sections_with_materials < sections_checked:
        score -= 20
        issues.append("Some sections missing materials")
    
    return score, issues

def verify_etfo_compliance_file(file_path):
    """Verify ETFO compliance for a single curriculum file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'lessons' not in data:
            return None, ["No lessons found in file"]
        
        filename = file_path.name
        subject = data.get('subject', 'Unknown')
        total_lessons = len(data['lessons'])
        
        file_results = {
            'filename': filename,
            'subject': subject,
            'total_lessons': total_lessons,
            'lesson_scores': [],
            'overall_score': 0,
            'compliance_level': 'Not Compliant',
            'major_issues': [],
            'recommendations': []
        }
        
        lesson_scores = []
        
        for i, lesson in enumerate(data['lessons']):
            lesson_result = {
                'lesson_number': i + 1,
                'scores': {},
                'issues': {},
                'total_score': 0
            }
            
            # Check each ETFO requirement
            structure_score, structure_issues = check_lesson_structure(lesson)
            lesson_result['scores']['structure'] = structure_score
            lesson_result['issues']['structure'] = structure_issues
            
            time_score, time_issues = check_time_allocation(lesson)
            lesson_result['scores']['time'] = time_score
            lesson_result['issues']['time'] = time_issues
            
            goal_score, goal_issues = check_learning_goal(lesson)
            lesson_result['scores']['goal'] = goal_score
            lesson_result['issues']['goal'] = goal_issues
            
            assessment_score, assessment_issues = check_assessment(lesson)
            lesson_result['scores']['assessment'] = assessment_score
            lesson_result['issues']['assessment'] = assessment_issues
            
            diff_score, diff_issues = check_differentiation(lesson)
            lesson_result['scores']['differentiation'] = diff_score
            lesson_result['issues']['differentiation'] = diff_issues
            
            vocab_score, vocab_issues = check_vocabulary(lesson)
            lesson_result['scores']['vocabulary'] = vocab_score
            lesson_result['issues']['vocabulary'] = vocab_issues
            
            materials_score, materials_issues = check_materials(lesson)
            lesson_result['scores']['materials'] = materials_score
            lesson_result['issues']['materials'] = materials_issues
            
            # Calculate weighted total score
            weighted_score = (
                structure_score * 0.20 +
                time_score * 0.10 +
                goal_score * 0.15 +
                assessment_score * 0.20 +
                diff_score * 0.15 +
                vocab_score * 0.10 +
                materials_score * 0.10
            )
            
            lesson_result['total_score'] = round(weighted_score, 1)
            lesson_scores.append(lesson_result)
        
        # Calculate overall file score
        if lesson_scores:
            file_results['overall_score'] = round(
                sum(lesson['total_score'] for lesson in lesson_scores) / len(lesson_scores), 1
            )
        
        # Determine compliance level
        if file_results['overall_score'] >= 95:
            file_results['compliance_level'] = 'Fully Compliant'
        elif file_results['overall_score'] >= 85:
            file_results['compliance_level'] = 'Mostly Compliant'
        elif file_results['overall_score'] >= 70:
            file_results['compliance_level'] = 'Partially Compliant'
        else:
            file_results['compliance_level'] = 'Not Compliant'
        
        file_results['lesson_scores'] = lesson_scores
        return file_results, None
        
    except Exception as e:
        return None, [f"Error processing file: {e}"]

def main():
    """Verify ETFO compliance across all curriculum files"""
    lessons_dir = Path("generated-lessons")
    if not lessons_dir.exists():
        print("❌ generated-lessons directory not found")
        return
    
    print("🔍 ETFO COMPLIANCE VERIFICATION STARTED")
    print("=" * 60)
    
    all_results = []
    total_files = 0
    
    # Process all JSON files in all subdirectories
    for json_file in lessons_dir.rglob("*-full.json"):
        if ".backup" in str(json_file):
            continue  # Skip backup files
        
        total_files += 1
        results, errors = verify_etfo_compliance_file(json_file)
        
        if results:
            all_results.append(results)
            print(f"✅ {results['filename']}: {results['compliance_level']} ({results['overall_score']}%)")
        else:
            print(f"❌ {json_file.name}: {errors}")
    
    # Generate summary report
    print("\n📊 ETFO COMPLIANCE SUMMARY REPORT")
    print("=" * 60)
    
    if all_results:
        # Overall statistics
        overall_avg = sum(r['overall_score'] for r in all_results) / len(all_results)
        print(f"Files processed: {len(all_results)}")
        print(f"Overall average compliance: {overall_avg:.1f}%")
        
        # Compliance level distribution
        compliance_counts = {}
        for result in all_results:
            level = result['compliance_level']
            compliance_counts[level] = compliance_counts.get(level, 0) + 1
        
        print(f"\nCompliance Distribution:")
        for level, count in sorted(compliance_counts.items(), 
                                 key=lambda x: ['Not Compliant', 'Partially Compliant', 'Mostly Compliant', 'Fully Compliant'].index(x[0])):
            percentage = (count / len(all_results)) * 100
            print(f"  {level}: {count} files ({percentage:.1f}%)")
        
        # Subject breakdown
        subject_scores = {}
        for result in all_results:
            subject = result['subject']
            if subject not in subject_scores:
                subject_scores[subject] = []
            subject_scores[subject].append(result['overall_score'])
        
        print(f"\nSubject Compliance Averages:")
        for subject, scores in subject_scores.items():
            avg_score = sum(scores) / len(scores)
            print(f"  {subject}: {avg_score:.1f}% ({len(scores)} files)")
        
        # Files needing attention
        low_compliance = [r for r in all_results if r['overall_score'] < 85]
        if low_compliance:
            print(f"\n⚠️  FILES NEEDING ATTENTION ({len(low_compliance)} files):")
            for result in sorted(low_compliance, key=lambda x: x['overall_score']):
                print(f"  {result['filename']}: {result['overall_score']}% ({result['compliance_level']})")
    
    print(f"\n✅ ETFO compliance verification complete!")
    return all_results

if __name__ == "__main__":
    main()