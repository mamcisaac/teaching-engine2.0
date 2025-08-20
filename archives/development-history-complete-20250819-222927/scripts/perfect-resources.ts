import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectResources() {
  try {
    console.log('🎯 PHASE 3: ADDING PERFECT RESOURCES\n');

    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Get all units
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrpId },
      orderBy: { startDate: 'asc' }
    });

    // Define 3 resources per unit (book/video, materials, community)
    const unitResources = [
      {
        title: "Premiers Pas Artistiques",
        resources: [
          { title: "Livre: 'Mon premier livre d'art' par Béatrice Fontanel", type: "book", url: "https://www.scholastic.ca/editions/livres/", notes: "Introduction parfaite à l'art pour les jeunes francophones, avec vocabulaire adapté" },
          { title: "Matériaux de base: crayons, papier, ciseaux sécuritaires", type: "materials", notes: "Liste complète: 30 boîtes de crayons de couleur, 500 feuilles papier blanc, 30 paires ciseaux bout rond, 30 gommes à effacer, 30 bâtons de colle" },
          { title: "Artiste local: Visite de l'illustrateur acadien", type: "community", notes: "Contact avec illustrateurs francophones locaux pour démonstration de techniques de base" }
        ]
      },
      {
        title: "L'Aventure des Lignes",
        resources: [
          { title: "Vidéo: 'Les lignes dans l'art' - TFO Éducation", type: "video", url: "https://www.tfo.org/education", notes: "Série éducative sur les types de lignes en art, narration française" },
          { title: "Matériaux variés pour tracer: pinceaux, marqueurs, pastels", type: "materials", notes: "30 ensembles de marqueurs lavables, 60 pinceaux (tailles variées), 30 boîtes de pastels secs, papier grand format pour murales" },
          { title: "Galerie d'art francophone locale", type: "community", notes: "Visite guidée en français pour observer les lignes dans l'art professionnel" }
        ]
      },
      {
        title: "La Magie des Couleurs",
        resources: [
          { title: "Livre: 'Le livre des couleurs' par Sophie Benini Pietromarchi", type: "book", notes: "Exploration poétique des couleurs en français, parfait pour Grade 1" },
          { title: "Peinture tempera et matériel de mélange", type: "materials", notes: "Peinture tempera lavable (couleurs primaires + blanc/noir), 30 palettes, 90 contenants d'eau, éponges, tabliers" },
          { title: "Atelier avec artiste peintre francophone", type: "community", notes: "Démonstration de mélange de couleurs et techniques de peinture de base" }
        ]
      },
      {
        title: "Fêtes et Traditions Artistiques",
        resources: [
          { title: "Collection: 'Fêtes du monde' - Livres jeunesse", type: "book", notes: "Série sur les célébrations culturelles diverses, disponible en français" },
          { title: "Matériaux festifs: papier métallique, rubans, paillettes", type: "materials", notes: "Papier construction multicolore, papier métallique, rubans variés, paillettes écologiques, colle scintillante" },
          { title: "Centre culturel francophone - exposition de décembre", type: "community", notes: "Partenariat pour exposition des œuvres des élèves lors des célébrations communautaires" }
        ]
      },
      {
        title: "Textures et Matériaux",
        resources: [
          { title: "Vidéo: 'Toucher l'art' - Série éducative Radio-Canada", type: "video", url: "https://ici.radio-canada.ca/jeunesse", notes: "Exploration tactile de l'art adaptée aux jeunes" },
          { title: "Collection de textures variées", type: "materials", notes: "Tissus divers, papier de verre, coton, feutre, carton ondulé, matériaux naturels (feuilles, écorce), éponges" },
          { title: "Artisan textile francophone", type: "community", notes: "Visite d'un atelier de tissage ou de sculpture textile acadien" }
        ]
      },
      {
        title: "Motifs et Impression",
        resources: [
          { title: "Livre: 'Motifs et répétitions' - Collection Art jeunesse", type: "book", notes: "Introduction aux patterns dans l'art et la nature, édition française" },
          { title: "Matériel d'impression: tampons, rouleaux, pochoirs", type: "materials", notes: "Tampons en mousse, rouleaux encreurs, encre lavable, pochoirs variés, pommes de terre pour gravure" },
          { title: "Imprimerie artisanale locale", type: "community", notes: "Visite d'une imprimerie ou atelier de sérigraphie francophone" }
        ]
      },
      {
        title: "Exploration 3D",
        resources: [
          { title: "Vidéo: 'Sculpter avec les mains' - TFO", type: "video", notes: "Techniques de sculpture adaptées aux enfants, narration française" },
          { title: "Argile et matériaux de construction", type: "materials", notes: "Argile sans cuisson, carton recyclé, bâtons de bois, colle forte, fil de fer souple, papier mâché" },
          { title: "Sculpteur francophone local", type: "community", notes: "Démonstration de techniques de sculpture et discussion sur l'art 3D" }
        ]
      },
      {
        title: "Art Environnemental",
        resources: [
          { title: "Livre: 'L'art et la nature' par Élisabeth Dumont-Le Cornec", type: "book", notes: "Art environnemental expliqué aux enfants en français" },
          { title: "Matériaux naturels et recyclés", type: "materials", notes: "Collection de matériaux naturels locaux, matériaux recyclés propres, outils de jardinage adaptés" },
          { title: "Éco-centre communautaire francophone", type: "community", notes: "Partenariat pour projet d'art environnemental collectif" }
        ]
      },
      {
        title: "Techniques Avancées",
        resources: [
          { title: "Série: 'Jeunes artistes' - Capsules Radio-Canada", type: "video", notes: "Techniques artistiques avancées présentées par de jeunes artistes francophones" },
          { title: "Matériaux mixtes pour exploration", type: "materials", notes: "Combinaison de tous les matériaux de l'année, plus matériaux spéciaux (encre de Chine, fusain, aquarelle)" },
          { title: "Mentorat avec artiste professionnel francophone", type: "community", notes: "Programme de mentorat avec artiste local pour techniques avancées" }
        ]
      },
      {
        title: "Notre Parcours Artistique Français",
        resources: [
          { title: "Guide: 'Mon portfolio d'artiste' - Ressource pédagogique", type: "book", notes: "Guide pour créer et présenter un portfolio artistique, version française" },
          { title: "Matériel d'exposition et présentation", type: "materials", notes: "Cartons de montage, cadres simples, étiquettes, matériel d'accrochage, éclairage portatif" },
          { title: "Galerie communautaire pour exposition finale", type: "community", notes: "Location d'espace d'exposition professionnel pour gala de fin d'année" }
        ]
      }
    ];

    console.log('📚 ADDING RESOURCES TO UNITS:\n');

    for (let i = 0; i < units.length && i < unitResources.length; i++) {
      const unit = units[i];
      const resourceData = unitResources[i];
      
      if (unit.title === resourceData.title) {
        console.log(`Unit: ${unit.title}`);
        
        for (const resource of resourceData.resources) {
          await prisma.unitPlanResource.create({
            data: {
              unitPlanId: unit.id,
              title: resource.title,
              type: resource.type,
              url: resource.url || null,
              notes: resource.notes || null
            }
          });
          console.log(`  ✅ Added: ${resource.title} (${resource.type})`);
        }
        console.log();
      }
    }

    console.log('═'.repeat(60));
    console.log('✅ PHASE 3 COMPLETE: All units now have resources!');
    
    // Verification
    console.log('\n📊 VERIFICATION:');
    for (const unit of units) {
      const resourceCount = await prisma.unitPlanResource.count({
        where: { unitPlanId: unit.id }
      });
      console.log(`  ${unit.title}: ${resourceCount} resources ${resourceCount >= 3 ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('Error adding resources:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectResources();