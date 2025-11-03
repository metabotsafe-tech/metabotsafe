
// Stripe Checkout via Netlify Function, 1€
// This function triggers a serverless Netlify Function to create a Stripe checkout
// session. It prompts the user for their email address (so the guide can be
// delivered) and posts the product name and email to the function. If a URL
// is returned it redirects the browser to Stripe’s hosted checkout. On any
// error the user is notified.
window.startCheckout = async function (name) {
  const email = prompt('Votre e-mail (pour recevoir le guide PDF):') || undefined;
  try {
    const res = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    const j = await res.json();
    if (j.url) {
      window.location = j.url;
    } else {
      alert('Erreur de paiement');
    }
  } catch (e) {
    console.error(e);
    alert('Erreur réseau');
  }
};

// --- Cart functionality ---
// Update the cart count displayed in the navigation bar. This looks for an
// element with id "cart-count" (if present) and updates its contents based on
// the number of items stored in localStorage.
function updateCartCount() {
  const countSpan = document.getElementById('cart-count');
  if (!countSpan) return;
  const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
  countSpan.textContent = cart.length > 0 ? ' (' + cart.length + ')' : '';
}

// Add an item to the cart with a given price. For this site all bots are
// priced at 1 € in test mode, but this function accepts any price. Items are
// persisted in localStorage under the key `cartItems`.
function addToCart(item, price) {
  const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
  cart.push({ item: item, price: price });
  localStorage.setItem('cartItems', JSON.stringify(cart));
  updateCartCount();
  alert('Le produit a été ajouté au panier.');
}

// Display cart contents on the cart page. It expects elements with ids
// `cart-items` and `cart-total` to exist in the DOM and fills them with the
// current cart contents and total price.
function showCart() {
  const list = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!list || !totalEl) return;
  const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
  list.innerHTML = '';
  let sum = 0;
  cart.forEach(({ item, price }) => {
    const li = document.createElement('li');
    li.textContent = item + ' — ' + price + ' €';
    list.appendChild(li);
    sum += price;
  });
  totalEl.textContent = sum.toFixed(2);
}

// Complete a purchase simulation. This function checks that an account has
// been registered, confirms there are items in the cart, displays a summary
// to the user and then clears the cart. It does not perform any real
// transaction — use startCheckout() for the Stripe integration.
function checkout() {
  const email = localStorage.getItem('accountEmail');
  if (!email) {
    alert("Veuillez créer un compte avant d'acheter.");
    window.location.href = 'account.html';
    return;
  }
  const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
  if (!cart.length) {
    alert('Votre panier est vide.');
    return;
  }
  let details = '';
  let sum = 0;
  cart.forEach(({ item, price }) => {
    details += '\n- ' + item + ' : ' + price + ' €';
    sum += price;
  });
  alert(
    'Commande test créée pour ' +
      email +
      ' :' +
      details +
      '\nTotal : ' +
      sum.toFixed(2) +
      ' €\nAucune transaction réelle n\'a été effectuée.'
  );
  localStorage.removeItem('cartItems');
  updateCartCount();
  window.location.href = 'index.html';
}

// Apply a consistent navigation bar across all pages. This function populates
// the <ul> inside .main-nav with a standard set of menu items. It is called
// on every page on DOM ready.
function applyNav() {
  const navList = document.querySelector('.main-nav ul');
  if (!navList) return;
  navList.innerHTML = `
    <li class="nav-item"><a href="index.html">🏠 Accueil</a></li>
    <li class="nav-item"><a href="eurusd.html">💶 EURUSD</a>
      <div class="dropdown-menu">
        <div class="dropdown-item"><a href="eurusd_h1_list.html">H1</a></div>
        <div class="dropdown-item"><a href="eurusd_h4_list.html">H4</a></div>
        <div class="dropdown-item"><a href="eurusd_m15_list.html">M15</a></div>
        <div class="dropdown-item"><a href="eurusd_m5_list.html">M5</a></div>
        <div class="dropdown-item"><a href="eurusd_pack_securite.html">Pack sécurité</a></div>
        <div class="dropdown-item"><a href="eurusd_pack_performance.html">Pack performance</a></div>
        <div class="dropdown-item"><a href="mix_pack_securite.html">Pack mixte sécurité</a></div>
        <div class="dropdown-item"><a href="mix_pack_performance.html">Pack mixte performance</a></div>
      </div>
    </li>
    <li class="nav-item"><a href="xauusd.html">🥇 XAUUSD</a>
      <div class="dropdown-menu">
        <div class="dropdown-item"><a href="xauusd_h1_list.html">H1</a></div>
        <div class="dropdown-item"><a href="xauusd_h4_list.html">H4</a></div>
        <div class="dropdown-item"><a href="xauusd_m15_list.html">M15</a></div>
        <div class="dropdown-item"><a href="xauusd_pack_securite.html">Pack sécurité</a></div>
        <div class="dropdown-item"><a href="xauusd_pack_performance.html">Pack performance</a></div>
      </div>
    </li>
    <li class="nav-item"><a href="propfirm.html">🏢 Prop Firm</a>
      <div class="dropdown-menu">
        <div class="dropdown-item"><a href="propfirm_5_percenters.html">5 %ers</a></div>
        <div class="dropdown-item"><a href="propfirm_ftmo.html">FTMO</a></div>
        <div class="dropdown-item"><a href="propfirm_my_forex_funds.html">My Forex Funds</a></div>
      </div>
    </li>
    <li class="nav-item"><a href="code.html">📜 Codes complets</a></li>
    <li class="nav-item"><a href="faq.html">📋 FAQ</a></li>
    <li class="nav-item"><a href="account.html">👤 Mon compte</a></li>
    <li class="nav-item"><a href="cart.html">🛒 Panier</a></li>
  `;
}

// Register an account without reloading the page. This is used on the
// account.html page to save the user’s email address in localStorage.
function registerAccount() {
  const emailField = document.getElementById('email');
  const msg = document.getElementById('signup-message');
  if (!emailField || !msg) return false;
  const email = emailField.value.trim();
  if (!email) {
    alert('Veuillez saisir une adresse e‑mail valide.');
    return false;
  }
  localStorage.setItem('accountEmail', email);
  msg.textContent = 'Compte créé pour ' + email + '. Vous pouvez désormais acheter des bots.';
  emailField.value = '';
  return false; // prevent form submission
}

// Simulate a purchase by displaying a summary. This function is used for
// non-Stripe purchases and simply shows an alert; it does not send any
// external email.
function simulatePurchase(item, price) {
  const email = localStorage.getItem('accountEmail');
  if (!email) {
    alert('Veuillez créer un compte avant de finaliser un achat.');
    window.location.href = 'account.html';
    return;
  }
  alert(
    'Commande test pour ' +
      email +
      '\nProduit : ' +
      item +
      '\nPrix : ' +
      price +
      ' €\nAucune transaction réelle n\'a été effectuée.'
  );
}

// On DOM ready populate the navigation bar and update the cart count. Since
// translations are now handled via Google Translate, no further language
// adjustments are performed here.
document.addEventListener('DOMContentLoaded', () => {
  applyNav();
  updateCartCount();
});
