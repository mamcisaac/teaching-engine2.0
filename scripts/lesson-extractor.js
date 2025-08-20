/**
 * Lesson Extractor
 * Smart parser that handles various Claude response formats
 */

/**
 * Extract lesson components from Claude's response
 */
function extractLessonComponents(response) {
  // Try multiple extraction strategies
  const strategies = [
    extractStructuredFormat,
    extractMarkdownFormat,
    extractNumberedListFormat,
    extractParagraphFormat
  ];
  
  let bestExtraction = null;
  let bestScore = 0;
  
  for (const strategy of strategies) {
    try {
      const extraction = strategy(response);
      const score = scoreExtraction(extraction);
      
      if (score > bestScore) {
        bestExtraction = extraction;
        bestScore = score;
      }
    } catch (error) {
      // Strategy failed, try next
      continue;
    }
  }
  
  if (!bestExtraction) {
    // Fallback to basic extraction
    bestExtraction = basicExtraction(response);
  }
  
  // Enhance and normalize the extraction
  return enhanceExtraction(bestExtraction);
}

/**
 * Parse flexibly based on patterns
 */
function parseFlexibly(response, patterns) {
  const result = {};
  
  for (const [key, pattern] of Object.entries(patterns)) {
    if (pattern instanceof RegExp) {
      if (pattern.global) {
        // Find all matches
        const matches = [...response.matchAll(pattern)];
        result[key] = matches.map(m => ({
          match: m[0],
          groups: m.slice(1),
          index: m.index
        }));
      } else {
        // Find single match
        const match = response.match(pattern);
        if (match) {
          result[key] = {
            match: match[0],
            groups: match.slice(1),
            index: match.index
          };
        }
      }
    }
  }
  
  // Post-process to extract useful data
  return postProcessExtraction(result, response);
}

/**
 * Extract from structured format (e.g., with clear headers)
 */
