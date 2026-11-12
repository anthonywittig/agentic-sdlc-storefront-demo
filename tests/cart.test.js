import { test } from "node:test";
import assert from "node:assert/strict";
import { SHIPPING_FEE, addItem, createCart, formatMoney, itemCount, removeItem, shipping, shippingProgress, subtotal, totals } from "../src/cart.js";

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

test("empty cart has no shipping", () => {
  assert.equal(shipping(createCart()), 0);
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("shipping is 6 below the threshold", () => {
  const cart = addItem(createCart(), tee);
  assert.equal(shipping(cart), SHIPPING_FEE);
  assert.equal(totals(cart).total, 36 + 0 + 2.24 - 0 + 0 === 0 ? 0 : 28 + 6 + 2.24);
});

test("shipping is free at exactly 75", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 75 });
  assert.equal(shipping(cart), 0);
  assert.equal(totals(cart).total, 81);
});

test("shipping is free above 75", () => {
  const cart = addItem(createCart(), tee, 3);
  assert.equal(shipping(cart), 0);
});

test("shipping is not taxed", () => {
  const t = totals(addItem(createCart(), mug));
  assert.equal(t.tax, 1.28);
});

test("shippingProgress reports remaining, unlocked and percent", () => {
  assert.deepEqual(shippingProgress(createCart()), { remaining: 75, unlocked: false, percent: 0 });
  const some = shippingProgress(addItem(createCart(), mug));
  assert.equal(some.remaining, 59);
  assert.equal(some.unlocked, false);
  assert.ok(Math.abs(some.percent - (16 / 75) * 100) < 1e-9);
  const over = shippingProgress(addItem(createCart(), tee, 3));
  assert.deepEqual(over, { remaining: 0, unlocked: true, percent: 100 });
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
