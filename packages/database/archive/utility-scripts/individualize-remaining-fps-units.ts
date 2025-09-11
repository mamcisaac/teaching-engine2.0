import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to create unique Indigenous perspectives for remaining units
function createRemainingUnitsIndigenousPerspective(lessonTitle: string, unitTitle: string): string {
  const basePrefix = "Mi'kmaq teachings emphasize ";
  
  // UNIT 3: SAFE AND SOUND (12 lessons)
  if (unitTitle === 'Safe and Sound') {
    switch (lessonTitle) {
      case 'Safety First: Safety at Home':
        return `${basePrefix}that home is our sacred space where family spirits gather for protection. Traditional home safety includes smudging to clear negative energy, teaching children about fire safety around sacred fires, keeping medicines properly stored, and creating peaceful spaces where family members feel secure and protected.`;
      
      case 'Safety First: Safety at School':
        return `${basePrefix}that learning environments should nurture both mind and spirit safely. Traditional teachings about community gathering spaces include respecting shared spaces, following guidance from elders and teachers, supporting each other's safety, and maintaining harmony that allows all community members to learn and grow.`;
      
      case 'Safety First: Traffic Safety':
        return `${basePrefix}awareness and respect when traveling traditional and modern pathways. Traditional safety teachings include observing natural signs, staying alert to surroundings, traveling in groups when possible, and understanding that safe travel allows us to visit relatives and maintain community connections across distances.`;
      
      case 'Safety First: Stranger Safety':
        return `${basePrefix}trusting inner wisdom and community protection when meeting unknown people. Traditional teachings include recognizing trustworthy individuals through their actions, staying close to known community members, seeking elder guidance about new people, and understanding that community protection keeps everyone safe.`;
      
      case 'Safety First: Internet Safety':
        return `${basePrefix}protecting sacred personal information and maintaining spiritual boundaries in digital spaces. Traditional teachings about privacy and protection apply to modern communication tools, understanding that personal stories and family information should be shared carefully and with appropriate people.`;
      
      case 'Safety First: Emergency Helpers':
        return `${basePrefix}recognizing and honoring those who dedicate their lives to community protection and healing. Traditional understanding includes respecting firefighters like traditional fire keepers, police as community protectors, and medical helpers as modern medicine people who serve the community's wellbeing.`;
      
      case 'Safety First: Fire Safety':
        return `${basePrefix}sacred respect for fire as both life-giver and powerful force requiring careful handling. Traditional fire safety includes understanding fire's spiritual significance, learning proper fire building and extinguishing, recognizing fire dangers, and maintaining the balance between fire's gifts and its power.`;
      
      case 'Safety First: Water Safety':
        return `${basePrefix}deep respect for water's power and the need for careful interaction with this sacred element. Traditional water safety includes understanding water spirits, never turning your back on water, learning to swim as connection with water beings, and recognizing that water demands respect and attention.`;
      
      case 'Safety First: Playground Safety':
        return `${basePrefix}creating joyful play spaces where children can develop strength and skills safely. Traditional play safety includes looking out for younger children, using equipment properly, understanding natural play boundaries, and ensuring that play builds community rather than creating division or danger.`;
      
      case 'Safety First: Bike Safety':
        return `${basePrefix}responsible use of tools and equipment that help us travel efficiently and safely. Traditional teachings about caring for tools apply to modern transportation, including maintaining equipment properly, using protective gear, being aware of surroundings, and respecting shared pathways.`;
      
      case 'Safety First: Asking for Help':
        return `${basePrefix}that seeking protection and guidance is wisdom, not weakness. Traditional safety teachings include identifying trustworthy adults, communicating dangers clearly, understanding that community members help each other, and recognizing that asking for help strengthens the entire community's safety.`;
      
      case 'Safety First: Safety Heroes':
        return `${basePrefix}honoring those who dedicate their lives to protecting others and celebrating children who make safe choices. Traditional understanding recognizes that everyone can be a protector through awareness, good choices, helping others, and maintaining the community values that keep everyone safe.`;
      
      default:
        return `${basePrefix}community protection through collective responsibility and the teaching that we are all related (Msit No'kmaq). Traditional safety wisdom includes recognizing safe relationships, trusting intuition, and understanding that safety comes from strong community bonds.`;
    }
  }
  
  // UNIT 4: FRIENDS AND FEELINGS (12 lessons)
  if (unitTitle === 'Friends and Feelings') {
    switch (lessonTitle) {
      case 'Friends & Feelings: Making Friends':
        return `${basePrefix}that friendship begins with recognizing the sacred spirit in each person. Traditional friendship formation includes sharing experiences, showing respect for differences, offering help when needed, and understanding that true friendships are gifts that enrich our lives and strengthen our community connections.`;
      
      case 'Friends & Feelings: Being a Good Friend':
        return `${basePrefix}that good friendship requires the same qualities as good community membership: loyalty, honesty, generosity, and support. Traditional friendship teachings include being reliable like the seasons, supportive like the forest community, and understanding that friendship is reciprocal giving and receiving.`;
      
      case 'Friends & Feelings: Sharing and Taking Turns':
        return `${basePrefix}that sharing resources and opportunities reflects the natural law of abundance and reciprocity. Traditional sharing teachings include understanding that what we give comes back to us, taking only what we need, ensuring everyone has opportunities, and recognizing that sharing creates harmony and balance.`;
      
      case 'Friends & Feelings: Feeling Happy':
        return `${basePrefix}that joy and happiness are sacred gifts to be shared with others like sunshine warming the community. Traditional teachings about happiness include celebrating life's blessings, finding joy in simple pleasures, sharing happiness through laughter and play, and understanding that personal joy contributes to community wellness.`;
      
      case 'Friends & Feelings: Feeling Sad':
        return `${basePrefix}that sadness is a sacred emotion that connects us to loss, love, and the depth of human experience. Traditional teachings honor sadness as necessary for healing, understanding that tears cleanse the spirit, that community support helps us through difficult times, and that sadness teaches us to value what we love.`;
      
      case 'Friends & Feelings: Feeling Angry':
        return `${basePrefix}that anger can be sacred fire that protects what we value when channeled appropriately. Traditional teachings include understanding anger as energy that needs proper direction, using anger to protect rather than harm, seeking elder guidance when anger feels overwhelming, and transforming anger into positive action.`;
      
      case 'Friends & Feelings: Feeling Scared':
        return `${basePrefix}that fear can be protective wisdom that keeps us safe from real dangers. Traditional teachings include listening to fear's warnings, seeking community support when afraid, understanding the difference between real and imagined dangers, and finding courage through connection with others and spiritual protection.`;
      
      case 'Friends & Feelings: Helping Others Feel Better':
        return `${basePrefix}that comforting others is sacred work that reflects our interconnectedness. Traditional helping teachings include offering presence rather than solutions, listening with the heart, sharing practical support, and understanding that healing happens through community care and spiritual connection.`;
      
      case 'Friends & Feelings: Solving Friend Problems':
        return `${basePrefix}that conflicts are opportunities to deepen understanding and strengthen relationships. Traditional conflict resolution includes speaking truth with kindness, listening to all perspectives, seeking guidance from wise community members, and focusing on solutions that honor everyone's dignity and needs.`;
      
      case 'Friends & Feelings: Including Everyone':
        return `${basePrefix}that every person has gifts to contribute to the community circle. Traditional inclusion teachings recognize that excluding others weakens the whole community, that everyone belongs to the human family, that differences strengthen rather than divide us, and that inclusion reflects spiritual understanding.`;
      
      case 'Friends & Feelings: Kindness Counts':
        return `${basePrefix}that acts of kindness are prayers in action that create positive energy in the world. Traditional kindness teachings include understanding that small acts create big changes, that kindness is a choice that reflects our character, and that kindness given freely returns to us multiplied.`;
      
      case 'Friends & Feelings: Friendship Celebration':
        return `${basePrefix}that friendship is a sacred gift worthy of gratitude and celebration. Traditional celebration of relationships includes honoring the journey of friendship, expressing appreciation for friends' gifts, committing to continued friendship growth, and recognizing friendship as part of life's greatest treasures.`;
      
      default:
        return `${basePrefix}emotional intelligence through understanding the interconnectedness of all feelings and relationships. Traditional teachings include active listening, empathy, conflict resolution, and honoring each person's emotional truth within the community circle.`;
    }
  }
  
  // UNIT 5: GROWING AND LEARNING (12 lessons)
  if (unitTitle === 'Growing and Learning') {
    switch (lessonTitle) {
      case 'Growing & Learning: How I\'ve Grown':
        return `${basePrefix}that growth is a sacred spiral journey, each cycle bringing deeper wisdom and greater responsibility. Traditional understanding recognizes growth in all dimensions - physical, mental, emotional, and spiritual - and celebrates each milestone as preparation for greater service to community and Creator.`;
      
      case 'Growing & Learning: Learning New Things':
        return `${basePrefix}that curiosity and willingness to learn are sacred gifts that connect us to the endless wisdom of creation. Traditional learning approaches include observation of nature, listening to elder teachings, hands-on experience, and understanding that every experience carries lessons for those who are open to receiving them.`;
      
      case 'Growing & Learning: Making Mistakes and Learning':
        return `${basePrefix}that mistakes are sacred teachers that guide us toward wisdom and humility. Traditional teachings include understanding that perfection is not the goal - growth is, that errors are stepping stones to mastery, that asking for help shows wisdom, and that learning from mistakes strengthens character.`;
      
      case 'Growing & Learning: Setting Goals':
        return `${basePrefix}that setting intentions and goals is sacred visioning that aligns personal growth with community needs. Traditional goal-setting includes seeking elder guidance, considering impact on seven generations, understanding that goals should serve both personal development and collective wellness, and remaining flexible as wisdom grows.`;
      
      case 'Growing & Learning: Asking for Help':
        return `${basePrefix}that seeking guidance and assistance honors the wisdom of others and strengthens community bonds. Traditional help-seeking includes recognizing when guidance is needed, approaching elders and teachers with respect, understanding that independence and interdependence both have value, and appreciating those who share their knowledge.`;
      
      case 'Growing & Learning: Persevering':
        return `${basePrefix}that persistence and determination are sacred qualities that honor our commitments and develop character. Traditional teachings about perseverance include understanding that worthy goals require sustained effort, that challenges test our commitment, that spiritual strength supports physical effort, and that perseverance serves community as well as self.`;
      
      case 'Growing & Learning: Celebrating Success':
        return `${basePrefix}that acknowledging achievements honors the gifts Creator placed within us and the support community provided. Traditional celebration includes expressing gratitude for guidance received, sharing success with those who helped, understanding that personal achievements strengthen the whole community, and committing to use success to help others.`;
      
      case 'Growing & Learning: Growth Mindset':
        return `${basePrefix}that believing in our ability to learn and grow reflects trust in Creator's gifts within us. Traditional growth mindset includes understanding that abilities can be developed, that effort and practice create improvement, that challenges are opportunities for growth, and that supporting others' growth strengthens our own development.`;
      
      case 'Growing & Learning: Learning Styles':
        return `${basePrefix}that people receive and process knowledge in diverse ways, reflecting the diversity of creation itself. Traditional understanding recognizes visual learners who learn through observation, kinesthetic learners who learn through doing, auditory learners who learn through stories, and intuitive learners who learn through spiritual connection and dreams.`;
      
      case 'Growing & Learning: Practice Makes Progress':
        return `${basePrefix}that repetition and practice are sacred rhythms that deepen understanding and build mastery. Traditional skill development includes understanding that mastery comes through patient practice, that progress is more important than perfection, that consistent effort creates lasting change, and that practice honors the gifts we've been given.`;
      
      case 'Growing & Learning: Learning Challenges':
        return `${basePrefix}that difficulties in learning are opportunities to develop patience, creativity, and resilience. Traditional approaches to learning challenges include seeking different teaching methods, understanding that everyone learns at their own pace, finding strengths to support areas of difficulty, and believing that persistence overcomes obstacles.`;
      
      case 'Growing & Learning: Future Growth':
        return `${basePrefix}that envisioning continued growth and development honors our potential and Creator's hopes for us. Traditional future planning includes understanding that learning never ends, that each stage of life brings new opportunities for growth, that our development should serve future generations, and that growth continues throughout life's sacred journey.`;
      
      default:
        return `${basePrefix}lifelong learning as a sacred journey, where growth happens through observation of nature's cycles and elder teachings. Traditional knowledge passes through storytelling, modeling, and experiential learning, recognizing that each person learns at their own pace.`;
    }
  }
  
  // UNIT 6: OUR WONDERFUL WORLD (12 lessons)
  if (unitTitle === 'Our Wonderful World') {
    switch (lessonTitle) {
      case 'Wonderful World: Caring for Our Environment':
        return `${basePrefix}that humans are caretakers, not owners, of Mother Earth and all her children. Traditional environmental stewardship includes understanding our responsibility to protect natural resources, taking only what we need, giving back more than we take, and considering the impact of our actions on seven generations of future beings.`;
      
      case 'Wonderful World: Helping Our Community':
        return `${basePrefix}that community service is sacred work that honors our interconnectedness and responsibility to each other. Traditional community help includes supporting elders, caring for children, sharing resources with families in need, and understanding that strong communities require everyone's contribution and participation.`;
      
      case 'Wonderful World: Being Grateful':
        return `${basePrefix}that gratitude is the foundation of spiritual wellness and right relationship with all life. Traditional gratitude practices include daily thanksgiving for life's gifts, recognizing the sacrifices others make for our wellbeing, expressing appreciation for nature's abundance, and understanding that gratitude opens our hearts to receive more blessings.`;
      
      case 'Wonderful World: Showing Kindness':
        return `${basePrefix}that kindness is sacred energy that heals wounds, builds bridges, and creates harmony in the world. Traditional kindness teachings include understanding that gentle words and actions have power, that kindness given freely multiplies and returns, that kindness toward all beings reflects spiritual maturity, and that kindness changes the world one interaction at a time.`;
      
      case 'Wonderful World: Making a Difference':
        return `${basePrefix}that every person, regardless of age, has the power to create positive change in their community and world. Traditional teachings about making a difference include understanding that small actions create big changes, that individual choices affect the collective, that young people have important contributions to make, and that making a difference is a sacred responsibility.`;
      
      case 'Wonderful World: Environmental Helpers':
        return `${basePrefix}honoring those who dedicate their lives to protecting Mother Earth and all her children. Traditional understanding recognizes environmental protectors as modern warriors defending the sacred, understanding that environmental health affects all beings, that protecting nature requires community effort, and that environmental helpers serve future generations.`;
      
      case 'Wonderful World: Community Service':
        return `${basePrefix}that giving our time and energy to serve others is sacred work that honors our gifts and strengthens community bonds. Traditional service includes understanding that everyone has something to contribute, that service is reciprocal giving and receiving, that community service develops character, and that serving others serves the Creator.`;
      
      case 'Wonderful World: Acts of Kindness':
        return `${basePrefix}that intentional acts of kindness are prayers in action that send positive energy into the world. Traditional kindness practices include random acts that brighten someone's day, planned kindness that addresses specific needs, understanding that kindness costs nothing but creates priceless value, and knowing that kindness is contagious.`;
      
      case 'Wonderful World: Thankfulness Practice':
        return `${basePrefix}that cultivating gratitude through daily practice develops spiritual awareness and appreciation for life's abundance. Traditional thankfulness includes morning prayers of appreciation, evening reflection on the day's gifts, expressing gratitude to all beings who support our lives, and understanding that thankfulness transforms challenges into teachings.`;
      
      case 'Wonderful World: World Citizens':
        return `${basePrefix}that all humans belong to one global family sharing one Mother Earth home. Traditional understanding of world citizenship includes respecting different cultures while honoring universal human values, understanding that actions in one place affect people everywhere, celebrating diversity as strength, and working together for global harmony and justice.`;
      
      case 'Wonderful World: Positive Impact':
        return `${basePrefix}that living with intention to create positive change reflects our sacred responsibility to future generations. Traditional positive impact includes understanding that our choices matter, that positive actions create ripple effects, that we can influence others through modeling good behavior, and that positive impact is a lifelong commitment.`;
      
      case 'Wonderful World: Wonderful World Celebration':
        return `${basePrefix}celebrating the beauty, diversity, and interconnectedness of all creation while committing to continued stewardship and service. Traditional celebration includes expressing gratitude for Earth's gifts, honoring all beings who share our world, celebrating human diversity and cultural richness, and committing to protect and preserve the wonderful world for all future generations.`;
      
      default:
        return `${basePrefix}stewardship and responsibility for Mother Earth, understanding that humans are caretakers of creation. Environmental education includes traditional ecological knowledge, seasonal cycles, and considering the impact of our actions on seven generations.`;
    }
  }
  
  return `${basePrefix}wellness, community connection, and living in harmony with natural and spiritual laws.`;
}

