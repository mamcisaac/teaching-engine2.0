/**
 * PERFECT GRADE 1 FRENCH IMMERSION LESSON GENERATOR
 * Unit: "L'hiver magique" (Magical Winter)
 * 
 * Creates 15 ETFO-compliant lessons for December 2025 - January 2026
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

// 15 Perfect Lessons for "L'hiver magique"
const lessons: LessonData[] = [
  // WEEK 1: Winter Weather Discovery
  {
    title: "Lesson 1: La neige arrive! (Snow is Coming!)",
    date: new Date('2025-12-01'),
    topic: "discovering winter weather changes and the magic of snow",
    vocabularyTerms: [
      { term: "neige", definition: "snow - white flakes that fall from winter clouds" },
      { term: "froid", definition: "cold - the temperature we feel in winter" }
    ],
    indigenousConnection: "Mi'kmaq traditional knowledge recognizes thirteen different types of snow, each with its own name and purpose. Elders taught children to read the snow like a book - soft snow for travel, packed snow for building, and wind-blown snow for weather prediction. The first snowfall was celebrated as a gift from the Creator, bringing beauty and the promise of winter teachings about survival, patience, and the cycles of nature.",
    specificMindsOn: `(8 minutes)
☐ Look outside together to observe winter changes
☐ Share Mi'kmaq teaching about thirteen types of snow
☐ Touch real snowflakes (if available) or ice cubes safely
☐ Practice "neige" while making snowflake motions with fingers
☐ Discuss: "What happens when it gets froid outside?"`,
    specificAction: `(27 minutes)
Part 1 - Snow Exploration (10 minutes):
☐ Create paper snowflakes while saying "neige"
☐ Feel different textures: cotton (soft snow), crushed ice (crunchy snow)
☐ Practice weather words with actions: "Il fait froid!"
☐ Observe snow through magnifying glasses if available

Part 2 - Winter Weather Station (12 minutes):
☐ Set up classroom weather station with thermometer
☐ Chart daily temperatures and weather symbols
☐ Practice: "Il neige!" with excited winter dance
☐ Create winter weather prediction signs

Part 3 - Snow Memory Book (5 minutes):
☐ Draw pictures of first snow experiences
☐ Label with "neige" and "froid"
☐ Share snow memories with partners`,
    specificConsolidation: `(10 minutes)
☐ Perform winter weather dance together
☐ Practice: "J'aime la neige!" (I love snow!)
☐ Share one thing that makes winter special
☐ Plan to watch for "neige" this week
☐ Preview: "Tomorrow we learn about winter clothes!"`,
    materials: `• Real snow samples (if available) or ice cubes • Paper for snowflake cutting • Magnifying glasses
• Cotton balls for snow texture • Thermometer for weather station • Weather chart and symbols
• Crayons and drawing paper • Mi'kmaq snow knowledge examples • Safe scissors for snowflakes
• Chart paper for weather tracking • Camera for snow documentation • Winter music for dancing`,
    learningGoals: "Students will identify winter weather vocabulary while appreciating Mi'kmaq traditional snow knowledge and developing weather observation skills.",
    successCriteria: `☐ I can say "neige" when I see snow
☐ I can say "froid" when it feels cold outside
☐ I can describe winter weather changes
☐ I can make connections between weather and clothing`
  },

  {
    title: "Lesson 2: Mes vêtements d'hiver (My Winter Clothes)",
    date: new Date('2025-12-02'),
    topic: "learning winter clothing vocabulary and understanding seasonal safety",
    vocabularyTerms: [
      { term: "manteau", definition: "coat - warm clothing to keep us cozy in winter" },
      { term: "mitaines", definition: "mittens - coverings to keep our hands warm" }
    ],
    indigenousConnection: "Mi'kmaq people created sophisticated winter clothing from natural materials including moose hide, rabbit fur, and seal skin. Traditional winter moccasins had different soles for ice and snow conditions. Children learned that proper winter clothing meant survival, and each piece served a specific purpose. The preparation of winter clothing was a community effort, with elders teaching young people the skills needed to stay warm and safe during the cold months.",
    specificMindsOn: `(8 minutes)
☐ Display traditional Mi'kmaq winter clothing examples or photos
☐ Compare to modern winter clothes we wear today
☐ Practice "manteau" while putting on coat motions
☐ Touch different textures: fur, wool, waterproof materials
☐ Share: "Winter clothes help us stay warm and safe"`,
    specificAction: `(27 minutes)
Part 1 - Winter Clothing Exploration (10 minutes):
☐ Sort winter clothes into categories: head, body, hands, feet
☐ Practice saying "mitaines" while wiggling fingers
☐ Try on different winter items and name them
☐ Connect clothing to weather: "Quand il fait froid, je porte..."

Part 2 - Dressing for Winter Game (12 minutes):
☐ Winter clothing relay: dress teddy bear for cold weather
☐ Practice: "Je mets mon manteau" with dressing actions
☐ Create winter outfit drawings with labels
☐ Play "What's Missing?" with winter clothing items

Part 3 - Winter Safety Rules (5 minutes):
☐ Discuss why we need warm clothes in winter
☐ Practice checking: hat, coat, mittens, boots
☐ Create winter safety checklist with pictures`,
    specificConsolidation: `(10 minutes)
☐ Model perfect winter dressing routine
☐ Practice: "Mes mitaines gardent mes mains au chaud"
☐ Share favorite piece of winter clothing
☐ Plan winter clothing check for tomorrow
☐ Preview: "Next we explore winter holidays!"`,
    materials: `• Various winter clothing items (hats, coats, mittens, scarves) • Traditional Mi'kmaq clothing photos
• Teddy bears for dressing practice • Sorting baskets for clothing categories • Texture samples (fur, wool, fleece)
• Drawing paper and crayons • Winter clothing labels • Safety checklist templates
• Full-length mirror for trying on clothes • Camera for clothing documentation`,
    learningGoals: "Students will name essential winter clothing in French while understanding the importance of seasonal safety and appreciating traditional Mi'kmaq winter survival knowledge.",
    successCriteria: `☐ I can say "manteau" when pointing to a coat
☐ I can say "mitaines" when talking about mittens
☐ I can choose appropriate clothes for winter weather
☐ I can explain why winter clothing keeps us safe`
  },

  {
    title: "Lesson 3: Les fêtes de décembre (December Celebrations)",
    date: new Date('2025-12-03'),
    topic: "exploring winter holiday traditions and cultural celebrations",
    vocabularyTerms: [
      { term: "fête", definition: "celebration - special time with family and friends" },
      { term: "lumière", definition: "light - brightness that shines in the darkness" }
    ],
    indigenousConnection: "Mi'kmaq winter solstice traditions celebrate the return of light during the darkest time of year. Traditional winter ceremonies include sharing stories, giving gifts of handmade items, and lighting fires to welcome back the sun. The midwinter celebration honors the cycle of seasons and brings communities together during the longest nights. These traditions emphasize gratitude, generosity, and the importance of light both literal and spiritual during winter.",
    specificMindsOn: `(8 minutes)
☐ Display beautiful lights and decorations from different cultures
☐ Share Mi'kmaq winter solstice traditions about celebrating light
☐ Practice "fête" with happy celebration gestures
☐ Look at "lumière" examples: candles, string lights, lanterns
☐ Discuss: "How do families celebrate during winter?"`,
    specificAction: `(27 minutes)
Part 1 - Holiday Exploration (10 minutes):
☐ Learn about different December celebrations around the world
☐ Practice saying "lumière" while holding safe battery candles
☐ Create holiday comparison chart with pictures
☐ Share family winter traditions respectfully

Part 2 - Light Celebration Craft (12 minutes):
☐ Make paper lanterns with winter designs
☐ Decorate with symbols from different cultures
☐ Practice: "Ma fête préférée est..." (My favorite celebration is...)
☐ Add LED tea lights safely to lanterns

Part 3 - Gratitude Circle (5 minutes):
☐ Share what we're thankful for this winter
☐ Practice giving compliments: "Tu es gentil(le)"
☐ Plan classroom winter celebration`,
    specificConsolidation: `(10 minutes)
☐ Light our paper lanterns together safely
☐ Sing simple winter celebration song
☐ Practice: "Les lumières sont belles!" (The lights are beautiful!)
☐ Share one winter tradition from home
☐ Preview: "Tomorrow we learn winter animals!"`,
    materials: `• Battery-operated LED tea lights • Paper lantern-making supplies • Cultural celebration photos
• Safe candles for demonstration • Holiday decorations from various traditions • Mi'kmaq winter ceremony information
• Chart paper for holiday comparison • Markers and decorating supplies • Camera for celebration documentation
• Gratitude circle talking piece • Soft celebration music`,
    learningGoals: "Students will explore winter celebrations with respect for cultural diversity while learning holiday vocabulary and appreciating the significance of light during winter.",
    successCriteria: `☐ I can say "fête" when talking about celebrations
☐ I can say "lumière" when I see lights
☐ I can share my family's winter traditions respectfully
☐ I can appreciate different ways people celebrate winter`
  },

  // WEEK 2: Winter Animals and Activities
  {
    title: "Lesson 4: Les animaux en hiver (Animals in Winter)",
    date: new Date('2025-12-08'),
    topic: "discovering how animals survive and adapt during winter months",
    vocabularyTerms: [
      { term: "animaux", definition: "animals - living creatures that share our world" },
      { term: "dormir", definition: "sleep - what some animals do all winter long" }
    ],
    indigenousConnection: "Mi'kmaq traditional teachings include deep knowledge about winter animal behaviors and survival strategies. Elders taught children to observe animal tracks in snow, understand which animals hibernate, migrate, or adapt their fur coats. Animals were seen as teachers, showing humans how to prepare for winter and survive harsh conditions. The bear's hibernation taught patience, while the rabbit's white winter coat showed the wisdom of adaptation.",
    specificMindsOn: `(8 minutes)
☐ Show animal track impressions in play dough or sand
☐ Share Mi'kmaq teaching about animals as winter teachers
☐ Practice "animaux" while making different animal sounds
☐ Discuss: "Where do animaux go when it gets cold?"
☐ Introduce concept of winter "dormir" (hibernation)`,
    specificAction: `(27 minutes)
Part 1 - Animal Winter Strategies (10 minutes):
☐ Sort animal pictures: hibernate, migrate, adapt
☐ Practice animal movements and sounds for each group
☐ Learn about bears who "dormir" all winter
☐ Explore how rabbits and foxes change color

Part 2 - Animal Track Detective (12 minutes):
☐ Make animal tracks in flour or play dough
☐ Follow track patterns around classroom
☐ Practice: "Les animaux marchent dans la neige"
☐ Create winter animal movement songs

Part 3 - Animal Winter Homes (5 minutes):
☐ Build cozy dens, nests, and burrows with blocks
☐ Practice: "L'ours dort dans sa tanière"
☐ Role-play different animal winter behaviors`,
    specificConsolidation: `(10 minutes)
☐ Act out favorite winter animal behavior
☐ Practice animal vocabulary with movements
☐ Share which animal winter strategy is most interesting
☐ Plan to look for animal tracks outside
☐ Preview: "Tomorrow we play winter sports!"`,
    materials: `• Animal track stamps or molds • Play dough or flour for tracks • Animal photo cards (winter/summer)
• Building blocks for animal homes • Mi'kmaq animal tracking examples • Animal sound audio clips
• Chart paper for animal sorting • Magnifying glasses for track observation
• Soft toy animals for demonstration • Camera for track documentation`,
    learningGoals: "Students will learn about animal winter adaptations through French vocabulary while appreciating Mi'kmaq traditional ecological knowledge and developing respect for wildlife.",
    successCriteria: `☐ I can say "animaux" when talking about winter creatures
☐ I can say "dormir" when describing hibernation
☐ I can explain how animals survive winter
☐ I can identify different animal winter strategies`
  },

  {
    title: "Lesson 5: Sports d'hiver (Winter Sports)",
    date: new Date('2025-12-09'),
    topic: "exploring fun winter activities and traditional winter games",
    vocabularyTerms: [
      { term: "glisser", definition: "slide - move smoothly over snow and ice" },
      { term: "jouer", definition: "play - have fun with winter activities" }
    ],
    indigenousConnection: "Mi'kmaq children traditionally played winter games that built strength and survival skills needed for harsh weather. Snow snake was a game where players slid wooden sticks across snow and ice. Traditional snowshoes allowed travel across deep snow. Winter games taught balance, coordination, and teamwork while making the long winter months enjoyable. These activities connected play with practical life skills and community bonding.",
    specificMindsOn: `(8 minutes)
☐ Display traditional Mi'kmaq winter games equipment (photos/replicas)
☐ Connect to modern winter sports and activities
☐ Practice "glisser" with sliding motions across smooth surfaces
☐ Share: "Winter gives us special ways to jouer!"
☐ Discuss safe winter play rules`,
    specificAction: `(27 minutes)
Part 1 - Winter Sport Exploration (10 minutes):
☐ Learn about skiing, skating, sledding, snowshoeing
☐ Practice balance and sliding motions safely indoors
☐ Connect sports to "glisser" movements
☐ Explore how winter sports use snow and ice

Part 2 - Indoor Winter Olympics (12 minutes):
☐ Set up winter sport stations around classroom
☐ Cotton ball "snowball" toss for accuracy
☐ Balance beam "ice skating" with arms out
☐ "Sledding" on gym mats safely
☐ Practice: "J'aime glisser dans la neige!"

Part 3 - Traditional Games (5 minutes):
☐ Try simplified version of snow snake game
☐ Practice throwing soft objects for distance
☐ Learn teamwork through winter relay games`,
    specificConsolidation: `(10 minutes)
☐ Share favorite winter sport from today's activities
☐ Practice: "Je veux jouer dehors!" (I want to play outside!)
☐ Plan safe winter play for recess
☐ Thank each other for good sportsmanship
☐ Preview: "Tomorrow we build with snow!"`,
    materials: `• Balance beam or tape line for "skating" • Gym mats for safe sliding • Cotton balls for snowball toss
• Traditional winter games examples • Soft throwing objects • Target goals for accuracy games
• Timer for relay races • Winter sports photo cards • Safe indoor sliding materials
• Small prizes or stickers for participation • Camera for Olympic documentation`,
    learningGoals: "Students will learn winter activity vocabulary through active play while appreciating traditional Mi'kmaq winter games and developing safe winter recreation habits.",
    successCriteria: `☐ I can say "glisser" when demonstrating sliding motions
☐ I can say "jouer" when talking about winter play
☐ I can participate safely in winter activities
☐ I can work as a team in winter games`
  },

  {
    title: "Lesson 6: Construire avec la neige (Building with Snow)",
    date: new Date('2025-12-10'),
    topic: "exploring snow construction and winter creativity",
    vocabularyTerms: [
      { term: "construire", definition: "build - create something with our hands" },
      { term: "bonhomme de neige", definition: "snowman - friendly figure made from snow balls" }
    ],
    indigenousConnection: "Mi'kmaq people built sophisticated winter shelters and structures from snow and ice. Traditional snow houses provided emergency shelter during hunting trips, while ice fishing huts were constructed on frozen lakes. Children learned to read snow conditions for building - wet snow for packing, dry snow for insulation. Building with snow taught engineering skills, creativity, and the practical knowledge needed for winter survival in harsh Maritime climates.",
    specificMindsOn: `(8 minutes)
☐ Show photos of traditional Mi'kmaq winter shelters
☐ Connect to modern snow building: igloos, forts, snowmen
☐ Practice "construire" with building block motions
☐ Discuss: "What can we construire avec la neige?"
☐ Plan our classroom "bonhomme de neige" project`,
    specificAction: `(27 minutes)
Part 1 - Snow Building Science (10 minutes):
☐ Experiment with different "snow" materials: shaving cream, cotton, salt dough
☐ Test which materials pack together best
☐ Practice construction vocabulary with building actions
☐ Learn about snow engineering principles

Part 2 - Bonhomme de Neige Creation (12 minutes):
☐ Build classroom snowman using white materials
☐ Practice: "Nous construisons un bonhomme de neige!"
☐ Add face, buttons, hat, and scarf accessories
☐ Name our snowman with French name

Part 3 - Snow Architecture (5 minutes):
☐ Design dream snow fort with drawings
☐ Use blocks to build mini snow structures
☐ Practice: "Ma maison de neige est belle!"`,
    specificConsolidation: `(10 minutes)
☐ Admire our completed bonhomme de neige
☐ Practice snow building vocabulary with gestures
☐ Share ideas for real snow building outside
☐ Plan to look for good building snow
☐ Preview: "Tomorrow we learn winter shapes!"`,
    materials: `• Shaving cream or safe snow substitute • Cotton batting for snow effects • Salt dough for molding
• Building blocks and LEGOs • Snowman accessories (buttons, hat, scarf) • Traditional shelter photos
• Drawing paper for snow fort designs • Craft materials for decorating • Camera for building documentation
• Wet wipes for cleanup • Aprons for messy building activities`,
    learningGoals: "Students will practice construction vocabulary through hands-on building while learning about traditional Mi'kmaq winter engineering and developing creative problem-solving skills.",
    successCriteria: `☐ I can say "construire" when building activities
☐ I can say "bonhomme de neige" when making snowmen
☐ I can work cooperatively on building projects
☐ I can explain how snow can be used for construction`
  },

  // WEEK 3: Winter Shapes and Patterns
  {
    title: "Lesson 7: Les formes de l'hiver (Winter Shapes)",
    date: new Date('2025-12-15'),
    topic: "discovering geometric shapes in winter nature and decorations",
    vocabularyTerms: [
      { term: "étoile", definition: "star - six-pointed shape like snowflakes" },
      { term: "cercle", definition: "circle - round shape like the winter sun" }
    ],
    indigenousConnection: "Mi'kmaq traditional art and beadwork feature geometric patterns inspired by winter observations. Six-pointed star patterns represent snowflakes and the sacred number six in creation stories. Circular patterns symbolize the cycle of seasons and the winter moon. Traditional winter crafts incorporated these natural shapes, teaching children to see mathematics and beauty in the natural world around them, especially during the long winter months.",
    specificMindsOn: `(8 minutes)
☐ Display beautiful Mi'kmaq beadwork with geometric winter patterns
☐ Look for shapes in real snowflakes under magnifying glass
☐ Practice "étoile" while tracing six-pointed star shape
☐ Find "cercle" shapes in winter items: ornaments, sun, moon
☐ Share: "Winter is full of beautiful shapes!"`,
    specificAction: `(27 minutes)
Part 1 - Winter Shape Hunt (10 minutes):
☐ Search classroom for winter-related shapes
☐ Sort found objects by shape categories
☐ Practice naming shapes: "C'est une étoile!"
☐ Create shape collages with winter pictures

Part 2 - Snowflake Geometry (12 minutes):
☐ Make paper snowflakes focusing on six-sided symmetry
☐ Count points and sides on different snowflake designs
☐ Practice: "Mon étoile a six points!"
☐ Compare snowflakes to star shapes

Part 3 - Winter Pattern Art (5 minutes):
☐ Create Mi'kmaq-inspired winter patterns using shapes
☐ Use stamps and stencils for circle and star designs
☐ Practice describing patterns: "Cercle, étoile, cercle, étoile"`,
    specificConsolidation: `(10 minutes)
☐ Display our winter shape artwork proudly
☐ Practice shape vocabulary with body movements
☐ Count shapes in our winter decorations
☐ Plan shape hunt during outdoor winter observation
☐ Preview: "Tomorrow we explore winter colors!"`,
    materials: `• Real snowflakes for observation (if available) • Magnifying glasses • Mi'kmaq pattern examples
• Shape sorting materials • Paper for snowflake cutting • Shape stamps and stencils
• Winter-themed shape cutouts • Geometric pattern templates • Art supplies for decorating
• Camera for shape documentation • Chart paper for shape vocabulary`,
    learningGoals: "Students will identify and name geometric shapes in French through winter contexts while appreciating Mi'kmaq geometric art traditions and developing mathematical observation skills.",
    successCriteria: `☐ I can say "étoile" when pointing to star shapes
☐ I can say "cercle" when identifying round shapes
☐ I can find shapes in winter objects around me
☐ I can create patterns using winter shapes`
  },

  {
    title: "Lesson 8: Les couleurs de l'hiver (Winter Colors)",
    date: new Date('2025-12-16'),
    topic: "exploring the special colors that appear during winter season",
    vocabularyTerms: [
      { term: "blanc", definition: "white - the color of fresh snow and winter clouds" },
      { term: "argent", definition: "silver - shiny color like ice and frost" }
    ],
    indigenousConnection: "Mi'kmaq traditional teachings recognize that winter brings special colors with spiritual significance. White represents purity, new beginnings, and the clean slate that snow provides the earth. Silver symbolizes the moon's reflection on ice and the precious nature of winter survival. Traditional winter regalia incorporated these sacred colors, and elders taught children to appreciate the subtle beauty in winter's seemingly simple color palette.",
    specificMindsOn: `(8 minutes)
☐ Display winter color collection: white cotton, silver foil, ice crystals
☐ Share Mi'kmaq teaching about sacred winter colors
☐ Practice "blanc" while touching soft white materials
☐ Explore "argent" through shiny, reflective surfaces
☐ Look outside to identify winter colors in nature`,
    specificAction: `(27 minutes)
Part 1 - Winter Color Hunt (10 minutes):
☐ Search for white and silver items around classroom
☐ Create winter color sorting station
☐ Practice color words while handling different materials
☐ Compare winter colors to other seasons

Part 2 - Winter Color Art (12 minutes):
☐ Paint with white and silver watercolors
☐ Create winter landscapes using only winter colors
☐ Practice: "La neige est blanche comme..."
☐ Add glitter and metallic accents for silver effects

Part 3 - Color Memory Game (5 minutes):
☐ Play "I Spy" with winter colors
☐ Memory matching with winter color cards
☐ Practice: "Je vois quelque chose de blanc!"`,
    specificConsolidation: `(10 minutes)
☐ Share winter color artwork and explain choices
☐ Practice winter color vocabulary with actions
☐ Discuss how winter colors make us feel
☐ Plan to notice winter colors during outdoor time
☐ Preview: "Tomorrow we cook winter treats!"`,
    materials: `• White and silver art materials (paint, paper, fabric) • Reflective materials (mirrors, foil, metallic items)
• Natural winter color examples • Magnifying glasses for close observation • Mi'kmaq winter regalia photos
• Color sorting containers • Glitter and metallic art supplies • Camera for color documentation
• Color matching games • Chart paper for color vocabulary display`,
    learningGoals: "Students will identify and appreciate winter colors in French while understanding their cultural significance in Mi'kmaq traditions and developing artistic color awareness.",
    successCriteria: `☐ I can say "blanc" when identifying white objects
☐ I can say "argent" when pointing to silver items
☐ I can find winter colors in nature and art
☐ I can use winter colors to create beautiful artwork`
  },

  {
    title: "Lesson 9: Cuisiner en hiver (Winter Cooking)",
    date: new Date('2025-12-17'),
    topic: "exploring traditional winter foods and simple winter cooking",
    vocabularyTerms: [
      { term: "chaud", definition: "hot - warm temperature that feels good in winter" },
      { term: "soupe", definition: "soup - warm liquid food perfect for cold days" }
    ],
    indigenousConnection: "Mi'kmaq winter cooking traditions focused on preserved foods and warming dishes that provided energy during cold months. Traditional winter soups included game meats, root vegetables, and preserved berries. Hot herbal teas made from wintergreen and Labrador tea warmed the body and spirit. Communal cooking brought families together during long winter evenings, sharing stories and strengthening bonds while preparing nourishing meals.",
    specificMindsOn: `(8 minutes)
☐ Smell warm, inviting winter scents: cinnamon, hot chocolate, soup
☐ Share Mi'kmaq winter cooking traditions and preserved foods
☐ Practice "chaud" while feeling warm mugs (empty, just for warmth)
☐ Discuss: "What foods help us feel chaud in winter?"
☐ Introduce making classroom winter "soupe"`,
    specificAction: `(27 minutes)
Part 1 - Winter Food Exploration (10 minutes):
☐ Sort foods into winter/summer categories
☐ Identify ingredients that warm us up
☐ Practice food vocabulary: "La soupe est chaude!"
☐ Learn about traditional Mi'kmaq preserved foods

Part 2 - Simple Winter Cooking (12 minutes):
☐ Make instant hot chocolate or warm apple cider (safe, no-cook)
☐ Prepare simple trail mix with winter energy foods
☐ Practice measuring and mixing safely
☐ Use cooking vocabulary: "Nous mélangeons la soupe"

Part 3 - Winter Feast Sharing (5 minutes):
☐ Share our warm drinks and snacks together
☐ Practice: "C'est délicieux et chaud!"
☐ Thank each other for cooking cooperation`,
    specificConsolidation: `(10 minutes)
☐ Clean up cooking area together
☐ Practice winter food vocabulary
☐ Share favorite winter foods from home
☐ Plan winter cooking to try at home with families
☐ Preview: "Tomorrow we learn winter clothing care!"`,
    materials: `• Instant hot chocolate or apple cider mix • Trail mix ingredients (nuts, dried fruit)
• Measuring cups and spoons • Mixing bowls and spoons • Traditional Mi'kmaq food examples or photos
• Hot water thermos (teacher use only) • Small cups for tasting • Chart paper for food vocabulary
• Napkins and wet wipes for cleanup • Camera for cooking documentation`,
    learningGoals: "Students will learn winter food vocabulary through safe cooking activities while appreciating traditional Mi'kmaq winter nutrition knowledge and developing cooperation skills.",
    successCriteria: `☐ I can say "chaud" when describing warm foods
☐ I can say "soupe" when talking about winter meals
☐ I can help prepare simple winter foods safely
☐ I can share food respectfully with classmates`
  },

  // WEEK 4: Winter Care and Reflection
  {
    title: "Lesson 10: Prendre soin en hiver (Winter Care)",
    date: new Date('2025-12-22'),
    topic: "learning to care for ourselves and others during winter",
    vocabularyTerms: [
      { term: "soin", definition: "care - being gentle and helpful to others" },
      { term: "aider", definition: "help - assist someone who needs support" }
    ],
    indigenousConnection: "Mi'kmaq winter survival depended on community care and mutual support. During harsh winter months, families shared resources, checked on elders, and helped those in need. Traditional teachings emphasized that winter tested the strength of community bonds. Children learned that caring for others during difficult times was not just kindness but essential for everyone's survival and wellbeing. This spirit of mutual aid defined Mi'kmaq winter culture.",
    specificMindsOn: `(8 minutes)
☐ Share stories of Mi'kmaq winter community care traditions
☐ Discuss how winter makes caring for others extra important
☐ Practice "soin" with gentle, caring gestures
☐ Share: "In winter, we aider each other stay warm and safe"
☐ Plan acts of winter kindness for our classroom`,
    specificAction: `(27 minutes)
Part 1 - Winter Care Actions (10 minutes):
☐ Practice helping classmates with winter clothing
☐ Learn to check if friends are warm enough
☐ Practice saying: "As-tu besoin d'aide?" (Do you need help?)
☐ Demonstrate gentle care with class stuffed animals

Part 2 - Kindness Projects (12 minutes):
☐ Make winter care cards for school helpers
☐ Create "Acts of Soin" chart for classroom
☐ Practice winter helping actions: sharing, assisting, comforting
☐ Plan surprise kindness for another class

Part 3 - Winter Comfort Station (5 minutes):
☐ Set up cozy reading corner with winter blankets
☐ Practice: "Je prends soin de mes amis"
☐ Share comfort items and stories`,
    specificConsolidation: `(10 minutes)
☐ Share one way we can aider others this winter
☐ Practice winter care vocabulary with actions
☐ Plan daily acts of winter kindness
☐ Thank each other for caring attitudes
☐ Preview: "Tomorrow we learn about winter animals' homes!"`,
    materials: `• Soft blankets for comfort station • Card-making supplies for kindness cards • Class stuffed animals for care practice
• Chart paper for kindness tracking • Mi'kmaq community care stories • Gentle music for caring atmosphere
• Camera for kindness documentation • Thank you stickers • Cozy pillows for reading corner`,
    learningGoals: "Students will practice caring vocabulary through acts of kindness while understanding the importance of community support and developing empathy for others' winter needs.",
    successCriteria: `☐ I can say "soin" when talking about caring actions
☐ I can say "aider" when helping classmates
☐ I can notice when others need help in winter
☐ I can show kindness to others in our classroom`
  },

  {
    title: "Lesson 11: Les maisons des animaux (Animal Homes)",
    date: new Date('2025-01-06'),
    topic: "exploring where different animals live and sleep during winter",
    vocabularyTerms: [
      { term: "maison", definition: "house - place where someone lives safely" },
      { term: "abri", definition: "shelter - protection from cold and snow" }
    ],
    indigenousConnection: "Mi'kmaq traditional knowledge includes detailed understanding of animal winter homes and shelters. Elders taught children to observe beaver lodges, bear dens, bird nests, and rabbit warrens. This knowledge helped hunters and travelers understand animal behavior and find their own shelter when needed. Learning about animal homes taught respect for all creatures and the wisdom of preparing safe, warm places to weather winter storms.",
    specificMindsOn: `(8 minutes)
☐ Display photos of various animal winter homes
☐ Share Mi'kmaq teaching about animal shelter wisdom
☐ Practice "maison" while making house shape with hands
☐ Discuss: "Where do animals find abri from winter cold?"
☐ Connect animal homes to our own warm classroom`,
    specificAction: `(27 minutes)
Part 1 - Animal Home Investigation (10 minutes):
☐ Match animals to their winter homes: den, nest, burrow, lodge
☐ Build animal homes with blocks and natural materials
☐ Practice: "L'ours vit dans sa maison"
☐ Explore how different animals stay warm

Part 2 - Habitat Creation (12 minutes):
☐ Create cozy animal homes in classroom corners
☐ Use pillows, blankets, and boxes for different shelters
☐ Practice animal movements to their homes
☐ Add "Bienvenue" signs to animal homes

Part 3 - Animal Care Game (5 minutes):
☐ Role-play helping animals find winter shelter
☐ Practice: "Les animaux ont besoin d'un abri"
☐ Create winter animal safety rules`,
    specificConsolidation: `(10 minutes)
☐ Tour our classroom animal habitat creations
☐ Practice animal home vocabulary with gestures
☐ Share which animal home is most interesting
☐ Plan to look for real animal homes outside
☐ Preview: "Tomorrow we learn about winter helpers!"`,
    materials: `• Animal home photos and diagrams • Building blocks and natural materials • Pillows and blankets for habitats
• Small toy animals for demonstration • Mi'kmaq animal shelter knowledge examples • Chart paper for animal matching
• Craft materials for home building • Camera for habitat documentation`,
    learningGoals: "Students will learn shelter vocabulary through animal habitat exploration while appreciating Mi'kmaq ecological knowledge and developing respect for wildlife winter survival.",
    successCriteria: `☐ I can say "maison" when talking about animal homes
☐ I can say "abri" when describing shelter
☐ I can match animals to their winter homes
☐ I can explain why animals need warm, safe places in winter`
  },

  {
    title: "Lesson 12: Les aides de l'hiver (Winter Helpers)",
    date: new Date('2025-01-07'),
    topic: "recognizing people who help keep us safe and warm in winter",
    vocabularyTerms: [
      { term: "pompier", definition: "firefighter - person who keeps us safe from fire" },
      { term: "merci", definition: "thank you - words to show appreciation" }
    ],
    indigenousConnection: "Mi'kmaq communities relied on designated winter helpers who ensured everyone's safety during harsh weather. Traditional snow readers predicted storms, ice fishing guides kept people safe on frozen waters, and fire keepers maintained crucial warmth. These winter helpers were honored community members whose skills and dedication kept everyone alive during dangerous winter conditions. Community gratitude and respect for these helpers was essential for survival.",
    specificMindsOn: `(8 minutes)
☐ Share stories of traditional Mi'kmaq winter community helpers
☐ Connect to modern winter helpers: snow plow drivers, firefighters, paramedics
☐ Practice "merci" with grateful gestures and tone
☐ Discuss: "Who helps keep us safe when it's cold and snowy?"
☐ Plan to recognize winter helpers in our community`,
    specificAction: `(27 minutes)
Part 1 - Winter Helper Recognition (10 minutes):
☐ Learn about different winter helper jobs and tools
☐ Practice safety vocabulary: "Le pompier nous protège"
☐ Connect helpers to winter challenges they solve
☐ Role-play being grateful community members

Part 2 - Thank You Projects (12 minutes):
☐ Create thank you cards for local winter helpers
☐ Draw pictures of helpers in action during winter
☐ Practice: "Merci beaucoup pour votre aide!"
☐ Plan winter helper appreciation delivery

Part 3 - Helper Appreciation Circle (5 minutes):
☐ Share gratitude for winter helpers in our lives
☐ Practice expressing thanks in French
☐ Plan ways to help others during winter`,
    specificConsolidation: `(10 minutes)
☐ Review all winter helpers we learned about
☐ Practice saying "merci" with sincere appreciation
☐ Plan delivery of thank you cards to community helpers
☐ Share how we can be winter helpers too
☐ Preview: "Tomorrow we review all our winter learning!"`,
    materials: `• Photos of community winter helpers at work • Thank you card making supplies • Helper uniform pieces for role play
• Community helper books in French • Chart paper for helper vocabulary • Mi'kmaq winter helper stories
• Drawing supplies for appreciation art • Camera for helper documentation • Gratitude circle talking piece`,
    learningGoals: "Students will recognize and appreciate winter community helpers while learning gratitude vocabulary and understanding the importance of community cooperation during winter.",
    successCriteria: `☐ I can name different winter helpers like pompier
☐ I can say "merci" to express genuine appreciation
☐ I can explain how winter helpers keep us safe
☐ I can think of ways to help others during winter`
  },

  // WEEK 5: Winter Celebration and Assessment
  {
    title: "Lesson 13: Révision de l'hiver (Winter Review)",
    date: new Date('2025-01-08'),
    topic: "reviewing and celebrating all winter vocabulary and experiences",
    vocabularyTerms: [
      { term: "hiver", definition: "winter - the cold season full of snow and magic" },
      { term: "apprendre", definition: "learn - discover new things about the world" }
    ],
    indigenousConnection: "Mi'kmaq traditional education included regular reflection on seasonal learning, where elders helped children connect their experiences to deeper understanding. Winter learning circles allowed community members to share what they had discovered about survival, nature, and community during the harsh months. This reflection process honored the growth that came from facing winter's challenges and celebrated the wisdom gained through seasonal experiences.",
    specificMindsOn: `(8 minutes)
☐ Create winter learning circle with all our winter artifacts
☐ Share Mi'kmaq tradition of seasonal learning reflection
☐ Practice "hiver" while pointing to winter learning displays
☐ Discuss: "What did we apprendre about winter this month?"
☐ Set celebration tone for reviewing our winter journey`,
    specificAction: `(27 minutes)
Part 1 - Winter Vocabulary Celebration (10 minutes):
☐ Play winter vocabulary games with all learned words
☐ Practice pronunciation with winter action songs
☐ Create winter word web showing all connections
☐ Celebrate how much French we learned about hiver

Part 2 - Winter Memory Stations (12 minutes):
☐ Station 1: Winter weather and clothing vocabulary
☐ Station 2: Winter animals and their homes
☐ Station 3: Winter activities and celebrations
☐ Station 4: Winter helpers and kindness actions

Part 3 - Winter Learning Gallery (5 minutes):
☐ Display all winter projects and artwork
☐ Practice describing winter learning to visitors
☐ Vote on favorite winter learning memory`,
    specificConsolidation: `(10 minutes)
☐ Share most surprising thing we learned about hiver
☐ Practice all winter vocabulary in final celebration chant
☐ Thank each other for being wonderful winter learning partners
☐ Plan winter learning to continue at home
☐ Preview: "Tomorrow we celebrate our winter achievements!"`,
    materials: `• All winter learning artifacts and displays • Winter vocabulary game materials • Chart paper for word web
• Station rotation materials • Voting materials for favorites • Mi'kmaq learning circle examples
• Camera for celebration documentation • Winter celebration music • Thank you cards for classmates`,
    learningGoals: "Students will demonstrate mastery of winter vocabulary while reflecting on their learning growth and celebrating their achievements with pride and gratitude.",
    successCriteria: `☐ I can use most winter vocabulary correctly
☐ I can explain something I learned about hiver
☐ I can celebrate my learning progress with pride
☐ I can share my favorite winter learning memory`
  },

  {
    title: "Lesson 14: Célébration magique (Magical Celebration)",
    date: new Date('2025-01-09'),
    topic: "celebrating winter learning achievements with families and community",
    vocabularyTerms: [
      { term: "magique", definition: "magical - wonderful and full of special beauty" },
      { term: "réussir", definition: "succeed - accomplish something we worked hard for" }
    ],
    indigenousConnection: "Mi'kmaq winter celebrations honored the community's success in surviving and thriving during the challenging winter season. These gatherings included sharing winter stories, demonstrating skills learned, and expressing gratitude for community support. Children showcased their growth and learning while elders celebrated their achievements. These celebrations strengthened community bonds and marked the transition toward spring with hope and accomplishment.",
    specificMindsOn: `(8 minutes)
☐ Welcome families to our winter learning celebration
☐ Share Mi'kmaq tradition of winter achievement celebrations
☐ Practice "magique" while pointing to winter wonderland displays
☐ Express: "Nous avons réussir à apprendre beaucoup!"
☐ Set joyful tone for sharing our winter journey`,
    specificAction: `(27 minutes)
Part 1 - Learning Demonstrations (12 minutes):
☐ Students demonstrate winter vocabulary to families
☐ Show winter weather vocabulary with actions
☐ Name winter animals and their homes
☐ Demonstrate winter clothing and safety knowledge

Part 2 - Winter Performance Showcase (10 minutes):
☐ Sing winter songs learned during the unit
☐ Share winter poems and stories created
☐ Demonstrate winter animal movements and sounds
☐ Present winter kindness projects to families

Part 3 - Family Winter Sharing (5 minutes):
☐ Families share observations about winter learning growth
☐ Exchange winter vocabulary cards for home practice
☐ Plan family winter activities using French vocabulary`,
    specificConsolidation: `(10 minutes)
☐ Students share what makes winter "magique" for them
☐ Families celebrate how much students have "réussir"
☐ Exchange gratitude for wonderful winter learning journey
☐ Plan continued winter French exploration at home
☐ Preview: "Tomorrow we assess our magical winter learning!"`,
    materials: `• Family invitation cards for celebration • Winter learning demonstration props • Student winter artwork displays
• Winter vocabulary cards for families • Celebration decorations • Camera for family celebration photos
• Guest seating for family members • Light winter refreshments • Performance area setup
• Microphone or speaker if available • Thank you cards for family support`,
    learningGoals: "Students will demonstrate their winter French learning proudly to families while celebrating community achievements and building excitement for continued learning.",
    successCriteria: `☐ I can demonstrate winter French vocabulary to my family
☐ I can say learning about hiver was "magique"
☐ I can help welcome families to our celebration
☐ I can explain what I want to learn next about winter`
  },

  {
    title: "Lesson 15: Portfolio d'hiver (Winter Portfolio)",
    date: new Date('2025-01-10'),
    topic: "creating comprehensive winter learning portfolios and setting spring goals",
    vocabularyTerms: [
      { term: "souvenir", definition: "memory - something special we remember" },
      { term: "grandir", definition: "grow - become bigger and learn more" }
    ],
    indigenousConnection: "Mi'kmaq tradition includes creating winter memory bundles that preserve the season's teachings and experiences for future reference. These collections honored the learning journey and served as reminders of growth achieved during challenging times. Winter portfolios helped community members remember important lessons and prepare for the coming seasons with greater wisdom and confidence.",
    specificMindsOn: `(8 minutes)
☐ Display examples of Mi'kmaq memory bundles and seasonal collections
☐ Connect to our winter portfolio as learning "souvenir" collection
☐ Practice "grandir" with growing motions showing learning progress
☐ Share: "Our portfolios show how we grandir during hiver"
☐ Set intention to create meaningful winter learning collection`,
    specificAction: `(27 minutes)
Part 1 - Portfolio Assembly (12 minutes):
☐ Organize winter work samples by learning themes
☐ Add photos of winter activities and celebrations
☐ Include self-reflection pages about winter growth
☐ Create personalized portfolio cover with winter designs

Part 2 - Learning Reflection (10 minutes):
☐ Draw pictures of favorite winter learning memories
☐ Practice: "Mon meilleur souvenir d'hiver est..."
☐ Choose goals for spring learning
☐ Plan sharing portfolio with families

Part 3 - Portfolio Sharing Circle (5 minutes):
☐ Share favorite portfolio pieces with classmates
☐ Practice explaining winter learning growth
☐ Celebrate diverse learning journeys and achievements`,
    specificConsolidation: `(10 minutes)
☐ Admire completed winter portfolios with pride
☐ Practice sharing portfolios confidently with families
☐ Commit to spring learning goals
☐ Thank classmates for wonderful winter learning partnership
☐ Celebrate successful completion of "L'hiver magique" unit`,
    materials: `• Portfolio folders and organizing materials • Winter learning work samples • Photos of winter unit activities
• Self-reflection templates with winter themes • Art supplies for portfolio decoration • Goal-setting worksheets
• Laminating materials for preservation • Hole punch and organizational supplies • Celebration stickers for achievements
• Camera for final winter documentation • Thank you cards for families`,
    learningGoals: "Students will create comprehensive winter learning portfolios that demonstrate their growth and establish meaningful goals for continued French learning development.",
    successCriteria: `☐ I can organize my winter portfolio with pride
☐ I can explain how I grandir during our winter unit
☐ I can share my favorite winter learning souvenirs
☐ I can set goals for spring learning with excitement`
  }
];

async function createHiverLesson(lessonData: LessonData, unitPlanId: string, userId: number) {
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
☐ Observation during minds on winter discussion - note prior knowledge and engagement
☐ Anecdotal notes during winter activity participation - document skill development and cooperation
☐ Checklist for French winter vocabulary usage - track pronunciation and contextual understanding
☐ Student self-assessment during consolidation - encourage reflection on winter learning

Success Criteria Observations:
☐ Demonstrates understanding of winter concepts (meets/approaching/needs support)
☐ Uses French winter vocabulary appropriately in context (meets/approaching/needs support)
☐ Participates respectfully in winter activities and discussions (meets/approaching/needs support)
☐ Shows progress toward winter learning goals (meets/approaching/needs support)
☐ Connects learning to Mi'kmaq winter perspectives appropriately (meets/approaching/needs support)`,
      
      differentiationStrategies: {
        forStruggling: "Provide visual winter vocabulary supports with pictures, simplified winter activity instructions, peer partners for winter games, hands-on winter manipulatives, reduced task complexity for winter projects, extra processing time, and frequent check-ins for understanding winter concepts",
        forIEP: "Modified winter expectations as outlined in individual education plan, assistive technology support for winter vocabulary, alternative demonstration methods for winter learning, extended time allocations for winter activities, modified assessment criteria for winter concepts, and dedicated one-on-one support during winter lessons",
        forELL: "Visual winter vocabulary cards with pictures and translations, bilingual dictionaries for winter terms, sentence frames for winter oral practice, peer translation support during winter activities, gestures and demonstrations for winter concepts, home language connections to winter traditions, and culturally relevant winter examples",
        forAdvanced: "Extension activities with expanded winter vocabulary, leadership roles in winter group activities, independent winter research projects about Mi'kmaq traditions, creation of winter teaching materials for peers, cross-curricular winter connections to science and social studies, and mentoring opportunities during winter activities"
      },
      
      indigenousPerspectives: lessonData.indigenousConnection,
      
      reflectionActivities: {
        teacherReflection: `• How effectively did students engage with winter French vocabulary and concepts today?
• Which students demonstrated strong progress in winter learning and which need additional support?
• How can I adjust tomorrow's winter lesson based on today's observations and student responses?
• What extension opportunities would challenge advanced learners appropriately with winter content?
• How well did the Mi'kmaq winter perspectives connect meaningfully to the learning goals?
• What aspects of winter activity differentiation were most successful for diverse learners?
• How did students respond to the hands-on winter learning experiences?`,
        crossCurricular: `• Language Arts: Winter vocabulary development, oral communication about winter experiences, listening comprehension
• Mathematics: Winter counting activities, geometric shapes in snowflakes, measuring winter temperatures
• Arts: Winter creative expression, seasonal art projects, cultural winter art connections
• Social Studies: Winter community helpers, cultural winter celebrations, respect for diverse winter traditions
• Science: Winter weather observation, animal winter adaptations, seasonal changes and patterns
• Health: Winter safety practices, social-emotional learning through winter cooperation, winter nutrition awareness`
      }
    }
  });
}

async function main() {
  try {
    console.log('❄️ Starting L\'hiver magique lesson creation...');
    
    // Find Emily's user record
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily user not found. Please ensure user exists with email emmcisaac@gmail.com');
    }
    
    console.log(`✅ Found Emily (ID: ${emily.id})`);
    
    // Find the "L'hiver magique" unit plan
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        title: 'L\'hiver magique',
        userId: emily.id
      }
    });
    
    if (!unitPlan) {
      throw new Error('L\'hiver magique unit plan not found for Emily');
    }
    
    console.log(`✅ Found unit plan "${unitPlan.title}" (ID: ${unitPlan.id})`);
    
    // Delete existing lessons for this unit (if any)
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unitPlan.id }
    });
    
    console.log('🗑️ Cleared existing lessons for unit');
    
    // Create all 15 perfect winter lessons
    console.log('❄️ Creating 15 perfect ETFO-compliant winter lessons...');
    
    let createdCount = 0;
    for (const lessonData of lessons) {
      await createHiverLesson(lessonData, unitPlan.id, emily.id);
      createdCount++;
      console.log(`✅ Created lesson ${createdCount}/15: ${lessonData.title}`);
    }
    
    console.log(`\n🎉 SUCCESS! Created ${createdCount} perfect Grade 1 French Immersion winter lessons`);
    console.log('\n📋 Winter Lesson Summary:');
    console.log('• Duration: 45 minutes each (ETFO compliant)');
    console.log('• Structure: Minds On (8min) + Action (27min) + Consolidation (10min)');
    console.log('• Vocabulary: 2-3 French winter terms per lesson (Grade 1 appropriate)');
    console.log('• Assessment: Observable with ☐ checkboxes');
    console.log('• Differentiation: JSON format with all 4 learner types');
    console.log('• Indigenous Perspectives: 100+ characters Mi\'kmaq winter connections');
    console.log('• Materials: Comprehensive lists for each winter lesson');
    
    console.log('\n❄️ December 2025 - January 2026 Winter Schedule:');
    console.log('Week 1 (Dec 1-3): Winter weather, clothing, holiday celebrations');
    console.log('Week 2 (Dec 8-10): Winter animals, sports, snow construction');
    console.log('Week 3 (Dec 15-17): Winter shapes, colors, cooking');
    console.log('Week 4 (Dec 22, Jan 6-7): Winter care, animal homes, helpers');
    console.log('Week 5 (Jan 8-10): Winter review, celebration, portfolio creation');
    
    console.log('\n🌟 Featured Winter Learning Themes:');
    console.log('• Winter weather vocabulary and safety');
    console.log('• Traditional Mi\'kmaq winter survival knowledge');
    console.log('• Winter clothing and seasonal preparation');
    console.log('• Holiday traditions and cultural celebrations');
    console.log('• Winter animals and their adaptations');
    console.log('• Winter sports and traditional games');
    console.log('• Snow construction and winter creativity');
    console.log('• Winter community helpers and gratitude');
    console.log('• Seasonal reflection and portfolio development');
    
  } catch (error) {
    console.error('❌ Error creating L\'hiver magique lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script when run directly
main()
  .then(() => {
    console.log('\n✨ L\'hiver magique lessons created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });

export default main;