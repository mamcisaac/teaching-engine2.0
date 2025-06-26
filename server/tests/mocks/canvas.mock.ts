/**
 * Canvas Mock
 * Lightweight mock for canvas package
 */

import { jest } from '@jest/globals';

export const createCanvas = jest.fn(() => ({
  getContext: jest.fn(() => ({
    fillStyle: '',
    fillRect: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
  })),
  toBuffer: jest.fn((callback) => callback(null, Buffer.from('mock-image'))),
}));

export const loadImage = jest.fn().mockResolvedValue({
  width: 100,
  height: 100,
});

export default { createCanvas, loadImage };