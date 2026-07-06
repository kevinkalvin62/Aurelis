const observedElements = document.querySelectorAll(".reveal-on-scroll");

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  },
  { threshold: 0.28 },
);

for (const element of observedElements) observer.observe(element);
