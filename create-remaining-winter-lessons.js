/**
 * ADD REMAINING WINTER CELEBRATIONS LESSONS (4-15)
 * Completes the Winter Celebrations unit with lessons 4-15
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Remaining 12 lessons for Winter Celebrations unit
const remainingLessons = [
  // WEEK 2: Christmas Traditions (4-6)
  {
    title: "Lesson 4: Christmas Around the World / Noël autour du monde",
    date: new Date('2025-12-08'),
    vocabularyFr: ["Noël", "monde", "pays"],
    indigenousPerspectives: "While Christmas is not a traditional Mi'kmaq celebration, many Mi'kmaq families today blend Christmas customs with traditional winter ceremonies, creating unique traditions that honor both their ancestral practices and adopted customs. This blending shows how cultures can respectfully adapt and maintain their identity while participating in broader community celebrations.",
    specificMindsOn: `(8 minutes)
☐ Display Christmas celebration pictures from different countries around the monde
☐ Show world map and locate different pays where Christmas is celebrated
☐ Practice "Noël" while pointing to Christmas symbols from various cultures
☐ Discuss: "How might people celebrate Noël in different pays?"
☐ Connect Christmas to global community of celebrations`,
    specificAction: `(27 minutes)
Part 1 - Christmas World Tour (10 minutes):
☐ Explore Christmas traditions from various countries: Mexico, Germany, Philippines
☐ Identify unique customs: piñatas, advent calendars, parols
☐ Practice country names and Christmas vocabulary
☐ Locate countries on world map and discuss geography

Part 2 - Global Christmas Customs (12 minutes):
☐ Learn simple Christmas songs or greetings from different cultures
☐ Examine different Christmas decoration styles from around the monde
☐ Practice: "Noël est célébré dans beaucoup de pays"
☐ Create mini Christmas displays representing different countries

Part 3 - Christmas Comparison (5 minutes):
☐ Compare Christmas customs from different pays
☐ Discuss how climate affects Christmas celebrations
☐ Practice: "Chaque pays a ses propres traditions de Noël"`,
    specificConsolidation: `(10 minutes)
☐ Share most interesting Christmas tradition from another pays
☐ Practice Christmas and geography vocabulary together
☐ Discuss how Christmas brings the monde together
☐ Plan to explore PEI Christmas traditions tomorrow
☐ Preview: "Tomorrow we learn about Christmas in PEI!"`,
    materials: "• World map and country location materials • Christmas tradition photos from different countries • Cultural Christmas decorations examples • Simple Christmas songs in different languages • Globe or world atlas • Country flag examples • Art supplies for mini displays • Camera for world tour documentation",
    learningGoals: "Students will explore global Christmas traditions while developing geographic awareness and appreciation for cultural diversity in celebration practices.",
    assessmentNotes: `Formative Assessment:
☐ Observe engagement with global Christmas traditions
☐ Note geographic vocabulary usage during map activities
☐ Check understanding of cultural diversity through comparisons
☐ Document respectful appreciation for different Christmas customs
☐ Record ability to locate countries and connect to celebrations`,
    differentiationStrategies: {
      forStruggling: "Visual country supports with pictures and flags, simplified map activities, peer partners for geography exploration, hands-on Christmas tradition materials, reduced vocabulary expectations, extra time for processing global concepts",
      forIEP: "Modified geographic expectations per IEP, assistive technology for map exploration, alternative demonstration methods, extended time for activities, one-on-one support during world exploration, adapted materials for accessibility",
      forELL: "Country vocabulary cards with translations, bilingual Christmas tradition examples, visual cues for map activities, peer translation support, gestures for Christmas customs, connections to home country Christmas traditions",
      forAdvanced: "Leadership in geography activities, independent research on Christmas traditions, creation of world Christmas map projects, peer teaching about countries, extended vocabulary exploration, critical analysis of cultural adaptations"
    }
  },

  {
    title: "Lesson 5: Christmas in PEI / Noël à l'Île-du-Prince-Édouard",
    date: new Date('2025-12-09'),
    vocabularyFr: ["local", "maritimes", "hiver"],
    indigenousPerspectives: "Mi'kmaq peoples in PEI traditionally marked winter with storytelling seasons and community gatherings. While Christmas was introduced by settlers, many Mi'kmaq families created beautiful blends of traditions, incorporating traditional winter foods, gift-giving customs, and respect for elders into Christmas celebrations, maintaining cultural identity within new traditions.",
    specificMindsOn: `(8 minutes)
☐ Show photos of PEI Christmas traditions: tree farms, coastal decorations
☐ Share local Christmas customs including Mi'kmaq family adaptations
☐ Practice "local" while pointing to familiar PEI locations
☐ Discuss: "How do people in our maritimes community celebrate?"
☐ Connect local traditions to our own experiences`,
    specificAction: `(27 minutes)
Part 1 - PEI Christmas Discovery (10 minutes):
☐ Explore unique PEI Christmas traditions: tree farms, lighthouse decorations
☐ Learn about Maritime Christmas foods and customs
☐ Practice describing local Christmas: "À l'IPÉ, nous..."
☐ Connect Christmas to PEI geography and hiver climate

Part 2 - Local Christmas Activities (12 minutes):
☐ Create PEI Christmas scenes with local landmarks
☐ Practice Christmas vocabulary specific to maritimes region
☐ Learn about community Christmas events in our area
☐ Design Christmas cards featuring PEI winter scenes

Part 3 - Our Community Christmas (5 minutes):
☐ Discuss how our families celebrate Christmas locally
☐ Share local Christmas memories and traditions
☐ Practice: "Notre communauté locale célèbre Noël ensemble"`,
    specificConsolidation: `(10 minutes)
☐ Share favorite local Christmas tradition from PEI
☐ Practice regional Christmas vocabulary with actions
☐ Discuss what makes PEI Christmas special in our maritimes region
☐ Plan to learn about family Christmas traditions tomorrow
☐ Preview: "Tomorrow we share our family Christmas customs!"`,
    materials: "• PEI Christmas tradition photos and examples • Local Christmas landmark pictures • Maritime Christmas decoration materials • PEI winter scene art supplies • Local Christmas event information • Mi'kmaq Christmas tradition examples • Regional map of Christmas activities • Camera for local tradition documentation",
    learningGoals: "Students will appreciate local PEI Christmas traditions while developing connection to their Maritime community and understanding regional celebration customs.",
    assessmentNotes: `Formative Assessment:
☐ Observe connection to local PEI Christmas traditions
☐ Note use of regional vocabulary during discussions
☐ Check understanding of Maritime customs through participation
☐ Document appreciation for local community celebrations
☐ Record ability to connect personal experiences to local traditions`,
    differentiationStrategies: {
      forStruggling: "Visual PEI supports with local photos, simplified regional concepts, peer partners for local exploration, hands-on PEI Christmas materials, reduced vocabulary expectations, extra time for local connections",
      forIEP: "Modified local geography expectations per IEP, assistive technology for regional exploration, alternative demonstration methods, extended time for activities, one-on-one support during local learning, adapted regional materials",
      forELL: "Regional vocabulary cards with translations, bilingual PEI tradition examples, visual cues for local activities, peer translation support, gestures for local customs, connections to home region Christmas traditions",
      forAdvanced: "Leadership in local tradition activities, independent research on PEI Christmas history, creation of regional Christmas projects, peer teaching about local customs, extended vocabulary exploration, critical analysis of regional adaptations"
    }
  },

  {
    title: "Lesson 6: Our Family Christmas Traditions / Nos traditions familiales de Noël",
    date: new Date('2025-12-10'),
    vocabularyFr: ["notre", "différent", "respecter"],
    indigenousPerspectives: "Traditional Mi'kmaq teachings emphasize that every family's way of celebrating has value and meaning. Elders taught that when families blend traditions - whether traditional Mi'kmaq winter customs with Christmas, or customs from different cultures - each adaptation tells a story of family journey and should be honored with respect and appreciation.",
    specificMindsOn: `(8 minutes)
☐ Create respectful sharing circle for family Christmas traditions
☐ Show examples of diverse family Christmas customs including blended traditions
☐ Practice "notre" while gesturing to include everyone's family
☐ Discuss: "How are notre family traditions différent and special?"
☐ Set tone of respect for all family practices`,
    specificAction: `(27 minutes)
Part 1 - Family Tradition Sharing (10 minutes):
☐ Students share family Christmas traditions in supportive environment
☐ Listen respectfully to different family customs and practices
☐ Practice: "Notre famille..." to describe family traditions
☐ Celebrate diversity in family Christmas celebrations

Part 2 - Tradition Appreciation (12 minutes):
☐ Create family tradition artwork or displays
☐ Practice vocabulary: "Nous respectons les traditions différentes"
☐ Learn about how families blend different cultural traditions
☐ Express appreciation for classmates' family customs

Part 3 - Shared Values (5 minutes):
☐ Identify common values in different Christmas traditions: love, giving, family
☐ Discuss what makes all traditions special and worthy of respect
☐ Practice: "Toutes les familles sont importantes"`,
    specificConsolidation: `(10 minutes)
☐ Thank classmates for sharing leurs family traditions
☐ Practice family tradition vocabulary with appreciation gestures
☐ Commit to respecter all different family Christmas customs
☐ Plan to learn about other winter celebrations next week
☐ Preview: "Next week we explore Hanukkah, Kwanzaa, and Diwali!"`,
    materials: "• Family tradition sharing circle setup • Respectful listening props • Art supplies for tradition displays • Thank you cards for sharing • Diverse family tradition examples • Cultural appreciation materials • Chart paper for common values • Camera for tradition celebration documentation",
    learningGoals: "Students will share family Christmas traditions with pride while developing deep respect for diverse family customs and appreciation for different ways of celebrating.",
    assessmentNotes: `Formative Assessment:
☐ Observe respectful listening during family tradition sharing
☐ Note appropriate use of appreciation vocabulary in French
☐ Check demonstration of respect for diverse family customs
☐ Document ability to identify common values across traditions
☐ Record quality of participation in respectful sharing circle`,
    differentiationStrategies: {
      forStruggling: "Visual sharing supports with pictures, simplified sharing expectations, peer partners for support, hands-on tradition materials, reduced vocabulary requirements, extra time for sharing, emotional support during presentations",
      forIEP: "Modified sharing expectations per IEP, assistive communication devices if needed, alternative sharing methods, extended time for all activities, one-on-one support during sharing circle, adapted participation methods",
      forELL: "Family tradition vocabulary cards with translations, bilingual sharing support, visual cues for tradition description, peer translation assistance, gestures for tradition demonstration, encouragement for home language sharing",
      forAdvanced: "Leadership in facilitating respectful sharing, independent research on tradition origins, creation of family tradition comparison projects, peer support during sharing circle, extended vocabulary exploration, critical thinking about tradition meanings"
    }
  },

  // WEEK 3: Other Winter Celebrations (7-9)
  {
    title: "Lesson 7: Hanukkah - Festival of Lights / Hanoukka - Fête des lumières",
    date: new Date('2025-12-15'),
    vocabularyFr: ["lumières", "huit", "miracle"],
    indigenousPerspectives: "Like Mi'kmaq winter solstice traditions that honor the return of light during the darkest time of year, Hanukkah celebrates light triumphing over darkness. Both traditions recognize the spiritual importance of light during winter months and the miracle of hope continuing even in difficult times, showing how different cultures share similar values about light and perseverance.",
    specificMindsOn: `(8 minutes)
☐ Display beautiful Hanukkah menorah and explain the huit candles
☐ Share story of Hanukkah miracle and connection to light festivals
☐ Practice "lumières" while safely observing candle lighting demonstration
☐ Discuss: "Why are lumières important during winter?"
☐ Connect light celebrations across different cultures`,
    specificAction: `(27 minutes)
Part 1 - Hanukkah Learning (10 minutes):
☐ Learn the Hanukkah story and why it celebrates a miracle
☐ Count the huit nights and eight candles plus shamash
☐ Practice Hanukkah vocabulary: "Hanoukka dure huit jours"
☐ Explore Hanukkah symbols: menorah, dreidel, gelt

Part 2 - Light Celebration Activities (12 minutes):
☐ Create paper menorahs with huit candles for learning
☐ Practice simple dreidel game while learning Hebrew letters
☐ Make Hanukkah crafts celebrating lumières theme
☐ Practice: "Les lumières célèbrent le miracle"

Part 3 - Light and Hope Connections (5 minutes):
☐ Discuss how light brings hope during dark winter months
☐ Connect Hanukkah lights to other winter light traditions
☐ Practice: "La lumière apporte l'espoir" (Light brings hope)`,
    specificConsolidation: `(10 minutes)
☐ Share what we learned about Hanukkah and its miracle
☐ Practice Hanukkah vocabulary with respectful gestures
☐ Discuss how light celebrations bring hope in winter
☐ Plan to learn about Kwanzaa tomorrow
☐ Preview: "Tomorrow we explore Kwanzaa and African traditions!"`,
    materials: "• Hanukkah menorah for demonstration (battery candles for safety) • Paper menorah craft materials • Dreidel and game instructions • Hanukkah story book • Photos of Hanukkah celebrations • Light-themed craft supplies • Cultural respect discussion materials • Camera for Hanukkah learning documentation",
    learningGoals: "Students will learn about Hanukkah traditions with respect while understanding the significance of light celebrations and developing appreciation for Jewish cultural practices.",
    assessmentNotes: `Formative Assessment:
☐ Observe respectful engagement with Hanukkah learning
☐ Note appropriate use of Hanukkah vocabulary in French
☐ Check understanding of light symbolism through discussions
☐ Document cultural respect and sensitivity during activities
☐ Record ability to connect light themes across cultures`,
    differentiationStrategies: {
      forStruggling: "Visual Hanukkah supports with pictures, simplified story versions, peer partners for activities, hands-on menorah materials, reduced vocabulary expectations, extra time for cultural learning, gentle cultural introduction",
      forIEP: "Modified cultural learning expectations per IEP, assistive technology for story access, alternative demonstration methods, extended time for activities, one-on-one support during cultural exploration, adapted craft materials",
      forELL: "Hanukkah vocabulary cards with translations, bilingual story versions, visual cues for cultural activities, peer translation support, gestures for Hanukkah customs, connections to home culture light celebrations",
      forAdvanced: "Leadership in Hanukkah activities, independent research on Jewish traditions, creation of Hanukkah educational materials, peer teaching about customs, extended vocabulary exploration, critical analysis of light symbolism across cultures"
    }
  },

  {
    title: "Lesson 8: Kwanzaa - African Heritage Celebration / Kwanzaa - Célébration du patrimoine africain",
    date: new Date('2025-12-16'),
    vocabularyFr: ["principes", "unité", "héritage"],
    indigenousPerspectives: "Like Mi'kmaq teachings that emphasize seven sacred directions and community values, Kwanzaa celebrates seven principles that strengthen community bonds. Both traditions recognize that cultural héritage and community unité are essential for survival and growth, teaching children values that honor ancestors while building strong futures together.",
    specificMindsOn: `(8 minutes)
☐ Display Kwanzaa kinara and explain the seven candles and principes
☐ Share Kwanzaa's focus on African héritage and community values
☐ Practice "unité" while demonstrating unity gestures
☐ Discuss: "How do principes help build strong communities?"
☐ Connect Kwanzaa values to our classroom community`,
    specificAction: `(27 minutes)
Part 1 - Kwanzaa Principles Learning (10 minutes):
☐ Learn about the seven Kwanzaa principles with simple explanations
☐ Practice principle vocabulary: "L'unité nous rend forts"
☐ Explore Kwanzaa symbols: kinara, African colors, corn
☐ Connect principles to daily life and community building

Part 2 - Community Building Activities (12 minutes):
☐ Create Kwanzaa kinara crafts with seven candles
☐ Practice unity activities that demonstrate community principes
☐ Make African-inspired art celebrating héritage themes
☐ Practice: "Nous célébrons notre communauté ensemble"

Part 3 - Heritage Appreciation (5 minutes):
☐ Discuss how celebrating héritage strengthens communities
☐ Connect Kwanzaa to other heritage celebrations
☐ Practice: "Chaque culture a un bel héritage"`,
    specificConsolidation: `(10 minutes)
☐ Share favorite Kwanzaa principe and explain why it's important
☐ Practice Kwanzaa vocabulary with community-building gestures
☐ Discuss how we can show unité in our classroom
☐ Plan to learn about Diwali tomorrow
☐ Preview: "Tomorrow we explore Diwali and Indian traditions!"`,
    materials: "• Kwanzaa kinara and candle examples • Seven principles visual cards • African-inspired craft materials • Community-building activity props • Kwanzaa symbols for exploration • Heritage celebration photos • Unity circle materials • Camera for Kwanzaa learning documentation",
    learningGoals: "Students will learn about Kwanzaa principles with respect while understanding the importance of community heritage and developing appreciation for African-American cultural traditions.",
    assessmentNotes: `Formative Assessment:
☐ Observe respectful engagement with Kwanzaa learning
☐ Note appropriate use of principle vocabulary in French
☐ Check understanding of community values through participation
☐ Document cultural respect and appreciation during activities
☐ Record ability to connect principles to classroom community`,
    differentiationStrategies: {
      forStruggling: "Visual principle supports with pictures, simplified value explanations, peer partners for community activities, hands-on Kwanzaa materials, reduced vocabulary expectations, extra time for cultural learning, supportive community circle",
      forIEP: "Modified cultural learning expectations per IEP, assistive technology for principle access, alternative demonstration methods, extended time for activities, one-on-one support during cultural exploration, adapted craft materials",
      forELL: "Kwanzaa vocabulary cards with translations, bilingual principle explanations, visual cues for cultural activities, peer translation support, gestures for Kwanzaa customs, connections to home culture heritage celebrations",
      forAdvanced: "Leadership in Kwanzaa activities, independent research on African-American traditions, creation of principle educational materials, peer teaching about customs, extended vocabulary exploration, critical analysis of community values across cultures"
    }
  },

  {
    title: "Lesson 9: Diwali - Festival of Lights / Diwali - Festival des lumières",
    date: new Date('2025-12-17'),
    vocabularyFr: ["festival", "victoire", "bonté"],
    indigenousPerspectives: "Mi'kmaq winter teachings about light conquering darkness during the winter solstice share deep connections with Diwali's celebration of good triumphing over evil. Both traditions recognize that light represents hope, spiritual strength, and the victoire of positive forces, showing how Indigenous and Hindu philosophies honor similar sacred concepts about light and bonté.",
    specificMindsOn: `(8 minutes)
☐ Display beautiful Diwali diyas (oil lamps) and colorful rangoli patterns
☐ Share Diwali story of light's victoire over darkness
☐ Practice "festival" while observing safe light demonstrations
☐ Discuss: "How does light represent bonté in celebrations?"
☐ Connect Diwali lights to other festival traditions`,
    specificAction: `(27 minutes)
Part 1 - Diwali Discovery (10 minutes):
☐ Learn about Diwali traditions: lights, sweets, gifts, prayers
☐ Explore Diwali symbols: diyas, rangoli, fireworks, lotus
☐ Practice Diwali vocabulary: "Diwali est un beau festival"
☐ Connect light celebration to spiritual meanings

Part 2 - Light Festival Activities (12 minutes):
☐ Create safe paper diyas with LED tea lights
☐ Design colorful rangoli patterns with chalk or colored rice
☐ Make Diwali decorations celebrating light and bonté
☐ Practice: "Les lumières célèbrent la victoire du bien"

Part 3 - Good Over Evil Themes (5 minutes):
☐ Discuss how celebrations can promote bonté and kindness
☐ Connect Diwali themes to classroom values and behavior
☐ Practice: "Nous choisissons toujours la bonté"`,
    specificConsolidation: `(10 minutes)
☐ Share what we learned about Diwali and its message of bonté
☐ Practice Diwali vocabulary with respectful light gestures
☐ Discuss how festival celebrations inspire us to choose goodness
☐ Plan to learn about Indigenous winter ceremonies next week
☐ Preview: "Next week we explore Mi'kmaq winter traditions!"`,
    materials: "• Diwali diya examples and LED tea lights • Colorful rangoli pattern materials • Chalk or colored rice for designs • Diwali celebration photos • Hindu festival story books • Light-themed craft supplies • Cultural respect discussion props • Camera for Diwali learning documentation",
    learningGoals: "Students will learn about Diwali traditions with respect while understanding themes of light, goodness, and victory over darkness, developing appreciation for Hindu cultural practices.",
    assessmentNotes: `Formative Assessment:
☐ Observe respectful engagement with Diwali learning
☐ Note appropriate use of festival vocabulary in French
☐ Check understanding of light symbolism through activities
☐ Document cultural respect and sensitivity during exploration
☐ Record ability to connect light themes to positive values`,
    differentiationStrategies: {
      forStruggling: "Visual Diwali supports with pictures, simplified festival explanations, peer partners for light activities, hands-on diya materials, reduced vocabulary expectations, extra time for cultural learning, gentle introduction to themes",
      forIEP: "Modified cultural learning expectations per IEP, assistive technology for story access, alternative demonstration methods, extended time for activities, one-on-one support during cultural exploration, adapted craft materials",
      forELL: "Diwali vocabulary cards with translations, bilingual festival explanations, visual cues for cultural activities, peer translation support, gestures for Diwali customs, connections to home culture light celebrations",
      forAdvanced: "Leadership in Diwali activities, independent research on Hindu traditions, creation of festival educational materials, peer teaching about customs, extended vocabulary exploration, critical analysis of light symbolism across world cultures"
    }
  },

  // WEEK 4: Indigenous Winter Ceremonies (10-12)
  {
    title: "Lesson 10: Mi'kmaq Winter Stories / Histoires d'hiver mi'kmaques",
    date: new Date('2025-12-22'),
    vocabularyFr: ["histoires", "sagesse", "ancêtres"],
    indigenousPerspectives: "Mi'kmaq winter storytelling traditions were essential for passing down cultural sagesse during long winter months when families gathered together. Elders shared histoires that taught survival skills, spiritual values, and connections to ancêtres. These stories were not just entertainment but sacred teachings that helped children understand their place in the world and their responsibilities to community and creation.",
    specificMindsOn: `(8 minutes)
☐ Create traditional storytelling circle with respectful seating
☐ Introduce Mi'kmaq winter storytelling traditions and their importance
☐ Practice "histoires" while making storytelling gestures
☐ Discuss: "How do histoires teach us sagesse from our ancêtres?"
☐ Prepare hearts and minds for sacred story learning`,
    specificAction: `(27 minutes)
Part 1 - Traditional Story Learning (10 minutes):
☐ Listen respectfully to age-appropriate Mi'kmaq winter stories
☐ Learn about story meanings and cultural teachings
☐ Practice story vocabulary: "Les histoires contiennent de la sagesse"
☐ Understand stories as gifts from ancêtres

Part 2 - Story Reflection Activities (12 minutes):
☐ Draw pictures representing story teachings and meanings
☐ Discuss story lessons about respect, sharing, and survival
☐ Practice: "Nos ancêtres nous enseignent par les histoires"
☐ Create respectful responses to traditional teachings

Part 3 - Wisdom Sharing (5 minutes):
☐ Share what sagesse we learned from the stories
☐ Connect story teachings to our daily lives
☐ Practice: "Les histoires nous aident à grandir"`,
    specificConsolidation: `(10 minutes)
☐ Thank the storytelling tradition with respectful gratitude
☐ Practice story vocabulary with honor and respect
☐ Commit to remembering the sagesse shared through histoires
☐ Plan to learn about Mi'kmaq winter ceremonies tomorrow
☐ Preview: "Tomorrow we learn about winter ceremonies!"`,
    materials: "• Traditional storytelling circle setup • Age-appropriate Mi'kmaq winter stories • Respectful listening props • Drawing materials for story reflection • Cultural protocol materials • Elder or cultural knowledge keeper if available • Thank you gestures and practices • Camera for respectful documentation",
    learningGoals: "Students will listen respectfully to Mi'kmaq winter stories while understanding the cultural importance of traditional storytelling and developing appreciation for Indigenous wisdom teachings.",
    assessmentNotes: `Formative Assessment:
☐ Observe respectful listening during traditional storytelling
☐ Note appropriate use of cultural vocabulary in French
☐ Check understanding of story teachings through reflections
☐ Document cultural respect and protocol adherence
☐ Record ability to connect story wisdom to personal learning`,
    differentiationStrategies: {
      forStruggling: "Visual story supports with pictures, simplified cultural explanations, peer partners for reflection, hands-on story materials, reduced vocabulary expectations, extra time for cultural processing, supportive circle environment",
      forIEP: "Modified cultural learning expectations per IEP, assistive technology for story access, alternative reflection methods, extended time for activities, one-on-one support during cultural learning, adapted participation methods",
      forELL: "Story vocabulary cards with translations, bilingual cultural explanations, visual cues for story activities, peer translation support, gestures for story understanding, connections to home culture storytelling traditions",
      forAdvanced: "Leadership in respectful listening, independent research on Mi'kmaq traditions, creation of story reflection projects, peer support during cultural learning, extended vocabulary exploration, deeper analysis of cultural teachings"
    }
  },

  {
    title: "Lesson 11: Winter Ceremonies and Gatherings / Cérémonies et rassemblements d'hiver",
    date: new Date('2026-01-06'),
    vocabularyFr: ["cérémonie", "rassemblement", "respect"],
    indigenousPerspectives: "Mi'kmaq winter ceremonies brought communities together during the harshest season to maintain spiritual connections, share resources, and strengthen bonds essential for survival. These sacred rassemblements included prayers of gratitude, ceremonies honoring the winter spirits, and rituals that maintained harmony between people and the natural world. Each cérémonie reinforced community values of respect, sharing, and mutual support.",
    specificMindsOn: `(8 minutes)
☐ Create sacred space showing respect for ceremony learning
☐ Introduce Mi'kmaq winter ceremony traditions with appropriate reverence
☐ Practice "cérémonie" with respectful and reverent gestures
☐ Discuss: "How do cérémonies bring communities together with respect?"
☐ Prepare to learn about sacred winter traditions`,
    specificAction: `(27 minutes)
Part 1 - Ceremony Learning (10 minutes):
☐ Learn about Mi'kmaq winter ceremony purposes and meanings
☐ Understand ceremony as spiritual practice requiring respect
☐ Practice ceremony vocabulary: "Les cérémonies sont sacrées"
☐ Explore ceremony elements: prayers, songs, offerings, gratitude

Part 2 - Community Gathering Understanding (12 minutes):
☐ Learn about winter rassemblements and their community importance
☐ Understand how ceremonies strengthened winter survival
☐ Practice: "Les rassemblements montrent du respect"
☐ Create respectful expressions of gratitude and community

Part 3 - Respect and Protocol (5 minutes):
☐ Learn appropriate ways to show respect for ceremonies
☐ Understand cultural protocol and sacred boundaries
☐ Practice: "Nous montrons toujours du respect"`,
    specificConsolidation: `(10 minutes)
☐ Express gratitude for ceremony learning with appropriate respect
☐ Practice ceremony vocabulary with reverence and understanding
☐ Commit to showing respect for all sacred traditions
☐ Plan to learn about winter sharing traditions tomorrow
☐ Preview: "Tomorrow we explore Mi'kmaq sharing customs!"`,
    materials: "• Sacred space setup materials • Cultural protocol guides • Respectful ceremony information • Gratitude expression materials • Community gathering photos (if culturally appropriate) • Respect practice props • Cultural sensitivity resources • Appropriate documentation materials",
    learningGoals: "Students will learn about Mi'kmaq winter ceremonies with deep respect while understanding the sacred nature of Indigenous spiritual practices and developing cultural sensitivity.",
    assessmentNotes: `Formative Assessment:
☐ Observe respectful engagement with sacred ceremony learning
☐ Note appropriate use of ceremonial vocabulary with reverence
☐ Check understanding of cultural protocol through behavior
☐ Document consistent respect and cultural sensitivity
☐ Record ability to distinguish sacred from secular activities`,
    differentiationStrategies: {
      forStruggling: "Visual ceremony supports with respectful pictures, simplified sacred explanations, peer partners for protocol learning, hands-on respect materials, reduced vocabulary expectations, extra time for cultural reverence, supportive sacred environment",
      forIEP: "Modified cultural learning expectations per IEP while maintaining respect, assistive technology for ceremony access, alternative reverence methods, extended time for activities, one-on-one support during sacred learning, adapted respectful participation",
      forELL: "Ceremony vocabulary cards with translations, bilingual sacred explanations, visual cues for protocol activities, peer translation support, gestures for ceremony understanding, connections to home culture sacred traditions",
      forAdvanced: "Leadership in respectful ceremony learning, independent research on Indigenous spiritual practices, creation of respect educational materials, peer support during sacred learning, extended vocabulary exploration, deeper analysis of cultural reverence"
    }
  },

  {
    title: "Lesson 12: Sharing and Gratitude Traditions / Traditions de partage et de gratitude",
    date: new Date('2026-01-07'),
    vocabularyFr: ["gratitude", "générosité", "donner"],
    indigenousPerspectives: "Mi'kmaq winter survival depended on sharing and générosité within the community. Traditional teachings emphasized that winter tested not individual strength but community bonds. Families shared food, shelter, and resources with those in need, understanding that today's giver might be tomorrow's receiver. Gratitude ceremonies honored those who shared and recognized that all gifts ultimately came from the Creator.",
    specificMindsOn: `(8 minutes)
☐ Create sharing circle demonstrating Mi'kmaq gratitude traditions
☐ Share examples of traditional winter sharing and générosité customs
☐ Practice "gratitude" with thankful heart gestures
☐ Discuss: "How does donner strengthen our community?"
☐ Connect sharing traditions to winter survival and community`,
    specificAction: `(27 minutes)
Part 1 - Sharing Traditions Learning (10 minutes):
☐ Learn about Mi'kmaq winter sharing customs and community support
☐ Understand how générosité ensured community survival
☐ Practice sharing vocabulary: "Donner aux autres est important"
☐ Explore traditional gift-giving and resource sharing

Part 2 - Gratitude Practice Activities (12 minutes):
☐ Practice expressions of gratitude in traditional ways
☐ Create gratitude offerings or expressions honoring sharing
☐ Learn about thanking all beings and the Creator
☐ Practice: "Nous montrons de la gratitude chaque jour"

Part 3 - Community Sharing Projects (5 minutes):
☐ Plan ways to show générosité in our classroom community
☐ Practice sharing and giving with grateful hearts
☐ Practice: "Notre communauté grandit quand nous donnons"`,
    specificConsolidation: `(10 minutes)
☐ Express gratitude for learning about sharing traditions
☐ Practice gratitude vocabulary with genuine appreciation
☐ Commit to showing générosité in our daily lives
☐ Plan to create our class celebration next week
☐ Preview: "Next week we plan our own winter celebration!"`,
    materials: "• Sharing circle setup materials • Traditional sharing custom examples • Gratitude expression props • Gift-giving practice materials • Community sharing project supplies • Thankfulness activity materials • Appreciation circle props • Cultural respect documentation materials",
    learningGoals: "Students will understand Mi'kmaq sharing and gratitude traditions while developing appreciation for community générosité and learning to express genuine thankfulness.",
    assessmentNotes: `Formative Assessment:
☐ Observe understanding of sharing traditions through participation
☐ Note appropriate use of gratitude vocabulary with sincerity
☐ Check demonstration of generous spirit in activities
☐ Document cultural respect during sharing custom learning
☐ Record ability to express genuine appreciation and thankfulness`,
    differentiationStrategies: {
      forStruggling: "Visual sharing supports with pictures, simplified gratitude explanations, peer partners for sharing activities, hands-on generosity materials, reduced vocabulary expectations, extra time for community connection, supportive sharing environment",
      forIEP: "Modified sharing expectations per IEP, assistive technology for gratitude expression, alternative giving methods, extended time for activities, one-on-one support during community learning, adapted sharing participation",
      forELL: "Sharing vocabulary cards with translations, bilingual gratitude explanations, visual cues for community activities, peer translation support, gestures for sharing understanding, connections to home culture gratitude traditions",
      forAdvanced: "Leadership in sharing activities, independent research on Indigenous generosity traditions, creation of gratitude educational materials, peer support during community learning, extended vocabulary exploration, deeper analysis of sharing philosophies"
    }
  },

  // WEEK 5: Our Class Celebration (13-15)
  {
    title: "Lesson 13: Planning Our Winter Celebration / Planifier notre célébration d'hiver",
    date: new Date('2026-01-08'),
    vocabularyFr: ["planifier", "inclure", "ensemble"],
    indigenousPerspectives: "Mi'kmaq decision-making traditions emphasized consensus and inclusion, ensuring all community members had voice in planning gatherings. Traditional winter celebrations required careful planification with everyone contributing their gifts and talents. This collaborative approach ensured celebrations truly represented the whole community and honored all participants ensemble.",
    specificMindsOn: `(8 minutes)
☐ Create collaborative planning circle following Mi'kmaq consensus traditions
☐ Review all winter celebrations learned throughout our unit
☐ Practice "planifier" with collaborative planning gestures
☐ Discuss: "How can we inclure all traditions ensemble in our celebration?"
☐ Set inclusive and respectful tone for celebration planning`,
    specificAction: `(27 minutes)
Part 1 - Celebration Brainstorming (10 minutes):
☐ Brainstorm elements from all winter celebrations studied
☐ Include Christmas, Hanukkah, Kwanzaa, Diwali, and Mi'kmaq traditions
☐ Practice planning vocabulary: "Nous voulons inclure tout le monde"
☐ Ensure all students feel represented in celebration plans

Part 2 - Collaborative Planning (12 minutes):
☐ Work ensemble to choose celebration activities
☐ Assign roles and responsibilities democratically
☐ Plan decorations representing diverse winter traditions
☐ Practice: "Nous planifions ensemble avec respect"

Part 3 - Inclusion Commitment (5 minutes):
☐ Commit to making celebration welcoming for all families
☐ Practice respectful ways to honor different traditions
☐ Practice: "Notre célébration inclut toutes les familles"`,
    specificConsolidation: `(10 minutes)
☐ Review our inclusive celebration plan with excitement
☐ Practice celebration planning vocabulary with anticipation
☐ Thank everyone for collaborative spirit in planification
☐ Plan to prepare celebration materials tomorrow
☐ Preview: "Tomorrow we prepare for our special celebration!"`,
    materials: "• Collaborative planning circle setup • All winter celebration reference materials • Planning charts and organizers • Inclusive celebration examples • Democratic decision-making tools • Representation check materials • Celebration planning supplies • Documentation materials for planning process",
    learningGoals: "Students will collaboratively plan inclusive winter celebration while practicing democratic decision-making and ensuring all cultural traditions are respectfully represented.",
    assessmentNotes: `Formative Assessment:
☐ Observe collaborative planning participation and democratic engagement
☐ Note appropriate use of planning vocabulary in French
☐ Check commitment to inclusion and cultural representation
☐ Document respectful consideration of all traditions during planning
☐ Record ability to work together toward shared celebration goals`,
    differentiationStrategies: {
      forStruggling: "Visual planning supports with pictures, simplified planning roles, peer partners for collaboration, hands-on planning materials, reduced vocabulary expectations, extra time for planning participation, supportive planning environment",
      forIEP: "Modified planning expectations per IEP, assistive technology for collaboration, alternative participation methods, extended time for activities, one-on-one support during democratic planning, adapted planning roles",
      forELL: "Planning vocabulary cards with translations, bilingual collaboration support, visual cues for planning activities, peer translation assistance, gestures for planning understanding, connections to home culture celebration planning",
      forAdvanced: "Leadership in collaborative planning, independent research on celebration logistics, creation of planning educational materials, peer support during democratic process, extended vocabulary exploration, critical analysis of inclusive celebration design"
    }
  },

  {
    title: "Lesson 14: Preparing Our Celebration / Préparer notre célébration",
    date: new Date('2026-01-09'),
    vocabularyFr: ["préparer", "décorer", "créer"],
    indigenousPerspectives: "Mi'kmaq celebration preparation involved the entire community, with each person contributing their skills and creativity. Traditional winter gathering preparation included making decorations from natural materials, preparing special foods, and créer artistic expressions that honored the season. Everyone's contribution was valued and essential for successful community celebrations.",
    specificMindsOn: `(8 minutes)
☐ Display preparation materials representing all winter traditions studied
☐ Review celebration preparation roles and responsibilities
☐ Practice "préparer" with enthusiastic preparation gestures
☐ Discuss: "How can we créer beautiful décorations together?"
☐ Set collaborative and creative tone for celebration preparation`,
    specificAction: `(27 minutes)
Part 1 - Decoration Creation (12 minutes):
☐ Create decorations representing all winter celebrations studied
☐ Work in diverse groups to décorer celebration space
☐ Include elements from Christmas, Hanukkah, Kwanzaa, Diwali, Mi'kmaq traditions
☐ Practice: "Nous créons de belles décorations ensemble"

Part 2 - Activity Preparation (10 minutes):
☐ Prepare celebration activities and demonstrations
☐ Practice sharing about different winter traditions
☐ Set up stations for celebration participation
☐ Practice: "Nous nous préparons pour notre fête"

Part 3 - Final Preparation (5 minutes):
☐ Complete celebration setup with attention to inclusion
☐ Review celebration roles and responsibilities
☐ Practice: "Tout est prêt pour notre célébration!"`,
    specificConsolidation: `(10 minutes)
☐ Admire our beautiful preparation work with pride
☐ Practice preparation vocabulary with accomplishment
☐ Express excitement for tomorrow's celebration
☐ Thank everyone for their hard work in preparation
☐ Preview: "Tomorrow we celebrate all winter traditions together!"`,
    materials: "• Decoration materials representing all winter traditions • Craft supplies for diverse decorations • Celebration setup materials • Activity preparation props • Station setup supplies • Inclusive decoration examples • Preparation role charts • Documentation materials for preparation process",
    learningGoals: "Students will prepare inclusive winter celebration decorations and activities while demonstrating creativity, collaboration, and respect for diverse cultural traditions.",
    assessmentNotes: `Formative Assessment:
☐ Observe creative participation in decoration preparation
☐ Note appropriate use of preparation vocabulary in French
☐ Check collaborative work skills during preparation activities
☐ Document cultural respect during diverse decoration creation
☐ Record quality of preparation contributions and teamwork`,
    differentiationStrategies: {
      forStruggling: "Visual preparation supports with pictures, simplified preparation tasks, peer partners for decoration creation, hands-on preparation materials, reduced vocabulary expectations, extra time for preparation activities, supportive creative environment",
      forIEP: "Modified preparation expectations per IEP, assistive technology for decoration creation, alternative preparation methods, extended time for activities, one-on-one support during preparation work, adapted creative tasks",
      forELL: "Preparation vocabulary cards with translations, bilingual preparation support, visual cues for decoration activities, peer translation assistance, gestures for preparation understanding, connections to home culture celebration preparation",
      forAdvanced: "Leadership in preparation activities, independent research on celebration decoration traditions, creation of preparation instructional materials, peer support during creative work, extended vocabulary exploration, critical analysis of inclusive celebration design"
    }
  },

  {
    title: "Lesson 15: Our Winter Celebration! / Notre célébration d'hiver!",
    date: new Date('2026-01-10'),
    vocabularyFr: ["célébrer", "fierté", "souvenir"],
    indigenousPerspectives: "Mi'kmaq winter celebrations culminated in joyful gatherings where community members shared their preparations, honored all contributions, and created lasting souvenirs of unity and resilience. These celebrations strengthened community bonds and created memories that sustained people through remaining winter months, demonstrating the power of coming together with fierté and gratitude.",
    specificMindsOn: `(8 minutes)
☐ Welcome families and community to our inclusive winter celebration
☐ Share gratitude for learning about diverse winter traditions
☐ Practice "célébrer" with joyful celebration gestures
☐ Express: "Nous célébrons avec fierté toutes les traditions!"
☐ Set tone of joy, respect, and community celebration`,
    specificAction: `(27 minutes)
Part 1 - Tradition Sharing Stations (12 minutes):
☐ Families visit stations representing different winter celebrations
☐ Students demonstrate learning about Christmas, Hanukkah, Kwanzaa, Diwali
☐ Share Mi'kmaq winter traditions with respect and understanding
☐ Practice: "Nous partageons nos souvenirs d'apprentissage"

Part 2 - Community Celebration Activities (10 minutes):
☐ Participate in inclusive celebration activities together
☐ Families join in respectful appreciation of diverse traditions
☐ Create celebration memories through photos and shared experiences
☐ Practice: "Notre communauté célèbre ensemble"

Part 3 - Gratitude and Reflection (5 minutes):
☐ Express gratitude for learning journey and family participation
☐ Share celebration highlights and favorite learning memories
☐ Practice: "Nous gardons ces beaux souvenirs pour toujours"`,
    specificConsolidation: `(10 minutes)
☐ Thank families and community for celebrating with us
☐ Express fierté in our learning about winter traditions
☐ Commit to carrying celebration spirit throughout winter
☐ Create lasting souvenirs of our beautiful celebration
☐ Celebrate successful completion of winter traditions unit!`,
    materials: "• Celebration station setup materials • Family welcome materials • Tradition demonstration props • Community celebration decorations • Photo documentation equipment • Gratitude expression materials • Celebration memory keepsakes • Thank you materials for families",
    learningGoals: "Students will celebrate winter traditions with families while demonstrating learning, cultural respect, and community pride in their understanding of diverse celebration practices.",
    assessmentNotes: `Summative Assessment:
☐ Demonstrate comprehensive understanding of winter celebrations studied
☐ Show appropriate use of celebration vocabulary in French throughout event
☐ Display cultural respect and sensitivity during all celebration activities
☐ Express genuine appreciation for diverse winter traditions
☐ Participate successfully in community celebration with families`,
    differentiationStrategies: {
      forStruggling: "Visual celebration supports with pictures, simplified sharing expectations, peer partners for family interaction, hands-on celebration materials, reduced vocabulary requirements, extra time for celebration participation, supportive family environment",
      forIEP: "Modified celebration expectations per IEP, assistive technology for family communication, alternative demonstration methods, extended time for activities, one-on-one support during celebration, adapted participation methods",
      forELL: "Celebration vocabulary cards with translations, bilingual family communication support, visual cues for celebration activities, peer translation assistance, gestures for celebration demonstration, encouragement for home language sharing with families",
      forAdvanced: "Leadership in celebration facilitation, independent demonstration of advanced learning, creation of celebration educational displays, peer support during family interactions, extended vocabulary demonstration, critical reflection on cultural learning journey"
    }
  }
];

async function createWinterCelebrationLesson(lessonData, unitPlanId, userId) {
  return await prisma.eTFOLessonPlan.create({
    data: {
      title: lessonData.title,
      date: lessonData.date,
      duration: 45,
      subject: "Sciences humaines", // Social Studies in French
      grade: 1,
      language: "French",
      unitPlanId: unitPlanId,
      userId: userId,
      
      mindsOn: lessonData.specificMindsOn,
      action: lessonData.specificAction,
      consolidation: lessonData.specificConsolidation,
      
      learningGoals: lessonData.learningGoals,
      
      materials: JSON.stringify({
        list: lessonData.materials,
        vocabularyFr: lessonData.vocabularyFr,
        culturalArtifacts: "celebration artifacts, cultural items, traditional decorations"
      }),
      
      assessmentNotes: lessonData.assessmentNotes,
      
      differentiationStrategies: lessonData.differentiationStrategies,
      
      indigenousPerspectives: lessonData.indigenousPerspectives,
      
      reflectionActivities: JSON.stringify({
        teacherReflection: `• How effectively did students demonstrate cultural respect and sensitivity during today's celebration learning?
• Which students showed strong progress in appreciation for diverse traditions and which need additional support?
• How can I adjust tomorrow's lesson based on today's observations of student cultural understanding?
• What extension opportunities would deepen cultural appreciation for advanced learners?
• How well did the Indigenous perspectives connect meaningfully to the celebration learning goals?
• What aspects of cultural differentiation were most successful for diverse learners today?
• How did students respond to the inclusive celebration activities and cultural appreciation?`,
        crossCurricular: `• Language Arts: Celebration vocabulary development, oral communication during cultural sharing, listening comprehension during tradition stories
• Mathematics: Counting in celebration activities, patterns in cultural decorations, time concepts in celebration calendars
• Arts: Cultural creative expression, traditional decoration creation, celebration music appreciation  
• Geography: World map exploration, country identification, cultural region understanding
• Health: Social-emotional learning through cultural respect, community celebration benefits, inclusive participation skills
• Science: Light exploration in celebrations, seasonal awareness, cultural adaptation to winter climates`
      })
    }
  });
}

async function main() {
  try {
    console.log('🎊 Adding remaining Winter Celebrations lessons (4-15)...');
    
    // Find Emily's user record
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily user not found');
    }
    
    console.log(`✅ Found Emily (ID: ${emily.id})`);
    
    // Find the Winter Celebrations unit plan
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        title: 'Winter Celebrations / Célébrations d\'hiver',
        userId: emily.id
      }
    });
    
    if (!unitPlan) {
      throw new Error('Winter Celebrations unit plan not found');
    }
    
    console.log(`✅ Found unit plan "${unitPlan.title}" (ID: ${unitPlan.id})`);
    
    // Create remaining 12 lessons (4-15)
    console.log('🎊 Creating remaining Winter Celebrations lessons...');
    
    let createdCount = 0;
    for (const lessonData of remainingLessons) {
      await createWinterCelebrationLesson(lessonData, unitPlan.id, emily.id);
      createdCount++;
      console.log(`✅ Created lesson ${createdCount + 3}/15: ${lessonData.title}`);
    }
    
    console.log(`\n🎉 SUCCESS! Added ${createdCount} more Winter Celebrations lessons`);
    console.log(`📚 Total unit now has 15 complete Social Studies lessons`);
    
    console.log('\n🌍 Complete Winter Celebrations Unit Schedule:');
    console.log('Week 1 (Dec 1-3): Understanding Celebrations (lessons 1-3) ✅');
    console.log('Week 2 (Dec 8-10): Christmas Traditions (lessons 4-6) ✅');
    console.log('Week 3 (Dec 15-17): Other Winter Celebrations (lessons 7-9) ✅');
    console.log('Week 4 (Dec 22, Jan 6-7): Indigenous Winter Ceremonies (lessons 10-12) ✅');
    console.log('Week 5 (Jan 8-10): Our Class Celebration (lessons 13-15) ✅');
    
  } catch (error) {
    console.error('❌ Error adding remaining lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
main()
  .then(() => {
    console.log('\n✨ All 15 Winter Celebrations lessons completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });