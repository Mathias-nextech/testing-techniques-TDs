import { beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import Database from 'better-sqlite3';

let db;
let savepointCounter = 0;

// ========================================
// AVANT TOUS LES TESTS
// ========================================
beforeAll(() => {
  console.log('DB creation in memory');
  
  // Create a SQLITE DB in memeory
  db = new Database(':memory:', { 
    verbose: process.env.DEBUG ? console.log : null 
  });
  
  // IMPORTANT : Foreign keys activation
  db.pragma('foreign_keys = ON');
  
  // Load schema
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
  `);
  
  console.log('Schema loaded');
  
  // Expose globally the DB
  global.testDb = db;
});

// ========================================
// BEFORE EACH TEST
// ========================================
beforeEach(() => {
  savepointCounter++;
  const savepointName = `test_${savepointCounter}`;
  
  console.log(`SAVEPOINT created : ${savepointName}`);
  
  // Create a SAVEPOINT
  db.exec(`SAVEPOINT ${savepointName}`);
  
  // Store the name for the rollback
  global.currentSavepoint = savepointName;
});

// ========================================
// AFTER EACH TEST
// ========================================
afterEach(() => {
  const savepointName = global.currentSavepoint;
  
  console.log(`🔄 ROLLBACK TO: ${savepointName}`);
  
  // CRUCIAL : Undo all changes
  db.exec(`ROLLBACK TO SAVEPOINT ${savepointName}`);
  
  // Optionnal : Release SAVEPOIINT to free memory
  // db.exec(`RELEASE SAVEPOINT ${savepointName}`);
});

// ========================================
// AFTER ALL TESTS
// ========================================
afterAll(() => {
  console.log('Close DB connection');
  
  if (db) {
    db.close();
    global.testDb = null;
  }
});
