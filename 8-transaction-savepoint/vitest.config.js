import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    
    // 🔧 IMPORTANT : Charger le setup
    setupFiles: ['./specs/setup-savepoint.js'],
    
    // Variables d'environnement
    env: {
      NODE_ENV: 'test',
      DEBUG: 'false' // Mettre 'true' pour voir les requêtes SQL
    },
    
    // Timeout
    testTimeout: 10000,
    
    // Exécution séquentielle (recommandé pour SQLite)
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    }
  }
});
