#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enhanceFlexibilityAllUnits() {
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

    console.log('🔄 ENHANCING FLEXIBILITY SCENARIOS TO MATCH UNIT 1 EXCELLENCE');
    console.log('============================================================');

    // Unit 2: Security and Protection specific scenarios
    const unit2FlexibilityAddition = `

**FLEXIBILITÉ ULTRA-CONCRÈTE OCTOBRE-DÉCEMBRE:**

*Action de Grâce lundi férié (première semaine octobre):*
- Leçon sécurité gratitude famille condensée mardi avec extension naturelle
- Activités reconnaissance safety helpers communauté intégrées
- Aucune précipitation rattrapage - timeline s'ajuste automatiquement
- Documentation photographique moments gratitude pour portefeuille d'apprentissage

*Élève révèle situation préoccupante durant leçon sécurité:*
- Arrêt immédiat discussion générale, support individuel élève priorité
- Protocole signalement activé discrètement pendant classe continue
- Direction informée immédiatement avec documentation factuelle
- Collaboration équipe soutien pour suivi approprié et sécurité élève

*Exercice évacuation feu interrompt leçon prévention incendie:*
- Ironie célébrée: "Parfait timing pour pratiquer ce qu'on apprend!"
- Debriefing post-exercice devient partie intégrante leçon
- Observations comportements réels vs théorie discutées appropriément
- Validation émotions si élèves stressés par alarme ou confusion

*Halloween perturbation routines sécurité (fin octobre):*
- Adaptation leçons sécurité aux réalités déguisements et collecte
- Intégration naturelle: sécurité costumes, marche nuit, maisons étrangères
- Équilibre plaisir fête avec apprentissages sécurité authentiques
- Respect familles non-participantes avec alternatives inclusives

*Suppléant non-formé enjeux sécurité sensibles:*
- Plan ultra-simple: révision règles classe, lecture livres sécurité
- Matériel dans bac étiquetée "Sécurité Simple" avec guidance 1-page
- Aucune nouvelle notion traumatisante sans expertise appropriée
- Contact immédiat direction si révélations inquiétantes pendant absence

*Matériel démonstration sécurité brisé/dangereux:*
- Inspection sécurité quotidienne matériel avant utilisation obligatoire
- Alternatives sécurisées toujours préparées avec matériel classe
- Démonstration verbale ou dessin si matériel physique compromis
- Sécurité priorité absolue sur démonstration "parfaite"

*Parent inquiet approche sécurité famille différente:*
- Validation respectueuse différences culturelles et expériences parentales
- Discussion privée focus complémentarité école-maison vs confrontation
- Adaptation activités respecter valeurs familiales sans compromise sécurité
- Ressources communautaires offertes selon besoins identifiés

*Congés multiples novembre (vétérans, pédagogiques):*
- Flexibilité timeline avec maintien objectifs sécurité essentiels
- Leçons condensées intelligemment selon disponibilité temps
- Focus qualité vs quantité pendant périodes perturbées
- Anticipation perturbations dans planification initiale`;

    // Unit 3: Emotions and Relations specific scenarios  
    const unit3FlexibilityAddition = `

*Première journée retour vacances (6 janvier - énergie variable):*
- Leçon 1 peut devenir 2 jours si reconnexion nécessite plus temps
- Météo émotionnelle priorité sur curriculum rigide première semaine
- Permission élèves partager vacances avant apprentissages formels
- Flexibilité totale selon énergie collective et individuelle observée

*Tempête verglas fermeture école (janvier typique PEI):*
- Matériel simple envoyé familles: dessin émotions, cercle famille
- Rattrapage naturel focus reconnexion vs rattrapage contenu manqué
- Célébration sécurité à la maison pendant intempéries extrêmes
- Intégration expérience météo comme apprentissage résilience

*Élève en crise émotionnelle majeure durant cercle partage:*
- Évacuation douce vers espace calme avec partenaire d'aide immédiatement
- Classe continue avec leader élève pendant intervention individuelle
- Débrief discret post-crise focus apprentissage vs incident
- Documentation professionnelle pour équipe soutien selon besoin

*Conflit majeur cour récré avant leçon résolution conflits:*
- Opportunité d'apprentissage authentique avec protagonistes consentants
- Médiation immédiate avec témoins classe comme observateurs
- Application directe stratégies enseignées à situation réelle
- Célébration résolution réussie renforce apprentissages théoriques

*Saint-Valentin exclusion potentielle (14 février):*
- Transformation en célébration amitiés inclusives pour TOUS
- Activités reconnaissance qualités positives chaque élève
- Évitement cartes romantiques focus amitié et communauté classe
- Sensibilité familles non-célébrantes avec alternatives significatives

*Suppléant non-spécialisé relations émotionnelles:*
- Plan sécuritaire: jeux coopératifs calmes, lecture émotions
- Évitement discussions personnelles profondes sans expertise
- Contact direction si révélations émotionnelles préoccupantes
- Rattrapage avec titulaire focus continuité vs nouveau contenu

*Fatigue collective mi-février (blues hivernal):*
- Permission réduire objectifs aux essentiels seulement cette période
- Activités plus énergisantes: mouvement, musique, art thérapie
- Sessions plus courtes acceptées avec qualité maintenue
- Célébrations petites victoires pour moral collectif

*Parent rapporte difficultés application stratégies maison:*
- Coaching familial avec suggestions adaptées contexte spécifique
- Ressources supplémentaires selon défis identifiés
- Collaboration renforcée sans jugement approches actuelles
- Reconnaissance que apprentissage émotionnel prend temps`;

    // Unit 4: Nutrition and Energy specific scenarios
    const unit4FlexibilityAddition = `

*Élève réaction allergique durant exploration alimentaire:*
- Protocole urgence activé immédiatement avec EpiPen si nécessaire
- Évacuation classe si situation grave, poursuite activité corridor
- Documentation détaillée incident pour administration et famille
- Révision liste allergies et procédures avec toute équipe

*Semaine relâche mars (2-6 mars) - intégration naturelle:*
- Unité CONÇUE avec pause: semaines 1-2 pré-relâche, 3-4 post-relâche
- Aucun devoirs ou projets durant pause familiale respectée
- Retour focus reconnexion énergétique et nouvelles habitudes
- Documentation photos familles activités santé pendant relâche

*Famille situation économique précaire - sensibilité nutritionelle:*
- Aucune activité nécessitant achats alimentaires spécifiques
- Focus aliments accessibles disponibles banques alimentaires
- Célébration créativité culinaire vs coûts élevés
- Ressources communautaires partagées discrètement selon besoin

*Carême/Ramadan/observances religieuses nutritionnelles:*
- Adaptation respectueuse restrictions temporaires ou permanentes
- Focus mouvement et énergie si alimentation limitée période
- Célébration discipline spirituelle comme force personnelle
- Inclusion toutes traditions sans compromis respect croyances

*Parent obsédé "alimentation parfaite" créant pression:*
- Discussion privée focus équilibre vs perfection stressante
- Redirection vers acceptation et plaisir vs restriction anxieuse
- Collaboration pour messages cohérents maison-école
- Ressources si indications troubles alimentaires émergents

*Matériel exploration nutritionnelle contaminé/périmé:*
- Vérification quotidienne fraîcheur et sécurité avant activités
- Alternatives visuelles (photos, dessins) si matériel compromis
- Priorité sécurité sur expérience sensorielle complète
- Improvisation créative avec matériel sécuritaire disponible

*Élève refuse participation activités nutritionnelles:*
- Respect choix sans pression ni conséquences négatives
- Alternatives observation, dessin, discussion selon confort
- Investigation discrète causes potentielles (allergies, phobies)
- Inclusion sans participation directe si anxiété alimentaire

*Printemps précoce perturbant activités mouvement planifiées:*
- Adaptation activités extérieures selon météo réelle vs prévue
- Célébration changements saisonniers comme apprentissage
- Flexibilité espaces utilisés selon conditions climatiques
- Intégration nature printanière dans exploration énergie`;

    // Unit 5: Movement and Wellbeing specific scenarios
    const unit5FlexibilityAddition = `

*Allergies saisonnières printanières affectant mouvement extérieur:*
- Alternative intérieure immédiate pour élèves affectés
- Adaptation intensité selon capacités respiratoires réduites
- Collaboration famille pour médications préventives selon besoin
- Inclusion tous dans mouvement adapté capacités individuelles

*Pâques/congés variables interrompant progression mouvement:*
- Timeline flexible selon calendrier religieux familial
- Activités mouvement famille durant congés avec suggestions
- Retour graduel intensité post-congés selon niveau énergie
- Célébration traditions diverses incluant mouvement culturel

*Élève blessure mineure durant activité mouvement:*
- Premiers soins immédiats avec trousse classe et formation
- Adaptation immédiate activité pour inclusion avec limitation
- Documentation incident selon protocoles école établis
- Communication famille même pour blessures mineures

*Canicule précoce mai limitant mouvement intense:*
- Réduction automatique intensité selon température extérieure
- Hydratation fréquente obligatoire avec pauses ombre
- Transfert activités intérieures climatisées si nécessaire
- Adaptation horaire éviter heures plus chaudes journée

*Équipement mouvement brisé/indisponible:*
- Alternatives créatives avec objets classe standards
- Mouvement corporel libre sans équipement spécialisé
- Priorité sécurité sur performance avec équipement défaillant
- Improvisation célébrée comme adaptabilité positive

*Élève anxiété performance mouvement devant pairs:*
- Options participation privée ou avec partenaire d'aide choisi
- Focus effort individuel vs comparaison avec autres
- Célébration courage tentative vs réussite parfaite
- Alternatives expression mouvement selon zone confort

*Sorties extérieures annulées météo/restrictions:*
- Versions intérieures préparées pour tous objectifs mouvement
- Adaptation créative espaces restreints avec sécurité maintenue
- Frustration validée et transformée en apprentissage adaptabilité
- Promesse reprise extérieure dès conditions permises

*Parent inquiet niveau activité physique enfant:*
- Discussion rassurante capacités développementales normales
- Suggestions encouragement mouvement maison selon recommandations
- Collaboration pour objectifs réalistes et encouragement mutuel
- Ressources si préoccupations développementales légitimes`;

    console.log('Updating Units 2-5 with enhanced flexibility scenarios...\n');

    // Apply enhancements to Units 2-5
    const flexibilityAdditions = {
      1: unit2FlexibilityAddition, // Index 1 = Unit 2
      2: unit3FlexibilityAddition, // Index 2 = Unit 3
      3: unit4FlexibilityAddition, // Index 3 = Unit 4
      4: unit5FlexibilityAddition  // Index 4 = Unit 5
    };

    for (const [index, flexibilityContent] of Object.entries(flexibilityAdditions)) {
      const unitIndex = parseInt(index);
      const unit = units[unitIndex];
      
      console.log(`📚 Enhancing Unit ${unitIndex + 1}: ${unit.titleFr}`);
      
      let description = unit.description || '';
      
      // Find insertion point (before INDICATEURS or at end)
      const insertionPoint = description.indexOf('**INDICATEURS');
      if (insertionPoint !== -1) {
        // Insert before INDICATEURS section
        description = description.substring(0, insertionPoint) + 
                     flexibilityContent + '\n\n' + 
                     description.substring(insertionPoint);
      } else {
        // Append at end if no INDICATEURS section found
        description = description + flexibilityContent;
      }
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: { description }
      });
      
      console.log(`   ✅ Added ultra-concrete flexibility scenarios`);
    }

    console.log(`\n🎯 FLEXIBILITY ENHANCEMENT COMPLETED:`);
    console.log(`   • Units 2-5 enhanced with Unit 1 quality scenarios`);
    console.log(`   • All units now have ultra-concrete flexibility coverage`);
    console.log(`   • Real classroom situations addressed comprehensively`);
    
  } catch (error) {
    console.error('❌ Error enhancing flexibility:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enhanceFlexibilityAllUnits();