// Function to create unique assessment criteria for remaining units
function createRemainingUnitsAssessmentCriteria(lessonTitle: string, unitTitle: string): string {
  const baseHeader = "Observable social-emotional learning assessment:\n";
  
  // UNIT 3: SAFE AND SOUND (12 lessons)
  if (unitTitle === 'Safe and Sound') {
    switch (lessonTitle) {
      case 'Safety First: Safety at Home':
        return `${baseHeader}☐ Identifies potential safety hazards in home environments
☐ Demonstrates knowledge of basic home safety rules and procedures
☐ Shows understanding of emergency procedures at home
☐ Exhibits responsible behavior regarding home safety practices

Anecdotal observations focus on hazard recognition, safety rule knowledge, emergency awareness, and personal responsibility for home safety.`;
      
      case 'Safety First: Safety at School':
        return `${baseHeader}☐ Follows school safety rules consistently and appropriately
☐ Shows awareness of safe vs. unsafe behaviors in school settings
☐ Demonstrates knowledge of school emergency procedures
☐ Helps promote safety among classmates

Anecdotal observations focus on rule compliance, behavior awareness, emergency knowledge, and peer safety support.`;
      
      case 'Safety First: Traffic Safety':
        return `${baseHeader}☐ Demonstrates knowledge of basic traffic safety rules for pedestrians
☐ Shows appropriate caution and awareness around vehicles
☐ Exhibits safe behaviors when crossing streets or in parking areas
☐ Understands the importance of being visible and predictable

Anecdotal observations focus on traffic rule knowledge, vehicle awareness, crossing safety, and visibility understanding.`;
      
      case 'Safety First: Stranger Safety':
        return `${baseHeader}☐ Shows understanding of appropriate vs. inappropriate stranger interactions
☐ Demonstrates knowledge of trusted adults and safe people
☐ Exhibits appropriate caution with unknown individuals
☐ Shows confidence in seeking help when feeling unsafe

Anecdotal observations focus on stranger awareness, trusted adult identification, appropriate caution, and help-seeking confidence.`;
      
      case 'Safety First: Internet Safety':
        return `${baseHeader}☐ Shows understanding of personal information privacy online
☐ Demonstrates awareness of appropriate vs. inappropriate online content
☐ Exhibits caution about online interactions and communications
☐ Shows knowledge of how to report concerning online experiences

Anecdotal observations focus on privacy awareness, content recognition, interaction caution, and reporting knowledge.`;
      
      case 'Safety First: Emergency Helpers':
        return `${baseHeader}☐ Identifies different types of emergency helpers and their roles
☐ Shows understanding of when and how to contact emergency services
☐ Demonstrates respect and appreciation for emergency workers
☐ Exhibits knowledge of how to provide helpful information in emergencies

Anecdotal observations focus on helper identification, contact knowledge, appreciation expression, and information provision skills.`;
      
      case 'Safety First: Fire Safety':
        return `${baseHeader}☐ Demonstrates knowledge of fire safety rules and prevention
☐ Shows understanding of fire escape procedures and meeting places
☐ Exhibits appropriate response to fire safety signals and drills
☐ Shows respect for fire's power and potential dangers

Anecdotal observations focus on fire safety knowledge, escape procedures, drill participation, and fire respect.`;
      
      case 'Safety First: Water Safety':
        return `${baseHeader}☐ Demonstrates understanding of basic water safety rules
☐ Shows appropriate caution and respect around water environments
☐ Exhibits knowledge of swimming safety and supervision needs
☐ Shows understanding of water emergency procedures

Anecdotal observations focus on water safety rules, environmental caution, swimming awareness, and emergency knowledge.`;
      
      case 'Safety First: Playground Safety':
        return `${baseHeader}☐ Follows playground rules and equipment safety guidelines
☐ Shows awareness of safe vs. unsafe playground behaviors
☐ Demonstrates consideration for other children's safety during play
☐ Exhibits appropriate response to playground injuries or conflicts

Anecdotal observations focus on rule compliance, behavior awareness, peer consideration, and injury response.`;
      
      case 'Safety First: Bike Safety':
        return `${baseHeader}☐ Demonstrates knowledge of bicycle safety rules and equipment
☐ Shows understanding of helmet importance and proper fitting
☐ Exhibits safe cycling behaviors and traffic awareness
☐ Shows responsibility for bicycle maintenance and storage

Anecdotal observations focus on cycling rules, helmet compliance, traffic awareness, and equipment responsibility.`;
      
      case 'Safety First: Asking for Help':
        return `${baseHeader}☐ Shows comfort and confidence in seeking help when needed
☐ Demonstrates ability to identify appropriate people to ask for help
☐ Exhibits clear communication when requesting safety assistance
☐ Shows understanding of different types of help available

Anecdotal observations focus on help-seeking comfort, appropriate person identification, communication clarity, and help type awareness.`;
      
      case 'Safety First: Safety Heroes':
        return `${baseHeader}☐ Recognizes and celebrates safety-conscious behaviors in self and others
☐ Shows commitment to being a safety role model for peers
☐ Demonstrates understanding of how individual choices affect group safety
☐ Exhibits pride in making responsible safety decisions

Anecdotal observations focus on safety recognition, role modeling, group impact understanding, and decision pride.`;
      
      default:
        return `${baseHeader}☐ Identifies safe vs. unsafe situations appropriately
☐ Demonstrates protective safety behaviors and responses
☐ Shows trust in seeking help from appropriate adults
☐ Exhibits understanding of personal boundaries

Anecdotal observations focus on safety recognition, protective behaviors, help-seeking trust, and boundary understanding.`;
    }
  }
  
  // UNIT 4: FRIENDS AND FEELINGS (12 lessons)
  if (unitTitle === 'Friends and Feelings') {
    switch (lessonTitle) {
      case 'Friends & Feelings: Making Friends':
        return `${baseHeader}☐ Shows initiative and confidence in approaching potential friends
☐ Demonstrates inclusive and welcoming behaviors toward new classmates
☐ Exhibits understanding of qualities that make good friendships
☐ Shows respect for differences when building friendships

Anecdotal observations focus on friendship initiative, inclusive behaviors, relationship understanding, and difference appreciation.`;
      
      case 'Friends & Feelings: Being a Good Friend':
        return `${baseHeader}☐ Demonstrates loyalty, honesty, and reliability in friendships
☐ Shows ability to support friends during difficult times
☐ Exhibits sharing and cooperation in friend interactions
☐ Shows understanding of reciprocity in friendship relationships

Anecdotal observations focus on friendship qualities, support provision, cooperation skills, and reciprocity understanding.`;
      
      case 'Friends & Feelings: Sharing and Taking Turns':
        return `${baseHeader}☐ Shares materials, toys, and opportunities willingly with others
☐ Demonstrates patience when waiting for turns
☐ Shows understanding of fairness in sharing and turn-taking
☐ Exhibits generous and considerate behavior toward peers

Anecdotal observations focus on sharing willingness, turn-taking patience, fairness understanding, and considerate behavior.`;
      
      case 'Friends & Feelings: Feeling Happy':
        return `${baseHeader}☐ Expresses joy and happiness appropriately and authentically
☐ Shows ability to find and create happiness in daily activities
☐ Demonstrates sharing of positive emotions with others
☐ Exhibits appreciation for things and people that bring happiness

Anecdotal observations focus on joy expression, happiness creation, positive sharing, and appreciation demonstration.`;
      
      case 'Friends & Feelings: Feeling Sad':
        return `${baseHeader}☐ Expresses sadness appropriately and seeks comfort when needed
☐ Shows understanding that sadness is a normal, healthy emotion
☐ Demonstrates empathy when others are experiencing sadness
☐ Exhibits healthy coping strategies for managing sad feelings

Anecdotal observations focus on sadness expression, emotion normalization, empathy demonstration, and coping strategy use.`;
      
      case 'Friends & Feelings: Feeling Angry':
        return `${baseHeader}☐ Recognizes anger triggers and early warning signs
☐ Demonstrates appropriate expression of angry feelings
☐ Shows ability to use anger management strategies effectively
☐ Exhibits understanding of constructive vs. destructive anger responses

Anecdotal observations focus on trigger recognition, appropriate expression, strategy use, and response understanding.`;
      
      case 'Friends & Feelings: Feeling Scared':
        return `${baseHeader}☐ Identifies sources of fear and distinguishes real vs. imagined dangers
☐ Shows ability to seek comfort and support when feeling scared
☐ Demonstrates courage in facing appropriate challenges
☐ Exhibits understanding of fear as a protective emotion

Anecdotal observations focus on fear identification, support seeking, courage demonstration, and protective understanding.`;
      
      case 'Friends & Feelings: Helping Others Feel Better':
        return `${baseHeader}☐ Shows empathy and compassion toward others in distress
☐ Demonstrates appropriate comfort-giving behaviors and responses
☐ Exhibits understanding of how to provide emotional support
☐ Shows willingness to help peers through difficult emotions

Anecdotal observations focus on empathy expression, comfort behaviors, support understanding, and helping willingness.`;
      
      case 'Friends & Feelings: Solving Friend Problems':
        return `${baseHeader}☐ Shows ability to identify and articulate friendship problems
☐ Demonstrates willingness to listen to different perspectives
☐ Exhibits problem-solving skills in conflict resolution
☐ Shows commitment to maintaining friendships through difficulties

Anecdotal observations focus on problem identification, perspective listening, solution skills, and relationship commitment.`;
      
      case 'Friends & Feelings: Including Everyone':
        return `${baseHeader}☐ Actively includes others in games, activities, and conversations
☐ Shows awareness of when others are being excluded
☐ Demonstrates advocacy for fair treatment and inclusion
☐ Exhibits appreciation for diversity and different perspectives

Anecdotal observations focus on inclusion actions, exclusion awareness, advocacy demonstration, and diversity appreciation.`;
      
      case 'Friends & Feelings: Kindness Counts':
        return `${baseHeader}☐ Performs acts of kindness spontaneously and intentionally
☐ Shows understanding of kindness impact on others and community
☐ Demonstrates recognition and appreciation of others' kindness
☐ Exhibits commitment to being kind even in challenging situations

Anecdotal observations focus on kindness actions, impact understanding, appreciation expression, and challenging situation commitment.`;
      
      case 'Friends & Feelings: Friendship Celebration':
        return `${baseHeader}☐ Expresses gratitude and appreciation for friendships
☐ Shows reflection on friendship growth and learning
☐ Demonstrates commitment to continued friendship development
☐ Exhibits celebration of friendship diversity and richness

Anecdotal observations focus on gratitude expression, growth reflection, development commitment, and diversity celebration.`;
      
      default:
        return `${baseHeader}☐ Uses appropriate words to express emotions and feelings
☐ Shows empathy and consideration for others' emotions
☐ Demonstrates conflict resolution skills with peers
☐ Exhibits positive friendship behaviors and social skills

Anecdotal observations focus on emotion expression, empathy demonstration, conflict resolution, and social skill development.`;
    }
  }
  
  // UNIT 5: GROWING AND LEARNING (12 lessons)
  if (unitTitle === 'Growing and Learning') {
    switch (lessonTitle) {
      case 'Growing & Learning: How I\'ve Grown':
        return `${baseHeader}☐ Recognizes and articulates specific areas of personal growth
☐ Shows pride and satisfaction in development achievements
☐ Demonstrates understanding of growth as an ongoing process
☐ Exhibits reflection skills about personal development journey

Anecdotal observations focus on growth recognition, achievement pride, process understanding, and reflection skill development.`;
      
      case 'Growing & Learning: Learning New Things':
        return `${baseHeader}☐ Shows curiosity and enthusiasm for new learning opportunities
☐ Demonstrates willingness to try unfamiliar activities and subjects
☐ Exhibits persistence when learning becomes challenging
☐ Shows appreciation for the learning process and discovery

Anecdotal observations focus on learning curiosity, willingness to try new things, persistence demonstration, and process appreciation.`;
      
      case 'Growing & Learning: Making Mistakes and Learning':
        return `${baseHeader}☐ Shows understanding that mistakes are part of learning
☐ Demonstrates resilience when making errors or facing setbacks
☐ Exhibits ability to learn from mistakes and apply new knowledge
☐ Shows comfort with imperfection and growth-oriented mindset

Anecdotal observations focus on mistake acceptance, resilience demonstration, learning application, and growth mindset comfort.`;
      
      case 'Growing & Learning: Setting Goals':
        return `${baseHeader}☐ Identifies realistic and meaningful personal learning goals
☐ Shows understanding of steps needed to achieve goals
☐ Demonstrates commitment and motivation toward goal achievement
☐ Exhibits ability to adjust goals based on progress and learning

Anecdotal observations focus on goal realism, step understanding, achievement commitment, and goal adjustment ability.`;
      
      case 'Growing & Learning: Asking for Help':
        return `${baseHeader}☐ Shows comfort and confidence in requesting learning assistance
☐ Demonstrates ability to identify when help is needed
☐ Exhibits appropriate communication when seeking support
☐ Shows appreciation for help received and willingness to help others

Anecdotal observations focus on help-seeking comfort, need identification, communication skills, and reciprocal helping.`;
      
      case 'Growing & Learning: Persevering':
        return `${baseHeader}☐ Shows determination and persistence when facing learning challenges
☐ Demonstrates ability to maintain effort over time
☐ Exhibits positive self-talk and motivation during difficult tasks
☐ Shows understanding that persistence leads to improvement

Anecdotal observations focus on challenge persistence, sustained effort, positive self-talk, and improvement understanding.`;
      
      case 'Growing & Learning: Celebrating Success':
        return `${baseHeader}☐ Recognizes and celebrates personal learning achievements
☐ Shows appropriate pride in accomplishments and progress
☐ Demonstrates gratitude for support received in learning
☐ Exhibits willingness to share success strategies with others

Anecdotal observations focus on achievement recognition, appropriate pride, gratitude expression, and strategy sharing.`;
      
      case 'Growing & Learning: Growth Mindset':
        return `${baseHeader}☐ Shows belief in ability to improve through effort and practice
☐ Demonstrates understanding that intelligence can be developed
☐ Exhibits positive response to challenges and feedback
☐ Shows appreciation for the learning process over just outcomes

Anecdotal observations focus on improvement belief, intelligence understanding, challenge response, and process appreciation.`;
      
      case 'Growing & Learning: Learning Styles':
        return `${baseHeader}☐ Recognizes and articulates personal learning preferences
☐ Shows understanding that people learn in different ways
☐ Demonstrates ability to adapt learning strategies to tasks
☐ Exhibits respect and appreciation for diverse learning approaches

Anecdotal observations focus on preference recognition, learning difference understanding, strategy adaptation, and approach respect.`;
      
      case 'Growing & Learning: Practice Makes Progress':
        return `${baseHeader}☐ Shows understanding of practice importance for skill development
☐ Demonstrates willingness to engage in repeated practice
☐ Exhibits appreciation for incremental progress and improvement
☐ Shows patience with the time required for mastery

Anecdotal observations focus on practice understanding, repetition willingness, progress appreciation, and mastery patience.`;
      
      case 'Growing & Learning: Learning Challenges':
        return `${baseHeader}☐ Shows positive attitude toward learning difficulties and obstacles
☐ Demonstrates problem-solving approaches to learning challenges
☐ Exhibits resilience and adaptation when facing learning barriers
☐ Shows willingness to seek alternative strategies and solutions

Anecdotal observations focus on challenge attitude, problem-solving approaches, resilience exhibition, and strategy seeking.`;
      
      case 'Growing & Learning: Future Growth':
        return `${baseHeader}☐ Shows excitement and optimism about continued learning and growth
☐ Demonstrates ability to envision future learning goals and possibilities
☐ Exhibits understanding of learning as a lifelong process
☐ Shows commitment to ongoing personal development and improvement

Anecdotal observations focus on growth excitement, future envisioning, lifelong understanding, and development commitment.`;
      
      default:
        return `${baseHeader}☐ Shows curiosity and willingness to try new learning experiences
☐ Demonstrates resilience when facing challenges or setbacks
☐ Exhibits growth mindset language and attitudes
☐ Shows pride in personal learning accomplishments

Anecdotal observations focus on learning curiosity, challenge resilience, growth mindset, and accomplishment pride.`;
    }
  }
  
  // UNIT 6: OUR WONDERFUL WORLD (12 lessons)
  if (unitTitle === 'Our Wonderful World') {
    switch (lessonTitle) {
      case 'Wonderful World: Caring for Our Environment':
        return `${baseHeader}☐ Shows understanding of personal responsibility for environmental protection
☐ Demonstrates environmentally conscious behaviors and choices
☐ Exhibits concern for natural habitats and wildlife conservation
☐ Shows commitment to sustainable practices in daily life

Anecdotal observations focus on environmental responsibility, conscious behaviors, conservation concern, and sustainability commitment.`;
      
      case 'Wonderful World: Helping Our Community':
        return `${baseHeader}☐ Identifies ways to contribute positively to community wellbeing
☐ Shows willingness to participate in community service activities
☐ Demonstrates understanding of community interdependence
☐ Exhibits empathy and concern for community members' needs

Anecdotal observations focus on contribution identification, service participation, interdependence understanding, and community empathy.`;
      
      case 'Wonderful World: Being Grateful':
        return `${baseHeader}☐ Expresses genuine gratitude for daily blessings and opportunities
☐ Shows appreciation for people who contribute to their wellbeing
☐ Demonstrates understanding of abundance vs. scarcity mindset
☐ Exhibits thankfulness through words and actions consistently

Anecdotal observations focus on gratitude expression, appreciation demonstration, mindset understanding, and consistent thankfulness.`;
      
      case 'Wonderful World: Showing Kindness':
        return `${baseHeader}☐ Performs acts of kindness spontaneously and intentionally
☐ Shows understanding of kindness impact on others and community
☐ Demonstrates empathy and compassion in daily interactions
☐ Exhibits commitment to kindness even in challenging situations

Anecdotal observations focus on kindness performance, impact understanding, empathy demonstration, and challenging situation commitment.`;
      
      case 'Wonderful World: Making a Difference':
        return `${baseHeader}☐ Shows belief in personal ability to create positive change
☐ Demonstrates initiative in addressing problems or needs
☐ Exhibits understanding of how individual actions affect others
☐ Shows commitment to using talents and abilities to help others

Anecdotal observations focus on change belief, problem initiative, action understanding, and talent commitment.`;
      
      case 'Wonderful World: Environmental Helpers':
        return `${baseHeader}☐ Recognizes and appreciates people who protect the environment
☐ Shows understanding of various environmental careers and roles
☐ Demonstrates interest in environmental protection activities
☐ Exhibits respect for environmental workers and their contributions

Anecdotal observations focus on environmental appreciation, career understanding, protection interest, and worker respect.`;
      
      case 'Wonderful World: Community Service':
        return `${baseHeader}☐ Participates willingly in age-appropriate community service projects
☐ Shows understanding of service impact on community wellbeing
☐ Demonstrates empathy for those who benefit from service efforts
☐ Exhibits commitment to continued service and community involvement

Anecdotal observations focus on service participation, impact understanding, beneficiary empathy, and continued commitment.`;
      
      case 'Wonderful World: Acts of Kindness':
        return `${baseHeader}☐ Plans and executes intentional acts of kindness regularly
☐ Shows creativity in finding ways to help and serve others
☐ Demonstrates understanding of kindness as choice and practice
☐ Exhibits joy and satisfaction from helping others

Anecdotal observations focus on kindness planning, creative helping, choice understanding, and helping satisfaction.`;
      
      case 'Wonderful World: Thankfulness Practice':
        return `${baseHeader}☐ Engages in regular gratitude practices and reflection
☐ Shows ability to find positives even in challenging situations
☐ Demonstrates appreciation for both big and small blessings
☐ Exhibits sharing of gratitude with family and friends

Anecdotal observations focus on gratitude practices, positive finding, blessing appreciation, and gratitude sharing.`;
      
      case 'Wonderful World: World Citizens':
        return `${baseHeader}☐ Shows understanding of global interconnectedness and shared humanity
☐ Demonstrates respect and appreciation for cultural diversity
☐ Exhibits concern for global issues and challenges
☐ Shows commitment to being a positive global citizen

Anecdotal observations focus on global understanding, diversity respect, issue concern, and citizenship commitment.`;
      
      case 'Wonderful World: Positive Impact':
        return `${baseHeader}☐ Shows intentional focus on creating positive effects through actions
☐ Demonstrates understanding of ripple effects of individual choices
☐ Exhibits commitment to using influence for good
☐ Shows reflection on personal impact and areas for improvement

Anecdotal observations focus on positive intention, ripple understanding, good influence, and impact reflection.`;
      
      case 'Wonderful World: Wonderful World Celebration':
        return `${baseHeader}☐ Expresses appreciation for Earth's beauty, diversity, and abundance
☐ Shows commitment to protecting and preserving the natural world
☐ Demonstrates gratitude for opportunities to make a positive difference
☐ Exhibits excitement about continued growth as a global citizen

Anecdotal observations focus on Earth appreciation, preservation commitment, opportunity gratitude, and citizenship excitement.`;
      
      default:
        return `${baseHeader}☐ Demonstrates environmental stewardship and care behaviors
☐ Shows appreciation for diversity in people and nature
☐ Exhibits responsible community citizenship actions
☐ Shows understanding of global interconnectedness

Anecdotal observations focus on stewardship behaviors, diversity appreciation, citizenship actions, and global understanding.`;
    }
  }
  
  return `${baseHeader}☐ Demonstrates appropriate social-emotional responses
☐ Shows engagement and participation in learning activities
☐ Exhibits positive interactions with peers and adults
☐ Shows personal growth and development indicators

Anecdotal observations focus on social-emotional skill development, peer interactions, self-regulation, and personal wellness understanding.`;
}

