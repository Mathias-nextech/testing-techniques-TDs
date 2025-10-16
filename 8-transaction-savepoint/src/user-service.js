export function createUser({ email, name }) {
  const db = global.testDb;
  
  const stmt = db.prepare(`
    INSERT INTO users (email, name) 
    VALUES (?, ?)
  `);
  
  const info = stmt.run(email, name);
  
  // Retrieve created user
  return db.prepare('SELECT * FROM users WHERE id = ?')
    .get(info.lastInsertRowid);
}

export function getAllUsers() {
  const db = global.testDb;
  return db.prepare('SELECT * FROM users ORDER BY id').all();
}

export function getUserById(id) {
  const db = global.testDb;
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function deleteUser(id) {
  const db = global.testDb;
  return db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

export function createPost({ userId, title, content }) {
  const db = global.testDb;
  
  const stmt = db.prepare(`
    INSERT INTO posts (user_id, title, content)
    VALUES (?, ?, ?)
  `);
  
  const info = stmt.run(userId, title, content);
  
  return db.prepare('SELECT * FROM posts WHERE id = ?')
    .get(info.lastInsertRowid);
}

export function getPostsByUser(userId) {
  const db = global.testDb;
  return db.prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY id')
    .all(userId);
}
