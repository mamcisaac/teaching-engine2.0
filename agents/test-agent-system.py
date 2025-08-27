#!/usr/bin/env python3
"""
Test script for the multi-agent material improvement system
Tests the agent pipeline on sample lessons
"""

import json
import sys
import os
from pathlib import Path
import subprocess

def create_sample_lesson():
    """Create a sample lesson for testing"""
    
    sample_lesson = {
        "lessonNumber": 4,
        "title": "Explorer les nombres 4 et 5",
        "oneGoal": "Les élèves découvrent et comptent les nombres 4 et 5 avec des manipulatives",
        "keyVocabulary": ["quatre", "cinq", "collection"],
        "decisionPoints": [
            "Les élèves maîtrisent-ils les nombres 0-3?",
            "Ont-ils besoin de réviser avant d'avancer?",
            "Le matériel manipulable est-il approprié?"
        ],
        "progression": "Applies Lesson 3's visual representation skills to larger numbers (4-5), using the same drawing and concrete manipulation techniques but extending students' counting range",
        "realWorldConnection": "Compter les doigts d'une main, les roues d'une voiture",
        "mindsOn": {
            "activity": "Montrer 4 doigts, puis 5 - demander aux élèves de compter",
            "duration": "5 minutes"
        },
        "action": {
            "activities": [
                "Compter des collections de 4 objets",
                "Créer des groupes de 5 avec des cubes",
                "Dessiner 4 et 5 objets"
            ],
            "duration": "30 minutes"
        },
        "consolidation": {
            "activity": "Jeu de comptage rapide avec cartes de nombres",
            "duration": "10 minutes"
        },
        "materials": {
            "required": [
                "Matériel de base pour l'activité"
            ]
        }
    }
    
    # Save sample lesson in agents directory
    agents_dir = Path(__file__).parent
    sample_file = agents_dir / "test-lesson.json"
    with open(sample_file, 'w', encoding='utf-8') as f:
        json.dump(sample_lesson, f, ensure_ascii=False, indent=2)
    
    return sample_file

