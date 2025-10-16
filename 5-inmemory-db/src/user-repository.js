// userRepository.js (version réelle pour BD)
class UserRepository {
  constructor(database) {
    this.db = database;
  }

  async findByEmail(email) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return result.rows[0];
  }

  async save(user) {
    const result = await this.db.run(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [user.email, user.password]
    );
    return {
      id: result.lastID,
      ...user
    };
  }

  async exists(email) {
    const result = await this.db.query(
      'SELECT COUNT(*) as count FROM users WHERE email = ?',
      [email]
    );
    return result.rows[0].count > 0;
  }

  async deleteAll() {
    await this.db.run('DELETE FROM users');
  }

  async findAll() {
    const result = await this.db.query('SELECT * FROM users');
    return result.rows;
  }
}

export default UserRepository;
