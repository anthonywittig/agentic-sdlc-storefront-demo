import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, bulkDiscount, createCart, formatMoney, itemCount, removeItem, subtotal, totals } from "../src/cart.js";

const tee = { id: "tee", name: "Tee", price: 28 };
const mug = { id: "mug", name: "Mug", price: 16 };

test("adding the same product twice increases its quantity", () => {
  const cart = addItem(addItem(createCart(), tee), tee);
  assert.equal(cart.items.length, 1);
  assert.equal(itemCount(cart), 2);
});

test("subtotal sums price times quantity", () => {
  const cart = addItem(addItem(createCart(), tee, 2), mug);
  assert.equal(subtotal(cart), 72);
});

test("totals add 8% tax rounded to cents", () => {
  const cart = addItem(createCart(), mug);
  assert.deepEqual(totals(cart), { subtotal: 16, discount: 0, tax: 1.28, total: 17.28 });
});

test("removing a product drops it from the cart", () => {
  const cart = removeItem(addItem(addItem(createCart(), tee), mug), "tee");
  assert.deepEqual(cart.items.map((i) => i.id), ["mug"]);
});

test("quantity must be positive", () => {
  assert.throws(() => addItem(createCart(), tee, 0));
});

test("money is formatted with two decimals", () => {
  assert.equal(formatMoney(5), "$5.00");
});

test("carts with several items get the bulk discount", () => {
  const cart = addItem(createCart(), mug, 4);
  assert.equal(bulkDiscount(cart), 6.4);
});

test("exactly 3 items get the discount, 2 do not", () => {
  assert.equal(bulkDiscount(addItem(createCart(), mug, 3)), 4.8);
  assert.equal(bulkDiscount(addItem(createCart(), mug, 2)), 0);
});

test("totals include the discount", () => {
  assert.deepEqual(totals(addItem(createCart(), mug, 3)), { subtotal: 48, discount: 4.8, tax: 3.84, total: 47.04 });
});

test("small carts pay full price", () => {
  assert.equal(bulkDiscount(addItem(createCart(), mug)), 0);
});
