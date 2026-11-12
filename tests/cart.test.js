import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, createCart, formatMoney, freeShippingProgress, itemCount, removeItem, shipping, subtotal, totals } from "../src/cart.js";

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

test("empty cart has all-zero totals", () => {
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
  assert.equal(shipping(createCart()), 0);
});

test("exactly $75 ships free", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 75 });
  assert.deepEqual(totals(cart), { subtotal: 75, shipping: 0, tax: 6, total: 81 });
});

test("above the threshold ships free", () => {
  const cart = addItem(createCart(), tee, 3);
  assert.deepEqual(totals(cart), { subtotal: 84, shipping: 0, tax: 6.72, total: 90.72 });
});

test("just below the threshold pays shipping; tax excludes shipping", () => {
  const cart = addItem(createCart(), { id: "y", name: "Y", price: 74.99 });
  const t = totals(cart);
  assert.equal(t.shipping, 6);
  assert.equal(t.tax, 6);
  assert.equal(t.total, 86.99);
});

test("freeShippingProgress below the threshold", () => {
  const cart = addItem(createCart(), tee, 2);
  assert.deepEqual(freeShippingProgress(cart), { remaining: 19, progress: 56 / 75, unlocked: false });
});

test("freeShippingProgress at and above the threshold", () => {
  const at = addItem(createCart(), { id: "x", name: "X", price: 75 });
  assert.deepEqual(freeShippingProgress(at), { remaining: 0, progress: 1, unlocked: true });
  const above = addItem(createCart(), tee, 3);
  assert.deepEqual(freeShippingProgress(above), { remaining: 0, progress: 1, unlocked: true });
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
