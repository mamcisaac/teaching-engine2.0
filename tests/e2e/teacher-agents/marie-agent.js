/**
 * Marie Agent - Music and Arts Specialist Teacher
 * Focuses on specialist subjects and cross-curricular connections
 */

const puppeteer = require('puppeteer');
const NavigationHelper = require('../helpers/navigation');
const { 
  generateArtifact,
  randomChoice,
  randomInt
} = require('../helpers/data-generators');

class MarieAgent {
  constructor(credentials, students, options = {}) {
    this.credentials = credentials;
    this.students = students;
    this.options = {
      headless: options.headless !== false,
      slowMo: options.slowMo || 0,
      baseURL: options.baseURL || 'http://localhost:5173'
    };
    
    this.browser = null;
    this.page = null;
    this.nav = null;
    this.performancesRecorded = 0;
    this.creativityAssessed = 0;
  }

  async initialize() {
    console.log('🎨 Marie Agent (Specialist): Initializing...');
    
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      slowMo: this.options.slowMo,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    this.nav = new NavigationHelper(this.page);

    await this.nav.login(this.credentials);
    console.log('✅ Marie Agent: Ready for arts and music instruction');
  }

  /**
   * Assess specialist subjects
   */
  async assessSpecialistSubjects() {
    console.log('🎭 Marie Agent: Starting specialist assessment routine...');
    
    try {
      // Morning: Music class assessments
      await this.assessMusicClass(8);
      
      // Upload performance recordings
      await this.uploadPerformanceVideos(3);
      
      // Afternoon: Visual arts assessments
      await this.assessArtClass(8);
      
      // Document creative process
      await this.documentCreativeProcess(5);
      
      // Cross-curricular connections
      await this.recordCrossCurricularConnections();
      
      console.log(`✅ Marie Agent: Specialist assessments complete!`);
      console.log(`   🎵 Performances recorded: ${this.performancesRecorded}`);
      console.log(`   🎨 Creativity assessed: ${this.creativityAssessed}`);
      
      return {
        success: true,
        performancesRecorded: this.performancesRecorded,
        creativityAssessed: this.creativityAssessed
      };
      
    } catch (error) {
      console.error('❌ Marie Agent - Assessment Error:', error);
      await this.nav.screenshot('marie-error');
      throw error;
    }
  }

  /**
   * Assess music class
   */
  async assessMusicClass(numStudents) {
    console.log(`🎵 Marie: Assessing ${numStudents} students in music class`);
    
    await this.nav.navigateToSection('assessment');
    
    const selectedStudents = this.selectRandomStudents(numStudents);
    
    for (const student of selectedStudents) {
      try {
        await this.page.click('[data-testid="add-assessment-btn"]');
        await this.page.waitForSelector('[data-testid="assessment-form"]', { timeout: 5000 });
        
        // Select student
        await this.page.type('[data-testid="student-search"]', student.firstName);
        await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
        await this.page.click(`[data-student-id="${student.studentId}"]`);
        
        // Select music as subject
        await this.nav.selectOption('[data-testid="subject-select"]', 'Musique');
        
        // Music-specific expectations
        const musicExpectations = [
          'Maintient le rythme',
          'Chante avec justesse',
          'Participe aux activités musicales',
          'Explore les instruments',
          'Exprime la créativité musicale'
        ];
        
        // Select expectation
        const expectationExists = await this.nav.exists('[data-testid="custom-expectation"]');
        if (expectationExists) {
          await this.page.type('[data-testid="custom-expectation"]', randomChoice(musicExpectations));
        }
        
        // Music students often excel or meet
        const masteryLevel = randomChoice(['MEETING', 'MEETING', 'EXCEEDING']);
        await this.page.click(`[data-testid="mastery-${masteryLevel.toLowerCase()}"]`);
        
        // Usually observation for music
        await this.page.click('[data-testid="evidence-observation"]');
        
        // Add music-specific notes
        const notes = this.generateMusicNote(student);
        await this.page.type('[data-testid="assessment-notes"]', notes);
        
        // Save
        await this.page.click('[data-testid="save-assessment-btn"]');
        await this.nav.waitForSuccess();
        
        this.performancesRecorded++;
        console.log(`   ✅ Music assessment recorded for ${student.firstName}`);
        
      } catch (error) {
        console.error(`   ❌ Failed to assess ${student.firstName} in music`);
      }
    }
  }

