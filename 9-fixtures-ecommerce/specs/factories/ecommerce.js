import { faker } from '@faker-js/faker';
import { Product } from '../../src/models/product.js';
import { Order } from '../../src/models/order.js';

const productRegistry = new Map();
const userRegistry = new Map();
const orderRegistry = new Map();

export class ProductBuilder {
  constructor() {
    this.id = Math.random().toString(36).substr(2, 9)
    this.name = faker.commerce.productName()
    this.price = parseFloat(faker.commerce.price())
    this.description = faker.commerce.productDescription()
    this.category = faker.commerce.department()
    this.stock = faker.number.int({ min: 1, max: 100 })
  }

  withName(name) {
    this.name = name;
    return this;
  }

  withPrice(price) {
    this.price = price;
    return this;
  }

  outOfStock() {
    this.stock = 0;
    return this;
  }

  inStock(quantity = 50) {
    this.stock = quantity;
    return this;
  }

  build() {
    const product = new Product(this.id, this.name, this.price, this.description, this.category, this.stock);
    productRegistry.set(product.id, product);
    return product;
  }
}

export class OrderBuilder {
  constructor(userId) {
    this.userId = userId;
    this.order = new Order(userId);
    this.data = {
      userId,
      status: 'pending',
      total: 0,
      items: []
    };
  }
  
  addItem(productId, quantity, price) {
    const product = productRegistry.get(productId);

    if (product && !product.isInStock()) {
      throw new Error(`Product ${productId} is out of stock`);
    }
    this.order.addItem(productId, quantity, price);
    return this;
  }
  
  completed() {
    this.order.complete();
    return this;
  }
  
  cancelled() {
    this.order.cancel();
    return this;
  }

  build() { 
    const order = this.order;
    orderRegistry.set(order.id, order);
    return order;
  }
}

export function aProduct() {
  return new ProductBuilder();
}

export function anOrder(userId) {
  return new OrderBuilder(userId);
}

// Clean all registries
export function clearRegistry() {
  productRegistry.clear();
  userRegistry.clear();
  orderRegistry.clear();
}

export function getProductRegistry() {
  return new Map(productRegistry);
}

export function getUserRegistry() {
  return new Map(userRegistry);
}

export function getOrderRegistry() {
  return new Map(orderRegistry);
}
