import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, createCart, formatMoney, itemCount, removeItem, subtotal, totals } from "../src/cart.js";

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

const pricey = { id: "pricey", name: "Pricey", price: 75 };

test("empty cart has no shipping and totals zero", () => {
  assert.equal(shipping(createCart()), 0);
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("below threshold pays flat shipping", () => {
  assert.equal(shipping(addItem(createCart(), tee)), SHIPPING_FEE);
});

test("exactly $75 ships free", () => {
  assert.equal(shipping(addItem(createCart(), pricey)), 0);
});

test("above threshold ships free", () => {
  assert.equal(shipping(addItem(createCart(), tee, 3)), 0);
});

test("tax excludes shipping and total includes it", () => {
  const t = totals(addItem(createCart(), tee));
  assert.equal(t.tax, 2.24);
  assert.equal(t.shipping, 6);
  assert.equal(t.total, 36.24);
});

test("free shipping progress below threshold", () => {
  const p = freeShippingProgress(addItem(createCart(), tee));
  assert.equal(p.remaining, 47);
  assert.equal(p.unlocked, false);
  assert.ok(Math.abs(p.percent - (28 / 75) * 100) < 1e-9);
});

test("free shipping progress caps at 100", () => {
  const p = freeShippingProgress(addItem(createCart(), tee, 3));
  assert.deepEqual(p, { remaining: 0, unlocked: true, percent: 100 });
  assert.equal(freeShippingProgress(addItem(createCart(), pricey)).unlocked, true);
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
