#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectFPSUnitsFinal() {
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
    
    console.log('🎯 CREATING ABSOLUTELY PERFECT FPS UNIT PLANS - FINAL VERSION');
    console.log('============================================================\n');
    
    // Delete existing units for fresh start
    await prisma.unitPlan.deleteMany({
      where: { longRangePlanId: fpsLRP.id }
    });
    
    console.log('✅ Cleared existing units for perfect rebuild\n');
    
    // PERFECT UNIT 1: Moi et ma santé
    const unit1 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: fpsLRP.id,
        titleFr: 'Moi et ma santé',
        title: 'Me and My Health',
        startDate: new Date('2025-09-02'),
        endDate: new Date('2025-10-17'),
        estimatedHours: 12.75, // 17 lessons × 0.75 hours
        description: `**UNITÉ 1: MOI ET MA SANTÉ**
*17 leçons | 7 semaines | 2 septembre - 17 octobre*

**QUESTION ESSENTIELLE:**
Comment puis-je développer des habitudes quotidiennes qui gardent mon corps et mon esprit en santé?

**COMPRÉHENSIONS DURABLES:**
• Mon corps grandit et change, et j'ai le pouvoir de l'aider à rester fort et en santé
• Les habitudes que je développe maintenant m'aideront toute ma vie
• Prendre soin de moi me donne plus d'énergie pour apprendre et jouer
• Je suis unique et spécial, et mes différences sont une force

**🎯 MODÈLE CŒUR + EXTENSION (TRAUMA-INFORMED)**

**CŒUR UNIVERSEL (71% - 12 leçons):**
Contenu accessible à TOUS les élèves, indépendamment de la situation familiale:
• Connaissance corporelle personnelle et croissance individuelle
• Techniques hygiène personnelle avec ressources école exclusivement
• Nutrition et énergie basées sur signaux corporels universels
• Sécurité corporelle et limites personnelles avec protocols école

**EXTENSIONS OPTIONNELLES (29% - 5 leçons):**
• Traditions santé familiales (VOLONTAIRE uniquement)
• Helpers santé communautaires selon disponibilité
• Applications avancées et projets selon intérêts

**ATTENTES CURRICULAIRES (SELON LRP PROTÉGÉ):**
• **FPS1 (70% - 12 leçons):** Démontrer compréhension pratiques santé personnelle
• **FPS4 (30% - 5 leçons):** Utiliser connaissances développer compétences personnelles

**CADRE PÉDAGOGIQUE ETFO:**
• **Mise en situation (8-10 min):** Activation connaissances, connexion expérience personnelle
• **Action (25-30 min):** Exploration active, pratique guidée, application concrète
• **Consolidation (7-10 min):** Réflexion, portefeuille d'apprentissage, engagement futur

**VOCABULAIRE ESSENTIEL:**
santé, corps, grandir, fort, hygiène, propre, énergie, habitude, routine, capable, autonome, unique, spécial, différent, respecter

**ÉVALUATION AUTHENTIQUE:**
• Observations application habitudes santé classe
• Portefeuille d'apprentissage évolutif avec photos progression
• Auto-évaluation Grade 1 avec outils visuels
• Démonstrations techniques hygiène et choix santé

**DIFFÉRENCIATION SYSTÉMATIQUE:**
• **Soutien intensif:** Partenaire constant, objectifs simplifiés, supports visuels permanents
• **Soutien modéré:** Aide ponctuelle, choix modalités, supports occasionnels
• **Extension:** Recherche approfondie, mentorat pairs, création ressources classe

**FLEXIBILITÉ CONCRÈTE:**
• Semaine écourtée Action Grâce: leçons combinées sans précipitation
• Élève malade: alternatives observation, rattrapage naturel
• Suppléant: plan simple avec matériel préparé
• Matériel manquant: alternatives créatives maintenant objectifs
• Parent inquiet: communication transparente, adaptation respectueuse

**INTÉGRATION INTERDISCIPLINAIRE:**
• **Français:** Vocabulaire corporel, expression besoins personnels
• **Mathématiques:** Mesurer croissance, compter habitudes santé
• **Sciences:** Corps comme système, besoins organismes vivants
• **Arts:** Auto-portraits positifs, expression identité créative
• **Études sociales:** Helpers santé communautaires, responsabilités

**PERSPECTIVES AUTOCHTONES - SEVEN SACRED TEACHINGS:**
• **RESPECT (Septembre):** Respecter nos corps comme cadeaux sacrés
• Medicine Wheel: Direction Est - nouveaux commencements santé
• Histoires traditionnelles sur importance prendre soin de soi
• Reconnaissance territoire Mi'kmaq et pratiques wellness ancestrales

**COMMUNICATION FAMILLES:**
• Newsletter septembre avec objectifs unité et vocabulaire clé
• Suggestions activités maison OPTIONNELLES pour renforcement
• Ressources communautaires santé partagées discrètement
• Invitation participation selon confort culturel et économique

**INDICATEURS SUCCÈS:**
□ 100% élèves démontrent habitudes hygiène autonomes école
□ Vocabulaire santé français utilisé naturellement conversations
□ Respect différences corporelles maintenu classe entière
□ Portfolio progression septembre-octobre complété tous élèves
□ Familles rapportent discussions positives santé maison`
      }
    });
    
    console.log('✅ Unit 1 created: 17 lessons (12.75 hours)');
    
    // PERFECT UNIT 2: Sécurité et protection
    const unit2 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: fpsLRP.id,
        titleFr: 'Sécurité et protection',
        title: 'Safety and Protection',
        startDate: new Date('2025-10-20'),
        endDate: new Date('2025-12-12'),
        estimatedHours: 14.25, // 19 lessons × 0.75 hours
        description: `**UNITÉ 2: SÉCURITÉ ET PROTECTION**
*19 leçons | 8 semaines | 20 octobre - 12 décembre*

**QUESTION ESSENTIELLE:**
Comment puis-je développer ma compréhension des pratiques sécuritaires et responsables?

**COMPRÉHENSIONS DURABLES:**
• Je peux apprendre des stratégies pour me garder en sécurité partout
• Demander aide à un adulte de confiance est toujours approprié et courageux
• Mon corps m'appartient et j'ai le droit de dire non
• La sécurité est une responsabilité personnelle et collective

**🎯 MODÈLE CŒUR + EXTENSION (TRAUMA-INFORMED SAFETY)**

**CŒUR UNIVERSEL (74% - 14 leçons):**
• Sécurité corporelle personnelle et limites sans révélation familiale
• Sécurité école et transport avec protocoles universels
• Urgences et premiers soins empowerment vs peur
• Prévention et adultes confiance système école

**EXTENSIONS OPTIONNELLES (26% - 5 leçons):**
• Plans familiaux (VOLONTAIRE si famille stable)
• Helpers communautaires selon disponibilité
• Applications avancées selon maturité

**ATTENTES CURRICULAIRES (CORRECTION CRITIQUE - LRP ALIGNÉ):**
• **FPS2 EXCLUSIVEMENT (100% - 19 leçons):** Démontrer compréhension pratiques sécuritaires et responsables

**NOTE CRITIQUE:** Cette unité se concentre EXCLUSIVEMENT sur FPS2. Aucun FPS4. Alignement LRP parfait.

**CADRE PÉDAGOGIQUE ETFO:**
• **Mise en situation (8-10 min):** Check-in sécurité émotionnelle, validation universelle
• **Action (27-30 min):** Apprentissage pratique empowerment, jamais fear-based
• **Consolidation (7-10 min):** Anchoring empowerment et resources disponibles

**PROTOCOLES TRAUMA-INFORMED:**
• Aucune pression révélation expériences négatives
• Empowerment focus vs fear-based approaches
• Support inconditionnel disponible constamment
• Mandatory reporting protocols si revelations inquiétantes
• Recognition trauma manifests différemment

**VOCABULAIRE SÉCURITAIRE:**
sécurité, protection, confiance, courage, aide, adulte, responsible, limites, respect, non, oui, choix, stratégies, prévention, urgence, danger

**ÉVALUATION TRAUMA-INFORMED:**
• Observations empowerment application stratégies sécurité
• Simulations contrôlées scenarios sécurité préparés
• Auto-évaluation "Je sais comment rester en sécurité"
• Démonstrations procedures urgence appropriées âge

**DIFFÉRENCIATION INCLUSIVE:**
• **Soutien intensif:** Focus exclusif empowerment, zero pressure disclosure
• **Soutien modéré:** Balance empowerment avec social learning
• **Extension:** Leadership création safe environments pour others

**FLEXIBILITÉ SÉCURITAIRE CONCRÈTE:**
• Révélation inquiétante: protocol discret, support professionnel immédiat
• Parent préoccupé: discussion transparente approach, adaptation respectueuse
• Élève anxiété: support individuel, messages rassurance constants
• Suppléant: évitement discussions sensibles, activités sécuritaires simples
• Incendie drill: intégration immediate comme apprentissage authentique

**INTÉGRATION INTERDISCIPLINAIRE:**
• **Français:** Communication besoins sécurité, vocabulaire urgence
• **Mathématiques:** Numéros urgence, distance sécuritaire, temps réaction
• **Sciences:** Corps signaux danger, environnement sécuritaire
• **Arts:** Expression sentiments sécurité, affiches prévention
• **Études sociales:** Helpers sécurité communautaires, responsabilités

**PERSPECTIVES AUTOCHTONES - SEVEN SACRED TEACHINGS:**
• **COURAGE (Octobre-Novembre):** Être brave pour rester en sécurité
• Medicine Wheel: Protection dans toutes directions
• Enseignements traditionnels sur protection communautaire
• Respect protocols sécurité territoriale Mi'kmaq

**COMMUNICATION FAMILLES SENSIBLE:**
• Notification avancée topics sécurité corporelle
• Options opt-out respectueuses disponibles
• Ressources support trauma disponibles confidentiellement
• Emphasis empowerment vs fear dans communications

**INDICATEURS SUCCÈS:**
□ 100% élèves identifient adultes confiance école
□ Stratégies sécurité démontrées avec confidence non fear
□ Vocabulaire sécurité utilisé appropriately conversations
□ Aucune augmentation anxiété liée topics sécurité
□ Protocols urgence maîtrisés niveau Grade 1 appropriate`
      }
    });
    
    console.log('✅ Unit 2 created: 19 lessons (14.25 hours)');
    
    // PERFECT UNIT 3: Émotions et relations
    const unit3 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: fpsLRP.id,
        titleFr: 'Émotions et relations',
        title: 'Emotions and Relationships',
        startDate: new Date('2026-01-06'),
        endDate: new Date('2026-02-21'),
        estimatedHours: 13.5, // 18 lessons × 0.75 hours
        description: `**UNITÉ 3: ÉMOTIONS ET RELATIONS**
*18 leçons | 7 semaines | 6 janvier - 21 février (POST-VACANCES)*

**QUESTION ESSENTIELLE:**
Comment puis-je comprendre mes émotions et créer des relations positives?

**COMPRÉHENSIONS DURABLES:**
• Toutes mes émotions sont normales et j'ai des moyens respectueux de les exprimer
• Je peux développer des amitiés saines avec écoute et gentillesse
• Les conflits peuvent être résolus paisiblement avec respect
• L'empathie m'aide à comprendre les autres

**CONTEXTE POST-VACANCES CRITIQUE:**
• Reconnexion après 2 semaines séparation
• Énergie variable janvier, blues hivernal normal
• Reconstruction liens communauté classe patience

**🎯 MODÈLE CŒUR + EXTENSION (POST-WINTER EMOTIONAL)**

**CŒUR UNIVERSEL (72% - 13 leçons):**
• Reconnaissance émotions personnelles sans obligation partage
• Autorégulation stratégies individuelles utilisables école
• Habiletés sociales communication respectueuse pairs
• Résolution conflits techniques école supervisée

**EXTENSIONS OPTIONNELLES (28% - 5 leçons):**
• Émotions familiales (VOLONTAIRE selon stabilité)
• Amitiés extrascolaires selon accessibilité
• Leadership empathie selon maturité

**ATTENTES CURRICULAIRES (SELON LRP PROTÉGÉ):**
• **FPS3 (78% - 14 leçons):** Développer habiletés relationnelles saines
• **FPS4 (22% - 4 leçons):** Utiliser compétences gérer émotions

**CADRE PÉDAGOGIQUE ETFO POST-VACANCES:**
• **Mise en situation (10 min):** Reconnexion douce, météo émotionnelle
• **Action (25-28 min):** Activités interactives, expression créative
• **Consolidation (7-10 min):** Cercle partage, validation apprentissages

**VOCABULAIRE ÉMOTIONNEL ESSENTIEL:**
émotions, sentiments, ami, amitié, partager, écouter, comprendre, empathie, respecter, aider, conflits, solutions, pardon, ensemble, gentillesse, patience, colère, tristesse, joie, peur

**ÉVALUATION POST-VACANCES SENSIBLE:**
• Observations ajustement émotionnel retour école
• Expression multiple: dessin, mouvement, mots selon confort
• Portefeuille émotions janvier-février avec progression
• Auto-évaluation thermomètre émotionnel quotidien

**DIFFÉRENCIATION POST-VACANCES:**
• **Soutien intensif:** Préparation retour, partenaire aide constant
• **Soutien modéré:** Check-ins fréquents, choix modalités
• **Extension:** Rôle mentor émotionnel, création ressources

**FLEXIBILITÉ JANVIER-FÉVRIER CONCRÈTE:**
• Première semaine: extension temps reconnexion si nécessaire
• Tempête neige: activités reconnexion priorité contenu manqué
• Saint-Valentin: transformation célébration amitiés inclusives
• Fatigue février: réduction objectifs au cœur essentiel
• Conflit majeur: opportunité apprentissage authentique médiation

**INTÉGRATION INTERDISCIPLINAIRE:**
• **Français:** Expression orale émotions, écriture sentiments
• **Mathématiques:** Graphique émotions, patterns comportements
• **Sciences:** Corps et émotions, stress et relaxation
• **Arts:** Expression créative émotions, couleurs sentiments
• **Études sociales:** Relations communautaires, résolution historique

**PERSPECTIVES AUTOCHTONES - SEVEN SACRED TEACHINGS:**
• **HONESTY (Janvier):** Être vrai avec nos sentiments
• **HUMILITY (Février):** Aider autres avec gentillesse
• Cercles de parole traditionnels pour expression
• Medicine Wheel: équilibre émotionnel quatre directions

**STRATÉGIES TRAUMA-INFORMED:**
• Prévisibilité routine pour sécurité retrouvée
• Choix participation sans conséquences négatives
• Validation toutes expériences vacances sans jugement
• Protocole clair si révélations inquiétantes

**COMMUNICATION FAMILLES:**
• Stratégies cohérentes maison-école transitions émotionnelles
• Outils gestion émotions adaptés contexte familial
• Suggestions activités famille renforcement liens hiver
• Reconnaissance défis parentaux post-fêtes normaux

**INDICATEURS SUCCÈS:**
□ 100% élèves réintégrés confortablement fin janvier
□ Vocabulaire émotionnel utilisé spontanément conversations
□ Diminution conflits observable cour récréation
□ Augmentation comportements empathiques quotidiens
□ Stratégies calme appliquées autonomement frustrations`
      }
    });
    
    console.log('✅ Unit 3 created: 18 lessons (13.5 hours)');
    
    // PERFECT UNIT 4: Nutrition et énergie
    const unit4 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: fpsLRP.id,
        titleFr: 'Nutrition et énergie',
        title: 'Nutrition and Energy',
        startDate: new Date('2026-02-24'),
        endDate: new Date('2026-04-04'),
        estimatedHours: 11.25, // 15 lessons × 0.75 hours
        description: `**UNITÉ 4: NUTRITION ET ÉNERGIE**
*15 leçons | 6 semaines | 24 février - 4 avril*

**QUESTION ESSENTIELLE:**
Comment mes choix alimentaires et d'énergie m'aident-ils à grandir sainement?

**COMPRÉHENSIONS DURABLES:**
• Mon corps a besoin de différents aliments pour énergie
• Je peux faire des choix santé même avec options limitées
• Le mouvement me donne énergie et bien-être
• Écouter mon corps m'aide à faire bons choix

**PRINCIPE ABSOLU - NO FOOD SHAMING:**
• Respect total choix et contraintes familiales
• Aucun jugement lunch, collations, habitudes
• Célébration diversité alimentaire culturelle
• Focus énergie bien-être jamais restriction

**🎯 MODÈLE CŒUR + EXTENSION (INCLUSIVE NUTRITION)**

**CŒUR UNIVERSEL (73% - 11 leçons):**
• Signaux corporels énergie universels sans référence lunch
• Groupes alimentaires fonction énergétique matériel factice
• Mouvement énergie accessible toutes capacités
• Choix santé ressources limitées créativité valorisée

**EXTENSIONS OPTIONNELLES (27% - 4 leçons):**
• Traditions alimentaires culturelles (VOLONTAIRE)
• Jardinage selon ressources disponibles
• Créativité culinaire selon possibilités

**ATTENTES CURRICULAIRES (CORRECTION LRP):**
• **FPS1 (73% - 11 leçons):** Comprendre nutrition santé physique
• **FPS4 (27% - 4 leçons):** Utiliser compétences choix personnels

**NOTE:** Correction critique - FPS4 au lieu de FPS3, aligné LRP.

**CADRE PÉDAGOGIQUE ETFO INCLUSIF:**
• **Mise en situation (8-10 min):** Exploration positive sans jugement
• **Action (25-30 min):** Découverte active, respect différences
• **Consolidation (7-10 min):** Célébration apprentissages personnels

**SEMAINE RELÂCHE INTÉGRÉE:**
Unité conçue avec pause naturelle semaine 3 (10-14 mars)

**VOCABULAIRE NUTRITIONNEL INCLUSIF:**
énergie, force, grandir, couleurs, variété, bouger, partager, tradition, famille, célébrer, ensemble, différent, spécial, respecter, choisir

**ÉVALUATION SANS JUGEMENT:**
• Observations participation activités mouvement
• Portfolio créatif "aliments donnent énergie"
• Exploration sensorielle matériel factice sécuritaire
• Auto-réflexion "Comment je me sens quand je bouge"

**DIFFÉRENCIATION ÉCONOMIQUE/CULTURELLE:**
• **Soutien intensif:** Respect restrictions, focus mouvement
• **Soutien modéré:** Alternatives créatives ressources limitées
• **Extension:** Recherche traditions mondiales intérêts

**FLEXIBILITÉ MARS-AVRIL CONCRÈTE:**
• Semaine relâche: pause naturelle intégrée structure
• Carême/Ramadan: adaptation respectueuse restrictions
• Insécurité alimentaire: support discret, ressources
• Pâques: célébration diversité sans focus chocolat
• Allergies: vérification triple, alternatives visuelles

**INTÉGRATION INTERDISCIPLINAIRE:**
• **Français:** Vocabulaire alimentaire, expression besoins
• **Mathématiques:** Couleurs, formes, patterns nutritionnels
• **Sciences:** Énergie corporelle, besoins vivants
• **Arts:** Création artistique nourriture/mouvement
• **Études sociales:** Traditions familiales diverses

**PERSPECTIVES AUTOCHTONES - SEVEN SACRED TEACHINGS:**
• **LOVE (Mars):** Aimer et respecter nos corps
• Traditional foods observation respectueuse
• Gratitude pour nourriture Terre Mère
• Célébration diversité pratiques alimentaires

**SENSIBILITÉS CRITIQUES:**
• Troubles alimentaires prévention absolue
• Insécurité alimentaire reconnaissance respect
• Préférences sensorielles acceptation totale
• Capacités physiques inclusion automatique

**COMMUNICATION FAMILLES:**
• Focus activités école vs surveillance maison
• Suggestions mouvement famille universelles
• Ressources nutrition communautaires discrètes
• Aucun jugement habitudes actuelles implicite

**INDICATEURS SUCCÈS:**
□ 100% participation confortable selon capacités
□ ZERO incidents food shaming classe
□ Augmentation mouvement joyeux récréations
□ Vocabulaire énergie utilisé spontanément
□ Respect total différences alimentaires maintenu`
      }
    });
    
    console.log('✅ Unit 4 created: 15 lessons (11.25 hours)');
    
    // PERFECT UNIT 5: Mouvement et bien-être
    const unit5 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: fpsLRP.id,
        titleFr: 'Mouvement et bien-être',
        title: 'Movement and Wellbeing',
        startDate: new Date('2026-04-07'),
        endDate: new Date('2026-05-23'),
        estimatedHours: 13.5, // 18 lessons × 0.75 hours
        description: `**UNITÉ 5: MOUVEMENT ET BIEN-ÊTRE**
*18 leçons | 7 semaines | 7 avril - 23 mai*

**QUESTION ESSENTIELLE:**
Comment le mouvement m'aide-t-il à me sentir bien dans mon corps et mon esprit?

**COMPRÉHENSIONS DURABLES:**
• Mon corps est fait pour bouger et le mouvement me rend heureux
• Il y a beaucoup de façons d'être actif selon mes capacités
• Je peux adapter l'activité à mes intérêts personnels
• Le repos est aussi important que le mouvement

**PRINCIPE INCLUSION CORPORELLE ABSOLUE:**
• Chaque corps unique capable mouvement significatif
• Adaptation automatique TOUTES capacités physiques
• Célébration effort vs comparaison performance
• Respect limites sans pression dépassement

**🎯 MODÈLE CŒUR + EXTENSION (INCLUSIVE MOVEMENT)**

**CŒUR UNIVERSEL (72% - 13 leçons):**
• Mouvement corporel accessible toutes capacités
• Activités joyeuses adaptables sans équipement
• Repos récupération stratégies individuelles
• Bien-être global choix personnels mouvement

**EXTENSIONS OPTIONNELLES (28% - 5 leçons):**
• Activités familiales selon ressources
• Sports communautaires selon accessibilité
• Leadership projets selon maturité

**ATTENTES CURRICULAIRES (SELON LRP PROTÉGÉ):**
• **FPS1 (72% - 13 leçons):** Comprendre mouvement santé physique
• **FPS4 (28% - 5 leçons):** Utiliser compétences bien-être personnel

**CADRE PÉDAGOGIQUE ETFO ADAPTATIF:**
• **Mise en situation (8-10 min):** Activation corporelle douce inclusive
• **Action (25-30 min):** Exploration mouvement, adaptation automatique
• **Consolidation (7-10 min):** Relaxation, réflexion corporelle positive

**PROGRESSION PRINTANIÈRE:**
• Semaine 1-2: Mouvement base éveil printanier
• Semaine 3-4: Jeux inclusifs créativité mouvement
• Semaine 5: Repos récupération équilibrée
• Semaine 6-7: Bien-être global applications célébration

**VOCABULAIRE MOUVEMENT INCLUSIF:**
bouger, corps, fort, souple, étirer, respirer, courir, marcher, danser, relaxer, repos, énergie, plaisir, choix, capable, essayer, adapter, différent, unique

**ÉVALUATION CORPORELLE POSITIVE:**
• Observations engagement selon capacités individuelles
• Portfolio bien-être documentation sensations positives
• Auto-évaluation "Comment mon corps se sent"
• Démonstrations mouvement zone confort personnelle

**ADAPTATIONS AUTOMATIQUES:**
• **Mobilité limitée:** Mouvement adapté capacités disponibles
• **Conditions chroniques:** Intensité selon recommandations
• **Anxiété performance:** Observation active valorisée
• **Support général:** Célébration participation vs résultats

**FLEXIBILITÉ PRINTEMPS CONCRÈTE:**
• Allergies saisonnières: alternatives intérieures immédiates
• Pâques/congés: timeline flexible traditions respectées
• Blessure mineure: adaptation inclusion limitation temporaire
• Canicule mai: réduction intensité, hydratation priorité
• Sortie annulée: versions intérieures préparées créatives

**INTÉGRATION INTERDISCIPLINAIRE:**
• **Français:** Vocabulaire mouvement, expression sensations
• **Mathématiques:** Comptage, rythmes, patterns corporels
• **Sciences:** Physiologie base, muscles, respiration
• **Arts:** Expression corporelle créative, danse
• **Études sociales:** Jeux cultures diverses, traditions

**PERSPECTIVES AUTOCHTONES - SEVEN SACRED TEACHINGS:**
• **WISDOM (Avril-Mai):** Comprendre besoins corporels
• Jeux traditionnels Mi'kmaq adaptés inclusifs
• Connection nature mouvement extérieur
• Célébration capacités diverses communauté

**SENSIBILITÉS MOUVEMENT:**
• Image corporelle protection absolue
• Traumatismes corporels reconnaissance
• Diversité capacités célébration naturelle
• Pudeur confort respectés sans question

**RESSOURCES INCLUSIVES:**
• Équipement varié tous niveaux capacités
• Musique rythmes variés cultures tempos
• Espaces créatifs adaptation environnement
• Invités athlètes adaptatifs si possible

**COMMUNICATION FAMILLES:**
• Partage activités sans prescription exercice
• Suggestions famille selon ressources réelles
• Information développement sans comparaisons
• Ressources communautaires selon demandes

**INDICATEURS SUCCÈS:**
□ 100% participation selon capacités individuelles
□ Augmentation mouvement récréations joyeux
□ Vocabulaire bien-être utilisé spontanément
□ Techniques relaxation appliquées stress
□ Respect différences corporelles maintenu
□ Effort célébré vs performance comparée`
      }
    });
    
    console.log('✅ Unit 5 created: 18 lessons (13.5 hours)');
    
    // PERFECT UNIT 6: Communauté, sécurité et célébration
    const unit6 = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: fpsLRP.id,
        titleFr: 'Communauté, sécurité et célébration',
        title: 'Community, Safety and Celebration',
        startDate: new Date('2026-05-26'),
        endDate: new Date('2026-06-20'),
        estimatedHours: 8.25, // 11 lessons × 0.75 hours
        description: `**UNITÉ 6: COMMUNAUTÉ, SÉCURITÉ ET CÉLÉBRATION**
*11 leçons | 4 semaines | 26 mai - 20 juin*

**QUESTION ESSENTIELLE:**
Comment puis-je utiliser mes apprentissages pour contribuer et célébrer?

**COMPRÉHENSIONS DURABLES:**
• J'ai développé compétences importantes à partager
• Je peux contribuer positivement à ma communauté
• Célébrer apprentissages prépare défis futurs
• L'été nécessite sécurité spéciale et préparation

**RÉALISME JUIN FONDAMENTAL:**
• Fatigue émotionnelle cognitive accumulée
• Émotions mixtes: excitation + anxiété + nostalgie
• Focus culmination vs nouveau contenu lourd
• Attention énergie diminuées naturellement

**🎯 MODÈLE CŒUR + EXTENSION (JUNE REALISTIC)**

**CŒUR UNIVERSEL (73% - 8 leçons):**
• Reconnaissance apprentissages année indépendamment
• Sécurité été transitions universelles
• Contributions communauté classe accessibles tous

**EXTENSIONS OPTIONNELLES (27% - 3 leçons):**
• Contributions familiales selon stabilité
• Projets communautaires selon ressources
• Célébrations traditions selon possibilités

**ATTENTES CURRICULAIRES (SELON LRP PROTÉGÉ):**
• **FPS2 (45% - 5 leçons):** Sécurité estivale responsabilité
• **FPS3 (36% - 4 leçons):** Célébration relations communautaires
• **FPS4 (18% - 2 leçons):** Démonstration compétences développées

**CADRE PÉDAGOGIQUE ETFO JUIN:**
• **Mise en situation (5-8 min):** Reconnexion positive célébration
• **Action (25-30 min):** Démonstrations, projets culmination
• **Consolidation (10-12 min):** Reconnaissance, promesses futures

**PROGRESSION JUIN RÉALISTE:**
• Semaine 1: Reconnaissance apprentissages portfolios
• Semaine 2: Sécurité été préparation transitions
• Semaine 3: Contributions communautaires legacy
• Semaine 4: Célébrations finales promesses été

**VOCABULAIRE CULMINATION:**
compétent, capable, fier, grandir, apprendre, été, Grade 2, continuer, promesse, célébrer, souvenir, merci, au revoir, communauté, aide, sécurité, réussir

**ÉVALUATION CÉLÉBRATIVE:**
• Portfolios complétés croissance septembre-juin
• Auto-évaluation "Je suis fier de..."
• Démonstrations compétences choix personnel
• Certificats personnalisés chaque élève
• Messages Grade 2 encouragement futur

**DIFFÉRENCIATION JUIN INCLUSIVE:**
• **Soutien intensif:** Célébration garantie succès personnels
• **Soutien modéré:** Choix modalités présentation confort
• **Extension:** Leadership célébration organisation pairs

**FLEXIBILITÉ JUIN MAXIMALE:**
• Semaine écourtée: condensation intelligente activités
• Canicule: transfert intérieur, hydratation priorité
• Sorties multiples: intégration comme apprentissage
• Émotions intenses: temps cercles validation normal
• Absences précoces: portfolios maison, célébrations répétées

**SÉCURITÉ ÉTÉ CONCRÈTE:**
• Sécurité eau/piscine supervision obligatoire
• Protection solaire crème chapeau ombre
• Sécurité vélo/parc casque règles
• Sécurité maison adultes numéros urgence
• Habitudes santé été maintien encouragé

**INTÉGRATION INTERDISCIPLINAIRE:**
• **Français:** Messages remerciement, promesses été
• **Mathématiques:** Compte jours été, graphique succès
• **Sciences:** Sécurité soleil, changements été
• **Arts:** Création souvenirs, cartes merci
• **Études sociales:** Helpers été, responsabilités

**PERSPECTIVES AUTOCHTONES - SEVEN SACRED TEACHINGS:**
• **TRUTH (Juin):** Célébrer vérité croissance année
• Gratitude ceremonies appropriées Grade 1
• Summer solstice connections célébration
• Recognition territoire ongoing respect

**CONTRIBUTIONS COMMUNAUTAIRES:**
• Aide classe nettoyage organisation
• Legacy positif élèves suivants
• Promesses été sécurité gentillesse
• Reconnaissance helpers année entière

**COMMUNICATION FAMILLES FINALE:**
• Célébration réussites individuelles spécifiques
• Suggestions été maintien apprentissages
• Ressources communautaires programmes été
• Remerciements partenariat année entière
• Information transition Grade 2 positive

**INDICATEURS SUCCÈS JUIN:**
□ 100% élèves célèbrent minimum 3 réussites
□ Portfolios complétés TOUS avec fierté
□ Transition Grade 2 anticipée positivement
□ Été commence joie sécurité préparation
□ Souvenirs positifs année créés permanents
□ Familles satisfaites croissance enfant visible`
      }
    });
    
    console.log('✅ Unit 6 created: 11 lessons (8.25 hours)');
    
    // Verify totals
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: fpsLRP.id },
      select: { estimatedHours: true }
    });
    
    const totalHours = units.reduce((sum, unit) => sum + unit.estimatedHours, 0);
    const totalLessons = Math.round(totalHours / 0.75);
    
    console.log('\n🎯 FINAL VERIFICATION:');
    console.log(`📊 Total Units: 6 ✅`);
    console.log(`⏱️ Total Hours: ${totalHours} (Target: 73.5) ${totalHours === 73.5 ? '✅' : '❌'}`);
    console.log(`📚 Total Lessons: ${totalLessons} (Target: 98) ${totalLessons === 98 ? '✅' : '❌'}`);
    
    console.log('\n✨ PERFECT FPS UNIT PLANS CREATED SUCCESSFULLY!');
    console.log('Features:');
    console.log('  ✅ Exact timing: 98 lessons (73.5 hours)');
    console.log('  ✅ Perfect LRP alignment (FPS1-4 distribution)');
    console.log('  ✅ Complete ETFO framework');
    console.log('  ✅ Trauma-informed throughout');
    console.log('  ✅ Indigenous perspectives integrated');
    console.log('  ✅ Ultra-concrete flexibility');
    console.log('  ✅ Family communication strategies');
    console.log('  ✅ Grade 1 developmental appropriateness');
    console.log('  ✅ French immersion ready');
    
  } catch (error) {
    console.error('❌ Error creating perfect units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPerfectFPSUnitsFinal();