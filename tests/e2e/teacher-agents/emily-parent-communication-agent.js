/**
 * Emily Parent Communication Agent - Grade 1 French Immersion
 * Handles all parent communications in French including progress reports,
 * newsletters, daily communications, and report cards
 */

const puppeteer = require('puppeteer');
const NavigationHelper = require('../helpers/navigation');
const SimpleAssertionHelper = require('../helpers/simple-assertions');
const { randomChoice, randomInt } = require('../helpers/data-generators');

class EmilyParentCommunicationAgent {
  constructor(credentials, students, options = {}) {
    this.credentials = credentials;
    this.students = students;
    this.options = {
      headless: options.headless !== false,
      slowMo: options.slowMo || 0,
      baseURL: options.baseURL || 'http://localhost:5173',
      screenshotOnError: options.screenshotOnError !== false
    };
    
    this.browser = null;
    this.page = null;
    this.nav = null;
    this.assert = null;
    this.communicationsSent = 0;
    this.reportsGenerated = 0;
    this.newslettersCreated = 0;
  }

  async initialize() {
    console.log('📧 Emily Parent Communication Agent: Initialisation...');
    
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      slowMo: this.options.slowMo,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    this.page = await this.browser.newPage();
    this.nav = new NavigationHelper(this.page);
    this.assert = new SimpleAssertionHelper(this.page);

    // Set up error handling
    this.page.on('pageerror', error => {
      console.error('❌ Parent Communication Agent - Erreur:', error.message);
      if (this.options.screenshotOnError) {
        this.nav.screenshot('emily-parent-comm-error');
      }
    });

    // Login
    await this.nav.login(this.credentials);
    console.log('✅ Parent Communication Agent: Connexion réussie');
  }

  /**
   * Complete parent communication cycle
   */
  async performCompleteCommunicationCycle() {
    console.log('📮 Début du cycle de communication avec les parents...');
    
    try {
      // Morning: Send daily agenda to parents
      await this.sendDailyAgenda();
      
      // Generate weekly progress reports for students needing updates
      await this.generateWeeklyProgressReports();
      
      // Create monthly class newsletter
      await this.createMonthlyNewsletter();
      
      // Handle individual parent communications
      await this.handleIndividualCommunications();
      
      // Prepare term report cards
      await this.prepareReportCards();
      
      // End of cycle summary
      await this.generateCommunicationSummary();
      
      console.log(`✅ Cycle de communication complété!`);
      console.log(`   📧 Communications envoyées: ${this.communicationsSent}`);
      console.log(`   📊 Rapports générés: ${this.reportsGenerated}`);
      console.log(`   📰 Bulletins créés: ${this.newslettersCreated}`);
      
      return {
        success: true,
        communicationsSent: this.communicationsSent,
        reportsGenerated: this.reportsGenerated,
        newslettersCreated: this.newslettersCreated
      };
      
    } catch (error) {
      console.error('❌ Erreur de communication:', error);
      await this.nav.screenshot('emily-communication-error');
      throw error;
    }
  }

  /**
   * Send daily agenda to parents (in French)
   */
  async sendDailyAgenda() {
    console.log('📅 Envoi de l\'agenda quotidien aux parents...');
    
    await this.nav.navigateToSection('communications');
    await this.page.click('[data-testid="create-announcement"]');
    await this.page.waitForSelector('[data-testid="announcement-form"]', { timeout: 5000 });

    // Create French daily agenda
    const agenda = this.generateDailyAgenda();
    
    await this.page.type('[data-testid="announcement-title"]', agenda.title);
    await this.page.type('[data-testid="announcement-content"]', agenda.content);
    
    // Select all parents
    await this.page.click('[data-testid="select-all-parents"]');
    
    // Send
    await this.page.click('[data-testid="send-announcement"]');
    await this.nav.waitForSuccess();
    
    this.communicationsSent++;
    console.log('   ✅ Agenda quotidien envoyé à tous les parents');
  }

  /**
   * Generate weekly progress reports for students needing updates
   */
  async generateWeeklyProgressReports() {
    console.log('📊 Génération des rapports de progrès hebdomadaires...');
    
    await this.nav.navigateToSection('reports');
    
    // Identify students needing progress reports (IEP students + struggling/excelling)
    const studentsNeedingReports = this.identifyStudentsNeedingReports();
    
    for (const student of studentsNeedingReports) {
      await this.generateIndividualProgressReport(student);
      await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    }
    
    console.log(`   ✅ ${studentsNeedingReports.length} rapports de progrès générés`);
  }

  /**
   * Generate individual progress report in French
   */
  async generateIndividualProgressReport(student) {
    try {
      await this.page.click('[data-testid="create-progress-report"]');
      await this.page.waitForSelector('[data-testid="report-form"]', { timeout: 5000 });

      // Select student
      await this.nav.selectOption('[data-testid="student-select"]', student.studentId);

      // Generate French progress report content
      const report = this.generateFrenchProgressReport(student);
      
      // Fill report sections
      await this.page.type('[data-testid="academic-progress"]', report.academic);
      await this.page.type('[data-testid="social-progress"]', report.social);
      await this.page.type('[data-testid="areas-of-growth"]', report.growth);
      await this.page.type('[data-testid="support-strategies"]', report.support);
      await this.page.type('[data-testid="parent-actions"]', report.parentActions);
      
      // Add evidence/artifacts
      const evidenceCheckboxes = await this.page.$$('[data-testid="evidence-checkbox"]');
      const numEvidence = Math.min(3, evidenceCheckboxes.length);
      for (let i = 0; i < numEvidence; i++) {
        await evidenceCheckboxes[i].click();
      }
      
      // Send to parents
      await this.page.click('[data-testid="send-report"]');
      await this.nav.waitForSuccess();
      
      this.reportsGenerated++;
      this.communicationsSent++;
      console.log(`   ✅ Rapport envoyé pour ${student.firstName} ${student.lastName}`);
      
    } catch (error) {
      console.error(`   ❌ Échec du rapport pour ${student.firstName}:`, error.message);
    }
  }

  /**
   * Create monthly class newsletter in French
   */
  async createMonthlyNewsletter() {
    console.log('📰 Création du bulletin mensuel de la classe...');
    
    await this.nav.navigateToSection('newsletter');
    await this.page.click('[data-testid="create-newsletter"]');
    await this.page.waitForSelector('[data-testid="newsletter-editor"]', { timeout: 5000 });

    const newsletter = this.generateMonthlyNewsletter();
    
    // Fill newsletter sections
    await this.page.type('[data-testid="newsletter-title"]', newsletter.title);
    
    // Add sections
    for (const section of newsletter.sections) {
      await this.page.click('[data-testid="add-section"]');
      await this.page.type('[data-testid="section-title-last"]', section.title);
      await this.page.type('[data-testid="section-content-last"]', section.content);
    }
    
    // Add photos/student work highlights
    await this.page.click('[data-testid="add-photos"]');
    await this.page.click('[data-testid="select-recent-artifacts"]');
    
    // Schedule or send
    await this.page.click('[data-testid="send-newsletter"]');
    await this.nav.waitForSuccess();
    
    this.newslettersCreated++;
    this.communicationsSent++;
    console.log('   ✅ Bulletin mensuel envoyé à toutes les familles');
  }

  /**
   * Handle individual parent communications
   */
  async handleIndividualCommunications() {
    console.log('💬 Gestion des communications individuelles...');
    
    await this.nav.navigateToSection('messages');
    
    // Check for parent messages requiring response
    const unreadMessages = await this.page.$$('[data-testid="unread-message"]');
    console.log(`   📥 ${unreadMessages.length} messages non lus`);
    
    // Respond to priority messages
    for (let i = 0; i < Math.min(5, unreadMessages.length); i++) {
      await this.respondToParentMessage(unreadMessages[i]);
      await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
    }
    
    // Send proactive communications for important updates
    await this.sendProactiveCommunications();
  }

  /**
   * Respond to parent message in French
   */
  async respondToParentMessage(messageElement) {
    try {
      await messageElement.click();
      await this.page.waitForSelector('[data-testid="message-detail"]', { timeout: 3000 });
      
      // Generate appropriate French response
      const response = this.generateFrenchResponse();
      
      await this.page.click('[data-testid="reply-button"]');
      await this.page.type('[data-testid="reply-content"]', response);
      await this.page.click('[data-testid="send-reply"]');
      await this.nav.waitForSuccess();
      
      this.communicationsSent++;
      console.log('   ✅ Réponse envoyée au parent');
      
    } catch (error) {
      console.error('   ❌ Échec de la réponse:', error.message);
    }
  }

  /**
   * Send proactive communications for important updates
   */
  async sendProactiveCommunications() {
    console.log('   📤 Envoi de communications proactives...');
    
    // Students with significant progress/concerns
    const priorityStudents = this.students.filter(s => 
      s.notes?.includes('IEP') || 
      s.notes?.includes('support') || 
      s.notes?.includes('advanced')
    ).slice(0, 3);
    
    for (const student of priorityStudents) {
      await this.sendProactiveUpdate(student);
      await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    }
  }

  /**
   * Send proactive update to parents
   */
  async sendProactiveUpdate(student) {
    try {
      await this.page.click('[data-testid="compose-message"]');
      await this.page.waitForSelector('[data-testid="message-form"]', { timeout: 3000 });
      
      // Select parent
      await this.nav.selectOption('[data-testid="parent-select"]', `parent-${student.studentId}`);
      
      // Generate update based on student needs
      const update = this.generateProactiveUpdate(student);
      
      await this.page.type('[data-testid="message-subject"]', update.subject);
      await this.page.type('[data-testid="message-content"]', update.content);
      
      await this.page.click('[data-testid="send-message"]');
      await this.nav.waitForSuccess();
      
      this.communicationsSent++;
      console.log(`   ✅ Mise à jour envoyée pour ${student.firstName}`);
      
    } catch (error) {
      console.error(`   ❌ Échec de l'envoi pour ${student.firstName}:`, error.message);
    }
  }

