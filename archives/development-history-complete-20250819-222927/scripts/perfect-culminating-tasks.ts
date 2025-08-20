import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectCulminatingTasks() {
  try {
    console.log('🎯 PHASE 2: ADDING PERFECT CULMINATING TASKS\n');

    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Get all units
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrpId },
      orderBy: { startDate: 'asc' }
    });

    // Define culminating tasks for each unit
    const culminatingTasks = [
      {
        title: "Premiers Pas Artistiques",
        task: "Mon premier portfolio d'artiste: Les élèves créent leur première exposition personnelle en sélectionnant leurs 5 meilleures œuvres de septembre. Ils préparent une présentation orale en français pour expliquer leur processus créatif à leurs familles lors d'une galerie d'art en classe. Chaque élève crée une page de couverture personnalisée pour leur portfolio et pratique le vocabulaire artistique en décrivant leurs créations préférées."
      },
      {
        title: "L'Aventure des Lignes",
        task: "La parade des lignes vivantes: Les élèves créent une grande murale collaborative où chaque enfant contribue un segment de ligne unique qui se connecte aux autres. Ils présentent leur technique de ligne préférée à la classe en démontrant physiquement le mouvement (ligne ondulée = mouvement de vague). La murale finale est exposée dans le corridor avec des étiquettes françaises décrivant chaque type de ligne découvert."
      },
      {
        title: "La Magie des Couleurs",
        task: "Festival des couleurs d'automne: Les élèves organisent un festival des couleurs où ils démontrent leurs découvertes de mélange de couleurs à travers des stations interactives. Chaque élève devient 'expert' d'une couleur et enseigne aux visiteurs comment la créer. Ils créent un livre collectif des émotions colorées avec une page par élève montrant comment les couleurs expriment leurs sentiments en français."
      },
      {
        title: "Fêtes et Traditions Artistiques",
        task: "Exposition multiculturelle des traditions: Les élèves créent une galerie célébrant les diverses traditions de décembre de leurs familles. Chaque enfant produit une œuvre représentant une tradition familiale importante et prépare une carte explicative bilingue. La classe organise une célébration communautaire où les familles partagent leurs traditions à travers l'art, la musique et la nourriture."
      },
      {
        title: "Textures et Matériaux",
        task: "Musée tactile interactif: Les élèves créent un musée où les visiteurs peuvent toucher et explorer différentes textures. Chaque élève conçoit une 'boîte mystère tactile' avec 5 textures différentes et crée un guide en français pour les visiteurs. Ils organisent des visites guidées où ils utilisent le vocabulaire sensoriel français pour décrire les expériences tactiles aux classes invitées."
      },
      {
        title: "Motifs et Impression",
        task: "Galerie des motifs infinis: Les élèves créent une exposition de motifs imprimés sur différents supports (papier, tissu, carton). Chaque enfant conçoit son propre tampon et crée une série de 3 œuvres montrant des variations du même motif. Ils présentent une 'danse des motifs' où ils démontrent physiquement la répétition et le rythme de leurs créations."
      },
      {
        title: "Exploration 3D",
        task: "Parc de sculptures miniatures: Les élèves transforment la classe en parc de sculptures avec leurs créations 3D. Chaque sculpture inclut une plaque descriptive en français expliquant l'inspiration et les matériaux utilisés. Les élèves deviennent guides touristiques et mènent des visites en français, invitant les visiteurs à voir leurs œuvres sous différents angles."
      },
      {
        title: "Art Environnemental",
        task: "Symposium d'art écologique: Les élèves organisent un symposium sur l'art environnemental où ils présentent des solutions créatives aux problèmes écologiques. Chaque élève crée une œuvre à partir de matériaux recyclés et prépare un 'manifeste d'artiste-écologiste' en français. La classe crée une installation collective extérieure éphémère célébrant la nature du printemps."
      },
      {
        title: "Techniques Avancées",
        task: "Démonstration de maîtrise artistique: Les élèves organisent une 'journée des maîtres artistes' où chacun devient expert d'une technique et l'enseigne aux autres. Ils créent une œuvre finale combinant au moins 3 techniques différentes apprises durant l'année. Chaque artiste prépare un 'statement d'artiste' en français expliquant leur style unique et leurs choix techniques."
      },
      {
        title: "Notre Parcours Artistique Français",
        task: "Gala de célébration du parcours artistique: Les élèves organisent une exposition rétrospective majeure présentant leur évolution artistique de septembre à juin. Chaque élève sélectionne 10 œuvres représentant leur parcours et crée un catalogue personnel avec réflexions en français. La célébration inclut des performances artistiques, des démonstrations en direct, et une cérémonie de reconnaissance où chaque élève reçoit un certificat d'artiste francophone accompli."
      }
    ];

    console.log('📝 ADDING CULMINATING TASKS TO UNITS:\n');

    for (let i = 0; i < units.length && i < culminatingTasks.length; i++) {
      const unit = units[i];
      const taskData = culminatingTasks[i];
      
      if (unit.title === taskData.title) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            culminatingTask: taskData.task
          }
        });
        
        console.log(`✅ ${unit.title}`);
        console.log(`   Task: ${taskData.task.substring(0, 100)}...`);
        console.log();
      }
    }

    console.log('═'.repeat(60));
    console.log('✅ PHASE 2 COMPLETE: All units now have culminating tasks!');
    
    // Verification
    console.log('\n📊 VERIFICATION:');
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrpId },
      orderBy: { startDate: 'asc' }
    });
    
    for (const unit of updatedUnits) {
      const hasTask = unit.culminatingTask && unit.culminatingTask.length > 0;
      console.log(`  ${unit.title}: ${hasTask ? '✅ Has culminating task' : '❌ Missing task'}`);
    }

  } catch (error) {
    console.error('Error adding culminating tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectCulminatingTasks();