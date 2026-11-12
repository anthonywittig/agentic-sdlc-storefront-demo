import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addItem, createCart, formatMoney, freeShippingProgress, itemCount, removeItem, shipping, subtotal, totals,
} from "../src/cart.js";

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

test("totals add shipping and 8% tax rounded to cents", () => {
  const cart = addItem(createCart(), mug);
  assert.deepEqual(totals(cart), { subtotal: 16, shipping: 6, tax: 1.28, total: 23.28 });
});

test("empty cart has no shipping and zero totals", () => {
  assert.equal(shipping(createCart()), 0);
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("shipping is $6 under the threshold", () => {
  assert.equal(shipping(addItem(createCart(), tee, 2)), 6);
});

test("shipping is free at exactly $75", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 75 });
  assert.equal(shipping(cart), 0);
});

test("shipping is free over $75", () => {
  const cart = addItem(createCart(), tee, 3);
  assert.equal(shipping(cart), 0);
  assert.deepEqual(totals(cart), { subtotal: 84, shipping: 0, tax: 6.72, total: 90.72 });
});

test("tax is charged on the subtotal only", () => {
  const t = totals(addItem(createCart(), tee));
  assert.equal(t.tax, 2.24);
  assert.equal(t.total, 36.24);
});

test("free shipping progress under the threshold", () => {
  const p = freeShippingProgress(addItem(createCart(), tee, 2));
  assert.deepEqual(p, { remaining: 19, unlocked: false, percent: 96 });
});

test("free shipping progress for empty cart", () => {
  assert.deepEqual(freeShippingProgress(createCart()), { remaining: 75, unlocked: false, percent: 0 });
});

test("free shipping progress caps at 100 when unlocked", () => {
  const p = freeShippingProgress(addItem(createCart(), tee, 4));
  assert.deepEqual(p, { remaining: 0, unlocked: true, percent: 100 });
  const exact = freeShippingProgress(addItem(createCart(), { id: "x", name: "X", price: 75 }));
  assert.deepEqual(exact, { remaining: 0, unlocked: true, percent: 100 });
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
