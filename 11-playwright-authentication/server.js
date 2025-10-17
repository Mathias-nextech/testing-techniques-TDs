const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: 'test-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // false for HTTP, true for HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// DB in memery for tests
const users = new Map();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId || !users.has(req.session.userId)) {
    return res.redirect('/login');
  }
  next();
};

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login</title>
    </head>
    <body>
      <h1>Connection</h1>
      <form action="/login" method="POST">
        <input type="email" name="email" id="email" placeholder="Email" required>
        <input type="password" name="password" id="password" placeholder="Password" required>
        <button type="submit" data-testid="login-button">Sign in</button>
      </form>
      <div class="error-message" id="error" style="display: none; color: red;"></div>
      <a href="/register">Sign up</a>
    </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  
  if (!user || user.password !== password) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login - Error</title>
      </head>
      <body>
        <h1>Connection</h1>
        <form action="/login" method="POST">
          <input type="email" name="email" id="email" placeholder="Email" required>
          <input type="password" name="password" id="password" placeholder="Password" required>
          <button type="submit" data-testid="login-button">Sign in</button>
        </form>
        <div class="error-message" style="color: red;">Invalid credentials</div>
        <a href="/register">Sign up</a>
      </body>
      </html>
    `);
  }
  
  // Session start
  req.session.userId = email;
  res.redirect('/dashboard');
});

app.get('/register', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Register</title>
    </head>
    <body>
      <h1>Inscription</h1>
      <form action="/register" method="POST">
        <input type="email" name="email" id="email" placeholder="Email" required>
        <input type="password" name="password" id="password" placeholder="Password" required>
        <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Password confirmation" required>
        <button type="submit" data-testid="register-button">Sign up</button>
      </form>
      <div class="error-message" id="error" style="display: none; color: red;"></div>
      <a href="/login">Sign in</a>
    </body>
    </html>
  `);
});

app.post('/register', (req, res) => {
  const { email, password, confirmPassword } = req.body;
  
  // Password validation
  if (password !== confirmPassword) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Register - Error</title>
      </head>
      <body>
        <h1>Inscription</h1>
        <form action="/register" method="POST">
          <input type="email" name="email" id="email" placeholder="Email" required>
          <input type="password" name="password" id="password" placeholder="Password" required>
          <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Password confirmation" required>
          <button type="submit" data-testid="register-button">Sign up</button>
        </form>
        <div class="error-message" style="color: red;">Password and Password confirmation don't match</div>
        <a href="/login">Sign in</a>
      </body>
      </html>
    `);
  }
  
  // Check if User already exists
  if (users.has(email)) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Register - Erreur</title>
      </head>
      <body>
        <h1>Inscription</h1>
        <form action="/register" method="POST">
          <input type="email" name="email" id="email" placeholder="Email" required>
          <input type="password" name="password" id="password" placeholder="Password" required>
          <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Password confirmation" required>
          <button type="submit" data-testid="register-button">Sign up</button>
        </form>
        <div class="error-message" style="color: red;">Email already used</div>
        <a href="/login">Sign in</a>
      </body>
      </html>
    `);
  }
  
  // Weak password validation
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Register - Erreur</title>
      </head>
      <body>
        <h1>Inscription</h1>
        <form action="/register" method="POST">
          <input type="email" name="email" id="email" placeholder="Email" required>
          <input type="password" name="password" id="password" placeholder="Password" required>
          <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Password confirmation" required>
          <button type="submit" data-testid="register-button">Sign up</button>
        </form>
        <div class="error-message" style="color: red;">Password is too weak</div>
        <a href="/login">Sign in</a>
      </body>
      </html>
    `);
  }
  
  // Create User
  users.set(email, { email, password });
  
  // Create User session
  req.session.userId = email;
  res.redirect('/dashboard');
});

// Protected routes - Dashboard
app.get('/dashboard', requireAuth, (req, res) => {
  const user = users.get(req.session.userId);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dashboard</title>
    </head>
    <body>
      <h1 class="welcome-message">Welcome ${user.email} to your dashboard</h1>
      <button data-testid="logout-button" onclick="window.location.href='/logout'">Sign out</button>
    </body>
    </html>
  `);
});

app.get('/logout', (req, res) => {
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Sign out error:', err);
    }
    res.redirect('/login');
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.post('/api/reset-users', (req, res) => {
  users.clear();
  res.json({ message: 'Users cleared successfully' });
});

// Gracefull server shutdown
process.on('SIGTERM', () => {
  console.log('Stopping server...');
  server.close(() => {
    console.log('Server stopped');
  });
});

module.exports = app;