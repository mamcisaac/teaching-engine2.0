#!/usr/bin/env python3
"""
Fill empty decision points in lesson files with pedagogically appropriate content
For Grade 1 French Immersion students
"""
import json
import os

def get_decision_points_for_subject(filename):
    """Generate appropriate decision points based on subject"""
    
    if 'arts-visuels' in filename:
        return [
            {
                "trigger": "Si un élève montre de la frustration avec le matériel artistique",
                "intervention": "Offrir une alternative plus simple ou démontrer la technique individuellement",
                "rationale": "Maintenir l'engagement et la confiance en soi"
            },
            {
                "trigger": "Quand plusieurs élèves finissent rapidement leur création",
                "intervention": "Proposer des défis supplémentaires ou des détails à ajouter",
                "rationale": "Différencier pour les élèves avancés"
            },
            {
                "trigger": "Si les élèves ont de la difficulté avec la motricité fine",
                "intervention": "Adapter les outils (pinceaux plus gros, ciseaux adaptés)",
                "rationale": "Soutenir le développement moteur individuel"
            },
            {
                "trigger": "Lorsqu'un élève refuse de participer à l'activité créative",
                "intervention": "Offrir un rôle d'assistant ou observer d'abord, puis participer",
                "rationale": "Respecter le rythme individuel et encourager progressivement"
            },
            {
                "trigger": "Si le niveau de bruit devient trop élevé pendant le travail créatif",
                "intervention": "Utiliser un signal visuel pour rappeler le volume acceptable",
                "rationale": "Maintenir un environnement propice à la concentration créative"
            }
        ]
    
    elif 'francais' in filename or 'français' in filename:
        return [
            {
                "trigger": "Si un élève ne comprend pas les instructions en français",
                "intervention": "Utiliser des gestes, répéter plus lentement, montrer un exemple",
                "rationale": "Soutenir la compréhension en immersion"
            },
            {
                "trigger": "Quand un élève utilise l'anglais pour communiquer",
                "intervention": "Reformuler en français et encourager la répétition",
                "rationale": "Maintenir l'immersion tout en validant la communication"
            },
            {
                "trigger": "Si plusieurs élèves ont de la difficulté avec un nouveau vocabulaire",
                "intervention": "Arrêter pour une mini-leçon avec supports visuels",
                "rationale": "Consolider les bases avant de continuer"
            },
            {
                "trigger": "Lorsqu'un élève excelle et termine rapidement",
                "intervention": "Proposer d'aider un pair ou un défi linguistique supplémentaire",
                "rationale": "Enrichir l'apprentissage et développer l'entraide"
            },
            {
                "trigger": "Si l'attention diminue pendant une activité d'écoute",
                "intervention": "Incorporer un mouvement ou changer le format de l'activité",
                "rationale": "Réengager par la variété et le mouvement"
            }
        ]
    
    elif 'mathematiques' in filename or 'mathématiques' in filename:
        return [
            {
                "trigger": "Si un élève compte sur ses doigts pour tout",
                "intervention": "Encourager progressivement l'utilisation de manipulatifs puis la visualisation",
                "rationale": "Développer différentes stratégies de calcul"
            },
            {
                "trigger": "Quand un élève fait des erreurs systématiques",
                "intervention": "Identifier le malentendu et revoir le concept avec du matériel concret",
                "rationale": "Corriger les conceptions erronées tôt"
            },
            {
                "trigger": "Si un élève termine toujours en premier et correctement",
                "intervention": "Offrir des problèmes d'enrichissement ou un rôle de tuteur",
                "rationale": "Maintenir le défi et développer les compétences sociales"
            },
            {
                "trigger": "Lorsque la classe semble confuse sur un concept",
                "intervention": "Revenir au matériel manipulatif et ralentir le rythme",
                "rationale": "Assurer la compréhension fondamentale"
            },
            {
                "trigger": "Si un élève évite les activités mathématiques",
                "intervention": "Commencer avec des succès garantis et augmenter graduellement",
                "rationale": "Construire la confiance mathématique"
            }
        ]
    
    elif 'sciences' in filename:
        return [
            {
                "trigger": "Si un élève ne respecte pas les consignes de sécurité",
                "intervention": "Arrêt immédiat, rappel individuel, observation avant participation",
                "rationale": "La sécurité est prioritaire dans toute exploration"
            },
            {
                "trigger": "Quand les élèves sont trop excités par le matériel",
                "intervention": "Temps d'observation silencieuse avant manipulation",
                "rationale": "Canaliser l'enthousiasme vers l'apprentissage"
            },
            {
                "trigger": "Si un élève a peur de toucher certains matériaux",
                "intervention": "Permettre l'observation d'abord, utiliser des outils intermédiaires",
                "rationale": "Respecter les limites de confort individuelles"
            },
            {
                "trigger": "Lorsque les hypothèses des élèves sont incorrectes",
                "intervention": "Guider l'expérimentation pour découvrir plutôt que corriger directement",
                "rationale": "Développer la pensée scientifique"
            },
            {
                "trigger": "Si le temps manque pour compléter l'expérience",
                "intervention": "Prioriser l'observation et reporter les conclusions",
                "rationale": "Maintenir l'intégrité de la démarche scientifique"
            }
        ]
    
    elif 'formation' in filename:
        return [
            {
                "trigger": "Si un élève partage une information personnelle sensible",
                "intervention": "Remercier pour le partage, rediriger délicatement, suivi individuel après",
                "rationale": "Protéger la vie privée tout en validant les émotions"
            },
            {
                "trigger": "Quand un conflit émerge entre élèves",
                "intervention": "Utiliser comme opportunité d'apprentissage de résolution",
                "rationale": "Développer les compétences sociales pratiques"
            },
            {
                "trigger": "Si un élève refuse de participer aux activités sociales",
                "intervention": "Offrir un rôle d'observateur avec participation graduelle",
                "rationale": "Respecter le rythme social individuel"
            },
            {
                "trigger": "Lorsqu'un élève montre des signes de détresse émotionnelle",
                "intervention": "Soutien immédiat, espace calme, communication avec les parents",
                "rationale": "Prioriser le bien-être émotionnel"
            },
            {
                "trigger": "Si les discussions deviennent inappropriées pour l'âge",
                "intervention": "Rediriger vers des concepts appropriés au développement",
                "rationale": "Maintenir le contenu adapté à l'âge"
            }
        ]
    
    else:
        # Default decision points
        return [
            {
                "trigger": "Si l'attention de la classe diminue",
                "intervention": "Incorporer une pause active ou changer le format de l'activité",
                "rationale": "Maintenir l'engagement par la variété"
            },
            {
                "trigger": "Quand un élève a de la difficulté",
                "intervention": "Offrir du soutien individuel ou en petit groupe",
                "rationale": "Différencier selon les besoins"
            },
            {
                "trigger": "Si un élève termine rapidement",
                "intervention": "Proposer une extension ou un rôle d'aide",
                "rationale": "Maintenir l'engagement de tous"
            },
            {
                "trigger": "Lorsque le comportement devient problématique",
                "intervention": "Rappel des attentes, redirection positive",
                "rationale": "Maintenir un environnement d'apprentissage positif"
            },
            {
                "trigger": "Si le temps manque",
                "intervention": "Prioriser les objectifs essentiels",
                "rationale": "Assurer l'apprentissage des concepts clés"
            }
        ]

