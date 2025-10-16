import express from 'express';


function createApp(userService) {
  const app = express();
  app.use(express.json());

  // GET /api/users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/users/:id
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await userService.getUserById(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/users
  app.post('/api/users', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      if (!email.includes('@')) {
        return res.status(400).json({ 
          error: 'Invalid email' 
        });
      }

      const user = await userService.registerUser(email, password);
      res.status(201).json(user);
    } catch (error) {
      if (error.message === 'Already existing user') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/users/:id
  app.put('/api/users/:id', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await userService.updateUser(
        parseInt(req.params.id),
        { email, password }
      );
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/users/:id
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const deleted = await userService.deleteUser(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return app;
}

export default createApp;