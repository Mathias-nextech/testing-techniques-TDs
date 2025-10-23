import { describe, expect, it } from 'vitest';
const fizzBuzz = require('../src/fizzbuzz');
describe('FizzBuzz', () => {
 it('should return the number as a String', () => {
 expect(fizzBuzz(1)).toBe('1');
 expect(fizzBuzz(2)).toBe('2');
 });
});