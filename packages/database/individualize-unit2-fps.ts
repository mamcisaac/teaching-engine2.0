import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to create unique Indigenous perspectives for Unit 2: Healthy Me lessons
function createUnit2IndigenousPerspective(lessonTitle: string): string {
  const basePrefix = "Mi'kmaq teachings emphasize ";
  
  switch (lessonTitle) {
    case 'Healthy Living: Healthy Foods':
      return `${basePrefix}that traditional foods are medicine for both body and spirit. Ancestral knowledge teaches that berries strengthen the blood, fish provide omega oils for brain health, wild greens cleanse the body, and sweetgrass brings spiritual wellness. Eating foods from the land connects us to our ancestors and maintains our cultural identity.`;
    
    case 'Healthy Living: Healthy Foods - Unit: Healthy Me...':
      return `${basePrefix}the sacred relationship between food and community wellness. Traditional Mi'kmaq food practices include sharing harvests, preparing foods together, offering thanks to all beings who gave their lives for our nourishment, and understanding that healthy eating is both personal and collective responsibility.`;
    
    case 'Healthy Living: Exercise and Movement':
      return `${basePrefix}that movement is a sacred dance with creation. Traditional activities like canoeing strengthens the core, snowshoeing builds endurance, traditional dancing honors the spirits, and walking connects us to Mother Earth's energy. Movement is medicine that keeps the body, mind, and spirit in balance.`;
    
    case 'Healthy Living: Exercise Fun':
      return `${basePrefix}that joyful movement connects us to our playful spirit and natural rhythms. Traditional Mi'kmaq games like waltes (dice game) develops coordination, running games build community bonds, and seasonal activities like swimming and sledding teach us to move in harmony with nature's cycles.`;
    
    case 'Healthy Living: Getting Enough Sleep':
      return `${basePrefix}that sleep is when our spirit travels to the dream world for healing and guidance. Traditional teachings recognize sleep as sacred time when ancestors visit with wisdom, when the body repairs itself, and when children grow both physically and spiritually under the protection of loving spirits.`;
    
    case 'Healthy Living: Clean Hands':
      return `${basePrefix}that cleanliness is spiritual preparation for handling sacred things. Traditional practices include washing hands before touching medicines, before eating, before ceremony, and after contact with things that carry negative energy. Clean hands show respect for ourselves, others, and Creator's gifts.`;
    
    case 'Healthy Living: Staying Clean':
      return `${basePrefix}that cleanliness honors the sacred vessel of our body. Traditional bathing practices include using cedar and sweetgrass for spiritual cleansing, understanding that external cleanliness reflects internal purity, and maintaining cleanliness as a way of showing gratitude for the gift of physical form.`;
    
    case 'Healthy Living: Brushing Teeth':
      return `${basePrefix}that caring for teeth honors our ability to eat Creator's gifts. Traditional oral health includes chewing willow bark for cleaning, understanding that healthy teeth allow us to properly nourish our bodies, and recognizing that our smile is one way we share joy with our community.`;
    
    case 'Healthy Living: Drinking Water':
      return `${basePrefix}that water is the first medicine and sacred gift of life. Traditional teachings honor water as grandmother's blood, understanding that pure water cleanses both body and spirit, and recognizing our responsibility to protect water sources for seven generations while drinking mindfully with gratitude.`;
    
    case 'Healthy Living: Getting Sleep':
      return `${basePrefix}that adequate rest allows our spirit to return refreshed from the dream world. Traditional sleep wisdom includes sleeping with the natural cycles, creating peaceful sleep spaces, understanding that dreams carry important messages, and recognizing that well-rested children can better serve their community.`;
    
    case 'Healthy Living: Visiting the Doctor':
      return `${basePrefix}that seeking healing help honors both traditional and modern medicine paths. Traditional health practices include visiting elders for plant medicines while also respecting the knowledge of trained healers, understanding that multiple approaches to wellness can work together for optimal health.`;
    
    case 'Healthy Living: Drinking Water - Unit: Healthy Me...':
      return `${basePrefix}the sacred responsibility to honor water through mindful consumption. Traditional water ceremonies teach gratitude for this precious gift, understanding that water carries memory and energy, and recognizing that how we treat water reflects how we treat all life forms.`;
    
    case 'Healthy Living: Taking Medicine Safely':
      return `${basePrefix}that all medicines, traditional and modern, must be used with respect and proper guidance. Traditional teachings include seeking elder wisdom for plant medicines, understanding that healing substances have spirit and power, and recognizing the importance of proper dosage and timing.`;
    
    case 'Healthy Living: Safe Play':
      return `${basePrefix}that play should build strength while protecting the body. Traditional safe play includes understanding natural hazards, playing in groups for mutual protection, learning from experienced community members, and recognizing that safe play allows for lifelong enjoyment of physical activities.`;
    
    case 'Healthy Living: Healthy Choices':
      return `${basePrefix}that every choice affects not just ourselves but our community and future generations. Traditional decision-making includes considering impact on others, seeking elder guidance, understanding consequences of actions, and choosing paths that maintain balance between individual needs and collective wellness.`;
    
    case 'Healthy Living: Asking for Help':
      return `${basePrefix}that seeking help is a sign of wisdom, not weakness. Traditional community structures support asking elders for guidance, seeking healing from traditional practitioners, requesting assistance during illness, and understanding that interdependence creates stronger, healthier communities.`;
    
    case 'Healthy Living: My Body Systems':
      return `${basePrefix}that the body is an intricate creation where all parts work together like a traditional community. Traditional anatomical understanding recognizes the heart as the center of emotion, lungs as breath of life, digestive system as transformation of gifts, and all systems as interconnected medicine.`;
    
    case 'Healthy Living: Doctor Visits':
      return `${basePrefix}that modern healers can work alongside traditional medicine ways. Traditional approach to healing includes building trust with healthcare providers, sharing traditional health practices that support wellness, and understanding that good healers, whether traditional or modern, work for the patient's highest good.`;
    
    case 'Healthy Living: Staying Strong':
      return `${basePrefix}that true strength comes from balanced development of body, mind, spirit, and emotions. Traditional strength building includes physical conditioning through seasonal activities, mental strength through learning, emotional strength through community support, and spiritual strength through ceremony and connection to Creator.`;
    
    case 'Healthy Living: Medicine Safety':
      return `${basePrefix}that all healing substances demand respect and proper handling. Traditional medicine safety includes learning from qualified teachers, understanding plant spirits and their powers, storing medicines properly, and recognizing that misuse of healing substances can cause harm rather than healing.`;
    
    case 'Healthy Living: Healthy Habits':
      return `${basePrefix}that daily practices create the foundation for lifelong wellness. Traditional healthy habits include morning prayers of gratitude, eating seasonal foods, moving the body regularly, spending time in nature, maintaining clean living spaces, and ending each day with reflection and thanksgiving.`;
    
    case 'Healthy Living: Staying Safe':
      return `${basePrefix}that personal safety awareness protects our ability to serve our community. Traditional safety teachings include reading natural signs, staying connected to community members, understanding dangerous situations, trusting inner warnings, and maintaining physical and spiritual protection practices.`;
    
    case 'Healthy Living: Wellness Celebration':
      return `${basePrefix}that celebrating health and wellness honors Creator's gift of life. Traditional wellness celebrations include community feasts with healthy foods, thanksgiving ceremonies for good health, sharing wellness knowledge with others, and committing to maintaining balance and wellness throughout life.`;
    
    case 'Healthy Living: Healthy Habits - Unit: Healthy Me...':
      return `${basePrefix}that healthy daily routines create rhythm and stability like natural cycles. Traditional habit formation includes morning and evening practices, seasonal adjustments to routines, community support for healthy choices, and understanding that small daily actions create lasting wellness patterns.`;
    
    default:
      return `${basePrefix}holistic wellness through the Medicine Wheel teachings, where physical, mental, emotional, and spiritual health are interconnected. Traditional foods and practices nourish the body while ceremony and community connection support overall well-being and vitality.`;
  }
}

