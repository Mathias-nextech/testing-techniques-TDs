export class Product {
  constructor(id, name, price, description, category, stock) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.category = category;
    this.stock = stock;
  }

  isInStock() {
    return this.stock > 0;
  }
}
