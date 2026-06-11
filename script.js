const orderItems = [];
let bundleEnabled = false;

const dealProducts = [
  { name: 'Classic Dill', desc: '15% off any size — grab today\'s special!' },
  { name: 'Pickled Beets and Onions', desc: '15% off any size — sweet savings!' },
  { name: 'Pickled Cherry Tomatoes', desc: '15% off any size — tomato lovers deal!' },
  { name: 'Pickled Daikon and Carrots', desc: '15% off any size — crunch time!' }
];

function formatPrice(amount) {
  return '$' + amount.toFixed(2);
}

function initDealOfDay() {
  const today = new Date();
  const dayIndex = today.getDay();
  const deal = dealProducts[dayIndex % dealProducts.length];

  const nameEl = document.getElementById('deal-product');
  const descEl = document.getElementById('deal-desc');
  if (nameEl) nameEl.textContent = deal.name;
  if (descEl) descEl.textContent = deal.desc;

  updateTimer();
  setInterval(updateTimer, 1000);
}

function updateTimer() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  let diff = midnight - now;
  if (diff <= 0) diff = 0;

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const display = document.getElementById('timer-display');
  if (display) {
    display.textContent =
      String(hours).padStart(2, '0') + ':' +
      String(minutes).padStart(2, '0') + ':' +
      String(seconds).padStart(2, '0');
  }
}

function calcBundleTotal() {
  let smallJars = 0;
  let largeJars = 0;

  for (let i = 0; i < orderItems.length; i++) {
    if (orderItems[i].size === '500ml') {
      smallJars += orderItems[i].quantity;
    } else {
      largeJars += orderItems[i].quantity;
    }
  }

  const smallBundles = Math.floor(smallJars / 4);
  const smallRemainder = smallJars % 4;
  const largeBundles = Math.floor(largeJars / 4);
  const largeRemainder = largeJars % 4;

  const bundlePrice = smallBundles * 15 + smallRemainder * 5 + largeBundles * 30 + largeRemainder * 10;
  const normalPrice = smallJars * 5 + largeJars * 10;
  const savings = normalPrice - bundlePrice;
  const totalJars = smallJars + largeJars;

  return { total: bundlePrice, normal: normalPrice, savings: savings, count: totalJars };
}

function updateOrderDisplay() {
  const container = document.getElementById('order-items');
  const totalSpan = document.getElementById('total-display');
  const checkEl = document.getElementById('bundle-check');
  const savingsEl = document.getElementById('bundle-savings');
  const hintEl = document.getElementById('bundle-hint');
  if (!container || !totalSpan) return;

  let totalJars = 0;
  for (let i = 0; i < orderItems.length; i++) {
    totalJars += orderItems[i].quantity;
  }

  if (orderItems.length === 0) {
    container.innerHTML = '<p class="empty-order">Your order is empty. Add some pickles!</p>';
    totalSpan.textContent = '$0.00';
    if (savingsEl) savingsEl.textContent = '';
    if (hintEl) hintEl.textContent = 'Add at least 4 of the same size to unlock the bundle deal.';
    return;
  }

  let html = '';
  let total = 0;

  for (let i = 0; i < orderItems.length; i++) {
    const item = orderItems[i];
    const lineTotal = item.quantity * item.price;
    total += lineTotal;
    html += '<div class="order-item">';
    html += '<span>' + item.name + ' (' + item.size + ') × ' + item.quantity + '</span>';
    html += '<span>' + formatPrice(lineTotal) + '</span>';
    html += '</div>';
  }

  let needsUpdate = false;
  if (checkEl && totalJars >= 4) {
    const bundle = calcBundleTotal();
    if (bundle.savings > 0) {
      checkEl.disabled = false;
      if (savingsEl) savingsEl.textContent = 'Save ' + formatPrice(bundle.savings) + '!';
      if (hintEl) hintEl.textContent = bundleEnabled ? '' : '✓ Check the box to apply the bundle.';
    } else {
      if (bundleEnabled) {
        bundleEnabled = false;
        checkEl.checked = false;
        needsUpdate = true;
      }
      checkEl.disabled = true;
      if (savingsEl) savingsEl.textContent = '';
      if (hintEl) hintEl.textContent = 'Bundle already applied automatically!';
    }
  } else if (checkEl) {
    if (bundleEnabled) {
      bundleEnabled = false;
      checkEl.checked = false;
      needsUpdate = true;
    }
    checkEl.disabled = true;
    if (savingsEl) savingsEl.textContent = '';
    if (hintEl) hintEl.textContent = totalJars === 0 ? 'Add at least 4 of the same size to unlock the bundle deal.' : 'Need at least 4 jars of the same size for the bundle.';
  }

  let displayTotal = total;
  if (bundleEnabled && totalJars >= 4) {
    const bundle = calcBundleTotal();
    displayTotal = bundle.total;
  }

  container.innerHTML = html;
  totalSpan.textContent = formatPrice(displayTotal);
}