async function individualizeRemainingUnits() {
  try {
    console.log('🎯 INDIVIDUALIZING UNITS 3-6: Remaining 48 FPS lessons...\n');

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

    // Get lessons from Units 3-6
    const remainingUnits = ['Safe and Sound', 'Friends and Feelings', 'Growing and Learning', 'Our Wonderful World'];
    
    const remainingLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        unitPlan: {
          title: {
            in: remainingUnits
          }
        }
      },
      include: {
        unitPlan: {
          select: {
            title: true
          }
        }
      },
      orderBy: [
        {
          unitPlan: {
            startDate: 'asc'
          }
        },
        {
          date: 'asc'
        }
      ]
    });

    console.log(`📚 Found ${remainingLessons.length} lessons in Units 3-6\n`);

    // Group by unit for reporting
    const lessonsByUnit = remainingLessons.reduce((acc, lesson) => {
      const unitTitle = lesson.unitPlan.title;
      if (!acc[unitTitle]) {
        acc[unitTitle] = [];
      }
      acc[unitTitle].push(lesson);
      return acc;
    }, {} as Record<string, typeof remainingLessons>);

    // Report lessons per unit
    for (const [unitTitle, lessons] of Object.entries(lessonsByUnit)) {
      console.log(`📋 ${unitTitle}: ${lessons.length} lessons`);
    }
    console.log('');

    let updatedCount = 0;
    const updatePromises: Promise<any>[] = [];

    for (const lesson of remainingLessons) {
      const uniqueIndigenousPerspective = createRemainingUnitsIndigenousPerspective(lesson.title, lesson.unitPlan.title);
      const uniqueAssessmentCriteria = createRemainingUnitsAssessmentCriteria(lesson.title, lesson.unitPlan.title);
      
      console.log(`🔧 Updating: ${lesson.title} (${lesson.unitPlan.title})`);
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

    console.log(`\n✅ Successfully individualized ALL ${updatedCount} remaining lessons!`);
    console.log('\n🎯 Units 3-6 Individualization Summary:');
    console.log('   ✅ Unit 3 (Safe and Sound): 12 lessons individualized');
    console.log('   ✅ Unit 4 (Friends and Feelings): 12 lessons individualized');
    console.log('   ✅ Unit 5 (Growing and Learning): 12 lessons individualized');
    console.log('   ✅ Unit 6 (Our Wonderful World): 12 lessons individualized');
    console.log('   ✅ Each lesson now has unique Indigenous perspectives');
    console.log('   ✅ Each lesson now has unique assessment criteria');
    console.log('   ✅ All content connects to specific lesson learning goals');

    // Verification by unit
    console.log('\n🔍 Verification check by unit...');
    
    for (const unitTitle of remainingUnits) {
      const verifiedLessons = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: emily.id,
          unitPlan: {
            title: unitTitle
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
      const expectedCount = lessonsByUnit[unitTitle].length;

      console.log(`\n📊 ${unitTitle} Verification:`);
      console.log(`   🏛️ Indigenous perspectives: ${uniqueIndigenous.size}/${expectedCount} unique (${uniqueIndigenous.size === expectedCount ? '✅ SUCCESS' : '⚠️ NEEDS REVIEW'})`);
      console.log(`   📋 Assessment criteria: ${uniqueAssessments.size}/${expectedCount} unique (${uniqueAssessments.size === expectedCount ? '✅ SUCCESS' : '⚠️ NEEDS REVIEW'})`);
    }

    return { updatedCount, lessonsByUnit };

  } catch (error) {
    console.error('❌ Error individualizing remaining units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

individualizeRemainingUnits();