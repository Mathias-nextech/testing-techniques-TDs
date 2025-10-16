class UserRepositoryMongo {
  constructor(collection) {
    this.collection = collection;
  }

  async save(user) {
    const result = await this.collection.insertOne(user);
    return {
      id: result.insertedId,
      ...user
    };
  }

  async findByEmail(email) {
    return await this.collection.findOne({ email });
  }

  async exists(email) {
    const count = await this.collection.countDocuments({ email });
    return count > 0;
  }

  async findAll() {
    return await this.collection.find({}).toArray();
  }

  async deleteAll() {
    await this.collection.deleteMany({});
  }
}

export default UserRepositoryMongo;
