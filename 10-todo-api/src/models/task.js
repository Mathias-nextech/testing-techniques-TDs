export default class Task {
  constructor(title, description, completed = false) {
    this.title = title;
    this.description = description;
    this.completed = completed;
    this.createdAt = new Date();
  }
}
