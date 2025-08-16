/**
 * PERFECT GRADE 1 FRENCH IMMERSION LESSON GENERATOR
 * Unit: "Bienvenue à l'école!" (Welcome to School)
 * 
 * Creates 16 ETFO-compliant lessons for September 2025
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

// 16 Perfect Lessons for "Bienvenue à l'école!"
const lessons: LessonData[] = [
  // WEEK 1: Classroom Foundation
  {
    title: "Lesson 1: Notre nouvelle classe (Our New Classroom)",
    date: new Date('2025-09-02'),
    topic: "exploring our classroom environment and establishing sense of belonging",
    vocabularyTerms: [
      { term: "classe", definition: "classroom where we learn together" },
      { term: "bienvenue", definition: "welcome - a friendly greeting" }
    ],
    indigenousConnection: "In Mi'kmaq tradition, learning spaces are sacred places where knowledge keepers share wisdom with the community. The talking circle represents respect, where each voice matters and everyone belongs. We will create our classroom as a welcoming circle where all students are valued members of our learning community.",
    specificMindsOn: `(8 minutes)
☐ Welcome students at the door with "Bienvenue!" 
☐ Form a welcome circle on the carpet
☐ Share: "Today we discover our special learning space"
☐ Ask: "What makes a place feel welcoming?"
☐ Introduce our classroom as our learning lodge`,
    specificAction: `(27 minutes)
Part 1 - Classroom Tour (10 minutes):
☐ Walk through each learning centre together
☐ Touch and explore classroom materials safely
☐ Name special areas: reading corner, art station, math manipulatives
☐ Practice saying "classe" when pointing to our room

Part 2 - Belonging Badges (12 minutes):
☐ Create name badges with Mi'kmaq-inspired designs
☐ Students draw something that makes them happy
☐ Share badges in pairs using "Bienvenue [name]"
☐ Post badges on our Welcome Wall

Part 3 - Space Practice (5 minutes):
☐ Practice moving safely between areas
☐ Use quiet voices in our "classe"
☐ Demonstrate carpet gathering signal`,
    specificConsolidation: `(10 minutes)
☐ Return to welcome circle formation
☐ Each student shares one thing they discovered
☐ Practice our new words: "bienvenue" and "classe"
☐ End with Mi'kmaq greeting gesture: hands to heart
☐ Preview: "Tomorrow we meet our classmates!"`,
    materials: `• Welcome circle mat • Name badge materials (cardstock, markers, Mi'kmaq pattern examples)
• Classroom labels in French • Welcome banner • Soft music for transitions
• Camera for documentation • Hand sanitizer • Tissues
• Chart paper for recording discoveries • Mi'kmaq greeting poster`,
    learningGoals: "Students will feel welcomed and secure in their new classroom environment while beginning to use basic French vocabulary.",
    successCriteria: `☐ I can find different areas in our classroom
☐ I can say "bienvenue" and "classe" 
☐ I can move safely around our learning space
☐ I feel like I belong in our classroom community`
  },

  {
    title: "Lesson 2: Rencontrer nos amis (Meeting Our Friends)",
    date: new Date('2025-09-03'),
    topic: "building classroom community through introductions and friendship connections",
    vocabularyTerms: [
      { term: "ami", definition: "friend - someone we care about" },
      { term: "bonjour", definition: "hello - a friendly morning greeting" }
    ],
    indigenousConnection: "Mi'kmaq communities value the interconnectedness of all people, represented by the medicine wheel's teaching that we are all related. Traditional introductions include sharing your clan, family connections, and gifts you bring to the community. Today we honor this tradition by sharing what makes each student special and connected to our classroom family.",
    specificMindsOn: `(8 minutes)
☐ Greet students individually with "Bonjour [name]!"
☐ Sit in friendship circle with talking stone
☐ Share: "Today we become friends and learn about each other"
☐ Model Mi'kmaq introduction: name, family, special gift
☐ Pass talking stone for each child to say "Bonjour"`,
    specificAction: `(27 minutes)
Part 1 - Friend Introductions (10 minutes):
☐ Students share in pairs: name, favorite thing, family pet/hobby
☐ Practice greeting: "Bonjour! Je suis [name]"
☐ Create simple gestures for "ami" (hand on heart)
☐ Partners introduce each other to the circle

Part 2 - Friendship Web (12 minutes):
☐ Stand in circle holding yarn ball
☐ Toss yarn while saying "Bonjour [friend's name]"
☐ Create physical web showing our connections
☐ Discuss how we're all connected as "amis"

Part 3 - Friendship Cards (5 minutes):
☐ Draw picture of new friend made today
☐ Write "Mon ami" and friend's name
☐ Present cards to new friends`,
    specificConsolidation: `(10 minutes)
☐ Admire our friendship web together
☐ Practice: "Bonjour mon ami!" with gestures
☐ Share one thing learned about a new friend
☐ Carefully wind up friendship web to save
☐ Preview: "Tomorrow we explore our whole school!"`,
    materials: `• Talking stone/special object • Yarn ball for friendship web • Friendship card templates
• Name tags with pronunciation guides • Soft background music • Mi'kmaq community photos
• Chart paper for friend names • Markers/crayons • Camera for memories
• Laminated greeting phrases • Hand wipes • Carpet squares for circle`,
    learningGoals: "Students will build positive relationships with classmates while practicing French greetings and friendship vocabulary.",
    successCriteria: `☐ I can greet friends with "Bonjour"
☐ I can say "ami" when talking about friends
☐ I can share something about myself respectfully
☐ I can listen when others are speaking`
  },

  {
    title: "Lesson 3: Explorer notre école (Exploring Our School)",
    date: new Date('2025-09-04'),
    topic: "discovering school spaces and building familiarity with the school environment",
    vocabularyTerms: [
      { term: "école", definition: "school - our place of learning" },
      { term: "porte", definition: "door - the way to enter spaces" }
    ],
    indigenousConnection: "Mi'kmaq traditional education happened through exploration of the natural world, where every place held teachings and stories. Elders would guide children through the landscape, sharing knowledge about each location's significance. Our school tour honors this tradition as we discover the special places in our learning environment and the helpers who care for our community.",
    specificMindsOn: `(8 minutes)
☐ Start at classroom door, point and say "porte"
☐ Show school map with pictures of key locations
☐ Share: "Our école is full of helpful people and special places"
☐ Practice walking in line like respectful visitors
☐ Set expectations for quiet voices during tour`,
    specificAction: `(27 minutes)
Part 1 - School Tour (15 minutes):
☐ Visit office: meet secretary, practice "Bonjour!"
☐ Library: see French books, meet librarian
☐ Gym: demonstrate safe walking
☐ Bathroom locations and proper use
☐ Playground rules and equipment
☐ Practice saying "école" at each location

Part 2 - Helper Helpers (7 minutes):
☐ Draw pictures of school helpers we met
☐ Label with names and jobs
☐ Practice greeting each helper type
☐ Create "Our École" class book

Part 3 - Safe Routes (5 minutes):
☐ Practice walking from classroom to bathroom
☐ Review emergency procedures simply
☐ Count "portes" we pass through`,
    specificConsolidation: `(10 minutes)
☐ Return to classroom circle
☐ Share favorite place discovered in our "école"
☐ Practice opening and closing a "porte" quietly
☐ Review names of helpers we met
☐ Preview: "Tomorrow we learn our classroom rules!"`,
    materials: `• Simple school map with pictures • Clipboards for drawing • Small notebooks for sketches
• School helper photos • Hand sanitizer • Tissues • Pencils and erasers
• Camera for documentation • Stickers for good walking • Thank you cards for helpers
• Laminated school vocabulary cards • Safety whistle • First aid kit`,
    learningGoals: "Students will navigate the school confidently while learning vocabulary for school spaces and showing respect for school community members.",
    successCriteria: `☐ I can find important places in our école
☐ I can open and close a porte quietly
☐ I can greet school helpers politely
☐ I can walk safely in the hallways`
  },

  {
    title: "Lesson 4: Nos règles de classe (Our Classroom Rules)",
    date: new Date('2025-09-05'),
    topic: "co-creating classroom expectations and understanding the importance of community agreements",
    vocabularyTerms: [
      { term: "règles", definition: "rules - agreements that help us learn together" },
      { term: "respect", definition: "respect - treating others with kindness" }
    ],
    indigenousConnection: "In Mi'kmaq communities, traditional laws come from the natural world and emphasize respect for all living things. The Seven Sacred Teachings guide behavior: wisdom, love, respect, courage, honesty, humility, and truth. These teachings help people live in harmony. We will create our classroom rules based on these sacred teachings to build a respectful learning community.",
    specificMindsOn: `(8 minutes)
☐ Sit in sacred teaching circle formation
☐ Share eagle feather or special talking piece
☐ Discuss: "What helps a community live in harmony?"
☐ Introduce Mi'kmaq teaching about "respect" for all
☐ Connect to our classroom as a learning community`,
    specificAction: `(27 minutes)
Part 1 - Sacred Teaching Rules (10 minutes):
☐ Present three key classroom needs: safety, learning, respect
☐ Students suggest "règles" for each area
☐ Draw simple pictures for each rule
☐ Practice saying "respect" with gesture (hands to heart)

Part 2 - Rule Posters (12 minutes):
☐ Small groups create visual rule reminders
☐ Use symbols and simple French words
☐ Include Mi'kmaq-inspired border designs
☐ Practice explaining each rule to others

Part 3 - Community Agreement (5 minutes):
☐ Sign classroom agreement together
☐ Commit to following our "règles"
☐ Create special handshake for rule reminders`,
    specificConsolidation: `(10 minutes)
☐ Display completed rule posters prominently
☐ Practice our rule reminder handshake
☐ Each student names one "règle" they'll follow
☐ Celebrate creating our learning agreement
☐ Preview: "Next week we learn French greetings!"`,
    materials: `• Large poster paper • Markers and crayons • Special talking piece • Eagle feather (or equivalent)
• Mi'kmaq pattern examples • Stickers for signatures • Laminating sheets
• Sacred teachings poster • Community agreement template • Border decoration materials
• Camera for documentation • Chart stand • Glue sticks`,
    learningGoals: "Students will understand classroom expectations and commit to respectful behavior while learning about Indigenous principles of community living.",
    successCriteria: `☐ I can name our classroom règles
☐ I can show respect to others
☐ I can follow our community agreement
☐ I can help remind others of our rules kindly`
  },

  // WEEK 2: French Language Foundation
  {
    title: "Lesson 5: Salutations françaises (French Greetings)",
    date: new Date('2025-09-08'),
    topic: "mastering essential French greetings for daily classroom communication",
    vocabularyTerms: [
      { term: "salut", definition: "hi - a casual friendly greeting" },
      { term: "au revoir", definition: "goodbye - what we say when leaving" }
    ],
    indigenousConnection: "In Mi'kmaq culture, greetings acknowledge the spirit within each person and honor their presence in the community. Traditional greetings express gratitude for meeting and shared time together. The phrase 'Kwe' means 'hello' and shows respect for the other person's journey. We will practice French greetings with this same spirit of respect and acknowledgment of each other's importance.",
    specificMindsOn: `(8 minutes)
☐ Welcome students with enthusiastic "Salut!"
☐ Demonstrate Mi'kmaq greeting "Kwe" and meaning
☐ Connect to French greetings showing respect
☐ Practice responding to "Salut!" with "Salut!"
☐ Share goal: become greeting experts today`,
    specificAction: `(27 minutes)
Part 1 - Greeting Practice (10 minutes):
☐ Model "Salut!" with happy wave and smile
☐ Practice greeting each classmate around circle
☐ Add "au revoir" with gentle wave motion
☐ Use mirrors to practice facial expressions

Part 2 - Greeting Games (12 minutes):
☐ Musical greetings: walk, music stops, greet partner
☐ Telephone greetings: pass "Salut!" around circle
☐ Puppet greetings: puppets model conversations
☐ Morning/leaving role play scenarios

Part 3 - Greeting Cards (5 minutes):
☐ Create greeting cards with "Salut!" and "Au revoir!"
☐ Decorate with Mi'kmaq-inspired patterns
☐ Practice reading cards to partners`,
    specificConsolidation: `(10 minutes)
☐ Demonstrate perfect greeting with gestures
☐ Vote on favorite way to say "Salut!"
☐ Practice "Au revoir!" for end of day
☐ Plan to greet families with new words
☐ Preview: "Tomorrow we learn numbers!"`,
    materials: `• Greeting cards and envelopes • Small mirrors for practice • Fun puppets for demonstrations
• Musical playlist for activities • Mi'kmaq greeting examples • Gesture cards with pictures
• Chart paper for greetings poster • Stickers for successful greetings
• Camera for greeting documentation • Name tags for role play`,
    learningGoals: "Students will confidently use basic French greetings in daily interactions and understand the cultural importance of respectful acknowledgment.",
    successCriteria: `☐ I can say "Salut!" when I arrive
☐ I can say "Au revoir!" when I leave  
☐ I can greet others with a friendly voice
☐ I can respond when others greet me`
  },

  {
    title: "Lesson 6: Les nombres 1-5 (Numbers 1-5)",
    date: new Date('2025-09-09'),
    topic: "learning to count and recognize French numbers one through five",
    vocabularyTerms: [
      { term: "un", definition: "one - the first number" },
      { term: "cinq", definition: "five - number with all fingers on one hand" }
    ],
    indigenousConnection: "Mi'kmaq traditional counting often connected to nature and the body. Fingers, toes, and seasonal cycles provided natural counting systems. The number five holds special significance representing the five senses and the five directions (north, south, east, west, center). Traditional games and stories incorporate counting to teach children mathematical concepts through cultural context and natural observations.",
    specificMindsOn: `(8 minutes)
☐ Show five fingers, ask "How many?"
☐ Connect to Mi'kmaq teaching about five senses
☐ Practice counting fingers in English first
☐ Introduce exciting goal: count to "cinq" in French
☐ Use Mi'kmaq finger counting gestures`,
    specificAction: `(27 minutes)
Part 1 - Number Introduction (10 minutes):
☐ Chant numbers with finger actions: "un, deux, trois, quatre, cinq!"
☐ Use number cards with visual dots
☐ Practice pronunciation slowly and clearly
☐ Connect "un" finger to "one" understanding

Part 2 - Counting Activities (12 minutes):
☐ Count classroom objects: "un crayon, deux crayons..."
☐ Number hopscotch with French numbers
☐ Counting songs with movements
☐ Partner counting games to "cinq"

Part 3 - Number Art (5 minutes):
☐ Create number books: draw sets for each number
☐ Decorate numbers with Mi'kmaq patterns
☐ Practice writing numerals 1-5`,
    specificConsolidation: `(10 minutes)
☐ Count together as class: "un, deux, trois, quatre, cinq!"
☐ Show number with fingers while saying word
☐ Each student demonstrates favorite number
☐ Practice counting backwards from "cinq"
☐ Preview: "Tomorrow we explore colors!"`,
    materials: `• Large number cards (1-5) with dots • Finger counting posters • Small manipulatives for counting
• Hopscotch mat with numbers • Number songs playlist • Individual number books
• Mi'kmaq pattern examples • Crayons/markers • Counting bears or blocks
• Number formation practice sheets • Laminated number cards`,
    learningGoals: "Students will recognize, say, and use French numbers 1-5 in counting activities while connecting to Indigenous mathematical traditions.",
    successCriteria: `☐ I can count to cinq using my fingers
☐ I can say "un" when I see one thing
☐ I can recognize written numbers 1-5
☐ I can count objects up to five in French`
  },

  {
    title: "Lesson 7: Les couleurs (Colors)",
    date: new Date('2025-09-10'),
    topic: "identifying and naming basic colors in French through visual exploration",
    vocabularyTerms: [
      { term: "rouge", definition: "red - the color of strawberries and fire" },
      { term: "bleu", definition: "blue - the color of sky and water" }
    ],
    indigenousConnection: "In Mi'kmaq tradition, colors carry deep spiritual meaning and connect to the natural world. Red represents the east direction and new beginnings, while blue represents the sky world and spiritual connection. Traditional beadwork and regalia use specific colors to tell stories and honor sacred teachings. We will explore colors through this lens of cultural significance and natural beauty.",
    specificMindsOn: `(8 minutes)
☐ Display beautiful natural objects in red and blue
☐ Connect to Mi'kmaq teachings about color meanings
☐ Share: "Colors tell stories in nature"
☐ Practice saying "rouge" (like strawberry) and "bleu" (like sky)
☐ Look for these colors around our classroom`,
    specificAction: `(27 minutes)
Part 1 - Color Discovery (10 minutes):
☐ Color hunt around classroom for "rouge" and "bleu"
☐ Create color collection on sorting mats
☐ Practice pronunciation with color objects
☐ Chant: "Rouge comme fraise, bleu comme ciel"

Part 2 - Color Art Creation (12 minutes):
☐ Paint with red and blue natural brushes (sponges, leaves)
☐ Create Mi'kmaq-inspired color patterns
☐ Mix colors to discover purple
☐ Label artwork with color words

Part 3 - Color Games (5 minutes):
☐ "Jacques a dit" (Simon Says) with colors
☐ Find a partner wearing "rouge" or "bleu"
☐ Color matching memory game`,
    specificConsolidation: `(10 minutes)
☐ Share artwork and color discoveries
☐ Practice color words with actions (point to red heart, blue sky)
☐ Vote on most beautiful color combination
☐ Plan to notice colors at home
☐ Preview: "Tomorrow we organize school supplies!"`,
    materials: `• Natural objects in red and blue • Color sorting mats • Red and blue paint (washable)
• Natural brushes (sponges, foam brushes) • Large paper for art • Color word cards
• Mi'kmaq beadwork examples • Smocks for painting • Wet wipes for cleanup
• Color matching games • Chart paper for color chart • Camera for documentation`,
    learningGoals: "Students will identify and name red and blue in French while appreciating the cultural significance of colors in Indigenous traditions.",
    successCriteria: `☐ I can point to something rouge when asked
☐ I can point to something bleu when asked
☐ I can say color words clearly in French
☐ I can find colors in our classroom and nature`
  },

  {
    title: "Lesson 8: Mes fournitures scolaires (My School Supplies)",
    date: new Date('2025-09-11'),
    topic: "organizing and naming essential school supplies in French",
    vocabularyTerms: [
      { term: "crayon", definition: "pencil - tool for writing and drawing" },
      { term: "livre", definition: "book - collection of pages with stories or information" }
    ],
    indigenousConnection: "Traditional Mi'kmaq learning tools included quills for writing, birchbark for paper, and natural pigments for colors. Knowledge was often recorded through symbols and storytelling rather than written words. Today's school supplies continue this tradition of tools that help us capture and share knowledge. We honor the connection between ancient and modern learning tools while organizing our supplies with respect and gratitude.",
    specificMindsOn: `(8 minutes)
☐ Display traditional Mi'kmaq writing tools (quill, birchbark)
☐ Connect to modern school supplies as learning tools
☐ Share: "These tools help us learn and create"
☐ Practice saying "crayon" (hold pencil up) and "livre" (hold book)
☐ Set goal to organize supplies like respectful learners`,
    specificAction: `(27 minutes)
Part 1 - Supply Exploration (10 minutes):
☐ Sort supplies into groups: writing, reading, creating
☐ Practice French names for each supply type
☐ Demonstrate proper care for "crayon" and "livre"
☐ Create supply labels with pictures and words

Part 2 - Organization Station (12 minutes):
☐ Set up personal supply containers
☐ Label containers with "Mes fournitures"
☐ Practice asking: "Où est mon crayon?" (Where is my pencil?)
☐ Create supply checking routine

Part 3 - Supply Song (5 minutes):
☐ Sing simple supply song with actions
☐ "Mon crayon, mon livre, mes fournitures!"
☐ Act out using each supply properly`,
    specificConsolidation: `(10 minutes)
☐ Admire organized supply stations
☐ Practice supply vocabulary with partners
☐ Demonstrate how to ask for supplies politely
☐ Plan daily supply check routine
☐ Preview: "Next week we learn days of the week!"`,
    materials: `• Individual supply containers • Label maker or pre-made labels • Sample traditional Mi'kmaq tools
• Laminated supply vocabulary cards • School supplies for sorting • Chart paper for supply song
• Marker for labeling • Storage organizers • Camera for organized spaces
• Supply checklist templates • Thank you cards for supplies`,
    learningGoals: "Students will organize personal supplies responsibly while learning French vocabulary for essential school materials and respecting learning tools.",
    successCriteria: `☐ I can find my crayon when needed
☐ I can say "livre" when holding a book
☐ I can keep my supplies organized
☐ I can ask for supplies politely in French`
  },

  // WEEK 3: Daily Routines and Community
  {
    title: "Lesson 9: Les jours de la semaine (Days of the Week)",
    date: new Date('2025-09-15'),
    topic: "learning French names for days of the week and understanding weekly patterns",
    vocabularyTerms: [
      { term: "lundi", definition: "Monday - the first day of our school week" },
      { term: "vendredi", definition: "Friday - the last day of our school week" }
    ],
    indigenousConnection: "Mi'kmaq traditional timekeeping followed natural cycles of the moon, seasons, and animal behaviors rather than seven-day weeks. Each full moon marked a new month, and activities were planned around seasonal changes and natural rhythms. While we use the modern calendar, we can honor traditional time awareness by noticing how each day brings different natural changes and classroom activities.",
    specificMindsOn: `(8 minutes)
☐ Point to today on classroom calendar
☐ Share Mi'kmaq connection to natural time cycles
☐ Practice: "Aujourd'hui c'est..." (Today is...)
☐ Introduce "lundi" as beginning and "vendredi" as celebration day
☐ Look outside to notice today's natural signs`,
    specificAction: `(27 minutes)
Part 1 - Day Introduction (10 minutes):
☐ Sing days of week song with hand actions
☐ Focus on "lundi" (Monday) and "vendredi" (Friday)
☐ Connect each day to special classroom activities
☐ Practice pronunciation with rhythm and clapping

Part 2 - Weekly Routine Chart (12 minutes):
☐ Create visual weekly schedule together
☐ Add pictures for each day's special activities
☐ Practice saying "lundi" when pointing to Monday
☐ Plan Friday celebrations for end of week

Part 3 - Day Detective (5 minutes):
☐ Find clues around room about what day it is
☐ Weather, activities, people present
☐ Practice: "C'est [day]!" with confidence`,
    specificConsolidation: `(10 minutes)
☐ Recite days we've learned together
☐ Point to "lundi" and "vendredi" on calendar
☐ Share what makes each day special
☐ Practice calendar routine for tomorrow
☐ Preview: "Tomorrow we learn about classroom jobs!"`,
    materials: `• Large classroom calendar • Day-of-week cards with pictures • Weekly schedule chart
• Natural timekeeping examples (moon phases, seasons) • Markers for chart creation
• Days of week song audio • Rhythm instruments for chanting
• Camera for routine documentation • Weather tracking materials`,
    learningGoals: "Students will recognize and name the school days of the week in French while appreciating natural time cycles and developing calendar awareness.",
    successCriteria: `☐ I can say "lundi" when it's Monday
☐ I can say "vendredi" when it's Friday
☐ I can point to today on our calendar
☐ I can remember what day comes next`
  },

  {
    title: "Lesson 10: Nos responsabilités (Our Classroom Jobs)",
    date: new Date('2025-09-16'),
    topic: "understanding classroom responsibilities and contributing to community well-being",
    vocabularyTerms: [
      { term: "aide", definition: "helper - someone who assists others" },
      { term: "responsabilité", definition: "responsibility - important job we do for our community" }
    ],
    indigenousConnection: "In Mi'kmaq communities, everyone contributes to the wellbeing of the group from a young age. Children learn responsibility through meaningful tasks that help the family and community thrive. Elders teach that we all have gifts to share and roles to play in caring for each other and our environment. Our classroom jobs honor this tradition of everyone contributing their unique strengths to our learning community.",
    specificMindsOn: `(8 minutes)
☐ Share story of Mi'kmaq children helping their communities
☐ Connect to our classroom as a community needing care
☐ Practice saying "aide" with helping gesture
☐ Discuss: "How can we help our classroom family?"
☐ Introduce "responsabilité" as important community work`,
    specificAction: `(27 minutes)
Part 1 - Job Exploration (10 minutes):
☐ Demonstrate each classroom job with actions
☐ Line leader, paper passer, plant waterer, book organizer
☐ Practice saying "Je suis aide" (I am a helper)
☐ Show how each job helps our community

Part 2 - Job Selection (12 minutes):
☐ Students choose jobs based on interests and strengths
☐ Create job badges with names and pictures
☐ Practice job responsibilities with guidance
☐ Establish job rotation schedule

Part 3 - Helper Ceremony (5 minutes):
☐ Present job badges in special ceremony
☐ Commit to being responsible "aide"
☐ Practice job tasks with partners`,
    specificConsolidation: `(10 minutes)
☐ Celebrate our new classroom helpers
☐ Practice: "Ma responsabilité est..." (My responsibility is...)
☐ Plan when jobs rotate to new people
☐ Thank each other for willingness to help
☐ Preview: "Tomorrow we have our first sharing circle!"`,
    materials: `• Job badge templates • Lamination materials • Job demonstration props
• Mi'kmaq community helper photos • Markers for personalizing badges
• Job rotation chart • Velcro for changeable job board
• Camera for helper documentation • Cleaning supplies for jobs`,
    learningGoals: "Students will accept classroom responsibilities with pride while learning vocabulary for helping and understanding the importance of community contribution.",
    successCriteria: `☐ I can say "aide" when I'm helping
☐ I can explain my responsabilité 
☐ I can do my classroom job independently
☐ I can thank others for being helpful`
  },

  {
    title: "Lesson 11: Cercle de partage (Sharing Circle)",
    date: new Date('2025-09-17'),
    topic: "practicing respectful communication through traditional circle protocols",
    vocabularyTerms: [
      { term: "partage", definition: "sharing - giving our thoughts and feelings to others" },
      { term: "écouter", definition: "listen - paying attention with our ears and hearts" }
    ],
    indigenousConnection: "The sharing circle is a sacred Mi'kmaq tradition where community members gather to speak truth, share wisdom, and support each other. Only the person holding the talking piece may speak, while others practice deep listening. This teaches respect, patience, and the value of every voice. The circle represents equality - no one is more important than another, and all perspectives are honored.",
    specificMindsOn: `(8 minutes)
☐ Arrange chairs in perfect circle formation
☐ Explain sacred nature of sharing circles in Mi'kmaq tradition
☐ Introduce talking piece and its meaning
☐ Practice "partage" (sharing) and "écouter" (listening) gestures
☐ Set circle agreements: respect, honesty, confidentiality`,
    specificAction: `(27 minutes)
Part 1 - Circle Protocol (10 minutes):
☐ Demonstrate how to hold and pass talking piece respectfully
☐ Practice sitting quietly while others speak
☐ Model appropriate sharing: feelings, experiences, gratitude
☐ Emphasize "écouter" with full attention

Part 2 - First Sharing Circle (12 minutes):
☐ Start with simple prompt: "I feel happy when..."
☐ Pass talking piece clockwise around circle
☐ Students practice "partage" at their comfort level
☐ Teacher models active listening and encouragement

Part 3 - Circle Reflection (5 minutes):
☐ Discuss how it felt to share and listen
☐ Practice thanking circle for listening
☐ Plan regular sharing circle times`,
    specificConsolidation: `(10 minutes)
☐ Close circle with gratitude round
☐ Practice: "Merci pour le partage" (Thank you for sharing)
☐ Store talking piece in special place
☐ Reflect on powerful listening experience
☐ Preview: "Tomorrow we explore our feelings!"`,
    materials: `• Special talking piece (stone, feather, or wooden object) • Circle formation guide
• Sharing circle agreement poster • Soft cushions for comfortable sitting
• Tissues for emotional moments • Timer for keeping track
• Sacred space decorations • Camera for respectful documentation`,
    learningGoals: "Students will practice respectful communication through traditional circle protocols while learning vocabulary for sharing and listening with cultural sensitivity.",
    successCriteria: `☐ I can wait quietly while others practice partage
☐ I can écouter with my whole attention
☐ I can share appropriately when holding talking piece
☐ I can show respect for others' stories and feelings`
  },

  {
    title: "Lesson 12: Nos sentiments (Our Feelings)",
    date: new Date('2025-09-18'),
    topic: "identifying and expressing emotions in French with emotional intelligence",
    vocabularyTerms: [
      { term: "content", definition: "happy - feeling joy and satisfaction" },
      { term: "triste", definition: "sad - feeling sorrow or disappointment" }
    ],
    indigenousConnection: "Mi'kmaq teachings recognize that all emotions are natural and important messengers. Traditional stories often feature characters experiencing the full range of human feelings, teaching children that emotions are part of the human journey. The medicine wheel includes emotional teachings about balance and accepting all feelings as teachers. We will honor all emotions as valid and important parts of our learning experience.",
    specificMindsOn: `(8 minutes)
☐ Display emotion faces showing "content" and "triste"
☐ Connect to Mi'kmaq teaching that all feelings are teachers
☐ Share: "Feelings help us understand ourselves"
☐ Practice emotion faces and words together
☐ Create safe space for feeling expression`,
    specificAction: `(27 minutes)
Part 1 - Emotion Exploration (10 minutes):
☐ Act out "content" and "triste" with whole body
☐ Practice saying emotions with appropriate facial expressions
☐ Connect emotions to situations: "Je suis content quand..."
☐ Use mirrors to see own emotion expressions

Part 2 - Feeling Check-In (12 minutes):
☐ Create emotion thermometer for daily check-ins
☐ Students point to current feeling and say word
☐ Practice: "Je me sens..." (I feel...)
☐ Share what helps when feeling "triste"

Part 3 - Emotion Art (5 minutes):
☐ Draw pictures showing "content" and "triste" situations
☐ Label artwork with feeling words
☐ Create class emotion book`,
    specificConsolidation: `(10 minutes)
☐ Practice emotion check-in routine
☐ Celebrate all feelings as normal and helpful
☐ Share one thing that makes us "content"
☐ Plan to use emotion words all week
☐ Preview: "Next week we review everything we've learned!"`,
    materials: `• Emotion face cards (happy/sad) • Small mirrors for expression practice
• Emotion thermometer chart • Art supplies for feeling drawings
• Books about emotions in French • Soft music for calm atmosphere
• Tissues for emotional moments • Camera for emotion documentation`,
    learningGoals: "Students will identify and express basic emotions in French while developing emotional awareness and accepting all feelings as natural and important.",
    successCriteria: `☐ I can say "content" when I feel happy
☐ I can say "triste" when I feel sad
☐ I can show emotions with my face and body
☐ I can respect others' feelings in our classroom`
  },

  // WEEK 4: Review, Celebration, and Assessment
  {
    title: "Lesson 13: Révision de septembre (September Review)",
    date: new Date('2025-09-22'),
    topic: "reviewing and celebrating all French vocabulary and skills learned this month",
    vocabularyTerms: [
      { term: "révision", definition: "review - looking back at what we learned" },
      { term: "septembre", definition: "September - our first month of learning together" }
    ],
    indigenousConnection: "Mi'kmaq seasonal cycles include times for reflection and harvesting the gifts of each season. September marks the harvest time when communities gather to celebrate the abundance of their work and prepare for the next season. We will reflect on our learning harvest this month, celebrating the knowledge and friendships we have gathered, and preparing for continued growth in our learning journey.",
    specificMindsOn: `(8 minutes)
☐ Create harvest circle with September learning artifacts
☐ Connect to Mi'kmaq harvest traditions and reflection
☐ Practice "révision" as looking back with gratitude
☐ Share: "We have harvested so much learning this septembre!"
☐ Set intention to celebrate all progress made`,
    specificAction: `(27 minutes)
Part 1 - Vocabulary Harvest (10 minutes):
☐ Review all words learned using flashcard games
☐ Practice greetings, numbers, colors, feelings together
☐ Create word web showing connections between learning
☐ Celebrate pronunciation improvements

Part 2 - Skill Stations (12 minutes):
☐ Station 1: Greeting practice with partners
☐ Station 2: Counting objects to "cinq"
☐ Station 3: Color identification games
☐ Station 4: Emotion expression activities

Part 3 - Learning Gallery (5 minutes):
☐ Display all work created this month
☐ Walk through gallery admiring progress
☐ Practice describing learning to visitors`,
    specificConsolidation: `(10 minutes)
☐ Share favorite learning memory from septembre
☐ Practice all vocabulary words in final review chant
☐ Thank each other for being good learning partners
☐ Plan celebration for tomorrow's lesson
☐ Preview: "Tomorrow we celebrate our achievements!"`,
    materials: `• September learning artifacts • Vocabulary flashcards • Station activity materials
• Gallery display boards • Markers for reflection • Harvest celebration items
• Camera for documenting progress • Chart paper for word web
• Celebration music • Thank you cards for classmates`,
    learningGoals: "Students will demonstrate mastery of September vocabulary and reflect on their learning growth while celebrating achievements with gratitude and pride.",
    successCriteria: `☐ I can use most of our September vocabulary correctly
☐ I can explain something I learned this month
☐ I can celebrate my progress with pride
☐ I can thank others who helped me learn`
  },

  {
    title: "Lesson 14: Célébration d'apprentissage (Learning Celebration)",
    date: new Date('2025-09-23'),
    topic: "celebrating learning achievements and building excitement for continued French learning",
    vocabularyTerms: [
      { term: "célébration", definition: "celebration - special time to honor achievements" },
      { term: "fier", definition: "proud - feeling good about accomplishments" }
    ],
    indigenousConnection: "Mi'kmaq communities celebrate achievements and milestones with community gatherings that include storytelling, singing, and sharing food. These celebrations honor individual growth while strengthening community bonds. Everyone's contributions are recognized and valued. Our learning celebration will honor each student's unique growth and the strength we've built together as a classroom community.",
    specificMindsOn: `(8 minutes)
☐ Welcome families to our learning célébration
☐ Explain Mi'kmaq tradition of community achievement celebrations
☐ Practice "Je suis fier" (I am proud) with confident posture
☐ Set celebration tone: joy, gratitude, community pride
☐ Introduce family members to our French learning`,
    specificAction: `(27 minutes)
Part 1 - Learning Demonstrations (12 minutes):
☐ Students demonstrate greetings to families
☐ Count to "cinq" with finger actions
☐ Name colors found around the room
☐ Share classroom rules and responsibilities

Part 2 - Performance Showcase (10 minutes):
☐ Sing days of the week song together
☐ Demonstrate sharing circle protocol
☐ Show emotion vocabulary with actions
☐ Present class-made learning artifacts

Part 3 - Family Appreciation (5 minutes):
☐ Thank families for supporting French learning
☐ Give families vocabulary cards to practice at home
☐ Share plans for October learning`,
    specificConsolidation: `(10 minutes)
☐ Students share what makes them "fier" of their learning
☐ Families share observations about student growth
☐ Plan continued French practice at home
☐ Exchange gratitude for successful September
☐ Preview: "After celebration, we assess our learning!"`,
    materials: `• Family invitation cards • Learning demonstration props • Student work displays
• Vocabulary cards for families • Celebration decorations • Camera for family photos
• Guest chairs for family members • Light refreshments • Thank you cards for families
• Performance area setup • Microphone if available`,
    learningGoals: "Students will demonstrate their French learning proudly to families while celebrating community achievements and building motivation for continued learning.",
    successCriteria: `☐ I can demonstrate my French learning to my family
☐ I can say "Je suis fier" about my accomplishments
☐ I can help welcome families to our célébration
☐ I can explain what I want to learn next`
  },

  {
    title: "Lesson 15: Évaluation joyeuse (Joyful Assessment)",
    date: new Date('2025-09-24'),
    topic: "demonstrating French learning through play-based authentic assessment activities",
    vocabularyTerms: [
      { term: "montrer", definition: "show - demonstrate what we know" },
      { term: "savoir", definition: "know - information and skills we have learned" }
    ],
    indigenousConnection: "Traditional Mi'kmaq assessment happened through observation during daily activities, storytelling, and practical demonstrations of skills. Elders watched children in natural settings to see their learning and growth. Knowledge was demonstrated through real-life applications rather than tests. Our assessment will honor this tradition by showing learning through meaningful activities and natural demonstrations.",
    specificMindsOn: `(8 minutes)
☐ Explain assessment as chance to "montrer" what we know
☐ Connect to Mi'kmaq tradition of learning through doing
☐ Practice "Je sais..." (I know...) with confidence
☐ Set positive tone: assessment as celebration of learning
☐ Review what we will demonstrate today`,
    specificAction: `(27 minutes)
Part 1 - Interactive Assessment Stations (15 minutes):
☐ Station 1: Greeting and conversation with teacher
☐ Station 2: Number and color identification games
☐ Station 3: Emotion expression and vocabulary use
☐ Station 4: Classroom routine demonstrations

Part 2 - Portfolio Creation (8 minutes):
☐ Students select best work examples for portfolios
☐ Practice explaining choices: "J'ai choisi parce que..."
☐ Organize portfolio with pride and care
☐ Add self-reflection drawings

Part 3 - Learning Conferences (4 minutes):
☐ Brief individual conferences about growth
☐ Students share favorite learning moments
☐ Plan goals for October learning`,
    specificConsolidation: `(10 minutes)
☐ Celebrate successful assessment completion
☐ Practice: "Je peux montrer ce que je sais!"
☐ Admire completed portfolios together
☐ Share pride in learning accomplishments
☐ Preview: "Tomorrow we start our learning portfolios!"`,
    materials: `• Assessment station materials • Portfolio folders and organizers • Self-reflection templates
• Camera for documentation • Assessment observation forms • Stickers for achievements
• Comfortable spaces for conferences • Learning artifacts for selection
• Chart paper for goal setting • Celebration music`,
    learningGoals: "Students will demonstrate their French learning confidently through authentic assessment while developing self-reflection skills and pride in their accomplishments.",
    successCriteria: `☐ I can montrer my French vocabulary knowledge
☐ I can explain what I savoir with confidence
☐ I can choose my best work for my portfolio
☐ I can talk about my learning growth`
  },

  {
    title: "Lesson 16: Portfolio de fierté (Pride Portfolio)",
    date: new Date('2025-09-25'),
    topic: "creating learning portfolios that showcase September achievements and set October goals",
    vocabularyTerms: [
      { term: "portfolio", definition: "collection of our best work and learning memories" },
      { term: "objectif", definition: "goal - something we want to learn or achieve" }
    ],
    indigenousConnection: "Mi'kmaq tradition includes creating memory bundles and storytelling artifacts that preserve important experiences and teachings for future generations. These collections honor the learning journey and provide guidance for continued growth. Our portfolios will serve as learning bundles that capture our September journey and guide our path forward in French learning.",
    specificMindsOn: `(8 minutes)
☐ Show examples of Mi'kmaq memory bundles and storytelling objects
☐ Connect to our "portfolio" as learning memory collection
☐ Practice "Mon portfolio montre..." (My portfolio shows...)
☐ Set intention to create meaningful learning collection
☐ Plan portfolio organization with pride and care`,
    specificAction: `(27 minutes)
Part 1 - Portfolio Assembly (12 minutes):
☐ Organize work samples by learning categories
☐ Add photos of learning activities and celebrations
☐ Include self-reflection pages with drawings
☐ Create portfolio cover with personal touches

Part 2 - Goal Setting (10 minutes):
☐ Draw pictures of October learning "objectifs"
☐ Practice: "Mon objectif est..." (My goal is...)
☐ Choose new vocabulary words to learn
☐ Plan family sharing of portfolio

Part 3 - Portfolio Sharing (5 minutes):
☐ Share favorite portfolio pieces with partners
☐ Practice explaining learning growth
☐ Celebrate diverse learning journeys`,
    specificConsolidation: `(10 minutes)
☐ Admire completed portfolios with pride
☐ Practice sharing portfolios with families
☐ Commit to October learning objectifs
☐ Thank classmates for being good learning partners
☐ Celebrate successful completion of "Bienvenue à l'école!" unit`,
    materials: `• Portfolio folders and organizers • Learning work samples • Photos of September activities
• Self-reflection templates • Art supplies for decoration • Goal-setting worksheets
• Laminating materials • Hole punch and brad fasteners • Thank you cards for families
• Camera for final documentation • Celebration stickers`,
    learningGoals: "Students will create comprehensive learning portfolios that demonstrate their September growth and establish meaningful goals for continued French learning development.",
    successCriteria: `☐ I can organize my portfolio with learning samples
☐ I can explain my learning growth to others
☐ I can set realistic objectifs for October learning
☐ I can share my portfolio proudly with my family`
  }
];

async function createBienvenueLesson(lessonData: LessonData, unitPlanId: string, userId: number) {
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
☐ Observation during minds on discussion - note engagement and prior knowledge
☐ Anecdotal notes during action phase activities - document skill development
☐ Checklist for vocabulary usage - track correct pronunciation and context
☐ Student self-assessment during consolidation - encourage reflection

Success Criteria Observations:
☐ Demonstrates understanding of topic (meets/approaching/needs support)
☐ Uses French vocabulary appropriately (meets/approaching/needs support)  
☐ Participates respectfully in activities (meets/approaching/needs support)
☐ Shows progress toward learning goals (meets/approaching/needs support)`,
      
      differentiationStrategies: {
        forStruggling: "Provide visual vocabulary supports, simplified instructions, peer buddies, hands-on manipulatives, reduced task complexity, extra processing time, and frequent check-ins for understanding",
        forIEP: "Modified expectations as outlined in individual education plan, assistive technology support, alternative demonstration methods, extended time allocations, modified assessment criteria, and dedicated one-on-one support",
        forELL: "Visual vocabulary cards with pictures, bilingual dictionaries, sentence frames for oral practice, peer translation support, gestures and demonstrations, home language connections, and culturally relevant examples",
        forAdvanced: "Extension activities with deeper vocabulary, leadership roles in group work, independent research projects, creation of teaching materials for peers, cross-curricular connections, and mentoring opportunities"
      },
      
      indigenousPerspectives: lessonData.indigenousConnection,
      
      reflectionActivities: {
        teacherReflection: `• How effectively did students engage with the French vocabulary today?
• Which students demonstrated strong progress and which need additional support?
• How can I adjust tomorrow's lesson based on today's observations and outcomes?
• What extension opportunities would challenge advanced learners appropriately?
• How well did the Indigenous perspectives connect meaningfully to the learning goals?
• What aspects of differentiation were most successful for diverse learners?`,
        crossCurricular: `• Language Arts: Oral communication skills, vocabulary development, listening comprehension
• Mathematics: Number recognition, counting practice, pattern identification
• Arts: Visual representation through drawings, creative expression, cultural art connections
• Social Studies: Community building, cultural awareness, respect for diversity
• Science: Observation skills, natural world connections, inquiry-based learning
• Health: Social-emotional learning, self-regulation, positive relationships`
      }
    }
  });
}

async function main() {
  try {
    console.log('🚀 Starting Bienvenue à l\'école lesson creation...');
    
    // Find Emily's user record
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily user not found. Please ensure user exists with email emmcisaac@gmail.com');
    }
    
    console.log(`✅ Found Emily (ID: ${emily.id})`);
    
    // Find the "Bienvenue à l'école!" unit plan
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        title: 'Bienvenue à l\'école!',
        userId: emily.id
      }
    });
    
    if (!unitPlan) {
      throw new Error('Bienvenue à l\'école! unit plan not found for Emily');
    }
    
    console.log(`✅ Found unit plan "${unitPlan.title}" (ID: ${unitPlan.id})`);
    
    // Delete existing lessons for this unit (if any)
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unitPlan.id }
    });
    
    console.log('🗑️ Cleared existing lessons for unit');
    
    // Create all 16 perfect lessons
    console.log('📝 Creating 16 perfect ETFO-compliant lessons...');
    
    let createdCount = 0;
    for (const lessonData of lessons) {
      await createBienvenueLesson(lessonData, unitPlan.id, emily.id);
      createdCount++;
      console.log(`✅ Created lesson ${createdCount}/16: ${lessonData.title}`);
    }
    
    console.log(`\n🎉 SUCCESS! Created ${createdCount} perfect Grade 1 French Immersion lessons`);
    console.log('\n📋 Lesson Summary:');
    console.log('• Duration: 45 minutes each (ETFO compliant)');
    console.log('• Structure: Minds On (8min) + Action (27min) + Consolidation (10min)');
    console.log('• Vocabulary: 2-3 French terms per lesson (Grade 1 appropriate)');
    console.log('• Assessment: Observable with ☐ checkboxes');
    console.log('• Differentiation: JSON format with all 4 learner types');
    console.log('• Indigenous Perspectives: 100+ characters Mi\'kmaq connections');
    console.log('• Materials: Comprehensive lists for each lesson');
    
    console.log('\n📅 September 2025 Schedule:');
    console.log('Week 1 (Sept 2-5): Classroom routines, meeting classmates, school tour, classroom rules');
    console.log('Week 2 (Sept 8-11): French greetings, numbers 1-5, colors, school supplies');
    console.log('Week 3 (Sept 15-18): Days of week, classroom jobs, sharing circle, feelings');
    console.log('Week 4 (Sept 22-25): Review, celebrations, assessment, portfolio creation');
    
  } catch (error) {
    console.error('❌ Error creating Bienvenue lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script when run directly
main()
  .then(() => {
    console.log('\n✨ Bienvenue à l\'école lessons created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });

export default main;