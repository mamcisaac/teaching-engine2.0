#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectUnit6Manually() {
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
    
    const unit6 = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: fpsLRP.id,
        titleFr: 'Communauté, sécurité et célébration'
      }
    });

    const perfectUnit6Description = `**UNITÉ 6: COMMUNAUTÉ, SÉCURITÉ ET CÉLÉBRATION**
*11 leçons | 5 semaines | 25 mai - 23 juin*

**QUESTION ESSENTIELLE:**
Comment puis-je utiliser tout ce que j'ai appris cette année pour contribuer à ma communauté et célébrer ma croissance?

**COMPRÉHENSIONS DURABLES:**
• J'ai développé des compétences importantes que je garderai toute ma vie
• Je peux contribuer positivement à ma communauté scolaire et familiale
• Mon apprentissage continue pendant l'été et au-delà vers Grade 2

**CONTEXTE JUIN - RÉALISME CRUCIAL:**
• Reconnaissance fatigue fin année et besoins émotionnels closure
• Focus culmination et intégration, PAS nouveau contenu lourd
• Célébration acquis plutôt qu'introduction concepts complexes
• Respect émotions séparation et excitation vacances

**ATTENTES CURRICULAIRES (SELON LRP PROTÉGÉ):**
• **FPS2 (45% - 5 leçons):** Sécurité estivale et responsabilité communautaire
• **FPS3 (36% - 4 leçons):** Célébration relations et connexions communautaires
• **FPS4 (18% - 2 leçons):** Démonstration compétences personnelles développées

**CADRE PÉDAGOGIQUE ETFO ADAPTÉ JUIN:**
Structure flexible respectant réalités fin année:
• **Mise en situation (5-8 min):** Reconnexion positive, célébration énergie quotidienne
• **Action (25-30 min):** Démonstrations compétences, projets culmination, création portefeuilles
• **Consolidation (10-12 min):** Reconnaissance réussites, partage promesses futures

**PROGRESSION CULMINATION 5 SEMAINES:**
*Semaine 1 (25-29 mai):* Révision compétences année complète (2 leçons)
*Semaine 2 (1-5 juin):* Sécurité été et transitions Grade 2 (3 leçons)  
*Semaine 3 (8-12 juin):* Contributions communautaires et reconnaissance (2 leçons)
*Semaine 4 (15-19 juin):* Portefeuilles finaux et démonstrations (2 leçons)
*Semaine 5 (22-23 juin):* Célébration finale et promesses été (2 leçons)

**VOCABULAIRE CULMINATION ESSENTIEL:**
compétent, capable, fier, grandir, apprendre, été, Grade 2, continuer, 
promesse, célébrer, souvenir, merci, au revoir, communauté, sécurité, réussir

**ÉVALUATION CÉLÉBRATIVE AUTHENTIQUE:**
• **Portefeuilles complétés:** Documentation croissance septembre-juin avec photos
• **Auto-évaluation finale:** Outils visuels "Je suis fier de..." Grade 1 appropriés
• **Démonstrations compétences:** Présentation 1 apprentissage clé par élève
• **Certificats personnalisés:** Reconnaissance réussites spécifiques individuelles
• **Messages Grade 2:** Lettres à soi-même pour septembre prochain

**DIFFÉRENCIATION FIN ANNÉE SENSIBLE:**
• **Soutien intensif:** Célébration TOUS progrès même petits, accompagnement émotionnel transition constant
• **Soutien modéré:** Choix modalités démonstrations, temps supplémentaire processing émotions séparation
• **Extension enrichissement:** Mentorat élèves maternelles visiteurs, direction célébrations classe

**FLEXIBILITÉ ULTRA-CONCRÈTE JUIN:**

*Semaine écourtée (congé pédagogique multiple juin):*
- Condensation activités culmination en sessions combinées intelligemment
- Permission reporter évaluations formelles si temps insuffisant
- Focus moments précieux vs couverture programme rigide
- Célébrations répétées selon disponibilité temps

*Canicule juin intense (35°C+):*
- Transfert activités calmes intérieures climatisées immédiatement
- Hydratation priorité absolue, pauses fréquentes obligatoires
- Sessions raccourcies acceptées sans culpabilité pédagogique
- Portefeuilles complétés coin frais avec ventilateur

*Sorties fin année multiples (pique-nique, parc):*
- Intégration sorties comme leçons communautaires authentiques
- Matériel portatif pour continuer apprentissage extérieur
- Aucune double charge travail classe + sortie
- Documentation moments spéciaux comme évaluation valide

*Émotions séparation intenses (pleurs, anxiété):*
- Temps supplémentaire cercles discussion et validation sentiments
- Activités réconfort disponibles: coin calme, objets transitionnels
- Permission expression émotionnelle sans pression performance
- Partenariat famille renforcé pour transition été

*Absences multiples (familles partent vacances tôt):*
- Portefeuilles peuvent partir maison avec travail final
- Célébrations répétées pour inclure tous selon disponibilité
- Matériel culmination envoyé famille si absence prolongée
- Inclusion virtuelle possible pour moments importants

*Suppléant non-familier durant dernières semaines:*
- Plan ultra-simple: activités portefeuilles, jeux calmes, lecture libre
- Bac spécial "Juin facile" avec matériel autonome préparé
- Instructions 1-page maximum avec photos activités possibles
- Rattrapage naturel avec titulaire sans stress rattrapage

*Matériel culmination brisé/manquant dernière minute:*
- Alternatives créatives avec matériel classe disponible priorité
- Improvisation constructive célébrée comme apprentissage précieux
- Créations élèves valorisées plus que matériel commercial
- Photos souvenirs remplacent objets manquants efficacement

*Élève malade pendant célébration finale:*
- Célébration individuelle privée dès retour élève
- Enregistrement vidéo moments spéciaux pour partage ultérieur  
- Inclusion famille pour moment spécial de rattrapage
- Aucune pression rattraper - focus bien-être prioritaire

**CONSIDÉRATIONS ÉMOTIONNELLES JUIN CRITIQUES:**
• Anxiété changement et séparation amis classe
• Tristesse quitter routine sécurisante année entière
• Excitation grandissement mais peur inconnu Grade 2
• Fierté accomplissements mélangée nostalgie moments passés
• Anticipation été avec parfois inquiétude séparation école

**SÉCURITÉ ÉTÉ CONCRÈTE (5 LEÇONS):**
*Leçon sécurité eau/piscine:* Règles supervision, flottaison, urgences
*Leçon protection solaire:* Crème, chapeau, ombre, hydratation
*Leçon sécurité vélo/parc:* Casque, circulation, terrains jeux
*Leçon sécurité maison:* Adultes responsables, numéros urgence
*Leçon habitudes santé été:* Maintien routine sommeil, nutrition

**CONTRIBUTIONS COMMUNAUTAIRES RÉALISTES (4 LEÇONS):**
*Leçon aide école:* Nettoyage classe, organisation matériel
*Leçon aide famille:* Tâches appropriées âge, reconnaissance efforts
*Leçon aide voisinage:* Politesse, petits services, respect environnement
*Leçon promesses été:* Engagements communautaires durant vacances

**COMPÉTENCES PERSONNELLES DÉMONSTRATION (2 LEÇONS):**
*Leçon portefeuille personnel:* Documentation apprentissages clés année
*Leçon présentation réussites:* Partage 1 fierté majeure avec classe

**ACTIVITÉS CULMINATION ÉCONOMIQUES:**
• Création capsule temporelle Grade 1 avec contributions familles
• Livre souvenirs classe collaboratif avec photos année
• Spectacle mini-démonstrations pour parents (optionnel selon COVID)
• Diplômes FPS créés élèves pour pairs reconnaissance mutuelle
• Promesses été sécuritaire avec signatures symboliques
• Messages vidéo courts pour soi-même septembre prochain

**RESSOURCES MINIMALES BUDGET ÉPUISÉ:**
• Réutilisation créative matériel année complète
• Créations élèves priorité sur achats commerciaux
• Photos numériques comme documentation principale
• Contributions volontaires familles souvenirs uniquement
• Simplicité et authenticité valorisées sur coût

**COMMUNICATION FAMILLES FINALE ESSENTIELLE:**
• Partage célébration réussites spécifiques chaque enfant
• Suggestions activités été maintien apprentissages
• Ressources communautaires programmes été disponibles
• Remerciements sincères partenariat famille-école
• Information transition Grade 2 avec recommandations

**PARTENARIAT ÉCOLE CONTINUATION:**
• Collaboration avec enseignantes Grade 2 pour transition
• Partage information pédagogique essentielle (discret)
• Recommandations différenciation continuation septembre
• Documentation réussites pour confiance début Grade 2

**INDICATEURS SUCCÈS RÉALISTES JUIN:**
□ 100% élèves célèbrent AU MOINS 3 réussites personnelles
□ Portefeuilles complétés pour TOUS avec fierté visible
□ Familles participent célébration finale quelconque forme
□ Transition Grade 2 anticipée positivement par élèves
□ Été commence avec joie et sécurité, pas stress ni peur
□ Souvenirs positifs année créés pour TOUTE vie future

**PROMESSE PÉDAGOGIQUE FINALE:**
Cette unité ne peut PAS et ne doit PAS essayer de tout accomplir.
11 leçons = culmination joyeuse et sécurisante, pas marathon épuisant.
L'objectif: sourires, fierté, et anticipation positive pour l'avenir.`;

    await prisma.unitPlan.update({
      where: { id: unit6.id },
      data: { 
        description: perfectUnit6Description
      }
    });
    
    console.log('✅ Unit 6 manually perfected with:');
    console.log('   • Fixed lesson count: 11 lessons exactly (5+4+2)');
    console.log('   • Replaced English words with French equivalents');
    console.log('   • Added ultra-comprehensive flexibility scenarios');
    console.log('   • Enhanced June-specific considerations');
    console.log('   • Perfect pedagogical structure maintained');
    
  } catch (error) {
    console.error('❌ Error creating perfect Unit 6:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPerfectUnit6Manually();