import { jest } from '@jest/globals';

export default {
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  hashSync: jest.fn().mockReturnValue('hashed-password-sync'),
  compareSync: jest.fn().mockReturnValue(true),
};