  /**
   * Prepare term report cards
   */
  async prepareReportCards() {
    console.log('📝 Préparation des bulletins scolaires...');
    
    await this.nav.navigateToSection('report-cards');
    
    // Generate report cards for a sample of students
    const studentsForReports = this.students.slice(0, 5);
    
    for (const student of studentsForReports) {
      await this.generateReportCard(student);
      await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1500)));
    }
    
    console.log(`   ✅ ${studentsForReports.length} bulletins préparés`);
  }

  /**
   * Generate individual report card in French
   */
  async generateReportCard(student) {
    try {
      await this.page.click('[data-testid="create-report-card"]');
      await this.page.waitForSelector('[data-testid="report-card-form"]', { timeout: 5000 });
      
      // Select student and term
      await this.nav.selectOption('[data-testid="student-select"]', student.studentId);
      await this.nav.selectOption('[data-testid="term-select"]', 'term1');
      
      // Generate French report card content
      const reportCard = this.generateFrenchReportCard(student);
      
      // Fill subject assessments
      for (const subject of reportCard.subjects) {
        const subjectSection = await this.page.$(`[data-subject="${subject.code}"]`);
        if (subjectSection) {
          await subjectSection.$eval('[data-testid="achievement-level"]', 
            (el, level) => el.value = level, subject.level);
          await subjectSection.$eval('[data-testid="subject-comments"]', 
            (el, comments) => el.value = comments, subject.comments);
        }
      }
      
      // Learning skills
      await this.page.type('[data-testid="learning-skills-comments"]', reportCard.learningSkills);
      
      // General comments
      await this.page.type('[data-testid="general-comments"]', reportCard.generalComments);
      
      // Next steps
      await this.page.type('[data-testid="next-steps"]', reportCard.nextSteps);
      
      // Save draft
      await this.page.click('[data-testid="save-draft"]');
      await this.nav.waitForSuccess();
      
      this.reportsGenerated++;
      console.log(`   ✅ Bulletin préparé pour ${student.firstName} ${student.lastName}`);
      
    } catch (error) {
      console.error(`   ❌ Échec du bulletin pour ${student.firstName}:`, error.message);
    }
  }

  /**
   * Generate communication summary
   */
  async generateCommunicationSummary() {
    console.log('📋 Génération du résumé des communications...');
    
    await this.nav.navigateToSection('communications');
    
    try {
      await this.page.click('[data-testid="communication-summary"]');
      await this.page.waitForSelector('[data-testid="summary-stats"]', { timeout: 3000 });
      
      const stats = await this.page.$eval('[data-testid="summary-stats"]', el => ({
        totalSent: el.querySelector('[data-stat="total-sent"]')?.textContent || '0',
        responseRate: el.querySelector('[data-stat="response-rate"]')?.textContent || '0%',
        avgResponseTime: el.querySelector('[data-stat="avg-response"]')?.textContent || 'N/A'
      }));
      
      console.log('   📊 Statistiques de communication:', stats);
      await this.nav.screenshot('emily-communication-summary');
      
    } catch (error) {
      console.error('   ⚠️ Impossible de générer le résumé:', error.message);
    }
  }

  // Helper methods for generating French content

  generateDailyAgenda() {
    const date = new Date().toLocaleDateString('fr-CA');
    const subjects = ['Français', 'Mathématiques', 'Sciences', 'Arts visuels', 'Sciences humaines'];
    const randomSubject = randomChoice(subjects);
    
    return {
      title: `Agenda du jour - ${date}`,
      content: `Bonjour chers parents,

Voici l'agenda de notre journée:

🌅 Matin:
• Français: Lecture partagée et centres de littératie
• Mathématiques: Exploration des nombres 0-20

🌞 Après-midi:
• ${randomSubject}: ${this.getSubjectActivity(randomSubject)}
• Période de jeu créatif et collaboration

📚 Devoirs:
• Lecture de 10 minutes avec votre enfant
• Pratiquer les mots de la semaine

🎒 Rappels:
• N'oubliez pas les vêtements de rechange
• Journée pizza vendredi!

Merci pour votre soutien continu!
Mme Emily`
    };
  }

  getSubjectActivity(subject) {
    const activities = {
      'Français': 'Atelier d\'écriture créative',
      'Mathématiques': 'Manipulation avec blocs et mesures',
      'Sciences': 'Expérience sur les états de la matière',
      'Arts visuels': 'Projet de collage collectif',
      'Sciences humaines': 'Exploration de notre communauté'
    };
    return activities[subject] || 'Activité d\'exploration';
  }

  generateFrenchProgressReport(student) {
    const hasIEP = student.notes?.includes('IEP');
    const isAdvanced = student.notes?.includes('advanced') || student.notes?.includes('excels');
    
    return {
      academic: hasIEP 
        ? `${student.firstName} fait des progrès constants avec le soutien approprié. L'utilisation d'outils visuels et de manipulatifs aide beaucoup sa compréhension.`
        : isAdvanced
        ? `${student.firstName} démontre une excellente maîtrise des concepts. Je lui offre des défis supplémentaires pour maintenir son engagement.`
        : `${student.firstName} progresse bien selon les attentes du niveau. La participation en classe est positive.`,
      
      social: `${student.firstName} ${randomChoice([
        'collabore bien avec ses pairs',
        'démontre de l\'empathie envers les autres',
        'participe activement aux discussions de groupe',
        'fait preuve de leadership positif'
      ])}. ${randomChoice([
        'Les amitiés se développent bien',
        'L\'entraide est naturelle',
        'Le respect des règles est exemplaire'
      ])}.`,
      
      growth: randomChoice([
        'Continuer à développer l\'autonomie dans les routines',
        'Pratiquer la persévérance face aux défis',
        'Approfondir la compréhension en lecture',
        'Renforcer les stratégies de résolution de problèmes'
      ]),
      
      support: hasIEP
        ? 'Temps supplémentaire pour les tâches, supports visuels, pauses fréquentes'
        : 'Encouragement continu, défis appropriés au niveau',
      
      parentActions: `À la maison: ${randomChoice([
        'Lire ensemble 15 minutes chaque soir',
        'Pratiquer les mathématiques avec des objets du quotidien',
        'Encourager l\'expression créative par le dessin et l\'écriture',
        'Jouer à des jeux de société pour développer la logique'
      ])}`
    };
  }

  generateMonthlyNewsletter() {
    const month = new Date().toLocaleDateString('fr-CA', { month: 'long' });
    
    return {
      title: `Bulletin de la classe - ${month}`,
      sections: [
        {
          title: '🌟 Célébrations du mois',
          content: `Ce mois-ci, nous célébrons les progrès remarquables en lecture! Plusieurs élèves ont atteint leurs objectifs personnels. Bravo à tous pour leur persévérance!`
        },
        {
          title: '📚 Focus académique',
          content: `En français, nous explorons les textes narratifs et pratiquons l'écriture créative. En mathématiques, nous travaillons sur les patterns et la résolution de problèmes.`
        },
        {
          title: '🎨 Projets spéciaux',
          content: `Notre projet d'art collectif sur "Notre communauté" avance bien. Les élèves ont créé des représentations magnifiques de leurs maisons et quartiers.`
        },
        {
          title: '📅 Dates importantes',
          content: `• Sortie éducative au musée: 15 ${month}\n• Rencontre parents-enseignant: 22-23 ${month}\n• Journée thématique "Héros": 28 ${month}`
        },
        {
          title: '🏠 Comment aider à la maison',
          content: `Continuez la lecture quotidienne et les conversations en français. Encouragez votre enfant à raconter sa journée et à poser des questions.`
        }
      ]
    };
  }

  generateFrenchResponse() {
    const responses = [
      `Merci pour votre message. Je comprends votre préoccupation et j'aimerais en discuter davantage. Votre enfant progresse bien et nous continuons à travailler ensemble sur les défis identifiés. N'hésitez pas à me contacter pour une rencontre.`,
      
      `Bonjour! C'est avec plaisir que je réponds à votre question. En classe, nous utilisons diverses stratégies pour soutenir l'apprentissage. Je vais porter une attention particulière à ce point et vous tenir informé des progrès.`,
      
      `Merci de partager ces informations importantes. Cela m'aide à mieux comprendre et soutenir votre enfant. Nous allons adapter notre approche en conséquence. Restons en contact régulier.`
    ];
    
    return randomChoice(responses);
  }

  generateProactiveUpdate(student) {
    const hasIEP = student.notes?.includes('IEP');
    const isAdvanced = student.notes?.includes('advanced') || student.notes?.includes('excels');
    
    const subjects = {
      'IEP': {
        subject: `Mise à jour positive - ${student.firstName}`,
        content: `Bonjour,\n\nJe voulais partager une belle réussite de ${student.firstName} aujourd'hui! Avec les supports visuels que nous utilisons, ${student.firstName} a complété une activité de mathématiques de façon autonome. C'est un grand pas!\n\nNous continuons à utiliser les stratégies de son PEI et les progrès sont encourageants.\n\nN'hésitez pas si vous avez des questions.\n\nCordialement,\nMme Emily`
      },
      'advanced': {
        subject: `Opportunité d'enrichissement - ${student.firstName}`,
        content: `Bonjour,\n\n${student.firstName} continue d'exceller en classe. J'aimerais proposer quelques activités d'enrichissement pour maintenir son engagement et sa motivation.\n\nVoici quelques suggestions pour la maison:\n• Livres de niveau supérieur de la bibliothèque\n• Projets de recherche sur des sujets d'intérêt\n• Défis mathématiques créatifs\n\nDiscutons-en lors de notre prochaine rencontre!\n\nMme Emily`
      },
      'default': {
        subject: `Moment spécial - ${student.firstName}`,
        content: `Bonjour,\n\nJe voulais partager un moment spécial de la journée. ${student.firstName} a démontré ${randomChoice(['une belle collaboration', 'une créativité remarquable', 'un leadership positif', 'une persévérance admirable'])} lors de notre activité de ${randomChoice(['sciences', 'arts', 'français', 'mathématiques'])}.\n\nC'est un plaisir de voir ces progrès!\n\nBonne soirée,\nMme Emily`
      }
    };
    
    return hasIEP ? subjects.IEP : isAdvanced ? subjects.advanced : subjects.default;
  }

  generateFrenchReportCard(student) {
    const hasIEP = student.notes?.includes('IEP');
    const isAdvanced = student.notes?.includes('advanced') || student.notes?.includes('excels');
    
    const baseLevel = hasIEP ? 'AP' : isAdvanced ? 'EX' : 'ME';
    const levels = {
      'NE': 'N\'atteint pas encore',
      'AP': 'Approche',
      'ME': 'Atteint',
      'EX': 'Dépasse'
    };
    
    return {
      subjects: [
        {
          code: 'FRA',
          level: baseLevel,
          comments: `${student.firstName} ${this.getSubjectComment('français', baseLevel)}`
        },
        {
          code: 'MAT',
          level: baseLevel,
          comments: `${this.getSubjectComment('mathématiques', baseLevel)}`
        },
        {
          code: 'SCI',
          level: randomChoice(['AP', 'ME', 'ME', 'EX']),
          comments: `Curiosité naturelle et participation active aux expériences.`
        },
        {
          code: 'ART',
          level: 'ME',
          comments: `Créativité et expression personnelle en développement.`
        },
        {
          code: 'SOC',
          level: 'ME',
          comments: `Bonne compréhension de la communauté et des relations.`
        }
      ],
      learningSkills: `${student.firstName} démontre ${randomChoice([
        'une belle autonomie',
        'une collaboration exemplaire',
        'une organisation en progrès',
        'une participation enthousiaste'
      ])}. ${randomChoice([
        'L\'effort est constant',
        'La persévérance est remarquable',
        'L\'attitude positive contribue au climat de classe'
      ])}.`,
      generalComments: hasIEP
        ? `${student.firstName} progresse avec le soutien approprié. Les adaptations du PEI sont efficaces et permettent la réussite. La confiance grandit chaque jour.`
        : isAdvanced
        ? `${student.firstName} démontre une maîtrise exceptionnelle des concepts. Les défis supplémentaires maintiennent l'engagement. Un plaisir à enseigner!`
        : `${student.firstName} progresse selon les attentes du niveau. L'engagement et la participation sont positifs. Continue ton beau travail!`,
      nextSteps: `Prochaines étapes: ${randomChoice([
        'Continuer la lecture quotidienne en français',
        'Pratiquer les stratégies de résolution de problèmes',
        'Développer l\'autonomie dans les routines',
        'Approfondir la compréhension des concepts mathématiques'
      ])}`
    };
  }

  getSubjectComment(subject, level) {
    const comments = {
      'français': {
        'NE': 'travaille fort pour développer les compétences de base en lecture et écriture',
        'AP': 'progresse dans la reconnaissance des mots et la compréhension',
        'ME': 'lit et écrit selon les attentes avec confiance croissante',
        'EX': 'démontre une excellente maîtrise de la lecture et de l\'écriture'
      },
      'mathématiques': {
        'NE': 'développe la compréhension des concepts de base avec support',
        'AP': 'progresse dans la résolution de problèmes simples',
        'ME': 'applique les stratégies mathématiques de façon appropriée',
        'EX': 'résout des problèmes complexes avec créativité'
      }
    };
    
    return comments[subject]?.[level] || 'progresse bien';
  }

  identifyStudentsNeedingReports() {
    // Priority: IEP students, struggling students, excelling students
    return this.students.filter(s => 
      s.notes?.includes('IEP') || 
      s.notes?.includes('support') || 
      s.notes?.includes('advanced') ||
      s.notes?.includes('excels')
    ).slice(0, 8); // Select up to 8 students for weekly reports
  }

  /**
   * Cleanup
   */
  async cleanup() {
    console.log('🧹 Parent Communication Agent: Nettoyage...');
    
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = EmilyParentCommunicationAgent;