#!/usr/bin/env python3
"""
Batch Intelligent Processing System for 977 Lessons
Scales the Task Agent approach to handle all lessons with subject-specific intelligence
"""

import json
from pathlib import Path
from typing import Dict, List, Any
import time

class BatchIntelligentProcessor:
    def __init__(self):
        self.subjects = {
            'mathematiques': 'mathematics',
            'francais': 'french_immersion', 
            'sciences': 'science',
            'arts-visuels': 'visual_arts',
            'sciences-humaines': 'social_studies',
            'formation-personnelle': 'health_fps'
        }
        
        self.processed_count = 0
        self.failed_count = 0
        self.batch_size = 5  # Process 5 lessons at a time to avoid overwhelming
        
        # Track what issues we find across all lessons
        self.global_issues = {
            'mixed_language': 0,
            'unsafe_materials': 0,
            'generic_materials': 0,
            'attention_span_violations': 0,
            'missing_safety_protocols': 0
        }

    def get_subject_agent_instructions(self, subject: str) -> Dict[str, str]:
        """Get subject-specific agent instructions based on pedagogy"""
        
        instructions = {
            'mathematics': {
                'agent_1': """
                Agent 1: Mathematical Pedagogy Expert
                
                APPLY: Piaget's concrete operational stage (Grade 1)
                - 80% concrete manipulatives required
                - Subitizing development (instant recognition 1-4)
                - One-to-one correspondence essential
                - Visual number representations needed
                
                ANALYZE: What mathematical thinking occurs?
                - Counting, cardinality, numeration, patterns, measurement?
                - Are current materials appropriate for this math concept?
                - What manipulatives enable THIS specific learning?
                
                SAFETY: Materials >3cm, no small parts, appropriate for 6-year-olds
                """,
                
                'agent_2': """
                Agent 2: Math Materials Specialist (PEI)
                
                PEI INVENTORY: Unifix cubes, counting bears, base-10 blocks, 
                pattern blocks, ten frames, dice, measuring tools
                
                FREE SOURCES: Lima beans (cafeteria), bottle caps, paper plates
                
                SPECIFY: Exact mathematical materials for THIS lesson's concept
                - Quantity for 25 students
                - Mathematical rationale (how this enables learning)
                - Safety specifications
                - Cost ($0 preferred, <$20 maximum)
                """
            },
            
            'french_immersion': {
                'agent_3': """
                Agent 3: French Immersion Language Validator
                
                CANADIAN FRENCH: Use blocs (not briques), jetons (not pions)
                
                KRASHEN INPUT HYPOTHESIS: 
                - Comprehensible input only (no English mixed in)
                - 8-10 new words maximum per lesson
                - Visual supports for ALL new vocabulary
                
                CHECK: Learning goals, materials names, instructions
                FIX: Any English/French mixing
                ADD: TPR gestures, visual cards, sentence frames
                """
            },
            
            'visual_arts': {
                'agent_1': """
                Agent 1: Arts Pedagogy Expert
                
                LOWENFELD STAGE: Pre-schematic (ages 6-7)
                - Process over product emphasis
                - Sensory exploration essential
                - Large motor control better than fine
                
                ANALYZE: What artistic learning occurs?
                - Exploration, technique development, expression?
                - Are materials safe for sensory exploration?
                - What supports creative expression?
                """
            },
            
            'science': {
                'agent_4': """
                Agent 4: Science Safety Expert
                
                GRADE 1 SCIENCE SAFETY:
                - No chemicals or hot surfaces
                - Eye protection for light activities
                - Large materials to prevent choking
                - Supervised exploration only
                
                INQUIRY PEDAGOGY: Concrete exploration before abstract
                """
            }
        }
        
        return instructions.get(subject, {})

    def find_all_lesson_files(self) -> Dict[str, List[Path]]:
        """Find all lesson files organized by subject"""
        
        lesson_files = {}
        generated_lessons = Path("generated-lessons")
        
        for subject_dir in generated_lessons.iterdir():
            if subject_dir.is_dir() and subject_dir.name in self.subjects:
                files = list(subject_dir.glob("*-full.json"))
                if files:
                    lesson_files[subject_dir.name] = files
                    
        return lesson_files

    def identify_lesson_problems(self, lesson: Dict[str, Any]) -> List[str]:
        """Identify specific problems in lesson that need fixing"""
        
        problems = []
        
        # Check for mixed language in learning goal
        goal = lesson.get('oneGoal', '')
        if any(english_word in goal.lower() for english_word in 
               ['students', 'will', 'can', 'and', 'the', 'through', 'different']):
            problems.append('mixed_english_french_goal')
            self.global_issues['mixed_language'] += 1
        
        # Check for generic materials
        materials_text = str(lesson.get('materials', ''))
        if 'matériel de base' in materials_text.lower():
            problems.append('generic_materials')
            self.global_issues['generic_materials'] += 1
            
        # Check attention span violations
        if 'main' in lesson:
            duration = lesson['main'].get('duration', 0)
            if isinstance(duration, int) and duration > 15:
                problems.append('attention_span_violation')
                self.global_issues['attention_span_violations'] += 1
        
        # Check for safety protocols
        if 'safety' not in str(lesson).lower():
            problems.append('missing_safety')
            self.global_issues['missing_safety_protocols'] += 1
            
        return problems

    def create_batch_processing_plan(self) -> Dict[str, Any]:
        """Create a comprehensive plan for processing all 977 lessons"""
        
        lesson_files = self.find_all_lesson_files()
        
        print(f"\n{'='*70}")
        print(f"BATCH PROCESSING PLAN FOR 977 LESSONS")
        print(f"{'='*70}")
        
        total_files = sum(len(files) for files in lesson_files.values())
        estimated_time = total_files * 3  # 3 minutes per lesson with agents
        
        print(f"\n📊 SCOPE ANALYSIS:")
        print(f"  • Total lesson files found: {total_files}")
        for subject, files in lesson_files.items():
            print(f"    - {subject}: {len(files)} files")
        
        print(f"\n⏱️ TIME ESTIMATION:")
        print(f"  • Processing time: ~{estimated_time} minutes ({estimated_time//60}h {estimated_time%60}m)")
        print(f"  • With parallel batches: ~{estimated_time//self.batch_size} minutes")
        
        # Sample a few lessons to identify common problems
        print(f"\n🔍 PROBLEM ANALYSIS (sampling 10 lessons):")
        sample_count = 0
        for subject, files in lesson_files.items():
            for file_path in files[:2]:  # Sample 2 per subject
                if sample_count >= 10:
                    break
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # Check if it's a unit file with lessons array
                    if 'lessons' in data:
                        for lesson in data['lessons'][:1]:  # Just first lesson
                            self.identify_lesson_problems(lesson)
                    else:
                        self.identify_lesson_problems(data)
                    
                    sample_count += 1
                except Exception as e:
                    print(f"    ⚠️ Could not sample {file_path}: {e}")
        
        print(f"\n📈 IDENTIFIED ISSUES (from {sample_count} lessons sampled):")
        for issue, count in self.global_issues.items():
            if count > 0:
                percentage = (count / sample_count) * 100
                print(f"  • {issue}: {count}/{sample_count} lessons ({percentage:.0f}%)")
        
        return {
            'lesson_files': lesson_files,
            'total_files': total_files,
            'estimated_time': estimated_time,
            'common_issues': self.global_issues
        }

    def create_processing_strategy(self) -> Dict[str, Any]:
        """Create specific strategy for processing based on identified issues"""
        
        strategy = {
            'priority_order': [
                'francais',  # Highest priority - language issues most critical
                'mathematiques',  # High usage, concrete materials important
                'sciences',  # Safety issues most critical
                'arts-visuels',  # Mixed language common
                'sciences-humaines',  # Cultural sensitivity important
                'formation-personnelle'  # Health/safety protocols needed
            ],
            
            'batch_configuration': {
                'batch_size': 5,  # 5 lessons at a time
                'parallel_agents': 3,  # Run 3 agents per lesson in parallel
                'retry_attempts': 2,  # Retry failed lessons twice
                'progress_checkpoints': 25  # Save progress every 25 lessons
            },
            
            'quality_assurance': {
                'sample_verification': True,  # Manually verify 10% of results
                'automated_checks': [
                    'no_english_in_french_goals',
                    'materials_have_safety_specs', 
                    'cost_under_20_dollars',
                    'materials_from_pei_sources'
                ],
                'failure_threshold': 15  # Stop if >15% of lessons fail processing
            }
        }
        
        return strategy