def run_agent_pipeline(lesson_file: Path):
    """Run the complete agent pipeline on a lesson file"""
    
    print(f"\n{'='*60}")
    print(f"TESTING AGENT SYSTEM")
    print(f"{'='*60}")
    print(f"Test file: {lesson_file}")
    print(f"{'='*60}\n")
    
    agents_dir = Path(__file__).parent
    specs_dir = Path("test-specs")
    specs_dir.mkdir(exist_ok=True)
    
    # Initialize practical_file for later use
    practical_file = None
    
    # Stage 1: Lesson Comprehension
    print("Stage 1: Lesson Comprehension Agent")
    print("-" * 40)
    # The agent saves the spec file next to the input file
    spec_file = lesson_file.parent / f"{lesson_file.stem}-spec.json"
    cmd = [sys.executable, str(agents_dir / "agent-1-lesson-comprehension.py"), str(lesson_file)]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if spec_file.exists():
            print("✓ Comprehension completed")
            with open(spec_file, 'r', encoding='utf-8') as f:
                spec = json.load(f)
            print(f"  - Lesson: {spec.get('lessonTitle', 'Unknown')}")
            print(f"  - Objective: {spec.get('specificObjective', 'Unknown')}")
            print(f"  - Cognitive Process: {spec.get('cognitiveProcess', 'Unknown')}")
            print(f"  - Materials identified: {len(spec.get('materialNeeds', {}).get('primary', []))}")
        else:
            print("✗ Comprehension failed")
            print(f"Error: {result.stderr}")
            return False, practical_file
    except Exception as e:
        print(f"✗ Comprehension error: {e}")
        return False, practical_file
    
    # Stage 2: Pedagogical Expert
    print("\nStage 2: Pedagogical Expert Agent")
    print("-" * 40)
    enhanced_file = spec_file.parent / f"{spec_file.stem}-enhanced.json"
    cmd = [sys.executable, str(agents_dir / "agent-2-pedagogical-expert.py"), str(spec_file)]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if enhanced_file.exists():
            print("✓ Pedagogical enhancement completed")
            with open(enhanced_file, 'r', encoding='utf-8') as f:
                enhanced = json.load(f)
            dev_check = enhanced.get('developmentalCheck', {})
            print(f"  - Age appropriate: {dev_check.get('ageAppropriate', False)}")
            print(f"  - Safety verified: {enhanced.get('safetyVerification', {}).get('verified', False)}")
            diff = enhanced.get('differentiationOptions', {})
            print(f"  - Differentiation strategies: {sum(len(v) for v in diff.values())}")
        else:
            print("✗ Enhancement failed")
            print(f"Error: {result.stderr}")
            return False, practical_file
    except Exception as e:
        print(f"✗ Enhancement error: {e}")
        return False, practical_file
    
    # Stage 3: French Specialist
    print("\nStage 3: French Immersion Specialist")
    print("-" * 40)
    french_file = enhanced_file.parent / f"{enhanced_file.stem}-french.json"
    cmd = [sys.executable, str(agents_dir / "agent-3-french-specialist.py"), str(enhanced_file)]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if french_file.exists():
            print("✓ French support completed")
            with open(french_file, 'r', encoding='utf-8') as f:
                french = json.load(f)
            print(f"  - French verified: {french.get('frenchVerification', {}).get('allTermsVerified', False)}")
            print(f"  - Visual vocabulary: {len(french.get('visualVocabulary', []))} cards")
            print(f"  - TPR elements: {len(french.get('tprElements', []))}")
            cultural = french.get('culturalConnections', {})
            print(f"  - Cultural connections: PEI={len(cultural.get('peiContext', []))}, Acadian={len(cultural.get('acadianConnections', []))}")
        else:
            print("✗ French support failed")
            print(f"Error: {result.stderr}")
            return False, practical_file
    except Exception as e:
        print(f"✗ French error: {e}")
        return False, practical_file
    
    # Stage 4: Resource Specialist
    print("\nStage 4: Resource Availability Specialist")
    print("-" * 40)
    practical_file = french_file.parent / f"{french_file.stem}-practical.json"
    cmd = [sys.executable, str(agents_dir / "agent-4-resource-specialist.py"), str(french_file)]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if practical_file.exists():
            print("✓ Resource check completed")
            with open(practical_file, 'r', encoding='utf-8') as f:
                practical = json.load(f)
            analysis = practical.get('availabilityAnalysis', {})
            print(f"  - Immediately available: {len(analysis.get('immediatelyAvailable', []))}")
            print(f"  - Needs preparation: {len(analysis.get('requiresPreparation', []))}")
            print(f"  - Needs purchase: {len(analysis.get('requiresPurchase', []))}")
            costs = practical.get('costAnalysis', {})
            print(f"  - Total cost: ${costs.get('totalCost', 0)}")
            print(f"  - Budget status: {costs.get('budgetStatus', 'Unknown')}")
        else:
            print("✗ Resource check failed")
            print(f"Error: {result.stderr}")
            return False, practical_file
    except Exception as e:
        print(f"✗ Resource error: {e}")
        return False, practical_file
    
    # Stage 5: Quality Assurance
    print("\nStage 5: Quality Assurance Validator")
    print("-" * 40)
    validated_file = practical_file.parent / f"{practical_file.stem}-validated.json"
    cmd = [sys.executable, str(agents_dir / "agent-5-qa-validator.py"), str(practical_file)]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if validated_file.exists():
            print("✓ Validation completed")
            with open(validated_file, 'r', encoding='utf-8') as f:
                validation = json.load(f)
            print(f"  - Status: {validation.get('status', 'Unknown')}")
            print(f"  - Score: {validation.get('score', 0)}/{validation.get('maxScore', 20)}")
            
            # Print breakdown
            breakdown = validation.get('breakdown', {})
            if breakdown:
                print("\n  Score Breakdown:")
                for category, scores in breakdown.items():
                    category_name = category.replace('_', ' ').title()
                    print(f"    {category_name:30} {scores['score']}/{scores['maxScore']} ({scores['percentage']:.0f}%)")
            
            # Print issues if any
            if validation.get('rejectionReasons'):
                print("\n  Rejection Reasons:")
                for reason in validation['rejectionReasons']:
                    print(f"    - {reason}")
            
            if validation.get('revisionRequests'):
                print("\n  Revision Requests:")
                for request in validation['revisionRequests']:
                    print(f"    - {request}")
                    
            return validation.get('status', 'ERROR'), practical_file
        else:
            print("✗ Validation failed")
            print(f"Error: {result.stderr}")
            return "ERROR", practical_file
    except Exception as e:
        print(f"✗ Validation error: {e}")
        return "ERROR", practical_file

