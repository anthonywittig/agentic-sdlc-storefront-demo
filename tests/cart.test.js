import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, createCart, formatMoney, itemCount, removeItem, subtotal, toCents, totals } from "../src/cart.js";

const tee = { id: "tee", name: "Tee", price: 28 };
const mug = { id: "mug", name: "Mug", price: 16 };

test("adding the same product twice increases its quantity", () => {
  const cart = addItem(addItem(createCart(), tee), tee);
  assert.equal(cart.items.length, 1);
  assert.equal(itemCount(cart), 2);
});

test("cart items store price in cents", () => {
  const cart = addItem(createCart(), tee);
  assert.equal(cart.items[0].price, 2800);
});

test("subtotal sums price times quantity in cents", () => {
  const cart = addItem(addItem(createCart(), tee, 2), mug);
  assert.equal(subtotal(cart), 7200);
});

test("totals add 8% tax rounded to cents", () => {
  const cart = addItem(createCart(), mug);
  assert.deepEqual(totals(cart), { subtotal: 1600, tax: 128, total: 1728 });
});

test("removing a product drops it from the cart", () => {
  const cart = removeItem(addItem(addItem(createCart(), tee), mug), "tee");
  assert.deepEqual(cart.items.map((i) => i.id), ["mug"]);
});

test("quantity must be positive", () => {
  assert.throws(() => addItem(createCart(), tee, 0));
});

test("money is formatted with two decimals", () => {
  assert.equal(formatMoney(500), "$5.00");
});

test("dollar prices convert to cents for formatting", () => {
  assert.equal(formatMoney(toCents(28)), "$28.00");
});