def demonstrate_batch_system():
    """Demonstrate the complete batch processing system"""
    
    processor = BatchIntelligentProcessor()
    
    # Create processing plan
    plan = processor.create_batch_processing_plan()
    
    # Create processing strategy
    strategy = processor.create_processing_strategy()
    
    print(f"\n{'='*70}")
    print(f"RECOMMENDED PROCESSING STRATEGY")
    print(f"{'='*70}")
    
    print(f"\n🎯 PRIORITY ORDER:")
    for i, subject in enumerate(strategy['priority_order'], 1):
        file_count = len(plan['lesson_files'].get(subject, []))
        print(f"  {i}. {subject}: {file_count} files")
    
    print(f"\n⚙️ BATCH CONFIGURATION:")
    config = strategy['batch_configuration']
    print(f"  • Batch size: {config['batch_size']} lessons at a time")
    print(f"  • Parallel agents: {config['parallel_agents']} agents per lesson")
    print(f"  • Progress checkpoints: Every {config['progress_checkpoints']} lessons")
    
    print(f"\n🔍 QUALITY ASSURANCE:")
    qa = strategy['quality_assurance']
    print(f"  • Sample verification: {qa['sample_verification']}")
    print(f"  • Automated checks: {len(qa['automated_checks'])} validation rules")
    print(f"  • Failure threshold: {qa['failure_threshold']}% maximum failures")
    
    print(f"\n{'='*70}")
    print(f"NEXT STEPS FOR FULL DEPLOYMENT")
    print(f"{'='*70}")
    
    print(f"""
1. TEST BATCH PROCESSING:
   • Start with francais subject (highest priority)
   • Process first batch of 5 lessons
   • Verify quality of results
   
2. VALIDATE APPROACH:
   • Check Task agents handle different lesson structures
   • Confirm improvements meet quality standards
   • Adjust batch size if needed
   
3. FULL DEPLOYMENT:
   • Process all subjects in priority order
   • Monitor progress and failure rates
   • Generate comprehensive improvement report
   
4. QUALITY ASSURANCE:
   • Manual review of 10% sample
   • Validate no parent donations required
   • Confirm all materials under $20
   • Verify French language correctness
   
READY FOR DEPLOYMENT: ✅
    """)
    
    # Save processing configuration (convert Path objects to strings)
    serializable_plan = {
        'lesson_files': {subject: [str(p) for p in paths] for subject, paths in plan['lesson_files'].items()},
        'total_files': plan['total_files'],
        'estimated_time': plan['estimated_time'],
        'common_issues': plan['common_issues']
    }
    
    with open("batch-processing-config.json", 'w', encoding='utf-8') as f:
        json.dump({
            'plan': serializable_plan,
            'strategy': strategy,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }, f, ensure_ascii=False, indent=2)
    
    print(f"📁 Configuration saved to: batch-processing-config.json")

if __name__ == "__main__":
    demonstrate_batch_system()