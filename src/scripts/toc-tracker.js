export function initTocTracker() {
  const tocLinks = document.querySelectorAll('.toc a');
  if (!tocLinks.length) return;

  const headings = [];
  tocLinks.forEach(link => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) {
      const el = document.getElementById(id);
      if (el) headings.push({ id, el, link });
    }
  });

  if (!headings.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          const match = headings.find(h => h.el === entry.target);
          if (match) match.link.classList.add('active');
        }
      });
    },
    { rootMargin: '-80px 0px -80% 0px' }
  );

  headings.forEach(h => observer.observe(h.el));
}
