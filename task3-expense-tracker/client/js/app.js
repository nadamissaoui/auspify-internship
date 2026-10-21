const state = {
  user: null,
  transactions: [],
  summary: null,
  editingId: null,
};

const CATEGORY_COLORS = [
  "#22d3ee", "#8b5cf6", "#22c55e", "#f59e0b", "#f43f5e",
  "#0ea5e9", "#a855f7", "#14b8a6", "#eab308", "#ec4899",
];

const els = {
  authScreen: document.getElementById("authScreen"),
  appScreen: document.getElementById("appScreen"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  authMessage: document.getElementById("authMessage"),
  userName: document.getElementById("userName"),
  userAvatar: document.getElementById("userAvatar"),
  sumIncome: document.getElementById("sumIncome"),
  sumExpense: document.getElementById("sumExpense"),
  sumBalance: document.getElementById("sumBalance"),
  sumCount: document.getElementById("sumCount"),
  txTable: document.getElementById("txTable"),
  emptyState: document.getElementById("emptyState"),
  categoryList: document.getElementById("categoryList"),
  categoryFilter: document.getElementById("categoryFilter"),
  categoryOptions: document.getElementById("categoryOptions"),
  typeFilter: document.getElementById("typeFilter"),
  searchInput: document.getElementById("searchInput"),
  formModal: document.getElementById("formModal"),
  modalTitle: document.getElementById("modalTitle"),
  txForm: document.getElementById("txForm"),
  txType: document.getElementById("txType"),
  toastContainer: document.getElementById("toastContainer"),
  monthlyChart: document.getElementById("monthlyChart"),
};

const formatMoney = (value) =>
  new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND" }).format(value || 0);

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

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function showAuthMessage(message, isError = true) {
  els.authMessage.textContent = message;
  els.authMessage.className = `auth-message${isError ? " error" : ""}`;
}

function setUser(user) {
  state.user = user;
  localStorage.setItem("et_user", JSON.stringify(user));
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  els.userName.textContent = user.name;
  els.userAvatar.textContent = initials;
}

function showApp() {
  els.authScreen.style.display = "none";
  els.appScreen.classList.add("active");
  renderChart();
}

function showAuth() {
  els.appScreen.classList.remove("active");
  els.authScreen.style.display = "flex";
}

async function loadSummary() {
  try {
    const summary = await api.getSummary();
    state.summary = summary;
    els.sumIncome.textContent = formatMoney(summary.income);
    els.sumExpense.textContent = formatMoney(summary.expense);
    els.sumBalance.textContent = formatMoney(summary.balance);
    els.sumCount.textContent = summary.transactionCount;
    renderCategories(summary.byCategory);
    if (window.drawMonthlyChart) window.drawMonthlyChart(els.monthlyChart, summary.monthly);
  } catch (error) {
    toast(error.message, "error");
  }
}

function renderCategories(byCategory) {
  if (!byCategory.length) {
    els.categoryList.innerHTML = `<li style="color:var(--muted);justify-content:center">Aucune dépense</li>`;
    return;
  }
  els.categoryList.innerHTML = byCategory
    .map(
      (c, i) => `
      <li>
        <span class="cat-name">
          <span class="cat-dot" style="background:${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}"></span>
          ${escapeHtml(c._id)}
        </span>
        <span class="cat-amount">${formatMoney(c.total)}</span>
      </li>`
    )
    .join("");
}

async function loadTransactions() {
  try {
    const params = {
      search: els.searchInput.value.trim(),
      type: els.typeFilter.value,
      category: els.categoryFilter.value,
    };
    const { data } = await api.getTransactions(params);
    state.transactions = data;
    renderTransactions();
    updateCategoryFilter();
  } catch (error) {
    toast(error.message, "error");
  }
}

function renderTransactions() {
  if (!state.transactions.length) {
    els.txTable.innerHTML = "";
    els.emptyState.style.display = "block";
    return;
  }
  els.emptyState.style.display = "none";
  els.txTable.innerHTML = state.transactions
    .map(
      (t) => `
      <tr>
        <td>${new Date(t.date).toLocaleDateString("fr-FR")}</td>
        <td><span class="type-badge ${t.type}">${t.type === "income" ? "Revenu" : "Dépense"}</span></td>
        <td>${escapeHtml(t.category)}</td>
        <td>${escapeHtml(t.description) || "—"}</td>
        <td class="amount-cell ${t.type}">${t.type === "income" ? "+" : "-"}${formatMoney(t.amount)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" data-edit="${t._id}">Modifier</button>
            <button class="btn btn-danger btn-sm" data-delete="${t._id}">Suppr.</button>
          </div>
        </td>
      </tr>`
    )
    .join("");
}

function updateCategoryFilter() {
  const categories = [...new Set(state.transactions.map((t) => t.category))].sort();
  const current = els.categoryFilter.value;
  els.categoryFilter.innerHTML =
    `<option value="">Toutes les catégories</option>` +
    categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  els.categoryFilter.value = categories.includes(current) ? current : "";

  els.categoryOptions.innerHTML = categories
    .map((c) => `<option value="${escapeHtml(c)}"></option>`)
    .join("");
}

function renderChart() {
  if (state.summary && window.drawMonthlyChart) {
    window.drawMonthlyChart(els.monthlyChart, state.summary.monthly);
  }
}

function openFormModal(transaction = null) {
  state.editingId = transaction ? transaction._id : null;
  els.modalTitle.textContent = transaction ? "Modifier la transaction" : "Ajouter une transaction";
  els.txForm.reset();

  const type = transaction ? transaction.type : "expense";
  els.txType.value = type;
  document.querySelectorAll(".type-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === type);
  });

  if (transaction) {
    document.getElementById("txAmount").value = transaction.amount;
    document.getElementById("txCategory").value = transaction.category;
    document.getElementById("txDescription").value = transaction.description || "";
    document.getElementById("txDate").value = new Date(transaction.date).toISOString().slice(0, 10);
  } else {
    document.getElementById("txDate").value = new Date().toISOString().slice(0, 10);
  }

  els.formModal.classList.add("open");
}

