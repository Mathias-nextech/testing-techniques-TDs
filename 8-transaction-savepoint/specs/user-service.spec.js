import { describe, it, expect } from 'vitest';
import {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
  createPost,
  getPostsByUser
} from '../src/user-service';

describe('Tests with SAVEPOINT - Perfect isolation', () => {
  
  it('Test 1 : Create a new user', () => {
    console.log('▶ Test 1 START');
    
    // Create a User
    const user = createUser({
      email: 'alice@acme.com',
      name: 'Alice'
    });
    
    expect(user.id).toBe(1); // First ID
    expect(user.email).toBe('alice@acme.com');
    
    // Check if User exists
    const users = getAllUsers();
    expect(users).toHaveLength(1);
    
    console.log('Test 1 END (alice exist)');
    // afterEach() will do ROLLBACK → alice disapeares
  });
  
  it('Test 2 : Cleaned DB after ROLLBACK ', () => {
    console.log('▶ Test 2 START');
    
    // DB is empty thanks to the ROLLBACK of Test 1
    const users = getAllUsers();
    expect(users).toHaveLength(0);
    console.log('√ No Users (alice has been ROLLBACK)');
    
    // Create a new User
    const bob = createUser({
      email: 'bob@acme.com',
      name: 'Bob'
    });
    
    expect(bob.id).toBe(1); // ID restart at 1 !
    
    console.log('√ Test 2 END (bob exists)');
    // afterEach() will do a ROLLBACK → bob disappears
  });
  
  it('Test 3 : DB is still clean', () => {
    console.log('▶ Test 3 START');
    
    // Neither alice nor bob exist
    expect(getAllUsers()).toHaveLength(0);
    
    // Créer plusieurs users
    createUser({ email: 'user1@acme.com', name: 'User 1' });
    createUser({ email: 'user2@acme.com', name: 'User 2' });
    createUser({ email: 'user3@acme.com', name: 'User 3' });
    
    expect(getAllUsers()).toHaveLength(3);
    
    console.log('√ Test 3 END (3 users exist)');
    // afterEach() will do a ROLLBACK → 3 users are removed
  });
});

describe('Relations with CASCADE', () => {
  
  it('should remove all users posts when user is removed', () => {
    // Create a User
    const user = createUser({
      email: 'author@acme.com',
      name: 'Author'
    });
    
    // Create 3 Posts for this user
    createPost({ userId: user.id, title: 'Post 1', content: 'Content 1' });
    createPost({ userId: user.id, title: 'Post 2', content: 'Content 2' });
    createPost({ userId: user.id, title: 'Post 3', content: 'Content 3' });
    
    expect(getPostsByUser(user.id)).toHaveLength(3);
    
    // Remove the User
    deleteUser(user.id);
    
    // The posts are deleted thanks to the CASCADE
    expect(getPostsByUser(user.id)).toHaveLength(0);
    
    // afterEach() will do a ROLLBACK of all this
  });
});

describe('Constraints', () => {
  
  it('should block duplicate emails', () => {
    createUser({ email: 'duplicate@acme.com', name: 'First' });
    
    // Attempt to create a duplicate
    expect(() => {
      createUser({ email: 'duplicate@acme.com', name: 'Second' });
    }).toThrow(/UNIQUE constraint failed/);
  });
  
  it('should prevents the orphan posts', () => {
    // Attempt to create a post for a non-existent user
    expect(() => {
      createPost({
        userId: 99999, // Don't exist
        title: 'Orphan Post',
        content: 'Content'
      });
    }).toThrow(/FOREIGN KEY constraint failed/);
  });
});
