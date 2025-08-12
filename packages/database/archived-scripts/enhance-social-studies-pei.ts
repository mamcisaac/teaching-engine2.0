#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enhanceSocialStudiesWithPEIContent() {
  console.log('🏛️ Enhancing Social Studies Unit Plans with Authentic PEI Content...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Sciences humaines long range plan
    const socialStudiesPlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Sciences humaines',
        academicYear: '2025-2026'
      }
    });
    
    if (!socialStudiesPlan) {
      throw new Error('Sciences humaines long range plan not found.');
    }
    
    // Get all existing unit plans
    const unitPlans = await prisma.unitPlan.findMany({
      where: { longRangePlanId: socialStudiesPlan.id },
      orderBy: { startDate: 'asc' }
    });
    
    if (unitPlans.length !== 5) {
      throw new Error(`Expected 5 unit plans, found ${unitPlans.length}`);
    }
    
    console.log(`✅ Found ${unitPlans.length} Social Studies unit plans to enhance`);
    
    // ENHANCE UNIT 1: Ma famille et notre classe
    console.log('\n🌟 Enhancing Unit 1: Ma famille et notre classe with PEI content...');
    
    await prisma.unitPlan.update({
      where: { id: unitPlans[0].id },
      data: {
        description: 'Exploring the uniqueness of people, celebrating diversity in PEI families including Acadian, Mi\'kmaq, and newcomer heritage, and understanding needs vs wants in Island life.',
        descriptionFr: 'Explorer l\'unicité des personnes, célébrer la diversité des familles de l\'Î.-P.-É. incluant l\'héritage acadien, mi\'kmaq et des nouveaux arrivants, et comprendre les besoins et les désirs dans la vie insulaire.',
        bigIdeas: 'Every person is unique and special. PEI families have rich Acadian, Mi\'kmaq, and diverse cultural heritage. Island life shapes our needs and wants.',
        bigIdeasFr: 'Chaque personne est unique et spéciale. Les familles de l\'Î.-P.-É. ont un riche héritage acadien, mi\'kmaq et culturel diversifié. La vie insulaire façonne nos besoins et désirs.',
        keyVocabulary: JSON.stringify([
          'unique', 'famille', 'diversité', 'Acadien', 'Mi\'kmaq', 'Epekwitk', 'Île-du-Prince-Édouard',
          'héritage', 'tradition', 'langue', 'culture', 'besoin', 'désir', 'île', 'côte'
        ]),
        environmentalEducation: 'Island families caring for coastal environments, traditional Acadian and Mi\'kmaq land stewardship practices, protecting our red soil and shorelines.',
        indigenousPerspectives: 'Mi\'kmaq extended family concepts on Epekwitk, traditional seasonal rounds, relationship to the land as family, seven generations responsibility.',
        communityConnections: 'ACEF de l\'Île (Acadian association), Abegweit First Nation cultural center, PEI Museum heritage programs, multicultural newcomer services, Charlottetown family heritage fair.',
        technologyIntegration: 'Virtual connections with Acadian families across Maritime provinces, digital Mi\'kmaq language learning, online PEI heritage photo collections, family video calls to relatives off-Island.'
      }
    });
    
    // ENHANCE UNIT 2: Nos droits et responsabilités  
    console.log('🌟 Enhancing Unit 2: Nos droits et responsabilités with PEI civic engagement...');
    
    await prisma.unitPlan.update({
      where: { id: unitPlans[1].id },
      data: {
        description: 'Learning about rights and responsibilities in PEI families and schools, plus decision-making and peaceful conflict resolution using traditional Mi\'kmaq and Acadian approaches.',
        descriptionFr: 'Apprendre nos droits et responsabilités dans les familles et écoles de l\'Î.-P.-É., ainsi que la prise de décision et résolution pacifique utilisant les approches traditionnelles mi\'kmaq et acadiennes.',
        keyVocabulary: JSON.stringify([
          'droit', 'responsabilité', 'citoyen', 'Î.-P.-É.', 'décision', 'conseil', 'consensus',
          'conflit', 'résolution', 'écouter', 'respecter', 'partager', 'communauté'
        ]),
        indigenousPerspectives: 'Traditional Mi\'kmaq council decision-making through consensus, talking circles for problem-solving, community responsibility for all children, restorative justice practices.',
        environmentalEducation: 'Our responsibility to protect PEI\'s coastal environment, rights of future generations to clean Island waters, sustainable decision-making for Island resources.',
        communityConnections: 'PEI Human Rights Commission (age-appropriate content), Charlottetown Police community liaison, Island student councils, traditional Elder advisors, Acadian community leaders.',
        socialJusticeConnections: 'Rights of French language learners in PEI, fair treatment for all Island families, inclusive decision-making in diverse communities, supporting newcomer families.'
      }
    });
    
    // ENHANCE UNIT 3: Mon histoire dans le temps
    console.log('🌟 Enhancing Unit 3: Mon histoire dans le temps with Island heritage...');
    
    await prisma.unitPlan.update({
      where: { id: unitPlans[2].id },
      data: {
        description: 'Organizing important life events while exploring PEI family histories including Mi\'kmaq presence for thousands of years, Acadian settlement, and modern Island life.',
        descriptionFr: 'Organiser les événements importants de la vie en explorant les histoires familiales de l\'Î.-P.-É. incluant la présence mi\'kmaq depuis des milliers d\'années, l\'établissement acadien et la vie insulaire moderne.',
        bigIdeas: 'Everyone has a personal story. PEI has ancient Mi\'kmaq history, rich Acadian heritage, and diverse modern families. Island stories connect us through time.',
        bigIdeasFr: 'Chacun a une histoire personnelle. L\'Î.-P.-É. a une histoire mi\'kmaq ancienne, un riche héritage acadien et des familles modernes diversifiées. Les histoires insulaires nous connectent à travers le temps.',
        keyVocabulary: JSON.stringify([
          'temps', 'histoire', 'souvenir', 'passé', 'présent', 'futur', 'Epekwitk', 
          'Mi\'kmaq', 'Acadien', 'ancêtre', 'héritage', 'tradition', 'île', 'générations'
        ]),
        indigenousPerspectives: 'Oral history traditions spanning thousands of years on Epekwitk, seven generations thinking about past and future, seasonal ceremony marking life stages, connection to ancestral lands.',
        environmentalEducation: 'Seasonal changes unique to Island life, environmental history of Epekwitk, how families have cared for the Island through generations, traditional ecological knowledge.',
        communityConnections: 'PEI Museum and Heritage Foundation, Acadian Museum in Miscouche, Mi\'kmaq cultural centers, local historical societies, Island genealogy groups, Elder storytellers.',
        parentCommunicationPlan: 'Family immigration stories to PEI, seasonal tradition sharing, heritage artifact collection from Island families, connections to off-Island relatives.'
      }
    });
    
    // ENHANCE UNIT 4: Explorer notre monde (Most Important PEI Geographic Content)
    console.log('🌟 Enhancing Unit 4: Explorer notre monde with authentic PEI geography...');
    
    await prisma.unitPlan.update({
      where: { id: unitPlans[3].id },
      data: {
        title: 'Exploring Our Island World',
        titleFr: 'Explorer notre monde insulaire',
        description: 'Using maps, plans, and globes to locate PEI landmarks, understand our Island geography, and explore traditional Mi\'kmaq place names and navigation on Epekwitk.',
        descriptionFr: 'Utiliser des cartes, plans et globes pour localiser les points de repère de l\'Î.-P.-É., comprendre notre géographie insulaire et explorer les noms de lieux mi\'kmaq traditionnels et la navigation sur Epekwitk.',
        bigIdeas: 'PEI is our Island home with unique geography. Traditional Mi\'kmaq knowledge helps us understand our land. Maps help us find our way around the Island.',
        bigIdeasFr: 'L\'Î.-P.-É. est notre foyer insulaire avec une géographie unique. Les connaissances traditionnelles mi\'kmaq nous aident à comprendre notre terre. Les cartes nous aident à naviguer sur l\'île.',
        keyVocabulary: JSON.stringify([
          'carte', 'globe', 'plan', 'île', 'Epekwitk', 'Î.-P.-É.', 'côte', 'pont', 'phare',
          'Charlottetown', 'Summerside', 'direction', 'nord', 'sud', 'est', 'ouest', 'terres rouges'
        ]),
        crossCurricularConnections: 'Math: shapes of PEI, measuring distances on Island; Art: aerial view drawings of Island, traditional Mi\'kmaq art patterns; PE: directional games using Island landmarks',
        culminatingTask: 'Create a giant floor map of PEI with important landmarks, traditional Mi\'kmaq place names, and present guided tours of our Island home.',
        indigenousPerspectives: 'Traditional Mi\'kmaq navigation methods on Epekwitk, sacred places and traditional territories, seasonal camps and travel routes, place names and their meanings in Mi\'kmaq language.',
        environmentalEducation: 'Coastal landmarks and shoreline protection, red soil conservation, natural harbors and beaches, sustainable transportation on a small Island, protecting special Island places.',
        communityConnections: 'PEI Department of Transportation (bridge and ferry education), Charlottetown and Summerside city planners, Tourism PEI landmark programs, Mi\'kmaq Confederacy for traditional place names, Island lighthouse keepers.',
        differentiationStrategies: JSON.stringify({
          emerging: 'Simple PEI outline maps, major landmarks like Confederation Bridge, guided exploration of school neighbourhood',
          developing: 'County maps (Prince, Queens, Kings), community landmarks, ferry and bridge connections, direction giving around school',
          extending: 'Detailed Island maps with traditional place names, advanced directions across counties, creating maps for visitors to PEI'
        })
      }
    });
    
    // ENHANCE UNIT 5: Citoyens numériques responsables
    console.log('🌟 Enhancing Unit 5: Citoyens numériques responsables with Island technology context...');
    
    await prisma.unitPlan.update({
      where: { id: unitPlans[4].id },
      data: {
        description: 'Developing age-appropriate digital citizenship skills while understanding how technology connects our Island to the world and preserves our cultural heritage.',
        descriptionFr: 'Développer des compétences de citoyenneté numérique appropriées en comprenant comment la technologie connecte notre île au monde et préserve notre héritage culturel.',
        bigIdeas: 'Technology connects our Island to the world. We can share our culture safely online. Digital citizens protect themselves and others.',
        bigIdeasFr: 'La technologie connecte notre île au monde. Nous pouvons partager notre culture en sécurité en ligne. Les citoyens numériques se protègent et protègent les autres.',
        keyVocabulary: JSON.stringify([
          'technologie', 'numérique', 'internet', 'Î.-P.-É.', 'connection', 'monde', 'culture',
          'sécurité', 'mot de passe', 'respectueux', 'privé', 'partager', 'héritage'
        ]),
        crossCurricularConnections: 'All subjects: technology integration; Health: online safety; French: digital communication in French; Social Studies: preserving Island heritage online',
        indigenousPerspectives: 'Traditional knowledge sharing methods compared to digital sharing, storytelling through technology while respecting protocols, connecting with Mi\'kmaq communities across Maritimes virtually, cultural preservation online with Elder guidance.',
        environmentalEducation: 'Reducing electronic waste on our small Island, energy conservation with technology, virtual connections reducing travel emissions, choosing eco-friendly technology options.',
        communityConnections: 'PEI IT professionals and cybersecurity experts, Provincial Library digital citizenship programs, Island coding clubs for kids, local police online safety presentations, digital storytelling with Acadian and Mi\'kmaq communities.',
        parentCommunicationPlan: 'Home technology agreements for Island families, balancing screen time with outdoor Island activities, family digital safety discussions, responsible sharing of family cultural heritage online.'
      }
    });
    
    console.log('\n📊 ENHANCEMENT SUMMARY:');
    console.log('✅ Unit 1: Enhanced with Acadian and Mi\'kmaq family heritage');
    console.log('✅ Unit 2: Added PEI civic engagement and traditional governance');
    console.log('✅ Unit 3: Integrated Island historical timeline perspectives');
    console.log('✅ Unit 4: Complete PEI geographic authenticity transformation');
    console.log('✅ Unit 5: Connected technology to Island culture and environment');
    
    console.log('\n🌟 KEY IMPROVEMENTS IMPLEMENTED:');
    console.log('• Authentic Mi\'kmaq perspectives specific to Epekwitk (PEI)');
    console.log('• Acadian heritage integration throughout curriculum');
    console.log('• Real PEI landmarks, communities, and geographic features');
    console.log('• Island-specific environmental stewardship');
    console.log('• Actual PEI community organizations and partnerships');
    console.log('• French vocabulary relevant to Island life');
    console.log('• Cultural preservation and modern Island identity');
    
    console.log('\n🏛️ PEI-SPECIFIC CONTENT NOW INCLUDES:');
    console.log('• Epekwitk (traditional Mi\'kmaq name for PEI)');
    console.log('• Charlottetown and Summerside landmarks');
    console.log('• Confederation Bridge and ferry connections');
    console.log('• Three counties: Prince, Queens, Kings');
    console.log('• Red soil and coastal geography');
    console.log('• Acadian heritage and ACEF de l\'Île');
    console.log('• Mi\'kmaq cultural centers and traditional knowledge');
    console.log('• PEI Museum and heritage programs');
    
    console.log('\n🎯 EMILY\'S SOCIAL STUDIES PROGRAM IS NOW:');
    console.log('✨ Authentically connected to PEI place and culture');
    console.log('✨ Respectful of Mi\'kmaq and Acadian heritage');
    console.log('✨ Relevant to 6-year-old Island residents');
    console.log('✨ Connected to real PEI community organizations');
    console.log('✨ Environmental stewardship focused on Island ecosystems');
    console.log('✨ Celebrating cultural diversity within Island context');
    
    console.log('\n🏆 ENHANCEMENT COMPLETE!');
    console.log('Emily\'s Social Studies unit plans now provide authentic, place-based learning');
    console.log('that honors the rich cultural heritage and unique geography of Prince Edward Island!');
    
  } catch (error) {
    console.error('❌ Error enhancing Social Studies unit plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the enhancement
enhanceSocialStudiesWithPEIContent()
  .then(() => console.log('\n🎉 PEI Social Studies enhancement completed successfully!'))
  .catch((error) => {
    console.error('💥 Enhancement failed:', error);
    process.exit(1);
  });