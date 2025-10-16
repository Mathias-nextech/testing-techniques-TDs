import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from '../../src/database';
import UserRepository from '../../src/user-repository';

describe('UserRepository Integration Tests', () => {
  let db;
  let userRepository;

  // Instatiate a new DB before each test
  beforeEach(async () => {
    db = new Database(':memory:');
    await db.createTables();
    userRepository = new UserRepository(db);
  });

  // Close DB connection after each tests
  afterEach(async () => {
    await db.close();
  });

  describe('save', () => {
    it('should write a new user', async () => {
      // ARRANGE
      const user = {
        email: 'test@acme.com',
        password: 'hashed_password'
      };

      // ACT
      const savedUser = await userRepository.save(user);

      // ASSERT
      expect(savedUser.id).toBeDefined();
      expect(savedUser.email).toBe(user.email);
      expect(savedUser.password).toBe(user.password);
    });

    it('should not write a new user with a duplicate email', async () => {
      // ARRANGE
      const user = {
        email: 'duplicate@acme.com',
        password: 'password'
      };

      await userRepository.save(user);

      // ACT & ASSERT
      await expect(userRepository.save(user))
        .rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should return an existing user', async () => {
      // ARRANGE
      const user = await userRepository.save({
        email: 'find@acme.com',
        password: 'password'
      });

      // ACT
      const found = await userRepository.findByEmail('find@acme.com');

      // ASSERT
      expect(found).toBeDefined();
      expect(found.id).toBe(user.id);
      expect(found.email).toBe('find@acme.com');
    });

    it('should return undefined if user is not found', async () => {
      // ACT
      const found = await userRepository.findByEmail('notfound@acme.com');

      // ASSERT
      expect(found).toBeUndefined();
    });
  });

  describe('exists', () => {
    it('should return true if user exists', async () => {
      // ARRANGE
      await userRepository.save({
        email: 'exists@acme.com',
        password: 'password'
      });

      // ACT
      const exists = await userRepository.exists('exists@acme.com');

      // ASSERT
      expect(exists).toBe(true);
    });

    it('should return false if user does not exists', async () => {
      // ACT
      const exists = await userRepository.exists('notexists@acme.com');

      // ASSERT
      expect(exists).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // ARRANGE
      await userRepository.save({ email: 'user1@acme.com', password: 'pass1' });
      await userRepository.save({ email: 'user2@acme.com', password: 'pass2' });
      await userRepository.save({ email: 'user3@acme.com', password: 'pass3' });

      // ACT
      const users = await userRepository.findAll();

      // ASSERT
      expect(users).toHaveLength(3);
      expect(users.map(u => u.email)).toContain('user1@acme.com');
      expect(users.map(u => u.email)).toContain('user2@acme.com');
      expect(users.map(u => u.email)).toContain('user3@acme.com');
    });

    it('shoudl return an empty array if no users in DB', async () => {
      // ACT
      const users = await userRepository.findAll();

      // ASSERT
      expect(users).toEqual([]);
    });
  });
});
