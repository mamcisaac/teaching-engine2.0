/**
 * Sophie Agent - Educational Assistant
 * Focuses on supporting struggling students and IEP accommodations
 */

const puppeteer = require('puppeteer');
const NavigationHelper = require('../helpers/navigation');
const { 
  generateAssessmentNote,
  generateArtifact,
  randomChoice,
  randomInt
} = require('../helpers/data-generators');

class SophieAgent {
  constructor(credentials, students, options = {}) {
    this.credentials = credentials;
    // Sophie focuses on students needing support
    this.targetStudents = students.filter(s => 
      s.notes?.toLowerCase().includes('iep') ||
      s.notes?.toLowerCase().includes('support') ||
      s.notes?.toLowerCase().includes('english as additional')
    );
    
    if (this.targetStudents.length === 0) {
      // If no specific support students, take first 5
      this.targetStudents = students.slice(0, 5);
    }
    
    this.options = {
      headless: options.headless !== false,
      slowMo: options.slowMo || 0,
      baseURL: options.baseURL || 'http://localhost:5173'
    };
    
    this.browser = null;
    this.page = null;
    this.nav = null;
    this.interventionsRecorded = 0;
    this.accommodationsDocumented = 0;
  }

  async initialize() {
    console.log('👩‍🏫 Sophie Agent (EA): Initializing...');
    console.log(`   Supporting ${this.targetStudents.length} students with additional needs`);
    
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      slowMo: this.options.slowMo,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    this.nav = new NavigationHelper(this.page);

    await this.nav.login(this.credentials);
    console.log('✅ Sophie Agent: Ready to support students');
  }

  /**
   * Perform educational assistant daily routine
   */
  async supportStudents() {
    console.log('🤝 Sophie Agent: Starting support routine...');
    
    try {
      // Morning: Check IEP goals and accommodations
      await this.reviewIEPGoals();
      
      // Small group intervention (reading support)
      await this.conductSmallGroupIntervention('reading', 3);
      
      // One-on-one support sessions
      await this.provideIndividualSupport(2);
      
      // Document accommodations used
      await this.documentAccommodations();
      
      // Afternoon: Math support group
      await this.conductSmallGroupIntervention('math', 3);
      
      // Upload adapted materials
      await this.uploadAdaptedWork();
      
      // End of day: Progress notes for IEP students
      await this.updateProgressNotes();
      
      console.log(`✅ Sophie Agent: Support routine complete!`);
      console.log(`   📝 Interventions recorded: ${this.interventionsRecorded}`);
      console.log(`   ♿ Accommodations documented: ${this.accommodationsDocumented}`);
      
      return {
        success: true,
        interventionsRecorded: this.interventionsRecorded,
        accommodationsDocumented: this.accommodationsDocumented,
        studentsSupported: this.targetStudents.length
      };
      
    } catch (error) {
      console.error('❌ Sophie Agent - Support Error:', error);
      await this.nav.screenshot('sophie-error');
      throw error;
    }
  }

  /**
   * Review IEP goals for target students
   */
  async reviewIEPGoals() {
    console.log('📋 Sophie: Reviewing IEP goals and accommodations...');
    
    await this.nav.navigateToSection('students');
    
    for (const student of this.targetStudents.slice(0, 3)) {
      try {
        // Search for student
        await this.nav.search(student.firstName);
        await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
        
        // Open student profile
        await this.page.click(`[data-student-id="${student.studentId}"]`);
        await this.page.waitForSelector('[data-testid="student-profile"]', { timeout: 5000 });
        
        // Check for IEP section
        const iepExists = await this.nav.exists('[data-testid="iep-section"]');
        if (iepExists) {
          console.log(`   📌 Reviewing IEP for ${student.firstName}`);
          
          // Would normally read and plan based on IEP goals
          await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
        }
        
        // Return to student list
        await this.nav.navigateToSection('students');
        
      } catch (error) {
        console.error(`   ⚠️ Could not review IEP for ${student.firstName}`);
      }
    }
  }

