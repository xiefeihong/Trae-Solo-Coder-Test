import type { Position } from '../types';

export const distance = (a: Position, b: Position): number => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

export const lerp = (a: Position, b: Position, t: number): Position => {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
