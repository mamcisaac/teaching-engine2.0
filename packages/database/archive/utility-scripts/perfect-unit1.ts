#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectUnit1() {
  try {
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    const fpsLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Formation personnelle et sociale'
      }
    });
    
    const unit1 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: fpsLRP.id,
        titleFr: 'Moi et ma santé'
      }
    });

    const perfectUnit1 = `
**UNITÉ 1: MOI ET MA SANTÉ**
*17 leçons | 7 semaines | Septembre-Octobre*

**QUESTION ESSENTIELLE:**
Comment puis-je prendre soin de mon corps et développer des habitudes qui me gardent en santé?

**COMPRÉHENSIONS DURABLES:**
• Mon corps est unique et spécial, et j'ai la responsabilité d'en prendre soin
• Les habitudes quotidiennes de santé me permettent de grandir fort et intelligent
• Je peux faire des choix qui protègent ma santé maintenant et dans le futur

**ATTENTES CURRICULAIRES:**
• **FPS1 (70% - 12 leçons):** Démontrer une compréhension des pratiques contribuant à sa santé physique
• **FPS4 (30% - 5 leçons):** Utiliser ses connaissances pour développer son autonomie en santé

**CADRE PÉDAGOGIQUE ETFO:**
Chaque période de 45 minutes suit la structure:
• **Mise en situation (8-10 min):** Activation des connaissances, connexion personnelle
• **Action (25-30 min):** Exploration active, pratique guidée, application
• **Consolidation (7-10 min):** Réflexion, portfolio, engagement personnel

**PROGRESSION D'APPRENTISSAGE:**
*Semaines 1-2:* Conscience de soi et identité corporelle
*Semaines 3-4:* Hygiène personnelle et routines quotidiennes  
*Semaines 5-6:* Nutrition, mouvement et énergie
*Semaine 7:* Intégration et célébration des apprentissages

**VOCABULAIRE ESSENTIEL:**
santé, corps, hygiène, brosser, laver, nutritif, exercice, repos, grandir, fort, 
propre, sécuritaire, habitude, routine, choisir, décider, capable, responsable

**ÉVALUATION AUTHENTIQUE:**
• **Observations quotidiennes:** Grille simple des habitudes pratiquées
• **Portfolio mensuel:** Photos et dessins montrant application des apprentissages
• **Auto-évaluation visuelle:** Échelles émojis pour réflexion personnelle
• **Démonstrations pratiques:** Montrer techniques apprises (brossage, lavage mains)
• **Communication famille:** Rapport bi-mensuel avec preuves d'apprentissage

**DIFFÉRENCIATION INTÉGRÉE:**
• **Soutien intensif:** Partenaire constant, objectifs modifiés (3 habitudes au lieu de 5), supports visuels permanents
• **Soutien modéré:** Aide ponctuelle, choix de 2 façons de démontrer compréhension
• **Extension:** Recherche approfondie, mentorat de pairs, création de ressources pour classe

**FLEXIBILITÉ CONCRÈTE:**

*Semaine de 4 jours (lundi férié):*
- Combiner leçons 3-4 sur hygiène en station de 60 minutes
- Reporter auto-évaluation portfolio à semaine suivante

*Sortie scolaire imprévue:*
- Intégrer observations santé durant sortie (ex: lavage mains pique-nique)
- Ajuster timeline en condensant révision fin d'unité

*Absence enseignant (suppléant):*
- Bac préparé avec matériel trié par leçon
- Plans simplifiés 1-page avec scripts phrases clés
- Activités alternatives ne nécessitant pas expertise santé

*Intempéries (récréation intérieure):*
- Transformer activités mouvement en exercices classe
- Utiliser vidéos de secours préparées sur hygiène

*Cas COVID ou maladie dans classe:*
- Emphase supplémentaire sur hygiène préventive
- Intégration naturelle des gestes barrières comme extension

**RESSOURCES ESSENTIELLES:**
• Littérature jeunesse sur la santé et le corps
• Matériel: Miroirs incassables, brosses à dents factices, savon, affiches corps
• Technologie: Vidéos éducatives santé (liens préparés), timer visuel
• Communauté: Infirmière scolaire (visite semaine 4), parent professionnel santé

**INTÉGRATION INTERDISCIPLINAIRE:**
• **Français:** Vocabulaire santé dans contexte authentique, communication orale
• **Mathématiques:** Compter brossage 2 min, graphiques habitudes classe
• **Sciences:** Corps humain, croissance, besoins fondamentaux
• **Arts:** Autoportraits, affiches santé, chansons hygiène

**CONSIDÉRATIONS SPÉCIALES:**
• Sensibilité culturelle: Respect des pratiques familiales diverses en hygiène
• Approche trauma-informed: Positif sans jugement sur habitudes actuelles
• Allergies: Vérification produits hygiène, alternatives sans parfum
• Développement: Reconnaissance que autonomie varie selon maturité individuelle

**INDICATEURS DE SUCCÈS:**
□ 80% élèves démontrent 3+ habitudes santé autonomes
□ Portfolio montre progression septembre vers octobre
□ Familles rapportent application maison
□ Engagement quotidien routines classe
□ Vocabulaire santé utilisé spontanément`;

    await prisma.unitPlan.update({
      where: { id: unit1.id },
      data: { 
        description: perfectUnit1,
        successCriteria: {
          unitPlanPerfect: true,
          essentialQuestions: true,
          etfoFrameworkVisible: true,
          assessmentFramework: true,
          concreteFlexibility: true,
          frenchConsistent: true,
          differentiationClear: true,
          interdisciplinary: true,
          traumaInformed: true,
          indicatorsOfSuccess: true
        }
      }
    });
    
    console.log('✅ Unit 1 perfected with all planning elements');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectUnit1();