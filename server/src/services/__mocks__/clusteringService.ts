import { jest } from '@jest/globals';

export class ClusteringService {
  clusterOutcomes = jest.fn();
  reclusterOutcomes = jest.fn();
  getClusters = jest.fn();
  suggestSimilarOutcomes = jest.fn();
  analyzeClusterQuality = jest.fn();
}

export const clusteringService = new ClusteringService();
