const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    menuToggle.setAttribute(
      "aria-expanded",
      navLinks.classList.contains("open") ? "true" : "false"
    );
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("visible"));
}

const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll("#projectsGrid .project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.dataset.filter;

    projectCards.forEach((card) => {
      const categories = (card.dataset.category || "").split(" ");
      const matches = filter === "all" || categories.includes(filter);
      card.style.display = matches ? "flex" : "none";
    });
  });
});

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    const fields = [
      { id: "name", validate: (v) => v.trim().length >= 2 },
      { id: "email", validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
      { id: "message", validate: (v) => v.trim().length >= 10 },
    ];

    fields.forEach(({ id, validate }) => {
      const input = document.getElementById(id);
      const group = input.closest(".form-group");
      if (!validate(input.value)) {
        group.classList.add("invalid");
        valid = false;
      } else {
        group.classList.remove("invalid");
      }
    });

    if (valid) {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const subject = document.getElementById("subject").value.trim();
      const message = document.getElementById("message").value.trim();

      const mailSubject = encodeURIComponent(
        subject || `Message de ${name} via le portfolio`
      );
      const mailBody = encodeURIComponent(
        `${message}\n\n---\nDe : ${name}\nEmail : ${email}`
      );

      document.getElementById("formSuccess").style.display = "block";
      contactForm.reset();
      window.location.href = `mailto:nada.missaoui@esprit.tn?subject=${mailSubject}&body=${mailBody}`;

      setTimeout(() => {
        document.getElementById("formSuccess").style.display = "none";
      }, 6000);
    }
  });
}
