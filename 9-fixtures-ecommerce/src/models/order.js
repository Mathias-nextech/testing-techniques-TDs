export class Order {
  constructor(userId) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.userId = userId;
    this.items = [];
    this.status = 'pending';
  }

  addItem(productId, quantity, price) {
    this.items.push({
      productId,
      quantity,
      price,
      total: quantity * price
    });
  }

  complete() {
    this.status = 'completed';
  }

  cancel() {
    this.status = 'canceled';
  }

  get total() {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }
}