function addToOrder(name, price, size, quantityInputId) {
  const qtyInput = document.getElementById(quantityInputId);
  if (!qtyInput) return;

  const qty = parseInt(qtyInput.value, 10);

  if (isNaN(qty) || qty <= 0) {
    alert('Please enter a valid quantity greater than 0.');
    return;
  }

  if (qty > 99) {
    alert('Maximum 99 jars per item.');
    return;
  }

  for (let i = 0; i < orderItems.length; i++) {
    if (orderItems[i].name === name && orderItems[i].size === size) {
      orderItems[i].quantity += qty;
      updateOrderDisplay();
      qtyInput.value = 0;
      return;
    }
  }

  orderItems.push({ name: name, price: price, size: size, quantity: qty });
  updateOrderDisplay();
  qtyInput.value = 0;
}

function clearOrder() {
  orderItems.length = 0;
  updateOrderDisplay();
}

function toggleProductInfo(targetId) {
  const infoEl = document.getElementById(targetId);
  if (!infoEl) return;

  if (infoEl.classList.contains('visible')) {
    infoEl.classList.remove('visible');
  } else {
    infoEl.classList.add('visible');
  }
}

function handleFormSubmit(event) {
  event.preventDefault();

  const business = document.getElementById('business-name').value.trim();
  const name = document.getElementById('customer-name').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  const partnerType = document.getElementById('partner-type').value;
  const product = document.getElementById('product-select').value;
  const quantity = document.getElementById('order-quantity').value;
  const comments = document.getElementById('comments').value.trim();

  if (!business) {
    alert('Please enter your business name.');
    return;
  }

  if (!name) {
    alert('Please enter your contact name.');
    return;
  }

  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  if (!partnerType) {
    alert('Please select a partnership type.');
    return;
  }

  if (!product) {
    alert('Please select a product.');
    return;
  }

  const confirmationEl = document.getElementById('confirmation-message');
  if (confirmationEl) {
    confirmationEl.innerHTML = '<h3>✅ Request Submitted!</h3><p>Thank you, ' + name + ' from ' + business + '! We received your ' + partnerType + ' request for ' + quantity + ' jar(s) of ' + product + '. We\'ll reach out to ' + email + ' within 24 hours.</p>';
    confirmationEl.classList.add('visible');
    document.getElementById('partner-form').reset();
    confirmationEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const addButtons = document.querySelectorAll('.add-btn');
  for (let i = 0; i < addButtons.length; i++) {
    const btn = addButtons[i];
    btn.addEventListener('click', function (e) {
      const name = this.getAttribute('data-name');
      const qtyId = this.getAttribute('data-qty');
      const sizeId = this.getAttribute('data-size');
      const sizeSelect = document.getElementById(sizeId);
      const price = parseFloat(sizeSelect.options[sizeSelect.selectedIndex].getAttribute('data-price'));
      const size = sizeSelect.value;
      addToOrder(name, price, size, qtyId);
    });
  }

  const infoBtns = document.querySelectorAll('.info-btn');
  for (let i = 0; i < infoBtns.length; i++) {
    const btn = infoBtns[i];
    btn.addEventListener('click', function (e) {
      const target = this.getAttribute('data-target');
      toggleProductInfo(target);
    });
  }

  const clearBtn = document.getElementById('clear-order');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearOrder);
  }

  const bundleCheck = document.getElementById('bundle-check');
  if (bundleCheck) {
    bundleCheck.addEventListener('change', function () {
      bundleEnabled = this.checked;
      updateOrderDisplay();
    });
  }

  const form = document.getElementById('partner-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  const dealEl = document.getElementById('deal-of-day');
  if (dealEl) {
    initDealOfDay();
  }
});
