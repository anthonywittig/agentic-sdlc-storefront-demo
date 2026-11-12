import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, createCart, formatMoney, freeShippingProgress, itemCount, removeItem, subtotal, totals } from "../src/cart.js";

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
  assert.deepEqual(totals(cart), { subtotal: 16, shipping: 6, tax: 1.28, total: 23.28 });
});

const pricey = (price) => addItem(createCart(), { id: "x", name: "X", price });

test("shipping is charged under the threshold", () => {
  assert.equal(totals(pricey(74.99)).shipping, 6);
});

test("shipping is free at exactly $75", () => {
  assert.deepEqual(totals(pricey(75)), { subtotal: 75, shipping: 0, tax: 6, total: 81 });
});

test("shipping is free over $75", () => {
  assert.equal(totals(pricey(100)).shipping, 0);
});

test("empty cart has no shipping and a $0 total", () => {
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("tax excludes shipping", () => {
  assert.equal(totals(pricey(10)).tax, 0.8);
});

test("freeShippingProgress under the threshold", () => {
  assert.deepEqual(freeShippingProgress(pricey(30)), { remaining: 45, progress: 0.4, unlocked: false });
});

test("freeShippingProgress at the threshold", () => {
  assert.deepEqual(freeShippingProgress(pricey(75)), { remaining: 0, progress: 1, unlocked: true });
});

test("freeShippingProgress over the threshold", () => {
  assert.deepEqual(freeShippingProgress(pricey(100)), { remaining: 0, progress: 1, unlocked: true });
});

test("freeShippingProgress for an empty cart", () => {
  assert.deepEqual(freeShippingProgress(createCart()), { remaining: 75, progress: 0, unlocked: false });
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
