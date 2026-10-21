const API_BASE = `${window.location.origin}/api`;

const api = {
  get token() {
    return localStorage.getItem("et_token");
  },

  async request(path, options = {}) {
    const headers = { "Content-Type": "application/json" };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const response = await fetch(`${API_BASE}${path}`, { headers, ...options });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401 && !path.includes("/auth")) {
      localStorage.removeItem("et_token");
      localStorage.removeItem("et_user");
      window.location.reload();
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
  },

  register(payload) {
    return this.request("/auth/register", { method: "POST", body: JSON.stringify(payload) });
  },

  login(payload) {
    return this.request("/auth/login", { method: "POST", body: JSON.stringify(payload) });
  },

  getTransactions(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v)
    ).toString();
    return this.request(`/transactions${query ? `?${query}` : ""}`);
  },

  getSummary() {
    return this.request("/transactions/summary");
  },

  createTransaction(payload) {
    return this.request("/transactions", { method: "POST", body: JSON.stringify(payload) });
  },

  updateTransaction(id, payload) {
    return this.request(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },

  deleteTransaction(id) {
    return this.request(`/transactions/${id}`, { method: "DELETE" });
  },
};