def display_final_materials(practical_file: Path):
    """Display the final improved materials"""
    
    # practical_file passed as parameter
    if not practical_file.exists():
        return
    
    with open(practical_file, 'r', encoding='utf-8') as f:
        practical = json.load(f)
    
    print(f"\n{'='*60}")
    print("FINAL IMPROVED MATERIALS")
    print(f"{'='*60}")
    
    supply_list = practical.get('supplyList', [])
    if supply_list:
        print("\nRequired Materials:")
        print("-" * 40)
        for i, supply in enumerate(supply_list, 1):
            print(f"\n{i}. {supply.get('item', 'Unknown')}")
            print(f"   Quantity: {supply.get('quantity', 'As needed')}")
            print(f"   Source: {supply.get('source', 'Unknown')}")
            print(f"   Cost: {supply.get('cost', '$0')}")
            if supply.get('preparation'):
                print(f"   Preparation: {supply['preparation']}")
    
    # Show alternatives
    alternatives = practical.get('practicalAlternatives', {})
    if alternatives:
        print("\nAlternative Options:")
        print("-" * 40)
        if alternatives.get('ideal'):
            print("\nIdeal Option:")
            for alt in alternatives['ideal']:
                print(f"  - {alt.get('item', 'Unknown')}: {alt.get('cost', '$0')} from {alt.get('source', 'Unknown')}")
        if alternatives.get('economy'):
            print("\nEconomy Option:")
            for alt in alternatives['economy']:
                print(f"  - {alt.get('item', 'Unknown')}: {alt.get('cost', '$0')} from {alt.get('source', 'Unknown')}")

def main():
    """Run the test"""
    
    print("\n" + "="*60)
    print("MULTI-AGENT MATERIAL IMPROVEMENT SYSTEM TEST")
    print("="*60)
    print("\nThis test demonstrates the complete agent pipeline:")
    print("1. Lesson Comprehension - Understands the lesson")
    print("2. Pedagogical Expert - Applies Grade 1 best practices")
    print("3. French Specialist - Ensures authentic Canadian French")
    print("4. Resource Specialist - Verifies PEI availability")
    print("5. Quality Validator - Final approval check")
    print("\n✓ No parent donations required")
    print("✓ All materials school-provided or free")
    print("="*60)
    
    # Create sample lesson
    lesson_file = create_sample_lesson()
    print(f"\nCreated test lesson: {lesson_file}")
    
    # Run agent pipeline
    result = run_agent_pipeline(lesson_file)
    if isinstance(result, tuple):
        final_status, practical_file = result
    else:
        final_status = result
        practical_file = None
    
    # Display final materials
    if practical_file and practical_file.exists():
        display_final_materials(practical_file)
    
    # Summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    
    if final_status == "APPROVED":
        print("✓ SUCCESS: Materials approved for classroom use!")
        print("\nThe agent system successfully:")
        print("  • Replaced generic template with specific materials")
        print("  • Ensured Grade 1 developmental appropriateness")
        print("  • Added French immersion language supports")
        print("  • Verified availability in PEI schools")
        print("  • Passed quality assurance validation")
    elif final_status == "REVISION_REQUIRED":
        print("⚠ NEEDS REVISION: Materials need minor adjustments")
        print("\nCheck the revision requests above for required changes.")
    elif final_status == "REJECTED":
        print("✗ REJECTED: Materials do not meet standards")
        print("\nCheck the rejection reasons above for details.")
    else:
        print("⚡ ERROR: Test failed to complete")
    
    print(f"\n{'='*60}\n")
    
    # Clean up
    if lesson_file.exists():
        lesson_file.unlink()

if __name__ == "__main__":
    main()