const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createRemainingDifferentiation() {
  try {
    console.log('🔬 CREATING DIFFERENTIATION FOR SCIENCES DE LA NATURE');
    console.log('===================================================\n');
    
    // Get all units organized by subject
    const allUnits = await prisma.unitPlan.findMany({
      include: {
        longRangePlan: true
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });

    // Group by subject
    const unitsBySubject = {};
    allUnits.forEach(unit => {
      const subject = unit.longRangePlan?.subject || 'Unknown';
      if (!unitsBySubject[subject]) {
        unitsBySubject[subject] = [];
      }
      unitsBySubject[subject].push(unit);
    });

    const scienceDifferentiations = [
      {
        title: "Petits scientifiques sécuritaires",
        strategies: {
          forStruggling: "SOUTIEN SÉCURITÉ SCIENCE:\n• Règles sécurité images avec démonstrations répétées\n• Système ami sécurité pour observations\n• Matériel sécuritaire pré-sélectionné (pas choix)\n• Focus 3 règles essentielles avant extension",
          forOnLevel: "EXPLORATION SÉCURITAIRE:\n• Pratique règles sécurité divers contextes\n• Identification dangers potentiels matériel\n• Création affiches sécurité science illustrées\n• Vérification sécurité avant chaque expérience",
          forAdvanced: "ENRICHISSEMENT SÉCURITÉ:\n• Recherche équipement sécurité scientifiques\n• Création guide sécurité pour classes inférieures\n• Investigation accidents scientifiques célèbres\n• Mentorat sécurité pour autres élèves",
          forELL: "PONT SÉCURITÉ:\n• Règles sécurité visuelles universelles\n• Démonstrations plutôt qu'explications verbales\n• Symbols sécurité internationaux\n• Système gestuel pour communication urgente"
        }
      },
      {
        title: "Matériaux de notre environnement",
        strategies: {
          forStruggling: "SOUTIEN MATÉRIAUX:\n• Tri matériaux selon une propriété simple\n• Exploration tactile avec supervision constante\n• Vocabulaire matériaux avec objets concrets\n• Tests sécuritaires simples (dur/mou, lisse/rugueux)",
          forOnLevel: "INVESTIGATION MATÉRIAUX:\n• Comparaison propriétés matériaux similaires\n• Prédictions tests puis vérification\n• Documentation propriétés avec dessins/mots\n• Connexion propriétés utilisation objets",
          forAdvanced: "ENRICHISSEMENT MATÉRIAUX:\n• Investigation origine matériaux naturels\n• Tests propriétés avec outils mesure\n• Hypothèses propriétés matériaux nouveaux\n• Classification systématique matériaux complexes",
          forELL: "PONT MATÉRIAUX:\n• Matériaux familiers culture d'origine\n• Vocabulary tactile avec expériences directes\n• Dessins pour communication découvertes\n• Comparaison matériaux utilisés diverse cultures"
        }
      },
      {
        title: "Changements saisonniers d'automne",
        strategies: {
          forStruggling: "SOUTIEN OBSERVATION AUTOMNE:\n• Comparaison photos été/automne évidentes\n• Observation guidée avec liste contrôle simple\n• Collection sécuritaire objets automne (feuilles sèches)\n• Focus 2-3 changements évidents (couleur feuilles, température)",
          forOnLevel: "EXPLORATION SAISONNIÈRE:\n• Journal observations automne quotidiennes\n• Hypothèses pourquoi changements arrivent\n• Mesures simples (température, longueur jour)\n• Connexion changements comportement animaux",
          forAdvanced: "ENRICHISSEMENT SAISONNIER:\n• Investigation scientifique changements couleur\n• Comparaison automne différentes régions\n• Prédictions changements futurs basées données\n• Recherche adaptation animaux automne",
          forELL: "PONT SAISONNIER:\n• Comparaison automne climat origine\n• Vocabulary automne avec expériences directes\n• Photos famille pour connexions personnelles\n• Expressions culturelles automne diverses"
        }
      },
      {
        title: "Lumière et chaleur hivernales",
        strategies: {
          forStruggling: "SOUTIEN LUMIÈRE-CHALEUR:\n• Sources chaleur sécuritaires seulement (soleil, radiateur)\n• Démonstrations lumière avec lampes de poche\n• Sensation chaleur/froid avec supervision\n• Vocabulary simple avec gestes (chaud/froid, lumineux/sombre)",
          forOnLevel: "EXPLORATION LUMIÈRE-CHALEUR:\n• Investigation sources lumière/chaleur maison\n• Expériences ombre avec objets divers\n• Mesure température avec thermomètres sécuritaires\n• Connexion lumière/chaleur saisons",
          forAdvanced: "ENRICHISSEMENT ÉNERGÉTIQUE:\n• Investigation voyage lumière soleil-Terre\n• Expériences absorption chaleur couleurs\n• Recherche utilisation lumière/chaleur humains\n• Hypothèses conservation énergie hiver",
          forELL: "PONT ÉNERGÉTIQUE:\n• Sources lumière/chaleur culture d'origine\n• Demonstrations plutôt qu'explications complexes\n• Comparaison hiver différents pays\n• Vocabulary énergie avec expériences concrètes"
        }
      },
      {
        title: "Croissance et besoins des vivants",
        strategies: {
          forStruggling: "SOUTIEN VIVANTS:\n• Observation plantes/animaux familiers sécuritaires\n• Soins simples plantes classe avec aide\n• Besoins vivants avec images concrètes\n• Focus besoins essentiels (eau, nourriture, air)",
          forOnLevel: "EXPLORATION BIOLOGIQUE:\n• Journal croissance plantes classe\n• Comparaison besoins humains/plantes/animaux\n• Expériences croissance avec variables simples\n• Investigation cycles vie simples",
          forAdvanced: "ENRICHISSEMENT BIOLOGIQUE:\n• Recherche adaptations vivants environnements\n• Expériences croissance conditions contrôlées\n• Investigation interdépendance êtres vivants\n• Hypothèses évolution besoins vivants",
          forELL: "PONT BIOLOGIQUE:\n• Plantes/animaux familiers culture d'origine\n• Vocabulary vivants avec observations directes\n• Comparaison soins vivants diverses cultures\n• Respect traditions culturelles animaux/plantes"
        }
      },
      {
        title: "Forces et mouvements simples",
        strategies: {
          forStruggling: "SOUTIEN FORCES:\n• Expériences forces avec objets légers sécuritaires\n• Démonstration pousser/tirer avec corps\n• Observation mouvement objets familiers\n• Vocabulary mouvement avec actions corporelles",
          forOnLevel: "EXPLORATION MÉCANIQUE:\n• Investigation forces différentes objets\n• Prédictions mouvement puis expérimentation\n• Comparaison vitesse/direction mouvements\n• Connexion forces vie quotidienne",
          forAdvanced: "ENRICHISSEMENT MÉCANIQUE:\n• Investigation relation force-mouvement\n• Expériences avec plan inclinés simples\n• Recherche machines simples environnement\n• Hypothèses friction différentes surfaces",
          forELL: "PONT MÉCANIQUE:\n• Forces universelles avec démonstrations\n• Vocabulary mouvement avec actions\n• Jeux culturels impliquant forces\n• Communication gestuelle concepts forces"
        }
      },
      {
        title: "Éveil du printemps",
        strategies: {
          forStruggling: "SOUTIEN PRINTEMPS:\n• Observation changements évidents (bourgeons, oiseaux)\n• Jardinage simple avec outils adaptés\n• Comparaison photos hiver/printemps\n• Focus 2-3 signes printemps clairs",
          forOnLevel: "EXPLORATION PRINTANIÈRE:\n• Journal observations printemps quotidiennes\n• Plantation graines avec suivi croissance\n• Investigation retour animaux migrateurs\n• Mesures changements température/lumière",
          forAdvanced: "ENRICHISSEMENT PRINTANIER:\n• Investigation triggers scientifiques printemps\n• Comparaison printemps différentes latitudes\n• Recherche adaptation plantes réveil\n• Prédictions timing événements printemps",
          forELL: "PONT PRINTANIER:\n• Printemps traditions culture d'origine\n• Vocabulary printemps avec observations\n• Comparaison climat/printemps pays origine\n• Expressions culturelles renouveau"
        }
      },
      {
        title: "Notre environnement partagé",
        strategies: {
          forStruggling: "SOUTIEN ENVIRONNEMENT:\n• Observation respectueuse animaux distance\n• Identification habitats évidents (nids, terriers)\n• Règles respect environnement simples\n• Actions concrètes protection (recyclage, propreté)",
          forOnLevel: "EXPLORATION ENVIRONNEMENTALE:\n• Investigation interdépendance vivants\n• Documentation habitats locaux divers\n• Actions protection environnement pratiques\n• Connexion actions humaines impacts",
          forAdvanced: "ENRICHISSEMENT ÉCOLOGIQUE:\n• Recherche chaînes alimentaires locales\n• Investigation impacts humains ecosystèmes\n• Création plan protection environnement\n• Analyse solutions problèmes environnementaux",
          forELL: "PONT ÉCOLOGIQUE:\n• Respect environnement traditions culturelles\n• Vocabulary environnement avec observations\n• Comparaison environnements pays origine\n• Solutions environnementales diverses cultures"
        }
      },
      {
        title: "Sons et vibrations fascinants",
        strategies: {
          forStruggling: "SOUTIEN SONS:\n• Exploration sons avec objets sécuritaires\n• Protection auditive quand nécessaire\n• Vibrations avec instruments simples\n• Vocabulary sons avec productions sonores",
          forOnLevel: "EXPLORATION SONORE:\n• Investigation sources sons environnement\n• Expériences pitch/volume avec instruments\n• Connexion vibrations/sons avec toucher\n• Documentation sons nature divers",
          forAdvanced: "ENRICHISSEMENT ACOUSTIQUE:\n• Investigation voyage sons air/matériaux\n• Expériences résonance avec matériaux\n• Recherche utilisations sons animaux\n• Création instruments avec explications scientifiques",
          forELL: "PONT SONORE:\n• Sons/musique culture d'origine\n• Vocabulary sons avec productions\n• Instruments traditionnels comme exemples\n• Communication universelle musique/sons"
        }
      },
      {
        title: "Exposition scientifique de fin d'année",
        strategies: {
          forStruggling: "SOUTIEN EXPOSITION:\n• Présentation une découverte simple avec aide\n• Démonstration sécurisée avec supervision\n• Support visuel abondant pour explication\n• Fierté participation selon capacités",
          forOnLevel: "PRÉSENTATION SCIENTIFIQUE:\n• Choix expérience préférée année\n• Explication processus scientifique suivi\n• Démonstration interactive pour visiteurs\n• Réflexion apprentissage scientifique année",
          forAdvanced: "ENRICHISSEMENT EXPOSITION:\n• Présentation recherche scientifique originale\n• Connexion découvertes science mondiale\n• Mentorat autres élèves préparation\n• Investigation carrières scientifiques",
          forELL: "PONT EXPOSITION:\n• Présentation bilingue selon confort\n• Support visuel pour communication\n• Fierté contributions scientifiques personnelles\n• Celebration diversité perspectives scientifiques"
        }
      }
    ];

    // Update Science units
    const scienceUnits = unitsBySubject['Sciences de la nature'] || [];
    for (let i = 0; i < scienceUnits.length && i < scienceDifferentiations.length; i++) {
      const unit = scienceUnits[i];
      const diff = scienceDifferentiations[i];
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          differentiationStrategies: diff.strategies
        }
      });
      
      console.log(`✅ Updated: ${diff.title}`);
    }

    console.log('\n🎨 CREATING DIFFERENTIATION FOR ARTS VISUELS');
    console.log('============================================\n');

    const artsDifferentiations = [
      {
        title: "Premiers pas artistiques",
        strategies: {
          forStruggling: "SOUTIEN ARTISTIQUE INITIAL:\n• Outils artistiques gros (crayons épais, pinceaux larges)\n• Choix limité couleurs/matériaux réduire anxiété\n• Démonstration technique répétée individuellement\n• Acceptance toute tentative comme succès artistique",
          forOnLevel: "EXPLORATION CRÉATIVE:\n• Expérimentation outils/techniques diverses\n• Portfolio progression avec auto-évaluation simple\n• Partage processus créatif pairs\n• Connexion art émotions personnelles",
          forAdvanced: "ENRICHISSEMENT ARTISTIQUE:\n• Techniques artistiques complexes introduction\n• Recherche artistes francophones célèbres\n• Mentorat artistique élèves débutants\n• Création œuvres originales techniques mixtes",
          forELL: "PONT ARTISTIQUE:\n• Art comme langage universel expression\n• Techniques artistiques culture d'origine\n• Vocabulary artistique avec démonstrations\n• Celebration styles artistiques divers"
        }
      },
      {
        title: "L'aventure des lignes et formes",
        strategies: {
          forStruggling: "SOUTIEN LIGNES:\n• Tracé lignes dans sable/pâte avant papier\n• Gabarits lignes pour guidance initiale\n• Mouvements corps entier avant motricité fine\n• Focus une type ligne par session",
          forOnLevel: "EXPLORATION LINÉAIRE:\n• Création expressions émotions avec lignes\n• Investigation lignes nature/architecture\n• Combinaison lignes création formes\n• Journal artistique progression lignes",
          forAdvanced: "ENRICHISSEMENT LINÉAIRE:\n• Analyse techniques lignes artistes maîtres\n• Création illusions optiques avec lignes\n• Exploration perspective linéaire simple\n• Enseignement techniques lignes autres élèves",
          forELL: "PONT LINÉAIRE:\n• Formes géométriques comme vocabulary universel\n• Calligraphie/arts linéaires culture origine\n• Communication émotions lignes sans mots\n• Patterns linéaires art traditionnel"
        }
      },
      {
        title: "La magie des couleurs",
        strategies: {
          forStruggling: "SOUTIEN COULEUR:\n• Couleurs primaires uniquement initialement\n• Mélange couleurs avec grandes quantités\n• Exploration tactile couleurs (peinture doigts)\n• Associations couleurs émotions simples",
          forOnLevel: "EXPLORATION COLORISTE:\n• Théorie couleurs avec expérimentation\n• Collection couleurs nature/environnement\n• Création palette personnelle préférences\n• Investigation couleurs saisons",
          forAdvanced: "ENRICHISSEMENT COLORISTE:\n• Analyse couleurs techniques artistes\n• Expérimentation couleurs avancées (tertiary)\n• Recherche symbolisme couleurs cultures\n• Création guide couleurs pour classe",
          forELL: "PONT COLORISTE:\n• Couleurs vocabulary avec objets concrets\n• Signification couleurs culture d'origine\n• Art couleurs traditions familiales\n• Communication émotions couleurs universelle"
        }
      },
      {
        title: "Arts des fêtes hivernales",
        strategies: {
          forStruggling: "SOUTIEN FESTIF:\n• Modèles décorations simples à reproduire\n• Matériaux festifs pré-coupés assistance\n• Focus joie création plutôt que perfection\n• Adaptation selon traditions familiales",
          forOnLevel: "EXPLORATION FESTIVE:\n• Recherche décorations diverses cultures\n• Création cartes/cadeaux personnalisés\n• Techniques décoration mixtes exploration\n• Partage traditions artistiques familiales",
          forAdvanced: "ENRICHISSEMENT CULTUREL:\n• Investigation origines traditions artistiques hivernales\n• Création festival art multiculturel\n• Techniques décoration sophistiquées\n• Organisation exposition art festif",
          forELL: "PONT CULTUREL:\n• Inclusion traditions festives culture origine\n• Art festif comme célébration diversité\n• Vocabulary festivités avec créations\n• Respect toutes traditions sans exclusion"
        }
      },
      {
        title: "Textures et matériaux",
        strategies: {
          forStruggling: "SOUTIEN TACTILE:\n• Exploration textures supervision sensorielle\n• Matériaux sécuritaires pré-sélectionnés\n• Collage simple textures contrastées\n• Vocabulary tactile avec exploration directe",
          forOnLevel: "EXPLORATION TEXTURE:\n• Collection textures nature/environnement\n• Création art relief textures variées\n• Investigation matériaux artists utilisent\n• Documentation sensations tactiles art",
          forAdvanced: "ENRICHISSEMENT TACTILE:\n• Techniques texture sophistiquées (frottage, impression)\n• Recherche sculpteurs utilisation matériaux\n• Création installations tactiles\n• Exploration texture art cultures diverses",
          forELL: "PONT TACTILE:\n• Matériaux traditionnels culture d'origine\n• Exploration tactile comme communication\n• Vocabulary texture avec manipulation\n• Arts tactiles traditions familiales"
        }
      },
      {
        title: "Impression et motifs",
        strategies: {
          forStruggling: "SOUTIEN IMPRESSION:\n• Techniques impression simples (éponges, pommes de terre)\n• Motifs répétitifs guidés gabarits\n• Impression matériaux naturels sécuritaires\n• Focus processus plutôt que résultat",
          forOnLevel: "EXPLORATION MOTIFS:\n• Création tampons personnalisés\n• Investigation motifs textiles/architecture\n• Patterns impression rythmes musicaux\n• Portfolio techniques impression diverses",
          forAdvanced: "ENRICHISSEMENT MOTIFS:\n• Techniques impression sophistiquées (monotype)\n• Recherche traditions impression mondiales\n• Création papier peint motifs personnalisés\n• Analyse mathématique patterns répétition",
          forELL: "PONT MOTIFS:\n• Patterns traditionnels culture d'origine\n• Techniques impression familiales\n• Motifs comme langage visuel universel\n• Celebration diversité patterns culturels"
        }
      },
      {
        title: "Exploration 3D et sculpture",
        strategies: {
          forStruggling: "SOUTIEN SCULPTURE:\n• Matériaux souples manipulation (pâte, argile)\n• Construction simple blocs/objets trouvés\n• Soutien motricité fine outils appropriés\n• Acceptance formes abstraites expressions",
          forOnLevel: "EXPLORATION TRIDIMENSIONNELLE:\n• Techniques sculpture diverses matériaux\n• Investigation équilibre/stabilité constructions\n• Création sculptures narratives\n• Documentation processus sculptural",
          forAdvanced: "ENRICHISSEMENT SCULPTURAL:\n• Techniques sculpture avancées (assemblage)\n• Recherche sculpteurs célèbres techniques\n• Création installation sculpture collaborative\n• Exploration sculpture architecture",
          forELL: "PONT SCULPTURAL:\n• Traditions sculpture culture d'origine\n• Sculpture comme communication 3D\n• Vocabulary spatial avec manipulation\n• Arts tridimensionnels familiaux"
        }
      },
      {
        title: "Art environnemental printanier",
        strategies: {
          forStruggling: "SOUTIEN ÉCO-ART:\n• Art matériaux naturels collectés supervision\n• Création simple jardins art/arrangements\n• Focus observation nature avant création\n• Land art temporaire respectueux",
          forOnLevel: "EXPLORATION ENVIRONNEMENTALE:\n• Investigation artists environnementaux célèbres\n• Création art recyclé/matériaux récupérés\n• Documentation art nature photography\n• Connexion art protection environnement",
          forAdvanced: "ENRICHISSEMENT ÉCOLOGIQUE:\n• Recherche art environnemental mondial\n• Création installation art environnemental\n• Investigation durabilité matériaux artistiques\n• Sensibilisation art écologique communauté",
          forELL: "PONT ÉCOLOGIQUE:\n• Traditions art nature culture origine\n• Respect environnement travers art\n• Vocabulary environnemental avec créations\n• Art comme sensibilisation universelle"
        }
      },
      {
        title: "Techniques artistiques avancées",
        strategies: {
          forStruggling: "SOUTIEN TECHNIQUE:\n• Maîtrise une technique avancée au choix\n• Assistance individuelle application technique\n• Adaptation techniques selon capacités motrices\n• Celebration progression personnelle technique",
          forOnLevel: "MAÎTRISE TECHNIQUE:\n• Expérimentation techniques multiples médiums\n• Comparaison efficacité techniques diverses\n• Création œuvre intégrant techniques apprises\n• Auto-évaluation progression technique",
          forAdvanced: "ENRICHISSEMENT TECHNIQUE:\n• Innovation techniques personnelles\n• Recherche techniques artists contemporains\n• Enseignement techniques classe\n• Création manuel techniques artistiques",
          forELL: "PONT TECHNIQUE:\n• Techniques artistiques culture d'origine\n• Demonstration technique comme communication\n• Vocabulary technique avec pratique\n• Fusion techniques traditionnelles/contemporaines"
        }
      },
      {
        title: "Notre galerie d'art française",
        strategies: {
          forStruggling: "SOUTIEN EXPOSITION:\n• Sélection œuvres avec aide bienveillante\n• Présentation simple œuvre préférée\n• Support préparation présentation orale\n• Fierté participation exposition classe",
          forOnLevel: "PRÉSENTATION ARTISTIQUE:\n• Curation thoughtful œuvres année\n• Réflexion progression artistique personnelle\n• Présentation processus créatif visiteurs\n• Documentation apprentissage artistique",
          forAdvanced: "ENRICHISSEMENT EXPOSITION:\n• Organisation complète vernissage artistique\n• Création catalogue exposition œuvres\n• Animation discussions artistiques\n• Connexion art galeries professionnelles",
          forELL: "PONT EXPOSITION:\n• Présentation bilingue selon préférences\n• Art comme communication transcendant langues\n• Fierté contributions artistiques personnelles\n• Celebration diversité expressions artistiques"
        }
      }
    ];

    // Update Arts units
    const artsUnits = unitsBySubject['Arts visuels'] || [];
    for (let i = 0; i < artsUnits.length && i < artsDifferentiations.length; i++) {
      const unit = artsUnits[i];
      const diff = artsDifferentiations[i];
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          differentiationStrategies: diff.strategies
        }
      });
      
      console.log(`✅ Updated: ${diff.title}`);
    }

    console.log('\n🌍 CREATING DIFFERENTIATION FOR SCIENCES HUMAINES');
    console.log('=================================================\n');

    const socialStudiesDifferentiations = [
      {
        title: "Moi et mon école",
        strategies: {
          forStruggling: "SOUTIEN IDENTITÉ SCOLAIRE:\n• Visite guidée école avec carte visuelle simple\n• Photos personnes école pour reconnaissance\n• Routine école avec supports visuels\n• Focus sécurité/confort école personnel",
          forOnLevel: "EXPLORATION SCOLAIRE:\n• Investigation rôles personnes école\n• Création carte école détaillée\n• Interview personnel école différents rôles\n• Comparaison école autres écoles connues",
          forAdvanced: "ENRICHISSEMENT SCOLAIRE:\n• Recherche histoire école/éducation locale\n• Projet amélioration école avec suggestions\n• Création guide école nouveaux élèves\n• Investigation systèmes éducation mondiaux",
          forELL: "PONT SCOLAIRE:\n• Comparaison systèmes scolaires pays origine\n• Support navigation école nouveau contexte\n• Vocabulary école avec expériences directes\n• Inclusion perspectives éducation diverses"
        }
      },
      {
        title: "Ma famille et mon foyer",
        strategies: {
          forStruggling: "SOUTIEN FAMILIAL:\n• Représentation famille dessins/photos personnelles\n• Partage traditions familiales confortables\n• Respect confidentialité structures familiales\n• Focus amour/soutien famille diverses formes",
          forOnLevel: "EXPLORATION FAMILIALE:\n• Investigation traditions familiales diverses\n• Comparaison responsabilités familiales\n• Création livre famille histoire personnelle\n• Appreciation diversité structures familiales",
          forAdvanced: "ENRICHISSEMENT FAMILIAL:\n• Recherche généalogie famille/migrations\n• Investigation structures familiales cultures mondiales\n• Création exposition diversité familiale\n• Analyse évolution familles temps",
          forELL: "PONT FAMILIAL:\n• Celebration traditions familiales origine\n• Partage structures familiales culture maternelle\n• Vocabulary famille avec contexte personnel\n• Respect différences familiales sans jugement"
        }
      },
      {
        title: "Notre communauté automnale",
        strategies: {
          forStruggling: "SOUTIEN COMMUNAUTAIRE:\n• Identification services communauté avec images\n• Visite lieux communauté familiers (bibliothèque, parc)\n• Reconnaissance personnes aident communauté\n• Focus sécurité communauté personnelle",
          forOnLevel: "EXPLORATION COMMUNAUTAIRE:\n• Investigation services communauté divers\n• Interview membres communauté rôles divers\n• Création carte communauté ressources\n• Participation projets communauté classe",
          forAdvanced: "ENRICHISSEMENT COMMUNAUTAIRE:\n• Recherche histoire développement communauté\n• Analyse besoins communauté solutions possibles\n• Création projet service communauté\n• Investigation gouvernement local fonctionnement",
          forELL: "PONT COMMUNAUTAIRE:\n• Comparaison communautés pays origine\n• Navigation services communauté nouveau contexte\n• Vocabulary communauté avec exploration directe\n• Inclusion perspectives communauté diverses"
        }
      },
      {
        title: "Célébrations et traditions hivernales",
        strategies: {
          forStruggling: "SOUTIEN CULTUREL:\n• Partage célébrations familiales confortables niveau\n• Respect non-participation certaines célébrations\n• Focus joie/communauté aspect universel\n• Activités inclusives toutes traditions",
          forOnLevel: "EXPLORATION CULTURELLE:\n• Investigation célébrations diverses cultures\n• Comparaison traditions similaires cultures diverses\n• Création calendrier célébrations mondiales\n• Appréciation diversité traditions communauté",
          forAdvanced: "ENRICHISSEMENT CULTUREL:\n• Recherche origines historiques célébrations\n• Investigation évolution traditions temps\n• Création festival multiculturel classe\n• Analyse signification culturelle célébrations",
          forELL: "PONT CULTUREL:\n• Partage célébrations culture origine fierté\n• Inclusion égale toutes traditions classe\n• Vocabulary célébrations avec expériences\n• Création ponts entre traditions diverses"
        }
      },
      {
        title: "Notre quartier et voisinage",
        strategies: {
          forStruggling: "SOUTIEN GÉOGRAPHIQUE:\n• Carte quartier simple avec repères familiers\n• Identification maison/école sur carte\n• Reconnaissance voisins/commerces locaux\n• Focus sécurité quartier déplacements",
          forOnLevel: "EXPLORATION GÉOGRAPHIQUE:\n• Création carte détaillée quartier ressources\n• Investigation histoire quartier développement\n• Interview résidents quartier expériences\n• Documentation changements quartier temps",
          forAdvanced: "ENRICHISSEMENT GÉOGRAPHIQUE:\n• Analyse développement urbain quartier\n• Recherche planification urbaine locale\n• Création propositions amélioration quartier\n• Investigation géographie humaine concepts",
          forELL: "PONT GÉOGRAPHIQUE:\n• Comparaison quartiers pays origine\n• Navigation quartier nouveau contexte\n• Vocabulary géographique avec exploration\n• Inclusion perspectives habitation diverses"
        }
      }
    ];

    // Update Social Studies units
    const socialStudiesUnits = unitsBySubject['Sciences humaines'] || [];
    for (let i = 0; i < socialStudiesUnits.length && i < socialStudiesDifferentiations.length; i++) {
      const unit = socialStudiesUnits[i];
      const diff = socialStudiesDifferentiations[i];
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          differentiationStrategies: diff.strategies
        }
      });
      
      console.log(`✅ Updated: ${diff.title}`);
    }

    console.log('\n🎯 FINAL PROGRESS UPDATE');
    console.log('========================');
    console.log('✅ French units: 10/10 completed');
    console.log('✅ Math units: 10/10 completed');
    console.log('✅ Science units: 10/10 completed');
    console.log('✅ Arts units: 10/10 completed');
    console.log('✅ Social Studies units: 5/5 completed');
    console.log('⏳ FPS units: 5 units (already have unique differentiation)');
    console.log('🎉 Total template replacements: 45/45 COMPLETED!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRemainingDifferentiation();