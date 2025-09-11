#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectUnit3Complete() {
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
    
    const unit3 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: fpsLRP.id,
        titleFr: 'Émotions et relations'
      }
    });

    const perfectUnit3Complete = `**UNITÉ 3: ÉMOTIONS ET RELATIONS**
*18 leçons | 7 semaines | 6 janvier - 21 février (POST-VACANCES)*

**QUESTION ESSENTIELLE:**
Comment puis-je comprendre mes émotions et créer des relations positives avec les autres?

**COMPRÉHENSIONS DURABLES:**
• Toutes mes émotions sont normales et j'ai des moyens respectueux de les exprimer
• Je peux développer des amitiés saines en pratiquant l'écoute et la gentillesse
• Les conflits font partie de la vie et je peux apprendre à les résoudre paisiblement

**CONTEXTE POST-VACANCES HIVERNAL CRITIQUE:**
Cette unité reconnaît explicitement les défis du retour après 2 semaines de pause:
• Anxiété possible et besoin de reconstruire liens classe
• Variations d'énergie et émotions fluctuantes en janvier
• Importance de reconnecter la communauté classe avec patience
• Adaptation au rythme scolaire après liberté vacances

**🎯 MODÈLE CŒUR + EXTENSION (POST-WINTER BREAK)**

**CŒUR UNIVERSEL (72% - 13 leçons):**
Compétences émotionnelles et relationnelles essentielles pour TOUS:

*Leçons 1-4: Reconnaissance et expression émotionnelles personnelles*
- CŒUR: Identifier émotions de base, expressions faciales, signaux corporels
- Techniques expression individuelle sans obligation partage expériences personnelles
- Outils visuels universels (météo émotionnelle, thermomètre sentiment)

*Leçons 5-7: Autorégulation et stratégies calme individuelles*
- CŒUR: Techniques respiration calme, comptage apaisant, espace personnel sécuritaire
- Stratégies applicables indépendamment de support familial ou environnement maison
- Focus ressources internes personnelles vs dépendances externes

*Leçons 8-10: Habiletés sociales de base et communication respectueuse*
- CŒUR: Écouter activement, attendre son tour, utiliser mots gentils
- Compétences applicables immédiatement avec pairs classe
- Communication besoins personnels de façon respectueuse

*Leçons 11-13: Résolution conflits et médiation simple entre pairs*
- CŒUR: Messages "je me sens", recherche compromis, demander aide adulte
- Techniques utilisables dans contexte scolaire sécuritaire supervisé
- Stratégies prévention escalade conflits mineurs

**EXTENSIONS OPTIONNELLES (28% - 5 leçons):**
Connexions relationnelles enrichissantes selon situations familiales:

*Leçon Extension 1: Émotions familiales et traditions relationnelles*
- Partage VOLONTAIRE façons familles gèrent émotions et conflits
- Alternatives respectueuses pour situations familiales instables ou difficiles

*Leçon Extension 2: Amitiés extrascolaires et communautaires*
- Exploration amitiés quartier, clubs, activités selon accessibilité
- Respect réalités géographiques et économiques diverses

*Leçons Extension 3-5: Projets empathie et leadership relationnel*
- Création projets gentillesse classe, mentorat émotionnel pairs
- Initiatives selon maturité émotionnelle et intérêts individuels

**ATTENTES CURRICULAIRES (SELON LRP PROTÉGÉ):**
• **FPS3 (78% - 14 leçons):** Développer habiletés relationnelles saines et communication empathique
• **FPS4 (22% - 4 leçons):** Utiliser compétences personnelles pour gérer émotions et relations

**CADRE PÉDAGOGIQUE ETFO POST-VACANCES:**
Structure adaptée réalités janvier avec patience supplémentaire:

• **Mise en situation (10 min):** Reconnexion douce, météo émotionnelle classe, validation retour
  - Check-in émotionnel non-pressant
  - Rappel objectifs précédents avec bienveillance
  - Activation connaissances émotionnelles acquises

• **Action (25-28 min):** Activités interactives, expression créative, collaboration positive
  - Apprentissage cœur émotionnel accessible tous
  - Extensions selon confort et engagement révélés
  - Pratique guidée habiletés relationnelles

• **Consolidation (7-10 min):** Cercle partage, validation apprentissages, encouragements
  - Ancrage personnel techniques apprises
  - Célébration efforts vs perfection résultats
  - Préparation application prochaine rencontre

**PROGRESSION POST-VACANCES SENSIBLE 7 SEMAINES:**
*Semaine 1 (6-10 jan):* Reconnexion classe et expression émotionnelle sécurisée
*Semaine 2 (13-17 jan):* Reconnaissance et validation émotions personnelles et d'autrui
*Semaines 3-4 (20-31 jan):* Développement habiletés amitié et jeu coopératif
*Semaines 5-6 (3-14 fév):* Résolution conflits paisible et communication respectueuse  
*Semaine 7 (17-21 fév):* Extensions + célébration relations positives + préparation Saint-Valentin inclusive

**VOCABULAIRE RELATIONNEL ESSENTIEL INTÉGRÉ:**
émotions, sentiments, ami, amitié, partager, écouter, comprendre, empathie,
respecter, aider, conflits, solutions, pardon, ensemble, gentillesse, patience,
colère, tristesse, joie, peur, calme, respirer, attendre, parler, écouter

**ÉVALUATION POST-VACANCES SENSIBLE AUTHENTIQUE:**

**CŒUR (Tous élèves - évaluation trauma-informed):**
• **Observations discrètes:** Ajustement émotionnel retour, application stratégies calme
• **Expression multiple:** Dessin émotions, mouvement corporel, mots selon confort
• **Portefeuille d'apprentissage émotions:** Documentation progression janvier-février avec photos
• **Auto-évaluation adaptée Grade 1:** Thermomètre émotionnel quotidien, visages émotions
• **Jeux rôles contrôlés:** Situations relationnelles préparées et sécurisées

**EXTENSIONS (Strictement volontaires):**
• **Projets familiaux relationnels:** SI famille stable et souhaite partager
• **Présentations traditions émotionnelles:** SI ressources culturelles disponibles  
• **Leadership émotionnel:** Mentorat pairs SI élève démontre maturité appropriée

**ADAPTATIONS JANVIER POST-VACANCES SPÉCIFIQUES:**
• Routine prévisible pour sécurité émotionnelle retrouvée
• Temps supplémentaire pour transitions et ajustements
• Validation fatigue hivernale et blues janvier normaux
• Activités énergisantes lumière si manque soleil affecte moral
• Flexibilité selon météo et moral collectif observé

**DIFFÉRENCIATION POST-VACANCES INCLUSIVE:**

**Soutien intensif:**
- Préparation individuelle retour, partenaire d'aide constant disponible
- Expression non-verbale acceptée et valorisée (dessins, gestes, choix)
- Focus exclusif cœur émotionnel, extensions complètement optionnelles
- Temps processing émotionnel supplémentaire selon besoins révélés

**Soutien modéré:**
- Check-ins fréquents, choix modalités participation selon confort
- Cœur émotionnel maîtrisé + extensions selon engagement personnel
- Adaptation activités selon besoins émotionnels identifiés en cours

**Extension enrichissement:**
- Maîtrise rapide cœur + engagement multiple extensions volontaires
- Rôle mentor émotionnel pour pairs, création ressources classe
- Projets approfondis empathie selon intérêts et maturité démontrée

**FLEXIBILITÉ CONCRÈTE JANVIER-FÉVRIER:**

*Première semaine janvier (réajustement critique):*
- Leçons 1-2 peuvent s'étendre sur 3-4 jours si nécessaire pour reconnexion
- Focus reconnexion avant contenu académique - bien-être priorité
- Permission émotions variées sans jugement ou pression performance
- Rythme déterminé par classe, pas programme rigide

*Tempête neige/fermeture école janvier:*
- Reprendre avec activité reconnexion plutôt que contenu manqué  
- Matériel émotions simple envoyé familles: dessin sentiments, cercle famille
- Condensation intelligente stratégies similaires sans précipitation
- Célébration sécurité maison pendant intempéries comme apprentissage

*Élève crise émotionnelle majeure durant cercle partage:*
- Évacuation douce immédiate vers espace calme avec partenaire d'aide
- Classe continue avec leader élève pendant intervention individuelle discrète
- Débrief post-crise focus apprentissage collectif vs incident individuel
- Documentation professionnelle pour équipe soutien si révélations préoccupantes

*Saint-Valentin exclusion potentielle (14 février):*
- Transformation en célébration amitiés inclusives pour TOUS élèves
- Activités reconnaissance qualités positives chaque personne classe
- Évitement cartes romantiques, focus amitié communautaire et respect
- Sensibilité familles non-célébrantes avec alternatives significatives préparées

*Conflit majeur cour récréation avant leçon résolution:*
- Opportunité d'apprentissage authentique avec protagonistes consentants
- Médiation immédiate classe comme observateurs apprentissage réel
- Application directe stratégies enseignées à situation vécue concrete
- Célébration résolution réussie renforce apprentissages théoriques

*Suppléant non-spécialisé gestion émotions:*
- Plan sécuritaire simple: jeux coopératifs calmes, lecture livres émotions
- Évitement discussions personnelles profondes sans expertise appropriée
- Matériel dans bac "Émotions Simples" avec instructions 1-page maximum
- Contact direction immédiat si révélations émotionnelles préoccupantes

*Fatigue collective mi-février (blues hivernal):*
- Permission réduire objectifs aux cœur essentiel seulement cette période
- Activités plus énergisantes: mouvement, musique, art thérapie émotionnelle
- Sessions plus courtes acceptées sans culpabilité pédagogique
- Célébrations petites victoires quotidiennes pour moral collectif

*Parent rapporte difficultés application stratégies maison:*
- Coaching familial avec suggestions adaptées contexte spécifique révélé
- Ressources supplémentaires selon défis identifiés sans jugement
- Collaboration renforcée sans critique approches actuelles parentales
- Reconnaissance que apprentissage émotionnel prend temps et patience

**RESSOURCES ESSENTIELLES POST-VACANCES:**
• **Littérature:** Livres émotions et amitié français, histoires reconnexion
• **Matériel:** Cartes émotions visuelles, thermomètre classe, coussin espace calme  
• **Musique:** Playlist relaxation, énergisation hivernale, chansons amitié
• **Visuels:** Affiches stratégies calme, photos expressions faciales diverses
• **Espace:** Coin calme désigné permanent, espace cercle discussion

**INTÉGRATION INTERDISCIPLINAIRE NATURELLE:**

• **Français:** Expression orale émotions, vocabulaire relationnel, écriture sentiments
• **Mathématiques:** Graphique émotions classe, patterns comportements, statistiques amitié
• **Sciences:** Corps et émotions (cœur, respiration), impact stress et relaxation
• **Arts:** Expression créative émotions, art collaboratif, couleurs sentiments
• **Études sociales:** Relations communautaires, résolution conflits historiques

**STRATÉGIES TRAUMA-INFORMED CRITIQUES:**

**SÉCURITÉ ÉMOTIONNELLE ABSOLUE:**
- Prévisibilité routine pour sécurité retrouvée après pause
- Choix dans niveau participation sans conséquences négatives
- Aucune pression partage expériences personnelles ou familiales
- Validation toutes expériences vacances sans jugement situation
- Protocole clair si révélations inquiétantes nécessitent intervention

**RÉVÉLATIONS ÉMOTIONNELLES SENSIBLES:**
- Formation équipe reconnaissance signaux détresse émotionnelle
- Collaboration immédiate direction si préoccupations sécurité enfant
- Documentation factuelle sans interrogation intrusive ou pressions
- Ressources soutien affichées discrètement et accessibles constamment

**CONSIDÉRATIONS HIVER SPÉCIFIQUES:**
• Impact manque lumière sur humeur et énergie collective
• Activités lumineuses artificielles pour compenser déficit solaire
• Reconnaissance blues janvier normal et temporaire  
• Célébration petites victoires quotidiennes pour moral positif
• Adaptation énergie collective selon conditions climatiques

**PARTENARIAT FAMILLE RENFORCÉ POST-VACANCES:**
• Communication pré-retour fin décembre avec suggestions préparation
• Stratégies cohérentes maison-école pour transitions émotionnelles
• Partage outils gestion émotions adaptés contexte familial
• Suggestions activités famille renforcement liens durant hiver
• Reconnaissance défis parentaux période post-fêtes

**SENSIBILITÉS CULTURELLES ÉMOTIONNELLES:**
• Respect différentes expressions culturelles émotions et conflits
• Inclusion traditions diverses gestion émotions familiales
• Adaptation activités selon sensibilités religieuses ou culturelles  
• Célébration contributions diverses à compréhension émotionnelle
• Évitement stéréotypes culturels expressions émotionnelles

**PROTOCOLES URGENCE ÉMOTIONNELLE:**
• Signalement obligatoire si révélations abus ou négligence
• Ressources crise immédiatement disponibles et contacts affichés
• Formation continue équipe gestion crises émotionnelles enfants
• Collaboration interdisciplinaire avec travailleurs sociaux, psychologues
• Documentation professionnelle selon protocoles établis école

**INDICATEURS SUCCÈS POST-VACANCES RÉALISTES:**

**CŒUR (Tous élèves):**
□ 100% élèves réintégrés confortablement routine classe fin janvier
□ Utilisation spontanée vocabulaire émotionnel approprié conversations
□ Diminution observable conflits cour récréation et interactions classe
□ Augmentation comportements empathiques et entraide observés quotidiennement  
□ Participation active cercles discussion et partage selon confort personnel
□ Application autonome stratégies calme lors frustrations ou déceptions

**EXTENSIONS (Participation volontaire):**
□ Élèves participants partagent traditions familiales avec respect mutuel
□ Projets empathie complétés selon intérêts et capacités individuelles
□ Leadership positif démontré par volontaires dans résolution conflits pairs
□ Connexions communautaires établies selon ressources et opportunités disponibles

**COMMUNICATION FAMILLE CONTINUATION:**
□ Familles rapportent discussions positives stratégies émotions maison
□ Amélioration gestion conflits familiaux avec techniques apprises école
□ Utilisation vocabulaire émotionnel approprié contexte familial
□ Demandes ressources supplémentaires selon besoins identifiés collaboration

**PRÉPARATION TRANSITION PRINTEMPS:**
- Messages espoir et renouveau avec changement saison approchant
- Consolidation apprentissages émotionnels avant unité nutrition-énergie  
- Célébration croissance relationnelle depuis septembre
- Anticipation positive défis et opportunités remainder année scolaire`;

    await prisma.unitPlan.update({
      where: { id: unit3.id },
      data: { 
        description: perfectUnit3Complete
      }
    });
    
    console.log('✅ Unit 3 manually perfected with complete pedagogical framework:');
    console.log('   • All essential pedagogical elements included');
    console.log('   • Comprehensive ETFO framework with detailed timings');
    console.log('   • Complete assessment and differentiation strategies');
    console.log('   • Ultra-concrete flexibility scenarios (8 major scenarios)');
    console.log('   • Post-winter break trauma-informed approaches');
    console.log('   • Full vocabulary, interdisciplinary, and cultural elements');
    console.log('   • Ready for immediate classroom implementation');
    
  } catch (error) {
    console.error('❌ Error creating perfect Unit 3:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPerfectUnit3Complete();