import { describe, it, expect, beforeEach } from 'vitest';
import { aUser } from './builders/user-builder';
import { aProduct, anOrder, clearRegistry } from './factories/ecommerce';

describe('E-commerce - complete scenario', () => {

  beforeEach(() => {
    clearRegistry();
  });

  it('A User should buy many Products', () => {
    // Instantiate a User
    const customer = aUser()
      .withEmail('customer@acme.com')
      .build();

    // Create some Products
    const laptop = aProduct()
      .withName('MacBook Pro')
      .withPrice(2000)
      .inStock(10)
      .build();

    const mouse = aProduct()
      .withName('Magic Mouse')
      .withPrice(80)
      .inStock(50)
      .build();

    // Create an Order for that User
    const order = anOrder(customer.id)
      .addItem(laptop.id, 1, laptop.price)
      .addItem(mouse.id, 2, mouse.price)
      .completed()
      .build();

    // Some expectations
    expect(order.total).toBe(2160);
    expect(order.status).toBe('completed');

  });

  it('A User should not buy an out of stock Product', () => {
    const customer = aUser().build();
    const product = aProduct().outOfStock().build();
    
    expect(() => {
      anOrder(customer.id)
        .addItem(product.id, 1, product.price)
        .build();
    }).toThrow(/out of stock/i);
  });
});