function closeFormModal() {
  els.formModal.classList.remove("open");
  state.editingId = null;
}

function validateForm() {
  let valid = true;
  const check = (id, condition) => {
    const input = document.getElementById(id);
    const group = input.closest(".form-group");
    if (!condition(input.value)) {
      group.classList.add("invalid");
      valid = false;
    } else {
      group.classList.remove("invalid");
    }
  };
  check("txAmount", (v) => Number(v) > 0);
  check("txCategory", (v) => v.trim().length >= 2);
  return valid;
}

async function saveTransaction(event) {
  event.preventDefault();
  if (!validateForm()) return;

  const payload = {
    type: els.txType.value,
    amount: Number(document.getElementById("txAmount").value),
    category: document.getElementById("txCategory").value.trim(),
    description: document.getElementById("txDescription").value.trim(),
    date: document.getElementById("txDate").value || undefined,
  };

  try {
    if (state.editingId) {
      await api.updateTransaction(state.editingId, payload);
      toast("Transaction mise à jour");
    } else {
      await api.createTransaction(payload);
      toast("Transaction ajoutée");
    }
    closeFormModal();
    await Promise.all([loadTransactions(), loadSummary()]);
  } catch (error) {
    toast(error.message, "error");
  }
}

async function deleteTransaction(id) {
  if (!confirm("Supprimer cette transaction ?")) return;
  try {
    await api.deleteTransaction(id);
    toast("Transaction supprimée");
    await Promise.all([loadTransactions(), loadSummary()]);
  } catch (error) {
    toast(error.message, "error");
  }
}

// Auth events
document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const isLogin = tab.dataset.tab === "login";
    els.loginForm.style.display = isLogin ? "block" : "none";
    els.registerForm.style.display = isLogin ? "none" : "block";
    els.authMessage.className = "auth-message";
  });
});

els.loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  try {
    const res = await api.login({ email, password });
    localStorage.setItem("et_token", res.token);
    setUser(res.user);
    showApp();
    await Promise.all([loadTransactions(), loadSummary()]);
    toast(`Bienvenue ${res.user.name}`);
  } catch (error) {
    showAuthMessage(error.message);
  }
});

els.registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  try {
    const res = await api.register({ name, email, password });
    localStorage.setItem("et_token", res.token);
    setUser(res.user);
    showApp();
    await Promise.all([loadTransactions(), loadSummary()]);
    toast("Compte créé avec succès");
  } catch (error) {
    showAuthMessage(error.message);
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("et_token");
  localStorage.removeItem("et_user");
  location.reload();
});

// App events
document.getElementById("addBtn").addEventListener("click", () => openFormModal());
document.getElementById("closeModal").addEventListener("click", closeFormModal);
document.getElementById("cancelBtn").addEventListener("click", closeFormModal);
els.formModal.addEventListener("click", (e) => {
  if (e.target === els.formModal) closeFormModal();
});
els.txForm.addEventListener("submit", saveTransaction);

document.querySelectorAll(".type-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".type-option").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    els.txType.value = btn.dataset.type;
  });
});

let searchTimer;
els.searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadTransactions, 350);
});
els.typeFilter.addEventListener("change", loadTransactions);
els.categoryFilter.addEventListener("change", loadTransactions);

els.txTable.addEventListener("click", (e) => {
  const editId = e.target.dataset.edit;
  const deleteId = e.target.dataset.delete;
  if (editId) {
    const tx = state.transactions.find((t) => t._id === editId);
    if (tx) openFormModal(tx);
  }
  if (deleteId) deleteTransaction(deleteId);
});

window.addEventListener("resize", () => {
  clearTimeout(window.__chartTimer);
  window.__chartTimer = setTimeout(renderChart, 200);
});

// Init
(async function init() {
  const token = api.token;
  const storedUser = localStorage.getItem("et_user");
  if (token && storedUser) {
    try {
      const res = await api.request("/auth/me");
      setUser(res.user);
      showApp();
      await Promise.all([loadTransactions(), loadSummary()]);
    } catch (error) {
      localStorage.removeItem("et_token");
      showAuth();
    }
  } else {
    showAuth();
  }
})();
