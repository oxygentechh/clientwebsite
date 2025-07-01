// Example product data
const PRODUCTS = [
  { id: 1, title: 'Safety Helmet', category: 'helmets', price: 250, minOrder: 5, img: 'https://img.icons8.com/color/96/000000/hard-hat.png' },
  { id: 2, title: 'Nitrile Gloves', category: 'gloves', price: 120, minOrder: 10, img: 'https://img.icons8.com/color/96/000000/medical-gloves.png' },
  { id: 3, title: 'Face Shield', category: 'ppe', price: 180, minOrder: 3, img: 'https://img.icons8.com/color/96/000000/face-shield.png' },
  { id: 4, title: 'Ear Plugs', category: 'ppe', price: 60, minOrder: 20, img: 'https://img.icons8.com/color/96/000000/ear-plugs.png' },
  { id: 5, title: 'Reflective Vest', category: 'ppe', price: 90, minOrder: 8, img: 'https://img.icons8.com/color/96/000000/safety-vest.png' },
  { id: 6, title: 'Safety Goggles', category: 'ppe', price: 150, minOrder: 4, img: 'https://img.icons8.com/color/96/000000/safety-goggles.png' },
  { id: 7, title: 'Dust Mask', category: 'ppe', price: 40, minOrder: 50, img: 'https://img.icons8.com/color/96/000000/dust-mask.png' },
  { id: 8, title: 'First Aid Kit', category: 'ppe', price: 500, minOrder: 2, img: 'https://img.icons8.com/color/96/000000/first-aid-kit.png' },
  { id: 9, title: 'laptop bag', category: 'bag', price: 330, minOrder: 20, img: 'https://img.icons8.com/color/96/000000/safety-boots.png' },
];

let cart = [];
let userContact = null;

function showContactModal() {
  let modal = document.getElementById('contact-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'contact-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.4)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '3000';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `<div style='background:#fff;padding:2rem 1.5rem;border-radius:18px;min-width:320px;max-width:95vw;box-shadow:0 4px 24px rgba(0,0,0,0.15);position:relative;'>
    <button id='close-contact-modal' style='position:absolute;top:10px;right:16px;font-size:1.3rem;background:none;border:none;cursor:pointer;'>&times;</button>
    <h2 style='margin-top:0;'>Enter Contact Info</h2>
    <form id='contact-form'>
      <label style='font-weight:600;'>Phone or Email:</label><br>
      <input id='contact-input' type='text' style='width:90%;padding:0.5rem;margin:1rem 0 0.5rem 0;border-radius:8px;border:1px solid #ccc;font-size:1.1rem;' placeholder='Enter phone or email' required><br>
      <button type='submit' style='background:#111;color:#fff;padding:0.6rem 1.5rem;border:none;border-radius:30px;font-size:1.1rem;font-weight:600;cursor:pointer;margin-top:0.5rem;'>Continue</button>
    </form>
    <div id='contact-error' style='color:#e53935;font-size:1rem;margin-top:0.5rem;display:none;'>Contact info required!</div>
  </div>`;
  document.getElementById('close-contact-modal').onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  document.getElementById('contact-form').onsubmit = function(e) {
    e.preventDefault();
    const val = document.getElementById('contact-input').value.trim();
    if (val.length > 0) {
      userContact = val;
      modal.remove();
      if (window._pendingAddToCart) {
        window._pendingAddToCart();
        window._pendingAddToCart = null;
      }
    } else {
      document.getElementById('contact-error').style.display = 'block';
    }
  };
}

// --- SEARCH BAR ---
function renderSearchBar() {
  let searchBar = document.getElementById('search-bar');
  if (!searchBar) {
    searchBar = document.createElement('input');
    searchBar.id = 'search-bar';
    searchBar.type = 'text';
    searchBar.placeholder = 'Search products or categories...';
    searchBar.style = 'width:100%;max-width:350px;padding:0.5rem 1rem;margin:1.5rem auto 1rem auto;display:block;border-radius:20px;border:1.5px solid #ccc;font-size:1.1rem;';
    const main = document.getElementById('main-content');
    main.insertAdjacentElement('afterbegin', searchBar);
  }
  searchBar.addEventListener('input', renderProducts);
}

