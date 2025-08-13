import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingLesson() {
  console.log('🔧 ADDING MISSING LESSON FOR JUNE 3, 2026');
  console.log('=' .repeat(50));

  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Citoyens responsables' }
  });

  if (!unit) {
    console.error('❌ Unit not found');
    return;
  }

  // Create the missing lesson for June 3
  const lesson = await prisma.eTFOLessonPlan.create({
    data: {
      userId: 1,
      unitPlanId: unit.id,
      title: 'Travailler en équipe',
      titleFr: 'Travailler en équipe',
      date: new Date('2026-06-03'),
      duration: 45,
      grade: 1,
      subject: 'Sciences humaines',
      language: 'Français',
      
      mindsOn: `
🎯 La chaîne de coopération (10 min)

Activité interactive : Les élèves forment un cercle et doivent passer un hula-hoop autour du cercle sans se lâcher les mains.

Discussion :
- "Qu'est-ce qui était difficile?"
- "Comment avez-vous réussi?"
- "Pourquoi le travail d'équipe est-il important?"

Connexion : "Aujourd'hui, nous allons apprendre comment bien travailler en équipe pour notre grande foire!"
      `,
      mindsOnFr: `
🎯 La chaîne de coopération (10 min)

Activité interactive : Les élèves forment un cercle et doivent passer un hula-hoop autour du cercle sans se lâcher les mains.

Discussion :
- "Qu'est-ce qui était difficile?"
- "Comment avez-vous réussi?"
- "Pourquoi le travail d'équipe est-il important?"

Connexion : "Aujourd'hui, nous allons apprendre comment bien travailler en équipe pour notre grande foire!"
      `,
      
      action: `
📚 Développer nos compétences d'équipe (28 min)

1. Les rôles dans une équipe (8 min)
- Présenter les différents rôles : Leader, Secrétaire, Gardien du temps, Présentateur
- Chaque rôle a des responsabilités spéciales
- Utiliser des cartes visuelles pour illustrer

2. Pratique en petits groupes (10 min)
- Diviser la classe en équipes de 4
- Défi : Construire la plus haute tour avec des blocs
- Chaque élève a un rôle assigné
- Observer comment ils collaborent

3. Stratégies de communication (10 min)
- Enseigner les phrases clés :
  * "J'ai une idée..."
  * "Qu'est-ce que tu penses de..."
  * "Pouvons-nous essayer..."
  * "Bon travail!"
- Pratiquer l'écoute active
- Résoudre les désaccords pacifiquement

Activité de consolidation :
- Chaque équipe planifie une partie de la foire
- Utiliser les rôles et stratégies apprises
- Créer une affiche de leur plan d'équipe
      `,
      actionFr: `
📚 Développer nos compétences d'équipe (28 min)

1. Les rôles dans une équipe (8 min)
- Présenter les différents rôles : Leader, Secrétaire, Gardien du temps, Présentateur
- Chaque rôle a des responsabilités spéciales
- Utiliser des cartes visuelles pour illustrer

2. Pratique en petits groupes (10 min)
- Diviser la classe en équipes de 4
- Défi : Construire la plus haute tour avec des blocs
- Chaque élève a un rôle assigné
- Observer comment ils collaborent

3. Stratégies de communication (10 min)
- Enseigner les phrases clés :
  * "J'ai une idée..."
  * "Qu'est-ce que tu penses de..."
  * "Pouvons-nous essayer..."
  * "Bon travail!"
- Pratiquer l'écoute active
- Résoudre les désaccords pacifiquement

Activité de consolidation :
- Chaque équipe planifie une partie de la foire
- Utiliser les rôles et stratégies apprises
- Créer une affiche de leur plan d'équipe
      `,
      
      consolidation: `
🎯 Réflexion sur le travail d'équipe (7 min)

Cercle de partage :
- Chaque équipe présente une chose qui a bien fonctionné
- Identifier un défi et comment ils l'ont surmonté

Auto-évaluation avec pouces :
- 👍 J'ai bien écouté mes coéquipiers
- 👍 J'ai partagé mes idées
- 👍 J'ai respecté mon rôle

Préparation pour demain :
- "Demain, nous utiliserons ces compétences pour planifier notre foire!"
- Distribuer les badges de rôles pour la foire
      `,
      consolidationFr: `
🎯 Réflexion sur le travail d'équipe (7 min)

Cercle de partage :
- Chaque équipe présente une chose qui a bien fonctionné
- Identifier un défi et comment ils l'ont surmonté

Auto-évaluation avec pouces :
- 👍 J'ai bien écouté mes coéquipiers
- 👍 J'ai partagé mes idées
- 👍 J'ai respecté mon rôle

Préparation pour demain :
- "Demain, nous utiliserons ces compétences pour planifier notre foire!"
- Distribuer les badges de rôles pour la foire
      `,
      
      learningGoals: `
- Je peux identifier les différents rôles dans une équipe
- Je peux communiquer respectueusement avec mes coéquipiers
- Je peux contribuer positivement au travail d'équipe
- Je peux résoudre des conflits de manière pacifique
      `,
      learningGoalsFr: `
- Je peux identifier les différents rôles dans une équipe
- Je peux communiquer respectueusement avec mes coéquipiers
- Je peux contribuer positivement au travail d'équipe
- Je peux résoudre des conflits de manière pacifique
      `,
      
      materials: [
        "Hula-hoop pour l'activité d'ouverture",
        'Blocs de construction',
        'Cartes de rôles visuelles',
        'Affiches et marqueurs',
        'Badges de rôles pour la foire',
        'Chronomètre'
      ],
      
      accommodations: {
        visual: [
          'Cartes de rôles avec images et couleurs',
          'Démonstrations visuelles des stratégies',
          'Affiches de référence pour les phrases clés'
        ],
        kinesthetic: [
          'Activité physique avec hula-hoop',
          'Construction pratique avec blocs',
          'Mouvements pour les rôles'
        ],
        auditory: [
          'Instructions verbales claires',
          'Répétition des phrases clés en groupe',
          'Signaux sonores pour les transitions'
        ],
        cognitive: [
          'Rôles simplifiés au besoin',
          "Partenaire de soutien dans l'équipe",
          'Tâches adaptées selon les capacités'
        ]
      },
      
      modifications: {
        advanced: [
          "Rôle de facilitateur pour aider d'autres équipes",
          "Créer un guide de travail d'équipe",
          'Résoudre des défis de collaboration plus complexes'
        ],
        struggling: [
          'Commencer avec des équipes de 2',
          'Rôles plus simples avec moins de responsabilités',
          'Support visuel supplémentaire pour la communication'
        ],
        ell: [
          'Cartes de phrases en anglais et français',
          'Gestes pour accompagner la communication',
          'Partenaire bilingue pour support'
        ]
      },
      
      assessmentType: "Formative - Observation du travail d'équipe",
      assessmentNotes: `
Observer et noter :
- La participation de chaque élève dans son rôle
- L'utilisation des stratégies de communication enseignées
- La résolution de conflits
- La contribution au produit final de l'équipe

Grille d'observation :
□ Assume son rôle avec responsabilité
□ Écoute activement les autres
□ Partage ses idées respectueusement
□ Aide à résoudre les problèmes
□ Encourage ses coéquipiers
      `,
      
      isSubFriendly: true,
      subNotes: `
📋 PLAN DE SUPPLÉANCE - Travailler en équipe

Bonjour! Cette leçon porte sur le développement des compétences de travail d'équipe pour préparer la foire de citoyenneté.

Matériel prêt :
✓ Cartes de rôles dans le bac bleu
✓ Blocs de construction sur l'étagère
✓ Badges de rôles dans l'enveloppe marquée "FOIRE"

Routine :
1. Commencer avec l'activité du hula-hoop (ou alternative : faire une chaîne humaine pour passer une balle)
2. Enseigner les 4 rôles d'équipe avec les cartes visuelles
3. Activité de construction en équipes
4. Pratiquer les phrases de communication affichées

Notes importantes :
- Les équipes pour la foire sont déjà formées (liste sur mon bureau)
- Certains élèves peuvent avoir besoin d'aide pour comprendre leur rôle
- Si des conflits surviennent, référer aux stratégies affichées

Comportement :
- Rappel du signal de silence (main levée)
- Les élèves connaissent la routine des transitions
- Utiliser le système de points d'équipe pour la motivation

Fin de journée :
- Distribuer les badges de rôles (1 par élève)
- Rappeler que demain ils planifient la foire
      `,
      
      performanceOpportunities: `
Démonstration des compétences de collaboration :
- Leadership dans l'assignation et la coordination des rôles
- Communication claire et respectueuse
- Résolution créative de problèmes en équipe
- Présentation du plan d'équipe à la classe
      `,
      
      differentiationStrategies: {
        process: [
          'Choix du niveau de complexité du défi de construction',
          'Options pour démontrer la compréhension (verbal, visuel, kinesthésique)',
          'Temps flexible pour compléter les activités'
        ],
        content: [
          'Rôles adaptés selon les forces de chaque élève',
          'Support visuel variable selon les besoins',
          'Complexité des tâches ajustée'
        ],
        product: [
          "Différentes façons de présenter le plan d'équipe",
          "Options créatives pour l'affiche",
          "Choix dans la démonstration du travail d'équipe"
        ]
      }
    }
  });

  console.log('✅ Added missing lesson:', lesson.title);
  console.log('📅 Date:', lesson.date.toLocaleDateString());
  console.log('\n✨ Unit now has 52 complete lessons!');
}

addMissingLesson()
  .catch(console.error)
  .finally(() => prisma.$disconnect());