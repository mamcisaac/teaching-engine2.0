/**
 * PERFECT GRADE 1 FRENCH IMMERSION LESSON GENERATOR
 * Unit: "Les fêtes d'automne" (Autumn Celebrations)
 * 
 * Creates 12 ETFO-compliant lessons for October 2025
 * Each lesson: 45 minutes with proper structure and Mi'kmaq perspectives
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

// 12 Perfect Lessons for "Les fêtes d'automne"
const lessons: LessonData[] = [
  // WEEK 1: Autumn Changes and Harvest
  {
    title: "Lesson 1: L'automne arrive (Autumn Arrives)",
    date: new Date('2025-10-01'),
    topic: "recognizing autumn changes in nature and connecting to seasonal celebrations",
    vocabularyTerms: [
      { term: "automne", definition: "autumn/fall - the season when leaves change colors" },
      { term: "feuilles", definition: "leaves - the colorful parts of trees that fall down" }
    ],
    indigenousConnection: "Mi'kmaq traditional calendar recognizes autumn as Wikumkewiku's, the time of falling leaves and preparation for winter. This season brings important ceremonies of thanksgiving for the harvest and acknowledgment of nature's cycles. The changing colors represent the sacred teaching that all things have their time of transformation. We honor this wisdom by observing autumn's gifts with gratitude and respect.",
    specificMindsOn: `(8 minutes)
☐ Welcome students with autumn leaf collection display
☐ Share Mi'kmaq name "Wikumkewiku's" for this sacred season
☐ Practice "automne" while touching colorful leaves
☐ Ask: "What changes do you see outside our classroom?"
☐ Connect autumn changes to celebration preparation`,
    specificAction: `(27 minutes)
Part 1 - Autumn Discovery Walk (10 minutes):
☐ Explore school grounds for autumn signs
☐ Collect fallen "feuilles" of different colors
☐ Practice saying "automne" when finding seasonal changes
☐ Document discoveries with photos and sketches

Part 2 - Leaf Art Creation (12 minutes):
☐ Sort leaves by colors: red, yellow, orange, brown
☐ Create autumn collages with collected feuilles
☐ Practice color vocabulary while creating art
☐ Share discoveries about leaf shapes and textures

Part 3 - Autumn Observations (5 minutes):
☐ Record autumn changes in nature journals
☐ Practice: "En automne, je vois..." (In autumn, I see...)
☐ Plan daily autumn observations for the week`,
    specificConsolidation: `(10 minutes)
☐ Display leaf art in our autumn celebration corner
☐ Share favorite autumn discovery from today
☐ Practice "automne" and "feuilles" with actions
☐ Connect autumn changes to upcoming celebrations
☐ Preview: "Tomorrow we explore harvest traditions!"`,
    materials: `• Collection baskets for nature walk • Autumn leaf samples • Nature journals and pencils
• Glue sticks for leaf art • Chart paper for recording • Camera for documentation
• Magnifying glasses for leaf examination • Mi'kmaq seasonal calendar poster
• Autumn discovery checklist • Hand sanitizer • Tissues`,
    learningGoals: "Students will observe and describe autumn changes while learning vocabulary for seasonal transitions and connecting to Indigenous seasonal awareness.",
    successCriteria: `☐ I can say "automne" when talking about this season
☐ I can identify and collect feuilles outdoors
☐ I can describe one change I see in autumn
☐ I can show respect for nature during our exploration`
  },

  {
    title: "Lesson 2: La récolte traditionnelle (Traditional Harvest)",
    date: new Date('2025-10-02'),
    topic: "understanding harvest celebrations and gratitude for food abundance",
    vocabularyTerms: [
      { term: "récolte", definition: "harvest - gathering food that has grown" },
      { term: "merci", definition: "thank you - expressing gratitude for gifts received" }
    ],
    indigenousConnection: "Mi'kmaq harvest ceremonies honor the Three Sisters (corn, beans, squash) and all plants that sustain life. Traditional protocols include offering tobacco and expressing gratitude to the Creator for abundance. Harvest time is sacred, bringing communities together to share food and stories while preparing for winter. These ancient practices teach respect for all living beings that provide sustenance.",
    specificMindsOn: `(8 minutes)
☐ Display Three Sisters plants (corn, beans, squash) 
☐ Share Mi'kmaq harvest ceremony traditions
☐ Practice "récolte" while handling harvest vegetables
☐ Model saying "merci" with hands to heart gesture
☐ Connect harvest to our classroom gratitude practice`,
    specificAction: `(27 minutes)
Part 1 - Harvest Exploration (10 minutes):
☐ Examine real harvest vegetables with magnifying glasses
☐ Sort by types: roots, fruits, leaves, seeds
☐ Practice "récolte" when discussing each food type
☐ Connect vegetables to healthy eating habits

Part 2 - Gratitude Circle (12 minutes):
☐ Pass harvest corn cob as talking piece
☐ Students share foods they're grateful for
☐ Practice "Merci pour..." (Thank you for...)
☐ Create class gratitude harvest book

Part 3 - Harvest Celebration Prep (5 minutes):
☐ Plan classroom harvest feast for Friday
☐ Choose harvest foods to share safely
☐ Practice harvest blessing: "Merci pour la récolte"`,
    specificConsolidation: `(10 minutes)
☐ Practice gratitude gesture: hands to heart, "merci"
☐ Share one harvest food that makes us healthy
☐ Plan to thank families for providing food
☐ Connect harvest to upcoming Thanksgiving learning
☐ Preview: "Tomorrow we learn about potato harvest in PEI!"`,
    materials: `• Real harvest vegetables (corn, beans, squash, potatoes, apples) • Magnifying glasses
• Talking piece (decorative corn cob) • Gratitude journal pages • Art supplies
• Mi'kmaq Three Sisters poster • Harvest blessing cards • Camera for documentation
• Hand sanitizer • Wet wipes • Small baskets for sorting`,
    learningGoals: "Students will understand harvest traditions and express gratitude for food abundance while learning vocabulary for thanksgiving and cultural appreciation.",
    successCriteria: `☐ I can say "récolte" when talking about harvest
☐ I can express "merci" for food we eat
☐ I can name one harvest food I'm grateful for
☐ I can participate respectfully in gratitude circle`
  },

  {
    title: "Lesson 3: Les pommes de terre de l'Î.-P.-É. (PEI Potato Harvest)",
    date: new Date('2025-10-03'),
    topic: "celebrating PEI's famous potato harvest and local food connections",
    vocabularyTerms: [
      { term: "pommes de terre", definition: "potatoes - important food that grows underground in PEI" },
      { term: "île", definition: "island - land surrounded by water, like our PEI home" }
    ],
    indigenousConnection: "Before European contact, Mi'kmaq people cultivated Jerusalem artichokes and other root vegetables on Epekwitk (PEI). Traditional knowledge includes sustainable farming practices that respect the land and ensure abundance for future generations. The island's red soil holds special significance in Mi'kmaq teachings about the connection between land, food, and community wellbeing. Potato farming continues this tradition of nurturing the earth.",
    specificMindsOn: `(8 minutes)
☐ Display PEI red soil sample and fresh potatoes
☐ Share Mi'kmaq name "Epekwitk" for our island home
☐ Practice "pommes de terre" while holding potatoes
☐ Connect PEI farms to our local food system
☐ Show aerial photos of PEI potato fields`,
    specificAction: `(27 minutes)
Part 1 - Potato Investigation (10 minutes):
☐ Examine different potato varieties from PEI farms
☐ Feel soil texture and discuss growing conditions
☐ Practice "île" while looking at PEI map
☐ Learn about farm-to-table journey

Part 2 - Potato Printing Art (12 minutes):
☐ Cut potatoes into simple shapes for printing
☐ Create PEI island artwork using potato stamps
☐ Practice pronunciation while stamping
☐ Make thank you cards for local farmers

Part 3 - Farm Appreciation (5 minutes):
☐ Write simple messages to PEI potato farmers
☐ Practice: "Merci aux fermiers de notre île"
☐ Plan potato recipe sharing with families`,
    specificConsolidation: `(10 minutes)
☐ Display potato artwork celebrating our "île"
☐ Practice "pommes de terre" with proper pronunciation
☐ Share favorite way to eat potatoes from PEI
☐ Thank local farmers for their hard work
☐ Preview: "Tomorrow we explore Thanksgiving gratitude!"`,
    materials: `• Fresh PEI potatoes (various types) • PEI red soil sample • Potato cutting tools (teacher use)
• Washable paint for printing • Large paper for art • PEI map and farm photos
• Thank you card templates • Wet wipes • Paper towels • Camera for documentation
• Farm-to-table visual chart • Local farmer contact information`,
    learningGoals: "Students will appreciate local PEI agriculture while learning vocabulary for regional food production and developing connection to island community.",
    successCriteria: `☐ I can say "pommes de terre" when I see potatoes
☐ I can identify PEI as our "île" home
☐ I can explain how potatoes grow in our island soil
☐ I can thank farmers for growing our food`
  },

  {
    title: "Lesson 4: Action de grâce (Thanksgiving)",
    date: new Date('2025-10-06'),
    topic: "understanding Thanksgiving traditions and expressing gratitude for abundance",
    vocabularyTerms: [
      { term: "reconnaissance", definition: "gratitude - feeling thankful for good things" },
      { term: "famille", definition: "family - people who love and care for us" }
    ],
    indigenousConnection: "Mi'kmaq traditions include daily expressions of gratitude to the Creator for all gifts: food, water, shelter, family, and community. Traditional thanksgiving ceremonies happen throughout the year, not just in autumn. The practice of acknowledging all our relations extends gratitude to animals, plants, ancestors, and future generations. This comprehensive gratitude creates spiritual balance and community harmony.",
    specificMindsOn: `(8 minutes)
☐ Create gratitude circle with autumn decorations
☐ Share Mi'kmaq daily gratitude traditions
☐ Practice "reconnaissance" with hands to heart
☐ Model thanksgiving for "famille" and community
☐ Set intention for meaningful gratitude practice`,
    specificAction: `(27 minutes)
Part 1 - Gratitude Exploration (10 minutes):
☐ Brainstorm things we feel "reconnaissance" for
☐ Sort gratitude items: family, food, nature, friends
☐ Practice "Ma famille..." (My family...) expressions
☐ Create visual gratitude web on chart paper

Part 2 - Thanksgiving Cards (12 minutes):
☐ Design thank you cards for "famille" members
☐ Include Mi'kmaq-inspired gratitude symbols
☐ Write simple French gratitude messages
☐ Practice reading cards with proper pronunciation

Part 3 - Gratitude Feast Planning (5 minutes):
☐ Plan classroom thanksgiving feast sharing
☐ Practice thanksgiving blessing in French
☐ Assign special gratitude sharing roles`,
    specificConsolidation: `(10 minutes)
☐ Share one expression of "reconnaissance" for famille
☐ Practice thanksgiving blessing together
☐ Plan to share gratitude with families at home
☐ Connect gratitude to daily classroom practice
☐ Preview: "Tomorrow we explore Halloween safety!"`,
    materials: `• Autumn decorations for gratitude circle • Chart paper for gratitude web
• Thank you card materials • Mi'kmaq gratitude symbol examples • Markers and crayons
• Family photo examples • Gratitude journal pages • Camera for sharing moments
• Thanksgiving feast planning materials • Blessing cards in French`,
    learningGoals: "Students will understand Thanksgiving traditions and express gratitude for family and abundance while connecting to Indigenous practices of daily thanksgiving.",
    successCriteria: `☐ I can express "reconnaissance" for good things in my life
☐ I can talk about my "famille" with gratitude
☐ I can participate in thanksgiving blessing
☐ I can write simple gratitude messages in French`
  },

  // WEEK 2: Halloween Safety and Fun
  {
    title: "Lesson 5: Halloween sécuritaire (Safe Halloween)",
    date: new Date('2025-10-07'),
    topic: "learning Halloween vocabulary while emphasizing safety and community fun",
    vocabularyTerms: [
      { term: "sécurité", definition: "safety - staying safe and protected" },
      { term: "costume", definition: "costume - special clothes we wear for Halloween fun" }
    ],
    indigenousConnection: "Mi'kmaq traditions include seasonal ceremonies with special regalia and masks representing animal spirits and natural forces. These sacred garments honor the spiritual world and maintain balance between seen and unseen realms. While Halloween costumes serve different purposes, we can approach dressing up with respect for traditions that honor spiritual connections and community celebration with mindfulness and cultural sensitivity.",
    specificMindsOn: `(8 minutes)
☐ Display safe Halloween costume examples
☐ Connect to Mi'kmaq traditions of ceremonial regalia
☐ Practice "sécurité" with safety gesture (hands protecting)
☐ Share Halloween as community celebration time
☐ Introduce "costume" with respect for cultural traditions`,
    specificAction: `(27 minutes)
Part 1 - Safety First (10 minutes):
☐ Demonstrate Halloween safety rules with props
☐ Practice "sécurité" when discussing each rule
☐ Role-play safe trick-or-treating behaviors
☐ Create safety checklist for Halloween night

Part 2 - Costume Design (12 minutes):
☐ Design safe "costume" ideas on paper
☐ Include visibility and movement considerations
☐ Practice costume vocabulary with drawings
☐ Share costume ideas respectfully with class

Part 3 - Community Safety Plan (5 minutes):
☐ Practice Halloween safety phrases
☐ Plan safe neighborhood trick-or-treating
☐ Role-play polite Halloween greetings`,
    specificConsolidation: `(10 minutes)
☐ Review Halloween "sécurité" rules together
☐ Practice safe costume movement and visibility
☐ Plan to share safety rules with families
☐ Connect Halloween safety to year-round safety
☐ Preview: "Tomorrow we learn Halloween decorations!"`,
    materials: `• Safe costume examples • Halloween safety props (flashlights, reflective tape)
• Safety checklist templates • Costume design paper • Markers and crayons
• Mi'kmaq regalia photos (with permission) • Role-play scenarios
• Community safety maps • Camera for safety demonstrations`,
    learningGoals: "Students will prioritize Halloween safety while learning celebration vocabulary and showing respect for cultural traditions of ceremonial dress.",
    successCriteria: `☐ I can explain Halloween "sécurité" rules
☐ I can design a safe "costume" for celebrating
☐ I can practice safe Halloween behaviors
☐ I can show respect for all cultural traditions`
  },

  {
    title: "Lesson 6: Décorations d'Halloween (Halloween Decorations)",
    date: new Date('2025-10-08'),
    topic: "creating Halloween decorations while practicing color and shape vocabulary",
    vocabularyTerms: [
      { term: "orange", definition: "orange - the bright color of pumpkins and autumn leaves" },
      { term: "noir", definition: "black - the dark color we see at night" }
    ],
    indigenousConnection: "Mi'kmaq artistic traditions use natural colors and symbols to represent seasonal changes and spiritual teachings. Orange represents the sacred fire and autumn abundance, while black represents the wisdom of night and rest time. Traditional arts connect colors to natural cycles and spiritual meanings. We honor these teachings by creating decorations that celebrate seasonal beauty with respect and gratitude.",
    specificMindsOn: `(8 minutes)
☐ Display natural orange and black items from nature
☐ Share Mi'kmaq teachings about seasonal colors
☐ Practice "orange" while holding pumpkin or autumn leaf
☐ Practice "noir" while pointing to nighttime sky picture
☐ Connect colors to Halloween decoration traditions`,
    specificAction: `(27 minutes)
Part 1 - Color Hunt (10 minutes):
☐ Find "orange" and "noir" items around classroom
☐ Sort Halloween decorations by colors
☐ Practice color pronunciation with real objects
☐ Create Halloween color collection display

Part 2 - Decoration Creation (12 minutes):
☐ Make simple Halloween decorations using orange and black
☐ Cut paper shapes: pumpkins, bats, autumn leaves
☐ Practice color vocabulary while creating art
☐ Decorate with respect for seasonal beauty

Part 3 - Classroom Decorating (5 minutes):
☐ Display decorations around classroom safely
☐ Practice describing decorations: "C'est orange" "C'est noir"
☐ Admire everyone's creative contributions`,
    specificConsolidation: `(10 minutes)
☐ Appreciate decorated classroom together
☐ Practice "orange" and "noir" with pointing games
☐ Share favorite Halloween decoration colors
☐ Plan to notice orange and black in nature
☐ Preview: "Tomorrow we carve pumpkins safely!"`,
    materials: `• Orange and black construction paper • Child-safe scissors • Glue sticks
• Natural orange items (pumpkins, leaves) • Black items for color reference
• Halloween decoration examples • Chart paper for color sorting
• Crayons in orange and black • Camera for decoration documentation`,
    learningGoals: "Students will create Halloween decorations while mastering orange and black color vocabulary and appreciating seasonal artistic traditions.",
    successCriteria: `☐ I can identify and say "orange" when I see orange things
☐ I can identify and say "noir" when I see black things
☐ I can create Halloween decorations using these colors
☐ I can describe my decorations using color words`
  },

  {
    title: "Lesson 7: Citrouilles et jack-o'-lanterns (Pumpkins and Jack-o'-lanterns)",
    date: new Date('2025-10-09'),
    topic: "exploring pumpkins as autumn harvest and Halloween tradition",
    vocabularyTerms: [
      { term: "citrouille", definition: "pumpkin - large orange fruit that grows on vines" },
      { term: "lumière", definition: "light - brightness that helps us see in darkness" }
    ],
    indigenousConnection: "Mi'kmaq traditional knowledge includes cultivating squash and pumpkins as part of the Three Sisters agricultural system. These plants provided food, tools, and containers for the community. The practice of using natural materials for practical and spiritual purposes reflects Indigenous wisdom about living in harmony with nature's gifts. Pumpkin carving can honor this tradition of transforming natural materials with respect and gratitude.",
    specificMindsOn: `(8 minutes)
☐ Display variety of pumpkins and squash from Three Sisters
☐ Share Mi'kmaq traditional uses for pumpkins and squash
☐ Practice "citrouille" while touching and examining pumpkins
☐ Connect pumpkins to harvest and Halloween traditions
☐ Introduce "lumière" with candle or flashlight demonstration`,
    specificAction: `(27 minutes)
Part 1 - Pumpkin Investigation (10 minutes):
☐ Examine "citrouille" inside and outside with magnifying glasses
☐ Feel texture, count seeds, measure circumference
☐ Practice vocabulary while exploring pumpkin parts
☐ Connect pumpkin to healthy food and celebrations

Part 2 - Safe Jack-o'-lantern Design (12 minutes):
☐ Draw jack-o'-lantern faces on paper first
☐ Teacher demonstrates safe carving (students observe)
☐ Students suggest designs and practice "lumière" vocabulary
☐ Discuss how light shines through carved designs

Part 3 - Pumpkin Celebration (5 minutes):
☐ Light battery candle in completed jack-o'-lantern
☐ Practice "La citrouille a de la lumière!"
☐ Plan pumpkin seed roasting for snack time`,
    specificConsolidation: `(10 minutes)
☐ Admire illuminated jack-o'-lantern together
☐ Practice "citrouille" and "lumière" with actions
☐ Share favorite part of pumpkin exploration
☐ Connect pumpkins to harvest gratitude
☐ Preview: "Tomorrow we practice trick-or-treat phrases!"`,
    materials: `• Various sizes of pumpkins • Safe carving tools (teacher use only) • Battery-operated candles
• Magnifying glasses • Measuring tape • Paper for design sketches • Markers
• Mi'kmaq Three Sisters information • Pumpkin seeds for roasting
• Camera for documentation • Hand sanitizer • Paper towels`,
    learningGoals: "Students will explore pumpkins as harvest food and Halloween tradition while learning vocabulary for natural materials and connecting to Indigenous agricultural knowledge.",
    successCriteria: `☐ I can identify and say "citrouille" when I see pumpkins
☐ I can describe how "lumière" shines through jack-o'-lanterns
☐ I can connect pumpkins to harvest and Halloween safely
☐ I can show respect for traditional uses of pumpkins`
  },

  {
    title: "Lesson 8: Bonbons ou friandises (Trick or Treat)",
    date: new Date('2025-10-10'),
    topic: "learning polite Halloween phrases and practicing community interaction",
    vocabularyTerms: [
      { term: "bonbons", definition: "candy - sweet treats we enjoy in small amounts" },
      { term: "s'il vous plaît", definition: "please - polite word when asking for something" }
    ],
    indigenousConnection: "Mi'kmaq hospitality traditions emphasize sharing with visitors and community members, especially during seasonal celebrations. Traditional protocols include offering food to guests and expressing gratitude for generosity. The practice of visiting neighbors during Halloween reflects these community values of sharing, kindness, and building relationships. We honor these traditions by practicing respectful requests and grateful responses.",
    specificMindsOn: `(8 minutes)
☐ Share Mi'kmaq traditions of community hospitality
☐ Connect Halloween visiting to neighbor relationship building
☐ Practice "bonbons" with safe candy examples
☐ Model "s'il vous plaît" with polite gesture
☐ Set expectations for respectful Halloween interactions`,
    specificAction: `(27 minutes)
Part 1 - Polite Phrases Practice (10 minutes):
☐ Practice "Bonbons ou friandises, s'il vous plaît!"
☐ Learn appropriate responses: "Merci beaucoup!"
☐ Role-play polite Halloween interactions
☐ Practice with different costume scenarios

Part 2 - Community Role Play (12 minutes):
☐ Set up classroom "neighborhood" with stations
☐ Students practice visiting and hosting roles
☐ Use polite French phrases at each station
☐ Practice saying thank you and goodbye properly

Part 3 - Halloween Etiquette (5 minutes):
☐ Review respectful trick-or-treat behaviors
☐ Practice walking safely between houses
☐ Plan to use French phrases on Halloween night`,
    specificConsolidation: `(10 minutes)
☐ Practice perfect Halloween greeting and thank you
☐ Share plans for using French on Halloween
☐ Review community safety and politeness
☐ Plan to report back on French Halloween success
☐ Preview: "Next week we learn about Remembrance Day!"`,
    materials: `• Safe candy examples for vocabulary • Role-play station materials
• Halloween greeting cards • Polite phrase posters • Costume accessories for role play
• Community map for trick-or-treat planning • Thank you note templates
• Camera for role-play documentation • French phrase reminder cards`,
    learningGoals: "Students will use polite French phrases for Halloween interactions while showing respect for community traditions and practicing gracious social behavior.",
    successCriteria: `☐ I can ask for "bonbons" using "s'il vous plaît" politely
☐ I can say "Merci beaucoup!" when receiving treats
☐ I can practice respectful Halloween visiting behaviors
☐ I can use French phrases during community interactions`
  },

  // WEEK 3: Remembrance Day and Reflection
  {
    title: "Lesson 9: Se souvenir (Remembering)",
    date: new Date('2025-10-13'),
    topic: "understanding Remembrance Day and honoring those who served our country",
    vocabularyTerms: [
      { term: "souvenir", definition: "memory/remember - keeping important people in our hearts" },
      { term: "paix", definition: "peace - living together without fighting or war" }
    ],
    indigenousConnection: "Mi'kmaq warrior traditions honor those who protected the community and land. Traditional ceremonies remember ancestors who sacrificed for future generations, including Mi'kmaq veterans who served in Canadian military forces. The sacred teaching of peace emphasizes that true warriors work to prevent conflict and protect the vulnerable. We honor all who served while praying for lasting peace.",
    specificMindsOn: `(8 minutes)
☐ Display photos of Mi'kmaq veterans with respect
☐ Share teaching about remembering those who protected us
☐ Practice "souvenir" with hands to heart gesture
☐ Introduce "paix" with peaceful dove or olive branch
☐ Create quiet, respectful atmosphere for learning`,
    specificAction: `(27 minutes)
Part 1 - Remembrance Learning (10 minutes):
☐ Learn about Remembrance Day in age-appropriate way
☐ Practice "souvenir" when talking about remembering
☐ Discuss how we show respect for people who helped us
☐ Connect to community helpers who keep us safe

Part 2 - Peaceful Prayers/Wishes (12 minutes):
☐ Create artwork showing hopes for "paix"
☐ Write simple wishes for peaceful world
☐ Practice quiet reflection and gratitude
☐ Make thank you cards for veterans

Part 3 - Remembrance Ceremony Practice (5 minutes):
☐ Practice standing quietly for moment of silence
☐ Learn appropriate Remembrance Day behaviors
☐ Practice saying "Nous nous souvenons" (We remember)`,
    specificConsolidation: `(10 minutes)
☐ Share one way we can work for "paix" in our classroom
☐ Practice "souvenir" with respect and gratitude
☐ Plan to thank community helpers this week
☐ Connect remembrance to daily gratitude practice
☐ Preview: "Tomorrow we learn about making peace!"`,
    materials: `• Respectful veteran photos • Peaceful imagery (doves, olive branches)
• Art supplies for peace artwork • Thank you card materials
• Quiet reflection music • Remembrance Day information for children
• Mi'kmaq veteran stories (if available) • Camera for respectful documentation`,
    learningGoals: "Students will understand Remembrance Day significance while learning vocabulary for memory and peace with cultural sensitivity and age-appropriate respect.",
    successCriteria: `☐ I can explain why we "souvenir" people who helped us
☐ I can share what "paix" means for our community
☐ I can show respect during remembrance activities
☐ I can thank people who help keep us safe`
  },

  {
    title: "Lesson 10: Construire la paix (Building Peace)",
    date: new Date('2025-10-14'),
    topic: "learning how children can contribute to peace in classroom and community",
    vocabularyTerms: [
      { term: "aider", definition: "help - doing something kind to support others" },
      { term: "gentillesse", definition: "kindness - being nice and caring to others" }
    ],
    indigenousConnection: "Mi'kmaq peacemaking traditions teach that peace begins with individual actions of kindness and respect. The Seven Sacred Teachings include love, respect, and humility as foundations for peaceful communities. Traditional conflict resolution emphasizes understanding different perspectives and finding harmony. Children learn that their daily choices to help others and show gentillesse create the peaceful world we remember veterans for protecting.",
    specificMindsOn: `(8 minutes)
☐ Create peace circle with talking piece
☐ Share Mi'kmaq teachings about building peace through daily actions
☐ Practice "aider" with helping gesture (hands reaching out)
☐ Model "gentillesse" with gentle, caring voice and actions
☐ Connect small acts of kindness to big peace`,
    specificAction: `(27 minutes)
Part 1 - Peace Builders (10 minutes):
☐ Brainstorm ways children can "aider" others
☐ Practice acts of "gentillesse" with role play
☐ Create classroom peace-building action list
☐ Connect helping to remembering those who served

Part 2 - Kindness in Action (12 minutes):
☐ Practice specific helping behaviors around classroom
☐ Create "gentillesse" cards for classmates
☐ Plan acts of service for school community
☐ Practice peaceful problem-solving strategies

Part 3 - Peace Pledge (5 minutes):
☐ Create class peace pledge using new vocabulary
☐ Practice: "Je vais aider avec gentillesse"
☐ Plan daily peace-building actions`,
    specificConsolidation: `(10 minutes)
☐ Share one way to "aider" someone this week
☐ Practice showing "gentillesse" to classmates
☐ Connect peace-building to honoring veterans
☐ Plan family peace-building activities
☐ Preview: "Tomorrow we celebrate all autumn learning!"`,
    materials: `• Peace circle talking piece • Peace-building action cards • Role-play scenario props
• Kindness card materials • Chart paper for peace pledge • Markers and crayons
• Seven Sacred Teachings poster • Camera for peace action documentation
• Community service planning materials`,
    learningGoals: "Students will identify ways to build peace through helping and kindness while connecting personal actions to honoring those who served for peace.",
    successCriteria: `☐ I can "aider" others in meaningful ways
☐ I can show "gentillesse" to classmates daily
☐ I can connect my peaceful actions to remembering veterans
☐ I can practice peaceful problem-solving in conflicts`
  },

  {
    title: "Lesson 11: Célébration d'automne (Autumn Celebration)",
    date: new Date('2025-10-15'),
    topic: "celebrating all autumn learning through community feast and sharing",
    vocabularyTerms: [
      { term: "fête", definition: "celebration/party - special time to enjoy together" },
      { term: "ensemble", definition: "together - doing things as a group" }
    ],
    indigenousConnection: "Mi'kmaq community celebrations mark seasonal transitions with shared food, storytelling, and gratitude ceremonies. Traditional autumn gatherings celebrate harvest abundance and prepare hearts for winter's introspective time. These celebrations strengthen community bonds and ensure cultural knowledge passes to next generations. Our autumn fête honors these traditions by bringing families together to share learning and gratitude.",
    specificMindsOn: `(8 minutes)
☐ Welcome families to our autumn "fête"
☐ Share Mi'kmaq traditions of seasonal community celebrations
☐ Practice "ensemble" with group welcome gesture
☐ Set celebration tone: gratitude, community, shared learning
☐ Introduce families to our autumn vocabulary journey`,
    specificAction: `(27 minutes)
Part 1 - Learning Showcase (12 minutes):
☐ Students demonstrate autumn vocabulary to families
☐ Share harvest gratitude and thanksgiving expressions
☐ Show Halloween safety knowledge and polite phrases
☐ Present peace-building commitments with pride

Part 2 - Community Feast (10 minutes):
☐ Share harvest foods "ensemble" as classroom family
☐ Practice thanksgiving blessing in French
☐ Students lead families in gratitude expressions
☐ Connect food sharing to community traditions

Part 3 - Family Appreciation (5 minutes):
☐ Thank families for supporting our learning
☐ Give families autumn vocabulary cards for home practice
☐ Share plans for continued French learning`,
    specificConsolidation: `(10 minutes)
☐ Students share what they're proudest of from autumn learning
☐ Families share observations about student growth
☐ Plan continued autumn vocabulary practice at home
☐ Celebrate successful completion of autumn unit
☐ Preview: "Tomorrow we create our autumn portfolios!"`,
    materials: `• Family invitation cards • Autumn harvest foods for sharing • Learning showcase props
• Thanksgiving blessing cards • Vocabulary cards for families • Celebration decorations
• Camera for family celebration photos • Thank you cards for families
• Student work displays • Light refreshments`,
    learningGoals: "Students will celebrate autumn learning achievements with families while demonstrating vocabulary mastery and building community connections through shared celebration.",
    successCriteria: `☐ I can demonstrate autumn vocabulary for my family
☐ I can participate in community "fête" with pride
☐ I can work "ensemble" to create celebration success
☐ I can share my learning growth with confidence`
  },

  {
    title: "Lesson 12: Portfolio d'automne (Autumn Portfolio)",
    date: new Date('2025-10-16'),
    topic: "creating comprehensive portfolios showcasing autumn vocabulary and cultural learning",
    vocabularyTerms: [
      { term: "progrès", definition: "progress - how much we have learned and grown" },
      { term: "fierté", definition: "pride - feeling good about our accomplishments" }
    ],
    indigenousConnection: "Mi'kmaq tradition includes creating story bundles and teaching materials that preserve seasonal knowledge and personal growth journeys. These collections honor the learning path and provide guidance for continued development. Elders emphasize that acknowledging progress builds confidence for future challenges. Our portfolios serve as autumn learning bundles, celebrating growth while preparing for winter's deeper learning.",
    specificMindsOn: `(8 minutes)
☐ Display example Mi'kmaq story bundles and teaching materials
☐ Connect to our portfolio as autumn learning bundle
☐ Practice "progrès" while reviewing October vocabulary growth
☐ Model "fierté" with confident posture and voice
☐ Set intention to honor all learning achievements`,
    specificAction: `(27 minutes)
Part 1 - Portfolio Assembly (12 minutes):
☐ Organize October work samples by themes: harvest, Halloween, remembrance
☐ Add photos of learning activities and celebrations
☐ Include self-reflection pages showing "progrès"
☐ Create portfolio cover celebrating autumn learning

Part 2 - Growth Documentation (10 minutes):
☐ Record vocabulary mastery from September to October
☐ Draw pictures showing learning "progrès" in French
☐ Write goals for November learning adventures
☐ Practice explaining growth to families

Part 3 - Portfolio Sharing (5 minutes):
☐ Share portfolio highlights with learning partners
☐ Practice describing learning with "fierté"
☐ Celebrate diverse learning journeys in class`,
    specificConsolidation: `(10 minutes)
☐ Admire completed portfolios with "fierté"
☐ Practice sharing portfolios confidently with families
☐ Plan to continue French learning with enthusiasm
☐ Thank classmates for being excellent learning partners
☐ Celebrate successful completion of "Les fêtes d'automne" unit`,
    materials: `• Portfolio folders and organizers • October learning work samples • Photos of autumn activities
• Self-reflection templates • Art supplies for portfolio decoration • Growth tracking charts
• Goal-setting worksheets • Laminating materials • Camera for final documentation
• Celebration stickers • Thank you cards for families`,
    learningGoals: "Students will create comprehensive autumn portfolios demonstrating vocabulary growth and cultural learning while developing pride in their French language progress.",
    successCriteria: `☐ I can organize my portfolio showing October "progrès"
☐ I can explain my autumn learning with "fierté"
☐ I can set goals for continued French learning
☐ I can share my achievements confidently with others`
  }
];

async function createAutomneLesson(lessonData: LessonData, unitPlanId: string, userId: number) {
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
☐ Observation during minds on discussion - note engagement and cultural connections
☐ Anecdotal notes during action phase activities - document vocabulary usage and comprehension
☐ Checklist for autumn vocabulary demonstration - track pronunciation and context use
☐ Student self-assessment during consolidation - encourage reflection on learning growth

Success Criteria Observations:
☐ Uses autumn celebration vocabulary appropriately (meets/approaching/needs support)
☐ Demonstrates understanding of seasonal traditions (meets/approaching/needs support)
☐ Participates respectfully in cultural learning activities (meets/approaching/needs support)
☐ Shows progress toward French language learning goals (meets/approaching/needs support)`,
      
      differentiationStrategies: {
        forStruggling: "Provide visual vocabulary supports with seasonal pictures, simplified instructions with gesture cues, peer buddies for autumn activities, hands-on manipulatives (leaves, pumpkins), reduced task complexity, extra processing time for vocabulary retention, and frequent check-ins for understanding",
        forIEP: "Modified expectations as outlined in individual education plan, assistive technology support for vocabulary practice, alternative demonstration methods for seasonal concepts, extended time allocations for autumn activities, modified assessment criteria focusing on individual growth, and dedicated one-on-one support during cultural learning",
        forELL: "Visual vocabulary cards with autumn pictures, bilingual dictionaries for seasonal terms, sentence frames for celebration expressions, peer translation support during activities, gestures and demonstrations for cultural concepts, home language connections to autumn traditions, and culturally relevant examples from student backgrounds",
        forAdvanced: "Extension activities exploring deeper autumn cultural connections, leadership roles in seasonal celebration planning, independent research projects on Mi'kmaq autumn traditions, creation of teaching materials for younger students, cross-curricular connections to science and social studies, and mentoring opportunities during group activities"
      },
      
      indigenousPerspectives: lessonData.indigenousConnection,
      
      reflectionActivities: {
        teacherReflection: `• How effectively did students engage with autumn vocabulary and cultural concepts today?
• Which students demonstrated strong progress in French seasonal expressions and which need additional support?
• How can I adjust tomorrow's lesson based on today's observations of vocabulary retention and cultural understanding?
• What extension opportunities would challenge advanced learners while honoring Indigenous perspectives?
• How well did the Mi'kmaq cultural connections enhance learning while remaining authentic and respectful?
• What aspects of differentiation were most successful for diverse learners during autumn celebration activities?`,
        crossCurricular: `• Language Arts: Seasonal vocabulary development, oral communication skills, cultural storytelling traditions
• Mathematics: Counting autumn objects, measuring pumpkins, patterns in nature, harvest quantity concepts
• Arts: Autumn art creation, cultural designs, seasonal crafts, Mi'kmaq-inspired patterns and symbols
• Social Studies: Community celebrations, cultural traditions, local agriculture, respect for diversity
• Science: Seasonal changes observation, plant life cycles, weather patterns, natural phenomena
• Health: Seasonal nutrition, safety practices, emotional well-being, community connections and belonging`
      }
    }
  });
}

async function main() {
  try {
    console.log('🍂 Starting Les fêtes d\'automne lesson creation...');
    
    // Find Emily's user record
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily user not found. Please ensure user exists with email emmcisaac@gmail.com');
    }
    
    console.log(`✅ Found Emily (ID: ${emily.id})`);
    
    // Find the "Les fêtes d'automne" unit plan
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        title: 'Les fêtes d\'automne',
        userId: emily.id
      }
    });
    
    if (!unitPlan) {
      throw new Error('Les fêtes d\'automne unit plan not found for Emily');
    }
    
    console.log(`✅ Found unit plan "${unitPlan.title}" (ID: ${unitPlan.id})`);
    
    // Delete existing lessons for this unit (if any)
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unitPlan.id }
    });
    
    console.log('🗑️ Cleared existing lessons for unit');
    
    // Create all 12 perfect lessons
    console.log('📝 Creating 12 perfect ETFO-compliant autumn lessons...');
    
    let createdCount = 0;
    for (const lessonData of lessons) {
      await createAutomneLesson(lessonData, unitPlan.id, emily.id);
      createdCount++;
      console.log(`✅ Created lesson ${createdCount}/12: ${lessonData.title}`);
    }
    
    console.log(`\n🎉 SUCCESS! Created ${createdCount} perfect Grade 1 French Immersion autumn lessons`);
    console.log('\n📋 Lesson Summary:');
    console.log('• Duration: 45 minutes each (ETFO compliant)');
    console.log('• Structure: Minds On (8min) + Action (27min) + Consolidation (10min)');
    console.log('• Vocabulary: 2-3 French terms per lesson (Grade 1 appropriate)');
    console.log('• Assessment: Observable with ☐ checkboxes');
    console.log('• Differentiation: JSON format with all 4 learner types');
    console.log('• Indigenous Perspectives: 100+ characters Mi\'kmaq connections');
    console.log('• Materials: Comprehensive lists for each lesson');
    
    console.log('\n📅 October 2025 Autumn Celebrations Schedule:');
    console.log('Week 1 (Oct 1-6): Autumn changes, harvest traditions, PEI potatoes, Thanksgiving');
    console.log('Week 2 (Oct 7-10): Halloween safety, decorations, pumpkins, trick-or-treat phrases');
    console.log('Week 3 (Oct 13-16): Remembrance Day, peace building, autumn celebration, portfolios');
    
    console.log('\n🍂 Key Learning Themes:');
    console.log('• Seasonal awareness and appreciation for autumn changes');
    console.log('• Gratitude and thanksgiving for harvest abundance');
    console.log('• Halloween safety and community celebration');
    console.log('• Remembrance Day respect and peace building');
    console.log('• Mi\'kmaq seasonal traditions and cultural connections');
    console.log('• PEI agricultural heritage and local food systems');
    
  } catch (error) {
    console.error('❌ Error creating Les fêtes d\'automne lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script when run directly
main()
  .then(() => {
    console.log('\n✨ Les fêtes d\'automne lessons created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });

export default main;