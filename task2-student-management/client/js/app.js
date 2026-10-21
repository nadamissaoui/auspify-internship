const state = {
  students: [],
  editingId: null,
  deletingId: null,
};

const els = {
  table: document.getElementById("studentsTable"),
  emptyState: document.getElementById("emptyState"),
  searchInput: document.getElementById("searchInput"),
  courseFilter: document.getElementById("courseFilter"),
  sortSelect: document.getElementById("sortSelect"),
  courseList: document.getElementById("courseList"),
  statTotal: document.getElementById("statTotal"),
  statAverage: document.getElementById("statAverage"),
  statCourses: document.getElementById("statCourses"),
  statusDot: document.getElementById("statusDot"),
  statusText: document.getElementById("statusText"),
  formModal: document.getElementById("formModal"),
  confirmModal: document.getElementById("confirmModal"),
  modalTitle: document.getElementById("modalTitle"),
  form: document.getElementById("studentForm"),
  confirmText: document.getElementById("confirmText"),
  toastContainer: document.getElementById("toastContainer"),
};

function toast(message, type = "success") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  els.toastContainer.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(30px)";
    el.style.transition = "all 0.3s";
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

function gradeClass(grade) {
  if (grade >= 75) return "badge-grade-good";
  if (grade >= 50) return "badge-grade-mid";
  return "badge-grade-low";
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function renderStudents() {
  if (!state.students.length) {
    els.table.innerHTML = "";
    els.emptyState.style.display = "block";
    return;
  }

  els.emptyState.style.display = "none";
  els.table.innerHTML = state.students
    .map(
      (s) => `
      <tr>
        <td>
          <div class="student-name">${escapeHtml(s.firstName)} ${escapeHtml(s.lastName)}</div>
          <div class="student-email">${escapeHtml(s.email)}</div>
        </td>
        <td><span class="badge badge-course">${escapeHtml(s.course)}</span></td>
        <td>Année ${escapeHtml(String(s.year))}</td>
        <td><span class="badge ${gradeClass(s.grade)}">${Number(s.grade).toFixed(1)}</span></td>
        <td>${escapeHtml(s.phone) || "—"}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" data-edit="${s._id}">Modifier</button>
            <button class="btn btn-danger btn-sm" data-delete="${s._id}">Supprimer</button>
          </div>
        </td>
      </tr>`
    )
    .join("");
}

function updateCourseOptions() {
  const courses = [...new Set(state.students.map((s) => s.course))].sort();

  const current = els.courseFilter.value;
  els.courseFilter.innerHTML =
    `<option value="">Toutes les filières</option>` +
    courses.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  els.courseFilter.value = courses.includes(current) ? current : "";

  els.courseList.innerHTML = courses
    .map((c) => `<option value="${escapeHtml(c)}"></option>`)
    .join("");
}

async function loadStudents() {
  try {
    const params = {
      search: els.searchInput.value.trim(),
      course: els.courseFilter.value,
      sort: els.sortSelect.value,
    };
    const { data } = await api.getStudents(params);
    state.students = data;
    renderStudents();
    updateCourseOptions();
  } catch (error) {
    toast(error.message, "error");
  }
}

async function loadStats() {
  try {
    const stats = await api.getStats();
    els.statTotal.textContent = stats.total;
    els.statAverage.textContent = stats.averageGrade;
    els.statCourses.textContent = stats.byCourse.length;
  } catch (error) {
    toast(error.message, "error");
  }
}

async function checkHealth() {
  try {
    await api.health();
    els.statusDot.className = "status-dot online";
    els.statusText.textContent = "Serveur connecté";
  } catch (error) {
    els.statusDot.className = "status-dot offline";
    els.statusText.textContent = "Serveur indisponible";
  }
}

function openFormModal(student = null) {
  state.editingId = student ? student._id : null;
  els.modalTitle.textContent = student ? "Modifier l'étudiant" : "Ajouter un étudiant";
  els.form.reset();
  els.form
    .querySelectorAll(".form-group.invalid")
    .forEach((g) => g.classList.remove("invalid"));

  if (student) {
    document.getElementById("firstName").value = student.firstName || "";
    document.getElementById("lastName").value = student.lastName || "";
    document.getElementById("email").value = student.email || "";
    document.getElementById("phone").value = student.phone || "";
    document.getElementById("gender").value = student.gender || "Other";
    document.getElementById("course").value = student.course || "";
    document.getElementById("year").value = student.year || 1;
    document.getElementById("grade").value = student.grade ?? 0;
    document.getElementById("address").value = student.address || "";
    if (student.dateOfBirth) {
      document.getElementById("dateOfBirth").value = student.dateOfBirth.slice(0, 10);
    }
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

  check("firstName", (v) => v.trim().length >= 2);
  check("lastName", (v) => v.trim().length >= 2);
  check("email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
  check("course", (v) => v.trim().length >= 2);
  check("grade", (v) => v === "" || (Number(v) >= 0 && Number(v) <= 100));

  return valid;
}

function collectForm() {
  const payload = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    gender: document.getElementById("gender").value,
    course: document.getElementById("course").value.trim(),
    year: Number(document.getElementById("year").value),
    grade: Number(document.getElementById("grade").value) || 0,
    address: document.getElementById("address").value.trim(),
  };

  const dob = document.getElementById("dateOfBirth").value;
  if (dob) payload.dateOfBirth = dob;

  return payload;
}

async function saveStudent(event) {
  event.preventDefault();
  if (!validateForm()) return;

  const payload = collectForm();

  try {
    if (state.editingId) {
      await api.updateStudent(state.editingId, payload);
      toast("Étudiant mis à jour avec succès");
    } else {
      await api.createStudent(payload);
      toast("Étudiant ajouté avec succès");
    }
    closeFormModal();
    await Promise.all([loadStudents(), loadStats()]);
  } catch (error) {
    toast(error.message, "error");
  }
}

function openConfirmModal(id) {
  state.deletingId = id;
  const student = state.students.find((s) => s._id === id);
  els.confirmText.textContent = student
    ? `Voulez-vous vraiment supprimer ${student.firstName} ${student.lastName} ?`
    : "Voulez-vous vraiment supprimer cet étudiant ?";
  els.confirmModal.classList.add("open");
}

function closeConfirmModal() {
  els.confirmModal.classList.remove("open");
  state.deletingId = null;
}

async function deleteStudent() {
  if (!state.deletingId) return;
  try {
    await api.deleteStudent(state.deletingId);
    toast("Étudiant supprimé avec succès");
    closeConfirmModal();
    await Promise.all([loadStudents(), loadStats()]);
  } catch (error) {
    toast(error.message, "error");
  }
}

let searchTimer;
function debouncedSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadStudents, 350);
}

