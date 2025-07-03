/**
 * TypeScript mock for mammoth (DOCX parser)
 */
export const extractRawText = async ({ buffer }: { buffer: Buffer }) => {
  // Return empty text for empty buffer to test error handling
  if (!buffer || buffer.length === 0) {
    return {
      value: '',
      messages: ['Warning: Empty document'],
    };
  }

  // Return short text for small buffer
  if (buffer.length < 100) {
    return {
      value: 'Too short',
      messages: ['Warning: Document appears to be incomplete'],
    };
  }

  // Return realistic curriculum content for normal buffers
  return {
    value: `French Language Curriculum - Grade 1

Domaine: Communication orale
Attente globale:
CO1. Comprendre des messages oraux en français

Attentes spécifiques:
CO1.1 Suivre des instructions orales simples
CO1.2 Démontrer sa compréhension d'un message oral par des gestes ou des réponses courtes
CO1.3 Identifier l'information principale dans un message oral simple

Domaine: Lecture
Attente globale:
L1. Lire et comprendre des textes simples en français

Attentes spécifiques:
L1.1 Reconnaître des mots familiers dans des contextes variés
L1.2 Lire à haute voix des textes simples avec fluidité
L1.3 Démontrer sa compréhension d'un texte lu par des réponses orales ou écrites`,
    messages: [],
  };
};

export default {
  extractRawText,
};
