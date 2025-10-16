import { User } from '../../src/models/user.js';

let userRegistry = new Map();

export class UserBuilder {
  constructor() {
    this.data = {
      id: Math.random().toString(36).substr(2, 9),
      email: 'default@acme.com',
      name: 'Default User',
      age: 25,
      role: 'user'
    };
  }
  
  withEmail(email) {
    this.data.email = email;
    return this; // Chaining
  }
  
  withName(name) {
    this.data.name = name;
    return this;
  }
  
  withAge(age) {
    this.data.age = age;
    return this;
  }
  
  withRole(role) {
    this.data.role = role;
    return this;
  }

  // Build the final object
  build() {
    const user = new User(this.id, this.email, this.age, this.role);
    userRegistry.set(user.id, user);
    return user;
  }
}

// Helper to start
export function aUser() {
  return new UserBuilder();
}

// Fonction pour nettoyer le registre des utilisateurs
export function clearUserRegistry() {
  userRegistry.clear();
}

// Permettre l'injection du registre depuis la factory
export function setUserRegistry(registry) {
  userRegistry = registry;
}