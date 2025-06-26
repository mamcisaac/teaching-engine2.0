import { jest } from '@jest/globals';

export default {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn().mockReturnValue({ userId: '123', iat: Date.now() }),
  decode: jest.fn().mockReturnValue({ userId: '123', iat: Date.now() }),
};