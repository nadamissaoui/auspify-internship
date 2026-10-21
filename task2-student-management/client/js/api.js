const API_BASE =
  window.location.protocol === "file:"
    ? "http://localhost:5000/api"
    : `${window.location.origin}/api`;

const api = {
  async request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
  },

  getStudents(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v)
    ).toString();
    return this.request(`/students${query ? `?${query}` : ""}`);
  },

  getStats() {
    return this.request("/students/stats");
  },

  createStudent(payload) {
    return this.request("/students", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateStudent(id, payload) {
    return this.request(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteStudent(id) {
    return this.request(`/students/${id}`, { method: "DELETE" });
  },

  health() {
    return this.request("/health");
  },
};
