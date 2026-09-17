const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const menuLinks = mobileMenu?.querySelectorAll("a") ?? [];
const navigationLinks = document.querySelectorAll(".desktop-nav a");
const accordionButtons = document.querySelectorAll("[data-accordion] button");
const estimateForm = document.querySelector("[data-estimate-form]");
const formStatus = document.querySelector("[data-form-status]");
const year = document.querySelector("[data-year]");

const closeMenu = () => {
  if (!menuToggle || !mobileMenu || !header) return;

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  mobileMenu.classList.remove("open");
  header.classList.remove("menu-active");
  document.body.classList.remove("menu-open");
};

const toggleMenu = () => {
  if (!menuToggle || !mobileMenu || !header) return;

  const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(willOpen));
  menuToggle.setAttribute("aria-label", willOpen ? "Close navigation menu" : "Open navigation menu");
  mobileMenu.classList.toggle("open", willOpen);
  header.classList.toggle("menu-active", willOpen);
  document.body.classList.toggle("menu-open", willOpen);
};

menuToggle?.addEventListener("click", toggleMenu);
menuLinks.forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener(
  "scroll",
  () => {
    header?.classList.toggle("scrolled", window.scrollY > 24);
  },
  { passive: true },
);

const observedSections = [...navigationLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

    if (!visibleEntry) return;

    navigationLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${visibleEntry.target.id}`;
      link.classList.toggle("active", isActive);
    });
  },
  {
    rootMargin: "-25% 0px -60% 0px",
    threshold: [0.05, 0.25, 0.5],
  },
);

observedSections.forEach((section) => sectionObserver.observe(section));

accordionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    const answer = button.closest(".faq-item")?.querySelector(".faq-answer");

    accordionButtons.forEach((otherButton) => {
      const otherAnswer = otherButton.closest(".faq-item")?.querySelector(".faq-answer");
      otherButton.setAttribute("aria-expanded", "false");
      if (otherAnswer) otherAnswer.hidden = true;
    });

    if (!expanded) {
      button.setAttribute("aria-expanded", "true");
      if (answer) answer.hidden = false;
    }
  });
});

const revealElements = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

estimateForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!estimateForm.checkValidity()) {
    estimateForm.reportValidity();
    return;
  }

  if (formStatus) {
    formStatus.textContent =
      "Form preview complete. Connect this form to the client’s preferred lead system before launch.";
  }
});

if (year) {
  year.textContent = String(new Date().getFullYear());
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 1180) closeMenu();
});
