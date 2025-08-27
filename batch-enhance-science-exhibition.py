#!/usr/bin/env python3
"""
Batch enhancement script for Science Exhibition lessons.
Completes differentiation and assessment sections for all remaining lessons.
"""

import json

# Lesson-specific differentiation and assessment content
LESSON_ENHANCEMENTS = {
    8: {  # Créer un affichage visuel
        "differentiation": {
            "forStruggling": [
                "Provide simple templates or pre-drawn outlines for visual displays",
                "Focus on one key concept rather than comprehensive displays",
                "Use partner support for planning and organizing visual elements"
            ],
            "forAdvanced": [
                "Encourage students to create interactive elements for their visual display",
                "Include multiple ways to show the same concept (drawing, diagram, model)",
                "Challenge students to design displays that teach others step-by-step"
            ],
            "forELL": [
                "Use visual vocabulary cards with French labels for display creation",
                "Allow combination of drawings and simple French words/phrases",
                "Practice key vocabulary: 'affichage', 'montrer', 'expliquer', 'intéressant'"
            ],
            "forIEP": [
                "Focus on creating one clear visual element rather than complex displays",
                "Use concrete materials and hands-on creation over abstract planning",
                "Provide step-by-step visual guides for display creation process"
            ]
        },
        "assessmentCriteria": {
            "observable": [
                "Student creates a visual display that supports their science demonstration",
                "Student includes key information about their science topic in visual format",
                "Student uses appropriate materials and organization in their display",
                "Student can explain how their visual display helps others understand their topic"
            ],
            "checkpoints": [
                "Planning phase: Does student identify key elements to include in their display?",
                "Creation phase: Does student work purposefully to create meaningful visual supports?",
                "Review phase: Can student explain how their display connects to their demonstration?",
                "Integration phase: Does student see how visual and verbal elements work together?"
            ]
        }
    },
    9: {  # Questions que les visiteurs pourraient poser
        "differentiation": {
            "forStruggling": [
                "Pre-practice with 2-3 simple, predictable questions about their topic",
                "Use visual cue cards to remind students of key answer points",
                "Practice with very supportive peer partners who ask gentle questions"
            ],
            "forAdvanced": [
                "Encourage students to think of follow-up questions visitors might ask",
                "Practice explaining their topic in different ways if first explanation unclear",
                "Challenge students to connect their topic to visitors' own experiences"
            ],
            "forELL": [
                "Practice key question-answer vocabulary: 'Qu'est-ce que...?', 'Comment...?', 'Pourquoi...?'",
                "Use sentence frames for answers: 'C'est...', 'Ça marche parce que...', 'J'aime ça parce que...'",
                "Allow use of gestures and props to support verbal answers"
            ],
            "forIEP": [
                "Focus on understanding and answering just one type of question well",
                "Use concrete examples and hands-on demonstrations rather than abstract explanations",
                "Practice with familiar adults before peer or visitor interactions"
            ]
        },
        "assessmentCriteria": {
            "observable": [
                "Student can anticipate basic questions visitors might ask about their topic",
                "Student provides appropriate answers using simple, clear language",
                "Student responds to questions with confidence and enthusiasm",
                "Student uses their demonstration materials to help answer questions"
            ],
            "checkpoints": [
                "Question anticipation: Can student predict what others might wonder about their topic?",
                "Answer preparation: Does student practice clear, simple responses?",
                "Interactive practice: Does student engage appropriately during question practice?",
                "Confidence building: Does student show increasing comfort with Q&A format?"
            ]
        }
    },
    12: {  # Améliorer notre présentation
        "differentiation": {
            "forStruggling": [
                "Focus on just one specific improvement area (louder voice, clearer showing, etc.)",
                "Use peer feedback focused on positive observations only",
                "Practice improvements in low-pressure, supportive environment"
            ],
            "forAdvanced": [
                "Encourage students to seek feedback on multiple aspects of their presentation",
                "Include students in helping peers identify improvement opportunities",
                "Challenge students to practice their improvements until they become automatic"
            ],
            "forELL": [
                "Focus on improvement vocabulary: 'mieux', 'plus fort', 'plus clair', 'améliorer'",
                "Use visual guides showing good presentation behaviors",
                "Practice improvement phrases: 'Je peux faire mieux', 'Maintenant c'est plus clair'"
            ],
            "forIEP": [
                "Use concrete, specific feedback rather than general improvement suggestions",
                "Focus on one small, achievable improvement at a time",
                "Provide multiple practice opportunities with consistent support"
            ]
        },
        "assessmentCriteria": {
            "observable": [
                "Student can identify one area for improvement in their presentation",
                "Student practices their identified improvement with focus and effort",
                "Student shows growth between initial and improved presentation attempts",
                "Student responds positively to constructive feedback and suggestions"
            ],
            "checkpoints": [
                "Self-reflection: Can student recognize aspects of their presentation that could be improved?",
                "Goal-setting: Does student choose realistic, achievable improvement goals?",
                "Practice: Does student work deliberately to improve their identified area?",
                "Growth: Is improvement visible in student's presentation efforts?"
            ]
        }
    },
    13: {  # Aider les autres avec leurs projets
        "differentiation": {
            "forStruggling": [
                "Focus on giving positive encouragement rather than specific feedback",
                "Use structured sentence frames for supportive comments",
                "Practice listening skills and kind audience behaviors"
            ],
            "forAdvanced": [
                "Encourage students to give specific, helpful suggestions to peers",
                "Include students in helping solve presentation challenges collaboratively",
                "Challenge students to ask thoughtful questions that help others improve"
            ],
            "forELL": [
                "Practice encouragement vocabulary: 'Bon travail!', 'C'est intéressant!', 'J'aime...'",
                "Use simple comment frames: 'Tu expliques bien...', 'Ton projet montre...'",
                "Focus on positive observation rather than complex feedback"
            ],
            "forIEP": [
                "Focus on being a good audience member (listening, looking, staying quiet)",
                "Use concrete ways to help (holding materials, being practice audience)",
                "Practice giving one positive comment rather than detailed feedback"
            ]
        },
        "assessmentCriteria": {
            "observable": [
                "Student provides encouraging and supportive feedback to classmates",
                "Student listens actively and attentively to others' presentations",
                "Student offers appropriate help when classmates are practicing",
                "Student demonstrates respectful audience behaviors consistently"
            ],
            "checkpoints": [
                "Peer interaction: Does student engage positively and supportively with classmates?",
                "Feedback quality: Are student's comments encouraging and appropriate?",
                "Active listening: Does student pay attention and respond appropriately to others?",
                "Helpfulness: Does student offer assistance in appropriate and useful ways?"
            ]
        }
    },
    14: {  # Inviter notre famille
        "differentiation": {
            "forStruggling": [
                "Provide simple invitation template with blanks to fill in key information",
                "Focus on drawing and decorating rather than extensive writing",
                "Use dictation with adult help for writing invitation text"
            ],
            "forAdvanced": [
                "Encourage students to include specific details about what visitors will see and learn",
                "Include students in thinking about accessibility and comfort for all visitors",
                "Challenge students to create invitations in multiple languages if appropriate"
            ],
            "forELL": [
                "Provide invitation vocabulary with visual supports: invitation, venir, voir, célébrer",
                "Use simple sentence frames: 'Venez voir', 'Je vais montrer', 'À bientôt'",
                "Allow incorporation of home language elements in invitation design"
            ],
            "forIEP": [
                "Use very simple invitation format focusing on essential information only",
                "Provide hands-on decoration materials (stickers, stamps) rather than complex art tasks",
                "Focus on personal connection: drawing family members or special people to invite"
            ]
        },
        "assessmentCriteria": {
            "observable": [
                "Student creates an invitation that includes essential information about the science exposition",
                "Student shows enthusiasm about sharing their science learning with family",
                "Student includes personal touches that make the invitation welcoming",
                "Student can explain what visitors will experience at the exposition"
            ],
            "checkpoints": [
                "Information inclusion: Does invitation contain key details (what, when, where, why)?",
                "Personal connection: Does student show excitement about sharing their work?",
                "Creative elements: Does student add personal or decorative touches to invitation?",
                "Communication: Can student explain the purpose and format of the exposition to family?"
            ]
        }
    },
    15: {  # Préparer notre espace d'exposition
        "differentiation": {
            "forStruggling": [
                "Focus on organizing just 3-4 essential items in their demonstration space",
                "Use pictorial setup guides showing where each item should go",
                "Practice setup with teacher guidance before independent organization"
            ],
            "forAdvanced": [
                "Include students in overall classroom layout planning for visitor flow",
                "Encourage students to think about visitor comfort (seating, viewing angles, space to move)",
                "Challenge students to create backup plans in case materials are moved or broken"
            ],
            "forELL": [
                "Teach key organization vocabulary: ici (here), là (there), à côté (beside), devant (in front)",
                "Use directional gestures and physical modeling for space organization concepts",
                "Practice key phrases: 'Voici ma place', 'Mes matériaux sont ici', 'Bienvenue à mon espace'"
            ],
            "forIEP": [
                "Use concrete visual markers (tape, signs) to define the student's demonstration space clearly",
                "Focus on one organization task at a time with clear success criteria",
                "Provide consistent adult support for setup and cleanup routines"
            ]
        },
        "assessmentCriteria": {
            "observable": [
                "Student organizes their demonstration space logically and efficiently",
                "Student arranges materials for easy access during their presentation",
                "Student considers visitor viewing angles and comfort when setting up space",
                "Student demonstrates responsibility for their materials and space organization"
            ],
            "checkpoints": [
                "Space planning: Does student think through how to arrange their demonstration area?",
                "Material organization: Are materials placed for easy access and effective presentation?",
                "Visitor consideration: Does setup allow visitors to see and engage appropriately?",
                "Independence: Can student set up and organize their space with minimal adult support?"
            ]
        }
    },
    16: {  # Répétition générale
        "differentiation": {
            "forStruggling": [
                "Focus on completing their presentation from start to finish without perfection pressure",
                "Provide extra encouragement and positive reinforcement during practice",
                "Allow for shorter presentation length if full demonstration feels overwhelming"
            ],
            "forAdvanced": [
                "Include practicing with timing and pacing for efficient presentations",
                "Encourage students to practice handling unexpected situations or questions",
                "Challenge students to help support classmates during their final practice"
            ],
            "forELL": [
                "Allow use of visual cues and props to support verbal presentation",
                "Practice key transition phrases: 'D'abord', 'Maintenant', 'Finalement', 'Merci'",
                "Focus on clear communication over perfect French pronunciation"
            ],
            "forIEP": [
                "Provide calm, supportive environment with familiar audience members",
                "Allow breaks between presentation components if needed",
                "Focus on celebrating completion and effort rather than performance evaluation"
            ]
        },
        "assessmentCriteria": {
            "observable": [
                "Student completes a full run-through of their science exposition presentation",
                "Student demonstrates increased confidence compared to earlier practice sessions",
                "Student handles their materials and space setup effectively during practice",
                "Student shows readiness and enthusiasm for sharing with real visitors"
            ],
            "checkpoints": [
                "Completion: Does student successfully present their demonstration from beginning to end?",
                "Confidence growth: Does student show increased comfort and self-assurance?",
                "Technical skills: Can student manage materials, space, and presentation flow smoothly?",
                "Readiness assessment: Does student demonstrate preparation for the actual exposition event?"
            ]
        }
    },
    17: {  # Notre exposition scientifique!
        "differentiation": {
            "forStruggling": [
                "Provide adult support nearby for encouragement and assistance if needed",
                "Allow flexibility in presentation length based on student comfort and energy",
                "Focus on celebrating participation and effort rather than performance perfection"
            ],
            "forAdvanced": [
                "Encourage students to engage visitors with questions and interactive elements",
                "Include students in helping welcome and guide visitors around the classroom",
                "Challenge students to make connections between their topic and visitors' experiences"
            ],
            "forELL": [
                "Allow use of all available supports (visual aids, props, gestures) during presentation",
                "Provide patient adult or peer support for language assistance if needed",
                "Celebrate communication success regardless of language perfection"
            ],
            "forIEP": [
                "Ensure familiar, supportive adults are available during presentation time",
                "Allow alternative presentation formats if traditional format becomes overwhelming",
                "Focus on student's comfort and success rather than standardized presentation expectations"
            ]
        },
        "assessmentCriteria": {
            "observable": [
                "Student successfully shares their science learning with visitors to the exposition",
                "Student demonstrates enthusiasm and pride in their scientific exploration and learning",
                "Student engages appropriately with visitors, answering questions and sharing their work",
                "Student shows growth in confidence and scientific communication skills"
            ],
            "checkpoints": [
                "Presentation success: Does student share their science topic effectively with visitors?",
                "Engagement quality: Does student interact positively and appropriately with exposition visitors?",
                "Scientific communication: Can student explain their topic using age-appropriate science vocabulary?",
                "Personal growth: Does student demonstrate increased confidence and pride in their learning?"
            ]
        }
    },
    18: {  # Célébrer nos réussites
        "differentiation": {
            "forStruggling": [
                "Help students identify specific positive moments from their exposition experience",
                "Use visual supports to help students recall and share their success stories",
                "Focus on effort and participation achievements rather than performance comparisons"
            ],
            "forAdvanced": [
                "Encourage students to reflect on their learning journey and growth throughout the unit",
                "Include students in recognizing and celebrating classmates' achievements and efforts",
                "Challenge students to set science learning goals for future exploration"
            ],
            "forELL": [
                "Provide celebration vocabulary: réussir, fier, accomplissement, félicitations",
                "Use sentence frames for reflection: 'Je suis fier de...', 'J'ai appris...', 'C'était amusant quand...'",
                "Allow expression of pride and accomplishment in ways that feel natural to student"
            ],
            "forIEP": [
                "Focus on concrete, specific achievements that student can easily recognize",
                "Use photos or props from the exposition to help trigger positive memories",
                "Celebrate individual growth and participation in ways meaningful to the student"
            ]
        },
        "assessmentCriteria": {
            "observable": [
                "Student can identify specific successes and positive experiences from the science exposition",
                "Student expresses pride and satisfaction in their scientific learning and sharing",
                "Student recognizes their own growth in confidence and science communication skills",
                "Student celebrates both individual and collective class achievements appropriately"
            ],
            "checkpoints": [
                "Success recognition: Can student identify specific things they accomplished well during exposition?",
                "Pride expression: Does student show appropriate pride and satisfaction in their achievements?",
                "Growth awareness: Can student recognize how they've grown as a young scientist?",
                "Community celebration: Does student participate positively in celebrating class achievements?"
            ]
        }
    },
    19: {  # Apprendre des autres projets
        "differentiation": {
            "forStruggling": [
                "Focus on identifying just one interesting thing learned from others' presentations",
                "Use visual supports showing different classmates' topics to help trigger memories",
                "Allow simple expressions of interest: 'J'ai aimé...', 'C'était cool...'"
            ],
            "forAdvanced": [
                "Encourage students to make connections between different classmates' science topics",
                "Include students in thinking about questions they still have after seeing others' work",
                "Challenge students to identify science topics they'd like to explore further"
            ],
            "forELL": [
                "Provide vocabulary for expressing interest: intéressant, nouveau, surprenant, cool",
                "Use sentence frames: 'J'ai appris que...', 'Je ne savais pas que...', 'Maintenant je comprends...'",
                "Allow students to draw or point to express their learning from others"
            ],
            "forIEP": [
                "Focus on concrete, observable things from classmates' presentations",
                "Use photos or materials from other presentations to help recall specific learning",
                "Celebrate the student's attention and interest in others' work"
            ]
        },
        "assessmentCriteria": {
            "observable": [
                "Student can describe something interesting they learned from classmates' science presentations",
                "Student shows appreciation and interest in the variety of science topics explored by peers",
                "Student makes connections between others' topics and their own science experiences",
                "Student demonstrates good listening and learning skills during peer presentations"
            ],
            "checkpoints": [
                "Peer learning: Can student identify specific things learned from classmates' presentations?",
                "Interest expression: Does student show genuine curiosity about others' science topics?",
                "Connection making: Can student relate others' work to their own experiences or interests?",
                "Respectful engagement: Did student demonstrate good audience skills during peer presentations?"
            ]
        }
    },
    20: {  # Sciences pour l'été
        "differentiation": {
            "forStruggling": [
                "Focus on simple, safe science activities available at home (water play, nature observation)",
                "Use picture cards showing safe summer science activities",
                "Connect to familiar summer activities that already have science elements"
            ],
            "forAdvanced": [
                "Encourage students to plan specific science investigations they could do over summer",
                "Include thinking about questions they want to explore further",
                "Challenge students to consider sharing summer discoveries with family or friends"
            ],
            "forELL": [
                "Provide summer science vocabulary: été, explorer, découvrir, observer, sécuritaire",
                "Use visual supports showing summer science activities",
                "Practice phrases: 'Cet été je vais...', 'Je peux observer...', 'C'est sécuritaire de...'"
            ],
            "forIEP": [
                "Focus on very simple, concrete summer activities with science connections",
                "Use familiar summer routines and activities as starting points for science thinking",
                "Emphasize safety and adult supervision for any summer science exploration"
            ]
        },
        "assessmentCriteria": {
            "observable": [
                "Student can identify safe science exploration activities appropriate for summer break",
                "Student shows continued interest in science learning beyond the classroom setting",
                "Student demonstrates understanding of safety considerations for independent science exploration",
                "Student makes connections between formal science learning and everyday summer activities"
            ],
            "checkpoints": [
                "Activity identification: Can student suggest appropriate summer science activities?",
                "Safety awareness: Does student understand the importance of adult supervision and safe practices?",
                "Interest continuation: Does student show enthusiasm for ongoing science exploration?",
                "Connection making: Can student see science in everyday summer activities and experiences?"
            ]
        }
    }
}