function extractStructuredFormat(response) {
  const lesson = {};
  
  // Common header patterns
  const sections = {
    title: /(?:Title|Titre|Lesson Title)[:\s]+([^\n]+)/i,
    objectives: /(?:Learning Goals?|Objectives?|Objectifs?)[:\s]+([^#\n]+(?:\n(?!^[A-Z]).*)*)/im,
    mindsOn: /(?:Minds On|Introduction|Hook)[:\s]+([^#\n]+(?:\n(?!^[A-Z]).*)*)/im,
    action: /(?:Action|Main Activity|Activities)[:\s]+([^#\n]+(?:\n(?!^[A-Z]).*)*)/im,
    consolidation: /(?:Consolidation|Closing|Synthesis)[:\s]+([^#\n]+(?:\n(?!^[A-Z]).*)*)/im,
    assessment: /(?:Assessment|Évaluation)[:\s]+([^#\n]+(?:\n(?!^[A-Z]).*)*)/im,
    differentiation: /(?:Differentiation|Différenciation)[:\s]+([^#\n]+(?:\n(?!^[A-Z]).*)*)/im,
    materials: /(?:Materials?|Matériels?)[:\s]+([^#\n]+(?:\n(?!^[A-Z]).*)*)/im,
    vocabulary: /(?:Vocabulary|Vocabulaire)[:\s]+([^#\n]+(?:\n(?!^[A-Z]).*)*)/im,
    safety: /(?:Safety|Sécurité)[:\s]+([^#\n]+(?:\n(?!^[A-Z]).*)*)/im
  };
  
  for (const [key, pattern] of Object.entries(sections)) {
    const match = response.match(pattern);
    if (match) {
      lesson[key] = cleanExtraction(match[1]);
    }
  }
  
  return lesson;
}

/**
 * Extract from markdown format
 */
function extractMarkdownFormat(response) {
  const lesson = {};
  
  // Look for markdown headers
  const headerPattern = /^#{1,3}\s+(.+)$/gm;
  const headers = [...response.matchAll(headerPattern)];
  
  for (let i = 0; i < headers.length; i++) {
    const headerText = headers[i][1].toLowerCase();
    const startIndex = headers[i].index + headers[i][0].length;
    const endIndex = headers[i + 1]?.index || response.length;
    const content = response.substring(startIndex, endIndex).trim();
    
    // Map headers to lesson components
    if (headerText.includes('title') || headerText.includes('titre')) {
      lesson.title = content.split('\n')[0];
    } else if (headerText.includes('objective') || headerText.includes('goal')) {
      lesson.objectives = parseList(content);
    } else if (headerText.includes('minds on') || headerText.includes('introduction')) {
      lesson.mindsOn = parseActivity(content);
    } else if (headerText.includes('action') || headerText.includes('activity')) {
      lesson.action = parseActivity(content);
    } else if (headerText.includes('consolidation') || headerText.includes('closing')) {
      lesson.consolidation = parseActivity(content);
    } else if (headerText.includes('assessment')) {
      lesson.assessment = parseAssessment(content);
    } else if (headerText.includes('differentiation')) {
      lesson.differentiation = parseDifferentiation(content);
    } else if (headerText.includes('material')) {
      lesson.materials = parseList(content);
    } else if (headerText.includes('vocabul')) {
      lesson.vocabulary = parseVocabulary(content);
    }
  }
  
  return lesson;
}

/**
 * Extract from numbered list format
 */
function extractNumberedListFormat(response) {
  const lesson = {};
  
  // Look for numbered items
  const numberedPattern = /^\d+\.\s+([^:]+)[:\s]+(.+?)(?=^\d+\.|$)/gms;
  const items = [...response.matchAll(numberedPattern)];
  
  for (const item of items) {
    const label = item[1].toLowerCase();
    const content = item[2].trim();
    
    if (label.includes('title') || label.includes('titre')) {
      lesson.title = content;
    } else if (label.includes('goal') || label.includes('objective')) {
      lesson.objectives = parseList(content);
    } else if (label.includes('success criteria')) {
      lesson.successCriteria = parseList(content);
    } else if (label.includes('vocabulary')) {
      lesson.vocabulary = parseVocabulary(content);
    } else if (label.includes('three-part') || label.includes('lesson structure')) {
      const parts = parseThreePartLesson(content);
      Object.assign(lesson, parts);
    } else if (label.includes('assessment')) {
      lesson.assessment = parseAssessment(content);
    } else if (label.includes('differentiation')) {
      lesson.differentiation = parseDifferentiation(content);
    } else if (label.includes('material')) {
      lesson.materials = parseList(content);
    } else if (label.includes('safety')) {
      lesson.safety = content;
    } else if (label.includes('indigenous') || label.includes('mi\'kmaq')) {
      lesson.indigenousPerspectives = content;
    }
  }
  
  return lesson;
}

/**
 * Extract from paragraph format
 */
function extractParagraphFormat(response) {
  const lesson = {};
  
  // Split into paragraphs and analyze each
  const paragraphs = response.split(/\n\n+/);
  
  for (const para of paragraphs) {
    const lower = para.toLowerCase();
    
    // Identify paragraph type by keywords
    if (lower.includes('title:') || lower.includes('titre:')) {
      lesson.title = para.split(':')[1]?.trim();
    } else if (lower.includes('will learn') || lower.includes('will be able')) {
      lesson.objectives = extractObjectivesFromParagraph(para);
    } else if (lower.includes('minds on') || lower.includes('begin') || lower.includes('start')) {
      lesson.mindsOn = extractActivityFromParagraph(para);
    } else if (lower.includes('main activity') || lower.includes('students will') && !lesson.action) {
      lesson.action = extractActivityFromParagraph(para);
    } else if (lower.includes('consolidat') || lower.includes('conclud') || lower.includes('closing')) {
      lesson.consolidation = extractActivityFromParagraph(para);
    } else if (lower.includes('assess') || lower.includes('observ') || lower.includes('check')) {
      lesson.assessment = extractAssessmentFromParagraph(para);
    } else if (lower.includes('differentiat') || lower.includes('support') || lower.includes('modif')) {
      lesson.differentiation = extractDifferentiationFromParagraph(para);
    } else if (lower.includes('material') || lower.includes('supplies') || lower.includes('need')) {
      lesson.materials = extractMaterialsFromParagraph(para);
    } else if (lower.includes('vocabul') || lower.includes('word') || lower.includes('term')) {
      lesson.vocabulary = extractVocabularyFromParagraph(para);
    }
  }
  
  return lesson;
}

/**
 * Basic extraction fallback
 */
function basicExtraction(response) {
  return {
    title: 'Lesson Plan',
    content: response,
    needsStructuring: true
  };
}

/**
 * Score extraction quality
 */
function scoreExtraction(extraction) {
  if (!extraction) return 0;
  
  let score = 0;
  const requiredComponents = [
    'title', 'objectives', 'mindsOn', 'action', 
    'consolidation', 'assessment', 'differentiation'
  ];
  
  for (const component of requiredComponents) {
    if (extraction[component]) {
      score += 10;
      
      // Bonus for detailed content
      const content = JSON.stringify(extraction[component]);
      if (content.length > 50) score += 5;
      if (content.length > 200) score += 5;
    }
  }
  
  return score;
}

/**
 * Enhance extraction with missing pieces
 */
function enhanceExtraction(extraction) {
  // Ensure all components have proper structure
  if (extraction.mindsOn && typeof extraction.mindsOn === 'string') {
    extraction.mindsOn = {
      duration: 8,
      activities: [extraction.mindsOn],
      materials: []
    };
  }
  
  if (extraction.action && typeof extraction.action === 'string') {
    extraction.action = {
      duration: 27,
      activities: [extraction.action],
      materials: []
    };
  }
  
  if (extraction.consolidation && typeof extraction.consolidation === 'string') {
    extraction.consolidation = {
      duration: 10,
      activities: [extraction.consolidation],
      materials: []
    };
  }
  
  // Parse objectives if string
  if (extraction.objectives && typeof extraction.objectives === 'string') {
    extraction.objectives = parseList(extraction.objectives);
  }
  
  // Parse materials if string
  if (extraction.materials && typeof extraction.materials === 'string') {
    extraction.materials = parseList(extraction.materials);
  }
  
  // Ensure vocabulary is structured
  if (extraction.vocabulary && !Array.isArray(extraction.vocabulary)) {
    extraction.vocabulary = parseVocabulary(extraction.vocabulary);
  }
  
  return extraction;
}

/**
 * Parse list from text
 */
function parseList(text) {
  if (!text) return [];
  
  // Try different list formats
  const patterns = [
    /^[-•*]\s+(.+)$/gm,  // Bullet points
    /^\d+[.)]\s+(.+)$/gm, // Numbered lists
    /^[a-z][.)]\s+(.+)$/gm // Lettered lists
  ];
  
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      return matches.map(m => m[1].trim());
    }
  }
  
  // Try comma or semicolon separated
  if (text.includes(';')) {
    return text.split(';').map(item => item.trim()).filter(Boolean);
  }
  
  if (text.includes(',') && text.length < 500) {
    return text.split(',').map(item => item.trim()).filter(Boolean);
  }
  
  // Return as single item
  return [text.trim()];
}

/**
 * Parse activity structure
 */
function parseActivity(text) {
  const activity = {
    description: text,
    duration: null,
    materials: []
  };
  
  // Try to extract duration
  const durationMatch = text.match(/(\d+)\s*(?:min|minute)/i);
  if (durationMatch) {
    activity.duration = parseInt(durationMatch[1]);
  }
  
  // Try to extract materials
  const materialsMatch = text.match(/(?:materials?|supplies|need)[:\s]+([^.]+)/i);
  if (materialsMatch) {
    activity.materials = parseList(materialsMatch[1]);
  }
  
  return activity;
}

/**
 * Parse three-part lesson structure
 */
function parseThreePartLesson(text) {
  const parts = {};
  
  const mindsOnMatch = text.match(/minds on[:\s]+([^(]+)(?:\(|$)/i);
  const actionMatch = text.match(/action[:\s]+([^(]+)(?:\(|$)/i);
  const consolidationMatch = text.match(/consolidation[:\s]+([^(]+)(?:\(|$)/i);
  
  if (mindsOnMatch) {
    parts.mindsOn = parseActivity(mindsOnMatch[1]);
  }
  
  if (actionMatch) {
    parts.action = parseActivity(actionMatch[1]);
  }
  
  if (consolidationMatch) {
    parts.consolidation = parseActivity(consolidationMatch[1]);
  }
  
  return parts;
}

/**
 * Parse assessment information
 */
function parseAssessment(text) {
  const assessment = {
    formative: [],
    summative: [],
    tools: []
  };
  
  // Look for formative assessment
  if (text.toLowerCase().includes('formative') || text.toLowerCase().includes('observation')) {
    const formativeMatch = text.match(/(?:formative|observation)[:\s]+([^.]+)/i);
    if (formativeMatch) {
      assessment.formative = parseList(formativeMatch[1]);
    }
  }
  
  // Look for assessment tools
  if (text.toLowerCase().includes('checklist') || text.toLowerCase().includes('rubric')) {
    assessment.tools.push('checklist');
  }
  
  // Default formative if nothing specific found
  if (assessment.formative.length === 0 && assessment.summative.length === 0) {
    assessment.formative = ['Teacher observation during activities'];
  }
  
  return assessment;
}

/**
 * Parse differentiation strategies
 */
function parseDifferentiation(text) {
  const differentiation = {
    struggling: '',
    iep: '',
    ell: '',
    advanced: ''
  };
  
  // Look for specific learner types
  const patterns = {
    struggling: /(?:struggling|support|difficult)[:\s]+([^.]+)/i,
    iep: /(?:iep|modification|special)[:\s]+([^.]+)/i,
    ell: /(?:ell|esl|language)[:\s]+([^.]+)/i,
    advanced: /(?:advanced|extension|enrichment)[:\s]+([^.]+)/i
  };
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) {
      differentiation[key] = match[1].trim();
    }
  }
  
  // If no specific strategies found, use general text
  if (Object.values(differentiation).every(v => !v)) {
    differentiation.general = text;
  }
  
  return differentiation;
}

/**
 * Parse vocabulary terms
 */
function parseVocabulary(text) {
  const vocabulary = [];
  
  // Look for structured vocabulary (French: English)
  const structuredPattern = /([a-zàâäéèêëïîôùûüÿæœç]+)\s*[:\-–—]\s*([a-z\s]+)/gi;
  const matches = [...text.matchAll(structuredPattern)];
  
  if (matches.length > 0) {
    for (const match of matches) {
      vocabulary.push({
        french: match[1].trim(),
        english: match[2].trim()
      });
    }
  } else {
    // Try to parse as list
    const terms = parseList(text);
    for (const term of terms) {
      vocabulary.push({
        term: term,
        needsTranslation: true
      });
    }
  }
  
  return vocabulary;
}

/**
 * Clean extracted text
 */
function cleanExtraction(text) {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^[-•*]\s+/, '')
    .replace(/^\d+[.)]\s+/, '');
}

/**
 * Post-process extraction results
 */
function postProcessExtraction(result, originalResponse) {
  const processed = {};
  
  // Process lesson count
  if (result.lessonCount) {
    const countMatch = result.lessonCount.groups[0];
    processed.lessonCount = parseInt(countMatch);
  }
  
  // Process lesson titles
  if (result.lessonTitles && result.lessonTitles.length > 0) {
    processed.lessonTitles = result.lessonTitles.map(match => ({
      number: parseInt(match.groups[0]),
      content: match.groups[1].trim()
    }));
  }
  
  // Check for progression keywords
  if (result.progression) {
    processed.hasProgression = true;
  }
  
  // Extract expectations
  if (result.expectations && result.expectations.length > 0) {
    processed.expectations = result.expectations.map(match => match.match);
  }
  
  return processed;
}

// Helper extraction functions for paragraph format
function extractObjectivesFromParagraph(para) {
  const objectives = [];
  const sentences = para.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (sentence.includes('will') || sentence.includes('can')) {
      objectives.push(sentence.trim());
    }
  }
  
  return objectives.length > 0 ? objectives : [para];
}

function extractActivityFromParagraph(para) {
  return {
    description: para,
    duration: null
  };
}

function extractAssessmentFromParagraph(para) {
  return {
    formative: [para],
    tools: []
  };
}

function extractDifferentiationFromParagraph(para) {
  return {
    general: para
  };
}

function extractMaterialsFromParagraph(para) {
  return parseList(para);
}

function extractVocabularyFromParagraph(para) {
  return parseVocabulary(para);
}

module.exports = {
  extractLessonComponents,
  parseFlexibly,
  parseList,
  parseActivity,
  parseAssessment,
  parseDifferentiation,
  parseVocabulary,
  cleanExtraction
};