  /**
   * Conduct small group intervention session
   */
  async conductSmallGroupIntervention(subject, numStudents) {
    console.log(`👥 Sophie: Conducting ${subject} intervention with ${numStudents} students`);
    
    await this.nav.navigateToSection('assessment');
    
    const groupStudents = this.targetStudents.slice(0, numStudents);
    
    for (const student of groupStudents) {
      try {
        // Record intervention assessment
        await this.page.click('[data-testid="add-assessment-btn"]');
        await this.page.waitForSelector('[data-testid="assessment-form"]', { timeout: 5000 });
        
        // Select student
        await this.page.type('[data-testid="student-search"]', student.firstName);
        await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
        await this.page.click(`[data-student-id="${student.studentId}"]`);
        
        // Select subject based on intervention
        const subjectMap = {
          'reading': 'Français (Immersion)',
          'math': 'Mathématiques'
        };
        await this.nav.selectOption('[data-testid="subject-select"]', subjectMap[subject]);
        
        // Small group interventions often show "approaching" progress
        await this.page.click('[data-testid="mastery-approaching"]');
        
        // Always conversation type for interventions
        await this.page.click('[data-testid="evidence-conversation"]');
        
        // Add intervention notes
        const notes = this.generateInterventionNote(subject, student);
        await this.page.type('[data-testid="assessment-notes"]', notes);
        
        // Note accommodation used
        const accommodationExists = await this.nav.exists('[data-testid="accommodation-used"]');
        if (accommodationExists) {
          await this.page.click('[data-testid="accommodation-visual-supports"]');
          await this.page.click('[data-testid="accommodation-extra-time"]');
          this.accommodationsDocumented++;
        }
        
        // Save
        await this.page.click('[data-testid="save-assessment-btn"]');
        await this.nav.waitForSuccess();
        
        this.interventionsRecorded++;
        console.log(`   ✅ Intervention recorded for ${student.firstName}`);
        
      } catch (error) {
        console.error(`   ❌ Failed to record intervention for ${student.firstName}`);
      }
    }
  }

  /**
   * Provide one-on-one support
   */
  async provideIndividualSupport(numSessions) {
    console.log(`👤 Sophie: Providing ${numSessions} individual support sessions`);
    
    for (let i = 0; i < numSessions; i++) {
      const student = this.targetStudents[i % this.targetStudents.length];
      
      try {
        await this.nav.navigateToSection('assessment');
        
        // Quick assessment for individual support
        await this.page.click('[data-testid="quick-assess-btn"]');
        await this.page.waitForSelector('[data-testid="quick-assess-panel"]', { timeout: 5000 });
        
        // Select student
        await this.page.type('[data-testid="student-search"]', student.firstName);
        await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
        await this.page.click(`[data-student-id="${student.studentId}"]`);
        
        // Document support provided
        const supportNotes = this.generateSupportNote(student);
        await this.page.type('[data-testid="quick-note"]', supportNotes);
        
        // Save quick assessment
        await this.page.click('[data-testid="save-quick-assessment"]');
        await this.nav.waitForSuccess();
        
        this.interventionsRecorded++;
        console.log(`   ✅ Individual support documented for ${student.firstName}`);
        
      } catch (error) {
        console.error(`   ❌ Failed to document support for ${student.firstName}`);
      }
    }
  }

  /**
   * Document accommodations used throughout the day
   */
  async documentAccommodations() {
    console.log('♿ Sophie: Documenting accommodations used...');
    
    const accommodationTypes = [
      'visual-supports',
      'extra-time',
      'reduced-tasks',
      'peer-support',
      'movement-breaks',
      'assistive-technology'
    ];
    
    for (const student of this.targetStudents.slice(0, 3)) {
      try {
        await this.nav.navigateToSection('students');
        await this.nav.search(student.firstName);
        await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
        
        // Open student accommodations
        await this.page.click(`[data-student-id="${student.studentId}"]`);
        
        const accommodationSectionExists = await this.nav.exists('[data-testid="accommodations-section"]');
        if (accommodationSectionExists) {
          await this.page.click('[data-testid="add-accommodation-note"]');
          
          // Select accommodations used today
          const numAccommodations = randomInt(2, 4);
          for (let i = 0; i < numAccommodations; i++) {
            const accommodation = randomChoice(accommodationTypes);
            const selector = `[data-testid="accommodation-${accommodation}"]`;
            if (await this.nav.exists(selector)) {
              await this.page.click(selector);
            }
          }
          
          // Add effectiveness note
          const effectivenessNote = `Accommodations efficaces aujourd'hui. ${student.firstName} a bien répondu aux supports visuels et au temps supplémentaire.`;
          await this.page.type('[data-testid="accommodation-notes"]', effectivenessNote);
          
          await this.page.click('[data-testid="save-accommodations"]');
          this.accommodationsDocumented++;
          
          console.log(`   ✅ Accommodations documented for ${student.firstName}`);
        }
        
      } catch (error) {
        console.error(`   ⚠️ Could not document accommodations for ${student.firstName}`);
      }
    }
  }

