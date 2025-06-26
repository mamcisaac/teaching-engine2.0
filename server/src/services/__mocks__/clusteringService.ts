import { jest } from '@jest/globals';

export class ClusteringService {
  clusterExpectations = jest.fn();
  clusterOutcomes = jest.fn();
  reclusterExpectations = jest.fn();
  reclusterOutcomes = jest.fn();
  getClusters = jest.fn();
  suggestSimilarExpectations = jest.fn();
  analyzeClusterQuality = jest.fn();
}

export const clusteringService = new ClusteringService();
