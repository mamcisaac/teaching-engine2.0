/**
 * Implementation for Student Progress Dashboard Tests
 * Makes all the TDD tests pass
 */

// Re-export functions from client implementation for tests
export {
  getQuickProgress,
  getProgressWithPrivacy,
  getParentCommunicationHistory,
  getParentAccess,
  getImprovementEvidence,
  getComparativeProgress
} from '../../client/src/utils/studentProgress';