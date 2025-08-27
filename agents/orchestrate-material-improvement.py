#!/usr/bin/env python3
"""
Master Orchestration Script for Material Improvement
Coordinates all 5 agents to process lesson files and improve materials
No parent donations - all materials must be school-provided
"""

import json
import os
import sys
import glob
import subprocess
import time
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import concurrent.futures
from datetime import datetime
import argparse

class MaterialImprovementOrchestrator:
    """Orchestrates the multi-agent material improvement system"""
    
    def __init__(self, parallel_workers: int = 4, verbose: bool = False):
        self.parallel_workers = parallel_workers
        self.verbose = verbose
        self.start_time = None
        self.processed_count = 0
        self.approved_count = 0
        self.revision_count = 0
        self.rejected_count = 0
        self.error_count = 0
        
        # Agent paths
        self.agent_dir = Path(__file__).parent
        self.agents = {
            "comprehension": self.agent_dir / "agent-1-lesson-comprehension.py",
            "pedagogical": self.agent_dir / "agent-2-pedagogical-expert.py",
            "french": self.agent_dir / "agent-3-french-specialist.py",
            "resource": self.agent_dir / "agent-4-resource-specialist.py",
            "validator": self.agent_dir / "agent-5-qa-validator.py"
        }
        
        # Output directories
        self.output_dir = Path("improved-materials")
        self.specs_dir = self.output_dir / "specifications"
        self.approved_dir = self.output_dir / "approved"
        self.revision_dir = self.output_dir / "needs-revision"
        self.rejected_dir = self.output_dir / "rejected"
        self.logs_dir = self.output_dir / "logs"
        
        # Create directories
        for directory in [self.specs_dir, self.approved_dir, self.revision_dir, 
                         self.rejected_dir, self.logs_dir]:
            directory.mkdir(parents=True, exist_ok=True)
    
    def process_lesson_file(self, lesson_file: Path) -> Dict[str, Any]:
        """Process a single lesson file through all agents"""
        
        result = {
            "file": str(lesson_file),
            "status": "processing",
            "stages": {},
            "finalStatus": None,
            "errors": []
        }
        
        try:
            # Generate unique ID for this lesson
            lesson_id = lesson_file.stem
            
            if self.verbose:
                print(f"\n{'='*50}")
                print(f"Processing: {lesson_file.name}")
                print(f"{'='*50}")
            
            # Stage 1: Lesson Comprehension
            spec_file = self.specs_dir / f"{lesson_id}-spec.json"
            if not self._run_agent("comprehension", lesson_file, spec_file):
                result['errors'].append("Failed at comprehension stage")
                result['finalStatus'] = "error"
                return result
            result['stages']['comprehension'] = "completed"
            
            # Stage 2: Pedagogical Enhancement
            enhanced_file = self.specs_dir / f"{lesson_id}-enhanced.json"
            if not self._run_agent("pedagogical", spec_file, enhanced_file):
                result['errors'].append("Failed at pedagogical stage")
                result['finalStatus'] = "error"
                return result
            result['stages']['pedagogical'] = "completed"
            
            # Stage 3: French Language Support
            french_file = self.specs_dir / f"{lesson_id}-french.json"
            if not self._run_agent("french", enhanced_file, french_file):
                result['errors'].append("Failed at french stage")
                result['finalStatus'] = "error"
                return result
            result['stages']['french'] = "completed"
            
            # Stage 4: Resource Availability Check
            practical_file = self.specs_dir / f"{lesson_id}-practical.json"
            if not self._run_agent("resource", french_file, practical_file):
                result['errors'].append("Failed at resource stage")
                result['finalStatus'] = "error"
                return result
            result['stages']['resource'] = "completed"
            
            # Stage 5: Quality Assurance Validation
            validated_file = self.specs_dir / f"{lesson_id}-validated.json"
            validation_result = self._run_validation(practical_file, validated_file)
            
            if validation_result == "APPROVED":
                # Copy final specification to approved directory
                final_file = self.approved_dir / f"{lesson_id}-approved.json"
                self._create_final_materials(practical_file, lesson_file, final_file)
                result['finalStatus'] = "approved"
                self.approved_count += 1
                
            elif validation_result == "REVISION_REQUIRED":
                # Copy to revision directory with notes
                revision_file = self.revision_dir / f"{lesson_id}-needs-revision.json"
                self._copy_with_notes(practical_file, validated_file, revision_file)
                result['finalStatus'] = "needs_revision"
                self.revision_count += 1
                
            elif validation_result == "REJECTED":
                # Copy to rejected directory with reasons
                rejected_file = self.rejected_dir / f"{lesson_id}-rejected.json"
                self._copy_with_notes(practical_file, validated_file, rejected_file)
                result['finalStatus'] = "rejected"
                self.rejected_count += 1
                
            else:
                result['finalStatus'] = "error"
                result['errors'].append(f"Unknown validation result: {validation_result}")
                self.error_count += 1
            
            result['stages']['validation'] = validation_result
            
        except Exception as e:
            result['finalStatus'] = "error"
            result['errors'].append(str(e))
            self.error_count += 1
        
        finally:
            self.processed_count += 1
        
        return result
    
    def _run_agent(self, agent_name: str, input_file: Path, output_file: Path) -> bool:
        """Run a specific agent with input and expect output"""
        
        agent_path = self.agents[agent_name]
        
        if self.verbose:
            print(f"  Running {agent_name} agent...")
        
        try:
            # Run agent as subprocess
            cmd = [sys.executable, str(agent_path), str(input_file)]
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Check if output file was created
            if output_file.exists():
                if self.verbose:
                    print(f"    ✓ {agent_name} completed")
                return True
            else:
                if self.verbose:
                    print(f"    ✗ {agent_name} failed - no output file")
                    if result.stderr:
                        print(f"    Error: {result.stderr[:200]}")
                return False
                
        except subprocess.TimeoutExpired:
            if self.verbose:
                print(f"    ✗ {agent_name} timed out")
            return False
        except Exception as e:
            if self.verbose:
                print(f"    ✗ {agent_name} error: {e}")
            return False
    
    def _run_validation(self, input_file: Path, output_file: Path) -> str:
        """Run validation agent and return status"""
        
        agent_path = self.agents['validator']
        
        if self.verbose:
            print(f"  Running validation...")
        
        try:
            cmd = [sys.executable, str(agent_path), str(input_file)]
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Read validation result
            if output_file.exists():
                with open(output_file, 'r', encoding='utf-8') as f:
                    validation = json.load(f)
                    status = validation.get('status', 'ERROR')
                    
                if self.verbose:
                    score = validation.get('score', 0)
                    max_score = validation.get('maxScore', 20)
                    print(f"    Validation: {status} (Score: {score}/{max_score})")
                    
                return status
            else:
                return "ERROR"
                
        except Exception as e:
            if self.verbose:
                print(f"    ✗ Validation error: {e}")
            return "ERROR"
    
    def _create_final_materials(self, practical_file: Path, original_file: Path, output_file: Path):
        """Create final approved materials JSON"""
        
        # Load practical specification
        with open(practical_file, 'r', encoding='utf-8') as f:
            practical = json.load(f)
        
        # Load original lesson file
        with open(original_file, 'r', encoding='utf-8') as f:
            original = json.load(f)
        
        # Extract improved materials
        improved_materials = {
            "required": [],
            "optional": []
        }
        
        # Get supply list with all details
        supply_list = practical.get('supplyList', [])
        for supply in supply_list:
            material_entry = {
                "item": supply.get('item', ''),
                "quantity": supply.get('quantity', ''),
                "preparation": supply.get('preparation', ''),
                "source": supply.get('source', ''),
                "cost": supply.get('cost', '$0')
            }
            
            # Add alternatives if available
            alternatives = practical.get('practicalAlternatives', {})
            if alternatives.get('economy'):
                material_entry['alternatives'] = [
                    alt['item'] for alt in alternatives['economy']
                ]
            
            # Determine if required or optional
            if 'optional' in material_entry['item'].lower():
                improved_materials['optional'].append(material_entry)
            else:
                improved_materials['required'].append(material_entry)
        
        # Update original lesson with improved materials
        self._update_lesson_materials(original, improved_materials)
        
        # Add metadata
        original['materialImprovement'] = {
            "status": "approved",
            "improvedDate": datetime.now().isoformat(),
            "qualityScore": practical.get('validationResult', {}).get('score', 0),
            "noParentDonations": True,
            "allSchoolProvided": True
        }
        
        # Save final file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(original, f, ensure_ascii=False, indent=2)
    
    def _update_lesson_materials(self, lesson: Dict, materials: Dict):
        """Recursively update materials in lesson structure"""
        
        if isinstance(lesson, dict):
            if 'materials' in lesson:
                lesson['materials'] = materials
            else:
                for key, value in lesson.items():
                    self._update_lesson_materials(value, materials)
        elif isinstance(lesson, list):
            for item in lesson:
                self._update_lesson_materials(item, materials)
    
    def _copy_with_notes(self, practical_file: Path, validated_file: Path, output_file: Path):
        """Copy specification with validation notes"""
        
        # Load both files
        with open(practical_file, 'r', encoding='utf-8') as f:
            practical = json.load(f)
        
        with open(validated_file, 'r', encoding='utf-8') as f:
            validation = json.load(f)
        
        # Combine with validation results
        combined = practical.copy()
        combined['validationResult'] = validation
        
        # Save combined file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(combined, f, ensure_ascii=False, indent=2)
    
    def process_batch(self, lesson_files: List[Path]) -> Dict[str, Any]:
        """Process a batch of lesson files in parallel"""
        
        self.start_time = time.time()
        results = []
        
        print(f"\n{'='*60}")
        print(f"MATERIAL IMPROVEMENT ORCHESTRATOR")
        print(f"{'='*60}")
        print(f"Processing {len(lesson_files)} lesson files")
        print(f"Parallel workers: {self.parallel_workers}")
        print(f"Output directory: {self.output_dir}")
        print(f"{'='*60}\n")
        
        # Process files in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.parallel_workers) as executor:
            # Submit all tasks
            future_to_file = {
                executor.submit(self.process_lesson_file, file): file
                for file in lesson_files
            }
            
            # Process results as they complete
            for future in concurrent.futures.as_completed(future_to_file):
                file = future_to_file[future]
                try:
                    result = future.result()
                    results.append(result)
                    self._print_progress()
                except Exception as e:
                    print(f"Error processing {file}: {e}")
                    results.append({
                        "file": str(file),
                        "status": "error",
                        "errors": [str(e)]
                    })
        
        # Generate summary
        summary = self._generate_summary(results)
        
        # Save summary
        summary_file = self.output_dir / "processing_summary.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        
        return summary
    
    def _print_progress(self):
        """Print progress update"""
        
        if not self.verbose:
            # Simple progress bar
            print(f"\rProcessed: {self.processed_count} | "
                  f"✓ {self.approved_count} | "
                  f"⚠ {self.revision_count} | "
                  f"✗ {self.rejected_count} | "
                  f"⚡ {self.error_count}", end="")
    
    def _generate_summary(self, results: List[Dict]) -> Dict[str, Any]:
        """Generate processing summary"""
        
        elapsed = time.time() - self.start_time
        
        summary = {
            "timestamp": datetime.now().isoformat(),
            "totalFiles": len(results),
            "approved": self.approved_count,
            "needsRevision": self.revision_count,
            "rejected": self.rejected_count,
            "errors": self.error_count,
            "processingTime": f"{elapsed:.2f} seconds",
            "averageTime": f"{elapsed/len(results):.2f} seconds/file" if results else "N/A",
            "successRate": f"{(self.approved_count/len(results)*100):.1f}%" if results else "0%",
            "details": results
        }
        
        # Print final summary
        print(f"\n\n{'='*60}")
        print("PROCESSING COMPLETE")
        print(f"{'='*60}")
        print(f"Total Files:    {summary['totalFiles']}")
        print(f"Approved:       {summary['approved']} ({summary['successRate']})")
        print(f"Needs Revision: {summary['needsRevision']}")
        print(f"Rejected:       {summary['rejected']}")
        print(f"Errors:         {summary['errors']}")
        print(f"Time:           {summary['processingTime']}")
        print(f"{'='*60}\n")
        
        return summary

