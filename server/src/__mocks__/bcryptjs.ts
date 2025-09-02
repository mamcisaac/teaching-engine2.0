import { jest } from '@jest/globals';

export const bcryptjs = {
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true)),
  hashSync: jest.fn(() => 'hashed-password-sync'),
  compareSync: jest.fn(() => true),
};