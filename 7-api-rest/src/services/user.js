class UserService {
  constructor(emailService, userRepository) {
    this.emailService = emailService;
    this.userRepository = userRepository;
  }

  async registerUser(email, password) {
    const exists = await this.userRepository.exists(email);
    if (exists) {
      throw new Error('Utilisateur déjà existant');
    }

    const user = {
      email,
      password: this.hashPassword(password)
    };

    const savedUser = await this.userRepository.save(user);

    await this.emailService.sendEmail(
      email,
      'Bienvenue !',
      'Merci de votre inscription'
    );

    return savedUser;
  }

  async getUserById(id) {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email) {
    return await this.userRepository.findByEmail(email);
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async updateUser(id, updates) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }

    if (updates.password) {
      updates.password = this.hashPassword(updates.password);
    }

    return await this.userRepository.update(id, updates);
  }

  async deleteUser(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return false;
    }
    await this.userRepository.delete(id);
    return true;
  }

  hashPassword(password) {
    return `hashed_${password}`;
  }
}

export default UserService;