// --- ENHANCED RENDER PRODUCTS ---
function renderProducts() {
  const list = document.getElementById('product-list');
  const category = document.getElementById('category-filter').value;
  const minOrder = parseInt(document.getElementById('min-order').value, 10) || 1;
  const search = (document.getElementById('search-bar')?.value || '').toLowerCase();
  list.innerHTML = '';
  getProducts().filter(p =>
    (category === 'all' || p.category === category) &&
    p.minOrder >= minOrder &&
    (
      p.title.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search)
    )
  ).forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.img}" alt="${product.title}" style="cursor:pointer;">
      <div class="product-title" style="cursor:pointer;">${product.title}</div>
      <div class="product-price">₹${product.price}</div>
      <div class="product-min-order">Min Order: ${product.minOrder}</div>
      <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
    `;
    card.querySelector('img').onclick = () => showProductDetails(product);
    card.querySelector('.product-title').onclick = () => showProductDetails(product);
    card.querySelector('.add-to-cart-btn').onclick = () => handleAddToCart(product);
    list.appendChild(card);
  });
}

// --- PRODUCT DETAILS MODAL ---
function showProductDetails(product) {
  let modal = document.getElementById('product-details-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'product-details-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.4)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '4000';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `<div style='background:#fff;padding:2rem 1.5rem;border-radius:18px;min-width:320px;max-width:95vw;box-shadow:0 4px 24px rgba(0,0,0,0.15);position:relative;'>
    <button id='close-product-details-modal' style='position:absolute;top:10px;right:16px;font-size:1.3rem;background:none;border:none;cursor:pointer;'>&times;</button>
    <div style='display:flex;gap:2rem;flex-wrap:wrap;align-items:center;'>
      <img src='${product.img}' alt='${product.title}' style='width:120px;height:120px;border-radius:12px;background:#f7f7f7;'>
      <div>
        <h2 style='margin:0 0 0.5rem 0;'>${product.title}</h2>
        <div style='color:#e53935;font-weight:bold;font-size:1.2rem;'>₹${product.price}</div>
        <div style='color:#666;'>Min Order: ${product.minOrder}</div>
        <div style='margin:1rem 0;'>${product.description || 'High quality safety product.'}</div>
        <button class='add-to-cart-btn' data-id='${product.id}' style='margin-right:1rem;'>Add to Cart</button>
      </div>
    </div>
  </div>`;
  document.getElementById('close-product-details-modal').onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  // Add to cart from modal
  modal.querySelector('.add-to-cart-btn').onclick = () => handleAddToCart(product);
}

// --- WISHLIST ---
function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist') || '[]');
}
function addToWishlist(product) {
  let wishlist = getWishlist();
  if (!wishlist.find(p => p.id === product.id)) {
    wishlist.push(product);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    alert('Added to wishlist!');
  } else {
    alert('Already in wishlist!');
  }
}

// --- PERSISTENT CART ---
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function loadCart() {
  cart = JSON.parse(localStorage.getItem('cart') || '[]');
  document.getElementById('cart-count').textContent = cart.length;
}

// --- CART PAGE/MODAL ---
function renderCartModal() {
  let modal = document.getElementById('cart-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cart-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.4)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2000';
    document.body.appendChild(modal);
  }
  let html = `<div class="cart-modal-content">
    <button id='close-cart-modal' class='cart-modal-close'>&times;</button>
    <h2 class='cart-modal-title'>Your Cart</h2>`;
  if (cart.length === 0) {
    html += `<div class='cart-empty'>Your cart is empty.</div>`;
  } else {
    let total = 0;
    html += `<div class='cart-items-list'>`;
    cart.forEach((item, idx) => {
      const itemTotal = (item.qty || item.minOrder) * item.price;
      total += itemTotal;
      html += `
        <div class='cart-item-card'>
          <img src='${item.img}' alt='${item.title}' class='cart-item-img'>
          <div class='cart-item-info'>
            <div class='cart-item-title'>${item.title}</div>
            <div class='cart-item-price'>₹${item.price} <span class='cart-item-moq'>(Min: ${item.minOrder})</span></div>
            <div class='cart-item-qty'>
              <button class='qty-btn' data-idx='${idx}' data-action='dec'>-</button>
              <input type='number' min='${item.minOrder}' value='${item.qty||item.minOrder}' data-idx='${idx}' class='cart-qty-input'>
              <button class='qty-btn' data-idx='${idx}' data-action='inc'>+</button>
            </div>
            <div class='cart-item-total'>Subtotal: ₹${itemTotal}</div>
          </div>
          <button class='remove-cart-item' data-idx='${idx}' title='Remove'>&#128465;</button>
        </div>
      `;
    });
    html += `</div>`;
    html += `<div class='cart-modal-footer'>
      <div class='cart-total-label'>Total:</div>
      <div class='cart-total-value'>₹${total}</div>
    </div>`;
    const waMsg = encodeURIComponent(`Hi, I am interested in these products: ${cart.map(i=>i.title + ' (₹' + i.price + ', Min Order: ' + i.minOrder + ', Qty: ' + (i.qty||i.minOrder) + ')').join('; ')}. Total: ₹${total}`);
    html += `<a id='wa-chat-btn' href='https://wa.me/919915017068?text=${waMsg}' target='_blank' class='cart-whatsapp-btn'>Checkout on WhatsApp</a>`;
  }
  html += `</div>`;
  modal.innerHTML = html;
  document.getElementById('close-cart-modal').onclick = () => { modal.remove(); };
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  // Quantity controls
  modal.querySelectorAll('.qty-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const idx = +this.getAttribute('data-idx');
      const action = this.getAttribute('data-action');
      let val = cart[idx].qty || cart[idx].minOrder;
      if (action === 'inc') val++;
      if (action === 'dec') val = Math.max(cart[idx].minOrder, val - 1);
      cart[idx].qty = val;
      saveCart();
      renderCartModal();
    };
  });
  // Quantity input
  modal.querySelectorAll('.cart-qty-input').forEach(input => {
    input.onchange = function() {
      const idx = +this.getAttribute('data-idx');
      let val = Math.max(cart[idx].minOrder, +this.value);
      this.value = val;
      cart[idx].qty = val;
      saveCart();
      renderCartModal();
    };
  });
  // Remove item
  modal.querySelectorAll('.remove-cart-item').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const idx = +this.getAttribute('data-idx');
      cart.splice(idx, 1);
      saveCart();
      renderCartModal();
      document.getElementById('cart-count').textContent = cart.length;
    };
  });
}

// --- CART PAGE (FULL PAGE) ---
function renderCartPage() {
  const cartPage = document.getElementById('cart-page');
  let html = `<div class="cart-page-content">
    <button id='close-cart-page' class='cart-page-close'>&larr; Back to Shop</button>
    <h2 class='cart-modal-title'>Your Cart</h2>`;
  if (cart.length === 0) {
    html += `<div class='cart-empty'>Your cart is empty.</div>`;
  } else {
    let total = 0;
    html += `<div class='cart-items-list'>`;
    cart.forEach((item, idx) => {
      const itemTotal = (item.qty || item.minOrder) * item.price;
      total += itemTotal;
      html += `
        <div class='cart-item-card'>
          <img src='${item.img}' alt='${item.title}' class='cart-item-img'>
          <div class='cart-item-info'>
            <div class='cart-item-title'>${item.title}</div>
            <div class='cart-item-price'>₹${item.price} <span class='cart-item-moq'>(Min: ${item.minOrder})</span></div>
            <div class='cart-item-qty'>
              <button class='qty-btn' data-idx='${idx}' data-action='dec'>-</button>
              <input type='number' min='${item.minOrder}' value='${item.qty||item.minOrder}' data-idx='${idx}' class='cart-qty-input'>
              <button class='qty-btn' data-idx='${idx}' data-action='inc'>+</button>
            </div>
            <div class='cart-item-total'>Subtotal: ₹${itemTotal}</div>
          </div>
          <button class='remove-cart-item' data-idx='${idx}' title='Remove'>&#128465;</button>
        </div>
      `;
    });
    html += `</div>`;
    html += `<div class='cart-modal-footer'>
      <div class='cart-total-label'>Total:</div>
      <div class='cart-total-value'>₹${total}</div>
    </div>`;
    const waMsg = encodeURIComponent(`Hi, I am interested in these products: ${cart.map(i=>i.title + ' (₹' + i.price + ', Min Order: ' + i.minOrder + ', Qty: ' + (i.qty||i.minOrder) + ')').join('; ')}. Total: ₹${total}`);
    html += `<a id='wa-chat-btn' href='https://wa.me/919915017068?text=${waMsg}' target='_blank' class='cart-whatsapp-btn'>Checkout on WhatsApp</a>`;
  }
  html += `</div>`;
  cartPage.innerHTML = html;
  // Close/back button
  document.getElementById('close-cart-page').onclick = () => {
    cartPage.style.display = 'none';
    document.getElementById('main-content').style.display = '';
    window.scrollTo(0,0);
  };
  // Quantity controls
  cartPage.querySelectorAll('.qty-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const idx = +this.getAttribute('data-idx');
      const action = this.getAttribute('data-action');
      let val = cart[idx].qty || cart[idx].minOrder;
      if (action === 'inc') val++;
      if (action === 'dec') val = Math.max(cart[idx].minOrder, val - 1);
      cart[idx].qty = val;
      saveCart();
      renderCartPage();
    };
  });
  // Quantity input
  cartPage.querySelectorAll('.cart-qty-input').forEach(input => {
    input.onchange = function() {
      const idx = +this.getAttribute('data-idx');
      let val = Math.max(cart[idx].minOrder, +this.value);
      this.value = val;
      cart[idx].qty = val;
      saveCart();
      renderCartPage();
    };
  });
  // Remove item
  cartPage.querySelectorAll('.remove-cart-item').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const idx = +this.getAttribute('data-idx');
      cart.splice(idx, 1);
      saveCart();
      renderCartPage();
      document.getElementById('cart-count').textContent = cart.length;
    };
  });
}

// Ensure cart-page section exists
if (!document.getElementById('cart-page')) {
  const cartSection = document.createElement('section');
  cartSection.id = 'cart-page';
  cartSection.style.display = 'none';
  document.body.appendChild(cartSection);
}

// Replace cart button event to show cart page
const cartBtn = document.getElementById('cart-btn');
if (cartBtn) {
  cartBtn.addEventListener('click', function(e) {
    renderCartPage();
    document.getElementById('cart-page').style.display = '';
    document.getElementById('main-content').style.display = 'none';
    window.scrollTo(0,0);
  });
}

// --- CHECKOUT MODAL ---
function showCheckoutModal() {
  let modal = document.getElementById('checkout-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'checkout-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.4)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '5000';
    document.body.appendChild(modal);
  }
  let html = `<div style='background:#fff;padding:2rem 1.5rem;border-radius:18px;min-width:320px;max-width:95vw;box-shadow:0 4px 24px rgba(0,0,0,0.15);position:relative;'>
    <button id='close-checkout-modal' style='position:absolute;top:10px;right:16px;font-size:1.3rem;background:none;border:none;cursor:pointer;'>&times;</button>
    <h2 style='margin-top:0;'>Checkout</h2>
    <form id='checkout-form'>
      <label>Name:<br><input type='text' id='checkout-name' required style='width:90%;padding:0.5rem;margin:0.5rem 0;border-radius:8px;border:1px solid #ccc;'></label><br>
      <label>Address:<br><textarea id='checkout-address' required style='width:90%;padding:0.5rem;margin:0.5rem 0;border-radius:8px;border:1px solid #ccc;'></textarea></label><br>
      <label>Phone:<br><input type='text' id='checkout-phone' required style='width:90%;padding:0.5rem;margin:0.5rem 0;border-radius:8px;border:1px solid #ccc;'></label><br>
      <button type='submit' style='background:#111;color:#fff;padding:0.7rem 1.5rem;border-radius:30px;font-size:1.1rem;font-weight:600;margin-top:1rem;'>Place Order</button>
    </form>
  </div>`;
  modal.innerHTML = html;
  document.getElementById('close-checkout-modal').onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  document.getElementById('checkout-form').onsubmit = function(e) {
    e.preventDefault();
    alert('Order placed! (Demo only)');
    modal.remove();
    cart = [];
    saveCart();
    document.getElementById('cart-count').textContent = cart.length;
  };
}

// --- PRODUCT DATA SOURCE ---
function getProducts() {
  // Try to load from localStorage, else fallback to static PRODUCTS
  const stored = localStorage.getItem('products');
  if (stored) {
    try {
      const arr = JSON.parse(stored);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    } catch (e) {}
  }
  return PRODUCTS;
}

// --- INIT ---
renderSearchBar();
loadCart();
renderProducts();

// JavaScript to hide WhatsApp float when contact section is visible
function handleWhatsAppFloatVisibility() {
    const waFloat = document.querySelector('.whatsapp-float');
    const contactSection = document.getElementById('contact');
    if (!waFloat || !contactSection) return;
    const contactRect = contactSection.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    // If the top of the contact section is visible in the viewport, hide the float
    if (contactRect.top < windowHeight && contactRect.bottom > 0) {
        waFloat.style.display = 'none';
    } else {
        waFloat.style.display = 'flex';
    }
}
window.addEventListener('scroll', handleWhatsAppFloatVisibility);
window.addEventListener('resize', handleWhatsAppFloatVisibility);
document.addEventListener('DOMContentLoaded', handleWhatsAppFloatVisibility);

function updateWhatsAppFloatPosition() {
    const waFloat = document.querySelector('.whatsapp-float');
    const footer = document.querySelector('footer');
    if (!waFloat || !footer) return;
    const floatHeight = waFloat.offsetHeight;
    const floatBottom = 70; // px, as in CSS
    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    // If the footer is visible and would overlap the float, move the float up
    if (footerRect.top < windowHeight - floatBottom) {
        const overlap = windowHeight - footerRect.top + 24; // 24px margin
        waFloat.style.bottom = overlap + floatHeight + 'px';
    } else {
        waFloat.style.bottom = floatBottom + 'px';
    }
}
window.addEventListener('scroll', updateWhatsAppFloatPosition);
window.addEventListener('resize', updateWhatsAppFloatPosition);
document.addEventListener('DOMContentLoaded', updateWhatsAppFloatPosition);

// --- ADD TO CART ---
function showMessage(msg) {
  let msgDiv = document.getElementById('site-message');
  if (!msgDiv) {
    msgDiv = document.createElement('div');
    msgDiv.id = 'site-message';
    msgDiv.style.position = 'fixed';
    msgDiv.style.top = '30px';
    msgDiv.style.left = '50%';
    msgDiv.style.transform = 'translateX(-50%)';
    msgDiv.style.background = '#e53935';
    msgDiv.style.color = '#fff';
    msgDiv.style.padding = '0.8em 2em';
    msgDiv.style.borderRadius = '8px';
    msgDiv.style.fontWeight = 'bold';
    msgDiv.style.fontSize = '1.1em';
    msgDiv.style.zIndex = '9999';
    msgDiv.style.boxShadow = '0 2px 12px rgba(0,0,0,0.13)';
    document.body.appendChild(msgDiv);
  }
  msgDiv.textContent = msg;
  msgDiv.style.display = 'block';
  setTimeout(() => { msgDiv.style.display = 'none'; }, 1800);
}

function handleAddToCart(product) {
  // Check if already in cart
  const existing = cart.find(item => item.title === product.title && item.category === product.category);
  if (existing) {
    showMessage('Already added to cart!');
    return;
  }
  cart.push({ ...product, qty: product.minOrder });
  saveCart();
  document.getElementById('cart-count').textContent = cart.length;
  showMessage('Added to cart!');
}

// --- CATEGORY DROPDOWN (STATIC) ---
function renderCategoryDropdown() {
  const sel = document.getElementById('category-filter');
  const current = sel.value;
  const categories = Array.from(new Set(getProducts().map(p => p.category)));
  sel.innerHTML = '<option value="all">All</option>' + categories.map(c => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join('');
  sel.value = current || 'all';
}

// --- FLIPKART-LIKE CATEGORY BAR ---
function renderCategoryBar() {
  const categoryImages = {
    helmets: 'https://img.icons8.com/color/96/000000/hard-hat.png',
    gloves: 'https://img.icons8.com/color/96/000000/medical-gloves.png',
    ppe: 'https://img.icons8.com/color/96/000000/safety-vest.png',
    bag: 'https://img.icons8.com/color/96/000000/safety-boots.png',
    safety: 'https://img.icons8.com/color/96/000000/fire-extinguisher.png',
  };
  const categories = Array.from(new Set(getProducts().map(p => p.category)));
  const bar = document.getElementById('category-bar') || document.createElement('div');
  bar.id = 'category-bar';
  bar.style.display = 'flex';
  bar.style.gap = '2rem';
  bar.style.justifyContent = 'center';
  bar.style.margin = '1.2rem 0 2rem 0';
  bar.style.overflowX = 'auto';
  bar.style.padding = '0.5rem 0';
  bar.innerHTML = `
    <button class="cat-btn" data-cat="all" style="background:none;border:none;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <img src="https://img.icons8.com/color/48/000000/shopping-cart-loaded.png" alt="All" style="width:40px;height:40px;margin-bottom:0.3rem;">
      <span style="font-size:1rem;font-weight:600;">All</span>
    </button>
    ` +
    categories.map(c => {
      let img = categoryImages[c];
      if (!img) {
        const prod = getProducts().find(p => p.category === c);
        img = prod ? prod.img : 'https://img.icons8.com/color/48/000000/box.png';
      }
      return `<button class="cat-btn" data-cat="${c}" style="background:none;border:none;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <img src="${img}" alt="${c}" style="width:40px;height:40px;margin-bottom:0.3rem;">
        <span style="font-size:1rem;font-weight:600;">${c.charAt(0).toUpperCase() + c.slice(1)}</span>
      </button>`;
    }).join('');
  const main = document.getElementById('main-content');
  main.insertBefore(bar, document.getElementById('products'));
  bar.querySelectorAll('.cat-btn').forEach(btn => {
    btn.onclick = function() {
      document.getElementById('category-filter').value = this.dataset.cat;
      renderProducts();
      bar.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    };
  });
}
document.addEventListener('DOMContentLoaded', renderCategoryBar);

// Event listeners for filters
document.getElementById('category-filter').addEventListener('change', renderProducts);
document.getElementById('min-order').addEventListener('input', renderProducts);
document.querySelector('.logo').addEventListener('click', function() {
  window.location.reload();
});