// Function to create unique assessment criteria for Unit 2: Healthy Me lessons
function createUnit2AssessmentCriteria(lessonTitle: string): string {
  const baseHeader = "Observable social-emotional learning assessment:\n";
  
  switch (lessonTitle) {
    case 'Healthy Living: Healthy Foods':
      return `${baseHeader}☐ Identifies nutritious foods and explains why they're healthy
☐ Shows enthusiasm for trying new healthy foods
☐ Demonstrates understanding of how food affects energy and mood
☐ Makes healthy food choices when given options

Anecdotal observations focus on nutrition knowledge, willingness to try healthy foods, and understanding food-wellness connections.`;
    
    case 'Healthy Living: Healthy Foods - Unit: Healthy Me...':
      return `${baseHeader}☐ Explains the connection between healthy eating and feeling good
☐ Shows appreciation for different types of nutritious foods
☐ Demonstrates ability to plan balanced meals or snacks
☐ Shares knowledge about healthy foods with family or friends

Anecdotal observations focus on nutrition understanding, meal planning skills, and health knowledge sharing.`;
    
    case 'Healthy Living: Exercise and Movement':
      return `${baseHeader}☐ Participates actively in movement and exercise activities
☐ Shows understanding of how exercise helps the body stay strong
☐ Demonstrates enjoyment of physical activity and movement
☐ Encourages others to join in movement activities

Anecdotal observations focus on physical participation, exercise appreciation, and motivation to be active.`;
    
    case 'Healthy Living: Exercise Fun':
      return `${baseHeader}☐ Finds joy and pleasure in different types of physical activities
☐ Shows creativity in making exercise enjoyable and engaging
☐ Demonstrates understanding that movement can be both fun and healthy
☐ Helps create fun physical activities for the class

Anecdotal observations focus on exercise enjoyment, creative movement, and leadership in physical activities.`;
    
    case 'Healthy Living: Getting Enough Sleep':
      return `${baseHeader}☐ Understands the importance of adequate sleep for health and learning
☐ Identifies signs of being well-rested vs. tired
☐ Shows knowledge of good sleep habits and routines
☐ Demonstrates ability to recognize when rest is needed

Anecdotal observations focus on sleep awareness, rest recognition, and understanding sleep's role in wellness.`;
    
    case 'Healthy Living: Clean Hands':
      return `${baseHeader}☐ Demonstrates proper hand washing technique consistently
☐ Shows understanding of when hand washing is important
☐ Exhibits automatic hand washing habits without reminders
☐ Helps remind others about hand hygiene when appropriate

Anecdotal observations focus on hygiene skills, habit formation, and peer support for cleanliness practices.`;
    
    case 'Healthy Living: Staying Clean':
      return `${baseHeader}☐ Maintains personal cleanliness throughout the day
☐ Shows understanding of how cleanliness affects health and social interactions
☐ Demonstrates independence in personal hygiene routines
☐ Takes pride in maintaining a clean, neat appearance

Anecdotal observations focus on hygiene independence, social awareness, and personal care responsibility.`;
    
    case 'Healthy Living: Brushing Teeth':
      return `${baseHeader}☐ Demonstrates proper tooth brushing technique and timing
☐ Shows understanding of why dental care is important for health
☐ Exhibits consistent dental hygiene habits
☐ Shows concern for maintaining healthy teeth and gums

Anecdotal observations focus on dental care skills, oral health understanding, and hygiene consistency.`;
    
    case 'Healthy Living: Drinking Water':
      return `${baseHeader}☐ Chooses water as a healthy drink option throughout the day
☐ Shows understanding of why water is important for body function
☐ Demonstrates awareness of hydration needs during activities
☐ Helps promote water consumption among classmates

Anecdotal observations focus on hydration choices, water appreciation, and understanding fluid needs.`;
    
    case 'Healthy Living: Getting Sleep':
      return `${baseHeader}☐ Recognizes personal sleep needs and tired feelings
☐ Shows understanding of bedtime routines that promote good sleep
☐ Demonstrates knowledge of sleep's role in growth and learning
☐ Makes connections between rest and daily performance

Anecdotal observations focus on sleep self-awareness, routine understanding, and rest-performance connections.`;
    
    case 'Healthy Living: Visiting the Doctor':
      return `${baseHeader}☐ Shows comfort and cooperation during health discussions
☐ Demonstrates understanding of doctors' role in maintaining health
☐ Exhibits willingness to communicate health concerns appropriately
☐ Shows trust in healthcare providers and medical processes

Anecdotal observations focus on healthcare comfort, medical understanding, and communication with health professionals.`;
    
    case 'Healthy Living: Drinking Water - Unit: Healthy Me...':
      return `${baseHeader}☐ Makes water the preferred beverage choice consistently
☐ Shows understanding of water's role in overall health and wellness
☐ Demonstrates appreciation for clean, safe drinking water
☐ Encourages healthy hydration habits in peers

Anecdotal observations focus on beverage choices, hydration awareness, and water appreciation.`;
    
    case 'Healthy Living: Taking Medicine Safely':
      return `${baseHeader}☐ Shows understanding that medicine should only be taken with adult supervision
☐ Demonstrates knowledge of basic medicine safety rules
☐ Exhibits appropriate caution around medications and supplements
☐ Shows willingness to ask adults for help with medicine questions

Anecdotal observations focus on medicine safety awareness, adult supervision understanding, and appropriate caution.`;
    
    case 'Healthy Living: Safe Play':
      return `${baseHeader}☐ Demonstrates safe behaviors during play and physical activities
☐ Shows awareness of potential hazards in play environments
☐ Exhibits good judgment in choosing safe vs. risky activities
☐ Helps promote safety among peers during group activities

Anecdotal observations focus on safety awareness, risk assessment, and peer safety support.`;
    
    case 'Healthy Living: Healthy Choices':
      return `${baseHeader}☐ Makes health-promoting decisions when presented with options
☐ Shows understanding of how choices affect personal wellness
☐ Demonstrates ability to explain reasons for healthy choices
☐ Exhibits consistency in making positive health decisions

Anecdotal observations focus on decision-making skills, choice consequences understanding, and healthy lifestyle consistency.`;
    
    case 'Healthy Living: Asking for Help':
      return `${baseHeader}☐ Shows comfort seeking assistance with health-related questions
☐ Demonstrates ability to identify when help is needed
☐ Exhibits appropriate communication when requesting health support
☐ Shows trust in adults for health guidance and assistance

Anecdotal observations focus on help-seeking comfort, need recognition, and appropriate health communication.`;
    
    case 'Healthy Living: My Body Systems':
      return `${baseHeader}☐ Shows basic understanding of how body systems work together
☐ Demonstrates curiosity about body functions and health
☐ Exhibits appreciation for the body's amazing capabilities
☐ Shows interest in learning more about human anatomy and health

Anecdotal observations focus on anatomical curiosity, body appreciation, and interest in health science.`;
    
    case 'Healthy Living: Doctor Visits':
      return `${baseHeader}☐ Exhibits cooperative behavior during health check discussions
☐ Shows understanding of preventive healthcare importance
☐ Demonstrates comfort communicating with healthcare providers
☐ Shows appreciation for medical professionals' role in community health

Anecdotal observations focus on healthcare cooperation, preventive care understanding, and medical appreciation.`;
    
    case 'Healthy Living: Staying Strong':
      return `${baseHeader}☐ Shows understanding of what makes bodies and minds strong
☐ Demonstrates commitment to strength-building activities
☐ Exhibits confidence in personal physical and mental capabilities
☐ Shows motivation to develop and maintain personal strength

Anecdotal observations focus on strength understanding, commitment to development, and personal capability confidence.`;
    
    case 'Healthy Living: Medicine Safety':
      return `${baseHeader}☐ Demonstrates understanding of proper medicine handling and storage
☐ Shows respect for the power and purpose of medical treatments
☐ Exhibits appropriate caution and safety around all medications
☐ Shows commitment to following medicine safety rules consistently

Anecdotal observations focus on medicine respect, safety compliance, and understanding treatment purposes.`;
    
    case 'Healthy Living: Healthy Habits':
      return `${baseHeader}☐ Identifies personal healthy habits and explains their benefits
☐ Shows consistency in practicing positive daily health routines
☐ Demonstrates motivation to maintain and improve healthy habits
☐ Shows pride in developing independence in personal health care

Anecdotal observations focus on habit identification, routine consistency, and independence in health practices.`;
    
    case 'Healthy Living: Staying Safe':
      return `${baseHeader}☐ Demonstrates awareness of personal safety in various environments
☐ Shows good judgment in identifying and avoiding potential dangers
☐ Exhibits appropriate responses to safety concerns and emergencies
☐ Shows responsibility for personal and peer safety

Anecdotal observations focus on safety awareness, danger recognition, and protective responsibility.`;
    
    case 'Healthy Living: Wellness Celebration':
      return `${baseHeader}☐ Shows pride in health achievements and wellness progress
☐ Demonstrates gratitude for good health and wellness opportunities
☐ Exhibits commitment to continuing healthy lifestyle practices
☐ Shows enthusiasm for sharing wellness knowledge with others

Anecdotal observations focus on health pride, wellness gratitude, and commitment to continued healthy living.`;
    
    case 'Healthy Living: Healthy Habits - Unit: Healthy Me...':
      return `${baseHeader}☐ Integrates multiple healthy habits into daily routine consistently
☐ Shows understanding of how healthy habits work together for wellness
☐ Demonstrates leadership in modeling healthy behaviors for peers
☐ Exhibits long-term commitment to maintaining healthy lifestyle choices

Anecdotal observations focus on habit integration, wellness understanding, peer leadership, and sustained commitment.`;
    
    default:
      return `${baseHeader}☐ Makes healthy choices during snack/meal discussions
☐ Shows understanding of physical wellness practices
☐ Demonstrates knowledge of hygiene and self-care
☐ Exhibits awareness of emotional wellness strategies

Anecdotal observations focus on social-emotional skill development, health knowledge application, and wellness understanding.`;
  }
}

