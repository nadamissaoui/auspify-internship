const state = {
  user: null,
  products: [],
  cart: { items: [], total: 0, count: 0 },
  categories: [],
  activeCategory: "",
  currentScreen: "shop",
  adminOrders: [],
  adminStats: null,
};

const els = {
  searchInput: document.getElementById("searchInput"),
  cartBtn: document.getElementById("cartBtn"),
  cartCount: document.getElementById("cartCount"),
  userMenuBtn: document.getElementById("userMenuBtn"),
  userAvatar: document.getElementById("userAvatar"),
  userLabel: document.getElementById("userLabel"),
  userDropdown: document.getElementById("userDropdown"),
  productsGrid: document.getElementById("productsGrid"),
  productsCount: document.getElementById("productsCount"),
  categoryList: document.getElementById("categoryList"),
  sortSelect: document.getElementById("sortSelect"),
  minPrice: document.getElementById("minPrice"),
  maxPrice: document.getElementById("maxPrice"),
  resetFilters: document.getElementById("resetFilters"),
  screens: {
    shop: document.getElementById("shopScreen"),
    orders: document.getElementById("ordersScreen"),
    admin: document.getElementById("adminScreen"),
  },
  ordersList: document.getElementById("ordersList"),
  drawerOverlay: document.getElementById("drawerOverlay"),
  cartDrawer: document.getElementById("cartDrawer"),
  cartBody: document.getElementById("cartBody"),
  cartTotal: document.getElementById("cartTotal"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  checkoutModal: document.getElementById("checkoutModal"),
  checkoutForm: document.getElementById("checkoutForm"),
  checkoutSummary: document.getElementById("checkoutSummary"),
  authModal: document.getElementById("authModal"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  authTitle: document.getElementById("authTitle"),
  productModal: document.getElementById("productModal"),
  productForm: document.getElementById("productForm"),
  productModalTitle: document.getElementById("productModalTitle"),
  adminOrdersTable: document.getElementById("adminOrdersTable"),
  adminProductsTable: document.getElementById("adminProductsTable"),
  adminProductsCount: document.getElementById("adminProductsCount"),
  admRevenue: document.getElementById("admRevenue"),
  admOrders: document.getElementById("admOrders"),
  admProducts: document.getElementById("admProducts"),
  admUsers: document.getElementById("admUsers"),
  toastContainer: document.getElementById("toastContainer"),
};

const money = (v) =>
  new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND" }).format(v || 0);

const escapeHtml = (v) => {
  const d = document.createElement("div");
  d.textContent = v ?? "";
  return d.innerHTML;
};

const iconForCategory = (cat) => {
  const map = {
    Informatique: "&#128187;",
    Audio: "&#127911;",
    "Téléphonie": "&#128241;",
    Accessoires: "&#128295;",
    Wearables: "&#8986;",
    "Création": "&#127912;",
  };
  return map[cat] || "&#128230;";
};

function toast(message, type = "success") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  els.toastContainer.appendChild(el);
  setTimeout(() => {
    el.style.transition = "all 0.3s";
    el.style.opacity = "0";
    el.style.transform = "translateX(30px)";
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

/* ---------- Auth ---------- */
function openAuthModal() {
  const isLogged = !!state.user;
  if (isLogged) return;
  els.authModal.classList.add("open");
}

function closeAuthModal() {
  els.authModal.classList.remove("open");
}

function setUser(user) {
  state.user = user;
  if (user) {
    localStorage.setItem("shop_user", JSON.stringify(user));
    const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    els.userAvatar.textContent = initials;
    els.userLabel.textContent = user.name.split(" ")[0];
  } else {
    localStorage.removeItem("shop_user");
    els.userAvatar.innerHTML = "&#128100;";
    els.userLabel.textContent = "Connexion";
  }
  renderUserDropdown();
}

function renderUserDropdown() {
  if (!state.user) {
    els.userDropdown.innerHTML = `<button id="ddLogin">Connexion / Inscription</button>`;
  } else {
    els.userDropdown.innerHTML = `
      <button id="ddOrders">Mes commandes</button>
      ${state.user.role === "admin" ? `<button id="ddAdmin">Tableau de bord Admin</button>` : ""}
      <button id="ddLogout" style="color:#fda4af">Déconnexion</button>`;
  }
}

/* ---------- Screens ---------- */
function showScreen(name) {
  state.currentScreen = name;
  Object.entries(els.screens).forEach(([key, el]) => el.classList.toggle("active", key === name));
  els.userDropdown.classList.remove("open");

  if (name === "orders") loadMyOrders();
  if (name === "admin") loadAdmin();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Products ---------- */
async function loadProducts() {
  try {
    const params = {
      search: els.searchInput.value.trim(),
      category: state.activeCategory,
      minPrice: els.minPrice.value,
      maxPrice: els.maxPrice.value,
      sort: els.sortSelect.value,
    };
    const { data } = await api.getProducts(params);
    state.products = data;
    renderProducts();
  } catch (error) {
    toast(error.message, "error");
  }
}

function renderProducts() {
  els.productsCount.textContent = `${state.products.length} produit${state.products.length > 1 ? "s" : ""}`;
  if (!state.products.length) {
    els.productsGrid.innerHTML = `<div class="empty-state"><div class="big">&#128533;</div><p>Aucun produit trouvé.</p></div>`;
    return;
  }
  els.productsGrid.innerHTML = state.products
    .map(
      (p) => `
      <article class="product-card">
        <div class="product-thumb">
          ${p.featured ? `<span class="featured-tag">Populaire</span>` : ""}
          ${iconForCategory(p.category)}
        </div>
        <div class="product-body">
          <span class="product-cat">${escapeHtml(p.category)}</span>
          <h3>${escapeHtml(p.name)}</h3>
          <p class="desc">${escapeHtml(p.description)}</p>
          <div class="rating">&#9733; ${Number(p.rating).toFixed(1)}</div>
          <div class="product-footer">
            <span class="price">${money(p.price)}</span>
            <div style="text-align:right">
              <div class="stock-info ${p.stock === 0 ? "out" : ""}">${p.stock === 0 ? "Rupture" : `${p.stock} en stock`}</div>
              <button class="btn btn-primary btn-sm add-btn" data-id="${p._id}" ${p.stock === 0 ? "disabled" : ""} style="margin-top:0.35rem">Ajouter</button>
            </div>
          </div>
        </div>
      </article>`
    )
    .join("");
}

function renderCategories() {
  const all = `<div class="category-radio ${state.activeCategory === "" ? "active" : ""}" data-cat="">Toutes (${state.products.length})</div>`;
  const items = state.categories
    .map(
      (c) =>
        `<div class="category-radio ${state.activeCategory === c ? "active" : ""}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</div>`
    )
    .join("");
  els.categoryList.innerHTML = all + items;
}

async function loadCategories() {
  try {
    const { data } = await api.getCategories();
    state.categories = data;
    renderCategories();
  } catch (error) {
    /* silent */
  }
}

/* ---------- Cart ---------- */
async function loadCart() {
  if (!state.user) {
    state.cart = { items: [], total: 0, count: 0 };
    renderCart();
    return;
  }
  try {
    state.cart = await api.getCart();
    renderCart();
  } catch (error) {
    /* silent */
  }
}

function renderCart() {
  els.cartCount.textContent = state.cart.count || 0;
  els.cartTotal.textContent = money(state.cart.total);

  if (!state.cart.items.length) {
    els.cartBody.innerHTML = `<div class="empty-state"><div class="big">&#128722;</div><p>Votre panier est vide.</p></div>`;
    els.checkoutBtn.disabled = true;
    return;
  }

  els.checkoutBtn.disabled = false;
  els.cartBody.innerHTML = state.cart.items
    .map(
      (item) => `
      <div class="cart-item">
        <div class="cart-item-thumb">${iconForCategory("")}</div>
        <div class="cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>
          <div class="item-price">${money(item.price)}</div>
          <div class="qty-control">
            <button data-dec="${item.product}">&minus;</button>
            <span>${item.quantity}</span>
            <button data-inc="${item.product}">&plus;</button>
          </div>
        </div>
        <div style="text-align:right">
          <div class="item-price">${money(item.subtotal)}</div>
          <button class="remove" data-remove="${item.product}">Retirer</button>
        </div>
      </div>`
    )
    .join("");
}

async function addToCart(productId) {
  if (!state.user) {
    openAuthModal();
    return;
  }
  try {
    const res = await api.addToCart(productId, 1);
    state.cart = res.cart;
    renderCart();
    toast("Produit ajouté au panier");
  } catch (error) {
    toast(error.message, "error");
  }
}

/* ---------- Checkout ---------- */
function openCheckout() {
  if (!state.user) return openAuthModal();
  if (!state.cart.items.length) return toast("Panier vide", "error");

  els.checkoutSummary.innerHTML =
    state.cart.items
      .map((i) => `<li><span>${escapeHtml(i.name)} × ${i.quantity}</span><span>${money(i.subtotal)}</span></li>`)
      .join("") +
    `<li><span>Livraison</span><span>${state.cart.total > 500 ? "Gratuite" : money(15)}</span></li>` +
    `<li class="total"><span>Total</span><span>${money(state.cart.total + (state.cart.total > 500 ? 0 : 15))}</span></li>`;

  if (state.user) document.getElementById("shipName").value = state.user.name;
  els.checkoutModal.classList.add("open");
}

async function submitCheckout(e) {
  e.preventDefault();
  const fields = ["shipName", "shipAddress", "shipCity", "shipPhone"];
  let valid = true;
  fields.forEach((id) => {
    const input = document.getElementById(id);
    const group = input.closest(".form-group");
    const ok = input.value.trim().length >= 2;
    group.classList.toggle("invalid", !ok);
    if (!ok) valid = false;
  });
  if (!valid) return;

  try {
    const res = await api.checkout({
      shipping: {
        fullName: document.getElementById("shipName").value.trim(),
        address: document.getElementById("shipAddress").value.trim(),
        city: document.getElementById("shipCity").value.trim(),
        postalCode: document.getElementById("shipPostal").value.trim(),
        phone: document.getElementById("shipPhone").value.trim(),
      },
      paymentMethod: document.getElementById("paymentMethod").value,
    });
    toast("Commande passée avec succès !");
    els.checkoutModal.classList.remove("open");
    els.checkoutForm.reset();
    closeDrawer();
    state.cart = { items: [], total: 0, count: 0 };
    renderCart();
    await loadProducts();
    showScreen("orders");
  } catch (error) {
    toast(error.message, "error");
  }
}

/* ---------- Orders ---------- */
async function loadMyOrders() {
  if (!state.user) {
    els.ordersList.innerHTML = `<div class="empty-state"><div class="big">&#128274;</div><p>Connectez-vous pour voir vos commandes.</p><button class="btn btn-primary" onclick="document.getElementById('userMenuBtn').click()">Se connecter</button></div>`;
    return;
  }
  try {
    const { data } = await api.getMyOrders();
    if (!data.length) {
      els.ordersList.innerHTML = `<div class="empty-state"><div class="big">&#128230;</div><p>Aucune commande pour le moment.</p></div>`;
      return;
    }
    els.ordersList.innerHTML = data
      .map(
        (o) => `
        <div class="order-card">
          <div class="order-head">
            <div>
              <div class="order-id">Commande #${o._id.slice(-8).toUpperCase()}</div>
              <div style="font-size:0.82rem;color:var(--muted)">${new Date(o.createdAt).toLocaleString("fr-FR")}</div>
            </div>
            <span class="status-badge status-${o.status}">${o.status}</span>
          </div>
          <ul class="order-items">
            ${o.items.map((i) => `<li><span>${escapeHtml(i.name)} × ${i.quantity}</span><span>${money(i.price * i.quantity)}</span></li>`).join("")}
            <li><span>Livraison</span><span>${o.shippingFee ? money(o.shippingFee) : "Gratuite"}</span></li>
          </ul>
          <div class="order-total">${money(o.total)}</div>
        </div>`
      )
      .join("");
  } catch (error) {
    toast(error.message, "error");
  }
}

/* ---------- Admin ---------- */
async function loadAdmin() {
  if (!state.user || state.user.role !== "admin") {
    els.screens.admin.innerHTML = `<div class="empty-state"><div class="big">&#128274;</div><p>Accès réservé à l'administrateur.</p></div>`;
    return;
  }
  try {
    const [stats, orders] = await Promise.all([api.getAdminStats(), api.getAdminOrders()]);
    state.adminStats = stats;
    state.adminOrders = orders.data;
    els.admRevenue.textContent = money(stats.revenue);
    els.admOrders.textContent = stats.totalOrders;
    els.admProducts.textContent = stats.totalProducts;
    els.admUsers.textContent = stats.totalUsers;
    renderAdminOrders();
    renderAdminProducts();
  } catch (error) {
    toast(error.message, "error");
  }
}

function renderAdminOrders() {
  if (!state.adminOrders.length) {
    els.adminOrdersTable.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted)">Aucune commande</td></tr>`;
    return;
  }
  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  els.adminOrdersTable.innerHTML = state.adminOrders
    .map(
      (o) => `
      <tr>
        <td>${escapeHtml(o.user?.name || "—")}<br /><span style="color:var(--muted);font-size:0.78rem">${escapeHtml(o.user?.email || "")}</span></td>
        <td>${o.items.length}</td>
        <td>${money(o.total)}</td>
        <td>
          <select data-status="${o._id}" style="width:auto;padding:0.35rem 0.6rem;font-size:0.8rem">
            ${statuses.map((s) => `<option value="${s}" ${o.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
        <td>${new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
      </tr>`
    )
    .join("");
}

function renderAdminProducts() {
  els.adminProductsCount.textContent = `${state.products.length} produits`;
  els.adminProductsTable.innerHTML = state.products
    .map(
      (p) => `
      <tr>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.category)}</td>
        <td>${money(p.price)}</td>
        <td>${p.stock}</td>
        <td>
          <div style="display:flex;gap:0.4rem">
            <button class="btn btn-ghost btn-sm" data-edit-product="${p._id}">Modifier</button>
            <button class="btn btn-danger btn-sm" data-del-product="${p._id}">Suppr.</button>
          </div>
        </td>
      </tr>`
    )
    .join("");
}

function openProductModal(product = null) {
  els.productModalTitle.textContent = product ? "Modifier le produit" : "Nouveau produit";
  els.productForm.reset();
  document.getElementById("productId").value = product ? product._id : "";
  if (product) {
    document.getElementById("prodName").value = product.name;
    document.getElementById("prodDescription").value = product.description || "";
    document.getElementById("prodPrice").value = product.price;
    document.getElementById("prodStock").value = product.stock;
    document.getElementById("prodCategory").value = product.category;
    document.getElementById("prodRating").value = product.rating;
  }
  els.productModal.classList.add("open");
}

async function saveProduct(e) {
  e.preventDefault();
  const fields = ["prodName", "prodPrice", "prodCategory"];
  let valid = true;
  fields.forEach((id) => {
    const input = document.getElementById(id);
    const group = input.closest(".form-group");
    const ok = input.value.trim() !== "";
    group.classList.toggle("invalid", !ok);
    if (!ok) valid = false;
  });
  if (!valid) return;

  const payload = {
    name: document.getElementById("prodName").value.trim(),
    description: document.getElementById("prodDescription").value.trim(),
    price: Number(document.getElementById("prodPrice").value),
    stock: Number(document.getElementById("prodStock").value) || 0,
    category: document.getElementById("prodCategory").value.trim(),
    rating: Number(document.getElementById("prodRating").value) || 0,
  };

  const id = document.getElementById("productId").value;
  try {
    if (id) {
      await api.updateProduct(id, payload);
      toast("Produit mis à jour");
    } else {
      await api.createProduct(payload);
      toast("Produit créé");
    }
    els.productModal.classList.remove("open");
    await Promise.all([loadProducts(), loadCategories()]);
    renderAdminProducts();
  } catch (error) {
    toast(error.message, "error");
  }
}

/* ---------- Drawer ---------- */
function openDrawer() {
  els.drawerOverlay.classList.add("open");
  els.cartDrawer.classList.add("open");
}

function closeDrawer() {
  els.drawerOverlay.classList.remove("open");
  els.cartDrawer.classList.remove("open");
}

/* ---------- Events ---------- */
let searchTimer;
els.searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadProducts, 350);
});
els.sortSelect.addEventListener("change", loadProducts);
els.minPrice.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadProducts, 500);
});
els.maxPrice.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadProducts, 500);
});
els.resetFilters.addEventListener("click", () => {
  state.activeCategory = "";
  els.minPrice.value = "";
  els.maxPrice.value = "";
  els.searchInput.value = "";
  renderCategories();
  loadProducts();
});

els.categoryList.addEventListener("click", (e) => {
  const cat = e.target.dataset.cat;
  if (cat === undefined) return;
  state.activeCategory = cat;
  renderCategories();
  loadProducts();
});

els.productsGrid.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (id) addToCart(id);
});

els.cartBtn.addEventListener("click", openDrawer);
els.drawerOverlay.addEventListener("click", closeDrawer);
document.getElementById("closeDrawer").addEventListener("click", closeDrawer);

els.cartBody.addEventListener("click", async (e) => {
  const inc = e.target.dataset.inc;
  const dec = e.target.dataset.dec;
  const remove = e.target.dataset.remove;
  try {
    if (inc) {
      const item = state.cart.items.find((i) => i.product === inc);
      const res = await api.updateCartItem(inc, item.quantity + 1);
      state.cart = res.cart;
      renderCart();
    }
    if (dec) {
      const item = state.cart.items.find((i) => i.product === dec);
      if (item.quantity <= 1) {
        const res = await api.removeCartItem(dec);
        state.cart = res.cart;
      } else {
        const res = await api.updateCartItem(dec, item.quantity - 1);
        state.cart = res.cart;
      }
      renderCart();
    }
    if (remove) {
      const res = await api.removeCartItem(remove);
      state.cart = res.cart;
      renderCart();
    }
  } catch (error) {
    toast(error.message, "error");
  }
});

els.checkoutBtn.addEventListener("click", openCheckout);
document.getElementById("closeCheckoutModal").addEventListener("click", () => els.checkoutModal.classList.remove("open"));
document.getElementById("cancelCheckout").addEventListener("click", () => els.checkoutModal.classList.remove("open"));
els.checkoutForm.addEventListener("submit", submitCheckout);

els.userMenuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  els.userDropdown.classList.toggle("open");
});

els.userDropdown.addEventListener("click", (e) => {
  const id = e.target.id;
  if (id === "ddLogin") openAuthModal();
  if (id === "ddOrders") showScreen("orders");
  if (id === "ddAdmin") showScreen("admin");
  if (id === "ddLogout") {
    localStorage.removeItem("shop_token");
    setUser(null);
    state.cart = { items: [], total: 0, count: 0 };
    renderCart();
    showScreen("shop");
    toast("Déconnecté");
  }
  els.userDropdown.classList.remove("open");
});

document.addEventListener("click", () => els.userDropdown.classList.remove("open"));

// Auth modal
document.getElementById("closeAuthModal").addEventListener("click", closeAuthModal);
document.getElementById("tabLogin").addEventListener("click", () => {
  document.getElementById("tabLogin").classList.add("active");
  document.getElementById("tabRegister").classList.remove("active");
  els.authTitle.dataset.tab = "login";
  els.loginForm.style.display = "block";
  els.registerForm.style.display = "none";
  els.authTitle.textContent = "Connexion";
});
document.getElementById("tabRegister").addEventListener("click", () => {
  document.getElementById("tabRegister").classList.add("active");
  document.getElementById("tabLogin").classList.remove("active");
  els.loginForm.style.display = "none";
  els.registerForm.style.display = "block";
  els.authTitle.textContent = "Inscription";
});

els.loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const res = await api.login({
      email: document.getElementById("loginEmail").value.trim(),
      password: document.getElementById("loginPassword").value,
    });
    localStorage.setItem("shop_token", res.token);
    setUser(res.user);
    closeAuthModal();
    els.loginForm.reset();
    toast(`Bienvenue ${res.user.name}`);
    await loadCart();
    showScreen("shop");
  } catch (error) {
    toast(error.message, "error");
  }
});

els.registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const res = await api.register({
      name: document.getElementById("registerName").value.trim(),
      email: document.getElementById("registerEmail").value.trim(),
      password: document.getElementById("registerPassword").value,
    });
    localStorage.setItem("shop_token", res.token);
    setUser(res.user);
    closeAuthModal();
    els.registerForm.reset();
    toast("Compte créé avec succès");
    await loadCart();
    showScreen("shop");
  } catch (error) {
    toast(error.message, "error");
  }
});

// Admin tabs + actions
document.querySelectorAll(".admin-tab[data-admin]").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab[data-admin]").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const isOrders = tab.dataset.admin === "orders";
    document.getElementById("adminOrdersPanel").style.display = isOrders ? "block" : "none";
    document.getElementById("adminProductsPanel").style.display = isOrders ? "none" : "block";
  });
});

els.adminOrdersTable.addEventListener("change", async (e) => {
  const id = e.target.dataset.status;
  if (!id) return;
  try {
    await api.updateOrderStatus(id, e.target.value);
    toast("Statut mis à jour");
  } catch (error) {
    toast(error.message, "error");
  }
});

document.getElementById("addProductBtn").addEventListener("click", () => openProductModal());
document.getElementById("closeProductModal").addEventListener("click", () => els.productModal.classList.remove("open"));
document.getElementById("cancelProduct").addEventListener("click", () => els.productModal.classList.remove("open"));
els.productForm.addEventListener("submit", saveProduct);

els.adminProductsTable.addEventListener("click", async (e) => {
  const editId = e.target.dataset.editProduct;
  const delId = e.target.dataset.delProduct;
  if (editId) {
    const p = state.products.find((x) => x._id === editId);
    if (p) openProductModal(p);
  }
  if (delId) {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await api.deleteProduct(delId);
      toast("Produit supprimé");
      await Promise.all([loadProducts(), loadCategories()]);
      renderAdminProducts();
    } catch (error) {
      toast(error.message, "error");
    }
  }
});

// Nav
document.querySelectorAll("[data-nav]").forEach((el) => {
  el.addEventListener("click", () => showScreen(el.dataset.nav));
});

// Init
(async function init() {
  const token = api.token;
  const storedUser = localStorage.getItem("shop_user");
  if (token && storedUser) {
    try {
      const res = await api.me();
      setUser(res.user);
    } catch (error) {
      localStorage.removeItem("shop_token");
      setUser(null);
    }
  } else {
    renderUserDropdown();
  }
  await Promise.all([loadProducts(), loadCategories(), loadCart()]);
})();
