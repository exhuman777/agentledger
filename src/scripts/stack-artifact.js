export function initStackArtifact() {
  const canvas = document.getElementById('artifact-canvas');
  if (!canvas) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

  const script = document.createElement('script');
  script.src = THREE_URL;
  script.onload = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const material = new THREE.LineBasicMaterial({
      color: 0x0f0f0f,
      transparent: true,
      opacity: 0.6
    });

    const accentMaterial = new THREE.LineBasicMaterial({
      color: 0xea4e24,
      transparent: true,
      opacity: 0.9
    });

    const layers = [-0.8, 0, 0.8];
    const group = new THREE.Group();

    layers.forEach((y, i) => {
      const geo = new THREE.PlaneGeometry(2.2, 1.4);
      const wireGeo = new THREE.WireframeGeometry(geo);
      const mat = i === 2 ? accentMaterial : material;
      const wireframe = new THREE.LineSegments(wireGeo, mat);
      wireframe.position.y = y;
      wireframe.rotation.x = -0.3;
      group.add(wireframe);
    });

    scene.add(group);

    function animate() {
      requestAnimationFrame(animate);
      group.rotation.y += 0.003;
      renderer.render(scene, camera);
    }
    animate();
  };
  document.head.appendChild(script);
}
