#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectUnits5and6Complete() {
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

    const perfectUnit5Complete = `**UNITÉ 5: MOUVEMENT ET BIEN-ÊTRE**
*18 leçons | 7 semaines | 7 avril - 23 mai*

**QUESTION ESSENTIELLE:**
Comment le mouvement et l'activité m'aident-ils à me sentir bien dans mon corps et mon esprit?

**COMPRÉHENSIONS DURABLES:**
• Mon corps est fait pour bouger et le mouvement me rend plus heureux
• Il y a beaucoup de façons différentes d'être actif et de prendre soin de soi
• Je peux adapter l'activité à mes capacités et mes intérêts personnels

**PRINCIPE INCLUSION CORPORELLE ABSOLUE:**
Cette unité célèbre TOUTES les formes de mouvement et capacités corporelles:
• Chaque corps est unique et capable de mouvement significatif à sa façon
• Adaptation automatique activités pour inclure TOUTES capacités physiques
• Célébration effort personnel vs comparaison performance avec autres
• Respect limites corporelles individuelles sans pression dépassement
• Focus plaisir mouvement vs obligation performance ou compétition

**🎯 MODÈLE CŒUR + EXTENSION (INCLUSIVE MOVEMENT)**

**CŒUR UNIVERSEL (72% - 13 leçons):**
Concepts mouvement et bien-être accessibles à TOUTES les capacités physiques:

*Leçons 1-4: Mouvement corporel de base et conscience corporelle*
- CŒUR: Étirements doux, marche adaptée, mouvement accessible tous
- Respiration et mouvement, connexion corps-esprit universelle
- Adaptation automatique capacités individuelles sans ségrégation

*Leçons 5-7: Activité joyeuse et jeux inclusifs*
- CŒUR: Jeux adaptables tous niveaux, mouvement créatif, expression corporelle
- Danse libre adaptée, rythme personnel, créativité motrice
- Sans équipement spécialisé ou espaces extérieurs requis

*Leçons 8-10: Repos, relaxation et récupération corporelle*
- CŒUR: Techniques relaxation progressive, respiration calme, temps repos
- Importance sommeil, récupération, écoute signaux fatigue corporelle
- Stratégies applicables environnements variés et situations familiales

*Leçons 11-13: Bien-être global et choix personnels mouvement*
- CŒUR: Connection mouvement-émotions-énergie, choix activités individuels
- Autonomie corporelle, respect limites, célébration capacités personnelles
- Focus bien-être vs performance, plaisir vs obligation

**EXTENSIONS OPTIONNELLES (28% - 5 leçons):**
Applications mouvement selon ressources et intérêts familiaux:

*Leçon Extension 1: Activités familiales et traditions mouvement*
- Partage VOLONTAIRE activités familiales si famille stable et approprié
- Respect situations familiales diverses, géographiques, économiques

*Leçon Extension 2: Sports et activités communautaires*
- Exploration options communautaires selon disponibilité et accessibilité réelle
- Aucune pression participation coûteuse ou nécessitant transport

*Leçons Extension 3-5: Leadership mouvement et projets bien-être*
- Création activités mouvement pour pairs, initiatives personnelles
- Projets selon maturité physique et intérêts individuels démontrés

**ATTENTES CURRICULAIRES (SELON LRP PROTÉGÉ):**
• **FPS1 (72% - 13 leçons):** Comprendre mouvement pour santé physique et mentale  
• **FPS4 (28% - 5 leçons):** Utiliser compétences personnelles pour bien-être global

**CADRE PÉDAGOGIQUE ETFO ADAPTATIF:**
Structure respectueuse toutes capacités corporelles:

• **Mise en situation (8-10 min):** Activation corporelle douce, inclusion universelle
  - Mouvement préparatoire adapté capacités révélées
  - Validation expériences corporelles diverses sans jugement
  - Connexion apprentissages mouvement précédents individuels

• **Action (25-30 min):** Exploration mouvement active, adaptation automatique
  - Apprentissage cœur mouvement universel accessible
  - Extensions selon capacités physiques et intérêts révélés
  - Modifications continues selon besoins observés temps réel

• **Consolidation (7-10 min):** Relaxation, réflexion corporelle positive
  - Ancrage sensations corporelles positives post-mouvement
  - Célébration efforts individuels vs comparaisons
  - Planification application mouvement contexte personnel

**PROGRESSION PRINTANIÈRE 7 SEMAINES:**
*Semaine 1 (7-11 avril):* Mouvement corporel de base et éveil printanier
*Semaine 2 (14-18 avril):* Conscience corporelle et capacités personnelles
*Semaine 3 (21-25 avril):* Jeux inclusifs et mouvement créatif
*Semaine 4 (28 avril-2 mai):* Repos et récupération équilibrée
*Semaine 5 (5-9 mai):* Bien-être global et choix personnels
*Semaines 6-7 (12-23 mai):* Extensions + applications + célébration capacités

**VOCABULAIRE MOUVEMENT INCLUSIF:**
bouger, corps, fort, souple, étirer, respirer, courir, marcher, danser,
relaxer, repos, énergie, plaisir, choix, capable, essayer, adapter,
différent, unique, ensemble, respecter, écouter, sentir, bien-être

**ÉVALUATION CORPORELLE POSITIVE:**

**CŒUR (Tous élèves - évaluation adaptée capacités):**
• **Observations mouvement:** Engagement selon capacités individuelles révélées
• **Portefeuille d'apprentissage bien-être:** Documentation sensations corporelles positives
• **Auto-évaluation corporelle:** "Comment mon corps se sent après mouvement"
• **Démonstrations personnelles:** Mouvement préféré selon zone confort
• **Exploration créative:** Expression corporelle libre sans critères performance

**EXTENSIONS (Participation selon ressources):**
• **Projets familiaux mouvement:** SI famille ressources et intérêt
• **Connexions communautaires:** Selon accessibilité géographique et économique
• **Leadership mouvement:** Pour élèves démontrant maturité et passion

**ADAPTATIONS CAPACITÉS PHYSIQUES AUTOMATIQUES:**

**Mobilité limitée:**
- Mouvement bras, tête, tronc selon capacités disponibles
- Chaise roulante intégrée naturellement activités groupe
- Focus mouvement possible vs impossibilités
- Partenariat pairs naturel sans ségrégation

**Conditions médicales chroniques:**
- Adaptation niveau intensité selon recommandations médicales connues
- Pauses fréquentes selon besoins individuels observés
- Alternatives calmes toujours disponibles sans questions
- Collaboration famille/médical selon informations partagées

**Anxiété mouvement/performance:**
- Options participation observation active valorisée
- Mouvement privé ou petit groupe selon confort
- Aucune pression participation publique ou démonstration
- Construction graduelle confiance corporelle selon rythme individuel

**DIFFÉRENCIATION MOUVEMENT INCLUSIVE:**

**Soutien intensif:**
- Mouvement ultra-adapté capacités révélées, partenaire d'aide constant
- Focus sensations corporelles positives vs performance mesurable
- Alternatives systématiques pour toute activité proposée
- Célébration participation vs résultats obtenus

**Soutien modéré:**
- Adaptations ponctuelles selon besoins révélés graduellement  
- Choix niveau participation selon énergie et capacités quotidiennes
- Support peers naturel sans identification spéciale besoins

**Extension enrichissement:**
- Défis mouvement avancés selon passion et capacités démontrées
- Leadership activités pour pairs, mentorat corporel positif
- Projets recherche mouvement selon intérêts individuels révélés

**FLEXIBILITÉ PRINTEMPS CONCRÈTE:**

*Allergies saisonnières printanières affectant respiration/énergie:*
- Alternative intérieure immédiate pour élèves affectés symptoms
- Adaptation automatique intensité selon capacités respiratoires réduites
- Collaboration famille médications préventives selon protocoles médicaux
- Inclusion significative tous dans mouvement adapté capacités quotidiennes

*Pâques/congés variables interrompant progression mouvement:*
- Timeline flexible selon calendrier religieux familial respecté
- Suggestions activités mouvement famille durant congés appropriées
- Retour graduel intensité post-congés selon niveau énergie observé
- Célébration traditions diverses incluant mouvement culturel varié

*Élève blessure mineure durant activité mouvement:*
- Premiers soins immédiats trousse classe et formation actualisée
- Adaptation immédiate activité inclusion avec limitation temporaire
- Documentation incident selon protocoles école établis respectés
- Communication famille même blessures mineures pour transparence

*Canicule précoce mai limitant mouvement intense extérieur:*
- Réduction automatique intensité selon température extérieure mesurée
- Hydratation fréquente obligatoire avec pauses ombre régulières
- Transfert activités intérieures climatisées si nécessaire sécurité
- Adaptation horaire éviter heures plus chaudes journée

*Équipement mouvement brisé/indisponible:*
- Alternatives créatives objets classe standards disponibles
- Mouvement corporel libre sans équipement spécialisé priorité
- Priorité absolue sécurité sur performance avec équipement défaillant
- Improvisation célébrée comme adaptabilité et créativité valorisées

*Élève anxiété performance mouvement devant pairs classe:*
- Options participation privée ou avec partenaire d'aide choisi
- Focus effort individuel vs comparaison avec autres élèves
- Célébration courage tentative vs réussite parfaite technique
- Alternatives expression mouvement selon zone confort révélée

*Sorties extérieures annulées météo/restrictions administratives:*
- Versions intérieures préparées pour tous objectifs mouvement
- Adaptation créative espaces restreints avec sécurité maintenue
- Frustration validée et transformée apprentissage adaptabilité positive
- Promesse reprise extérieure dès conditions permises

*Parent inquiet niveau activité physique enfant capacités:*
- Discussion rassurante capacités développementales normales variées
- Suggestions encouragement mouvement maison selon recommandations médicales
- Collaboration objectifs réalistes encouragement mutuel sans pression
- Ressources si préoccupations développementales légitimes exprimées

**RESSOURCES MOUVEMENT INCLUSIVES:**
• **Littérature:** Livres célébrant diversité corporelle, mouvement adaptatif
• **Matériel:** Équipement varié tous niveaux, objets sensoriels mouvement
• **Musique:** Rythmes variés cultures, tempos adaptés capacités diverses
• **Espaces:** Utilisation créative espaces disponibles, adaptation environnement
• **Invités:** Athlètes adaptatifs, professionnels mouvement inclusif si possible

**INTÉGRATION INTERDISCIPLINAIRE MOUVEMENT:**

• **Français:** Vocabulaire mouvement, expression sensations corporelles
• **Mathématiques:** Comptage mouvements, rythmes, patterns corporels
• **Sciences:** Physiologie base, muscles, cœur, respiration
• **Arts:** Expression corporelle créative, danse, mouvement artistique
• **Études sociales:** Jeux cultures diverses, traditions mouvement mondiales

**SENSIBILITÉS MOUVEMENT CRITIQUES:**

**Image corporelle protection:**
- Aucune comparaison corps, apparences, ou performances relatives
- Focus fonction corporelle vs esthétique ou conformité standards
- Vêtements confortables priorité sur uniforme mouvement
- Respect pudeur et confort corporel sans questionnement

**Traumatismes corporels reconnaissance:**
- Sensibilité élèves avec expériences corporelles négatives
- Aucune pression contact physique ou proximité non-désirée
- Respect limites corporelles sans explications requises
- Surveillance signes détresse, intervention professionnelle si nécessaire

**Diversité capacités célébration:**
- Inclusion naturelle toutes capacités sans ségrégation
- Valorisation contributions uniques chaque corps classe
- Évitement pitié ou traitement spécial stigmatisant
- Normalisation adaptation comme créativité positive

**COMMUNICATION FAMILLES MOUVEMENT:**
• Partage activités mouvement école sans prescription exercice
• Suggestions activités famille selon ressources disponibles
• Information développement moteur sans comparaisons enfants
• Ressources communautaires mouvement selon demandes familles

**PARTENARIAT COMMUNAUTAIRE MOUVEMENT:**
• Collaboration centres récréatifs locaux selon accessibilité
• Programmes mouvement adaptés communautaires information
• Ressources transport activités si familles demandent
• Respect autonomie familiale décisions participation extrascolaire

**INDICATEURS SUCCÈS MOUVEMENT INCLUSIFS:**

**CŒUR (Tous élèves selon capacités):**
□ 100% élèves participent mouvement selon capacités individuelles
□ Augmentation engagement mouvement récréations observée
□ Utilisation vocabulaire bien-être corporel conversations spontanées
□ Application techniques relaxation lors stress ou fatigue
□ Respect différences corporelles maintenu classe entière
□ Célébration effort personnel vs comparaison performance

**EXTENSIONS (Participation volontaire):**
□ Connexions activités communautaires selon ressources familles
□ Leadership mouvement positif démontré par volontaires
□ Projets bien-être complétés selon intérêts individuels
□ Traditions mouvement culturelles partagées respectueusement

**BIEN-ÊTRE GLOBAL AMÉLIORÉ:**
□ Familles rapportent discussions positives activité corporelle
□ Élèves appliquent stratégies mouvement pour régulation émotionnelle
□ Confiance corporelle individuelle renforcée observable
□ Intégration mouvement routine quotidienne naturellement`;

    const perfectUnit6Complete = `**UNITÉ 6: COMMUNAUTÉ, SÉCURITÉ ET CÉLÉBRATION**
*11 leçons | 4 semaines | 26 mai - 19 juin*

**QUESTION ESSENTIELLE:**
Comment puis-je utiliser mes apprentissages pour contribuer à ma communauté et célébrer ma croissance?

**COMPRÉHENSIONS DURABLES:**
• J'ai appris beaucoup cette année et je peux partager mes compétences avec fierté
• Je fais partie de plusieurs communautés et je peux contribuer positivement
• Célébrer nos apprentissages nous prépare pour les défis et opportunités futures

**RÉALISME JUIN FONDAMENTAL:**
Cette unité reconnaît et respecte les défis uniques de fin d'année scolaire:
• Fatigue émotionnelle et cognitive accumulée depuis septembre
• Émotions mixtes: excitation vacances + anxiété séparation + nostalgie
• Attention et énergie diminuées, besoin closure positive
• Focus culmination significative vs introduction nouveau contenu lourd

**🎯 MODÈLE CŒUR + EXTENSION (END-OF-YEAR REALISTIC)**

**CŒUR UNIVERSEL (73% - 8 leçons):**
Célébration et contributions accessibles à TOUS indépendamment situation familiale:

*Leçons 1-3: Reconnaissance apprentissages personnels année complète*
- CŒUR: Portefeuille d'apprentissage individuel, croissance personnelle septembre-juin
- Célébration réussites sans comparaison familiale ou performance relative
- Documentation photographique progression individuelle observable

*Leçons 4-5: Sécurité été et transitions Grade 2*
- CŒUR: Sécurité vacances été, maintien habitudes santé développées
- Messages universels indépendamment plans familiaux vacances
- Préparation émotionnelle positive transition Grade 2 septembre

*Leçons 6-8: Contributions communauté classe et école*
- CŒUR: Aide classe, reconnaissance pairs, actes gentillesse quotidiens
- Actions réalisables contexte scolaire accessibles tous élèves
- Legacy positif pour élèves suivants septembre prochain

**EXTENSIONS OPTIONNELLES (27% - 3 leçons):**
Connexions communautaires selon possibilités familiales été:

*Leçon Extension 1: Contributions familiales et reconnaissance*
- Partage VOLONTAIRE façons aider famille si situation stable appropriée
- Alternatives respectueuses pour situations familiales complexes

*Leçon Extension 2: Projets communautaires et service*
- Initiatives selon ressources familiales et intérêts révélés
- Participation volontaire sans pression performance ou engagement

*Leçon Extension 3: Célébrations et traditions été*
- Reconnaissance diversité célébrations cultures représentées
- Inclusion totale indépendamment ressources ou traditions familiales

**ATTENTES CURRICULAIRES (SELON LRP PROTÉGÉ):**
• **FPS2 (45% - 5 leçons):** Sécurité estivale et responsabilité communautaire
• **FPS3 (36% - 4 leçons):** Célébration relations et connexions communautaires
• **FPS4 (18% - 2 leçons):** Démonstration compétences personnelles développées

**CADRE PÉDAGOGIQUE ETFO JUIN ADAPTÉ:**
Structure flexible respectant réalités émotionnelles fin année:

• **Mise en situation (5-8 min):** Reconnexion positive, célébration énergie quotidienne
  - Validation émotions mixtes fin année normales
  - Activation souvenirs positifs année scolaire
  - Préparation mentale activités culmination

• **Action (25-30 min):** Démonstrations compétences, projets culmination
  - Focus qualité vs quantité contenus couverts
  - Créations personnelles, portefeuilles, présentations selon confort
  - Applications apprentissages année dans contexte célébratif

• **Consolidation (10-12 min):** Reconnaissance réussites, promesses futures
  - Ancrage apprentissages permanents vs temporaires
  - Célébration croissance individuelle observable
  - Préparation séparation positive et anticipation futures

**PROGRESSION JUIN RÉALISTE 4 SEMAINES:**
*Semaine 1 (26-30 mai):* Reconnaissance apprentissages et portefeuilles (3 leçons)
*Semaine 2 (2-6 juin):* Sécurité été et préparation transitions (3 leçons)
*Semaine 3 (9-13 juin):* Contributions communautaires et legacy classe (2 leçons)
*Semaine 4 (16-19 juin):* Célébrations finales et promesses été (3 leçons)

**VOCABULAIRE CULMINATION APPROPRIÉ:**
compétent, capable, fier, grandir, apprendre, été, Grade 2, continuer,
promesse, célébrer, souvenir, merci, au revoir, communauté, aide,
sécurité, réussir, essayer, partager, gentil, respecter, grandir

**ÉVALUATION CÉLÉBRATIVE JUNE:**

**CŒUR (Tous élèves - célébration garantie):**
• **Portefeuilles complétés:** Documentation croissance septembre-juin inclusive
• **Auto-évaluation finale Grade 1:** "Je suis fier de..." avec supports visuels
• **Démonstrations compétences:** Présentation 1 apprentissage clé choix personnel
• **Certificats personnalisés:** Reconnaissance réussites spécifiques chaque élève
• **Messages Grade 2:** Lettres encouragement à soi-même septembre prochain

**EXTENSIONS (Opportunités enrichissement):**
• **Projets communautaires:** Selon ressources et intérêts familiaux révélés
• **Leadership célébration:** Pour élèves démontrant maturité organisation
• **Présentations culturelles:** Si familles souhaitent partager traditions

**CONSIDÉRATIONS ÉMOTIONNELLES JUIN CRITIQUES:**
• **Anxiété séparation:** Validation normalité sentiments, ressources soutien
• **Nostalgie année:** Célébration souvenirs, permission tristesse fin période
• **Excitation Grade 2:** Canalisation positive énergie vers préparation
• **Fatigue cognitive:** Réduction exigences académiques nouvelles
• **Anticipation été:** Équilibre excitation avec préparation sécuritaire

**FLEXIBILITÉ MAXIMALE JUIN CONCRETE:**

*Semaine écourtée (congés pédagogiques multiples juin):*
- Condensation activités culmination sessions combinées intelligemment
- Permission reporter évaluations formelles si temps insuffisant disponible
- Focus qualité moments précieux vs couverture programme exhaustive
- Célébrations répétées selon disponibilité temps réel

*Canicule juin intense (35°C+ température):*
- Transfert immédiat activités intérieures climatisées pour sécurité
- Hydratation priorité absolue, pauses fréquentes obligatoires
- Sessions raccourcies acceptées sans culpabilité pédagogique
- Portefeuilles complétés espaces frais avec support ventilation

*Sorties fin année multiples (pique-niques, parcs, spectacles):*
- Intégration sorties comme leçons communautaires authentiques
- Matériel portatif léger pour continuer apprentissage locations diverses
- Aucune double charge travail classe ET sortie
- Documentation moments spéciaux comme évaluation valide

*Émotions séparation intenses (pleurs, attachement, anxiété):*
- Temps supplémentaire cercles discussion validation sentiments normaux
- Activités réconfort: coin calme, objets transitionnels, partenaire d'aide
- Permission expression émotionnelle sans pression performance académique
- Collaboration famille renforcée transition été support

*Absences multiples (familles partent vacances tôt juin):*
- Portefeuilles peuvent partir maison avec travail culmination final
- Célébrations répétées inclure tous selon disponibilité calendriers
- Matériel culmination envoyé familles si absence prolongée nécessaire
- Inclusion virtuelle possible moments importants si technologie permet

*Suppléant non-familier durant dernières semaines précieuses:*
- Plan ultra-simple disponible: portefeuilles libres, jeux calmes, lecture
- Bac spécial "Juin Facile" matériel autonome avec photos instructions
- Instructions maximum 1-page avec activités visuelles préparées
- Contact titulaire rattrapage naturel sans stress performance

*Matériel culmination brisé/manquant dernière minute:*
- Alternatives créatives matériel classe standard disponible priorité
- Improvisation constructive célébrée apprentissage adaptabilité précieux
- Créations élèves valorisées infiniment plus objets commerciaux
- Documentation photographique remplace objets manquants efficacement

*Élève malade pendant célébration finale classe:*
- Célébration individuelle privée immédiate dès retour santé
- Enregistrement vidéo moments spéciaux partage ultérieur famille
- Inclusion famille moment rattrapage spécial personnalisé
- Aucune pression rattraper groupe - bien-être priorité absolue

*Budget classe épuisé juin (ressources limitées):*
- Créativité et réutilisation matériel année priorité achats
- Contributions familles strictement volontaires sans pression
- Simplicité et authenticité valorisées coût ou sophistication
- Focus relations humaines vs objets matériels

**SÉCURITÉ ÉTÉ CONCRÈTE RÉALISTE (5 LEÇONS):**

*Sécurité eau/piscine:* Supervision adulte, règles piscine, flottaison, urgences
*Protection solaire:* Crème protection, chapeau, ombre, hydratation régulière
*Sécurité vélo/parc:* Casque obligatoire, règles circulation, équipement terrains
*Sécurité maison:* Adultes responsables, numéros urgence, règles sécuritaires
*Habitudes santé été:* Maintien routine sommeil, nutrition, activité physique

**CONTRIBUTIONS COMMUNAUTAIRES ACCESSIBLES (4 LEÇONS):**

*Aide classe:* Nettoyage, organisation, matériel, préparation septembre suivant
*Aide famille:* Tâches appropriées âge, reconnaissance efforts quotidiens
*Aide voisinage:* Politesse, petits services, respect environnement commun
*Promesses été:* Engagements sécurité, gentillesse, apprentissage continuation

**ACTIVITÉS CULMINATION ÉCONOMIQUES CRÉATIVES:**
• Création capsule temporelle Grade 1 contributions individuelles
• Livre souvenirs classe collaboratif photos année entière
• Spectacle mini-démonstrations parents selon restrictions COVID
• Diplômes FPS créés élèves pairs reconnaissance mutuelle
• Promesses été sécuritaire signatures symboliques personnelles
• Messages vidéo courts soi-même encouragement septembre

**COMMUNICATION FAMILLES FINALE ESSENTIELLE:**
• Célébration réussites spécifiques chaque enfant individuellement
• Suggestions activités été maintien apprentissages sans pression
• Ressources communautaires programmes été information disponible
• Remerciements sincères partenariat famille-école année entière
• Information transition Grade 2 recommandations encourageantes

**INDICATEURS SUCCÈS JUIN RÉALISTES:**

**CŒUR (Garantis tous élèves):**
□ 100% élèves célèbrent minimum 3 réussites personnelles année
□ Portefeuilles complétés TOUS avec fierté visible documentation
□ Familles participent célébration finale forme quelconque possible
□ Transition Grade 2 anticipée positivement élèves sans anxiété
□ Été commence joie et sécurité, jamais stress ou obligations
□ Souvenirs positifs année créés fondation future apprentissage

**EXTENSIONS (Participation volontaire enrichissement):**
□ Projets communautaires réalisés selon intérêts capacités révélées
□ Leadership célébration démontré volontaires maturité appropriée
□ Traditions culturelles partagées respectueusement si familles consentent
□ Connexions été maintenues selon ressources opportunités disponibles

**PRÉPARATION SEPTEMBRE OPTIMISTE:**
- Foundation positive apprentissage établie solidement pour Grade 2
- Confiance capacités personnelles renforcée observablement
- Relations sociales saines modélisées classe continuation
- Autonomie personnelle développée application été et futur`;

    // Apply Unit 5
    await prisma.unitPlan.update({
      where: { id: units[4].id }, // Unit 5
      data: { description: perfectUnit5Complete }
    });
    console.log('✅ Unit 5 manually perfected with comprehensive framework');

    // Apply Unit 6
    await prisma.unitPlan.update({
      where: { id: units[5].id }, // Unit 6
      data: { description: perfectUnit6Complete }
    });
    console.log('✅ Unit 6 manually perfected with comprehensive framework');

    console.log(`\n🎯 UNITS 5-6 PERFECTION COMPLETED:`);
    console.log(`   • Unit 5: Inclusive movement for ALL physical capabilities`);
    console.log(`   • Unit 6: Realistic June culmination with emotional sensitivity`);
    console.log(`   • Both units now match Units 1-2 comprehensive quality`);
    console.log(`   • All pedagogical elements included (ETFO, assessment, etc.)`);
    console.log(`   • Ultra-concrete flexibility scenarios integrated`);
    console.log(`   • Ready for immediate classroom implementation`);
    
  } catch (error) {
    console.error('❌ Error creating perfect Units 5-6:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPerfectUnits5and6Complete();