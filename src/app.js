// DOM wiring for the storefront. Business rules live in cart.js.
import { addItem, createCart, formatMoney, freeShippingProgress, itemCount, removeItem, totals } from "./cart.js";

let cart = createCart();
let products = [];

async function main() {
  const response = await fetch("./products.json");
  products = await response.json();
  renderProducts();
  renderCart();
}

function renderProducts() {
  const grid = document.querySelector("#products");
  grid.innerHTML = "";
  for (const product of products) {
    const card = document.createElement("article");
    card.className = "product";
    card.innerHTML = `
      <div class="product-emoji" aria-hidden="true">${product.emoji}</div>
      <h3>${product.name}</h3>
      <p class="price">${formatMoney(product.price)}</p>
      <button type="button">Add to cart</button>`;
    card.querySelector("button").addEventListener("click", () => {
      cart = addItem(cart, product);
      renderCart();
    });
    grid.appendChild(card);
  }
}

function renderCart() {
  const list = document.querySelector("#cart-items");
  list.innerHTML = "";
  for (const item of cart.items) {
    const row = document.createElement("li");
    row.innerHTML = `<span>${item.name} × ${item.quantity}</span>
      <span>${formatMoney(item.price * item.quantity)}</span>
      <button type="button" class="link" aria-label="Remove ${item.name}">Remove</button>`;
    row.querySelector("button").addEventListener("click", () => {
      cart = removeItem(cart, item.id);
      renderCart();
    });
    list.appendChild(row);
  }
  const { subtotal, shipping, tax, total } = totals(cart);
  const hasItems = cart.items.length > 0;
  document.querySelector("#shipping").textContent =
    shipping === 0 && hasItems ? "Free" : formatMoney(shipping);
  const block = document.querySelector("#free-shipping");
  block.hidden = !hasItems;
  if (hasItems) {
    const { remaining, unlocked, percent } = freeShippingProgress(cart);
    document.querySelector("#free-shipping-fill").style.width = `${percent}%`;
    document.querySelector("#free-shipping-bar").setAttribute("aria-valuenow", String(Math.round(percent)));
    document.querySelector("#free-shipping-message").textContent = unlocked
      ? "You've unlocked free shipping"
      : `You're ${formatMoney(remaining)} away from free shipping`;
    block.classList.toggle("unlocked", unlocked);
  }
  document.querySelector("#cart-count").textContent = String(itemCount(cart));
  document.querySelector("#subtotal").textContent = formatMoney(subtotal);
  document.querySelector("#tax").textContent = formatMoney(tax);
  document.querySelector("#total").textContent = formatMoney(total);
  document.querySelector("#empty").hidden = cart.items.length > 0;
}

main();
