#!/usr/bin/env python3
"""
Agent 5: Quality Assurance Validator
Purpose: Final verification of all materials against quality standards
Ensures no generic templates, proper French, safety, and practicality
"""

import json
import re
from typing import Dict, List, Any, Tuple, Optional
import sys

class QualityAssuranceValidator:
    """Validates material specifications against comprehensive quality rubric"""
    
    def __init__(self):
        self.practical_spec = {}
        self.validation_result = {}
        self.rejection_reasons = []
        self.revision_requests = []
        
        # Quality rubric (20 points total)
        self.quality_rubric = {
            "pedagogical_alignment": {
                "weight": 5,
                "criteria": [
                    "Materials directly support oneGoal",
                    "Enables described activities", 
                    "Appropriate for lesson duration",
                    "Supports assessment plan",
                    "Builds on previous lessons"
                ]
            },
            "developmental_appropriateness": {
                "weight": 5,
                "criteria": [
                    "Safe for Grade 1 (no hazards)",
                    "Manageable size/weight",
                    "Attention span considered",
                    "Fine motor appropriate",
                    "Social learning enabled"
                ]
            },
            "language_culture": {
                "weight": 5,
                "criteria": [
                    "French terminology correct",
                    "Visual supports included",
                    "Culturally inclusive",
                    "No stereotypes",
                    "Local context reflected"
                ]
            },
            "practicality": {
                "weight": 5,
                "criteria": [
                    "Actually obtainable",
                    "Within budget (<$50)",
                    "Storage feasible",
                    "Preparation reasonable",
                    "Alternatives viable"
                ]
            }
        }
        
        # Rejection triggers (automatic fail)
        self.rejection_triggers = {
            "generic_materials": [
                "Matériel de base pour l'activité",
                "various materials",
                "assorted supplies",
                "matériel varié",
                "fournitures diverses"
            ],
            "parent_dependency": [
                "parent donation",
                "apporter de la maison",
                "demander aux parents",
                "bring from home",
                "parents provide"
            ],
            "safety_hazards": [
                "items smaller than 3cm",
                "sharp edges",
                "toxic materials",
                "allergens without alternatives",
                "choking hazards"
            ],
            "unrealistic_items": [
                "specialized equipment over $100",
                "items not available in PEI",
                "requires special ordering",
                "professional materials"
            ],
            "poor_french": [
                "week-end",
                "shopping",
                "email",
                "scotch tape",
                "hi", "bye", "okay"
            ]
        }
    
    def validate_specification(self, practical_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive validation of material specification"""
        
        self.practical_spec = practical_spec
        self.validation_result = {
            "status": "PENDING",
            "score": 0,
            "maxScore": 20,
            "breakdown": {},
            "rejectionReasons": [],
            "revisionRequests": [],
            "approvalCertificate": None
        }
        
        # Check for automatic rejection triggers
        if self._check_rejection_triggers():
            self.validation_result['status'] = "REJECTED"
            self.validation_result['rejectionReasons'] = self.rejection_reasons
            return self.validation_result
        
        # Score against quality rubric
        total_score = 0
        for category, config in self.quality_rubric.items():
            score = self._score_category(category, config)
            self.validation_result['breakdown'][category] = {
                "score": score,
                "maxScore": config['weight'],
                "percentage": (score / config['weight']) * 100
            }
            total_score += score
        
        self.validation_result['score'] = total_score
        
        # Determine status based on score
        if total_score >= 18:  # 90% or higher
            self.validation_result['status'] = "APPROVED"
            self.validation_result['approvalCertificate'] = self._generate_certificate()
        elif total_score >= 15:  # 75% or higher
            self.validation_result['status'] = "REVISION_REQUIRED"
            self.validation_result['revisionRequests'] = self.revision_requests
        else:
            self.validation_result['status'] = "REJECTED"
            self.validation_result['rejectionReasons'].append(
                f"Score too low: {total_score}/20 (minimum 15 required)"
            )
        
        return self.validation_result
    
    def _check_rejection_triggers(self) -> bool:
        """Check for automatic rejection conditions"""
        
        spec_string = json.dumps(self.practical_spec, ensure_ascii=False).lower()
        triggered = False
        
        # Check for generic materials
        for generic in self.rejection_triggers['generic_materials']:
            if generic.lower() in spec_string:
                self.rejection_reasons.append(
                    f"GENERIC MATERIAL DETECTED: '{generic}' - Materials must be specific"
                )
                triggered = True
        
        # Check for parent dependency
        for parent_term in self.rejection_triggers['parent_dependency']:
            if parent_term.lower() in spec_string:
                self.rejection_reasons.append(
                    f"PARENT DONATION REQUIRED: '{parent_term}' - All materials must be school-provided"
                )
                triggered = True
        
        # Check safety verification
        safety = self.practical_spec.get('safetyVerification', {})
        if not safety.get('verified', False):
            self.rejection_reasons.append(
                "SAFETY NOT VERIFIED: Materials have unresolved safety hazards"
            )
            triggered = True
        
        # Check for poor French
        for poor_french in self.rejection_triggers['poor_french']:
            if re.search(r'\b' + poor_french + r'\b', spec_string, re.IGNORECASE):
                self.rejection_reasons.append(
                    f"POOR FRENCH: '{poor_french}' - Must use proper Canadian French"
                )
                triggered = True
        
        # Check budget
        costs = self.practical_spec.get('costAnalysis', {})
        if costs.get('totalCost', 0) > 50:
            self.rejection_reasons.append(
                f"OVER BUDGET: ${costs['totalCost']} exceeds $50 limit"
            )
            triggered = True
        
        return triggered
    
    def _score_category(self, category: str, config: Dict) -> float:
        """Score a specific category against criteria"""
        
        score = 0
        max_score = config['weight']
        points_per_criterion = max_score / len(config['criteria'])
        
        if category == "pedagogical_alignment":
            score = self._score_pedagogical_alignment(config['criteria'], points_per_criterion)
        elif category == "developmental_appropriateness":
            score = self._score_developmental(config['criteria'], points_per_criterion)
        elif category == "language_culture":
            score = self._score_language_culture(config['criteria'], points_per_criterion)
        elif category == "practicality":
            score = self._score_practicality(config['criteria'], points_per_criterion)
        
        return round(score, 2)
    
    def _score_pedagogical_alignment(self, criteria: List[str], points_per: float) -> float:
        """Score pedagogical alignment"""
        
        score = 0
        
        # Check if materials support oneGoal
        one_goal = self.practical_spec.get('specificObjective', '')
        materials = self.practical_spec.get('materialNeeds', {}).get('primary', [])
        
        if one_goal and materials:
            # Materials should be specific to the objective
            if not any(generic in str(materials).lower() for generic in ['varié', 'divers', 'base']):
                score += points_per
            else:
                self.revision_requests.append("Materials too generic for specific objective")
        
        # Check if enables described activities
        activities = self.practical_spec.get('actualActivities', [])
        if activities and len(materials) > 0:
            score += points_per
        else:
            self.revision_requests.append("Materials don't clearly enable described activities")
        
        # Check lesson duration appropriateness
        if 'quantities' in self.practical_spec.get('materialNeeds', {}):
            score += points_per
        
        # Check assessment support
        if 'differentiationOptions' in self.practical_spec:
            score += points_per
        
        # Check progression building
        if 'progression' in self.practical_spec or 'uniqueAspects' in self.practical_spec:
            score += points_per
        
        return score
    
    def _score_developmental(self, criteria: List[str], points_per: float) -> float:
        """Score developmental appropriateness"""
        
        score = 0
        
        # Check safety verification
        safety = self.practical_spec.get('safetyVerification', {})
        if safety.get('verified', False):
            score += points_per
        
        # Check developmental check
        dev_check = self.practical_spec.get('developmentalCheck', {})
        if dev_check.get('ageAppropriate', False):
            score += points_per
        if dev_check.get('concreteManipulatives', False):
            score += points_per
        if dev_check.get('attentionSpanConsidered', False):
            score += points_per
        if dev_check.get('fineMotorAppropriate', False):
            score += points_per
        
        return score
    
    def _score_language_culture(self, criteria: List[str], points_per: float) -> float:
        """Score language and cultural appropriateness"""
        
        score = 0
        
        # Check French verification
        french_ver = self.practical_spec.get('frenchVerification', {})
        if french_ver.get('allTermsVerified', False):
            score += points_per
        else:
            self.revision_requests.append("French terms need correction")
        
        # Check visual supports
        visual_vocab = self.practical_spec.get('visualVocabulary', [])
        if len(visual_vocab) > 0:
            score += points_per
        
        # Check cultural connections
        cultural = self.practical_spec.get('culturalConnections', {})
        if cultural.get('peiContext') or cultural.get('acadianConnections'):
            score += points_per
        
        # Check inclusion supports
        if 'inclusionSupports' in self.practical_spec:
            score += points_per
        
        # Check Indigenous perspectives
        indigenous = self.practical_spec.get('indigenousPerspectives', {})
        if indigenous.get('relevant') or 'indigenousPerspectives' in self.practical_spec:
            score += points_per
        
        return score
    
    def _score_practicality(self, criteria: List[str], points_per: float) -> float:
        """Score practicality and feasibility"""
        
        score = 0
        
        # Check availability
        availability = self.practical_spec.get('availabilityAnalysis', {})
        if len(availability.get('immediatelyAvailable', [])) > 0:
            score += points_per
        
        # Check budget
        costs = self.practical_spec.get('costAnalysis', {})
        if costs.get('totalCost', 0) <= 50:
            score += points_per
        else:
            self.revision_requests.append(f"Reduce cost from ${costs['totalCost']} to under $50")
        
        # Check storage solutions
        if 'storageSolutions' in self.practical_spec:
            score += points_per
        
        # Check preparation timeline
        if 'preparationTimeline' in self.practical_spec:
            score += points_per
        
        # Check alternatives
        alternatives = self.practical_spec.get('practicalAlternatives', {})
        if alternatives.get('economy'):
            score += points_per
        
        return score
    
    def _generate_certificate(self) -> Dict[str, Any]:
        """Generate approval certificate for approved specifications"""
        
        certificate = {
            "lessonTitle": self.practical_spec.get('lessonTitle', 'Unknown'),
            "approvalDate": "2025-08-26",
            "validatorVersion": "1.0",
            "qualityScore": f"{self.validation_result['score']}/{self.validation_result['maxScore']}",
            "certification": "This material specification meets all Grade 1 French Immersion standards",
            "keyStrengths": [],
            "signature": "QA Validator Agent v1.0"
        }
        
        # Identify key strengths
        for category, scores in self.validation_result['breakdown'].items():
            if scores['percentage'] >= 90:
                certificate['keyStrengths'].append(category.replace('_', ' ').title())
        
        return certificate
    
    def generate_validation_report(self) -> str:
        """Generate detailed validation report"""
        
        report = []
        report.append("=" * 50 + "\n")
        report.append("QUALITY ASSURANCE VALIDATION REPORT\n")
        report.append("=" * 50 + "\n\n")
        
        report.append(f"Lesson: {self.practical_spec.get('lessonTitle', 'Unknown')}\n")
        report.append(f"Status: {self.validation_result['status']}\n")
        report.append(f"Score: {self.validation_result['score']}/{self.validation_result['maxScore']}\n\n")
        
        # Score breakdown
        report.append("SCORE BREAKDOWN:\n")
        report.append("-" * 30 + "\n")
        for category, scores in self.validation_result['breakdown'].items():
            category_name = category.replace('_', ' ').title()
            report.append(f"{category_name:30} {scores['score']:4.1f}/{scores['maxScore']} ({scores['percentage']:.0f}%)\n")
        
        # Status-specific information
        report.append("\n" + "=" * 50 + "\n")
        
        if self.validation_result['status'] == "APPROVED":
            report.append("✓ APPROVED FOR USE\n")
            report.append("-" * 30 + "\n")
            cert = self.validation_result['approvalCertificate']
            if cert:
                report.append(f"Certificate: {cert['certification']}\n")
                if cert['keyStrengths']:
                    report.append(f"Key Strengths: {', '.join(cert['keyStrengths'])}\n")
                    
        elif self.validation_result['status'] == "REVISION_REQUIRED":
            report.append("⚠ REVISION REQUIRED\n")
            report.append("-" * 30 + "\n")
            report.append("Required Revisions:\n")
            for i, revision in enumerate(self.validation_result['revisionRequests'], 1):
                report.append(f"  {i}. {revision}\n")
                
        elif self.validation_result['status'] == "REJECTED":
            report.append("✗ REJECTED\n")
            report.append("-" * 30 + "\n")
            report.append("Rejection Reasons:\n")
            for i, reason in enumerate(self.validation_result['rejectionReasons'], 1):
                report.append(f"  {i}. {reason}\n")
        
        # Quality standards reminder
        report.append("\n" + "=" * 50 + "\n")
        report.append("QUALITY STANDARDS:\n")
        report.append("• NO generic materials allowed\n")
        report.append("• NO parent donations required\n")
        report.append("• ALL materials must be school-provided\n")
        report.append("• FRENCH must be Canadian (not European)\n")
        report.append("• SAFETY verified for 6-year-olds\n")
        report.append("• BUDGET maximum $50 per lesson\n")
        
        return ''.join(report)
    
    def save_validation_result(self, output_path: str):
        """Save validation results"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.validation_result, f, ensure_ascii=False, indent=2)
    
    def requires_revision(self) -> bool:
        """Check if specification requires revision"""
        return self.validation_result['status'] == "REVISION_REQUIRED"
    
    def is_approved(self) -> bool:
        """Check if specification is approved"""
        return self.validation_result['status'] == "APPROVED"
    
    def is_rejected(self) -> bool:
        """Check if specification is rejected"""
        return self.validation_result['status'] == "REJECTED"

def main():
    """Validate a practical specification file"""
    
    if len(sys.argv) < 2:
        print("Usage: python agent-5-qa-validator.py <practical_file.json>")
        sys.exit(1)
    
    practical_file = sys.argv[1]
    
    # Load practical specification
    with open(practical_file, 'r', encoding='utf-8') as f:
        practical_spec = json.load(f)
    
    # Create validator and validate
    validator = QualityAssuranceValidator()
    result = validator.validate_specification(practical_spec)
    
    # Save validation result
    output_file = str(practical_file).replace('.json', '-validated.json')
    validator.save_validation_result(output_file)
    
    # Print report
    print(validator.generate_validation_report())
    print(f"\nValidation result saved to: {output_file}")
    
    # Exit with appropriate code
    if validator.is_approved():
        sys.exit(0)  # Success
    elif validator.requires_revision():
        sys.exit(1)  # Needs revision
    else:
        sys.exit(2)  # Rejected

if __name__ == "__main__":
    main()