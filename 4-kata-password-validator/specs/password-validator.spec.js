import { describe, it, expect, beforeEach } from 'vitest';
const PasswordValidator = require('../src/password-validator');

describe('PasswordValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new PasswordValidator();
  });

  // À implémenter en TDD
  it('should accept a valid password', () => {
    expect(validator.validate('Password123!')).toBe(true);
  });

  it('should reject an invalid password', () => {
    expect(validator.validate('Pass1!')).toBe(false);
  });

  it('should reject a password with no capital letter', () => {
    expect(validator.validate('password123!')).toBe(false);
  });

  it('should reject a password with no number', () => {
    expect(validator.validate('Password!')).toBe(false);
  });

  it('should reject a password with no special character', () => {
    expect(validator.validate('Password123')).toBe(false);
  });

  it('should return the detailled error messages', () => {
    const result = validator.validateWithErrors('pass');

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('At least 8 characters required');
    expect(result.errors).toContain('At least one capital letter required');
    expect(result.errors).toContain('At least one number required');
    expect(result.errors).toContain('At least one special character required');
  });
});