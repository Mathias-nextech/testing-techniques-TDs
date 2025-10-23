import { describe, expect, it } from 'vitest';
const fizzBuzz = require('../src/fizzbuzz');
describe('FizzBuzz', () => {
 it('should return the number as a String', () => {
 expect(fizzBuzz(1)).toBe('1');
 expect(fizzBuzz(4)).toBe('4');
 });
 it('should return "Fizz" for multiples of 3', () => {
 expect(fizzBuzz(3)).toBe('Fizz');
 expect(fizzBuzz(6)).toBe('Fizz');
 });
 it('should return "Buzz" for multiples of 5', () => {
 expect(fizzBuzz(5)).toBe('Buzz');
 expect(fizzBuzz(10)).toBe('Buzz');
 });
 it('should return "FizzBuzz" for multiples of 3 and 5', () => {
 expect(fizzBuzz(15)).toBe('FizzBuzz');
 expect(fizzBuzz(30)).toBe('FizzBuzz');
 });
 it.each([
 [1, '1'], [2, '2'], [3, 'Fizz'], [5, 'Buzz'], [15, 'FizzBuzz'], [7, '7'], [9, 'Fizz'], [20, 'Buzz'], [30, 'FizzBuzz']
 ])('fizzBuzz(%i) should return %s', (input, expected) => {
 expect(fizzBuzz(input)).toBe(expected);
 });
});