// Events
document.getElementById("addBtn").addEventListener("click", () => openFormModal());
document.getElementById("closeModal").addEventListener("click", closeFormModal);
document.getElementById("cancelBtn").addEventListener("click", closeFormModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeFormModal();
    closeConfirmModal();
  }
});

els.formModal.addEventListener("click", (e) => {
  if (e.target === els.formModal) closeFormModal();
});
els.confirmModal.addEventListener("click", (e) => {
  if (e.target === els.confirmModal) closeConfirmModal();
});

els.form.addEventListener("submit", saveStudent);
els.searchInput.addEventListener("input", debouncedSearch);
els.courseFilter.addEventListener("change", loadStudents);
els.sortSelect.addEventListener("change", loadStudents);

els.table.addEventListener("click", (e) => {
  const editId = e.target.dataset.edit;
  const deleteId = e.target.dataset.delete;
  if (editId) {
    const student = state.students.find((s) => s._id === editId);
    if (student) openFormModal(student);
  }
  if (deleteId) openConfirmModal(deleteId);
});

document.getElementById("cancelDelete").addEventListener("click", closeConfirmModal);
document.getElementById("confirmDelete").addEventListener("click", deleteStudent);

// Init
(async function init() {
  await checkHealth();
  await Promise.all([loadStudents(), loadStats()]);
})();
