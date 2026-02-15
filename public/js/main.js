// Header shrink + hide topbar on scroll
(() => {
  const header = document.getElementById("siteHeader");
  const topbar = document.getElementById("topbar");
  if (!header) return;

  const onScroll = () => {
    const y = window.scrollY || 0;

    if (y > 20) {
      header.classList.add("is-scrolled");
      if (topbar) topbar.classList.add("is-hidden");
    } else {
      header.classList.remove("is-scrolled");
      if (topbar) topbar.classList.remove("is-hidden");
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// Reveal on scroll (stagger via data-delay)
(() => {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const delay = parseInt(el.getAttribute("data-delay") || "0", 10);
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add("is-inview");
      io.unobserve(el);
    });
  }, { threshold: 0.12 });

  items.forEach(el => io.observe(el));
})();


// Enable JS styles
document.documentElement.classList.add("js");

// Reveal on scroll (supports .reveal and .reveal-right)
(() => {
  const items = Array.from(document.querySelectorAll(".reveal, .reveal-right"));
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const delay = parseInt(el.getAttribute("data-delay") || "0", 10);

      setTimeout(() => el.classList.add("is-inview"), delay);
      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  items.forEach(el => io.observe(el));
})();
document.addEventListener("DOMContentLoaded", function () {
  const reveals = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach((el) => observer.observe(el));
});
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".reveal");

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.12 }
  );

  cards.forEach((c) => io.observe(c));
});
