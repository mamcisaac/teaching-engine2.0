import { jest } from '@jest/globals';

export class ClusteringService {
  clusterExpectations = jest.fn();
  reclusterExpectations = jest.fn();
  getClusters = jest.fn();
  suggestSimilarExpectations = jest.fn();
  analyzeClusterQuality = jest.fn();
}

export const clusteringService = new ClusteringService();
