import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function phase6SubPlansParentCommunication() {
  try {
    console.log('📋 PHASE 6: ADDING SUBSTITUTE PLANS & PARENT COMMUNICATION\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98h0001vjr1cvh4knsh' },
      orderBy: { startDate: 'asc' }
    });

    // Unit 1: Bienvenue à l'école française
    await prisma.unitPlan.update({
      where: { id: units[0].id },
      data: {
        fieldTripsAndGuestSpeakers: "SUBSTITUTE TEACHER INSTRUCTIONS: French vocabulary review games using picture cards (provided in classroom). Students can color and label classroom objects. Play French greeting song (audio files on classroom computer). Independent activity: Match French words to pictures worksheet. Emergency backup: English instruction permitted if needed for safety.",
        parentCommunicationPlan: "WEEK 1 NEWSLETTER: 'Welcome to French Immersion! Your child is learning classroom vocabulary.' Include: 10 key words for home practice, bedtime routine suggestion 'Bonne nuit!', encouragement that children learn at different paces. WEEK 4 INVITATION: Classroom tour presentation - children excited to show you their French learning!"
      }
    });
    console.log('✅ Unit 1: Sub plans for vocabulary review + parent welcome');

    // Unit 2: Les merveilles de l'automne
    await prisma.unitPlan.update({
      where: { id: units[1].id },
      data: {
        fieldTripsAndGuestSpeakers: "SUBSTITUTE TEACHER INSTRUCTIONS: Autumn leaf observation activity using magnifying glasses (classroom supply). Students draw and color autumn leaves using French color words (word wall display). Watch autumn video (YouTube playlist saved). Independent work: Autumn coloring pages with French labels. Outdoor option: Short leaf collection walk (if weather permits and admin approved).",
        parentCommunicationPlan: "FAMILY AUTUMN WALKS: Send home observation sheet for family nature walks with simple French vocabulary. Include autumn word list with pictures. Suggestion: 'Practice colors during car rides - rouge, orange, jaune!' Request: Send autumn photos for classroom display if possible."
      }
    });
    console.log('✅ Unit 2: Sub plans for autumn activities + family engagement');

    // Unit 3: Contes et traditions automnales
    await prisma.unitPlan.update({
      where: { id: units[2].id },
      data: {
        fieldTripsAndGuestSpeakers: "SUBSTITUTE TEACHER INSTRUCTIONS: Read-aloud of familiar autumn story (book marked on shelf). Students draw favorite story character and write character name in French. Story sequencing activity using picture cards (prepared in unit folder). Independent option: Autumn story coloring books available. Quiet activity: Students look at autumn picture books independently.",
        parentCommunicationPlan: "FAMILY STORY TIME: Share that children are learning about stories and traditions. Include: List of simple French story books available at local library. Encouragement: 'Ask your child to tell you about their favorite classroom story!' Request: Family tradition sharing sheet for multicultural learning."
      }
    });
    console.log('✅ Unit 3: Sub plans for story activities + family traditions');

    // Unit 4: Ma famille et mes racines
    await prisma.unitPlan.update({
      where: { id: units[3].id },
      data: {
        fieldTripsAndGuestSpeakers: "SUBSTITUTE TEACHER INSTRUCTIONS: Family drawing activity using provided templates. Students describe family member using French words (word bank on whiteboard). Family photo sharing if students brought photos. Independent work: Family vocabulary worksheets and family tree coloring page. Simple activity: Count family members using French numbers.",
        parentCommunicationPlan: "FAMILY CELEBRATION PREPARATION: Request family photos for classroom book project. Include: Family vocabulary list with pronunciation guide. Suggestion: 'Teach your child how to say family member names in French - they love being teachers!' Invitation: Heritage celebration where children will present their learning."
      }
    });
    console.log('✅ Unit 4: Sub plans for family activities + heritage celebration');

    // Unit 5: Célébrations d'hiver
    await prisma.unitPlan.update({
      where: { id: units[4].id },
      data: {
        fieldTripsAndGuestSpeakers: "SUBSTITUTE TEACHER INSTRUCTIONS: Winter celebration sharing circle (students can share in English if needed). Create paper snowflakes and winter decorations. Review winter vocabulary using picture cards (classroom display). Independent activity: Winter celebration coloring pages with French labels. Quiet option: Winter picture books for individual reading.",
        parentCommunicationPlan: "WINTER TRADITIONS SHARING: Thank families for sharing holiday experiences. Include: Winter vocabulary list for continued practice. Information: Children learning about celebrations from many cultures with respect. Invitation: Winter traditions festival - families welcome to share cultural traditions if interested."
      }
    });
    console.log('✅ Unit 5: Sub plans for winter activities + traditions festival');

    // Unit 6: Poésie et rythmes français
    await prisma.unitPlan.update({
      where: { id: units[5].id },
      data: {
        fieldTripsAndGuestSpeakers: "SUBSTITUTE TEACHER INSTRUCTIONS: Play familiar French songs (playlist ready on classroom computer). Students can clap along and sing familiar parts. Rhyming word matching activity using prepared cards. Independent work: Poetry coloring pages and simple rhyme completion worksheets. Movement activity: Simple actions to French songs if comfortable.",
        parentCommunicationPlan: "POETRY CAFÉ PREPARATION: Children learning French songs and poems! Include: Lyrics to 3 favorite classroom songs for home practice. Suggestion: 'Children love performing - encourage them to sing their French songs!' Invitation: Poetry café performance - children excited to show their learning."
      }
    });
    console.log('✅ Unit 6: Sub plans for music/poetry + performance preparation');

    // Unit 7: Histoires qui grandissent
    await prisma.unitPlan.update({
      where: { id: units[6].id },
      data: {
        fieldTripsAndGuestSpeakers: "SUBSTITUTE TEACHER INSTRUCTIONS: Read-aloud from classroom French books (select from marked shelf). Students draw story scenes and identify characters. Story element identification using prepared worksheets. Independent activity: Individual reading of picture books and drawing favorite scenes. Listening center: Audio books in French if available.",
        parentCommunicationPlan: "READING GROWTH CELEBRATION: Children showing amazing progress in French reading! Include: Reading tips for families ('Let them read to you, even if pronunciation isn't perfect'). Library suggestion: French books available at local library. Invitation: Reading showcase where children will demonstrate their growth."
      }
    });
    console.log('✅ Unit 7: Sub plans for reading activities + growth celebration');

    // Unit 8: Jeunes auteurs créatifs
    await prisma.unitPlan.update({
      where: { id: units[7].id },
      data: {
        fieldTripsAndGuestSpeakers: "SUBSTITUTE TEACHER INSTRUCTIONS: Students work on story illustrations using art supplies. Story planning worksheet completion (templates available). Independent writing time with picture prompts provided. Writing center activities: Story idea cards and character creation sheets. Sharing option: Students can share story ideas with partner if time permits.",
        parentCommunicationPlan: "YOUNG AUTHORS AT WORK: Children creating their own French stories! Include: Writing progress update and encouragement about creative process. Home support: 'Ask about their story ideas - they love sharing their creativity!' Invitation: Authors' festival where children will read their published stories to families."
      }
    });
    console.log('✅ Unit 8: Sub plans for writing activities + authors festival');

    // Unit 9: Explorateurs de textes
    await prisma.unitPlan.update({
      where: { id: units[8].id },
      data: {
        fieldTripsAndGuestSpeakers: "SUBSTITUTE TEACHER INSTRUCTIONS: Question generation activity using 'I wonder...' prompts (posted in classroom). Students explore classroom books to find answers to simple questions. Discovery drawing activity with provided templates. Independent work: Information scavenger hunt using classroom posters and books. Quiet activity: Individual exploration of non-fiction picture books.",
        parentCommunicationPlan: "YOUNG RESEARCHERS: Children learning to ask questions and find answers! Include: Question starters for family conversations ('What do you wonder about...?'). Encouragement: Support their curiosity with library visits and exploration. Invitation: Knowledge fair where children will teach others about their discoveries."
      }
    });
    console.log('✅ Unit 9: Sub plans for discovery activities + knowledge fair');

    // Unit 10: Notre odyssée française
    await prisma.unitPlan.update({
      where: { id: units[9].id },
      data: {
        fieldTripsAndGuestSpeakers: "SUBSTITUTE TEACHER INSTRUCTIONS: Portfolio organization activity - students select favorite work samples. French learning reflection using picture prompts ('What I learned this year'). Goal setting activity with simple templates. Independent work: Creation of thank you cards for school helpers in French. Celebration preparation: Practice presenting favorite learning to others.",
        parentCommunicationPlan: "YEAR-END CELEBRATION PREPARATION: Children reflecting on amazing French learning journey! Include: Summary of year's accomplishments and growth highlights. Gratitude: Thank you for supporting your child's French immersion experience. SPECIAL INVITATION: Community celebration showcasing all learning - your child can't wait to share their French skills with you!"
      }
    });
    console.log('✅ Unit 10: Sub plans for reflection activities + celebration preparation');

    // Add general substitute teacher guidance to Long Range Plan
    await prisma.longRangePlan.update({
      where: { id: 'cmebyc98h0001vjr1cvh4knsh' },
      data: {
        parentCommunication: "SUBSTITUTE TEACHER GENERAL GUIDANCE: All materials organized in unit folders with clear labels. Emergency contact list and school procedures posted. Student helpers identified for each unit. Simplified activities available requiring minimal French knowledge. Permission granted for English instruction if safety required. Clear schedule and behavior expectations posted. Contact regular teacher if major concerns arise."
      }
    });

    console.log('\n🎉 PHASE 6 COMPLETE:');
    console.log('✅ Added substitute teacher instructions for all units');
    console.log('✅ Created parent communication templates');
    console.log('✅ Included emergency protocols for non-French speakers');
    console.log('✅ Provided independent activities requiring minimal prep');
    console.log('✅ Built family engagement opportunities');
    console.log('✅ Made units substitute-teacher friendly');

  } catch (error) {
    console.error('Error in Phase 6:', error);
  } finally {
    await prisma.$disconnect();
  }
}

phase6SubPlansParentCommunication();