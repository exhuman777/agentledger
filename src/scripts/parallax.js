export function initParallax() {
  const posX = document.getElementById('pos-x');
  const posY = document.getElementById('pos-y');
  const artifact = document.getElementById('hero-artifact');

  document.addEventListener('mousemove', (e) => {
    if (posX) posX.textContent = e.clientX.toString().padStart(4, '0');
    if (posY) posY.textContent = e.clientY.toString().padStart(4, '0');

    if (artifact) {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      artifact.style.transform = `translate(${x}px, ${y}px)`;
    }
  });
}