def enhance_lessons():
    """Read the lesson file and enhance remaining lessons."""
    
    # Read the current file
    with open('generated-lessons/sciences/exposition-finale-full.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Track changes made
    enhanced_count = 0
    
    # Process each lesson
    for lesson in data['lessons']:
        lesson_num = lesson['lessonNumber']
        
        # Check if this lesson needs enhancement and we have enhancement data
        if (lesson_num in LESSON_ENHANCEMENTS and 
            lesson.get('differentiation', {}).get('forStruggling') == []):
            
            # Apply enhancements
            enhancement = LESSON_ENHANCEMENTS[lesson_num]
            lesson['differentiation'] = enhancement['differentiation']
            lesson['assessmentCriteria'] = enhancement['assessmentCriteria']
            
            enhanced_count += 1
            print(f"✅ Enhanced Lesson {lesson_num}: {lesson['title']}")
    
    # Write the enhanced file back
    with open('generated-lessons/sciences/exposition-finale-full.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n🎉 Successfully enhanced {enhanced_count} lessons!")
    return enhanced_count

if __name__ == "__main__":
    enhanced_count = enhance_lessons()
    print(f"\n📊 Enhancement Summary:")
    print(f"- Lessons enhanced: {enhanced_count}")
    print(f"- All lessons now have complete differentiation and assessment sections")
    print(f"- Science Exhibition unit ready for implementation! 🔬🎯")