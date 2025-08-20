import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectTransferSkills() {
  try {
    console.log('🎯 PHASE 4: ADDING PERFECT TRANSFER SKILLS\n');

    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Get all units
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrpId },
      orderBy: { startDate: 'asc' }
    });

    // Create Arts-specific transfer skills if they don't exist
    const transferSkills = [
      {
        skillName: "Motricité fine artistique",
        description: "Développer le contrôle précis des mains et des doigts pour créer de l'art",
        category: "Arts et créativité",
        gradeMin: 1,
        gradeMax: 3,
        isCore: true,
        performanceIndicators: ["Tient correctement les outils", "Contrôle la pression", "Trace avec précision"],
        assessmentMethods: ["Observation directe", "Portfolio", "Auto-évaluation"]
      },
      {
        skillName: "Expression créative",
        description: "Communiquer des idées et des sentiments à travers l'art visuel",
        category: "Arts et créativité",
        gradeMin: 1,
        gradeMax: 3,
        isCore: true,
        performanceIndicators: ["Exprime des émotions", "Raconte des histoires visuelles", "Fait des choix artistiques"],
        assessmentMethods: ["Présentation orale", "Réflexion écrite", "Partage en cercle"]
      },
      {
        skillName: "Pensée visuelle",
        description: "Voir et comprendre le monde à travers une perspective artistique",
        category: "Arts et créativité",
        gradeMin: 1,
        gradeMax: 3,
        isCore: true,
        performanceIndicators: ["Observe les détails", "Reconnaît les patterns", "Imagine des possibilités"],
        assessmentMethods: ["Discussion guidée", "Croquis d'observation", "Journal visuel"]
      },
      {
        skillName: "Collaboration artistique",
        description: "Travailler avec les autres pour créer et apprécier l'art",
        category: "Arts et créativité",
        gradeMin: 1,
        gradeMax: 3,
        isCore: false,
        performanceIndicators: ["Partage les matériaux", "Contribue aux projets collectifs", "Respecte les créations des autres"],
        assessmentMethods: ["Observation des interactions", "Projets de groupe", "Peer feedback"]
      },
      {
        skillName: "Appréciation culturelle",
        description: "Reconnaître et valoriser l'art de différentes cultures",
        category: "Arts et créativité",
        gradeMin: 1,
        gradeMax: 3,
        isCore: false,
        performanceIndicators: ["Identifie des styles culturels", "Montre du respect", "Célèbre la diversité"],
        assessmentMethods: ["Réponse à l'art", "Présentation culturelle", "Portfolio multiculturel"]
      }
    ];

    console.log('📝 CREATING/FINDING TRANSFER SKILLS:\n');

    const skillIds = [];
    
    for (const skill of transferSkills) {
      // Check if skill already exists
      let existingSkill = await prisma.transferSkillTemplate.findFirst({
        where: { 
          skillName: skill.skillName,
          gradeMin: { lte: 1 },
          gradeMax: { gte: 1 }
        }
      });

      if (!existingSkill) {
        existingSkill = await prisma.transferSkillTemplate.create({
          data: {
            ...skill,
            performanceIndicators: skill.performanceIndicators,
            assessmentMethods: skill.assessmentMethods
          }
        });
        console.log(`  ✅ Created: ${skill.skillName}`);
      } else {
        console.log(`  ↔️  Found existing: ${skill.skillName}`);
      }
      
      skillIds.push(existingSkill.id);
    }

    // Also use existing nature observation skills
    const existingSkills = await prisma.transferSkillTemplate.findMany({
      where: {
        gradeMin: { lte: 1 },
        gradeMax: { gte: 1 },
        category: "Nature et observation"
      }
    });

    for (const skill of existingSkills) {
      skillIds.push(skill.id);
      console.log(`  ↔️  Including existing: ${skill.skillName}`);
    }

    console.log('\n🔗 LINKING TRANSFER SKILLS TO UNITS:\n');

    // Link appropriate skills to each unit with emphasis levels
    const unitSkillMapping = [
      { title: "Premiers Pas Artistiques", skills: [0, 1, 2], emphasis: ["mastering", "developing", "introducing"] },
      { title: "L'Aventure des Lignes", skills: [0, 2, 3], emphasis: ["mastering", "developing", "developing"] },
      { title: "La Magie des Couleurs", skills: [1, 2, 4], emphasis: ["developing", "developing", "introducing"] },
      { title: "Fêtes et Traditions Artistiques", skills: [1, 3, 4], emphasis: ["developing", "developing", "mastering"] },
      { title: "Textures et Matériaux", skills: [0, 2, 5], emphasis: ["developing", "mastering", "developing"] },
      { title: "Motifs et Impression", skills: [0, 2, 3], emphasis: ["developing", "mastering", "developing"] },
      { title: "Exploration 3D", skills: [0, 2, 6], emphasis: ["mastering", "developing", "developing"] },
      { title: "Art Environnemental", skills: [1, 5, 7], emphasis: ["developing", "mastering", "mastering"] },
      { title: "Techniques Avancées", skills: [0, 1, 2], emphasis: ["mastering", "mastering", "mastering"] },
      { title: "Notre Parcours Artistique Français", skills: [1, 3, 4], emphasis: ["mastering", "mastering", "developing"] }
    ];

    for (const mapping of unitSkillMapping) {
      const unit = units.find(u => u.title === mapping.title);
      if (unit) {
        console.log(`Unit: ${unit.title}`);
        
        for (let i = 0; i < mapping.skills.length; i++) {
          const skillIndex = mapping.skills[i];
          const skillId = skillIds[skillIndex];
          const emphasis = mapping.emphasis[i];
          
          if (skillId) {
            // Check if already linked
            const existing = await prisma.unitPlanTransferSkill.findFirst({
              where: {
                unitPlanId: unit.id,
                transferSkillId: skillId
              }
            });
            
            if (!existing) {
              await prisma.unitPlanTransferSkill.create({
                data: {
                  unitPlanId: unit.id,
                  transferSkillId: skillId,
                  emphasis: emphasis
                }
              });
              
              const skill = await prisma.transferSkillTemplate.findUnique({
                where: { id: skillId }
              });
              console.log(`  ✅ Linked: ${skill?.skillName} (${emphasis})`);
            }
          }
        }
        console.log();
      }
    }

    console.log('═'.repeat(60));
    console.log('✅ PHASE 4 COMPLETE: All units now have transfer skills!');
    
    // Verification
    console.log('\n📊 VERIFICATION:');
    for (const unit of units) {
      const skillCount = await prisma.unitPlanTransferSkill.count({
        where: { unitPlanId: unit.id }
      });
      console.log(`  ${unit.title}: ${skillCount} transfer skills ${skillCount >= 3 ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('Error adding transfer skills:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectTransferSkills();