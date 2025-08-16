/**
 * PERFECT GRADE 1 FRENCH IMMERSION LESSON GENERATOR
 * Unit: "Ma famille et moi" (My Family and Me)
 * 
 * Creates 12 ETFO-compliant lessons covering family vocabulary and Mi'kmaq family traditions
 * Each lesson: 45 minutes with proper structure and authentic Indigenous perspectives
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LessonData {
  title: string;
  date: Date;
  topic: string;
  vocabularyTerms: { term: string; definition: string }[];
  indigenousConnection: string;
  specificMindsOn: string;
  specificAction: string;
  specificConsolidation: string;
  materials: string;
  learningGoals: string;
  successCriteria: string;
}

// 12 Perfect Lessons for "Ma famille et moi"
const lessons: LessonData[] = [
  // WEEK 1: Immediate Family Foundation
  {
    title: "Lesson 1: Ma famille immédiate (My Immediate Family)",
    date: new Date('2025-10-06'),
    topic: "identifying immediate family members and understanding family connections",
    vocabularyTerms: [
      { term: "famille", definition: "family - people who love and care for us" },
      { term: "maman", definition: "mommy/mama - our mother who loves us" }
    ],
    indigenousConnection: "In Mi'kmaq tradition, family extends far beyond the home to include grandparents, aunts, uncles, and community elders who all play important roles in raising children. The clan system shows that everyone is connected like branches of a great tree. We honor this teaching by recognizing that our classroom family includes everyone who cares for our learning and growth, just like our home families include many loving people.",
    specificMindsOn: `(8 minutes)
☐ Welcome students with "Bonjour ma famille scolaire!" (Hello my school family!)
☐ Show family photo and point to "maman" - share family connection
☐ Connect Mi'kmaq teaching about extended family tree
☐ Practice "maman" with loving gesture (hand to heart)
☐ Ask: "Who is in your famille?" Allow all language responses`,
    specificAction: `(27 minutes)
Part 1 - Family Identification (10 minutes):
☐ Show diverse family photos including different family structures
☐ Point to mothers in photos, practice saying "maman"
☐ Students draw quick sketch of their own "famille"
☐ Practice: "Voici ma famille" (Here is my family)

Part 2 - Family Tree Beginning (12 minutes):
☐ Create simple classroom family tree on large paper
☐ Add student names as "leaves" on our school family tree
☐ Connect to Mi'kmaq teaching about interconnected family branches
☐ Students add their "maman" to personal family drawing

Part 3 - Family Sharing Circle (5 minutes):
☐ Sit in family circle with talking piece
☐ Each student says "maman" and shares one thing mama does
☐ Celebrate diversity in family structures respectfully`,
    specificConsolidation: `(10 minutes)
☐ Admire our growing classroom family tree
☐ Practice "Ma famille" and "maman" with warm voices
☐ Share gratitude for our school famille connection
☐ Plan to tell families about new French words
☐ Preview: "Tomorrow we meet papas and dads!"`,
    materials: `• Diverse family photos representing different structures • Large paper for classroom family tree
• Drawing paper and crayons • Talking piece for sharing circle • Mi'kmaq family stories or photos
• Chart paper for vocabulary • Heart-shaped cutouts for family tree • Glue sticks
• Camera for family tree documentation • Soft music for drawing time`,
    learningGoals: "Students will identify family members using French vocabulary while understanding that families come in many forms and all are valued and celebrated.",
    successCriteria: `☐ I can say "famille" when talking about people who love me
☐ I can say "maman" and point to my mother figure
☐ I can draw my family with love and pride
☐ I can listen respectfully when others share about their families`
  },

  {
    title: "Lesson 2: Mon papa/Mon père (My Dad/My Father)",
    date: new Date('2025-10-07'),
    topic: "learning father vocabulary and celebrating father figures in our lives",
    vocabularyTerms: [
      { term: "papa", definition: "daddy/papa - our father who cares for us" },
      { term: "père", definition: "father - formal word for our dad" }
    ],
    indigenousConnection: "In Mi'kmaq culture, fathers and father figures teach children about courage, protection, and connection to the land. Traditional fathers shared stories around the fire, taught hunting and fishing skills, and modeled respect for all living things. Today's fathers continue this tradition of guidance and protection. We honor all father figures including dads, grandfathers, uncles, and community men who care for children with wisdom and love.",
    specificMindsOn: `(8 minutes)
☐ Show images of fathers in traditional and modern roles
☐ Connect to Mi'kmaq teaching about fathers as protectors and teachers
☐ Practice "papa" with strong, caring voice
☐ Introduce "père" as respectful formal word
☐ Share: "Father figures teach us and keep us safe"`,
    specificAction: `(27 minutes)
Part 1 - Father Figure Celebration (10 minutes):
☐ Students share about their papa, père, grandfather, or father figure
☐ Practice both "papa" (casual) and "père" (formal) pronunciation
☐ Discuss different father roles: biological dads, stepdads, grandfathers
☐ Honor single-parent families and different family structures

Part 2 - Father Appreciation Cards (12 minutes):
☐ Create cards with "Mon papa" or "Mon père" 
☐ Draw pictures of activities they do with father figures
☐ Add Mi'kmaq-inspired border designs
☐ Practice writing "papa" and "père" carefully

Part 3 - Father Stories Circle (5 minutes):
☐ Share one special thing their father figure teaches them
☐ Practice: "Mon papa/père..." (My dad/father...)
☐ Celebrate diverse father relationships`,
    specificConsolidation: `(10 minutes)
☐ Display father appreciation cards with pride
☐ Practice both "papa" and "père" with appropriate tone
☐ Plan to share cards with father figures at home
☐ Thank all father figures for their love and teaching
☐ Preview: "Tomorrow we learn about brothers and sisters!"`,
    materials: `• Father figure photos showing diverse relationships • Card-making materials (cardstock, markers)
• Mi'kmaq pattern examples for borders • Family structure discussion visuals
• Chart paper for father vocabulary • Glue and scissors • Stickers for decoration
• Camera for card documentation • Thank you note template`,
    learningGoals: "Students will use appropriate French vocabulary for father figures while appreciating the diverse and important roles that father figures play in families and communities.",
    successCriteria: `☐ I can say "papa" in casual family situations
☐ I can say "père" in more formal situations
☐ I can show appreciation for father figures in my life
☐ I can respect different types of father relationships`
  },

  {
    title: "Lesson 3: Mes frères et sœurs (My Brothers and Sisters)",
    date: new Date('2025-10-08'),
    topic: "learning sibling vocabulary and understanding brother/sister relationships",
    vocabularyTerms: [
      { term: "frère", definition: "brother - a boy in our family" },
      { term: "sœur", definition: "sister - a girl in our family" }
    ],
    indigenousConnection: "Mi'kmaq brothers and sisters traditionally learned together and supported each other throughout life. Older siblings helped teach younger ones about traditions, hunting, gathering, and spiritual practices. The bond between siblings was considered sacred - they were companions for life's journey. Even today, Mi'kmaq families emphasize that brothers and sisters are gifts to each other, meant to help, protect, and learn together.",
    specificMindsOn: `(8 minutes)
☐ Share Mi'kmaq story about brother and sister working together
☐ Practice "frère" (brother) and "sœur" (sister) with sibling gestures
☐ Discuss: "How do brothers and sisters help each other?"
☐ Honor only children as important family members too
☐ Connect classroom friendships to sibling-like bonds`,
    specificAction: `(27 minutes)
Part 1 - Sibling Exploration (10 minutes):
☐ Count siblings: "J'ai un frère" or "J'ai une sœur"
☐ Discuss age relationships: older/younger siblings
☐ Practice pronunciation with rhythm and clapping
☐ Include chosen family, step-siblings, and cousins

Part 2 - Sibling Activity Station (12 minutes):
☐ Create sibling puppets with "frère" and "sœur" labels
☐ Act out helpful sibling scenarios with puppets
☐ Draw family portrait including all siblings
☐ Practice asking: "As-tu un frère ou une sœur?"

Part 3 - Classroom Siblings (5 minutes):
☐ Partner with classroom "frère" or "sœur" for activities
☐ Practice helping each other like good siblings
☐ Share appreciation for classroom family bonds`,
    specificConsolidation: `(10 minutes)
☐ Demonstrate sibling puppet conversations using new vocabulary
☐ Practice: "Mon frère" and "Ma sœur" with affection
☐ Share one way siblings or friends help each other
☐ Plan to teach family members new French words
☐ Preview: "Tomorrow we meet grandparents!"`,
    materials: `• Sibling puppet-making materials (socks, buttons, yarn) • Family counting chart
• Mi'kmaq sibling story book or pictures • Drawing paper for family portraits
• Markers and crayons • Number cards for counting siblings
• Camera for puppet show documentation • Chart paper for vocabulary`,
    learningGoals: "Students will use French sibling vocabulary correctly while understanding the special relationships between brothers and sisters in families and communities.",
    successCriteria: `☐ I can say "frère" when talking about brothers
☐ I can say "sœur" when talking about sisters  
☐ I can count my siblings in French
☐ I can show kindness like a good brother or sister`
  },

  // WEEK 2: Extended Family and Elders
  {
    title: "Lesson 4: Mes grands-parents (My Grandparents)",
    date: new Date('2025-10-09'),
    topic: "honoring grandparents and understanding their special role in families",
    vocabularyTerms: [
      { term: "grand-maman", definition: "grandmother - our mother's or father's mother" },
      { term: "grand-papa", definition: "grandfather - our mother's or father's father" }
    ],
    indigenousConnection: "In Mi'kmaq tradition, elders and grandparents are the most honored members of the community. They are the knowledge keepers who carry forward the stories, teachings, and wisdom of generations. Grandparents traditionally raised grandchildren while parents worked, sharing cultural knowledge through storytelling, crafts, and spiritual teachings. Their wisdom guides all family decisions, and their love provides the foundation for strong family bonds.",
    specificMindsOn: `(8 minutes)
☐ Show respectful images of Mi'kmaq elders sharing traditional knowledge
☐ Practice "grand-maman" and "grand-papa" with reverent tone
☐ Share: "Grandparents are our family's wisdom keepers"
☐ Connect to students' own grandparent relationships
☐ Honor elders who may have passed with loving memory`,
    specificAction: `(27 minutes)
Part 1 - Grandparent Appreciation (10 minutes):
☐ Share photos or drawings of grandparents (all types)
☐ Practice respectful greetings: "Bonjour grand-maman!"
☐ Discuss special things grandparents teach and share
☐ Include step-grandparents, great-grandparents, elder friends

Part 2 - Wisdom Keeper Project (12 minutes):
☐ Create "Wisdom Books" dedicated to grandparents
☐ Draw pictures of activities with grand-maman and grand-papa
☐ Add traditional patterns inspired by Mi'kmaq beadwork
☐ Practice writing grandparent names with French vocabulary

Part 3 - Elder Honoring Circle (5 minutes):
☐ Share one special thing learned from grandparents or elders
☐ Practice: "Ma grand-maman dit..." (My grandmother says...)
☐ Send gratitude to all elders in our community`,
    specificConsolidation: `(10 minutes)
☐ Display wisdom books with honor and respect
☐ Practice grandparent vocabulary with loving voices
☐ Plan to share French words with grandparents
☐ Celebrate the wisdom elders bring to families
☐ Preview: "Tomorrow we explore who lives with us!"`,
    materials: `• Elder wisdom photos and stories • Wisdom book templates and binding materials
• Traditional pattern examples for decoration • Photo frames for grandparent pictures
• Chart paper for elder vocabulary • Respect and gratitude discussion cards
• Camera for wisdom book documentation • Thank you card templates`,
    learningGoals: "Students will use French grandparent vocabulary respectfully while understanding and honoring the important role elders play in families and communities.",
    successCriteria: `☐ I can say "grand-maman" with respect and love
☐ I can say "grand-papa" with respect and love
☐ I can share wisdom I've learned from elders
☐ I can show honor to grandparents and elder community members`
  },

  {
    title: "Lesson 5: Qui habite chez moi? (Who Lives at My House?)",
    date: new Date('2025-10-10'),
    topic: "identifying household members and understanding diverse living arrangements",
    vocabularyTerms: [
      { term: "habite", definition: "lives - stays and has a home with us" },
      { term: "chez moi", definition: "at my house - in my home where I live" }
    ],
    indigenousConnection: "Traditional Mi'kmaq households often included multiple generations and extended family members living together in harmony. Children might live with grandparents, aunts, uncles, and cousins, creating rich learning environments where everyone contributed to raising the children. This teaching shows that homes are strengthened by having many loving adults and that different family arrangements all provide love, support, and belonging.",
    specificMindsOn: `(8 minutes)
☐ Draw simple house outline on board, discuss "chez moi"
☐ Connect to Mi'kmaq traditional multi-generational homes
☐ Practice "habite" with gesture of home and belonging
☐ Share: "Many types of families live together happily"
☐ Honor all living situations with respect and celebration`,
    specificAction: `(27 minutes)
Part 1 - Household Survey (10 minutes):
☐ Students draw their house and people who "habite chez moi"
☐ Practice sentence: "Mon [family member] habite chez moi"
☐ Include pets, chosen family, temporary residents
☐ Celebrate diversity in household compositions

Part 2 - House Model Creation (12 minutes):
☐ Build simple house models from boxes or paper
☐ Add family member figures with French labels
☐ Practice conversations: "Qui habite chez toi?" (Who lives at your house?)
☐ Role-play welcoming visitors to our homes

Part 3 - Home Appreciation (5 minutes):
☐ Share favorite thing about "chez moi"
☐ Practice gratitude for our homes and families
☐ Connect all homes as places of love and safety`,
    specificConsolidation: `(10 minutes)
☐ Present house models and practice "habite chez moi" sentences
☐ Celebrate the diversity of beautiful family arrangements
☐ Plan to count family members at home using French
☐ Share appreciation for everyone who makes houses into homes
☐ Preview: "Next week we learn about family activities!"`,
    materials: `• House-building materials (boxes, paper, scissors) • Family figure cutouts or drawings
• Mi'kmaq traditional home images for comparison • Chart paper for household vocabulary
• Glue and tape for house construction • Markers for labeling family members
• Camera for house model documentation • Home appreciation discussion cards`,
    learningGoals: "Students will describe household members using French vocabulary while appreciating the diversity of family living arrangements and recognizing all homes as places of love and belonging.",
    successCriteria: `☐ I can say "habite" when talking about who lives somewhere
☐ I can say "chez moi" when talking about my home
☐ I can name family members who live in my house
☐ I can respect and celebrate different family living arrangements`
  },

  {
    title: "Lesson 6: Les activités familiales (Family Activities)",
    date: new Date('2025-10-13'),
    topic: "describing activities families do together and building family connection vocabulary",
    vocabularyTerms: [
      { term: "jouer", definition: "play - have fun together with games or activities" },
      { term: "ensemble", definition: "together - doing things as a family unit" }
    ],
    indigenousConnection: "Mi'kmaq families traditionally spent time together through seasonal activities like fishing, berry picking, storytelling, and celebrating seasonal ceremonies. Children learned life skills while having fun with their families. These shared activities strengthened family bonds and passed down cultural knowledge. Today's families continue this tradition by creating memories through shared activities that bring joy and connection.",
    specificMindsOn: `(8 minutes)
☐ Show images of families enjoying activities together
☐ Connect to Mi'kmaq seasonal family activities and learning
☐ Practice "jouer ensemble" with playful, connected gestures
☐ Ask: "What does your family like to do ensemble?"
☐ Share excitement about family fun and togetherness`,
    specificAction: `(27 minutes)
Part 1 - Activity Charades (10 minutes):
☐ Act out family activities: cooking, reading, playing games
☐ Practice "Ma famille aime jouer..." (My family likes to play...)
☐ Guess activities and say them in French when possible
☐ Include indoor and outdoor family activities

Part 2 - Family Activity Book (12 minutes):
☐ Create illustrated books showing family activities
☐ Draw families doing activities "ensemble"
☐ Add simple French labels and sentences
☐ Include traditional and modern family activities

Part 3 - Activity Planning (5 minutes):
☐ Plan a special activity to suggest to family
☐ Practice: "Nous pouvons jouer ensemble" (We can play together)
☐ Share excitement about family time`,
    specificConsolidation: `(10 minutes)
☐ Share favorite family activity from their books
☐ Practice "jouer ensemble" while demonstrating togetherness
☐ Plan to suggest new family activities at home
☐ Celebrate the joy families create when they spend time together
☐ Preview: "Tomorrow we learn about family celebrations!"`,
    materials: `• Family activity picture cards for charades • Book-making materials (paper, stapler)
• Family activity photos representing diverse cultures • Markers and crayons for illustrations
• Chart paper for activity vocabulary • Camera for activity book documentation
• Activity planning templates • Mi'kmaq traditional activity images`,
    learningGoals: "Students will describe family activities using French vocabulary while understanding the importance of spending quality time together as a family unit.",
    successCriteria: `☐ I can say "jouer" when talking about family play time
☐ I can say "ensemble" when describing family togetherness
☐ I can describe activities my family does together
☐ I can suggest fun activities for families to do`
  },

  // WEEK 3: Family Roles and Cultural Connections
  {
    title: "Lesson 7: Les responsabilités familiales (Family Responsibilities)",
    date: new Date('2025-10-14'),
    topic: "understanding how family members help each other and contribute to family life",
    vocabularyTerms: [
      { term: "aider", definition: "help - support family members with kindness" },
      { term: "travail", definition: "work/job - important tasks that help the family" }
    ],
    indigenousConnection: "In Mi'kmaq families, everyone from the youngest child to the eldest grandparent has important roles that contribute to family wellbeing. Children traditionally helped with age-appropriate tasks like gathering berries, carrying water, or watching younger siblings. This teaching shows that families work best when everyone contributes their unique gifts and abilities. Each person's help, no matter how small, strengthens the whole family.",
    specificMindsOn: `(8 minutes)
☐ Share story of Mi'kmaq children contributing to family life
☐ Practice "aider" with helpful gesture (hands reaching out)
☐ Discuss "travail" as important family contributions
☐ Ask: "How do you aider your famille?"
☐ Connect helping at home to helping at school`,
    specificAction: `(27 minutes)
Part 1 - Family Helper Exploration (10 minutes):
☐ Brainstorm ways family members help each other
☐ Practice: "Je peux aider avec..." (I can help with...)
☐ Sort tasks by family member and age appropriateness
☐ Celebrate all contributions as valuable "travail"

Part 2 - Helper Badge Creation (12 minutes):
☐ Design family helper badges for different tasks
☐ Include badges for children's contributions
☐ Add Mi'kmaq-inspired symbols of cooperation
☐ Practice describing their helper roles

Part 3 - Family Helper Ceremony (5 minutes):
☐ Present badges in respectful ceremony
☐ Commit to being good family helpers
☐ Practice gratitude for family teamwork`,
    specificConsolidation: `(10 minutes)
☐ Wear helper badges with pride and responsibility
☐ Practice "aider ma famille" with commitment
☐ Plan specific ways to help at home this week
☐ Thank families for including children in family travail
☐ Preview: "Tomorrow we explore family celebrations!"`,
    materials: `• Helper badge materials (cardstock, ribbon, markers) • Family responsibility chart template
• Mi'kmaq cooperation symbols and stories • Laminating materials for badges
• Chart paper for helper vocabulary • Camera for badge ceremony documentation
• Family task picture cards • Thank you notes for families`,
    learningGoals: "Students will understand family responsibilities using French vocabulary while recognizing that everyone in a family can contribute meaningful help according to their abilities.",
    successCriteria: `☐ I can say "aider" when talking about helping my family
☐ I can say "travail" when describing family tasks
☐ I can name ways I help my family
☐ I can appreciate how all family members contribute`
  },

  {
    title: "Lesson 8: Nos célébrations familiales (Our Family Celebrations)",
    date: new Date('2025-10-15'),
    topic: "exploring family traditions and celebrations that bring families together",
    vocabularyTerms: [
      { term: "célébration", definition: "celebration - special times when families gather with joy" },
      { term: "tradition", definition: "tradition - special customs families do year after year" }
    ],
    indigenousConnection: "Mi'kmaq families celebrate many seasonal ceremonies and life milestones that strengthen family bonds and connect them to their ancestors and the natural world. Traditional celebrations include naming ceremonies, coming-of-age ceremonies, harvest celebrations, and seasonal gatherings. These celebrations teach children about their identity, history, and place in the community while creating joyful memories with extended family.",
    specificMindsOn: `(8 minutes)
☐ Share images of diverse family celebrations and traditions
☐ Connect to Mi'kmaq seasonal celebrations and family gatherings
☐ Practice "célébration" and "tradition" with joyful expressions
☐ Ask: "What celebrations does your famille enjoy?"
☐ Honor all cultural and family traditions with respect`,
    specificAction: `(27 minutes)
Part 1 - Celebration Sharing (10 minutes):
☐ Students share family celebrations and traditions
☐ Practice: "Ma famille célèbre..." (My family celebrates...)
☐ Include birthdays, holidays, cultural celebrations, personal milestones
☐ Create celebration timeline throughout the year

Part 2 - Family Tradition Art (12 minutes):
☐ Create artwork showing family celebrations
☐ Include traditional foods, decorations, activities
☐ Add French celebration vocabulary labels
☐ Design celebration cards for upcoming family events

Part 3 - Celebration Gallery Walk (5 minutes):
☐ Display celebration artwork proudly
☐ Practice describing celebrations to classmates
☐ Appreciate diversity in family traditions`,
    specificConsolidation: `(10 minutes)
☐ Share favorite family célébration with enthusiasm
☐ Practice celebration vocabulary with joy and respect
☐ Plan to share French celebration words with families
☐ Celebrate the beauty of diverse family traditions
☐ Preview: "Tomorrow we learn about family love!"`,
    materials: `• Celebration photos representing diverse cultures • Art supplies for celebration drawings
• Family tradition discussion cards • Chart paper for celebration vocabulary
• Calendar for marking family celebrations • Multicultural celebration books
• Camera for celebration gallery documentation • Thank you cards for family traditions`,
    learningGoals: "Students will describe family celebrations using French vocabulary while appreciating the diversity and importance of family traditions in creating belonging and joy.",
    successCriteria: `☐ I can say "célébration" when talking about family special times
☐ I can say "tradition" when describing family customs
☐ I can share my family's celebrations respectfully
☐ I can appreciate other families' different celebrations`
  },

  {
    title: "Lesson 9: L'amour en famille (Love in Families)",
    date: new Date('2025-10-16'),
    topic: "understanding and expressing family love and emotional connections",
    vocabularyTerms: [
      { term: "amour", definition: "love - the caring feeling families have for each other" },
      { term: "câlin", definition: "hug - a way to show love with gentle touch" }
    ],
    indigenousConnection: "Mi'kmaq teachings emphasize that love is the foundation of all healthy relationships and that families are held together by unconditional love and care. Traditional child-rearing practices focused on patience, gentle guidance, and expressing love through actions, words, and presence. The teaching of love extends to all living things, showing children that love creates harmony in families, communities, and with nature.",
    specificMindsOn: `(8 minutes)
☐ Share gentle images of family love and affection
☐ Connect to Mi'kmaq teaching about love as life's foundation
☐ Practice "amour" with hand to heart gesture
☐ Discuss safe ways families show love: "câlin", kind words, help
☐ Create safe space for sharing about family love`,
    specificAction: `(27 minutes)
Part 1 - Love Expression Exploration (10 minutes):
☐ Brainstorm ways families show amour for each other
☐ Practice: "Ma famille montre l'amour..." (My family shows love...)
☐ Include verbal, physical, and action-based love expressions
☐ Honor different cultural ways of expressing family love

Part 2 - Love Coupon Creation (12 minutes):
☐ Create love coupons for family members
☐ Include offers for câlins, help, kind words, special time
☐ Decorate with hearts and Mi'kmaq-inspired love symbols
☐ Practice reading coupons aloud with loving voices

Part 3 - Family Love Circle (5 minutes):
☐ Share one way their family shows amour
☐ Practice giving appropriate classroom câlins (side hugs)
☐ Express gratitude for family love and care`,
    specificConsolidation: `(10 minutes)
☐ Present love coupons with genuine affection
☐ Practice "amour" and "câlin" with appropriate warmth
☐ Plan to give love coupons to family members
☐ Celebrate the amour that makes families strong and happy
☐ Preview: "Tomorrow we review all our family learning!"`,
    materials: `• Love coupon templates and decorating materials • Heart cutouts for love symbols
• Gentle family affection photos • Chart paper for love vocabulary
• Soft music for creating calm, loving atmosphere • Family love story books
• Camera for love coupon documentation • Thank you notes expressing appreciation`,
    learningGoals: "Students will express family love using appropriate French vocabulary while understanding healthy ways families show care and affection for each other.",
    successCriteria: `☐ I can say "amour" when talking about family love
☐ I can say "câlin" when describing appropriate family affection
☐ I can describe ways my family shows love
☐ I can express appreciation for my family's love and care`
  },

  // WEEK 4: Review, Celebration, and Assessment
  {
    title: "Lesson 10: Révision de ma famille (My Family Review)",
    date: new Date('2025-10-17'),
    topic: "reviewing and celebrating all family vocabulary and concepts learned",
    vocabularyTerms: [
      { term: "révision", definition: "review - looking back at everything we learned together" },
      { term: "apprendre", definition: "learn - gain new knowledge about our families" }
    ],
    indigenousConnection: "Mi'kmaq tradition includes regular gatherings where community members share stories, reflect on lessons learned, and prepare for the next phase of learning. These reflection circles help consolidate knowledge and strengthen community bonds. Our family learning review honors this tradition by celebrating the knowledge we've gained about families while preparing to share this learning with our own family members.",
    specificMindsOn: `(8 minutes)
☐ Create family learning circle with all vocabulary cards
☐ Connect to Mi'kmaq tradition of knowledge sharing circles
☐ Practice "révision" and "apprendre" with pride and accomplishment
☐ Share: "We have learned so much about familles!"
☐ Set intention to celebrate our family learning journey`,
    specificAction: `(27 minutes)
Part 1 - Family Vocabulary Review (10 minutes):
☐ Play family vocabulary games using all learned words
☐ Practice family member names with confidence
☐ Review family activities and celebration vocabulary
☐ Celebrate pronunciation improvements and confidence

Part 2 - Family Learning Stations (12 minutes):
☐ Station 1: Family member identification and role-play
☐ Station 2: Family activity charades and discussions
☐ Station 3: Family celebration and tradition sharing
☐ Station 4: Family love and care expression practice

Part 3 - Learning Gallery Creation (5 minutes):
☐ Display all family work created during the unit
☐ Practice explaining family learning to visitors
☐ Prepare for family sharing celebration`,
    specificConsolidation: `(10 minutes)
☐ Share favorite family learning memory from the unit
☐ Practice all family vocabulary in final review chant
☐ Thank each other for sharing family stories respectfully
☐ Plan to teach families the French words we've learned
☐ Preview: "Tomorrow we celebrate with our families!"`,
    materials: `• All family vocabulary cards from the unit • Learning station materials and props
• Family work gallery display boards • Review game materials
• Chart paper for vocabulary review • Camera for learning documentation
• Celebration preparation materials • Thank you cards for classmates`,
    learningGoals: "Students will demonstrate mastery of family vocabulary and concepts while reflecting on their learning growth and preparing to share knowledge with their families.",
    successCriteria: `☐ I can use most family vocabulary words correctly
☐ I can explain something important I learned about families
☐ I can share family learning with pride and confidence
☐ I can thank others for helping me learn about families`
  },

  {
    title: "Lesson 11: Célébration familiale (Family Celebration)",
    date: new Date('2025-10-20'),
    topic: "celebrating family learning achievements with family members present",
    vocabularyTerms: [
      { term: "fier", definition: "proud - feeling good about our family learning accomplishments" },
      { term: "partager", definition: "share - give our learning gifts to our families" }
    ],
    indigenousConnection: "Mi'kmaq communities celebrate learning achievements with family gatherings that honor both individual growth and family support. These celebrations recognize that learning happens best when families and communities work together. Everyone's contributions to the child's learning journey are acknowledged with gratitude and respect. Our family celebration honors this tradition by welcoming families to see and celebrate their children's French learning progress.",
    specificMindsOn: `(8 minutes)
☐ Welcome families to our family learning celebration
☐ Explain Mi'kmaq tradition of community learning celebrations
☐ Practice "Je suis fier" (I am proud) with confident posture
☐ Set celebration tone: joy, gratitude, family pride
☐ Introduce families to our French family vocabulary learning`,
    specificAction: `(27 minutes)
Part 1 - Family Vocabulary Demonstration (12 minutes):
☐ Students introduce family members using French vocabulary
☐ Demonstrate family conversations: "Voici ma maman", "J'aime ma famille"
☐ Show family activities and celebrations learned
☐ Present family appreciation projects to their families

Part 2 - Learning Showcase Performance (10 minutes):
☐ Perform family songs and chants together
☐ Demonstrate family helper roles and responsibilities
☐ Show family love expressions and gratitude
☐ Present family learning portfolios and artwork

Part 3 - Family Appreciation Exchange (5 minutes):
☐ Families share observations about student growth
☐ Give families vocabulary cards to practice at home
☐ Exchange gratitude for family support of French learning`,
    specificConsolidation: `(10 minutes)
☐ Students share what makes them "fier" of their family learning
☐ Families express pride in children's French progress
☐ Plan continued family vocabulary practice at home
☐ Exchange appreciation for successful family learning unit
☐ Preview: "Tomorrow we assess our family learning!"`,
    materials: `• Family celebration setup with chairs and display area • Family vocabulary demonstration props
• Student work displays and portfolios • Vocabulary cards for families to take home
• Light refreshments for family celebration • Camera for family celebration photos
• Thank you cards for family participation • Celebration decorations`,
    learningGoals: "Students will demonstrate their family vocabulary learning proudly to their families while celebrating the support families provide for French language learning.",
    successCriteria: `☐ I can demonstrate my family vocabulary learning to my family
☐ I can say "Je suis fier" about my French learning accomplishments
☐ I can help welcome families to our learning celebration
☐ I can express gratitude for my family's support`
  },

  {
    title: "Lesson 12: Évaluation de famille (Family Learning Assessment)",
    date: new Date('2025-10-21'),
    topic: "demonstrating family vocabulary learning through authentic play-based assessment",
    vocabularyTerms: [
      { term: "montrer", definition: "show - demonstrate the family knowledge we have gained" },
      { term: "savoir", definition: "know - all the family vocabulary and concepts we learned" }
    ],
    indigenousConnection: "Traditional Mi'kmaq assessment honored children's learning through observation during natural family and community activities. Elders watched children demonstrate knowledge through real-life interactions, storytelling, and practical applications. Knowledge was proven through authentic demonstration rather than testing. Our assessment celebrates this tradition by allowing students to show their family learning through meaningful activities and natural family conversations.",
    specificMindsOn: `(8 minutes)
☐ Explain assessment as opportunity to "montrer" family knowledge
☐ Connect to Mi'kmaq tradition of demonstrating learning naturally
☐ Practice "Je sais beaucoup sur les familles" (I know a lot about families)
☐ Set positive tone: assessment as celebration of family learning
☐ Review what family knowledge we will demonstrate`,
    specificAction: `(27 minutes)
Part 1 - Family Knowledge Assessment Stations (15 minutes):
☐ Station 1: Family member identification and conversation
☐ Station 2: Family activity and celebration discussions
☐ Station 3: Family role and responsibility demonstrations  
☐ Station 4: Family love and appreciation expressions

Part 2 - Family Learning Portfolio Completion (8 minutes):
☐ Students select best family work for final portfolios
☐ Practice explaining learning: "J'ai appris..." (I learned...)
☐ Organize family portfolio with pride and care
☐ Add final self-reflection about family learning

Part 3 - Family Learning Conferences (4 minutes):
☐ Individual conferences about family vocabulary growth
☐ Students share favorite family learning discoveries
☐ Set goals for continued family vocabulary use`,
    specificConsolidation: `(10 minutes)
☐ Celebrate successful family learning assessment completion
☐ Practice: "Je peux montrer ce que je sais sur les familles!"
☐ Admire completed family learning portfolios together
☐ Share pride in family vocabulary accomplishments
☐ Celebrate the completion of "Ma famille et moi" unit with joy!`,
    materials: `• Family assessment station materials and props • Portfolio completion supplies
• Family learning reflection templates • Assessment observation forms
• Celebration stickers for achievements • Camera for assessment documentation
• Comfortable conference spaces • Family learning artifacts for review
• Chart paper for goal setting • Final celebration music`,
    learningGoals: "Students will demonstrate comprehensive family vocabulary knowledge through authentic assessment while developing pride in their French learning accomplishments and family appreciation.",
    successCriteria: `☐ I can montrer my family vocabulary knowledge confidently
☐ I can explain what I savoir about families in French
☐ I can choose my best family work for my portfolio
☐ I can talk about my family learning growth with pride`
  }
];

async function createFamilleLesson(lessonData: LessonData, unitPlanId: string, userId: number) {
  return await prisma.eTFOLessonPlan.create({
    data: {
      title: lessonData.title,
      date: lessonData.date,
      duration: 45,
      subject: "Français langue première",
      grade: 1,
      language: "French",
      unitPlanId: unitPlanId,
      userId: userId,
      
      mindsOn: lessonData.specificMindsOn,
      action: lessonData.specificAction,
      consolidation: lessonData.specificConsolidation,
      
      learningGoals: lessonData.learningGoals,
      
      materials: {
        list: lessonData.materials,
        vocabulary: lessonData.vocabularyTerms.reduce((acc, term) => {
          acc[term.term] = term.definition;
          return acc;
        }, {} as Record<string, string>),
        successCriteria: lessonData.successCriteria
      },
      
      assessmentNotes: `Formative Assessment:
☐ Observation during minds on family discussion - note engagement and personal connections
☐ Anecdotal notes during action phase family activities - document vocabulary usage and family understanding
☐ Checklist for family vocabulary pronunciation and context - track correct usage and comfort level
☐ Student self-assessment during consolidation - encourage reflection on family learning

Success Criteria Observations:
☐ Demonstrates understanding of family concepts (meets/approaching/needs support)
☐ Uses French family vocabulary appropriately (meets/approaching/needs support)  
☐ Participates respectfully in family discussions (meets/approaching/needs support)
☐ Shows progress toward family learning goals (meets/approaching/needs support)`,
      
      differentiationStrategies: {
        forStruggling: "Provide visual family vocabulary supports with pictures, simplified family concept explanations, peer family buddies for sharing, hands-on family manipulatives, reduced task complexity for family discussions, extra processing time for family concepts, and frequent check-ins for family vocabulary understanding",
        forIEP: "Modified family expectations as outlined in individual education plan, assistive technology support for family vocabulary, alternative family demonstration methods, extended time allocations for family activities, modified assessment criteria for family learning, and dedicated one-on-one support during family discussions",
        forELL: "Visual family vocabulary cards with pictures and home language translations, bilingual family dictionaries, sentence frames for family practice (\"Ma famille...\", \"J'aime...\"), peer translation support for family concepts, gestures and demonstrations for family vocabulary, home language family connections, and culturally relevant family examples",
        forAdvanced: "Extension activities with deeper family vocabulary and complex family concepts, leadership roles in family group discussions, independent family research projects, creation of family teaching materials for peers, cross-curricular family connections to social studies and arts, and family mentoring opportunities for struggling learners"
      },
      
      indigenousPerspectives: lessonData.indigenousConnection,
      
      reflectionActivities: {
        teacherReflection: `• How effectively did students engage with family vocabulary and concepts today?
• Which students demonstrated strong progress in family learning and which need additional support?
• How can I adjust tomorrow's family lesson based on today's observations and outcomes?
• What family extension opportunities would challenge advanced learners appropriately?
• How well did the Indigenous family perspectives connect meaningfully to the learning goals?
• What aspects of family differentiation were most successful for diverse family backgrounds?
• How did students respond to sharing personal family information in French?`,
        crossCurricular: `• Language Arts: Family oral communication skills, family vocabulary development, family listening comprehension, family storytelling traditions
• Mathematics: Family counting practice, family member counting, family pattern identification through family traditions
• Arts: Family visual representation through drawings, family creative expression, family cultural art connections, family celebration artwork
• Social Studies: Family community building, family cultural awareness, family respect for diversity, family tradition exploration
• Science: Family observation skills, family natural world connections, family inquiry-based learning about family structures
• Health: Family social-emotional learning, family relationship building, family positive interactions, family appreciation and gratitude`
      }
    }
  });
}

async function main() {
  try {
    console.log('🚀 Starting Ma famille et moi lesson creation...');
    
    // Find Emily's user record
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily user not found. Please ensure user exists with email emmcisaac@gmail.com');
    }
    
    console.log(`✅ Found Emily (ID: ${emily.id})`);
    
    // Find the "Ma famille et moi" unit plan
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        title: 'Ma famille et moi',
        userId: emily.id
      }
    });
    
    if (!unitPlan) {
      throw new Error('Ma famille et moi unit plan not found for Emily');
    }
    
    console.log(`✅ Found unit plan "${unitPlan.title}" (ID: ${unitPlan.id})`);
    
    // Delete existing lessons for this unit (if any)
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unitPlan.id }
    });
    
    console.log('🗑️ Cleared existing lessons for unit');
    
    // Create all 12 perfect lessons
    console.log('📝 Creating 12 perfect ETFO-compliant family lessons...');
    
    let createdCount = 0;
    for (const lessonData of lessons) {
      await createFamilleLesson(lessonData, unitPlan.id, emily.id);
      createdCount++;
      console.log(`✅ Created lesson ${createdCount}/12: ${lessonData.title}`);
    }
    
    console.log(`\n🎉 SUCCESS! Created ${createdCount} perfect Grade 1 French Immersion family lessons`);
    console.log('\n📋 Lesson Summary:');
    console.log('• Duration: 45 minutes each (ETFO compliant)');
    console.log('• Structure: Minds On (8min) + Action (27min) + Consolidation (10min)');
    console.log('• Vocabulary: 2-3 French family terms per lesson (Grade 1 appropriate)');
    console.log('• Assessment: Observable with ☐ checkboxes');
    console.log('• Differentiation: JSON format with all 4 learner types');
    console.log('• Indigenous Perspectives: 100+ characters Mi\'kmaq family connections');
    console.log('• Materials: Comprehensive lists for each lesson');
    
    console.log('\n👨‍👩‍👧‍👦 October 2025 Family Learning Schedule:');
    console.log('Week 1 (Oct 6-9): Immediate family members - maman, papa, frère, sœur');
    console.log('Week 2 (Oct 10-13): Extended family and living arrangements - grands-parents, household members, family activities');
    console.log('Week 3 (Oct 14-16): Family roles and connections - responsibilities, celebrations, family love');
    console.log('Week 4 (Oct 17-21): Review, family celebration, and assessment');
    
    console.log('\n🎯 Learning Focus Areas:');
    console.log('• Family member vocabulary and identification');
    console.log('• Family activities and togetherness concepts');
    console.log('• Family roles, responsibilities, and contributions');
    console.log('• Family love, celebrations, and traditions');
    console.log('• Authentic Mi\'kmaq family perspectives and teachings');
    console.log('• Respect for diverse family structures and arrangements');
    
  } catch (error) {
    console.error('❌ Error creating Ma famille et moi lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script when run directly
main()
  .then(() => {
    console.log('\n✨ Ma famille et moi lessons created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });

export default main;