def find_lesson_files(pattern: str = "generated-lessons/**/*-full.json") -> List[Path]:
    """Find all lesson files matching pattern"""
    
    files = []
    for filepath in glob.glob(pattern, recursive=True):
        path = Path(filepath)
        if path.is_file():
            files.append(path)
    
    return sorted(files)

def main():
    """Main entry point"""
    
    parser = argparse.ArgumentParser(
        description="Orchestrate material improvement for Grade 1 French Immersion lessons"
    )
    parser.add_argument(
        "files",
        nargs="*",
        help="Specific lesson files to process (or leave empty for all)"
    )
    parser.add_argument(
        "--pattern",
        default="generated-lessons/**/*-full.json",
        help="File pattern to match (default: generated-lessons/**/*-full.json)"
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Number of parallel workers (default: 4)"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Verbose output"
    )
    parser.add_argument(
        "--test",
        type=int,
        help="Test mode - process only N files"
    )
    
    args = parser.parse_args()
    
    # Find files to process
    if args.files:
        lesson_files = [Path(f) for f in args.files]
    else:
        lesson_files = find_lesson_files(args.pattern)
    
    if not lesson_files:
        print("No lesson files found!")
        sys.exit(1)
    
    # Test mode - limit files
    if args.test:
        lesson_files = lesson_files[:args.test]
        print(f"TEST MODE: Processing only {len(lesson_files)} files\n")
    
    # Create orchestrator and process
    orchestrator = MaterialImprovementOrchestrator(
        parallel_workers=args.workers,
        verbose=args.verbose
    )
    
    # Process all files
    summary = orchestrator.process_batch(lesson_files)
    
    # Exit with appropriate code
    if summary['errors'] > 0:
        sys.exit(2)  # Errors occurred
    elif summary['rejected'] > 0:
        sys.exit(1)  # Some rejected
    else:
        sys.exit(0)  # All successful

if __name__ == "__main__":
    main()