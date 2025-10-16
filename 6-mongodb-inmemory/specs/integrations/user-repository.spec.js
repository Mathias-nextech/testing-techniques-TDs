import { describe, it , expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserRepositoryMongo from '../../src/user-repository.js';

describe('UserRepository with MongoDB Integration Tests', () => {
  let mongoServer;
  let mongoClient;
  let db;
  let userRepository;

  beforeAll(async () => {
    // Start MongoDB server in memory
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connection
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    
    db = mongoClient.db('testdb');
  });

  afterAll(async () => {
    // Cleanup
    await mongoClient.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Create a new collection for each test
    const collection = db.collection('users');
    await collection.deleteMany({});
    userRepository = new UserRepositoryMongo(collection);
  });

  it('shoudl save a new user', async () => {
    const user = { email: 'test@acme.com', password: 'password' };
    
    const saved = await userRepository.save(user);
    
    expect(saved.id).toBeDefined();
    expect(saved.email).toBe(user.email);
  });

  it('should find a user with his email', async () => {
    await userRepository.save({ email: 'find@acme.com', password: 'pass' });
    
    const found = await userRepository.findByEmail('find@acme.com');
    
    expect(found).toBeDefined();
    expect(found.email).toBe('find@acme.com');
  });

  it('should return all users', async () => {
    await userRepository.save({ email: 'user1@test.com', password: 'pass1' });
    await userRepository.save({ email: 'user2@test.com', password: 'pass2' });
    
    const users = await userRepository.findAll();
    
    expect(users).toHaveLength(2);
  });
});
