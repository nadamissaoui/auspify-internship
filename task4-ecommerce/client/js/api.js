const API_BASE = `${window.location.origin}/api`;

const api = {
  get token() {
    return localStorage.getItem("shop_token");
  },

  async request(path, options = {}) {
    const headers = { "Content-Type": "application/json" };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const response = await fetch(`${API_BASE}${path}`, { headers, ...options });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }

    return data;
  },

  // Auth
  register: (p) => api.request("/auth/register", { method: "POST", body: JSON.stringify(p) }),
  login: (p) => api.request("/auth/login", { method: "POST", body: JSON.stringify(p) }),
  me: () => api.request("/auth/me"),

  // Products
  getProducts: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return api.request(`/products${q ? `?${q}` : ""}`);
  },
  getCategories: () => api.request("/products/categories"),
  createProduct: (p) => api.request("/products", { method: "POST", body: JSON.stringify(p) }),
  updateProduct: (id, p) => api.request(`/products/${id}`, { method: "PUT", body: JSON.stringify(p) }),
  deleteProduct: (id) => api.request(`/products/${id}`, { method: "DELETE" }),

  // Cart
  getCart: () => api.request("/shop/cart"),
  addToCart: (productId, quantity = 1) =>
    api.request("/shop/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (productId, quantity) =>
    api.request(`/shop/cart/${productId}`, { method: "PUT", body: JSON.stringify({ quantity }) }),
  removeCartItem: (productId) => api.request(`/shop/cart/${productId}`, { method: "DELETE" }),
  clearCart: () => api.request("/shop/cart", { method: "DELETE" }),

  // Orders
  checkout: (payload) => api.request("/shop/checkout", { method: "POST", body: JSON.stringify(payload) }),
  getMyOrders: () => api.request("/shop/orders"),

  // Admin
  getAdminStats: () => api.request("/shop/admin/stats"),
  getAdminOrders: () => api.request("/shop/admin/orders"),
  updateOrderStatus: (id, status) =>
    api.request(`/shop/admin/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
};
