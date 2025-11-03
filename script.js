// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(el.getAttribute('href')).scrollIntoView({behavior: 'smooth'});
  });
});

// Particles background for About section
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('aboutParticles'), alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const particlesCount = 200;
const particles = new THREE.BufferGeometry();
const positions = [];
for (let i=0; i<particlesCount; i++) {
  positions.push((Math.random() - 0.5) * 40);
  positions.push((Math.random() - 0.5) * 40);
  positions.push((Math.random() - 0.5) * 40);
}
particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({ color: "#06d6a0", size: 0.3, transparent: true, opacity: 0.7 });
const particleSystem = new THREE.Points(particles, material);
scene.add(particleSystem);
camera.position.z = 50;

function animate() {
  requestAnimationFrame(animate);
  particleSystem.rotation.y += 0.001;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Additional immersive effects like dropdowns, loading animations, etc.
