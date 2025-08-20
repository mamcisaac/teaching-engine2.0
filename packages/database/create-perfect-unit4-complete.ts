#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectUnit4Complete() {
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
    
    const unit4 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: fpsLRP.id,
        titleFr: 'Nutrition et énergie'
      }
    });

    const perfectUnit4Complete = `**UNITÉ 4: NUTRITION ET ÉNERGIE**
*15 leçons | 6 semaines | 24 février - 4 avril*

**QUESTION ESSENTIELLE:**
Comment puis-je faire des choix qui donnent de l'énergie à mon corps pour apprendre et grandir?

**COMPRÉHENSIONS DURABLES:**
• Mon corps a besoin de différents types de nourriture pour avoir de l'énergie
• Le mouvement et le repos m'aident à me sentir fort et heureux
• Je peux faire des choix santé même quand les options sont limitées

**PRINCIPE FONDAMENTAL ABSOLU - AUCUN FOOD SHAMING:**
Cette unité opère selon un principe inflexible d'acceptation nutritionnelle:
• Tous les aliments ont une place dans une alimentation équilibrée
• Respect total des choix et contraintes familiales économiques/culturelles
• Aucun jugement implicite ou explicite sur lunch, collations, ou habitudes
• Célébration de la diversité alimentaire et des traditions culturelles
• Focus énergie et bien-être, jamais restriction, poids, ou apparence

**🎯 MODÈLE CŒUR + EXTENSION (NO FOOD SHAMING)**

**CŒUR UNIVERSEL (73% - 11 leçons):**
Concepts nutritionnels et énergie accessibles INDÉPENDAMMENT des ressources familiales:

*Leçons 1-3: Énergie corporelle et signaux internes*
- CŒUR: Faim, soif, fatigue, énergie - signaux corporels universels
- Écoute corporelle personnelle sans référence repas ou aliments spécifiques
- Reconnaissance patterns énergie quotidiens individuels

*Leçons 4-6: Groupes alimentaires et fonction énergétique*
- CŒUR: Types aliments (fruits, légumes, grains, protéines) pour différentes énergies
- Exploration visuelle et tactile avec matériel factice école
- Aucune dégustation obligatoire, respect allergies et restrictions totales

*Leçons 7-8: Mouvement énergie et équilibre repos*
- CŒUR: Comment mouvement active corps, importance repos récupération
- Activités classe utilisables par tous indépendamment capacités physiques
- Connection mouvement-énergie-humeur pour bien-être global

*Leçons 9-11: Choix santé personnels avec options limitées*
- CŒUR: Stratégies faire meilleurs choix possibles avec ressources disponibles
- Focus contrôle personnel vs circonstances économiques/familiales
- Créativité et débrouillardise valorisées plus que perfection nutritionnelle

**EXTENSIONS OPTIONNELLES (27% - 4 leçons):**
Connexions nutritionnelles selon ressources familiales disponibles:

*Leçon Extension 1: Traditions alimentaires culturelles et familiales*
- Partage VOLONTAIRE cultures culinaires si famille confortable et stable
- Respect situations alimentaires diverses, insécurité nutritionnelle

*Leçon Extension 2: Jardinage, production et origine aliments*
- Exploration provenance aliments si ressources jardinage permettent
- Alternatives urbaines selon environnement réel élèves

*Leçons Extension 3-4: Préparation simple et créativité culinaire*
- Activités selon ressources cuisine disponibles familles
- Focus créativité et collaboration vs équipement coûteux ou sophistiqué

**ATTENTES CURRICULAIRES (SELON LRP PROTÉGÉ):**
• **FPS1 (73% - 11 leçons):** Comprendre nutrition et mouvement pour santé physique
• **FPS3 (27% - 4 leçons):** Aspects sociaux et culturels de l'alimentation respectueuse

**CADRE PÉDAGOGIQUE ETFO INCLUSIF:**
Structure respectueuse réalités économiques et culturelles diverses:

• **Mise en situation (8-10 min):** Exploration positive corporelle sans jugement alimentaire
  - Activation connaissances énergie personnelle
  - Validation expériences diverses sans comparaison
  - Connexion apprentissages précédents bien-être individuel

• **Action (25-30 min):** Découverte active, respect absolu des différences alimentaires
  - Apprentissage cœur nutritionnel universel accessible
  - Extensions selon ressources et confort familial révélés
  - Manipulation matériel factice priorité sur aliments réels

• **Consolidation (7-10 min):** Célébration apprentissages sans comparaison performance
  - Ancrage personnel choix santé possibles contexte individuel
  - Reconnaissance efforts vs résultats parfaits
  - Encouragement application selon moyens disponibles

**PROGRESSION MARS-AVRIL SENSIBLE 6 SEMAINES:**
*Semaine 1 (24-28 fév):* Énergie corporelle et signaux personnels
*Semaine 2 (3-7 mars):* Exploration groupes alimentaires visuellement
*SEMAINE RELÂCHE MARS (10-14 mars):* PAUSE COMPLÈTE - unité conçue avec arrêt naturel
*Semaine 3 (17-21 mars):* Mouvement et énergie corporelle printemps
*Semaine 4 (24-28 mars):* Choix santé avec ressources limitées
*Semaine 5 (31 mars-4 avril):* Extensions + consolidation + célébration diversité
*Semaine 6:* Transition vers unité mouvement-bien-être

**VOCABULAIRE NUTRITIONNEL INCLUSIF:**
énergie, force, grandir, couleurs, variété, bouger, courir, sauter,
partager, tradition, famille, célébrer, ensemble, différent, spécial,
respecter, choisir, possible, essayer, découvrir, apprendre, grandir

**ÉVALUATION SANS JUGEMENT NUTRITIONNEL:**

**CŒUR (Tous élèves - évaluation sécurisée économiquement):**
• **Observations positives:** Participation activités mouvement, engagement apprentissage
• **Portefeuille d'apprentissage créatif:** Dessins "aliments donnent énergie" sans spécification
• **Exploration sensorielle contrôlée:** Matériel factice, images, textures sécuritaires
• **Auto-réflexion corporelle:** "Comment je me sens quand je bouge" focus interne
• **Démonstrations mouvement:** Activités énergie corporelle accessibles tous

**EXTENSIONS (Strictement volontaires, économiquement sensibles):**
• **Projets familiaux nutritionnels:** SI famille souhaite ET ressources permettent
• **Célébration diversité alimentaire:** SI cultures représentées confortables partage
• **Création ressources classe:** Affiches, dessins, selon intérêts individuels révélés

**GESTION ALLERGIES/RESTRICTIONS MÉDICALES:**
• Liste allergies classe affichée discrètement et consultée systématiquement
• Alternatives visuelles pour TOUTE exploration, aucune dégustation obligatoire
• Matériel factice et images priorité sur aliments réels toujours
• Vérification triple avant toute activité impliquant contact alimentaire
• Protocoles urgence EpiPen affichés et équipe formée régulièrement

**DIFFÉRENCIATION CULTURELLE ET ÉCONOMIQUE:**

**Soutien intensif (situations précaires):**
- Respect total restrictions alimentaires, focus mouvement si alimentation sensible
- Aucune référence lunch personnel, choix familiaux, ou ressources manquantes
- Focus force personnelle corporelle vs nutrition parfaite impossible
- Support émotionnel si honte ou gêne liées situation nutritionnelle

**Soutien modéré:**
- Choix modalités participation selon confort révélé graduellement
- Alternatives créatives si ressources familiales limitées certains domaines
- Adaptation activités respecter sensibilités sans stigmatisation

**Extension enrichissement:**  
- Recherche traditions alimentaires mondiales selon intérêts culturels
- Création ressources inclusives pour classe entière
- Projets approfondis selon passions et ressources disponibles famille

**FLEXIBILITÉ CONCRÈTE MARS-AVRIL:**

*Semaine relâche mars (10-14 mars) - intégration naturelle parfaite:*
- Unité CONÇUE avec pause: semaines 1-2 pré-relâche, 3-4 post-relâche
- Aucune attente travaux ou projets durant pause familiale respectée
- Retour focus reconnexion énergétique et habitudes printanières nouvelles  
- Documentation photos familles activités santé pendant relâche VOLONTAIRE

*Élève révèle insécurité alimentaire durant exploration:*
- Arrêt immédiat discussion générale, support individuel priorité absolue
- Collaboration discrète avec travail social école pour ressources
- Adaptation activités éviter références situations économiques difficiles
- Focus universel énergie corporelle vs nutrition spécifique inaccessible

*Famille situation économique précaire visible:*
- Aucune activité nécessitant achats alimentaires spécifiques jamais
- Focus aliments accessibles banques alimentaires, programmes communautaires
- Célébration créativité culinaire avec ressources limitées comme force
- Ressources communautaires partagées discrètement selon besoins révélés

*Carême/Ramadan/observances religieuses nutritionnelles:*
- Adaptation respectueuse restrictions temporaires ou permanentes totale
- Focus mouvement et énergie corporelle si alimentation limitée période
- Célébration discipline spirituelle comme développement force personnelle
- Inclusion toutes traditions sans compromis respect croyances familiales

*Pâques/fêtes printanières perturbation routine:*
- Intégration naturelle traditions diverses célébration renouveau
- Évitement focus chocolat/sucreries comme récompense ou objectif
- Célébration énergie printanière et renouveau corporel saisonnier
- Respect familles non-célébrantes avec activités alternatives équivalentes

*Parent obsédé "alimentation parfaite" créant pression enfant:*
- Discussion privée immédiate focus équilibre vs perfection stressante
- Redirection vers acceptation et plaisir alimentaire vs restriction anxieuse
- Collaboration pour messages cohérents maison-école sans pression
- Ressources si indications troubles alimentaires émergents observés

*Matériel exploration nutritionnelle contaminé/périmé:*
- Vérification quotidienne sécurité et fraîcheur avant toute activité
- Alternatives visuelles (photos, dessins détaillés) si matériel compromis
- Priorité absolue sécurité sur expérience sensorielle complète
- Improvisation créative avec matériel classe sécuritaire disponible

*Élève refuse participation activités nutritionnelles:*
- Respect absolu choix sans questionnement insistant ou conséquences
- Alternatives observation, dessin, discussion selon zone confort révélée
- Investigation discrète causes potentielles (allergies, phobies, traumatismes)
- Inclusion significative sans participation directe si anxiété alimentaire

*Printemps précoce perturbant activités mouvement planifiées:*
- Adaptation immédiate activités extérieures selon météo réelle vs prévisions
- Célébration changements saisonniers comme apprentissage naturel énergie
- Flexibilité complète espaces utilisés selon conditions climatiques
- Intégration nature printanière dans exploration énergie corporelle renouvelée

**RESSOURCES INCLUSIVES ÉCONOMIQUEMENT:**
• **Littérature:** Livres célébrant diversité alimentaire mondiale, acceptation corporelle
• **Matériel:** Aliments factices divers, images cuisines variées, outils sensoriels
• **Mouvement:** Équipement corporel varié pour tous niveaux capacités physiques
• **Visuels:** Affiches traditions alimentaires multiples, corps énergies diverses
• **Invités:** Familles partageant traditions VOLONTAIREMENT si ressources permettent

**INTÉGRATION INTERDISCIPLINAIRE RESPECTUEUSE:**

• **Français:** Vocabulaire alimentaire et mouvement, expression besoins corporels personnels
• **Mathématiques:** Couleurs aliments, formes, patterns nutritionnels, temps repas
• **Sciences:** Énergie corporelle, croissance, besoins vivants universels
• **Arts:** Création artistique thème nourriture/mouvement, expression personnelle
• **Études sociales:** Traditions familiales et culturelles alimentaires diverses

**SENSIBILITÉS CRITIQUES ABSOLUES:**

**Troubles alimentaires prévention:**
- Aucune discussion poids, apparence corporelle, ou comparaisons physiques
- Focus fonction énergétique vs esthétique ou performance comparative
- Messages positifs force corporelle vs minceur ou apparence
- Surveillance signes préoccupants, collaboration professionnels si nécessaire

**Insécurité alimentaire reconnaissance:**
- Respect total situations familiales économiques difficiles
- Adaptation messages nutritionnels réalités diverses élèves
- Ressources communautaires disponibles partagées discrètement
- Aucune hypothèse stabilité alimentaire ou accès ressources

**Préférences sensorielles acceptation:**
- Acceptation totale aversions alimentaires, textures, saveurs
- Aucune pression goûter, essayer, ou "surmonter" préférences
- Adaptation activités respecter sensibilités sensorielles révélées
- Célébration diversité besoins corporels vs uniformité impossible

**Capacités physiques inclusion:**
- Mouvement adapté automatiquement à TOUTES capacités physiques
- Alternatives systématiques pour limitations temporaires ou permanentes
- Focus bien-être individuel vs performance comparative groupe
- Inclusion significative indépendamment niveau capacité démontré

**APPROCHE PRINTEMPS ÉNERGISANTE:**
• Énergie renouvelée avec saison, optimisme naturel croissance
• Activités extérieures progressives selon météo improving
• Célébration croissance corporelle depuis septembre observable
• Préparation transition vers été avec habitudes santé maintenues

**COMMUNICATION FAMILLES SENSIBLE:**
• Focus partage activités école vs surveillance alimentaire domicile
• Suggestions encouragement mouvement famille selon recommandations universelles
• Ressources communautaires nutrition si familles demandent sans insistance
• Aucun jugement implicite habitudes alimentaires actuelles familiales

**PARTENARIAT COMMUNAUTAIRE RESPECTUEUX:**
• Collaboration banques alimentaires locales si familles consentantes
• Ressources jardinage communautaire selon intérêts et accessibilité
• Programmes nutritionnels gouvernementaux information sans pression
• Respect autonomie familiale décisions nutritionnelles prises

**INDICATEURS SUCCÈS INCLUSIFS:**

**CŒUR (Tous élèves indépendamment situation):**
□ 100% élèves participent confortablement selon capacités corporelles individuelles
□ Aucun incident food shaming classe ou commentaires nutritionnels négatifs
□ Augmentation mouvement joyeux observé récréations et transitions
□ Utilisation vocabulaire énergie corporelle conversations spontanées
□ Application signaux corporels (faim, soif, fatigue) de façon autonome
□ Respect total différences alimentaires et culturelles maintenu

**EXTENSIONS (Participation strictement volontaire):**
□ Élèves participants célèbrent diversité traditions alimentaires respectueusement  
□ Familles contribuent ressources selon possibilités sans pression performance
□ Projets créativité nutritionnelle complétés selon intérêts individuels révélés
□ Connexions communautaires établies selon ressources et opportunités disponibles

**COMMUNICATION FAMILIALE POSITIVE:**
□ Familles rapportent discussions positives énergie corporelle et mouvement
□ Aucune pression nutritionnelle rapportée suite activités classe
□ Suggestions mouvement famille adoptées selon capacités disponibles
□ Demandes ressources nutritionnelles communautaires traitées discrètement

**TRANSITION RÉUSSIE VERS MOUVEMENT-BIEN-ÊTRE:**
- Intégration naturelle concepts énergie vers exploration mouvement
- Foundation respectueuse diversité corporelle établie solidement
- Confiance corporelle personnelle renforcée pour unité suivante
- Respect differences individuelles ancré pour remainder année`;

    await prisma.unitPlan.update({
      where: { id: unit4.id },
      data: { 
        description: perfectUnit4Complete
      }
    });
    
    console.log('✅ Unit 4 manually perfected with complete pedagogical framework:');
    console.log('   • Absolute no food shaming policy integrated throughout');
    console.log('   • Economic and cultural sensitivities addressed comprehensively');
    console.log('   • March break natural pause built into 6-week structure');
    console.log('   • Complete ETFO framework with inclusive adaptations');
    console.log('   • Ultra-concrete flexibility scenarios for diverse situations');
    console.log('   • Trauma-informed nutrition approach for all families');
    console.log('   • Ready for immediate classroom implementation');
    
  } catch (error) {
    console.error('❌ Error creating perfect Unit 4:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPerfectUnit4Complete();