async function individualizeUnit2Lessons() {
  try {
    console.log('🎯 INDIVIDUALIZING UNIT 2: "Healthy Me" (24 lessons)...\n');

    // Find Emily's user ID
    const emily = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Emily McIsaac'
        }
      }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Get Unit 2 lessons
    const unit2Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        unitPlan: {
          title: 'Healthy Me'
        }
      },
      include: {
        unitPlan: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`📚 Found ${unit2Lessons.length} lessons in Unit 2\n`);

    let updatedCount = 0;
    const updatePromises: Promise<any>[] = [];

    for (const lesson of unit2Lessons) {
      const uniqueIndigenousPerspective = createUnit2IndigenousPerspective(lesson.title);
      const uniqueAssessmentCriteria = createUnit2AssessmentCriteria(lesson.title);
      
      console.log(`🔧 Updating: ${lesson.title}`);
      console.log(`   Indigenous Perspective: ${uniqueIndigenousPerspective.length} chars`);
      console.log(`   Assessment Criteria: ${uniqueAssessmentCriteria.length} chars\n`);
      
      const updatePromise = prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          indigenousPerspectives: uniqueIndigenousPerspective,
          assessmentNotes: uniqueAssessmentCriteria
        }
      });
      
      updatePromises.push(updatePromise);
      updatedCount++;
    }

    console.log(`⚡ Executing ${updatePromises.length} lesson updates in parallel...`);
    
    await Promise.all(updatePromises);

    console.log(`\n✅ Successfully individualized ALL ${updatedCount} Unit 2 lessons!`);
    console.log('\n🎯 Unit 2 Individualization Summary:');
    console.log('   ✅ Each lesson now has unique Indigenous perspectives focused on traditional health');
    console.log('   ✅ Each lesson now has unique assessment criteria specific to health topics');
    console.log('   ✅ All content connects to specific health and wellness learning goals');
    console.log('   ✅ Mi\'kmaq health teachings are lesson-specific and culturally meaningful');

    // Verification
    console.log('\n🔍 Verification check...');
    const verifiedLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        unitPlan: {
          title: 'Healthy Me'
        }
      },
      select: {
        title: true,
        indigenousPerspectives: true,
        assessmentNotes: true
      }
    });

    const uniqueIndigenous = new Set(verifiedLessons.map(l => l.indigenousPerspectives));
    const uniqueAssessments = new Set(verifiedLessons.map(l => l.assessmentNotes));

    console.log(`\n📊 Verification Results:`);
    console.log(`   🏛️ Indigenous perspectives: ${uniqueIndigenous.size}/24 unique (${uniqueIndigenous.size === 24 ? '✅ SUCCESS' : '⚠️ NEEDS REVIEW'})`);
    console.log(`   📋 Assessment criteria: ${uniqueAssessments.size}/24 unique (${uniqueAssessments.size === 24 ? '✅ SUCCESS' : '⚠️ NEEDS REVIEW'})`);

    return { updatedCount, verification: { uniqueIndigenous: uniqueIndigenous.size, uniqueAssessments: uniqueAssessments.size } };

  } catch (error) {
    console.error('❌ Error individualizing Unit 2 lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

individualizeUnit2Lessons();