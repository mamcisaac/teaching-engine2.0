#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectUnit1Complete() {
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
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: fpsLRP.id },
      orderBy: { startDate: 'asc' }
    });
    
    const unit1 = units[0]; // First unit by start date

    const perfectUnit1Complete = `**UNITÉ 1: MOI ET MA SANTÉ**
*17 leçons | 7 semaines | 2 septembre - 17 octobre (DÉBUT D'ANNÉE)*

**QUESTION ESSENTIELLE:**
Comment puis-je développer des habitudes quotidiennes qui gardent mon corps et mon esprit en santé?

**COMPRÉHENSIONS DURABLES:**
• Mon corps grandit et change, et j'ai le pouvoir de l'aider à rester fort et en santé
• Les habitudes que je développe maintenant m'aideront toute ma vie
• Prendre soin de moi me donne plus d'énergie pour apprendre et jouer

**CONTEXTE DÉBUT D'ANNÉE CRITIQUE:**
Cette unité établit les fondements pour toute l'année scolaire en Grade 1:
• Première impression Formation personnelle et sociale en français
• Établissement routines santé classe et normes comportementales
• Construction confiance et sécurité émotionnelle pour apprentissages futurs
• Transition maison-école avec habitudes santé positives

**🎯 MODÈLE CŒUR + EXTENSION (TRAUMA-INFORMED FOUNDATION)**

**CŒUR UNIVERSEL (71% - 12 leçons):**
Habitudes santé fondamentales accessibles à TOUS, indépendamment situation familiale:

*Leçons 1-3: Connaissance corporelle personnelle et croissance individuelle*
- CŒUR: Mon corps unique, parties corps en français, croissance depuis bébé
- Exploration respectueuse diversité corporelle sans comparaisons
- Focus fonction vs apparence, célébration capacités individuelles

*Leçons 4-6: Hygiène personnelle avec ressources école exclusivement*
- CŒUR: Lavage mains, brossage dents, propreté visage, vêtements propres
- Techniques utilisant uniquement ressources disponibles école
- Évitement assumptions ressources familiales (savons spéciaux, produits coûteux)

*Leçons 7-9: Nutrition et énergie basées sur signaux corporels universels*
- CŒUR: Faim, soif, énergie, fatigue - reconnaissance signaux internes
- Aucune référence lunch personnel ou choix familiaux nutritionnels
- Focus écoute corporelle vs règles nutritionnelles externes

*Leçons 10-12: Sécurité corporelle et limites personnelles avec protocols école*
- CŒUR: Limites corporelles, toucher approprié, espace personnel
- Protocols universels école pour demander aide et protection
- Empowerment personnel sans révélation expériences familiales

**EXTENSIONS OPTIONNELLES (29% - 5 leçons):**
Applications santé selon ressources et stabilité familiales:

*Leçon Extension 1: Traditions santé familiales*
- Partage VOLONTAIRE traditions familiales santé et bien-être
- Alternatives respectueuses pour situations familiales instables

*Leçon Extension 2: Helpers santé communautaires*
- Exploration métiers santé communautaires selon accessibility
- Invités potentiels: dentiste, infirmière, médecin (selon possibilités)

*Leçons Extension 3-5: Applications avancées et projets personnels*
- Recherche approfondie selon intérêts révélés individuellement
- Création ressources santé pour classe selon capacités

**ATTENTES CURRICULAIRES (SELON LRP PROTÉGÉ):**
• **FPS1 (70% - 12 leçons):** Démontrer compréhension pratiques santé personnelle de base
• **FPS4 (30% - 5 leçons):** Utiliser connaissances développer compétences personnelles autonomie

**CADRE PÉDAGOGIQUE ETFO DÉBUT D'ANNÉE:**
Structure établissant routines pour toute l'année:

• **Mise en situation (8-10 min):** Activation douce, connexion expériences personnelles
  - Welcome circle avec check-in santé émotionnelle simple
  - Activation connaissances corporelles existantes sans jugement
  - Connexion apprentissages précédents été/maison selon comfort

• **Action (25-30 min):** Exploration active santé, établissement routines
  - Apprentissage cœur santé universel accessible tous
  - Extensions selon confort et engagement révélés progressivement
  - Établissement normes classe respectueuses diversité

• **Consolidation (7-10 min):** Célébration apprentissages, planification application
  - Ancrage habitudes santé applicables immédiatement
  - Célébration efforts individuels vs comparaisons performance
  - Préparation application habitudes semaine suivante

**PROGRESSION SEPTEMBRE-OCTOBRE FOUNDATION 7 SEMAINES:**
*Semaine 1 (2-6 sept):* Accueil et connaissance corporelle respectueuse
*Semaine 2 (9-13 sept):* Hygiène personnelle avec ressources accessibles  
*Semaine 3 (16-20 sept):* Signaux corporels énergie et besoins
*Semaine 4 (23-27 sept):* Sécurité corporelle et limites personnelles
*Semaines 5-6 (30 sept-11 oct):* Extensions selon engagement + applications
*Semaine 7 (14-17 oct):* Consolidation foundation + préparation unité sécurité

**VOCABULAIRE SANTÉ ESSENTIEL GRADE 1:**
corps, grandir, fort, santé, propre, énergie, fatigue, faim, soif, dormir,
exercice, respirer, cœur, muscles, os, peau, cheveux, dents, yeux, oreilles,
habit, routine, capable, autonome, sécuritaire, limites, respecter

**ÉVALUATION DÉBUT D'ANNÉE SENSIBLE:**

**CŒUR (Tous élèves - baseline establishment):**
• **Observations discrètes:** Application habitudes hygiène classe, autonomie démonstration
• **Portfolios foundation:** Photos progression septembre-octobre, dessins évolution
• **Auto-évaluation Grade 1 simple:** Visages souriants/tristes, thermomètre santé
• **Démonstrations pratiques:** Techniques hygiène, choix santé selon zone confort
• **Expression créative:** Dessins "mon corps grandit", "mes habitudes santé"

**EXTENSIONS (Participation strictement volontaire):**
• **Projets familiaux santé:** SI famille souhaite partager traditions wellness
• **Présentations communautaires:** SI helpers santé disponibles appropriate
• **Leadership foundation:** Pour élèves démontrant maturité early Grade 1

**ÉTABLISSEMENT ROUTINES SEPTEMBRE CRITIQUES:**

**Routines Hygiène Classe:**
• Lavage mains après toilettes, avant collation, après activités salissantes
• Mouchage nez approprié avec tissues, disposal hygienique
• Rangement effets personnels espace désigné respectueusement
• Signalement besoins toilettes avec dignité préservée

**Routines Sécurité Émotionnelle:**
• Permission exprimer besoins corporels sans shame ou embarrassment
• Alternatives participation si élève inconfort avec activité corporelle
• Respect limites personnelles sans questionnement insistant
• Support inconditionnel demandes aide santé ou sécurité

**DIFFÉRENCIATION DÉBUT D'ANNÉE INCLUSIVE:**

**Soutien intensif (transition difficile):**
- Routines visuelles étape-par-étape pour chaque habit santé
- Partenaire d'aide constant pour navigation nouvelles expectations
- Focus exclusif cœur santé, extensions complètement optionnelles
- Extra time processing et adaptation selon rythme individuel révélé

**Soutien modéré (adaptation graduelle):**
- Support ponctuel établissement routines selon besoins émergents
- Cœur santé maîtrisé + extensions selon engagement personnel
- Choix modalités participation selon comfort level developed

**Extension enrichissement (adaptation rapide):**
- Maîtrise rapide routines + engagement extensions volontaires
- Rôle mentor santé pour pairs nécessitant support supplémentaire
- Projets recherche approfondis selon intérêts passion révélés

**FLEXIBILITÉ SEPTEMBRE-OCTOBRE CONCRÈTE:**

*Première semaine école (adaptation critique):*
- Permission étalement leçons 1-2 sur 2 semaines si nécessaire adaptation
- Focus comfort et sécurité émotionnelle avant contenu académique strict
- Flexibilité timing selon énergie collective et besoins individuels révélés
- Patience supplémentaire pour établissement normes nouvelles

*Action de Grâce weekend long (octobre):*
- Condensation intelligente semaine 6 sans précipitation stressante 
- Integration themes gratitude pour santé et capacités corporelles
- Messages familles continuité habitudes santé durant pause
- Retour focus reconnexion habitudes établies vs nouveaux contenus

*Élève résistance établissement habitudes hygiène:*
- Investigation respectueuse causes potentielles sans blame
- Alternatives respectueuses selon sensibilités culturelles ou médicales révélées
- Collaboration famille compréhension expectations et support maison
- Patience persistante encouragement vs enforcement punitive

*Révélations préoccupantes négligence personnelle:*
- Documentation discrète observations selon protocoles établis
- Collaboration équipe support pour évaluation besoins famille
- Provision ressources hygiène école si besoins économiques identifiés
- Mandatory reporting procedures si indicators préoccupants persistent

*Diversité corporelle sensitivities classe:*
- Celebration différences capacités, tailles, couleurs peau naturellement
- Évitement comparaisons ou comments apparence physique
- Adaptation activités pour inclusion TOUTES capacités physiques
- Messages positifs fonction corporelle vs esthétique conformité

*Suppléant non-familier routines établies septembre:*
- Protocoles simples écrits pour continuation routines santé critiques
- Élèves leaders désignés pour guidance pairs routines familières
- Bac "Septembre Santé Facile" avec matériel autonome préorganisé
- Contact titulaire disponible pour clarifications routines spécifiques

*Matériel hygiène école épuisé/indisponible:*
- Alternatives créatives objets classe pour maintenir learning objectives
- Demande administrative remplacement prioritaire ressources critiques
- Adaptation temporaire methods sans compromise safety ou dignity
- Communication famille si besoins supplementation temporaire respectueuse

*Parent concerns introduction topics corporels Grade 1:*
- Discussion transparente approche age-appropriate et trauma-informed
- Explication foundation importance établissement habits santé précoce
- Invitation observation classe pour rassurance methods utilisées
- Adaptation respectueuse selon cultural ou religious sensitivities révélées

*Élève developmental delays impactant independence habits santé:*
- Collaboration spécialistes pour strategies adaptées besoins individuels
- Support supplémentaire sans stigmatization ou ségrégation peers
- Goals réalistes selon capacités actuelles avec célébration progress
- Communication famille pour coherence approaches maison-école

**INTÉGRATION INTERDISCIPLINAIRE SEPTEMBRE:**

• **Français:** Vocabulaire corporel, expression besoins personnels respectueusement
• **Mathématiques:** Compter dents, mesurer taille, graphiques croissance
• **Sciences:** Corps comme système vivant, besoins organismes vivants
• **Arts:** Auto-portraits, expression créative identité corporelle positive
• **Études sociales:** Helpers santé communautaires, responsabilités personally

**PERSPECTIVES AUTOCHTONES MI'KMAQ INTEGRATION:**

**Seven Sacred Teachings - RESPECT (Septembre Focus):**
• Respect pour nos corps comme cadeaux Creator
• Respect diversité corporelle et capacités toutes personnes
• Respect traditions santé diverses cultures représentées classe
• Teaching stories appropriées partage Elder si disponible

**Medicine Wheel - Eastern Direction (Nouveau début):**  
• Nouveau beginning santé habits comme sunrise quotidien
• Croissance corporelle comme plants emerging spring
• Energy corporelle connection avec nature et seasons
• Traditional foods et medicine plants observation (culturally appropriate)

**Resources Culturelles:**
• Books celebration diversité corporelle et traditions santé mondiales
• Images traditions wellness diverses cultures sans appropriation
• Invitations families partager traditions santé selon comfort culturel
• Respect protocols si Elders disponibles pour teachings appropriés

**COMMUNICATION FAMILLES SEPTEMBER FOUNDATION:**

**Newsletter Première Unité:**
Chers familles,

Bienvenue à notre première unité Formation personnelle et sociale! Nous établissons foundations santé et bien-être pour toute l'année.

VOS ENFANTS APPRENNENT:
• Connaissance corporelle positive et croissance personnelle
• Habitudes hygiène utilisant ressources école disponibles  
• Écoute signaux corporels pour besoins énergie et repos

COMMENT SOUTENIR À MAISON (optionnel):
• Encourager independence habitudes hygiène existantes
• Célébrer efforts vs perfection results
• Répondre questions corporelles avec honnêteté age-appropriate

VOCABULAIRE FRANÇAIS SEPTEMBRE:
• corps (core) - body
• santé (sahn-TAY) - health  
• grandir (grahn-DEER) - to grow
• fort (fore) - strong
• propre (PRO-pruh) - clean

**Topics Sensibilité Awareness:**
Nous abordons sécurité corporelle avec approach trauma-informed prioritisant empowerment. Partage experiences strictly voluntary. Contact pour questions.

**PROTOCOLS PROFESSIONNELS SEPTEMBRE:**

**Mandatory Reporting Awareness Début Année:**
• Formation équipe complete recognition signs neglect/abuse refresh
• Protocols documentation observations concerning septembre établis
• Collaboration direction immediate si concerns émergent early year
• Resources families needing support communicated discrètement

**Trauma-Informed Foundation Establishment:**
• Environmental safety prioritized pour all students comfort
• Choices provided activities corporelles selon individual readiness
• Validation all emotions et reactions without judgment pourquoi
• Professional development continued trauma-informed practices

**ASSESSMENT AUTHENTIQUE FOUNDATION:**

**September Baseline Establishment:**
• Documentation habits santé existing students arriving septembre
• Observation capacity independence et self-care skills demonstrated
• Portfolio establishment avec photos permission et dignity maintained
• Family consultation initial besoins support ou accommodations

**October Growth Documentation:**
• Progress habits hygiène established depuis septembre compared
• Applications learning démonstrations selon individual comfort zones
• Peer interactions respectful et supportive documented positive
• Preparation unité suivante avec foundation solid established

**RESOURCES SEPTEMBRE CRITIQUES:**

• **Literature:** Livres corps positif, diversité physique, croissance normale
• **Materials:** Miroirs incassables, tissus doux, images corps diverses
• **Technology:** Timer routines, applications habits tracking age-appropriate  
• **Community:** Health nurse school, families willing partager expertise
• **Professional:** Training continue trauma-informed, cultural competency

**PREPARATION TRANSITION UNITÉ SÉCURITÉ:**

**Foundation Établie pour Octobre:**
• Habits santé personnelle established solidly et practiced confidently
• Vocabulary corporel français maîtrisé suffisamment pour communications
• Comfort discussions santé established avec teacher et peers appropriately
• Trust relationship building pour topics plus sensibles upcoming

**Bridge vers Safety Learning:**
• "Mon corps me belongs" messages introduced respectfully
• Concept adultes confiance introduced gradually et appropriately  
• Safety discussions preliminary introduced selon readiness demonstrated
• Excitement transition next learning versus anxiety change management

**INDICATEURS SUCCÈS SEPTEMBRE-OCTOBRE:**

**CŒUR (Tous élèves foundation guaranteed):**
□ 100% élèves participate activities corporelles selon individual comfort levels
□ Habits hygiène école established et practiced autonomously daily
□ Vocabulary santé français utilized conversations naturelles classroom
□ Positive associations learning corporel et santé developed clearly
□ Respect différences corporelles maintained classe entière consistently
□ Foundation trust teacher pour topics sensibles established appropriately

**EXTENSIONS (Participation volontaire enrichissement):**
□ Élèves participants share traditions culturelles santé respectfully
□ Families engage activities suggested selon ressources disponibles individually  
□ Leadership démonstration habits santé par volunteers mature appropriately
□ Connections communautaires health helpers established selon opportunities

**PROFESSIONAL READINESS TRANSITION:**
□ Teacher confidence trauma-informed approaches demonstrated consistently
□ Class community safety émotionnelle established pour topics sensibles
□ Family trust et communication established pour year-long partnership
□ Foundation year-long FPS excellence established avec standards maintained

Cette unité représente excellence foundation pour programme FPS complet, établissant base solide pour toutes apprentissages suivants année académique.`;

    await prisma.unitPlan.update({
      where: { id: unit1.id },
      data: { 
        titleFr: 'Moi et ma santé',
        title: 'Me and My Health',
        description: perfectUnit1Complete
      }
    });
    
    console.log('✅ Unit 1 manually perfected with complete pedagogical framework:');
    console.log('   • September foundation establishment for entire year');
    console.log('   • Comprehensive trauma-informed approach for body awareness');  
    console.log('   • Complete ETFO framework with routine establishment');
    console.log('   • Cultural responsiveness with Mi\'kmaq perspectives integration');
    console.log('   • Professional protocols for mandatory reporting awareness');
    console.log('   • Family communication strategies for sensitive topics');
    console.log('   • Ultra-concrete flexibility scenarios for September realities');
    console.log('   • Ready for immediate classroom implementation');
    
  } catch (error) {
    console.error('❌ Error creating perfect Unit 1:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPerfectUnit1Complete();