  /**
   * Upload performance videos
   */
  async uploadPerformanceVideos(numVideos) {
    console.log(`📹 Marie: Uploading ${numVideos} performance videos`);
    
    await this.nav.navigateToSection('artifacts');
    
    for (let i = 0; i < numVideos; i++) {
      const students = this.selectRandomStudents(randomInt(3, 5)); // Group performances
      
      try {
        await this.page.click('[data-testid="upload-artifact-btn"]');
        await this.page.waitForSelector('[data-testid="upload-form"]', { timeout: 5000 });
        
        // Select multiple students for group performance
        for (const student of students) {
          const studentCheckbox = await this.page.$(`[data-student-checkbox="${student.studentId}"]`);
          if (studentCheckbox) {
            await studentCheckbox.click();
          }
        }
        
        // Mock video file
        const artifact = {
          fileName: `music_performance_${Date.now()}.mp4`,
          mimeType: 'video/mp4',
          title: randomChoice([
            'Chanson de bienvenue - Performance de groupe',
            'Exploration rythmique avec instruments',
            'Comptine française - Présentation',
            'Improvisation musicale créative'
          ]),
          description: 'Performance musicale documentant l\'apprentissage et la créativité'
        };
        
        // Simulate file upload
        const fileInput = await this.page.$('input[type="file"]');
        if (fileInput) {
          await this.page.evaluate((fileName, mimeType) => {
            const input = document.querySelector('input[type="file"]');
            const dt = new DataTransfer();
            const file = new File(['video content'], fileName, { type: mimeType });
            dt.items.add(file);
            input.files = dt.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }, artifact.fileName, artifact.mimeType);
        }
        
        await this.page.type('[data-testid="artifact-title"]', artifact.title);
        await this.page.type('[data-testid="artifact-description"]', artifact.description);
        
        // Tag as performance
        if (await this.nav.exists('[data-testid="tag-performance"]')) {
          await this.page.click('[data-testid="tag-performance"]');
        }
        
        await this.page.click('[data-testid="upload-btn"]');
        await this.nav.waitForSuccess();
        
        console.log(`   ✅ Performance video uploaded for ${students.length} students`);
        
      } catch (error) {
        console.error(`   ❌ Failed to upload performance video`);
      }
    }
  }

  /**
   * Assess art class
   */
  async assessArtClass(numStudents) {
    console.log(`🎨 Marie: Assessing ${numStudents} students in visual arts`);
    
    await this.nav.navigateToSection('assessment');
    
    const selectedStudents = this.selectRandomStudents(numStudents);
    
    for (const student of selectedStudents) {
      try {
        await this.page.click('[data-testid="add-assessment-btn"]');
        await this.page.waitForSelector('[data-testid="assessment-form"]', { timeout: 5000 });
        
        // Select student
        await this.page.type('[data-testid="student-search"]', student.firstName);
        await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
        await this.page.click(`[data-student-id="${student.studentId}"]`);
        
        // Select visual arts
        await this.nav.selectOption('[data-testid="subject-select"]', 'Arts visuels');
        
        // Art-specific expectations
        const artExpectations = [
          'Utilise différents médiums artistiques',
          'Exprime des idées créatives',
          'Explore les couleurs et textures',
          'Démontre la motricité fine',
          'Apprécie l\'art des autres'
        ];
        
        const expectationExists = await this.nav.exists('[data-testid="custom-expectation"]');
        if (expectationExists) {
          await this.page.type('[data-testid="custom-expectation"]', randomChoice(artExpectations));
        }
        
        // Art often sees exceeding due to creativity
        const masteryLevel = randomChoice(['MEETING', 'EXCEEDING', 'EXCEEDING']);
        await this.page.click(`[data-testid="mastery-${masteryLevel.toLowerCase()}"]`);
        
        // Product evidence for art
        await this.page.click('[data-testid="evidence-product"]');
        
        // Add art notes
        const notes = this.generateArtNote(student);
        await this.page.type('[data-testid="assessment-notes"]', notes);
        
        // Save
        await this.page.click('[data-testid="save-assessment-btn"]');
        await this.nav.waitForSuccess();
        
        this.creativityAssessed++;
        console.log(`   ✅ Art assessment recorded for ${student.firstName}`);
        
      } catch (error) {
        console.error(`   ❌ Failed to assess ${student.firstName} in art`);
      }
    }
  }