def fix_empty_decision_points(filename):
    """Fix empty decision points in a file"""
    print(f"\n📝 Processing: {filename}")
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ JSON Error: {e}")
        return False
    
    # Check if decisionPoints exists and is empty
    if 'decisionPoints' in data and isinstance(data['decisionPoints'], list) and len(data['decisionPoints']) == 0:
        # Fill with appropriate decision points
        data['decisionPoints'] = get_decision_points_for_subject(filename)
        
        # Save the file
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Added {len(data['decisionPoints'])} decision points")
        return True
    else:
        print(f"ℹ️ Decision points already exist or not found")
        return False

def main():
    """Main function to fix all empty decision points"""
    print("="*60)
    print("🎯 FILLING EMPTY DECISION POINTS")
    print("="*60)
    
    # List of files with empty decision points
    files_to_fix = [
        'generated-lessons/arts-visuels/art-environnemental-printanier-full.json',
        'generated-lessons/arts-visuels/aventure-lignes-formes-full.json',
        'generated-lessons/arts-visuels/exploration-3d-full.json',
        'generated-lessons/arts-visuels/fetes-hivernales-full.json',
        'generated-lessons/arts-visuels/magie-couleurs-full.json',
        'generated-lessons/arts-visuels/notre-galerie-art-francaise-full.json',
        'generated-lessons/arts-visuels/premiers-pas-artistiques-full.json',
        'generated-lessons/arts-visuels/techniques-artistiques-avancees-full.json',
        'generated-lessons/arts-visuels/textures-materiaux-full.json',
        'generated-lessons/francais/communication-creative-full.json',
        'generated-lessons/francais/exploration-de-textes-full.json',
        'generated-lessons/francais/famille-full.json',
        'generated-lessons/francais/jeunes-auteurs-creatifs-full.json',
        'generated-lessons/francais/notre-annee-francaise-full.json',
        'generated-lessons/mathematiques/addition-jusqua-10-full.json',
        'generated-lessons/mathematiques/nombres-0-10-full.json',
        'generated-lessons/mathematiques/soustraction-full.json'
    ]
    
    fixed_count = 0
    for filepath in files_to_fix:
        if os.path.exists(filepath):
            if fix_empty_decision_points(filepath):
                fixed_count += 1
        else:
            print(f"⚠️ File not found: {filepath}")
    
    # Final summary
    print("\n" + "="*60)
    print(f"🎉 COMPLETE! Fixed {fixed_count} files with decision points")
    print("="*60)
    
    # Verify
    print("\n📊 Final verification...")
    remaining = 0
    for filepath in files_to_fix:
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                data = json.load(f)
                if 'decisionPoints' in data and len(data['decisionPoints']) == 0:
                    remaining += 1
                    print(f"  ⚠️ Still empty: {filepath}")
    
    if remaining == 0:
        print("✅ All decision points successfully filled!")
    else:
        print(f"⚠️ {remaining} files still have empty decision points")

if __name__ == "__main__":
    main()