  /**
   * Upload adapted work materials
   */
  async uploadAdaptedWork() {
    console.log('📎 Sophie: Uploading adapted work samples...');
    
    await this.nav.navigateToSection('artifacts');
    
    for (const student of this.targetStudents.slice(0, 2)) {
      try {
        await this.page.click('[data-testid="upload-artifact-btn"]');
        await this.page.waitForSelector('[data-testid="upload-form"]', { timeout: 5000 });
        
        // Select student
        await this.nav.selectOption('[data-testid="student-select"]', student.studentId);
        
        // Mock adapted material upload
        const artifact = {
          fileName: `adapted_worksheet_${student.studentId}.pdf`,
          title: `Feuille de travail adaptée - ${randomChoice(['Mathématiques', 'Français'])}`,
          description: 'Version modifiée avec supports visuels et instructions simplifiées'
        };
        
        // Simulate file selection
        const fileInput = await this.page.$('input[type="file"]');
        if (fileInput) {
          await this.page.evaluate((fileName) => {
            const input = document.querySelector('input[type="file"]');
            const dt = new DataTransfer();
            const file = new File(['adapted content'], fileName, { type: 'application/pdf' });
            dt.items.add(file);
            input.files = dt.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }, artifact.fileName);
        }
        
        await this.page.type('[data-testid="artifact-title"]', artifact.title);
        await this.page.type('[data-testid="artifact-description"]', artifact.description);
        
        // Tag as adapted material
        const adaptedTagExists = await this.nav.exists('[data-testid="tag-adapted"]');
        if (adaptedTagExists) {
          await this.page.click('[data-testid="tag-adapted"]');
        }
        
        await this.page.click('[data-testid="upload-btn"]');
        await this.nav.waitForSuccess();
        
        console.log(`   ✅ Adapted materials uploaded for ${student.firstName}`);
        
      } catch (error) {
        console.error(`   ❌ Failed to upload adapted work for ${student.firstName}`);
      }
    }
  }

  /**
   * Update progress notes for IEP students
   */
  async updateProgressNotes() {
    console.log('📝 Sophie: Updating IEP progress notes...');
    
    await this.nav.navigateToSection('reports');
    
    try {
      // Generate IEP progress summary
      await this.page.click('[data-testid="iep-progress-report"]');
      await this.page.waitForSelector('[data-testid="progress-form"]', { timeout: 5000 });
      
      // Add summary for each IEP student
      for (const student of this.targetStudents.slice(0, 3)) {
        const progressNote = this.generateProgressNote(student);
        
        // Find student section
        const studentSectionExists = await this.nav.exists(`[data-student-section="${student.studentId}"]`);
        if (studentSectionExists) {
          await this.page.type(
            `[data-student-section="${student.studentId}"] textarea`,
            progressNote
          );
        }
      }
      
      // Save progress report
      await this.page.click('[data-testid="save-progress-report"]');
      await this.nav.waitForSuccess();
      
      console.log('   ✅ IEP progress notes updated');
      
    } catch (error) {
      console.error('   ⚠️ Could not update progress notes:', error.message);
    }
  }

  /**
   * Generate intervention note
   */
  generateInterventionNote(subject, student) {
    const templates = {
      reading: [
        `Intervention en lecture guidée. ${student.firstName} utilise des stratégies de décodage avec support. Progrès dans la reconnaissance des mots fréquents.`,
        `Séance de lecture en petit groupe. Focus sur la compréhension avec supports visuels. ${student.firstName} répond bien aux questions avec indices.`,
        `Pratique de la fluidité en lecture. Utilisation de livres nivelés appropriés. Amélioration notable de la confiance.`
      ],
      math: [
        `Intervention mathématique avec manipulatifs. ${student.firstName} démontre une meilleure compréhension des concepts avec support concret.`,
        `Révision des nombres jusqu'à 10 avec supports visuels. Stratégies de comptage renforcées. Progrès constants.`,
        `Résolution de problèmes en petit groupe. ${student.firstName} bénéficie de la modélisation et de la pratique guidée.`
      ]
    };
    
    return randomChoice(templates[subject] || templates.reading);
  }

  /**
   * Generate support note
   */
  generateSupportNote(student) {
    const notes = [
      `Support individuel en ${randomChoice(['lecture', 'écriture', 'mathématiques'])}. ${student.firstName} montre plus de confiance avec l'attention personnalisée.`,
      `Révision des concepts de la leçon avec adaptations. Utilisation de supports visuels et kinesthésiques efficace.`,
      `Pratique supplémentaire avec encouragement positif. ${student.firstName} persévère malgré les défis.`,
      `Clarification des instructions et vérification de la compréhension. Stratégies d'organisation renforcées.`
    ];
    
    return randomChoice(notes);
  }

  /**
   * Generate progress note for IEP
   */
  generateProgressNote(student) {
    return `${student.firstName} continue de progresser vers ses objectifs IEP. ` +
           `Points forts cette semaine: ${randomChoice(['participation accrue', 'meilleure autonomie', 'communication améliorée'])}. ` +
           `Accommodations efficaces: supports visuels, temps supplémentaire, pauses mouvement. ` +
           `Prochaines étapes: continuer le support en ${randomChoice(['lecture', 'mathématiques', 'autorégulation'])}. ` +
           `Collaboration avec l'équipe et la famille reste positive.`;
  }

  /**
   * Cleanup
   */
  async cleanup() {
    console.log('🧹 Sophie Agent: Cleaning up...');
    
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = SophieAgent;