  /**
   * Document creative process
   */
  async documentCreativeProcess(numArtworks) {
    console.log(`🖼️ Marie: Documenting ${numArtworks} student artworks`);
    
    await this.nav.navigateToSection('artifacts');
    
    for (let i = 0; i < numArtworks; i++) {
      const student = randomChoice(this.students);
      
      try {
        await this.page.click('[data-testid="upload-artifact-btn"]');
        await this.page.waitForSelector('[data-testid="upload-form"]', { timeout: 5000 });
        
        await this.nav.selectOption('[data-testid="student-select"]', student.studentId);
        
        // Mock artwork photo
        const artifact = {
          fileName: `artwork_${student.studentId}_${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
          title: randomChoice([
            'Peinture - Les couleurs de l\'automne',
            'Collage - Ma famille',
            'Dessin - Mon animal préféré',
            'Sculpture - Formes et textures',
            'Art collaboratif - Notre communauté'
          ]),
          description: `Processus créatif documenté. ${student.firstName} a exploré ${randomChoice(['les couleurs', 'les formes', 'les textures', 'les motifs'])} avec ${randomChoice(['enthousiasme', 'créativité', 'concentration', 'innovation'])}.`
        };
        
        // Simulate file upload
        const fileInput = await this.page.$('input[type="file"]');
        if (fileInput) {
          await this.page.evaluate((fileName, mimeType) => {
            const input = document.querySelector('input[type="file"]');
            const dt = new DataTransfer();
            const file = new File(['image content'], fileName, { type: mimeType });
            dt.items.add(file);
            input.files = dt.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }, artifact.fileName, artifact.mimeType);
        }
        
        await this.page.type('[data-testid="artifact-title"]', artifact.title);
        await this.page.type('[data-testid="artifact-description"]', artifact.description);
        
        // Tag creative process
        const tagsToAdd = ['créativité', 'processus', 'exploration'];
        for (const tag of tagsToAdd) {
          if (await this.nav.exists(`[data-testid="tag-${tag}"]`)) {
            await this.page.click(`[data-testid="tag-${tag}"]`);
          }
        }
        
        await this.page.click('[data-testid="upload-btn"]');
        await this.nav.waitForSuccess();
        
        console.log(`   ✅ Artwork documented for ${student.firstName}`);
        
      } catch (error) {
        console.error(`   ❌ Failed to document artwork`);
      }
    }
  }

  /**
   * Record cross-curricular connections
   */
  async recordCrossCurricularConnections() {
    console.log('🔗 Marie: Recording cross-curricular connections');
    
    const connections = [
      {
        arts: 'Musique',
        connected: 'Mathématiques',
        activity: 'Exploration des patterns rythmiques',
        note: 'Les élèves ont créé des patterns musicaux en lien avec les suites numériques'
      },
      {
        arts: 'Arts visuels',
        connected: 'Sciences de la nature',
        activity: 'Art inspiré par la nature',
        note: 'Observation scientifique des feuilles suivie de création artistique'
      },
      {
        arts: 'Musique',
        connected: 'Français (Immersion)',
        activity: 'Chansons pour le vocabulaire',
        note: 'Apprentissage du nouveau vocabulaire à travers les comptines'
      }
    ];
    
    await this.nav.navigateToSection('assessment');
    
    for (const connection of connections) {
      try {
        // Add cross-curricular note
        const crossCurricularExists = await this.nav.exists('[data-testid="cross-curricular-btn"]');
        if (crossCurricularExists) {
          await this.page.click('[data-testid="cross-curricular-btn"]');
          await this.page.waitForSelector('[data-testid="cross-curricular-form"]', { timeout: 5000 });
          
          await this.nav.selectOption('[data-testid="primary-subject"]', connection.arts);
          await this.nav.selectOption('[data-testid="connected-subject"]', connection.connected);
          await this.page.type('[data-testid="activity-description"]', connection.activity);
          await this.page.type('[data-testid="connection-notes"]', connection.note);
          
          await this.page.click('[data-testid="save-connection"]');
          await this.nav.waitForSuccess();
          
          console.log(`   ✅ Cross-curricular connection: ${connection.arts} ↔ ${connection.connected}`);
        }
        
      } catch (error) {
        console.error('   ⚠️ Could not record cross-curricular connection');
      }
    }
  }

  /**
   * Generate music assessment note
   */
  generateMusicNote(student) {
    const notes = [
      `${student.firstName} maintient le rythme avec précision. Participe avec enthousiasme aux activités de groupe.`,
      `Excellente exploration des instruments de percussion. ${student.firstName} démontre un sens musical naturel.`,
      `Chante avec confiance et justesse. Mémorise facilement les nouvelles chansons.`,
      `Créativité remarquable dans l'improvisation rythmique. ${student.firstName} inspire les autres élèves.`,
      `Bonne écoute et respect du tour de parole musical. Progression constante dans la coordination.`
    ];
    
    return randomChoice(notes);
  }

  /**
   * Generate art assessment note
   */
  generateArtNote(student) {
    const notes = [
      `${student.firstName} explore les couleurs avec créativité. Utilisation innovante des matériaux.`,
      `Excellent contrôle de la motricité fine. Les détails dans le travail montrent de la concentration.`,
      `Expression personnelle forte à travers l'art. ${student.firstName} raconte des histoires visuelles.`,
      `Collaboration exemplaire dans les projets de groupe. Partage généreusement les idées créatives.`,
      `Persévérance admirable dans les projets complexes. ${student.firstName} raffine son travail avec soin.`
    ];
    
    return randomChoice(notes);
  }

  /**
   * Select random students
   */
  selectRandomStudents(count) {
    const shuffled = [...this.students].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Cleanup
   */
  async cleanup() {
    console.log('🧹 Marie Agent: Cleaning up...');
    
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = MarieAgent;