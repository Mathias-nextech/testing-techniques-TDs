import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import createApp from '../src/app.js';

vi.mock('../src/services/user');

describe('App User', () => {
  let app;
  let mockUserService;

  beforeEach(() => {
    mockUserService = {
      registerUser: vi.fn(),
      getUserById: vi.fn(),
      getAllUsers: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
    };
    app = new createApp(mockUserService);
  });

  describe('GET /api/users', () => {
    it('should return all Users', async () => {
      // ARRANGE
      const users = [
        { id: 1, email: 'user1@acme.com' },
        { id: 2, email: 'user2@acme.com' }
      ];
      mockUserService.getAllUsers.mockResolvedValue(users);

      // ACT & ASSERT
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toEqual(users);
      expect(response.body).toHaveLength(2);
    });

    it('should return an empty array if no User', async () => {
      mockUserService.getAllUsers.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a User when providing an ID', async () => {
      // ARRANGE
      const user = { id: 1, email: 'test@acme.com' };
      mockUserService.getUserById.mockResolvedValue(user);

      // ACT & ASSERT
      const response = await request(app)
        .get('/api/users/1')
        .expect(200);

      expect(response.body).toEqual(user);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
    });

    it('should return a 404 if User is not found', async () => {
      mockUserService.getUserById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('POST /api/users', () => {
    it('should register a new user', async () => {
      // ARRANGE
      const newUser = { email: 'test@acme.com', password: 'password123' };
      const savedUser = { id: 1, email: 'test@acme.com' };

      mockUserService.registerUser.mockResolvedValue(savedUser);

      // ACT
      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /json/);

      // ASSERT
      expect(response.body).toEqual(savedUser);
      expect(mockUserService.registerUser).toHaveBeenCalledWith(
        'test@acme.com',
        'password123'
      );
    });

    it('should return 400 error if email is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ password: 'password123' })
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    it('should return 400 error if email is invalid', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'invalid-email', password: 'password123' })
        .expect(400);

      expect(response.body.error).toBe('Invalid email');
    });

    it('should return a 409 if User already exists', async () => {
      mockUserService.registerUser.mockRejectedValue(
        new Error('Already existing user')
      );

      const response = await request(app)
        .post('/api/users')
        .send({ email: 'existing@acme.com', password: 'password' })
        .expect(409);

      expect(response.body.error).toBe('Already existing user');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a User', async () => {
      const updatedUser = { id: 1, email: 'updated@acme.com' };
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/users/1')
        .send({ email: 'updated@acme.com' })
        .expect(200);

      expect(response.body).toEqual(updatedUser);
    });

    it('should return a 404 if User is not found', async () => {
      mockUserService.updateUser.mockResolvedValue(null);

      await request(app)
        .put('/api/users/999')
        .send({ email: 'updated@acme.com' })
        .expect(404);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should remove a User', async () => {
      mockUserService.deleteUser.mockResolvedValue(true);

      await request(app)
        .delete('/api/users/1')
        .expect(204);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
    });

    it('should return a 404 if User is not found', async () => {
      mockUserService.deleteUser.mockResolvedValue(false);

      await request(app)
        .delete('/api/users/999')
        .expect(404);
    });
  });
});
