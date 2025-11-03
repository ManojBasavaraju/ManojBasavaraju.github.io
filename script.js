// ============ 3D ROTATING CUBE WITH THREE.JS ============
let scene, camera, renderer, cube;

function initializeHeroCube() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.position.z = 3;

    // Create rotating cube
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    
    // Create gradient material for cube
    const canvas2D = document.createElement('canvas');
    canvas2D.width = 256;
    canvas2D.height = 256;
    const ctx = canvas2D.getContext('2d');
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#00d4ff');
    gradient.addColorStop(0.5, '#06d6a0');
    gradient.addColorStop(1, '#ffd700');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Add grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 256; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas2D);
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        emissive: 0x00d4ff,
        emissiveIntensity: 0.2,
        wireframe: false
    });
    
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add lights
    const light1 = new THREE.PointLight(0x00d4ff, 1, 100);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x06d6a0, 0.8, 100);
    light2.position.set(-5, -5, 5);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate cube
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.008;
        
        // Floating effect
        cube.position.y = Math.sin(Date.now() * 0.001) * 0.3;
        
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize cube on load
window.addEventListener('load', initializeHeroCube);

// ============ SMOOTH SCROLLING ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    });
});

// ============ COUNTER ANIMATION FOR METRICS ============
function animateCounters() {
    const counterElements = document.querySelectorAll('.metric-value');
    
    counterElements.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let current = 0;
        const increment = target / 40;
        const timer = setInterval(() => {
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                current += increment;
                counter.textContent = Math.floor(current);
            }
        }, 50);
    });
}

// Observe when metrics section comes into view
const metricsSection = document.querySelector('.dashboard');
const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

if (metricsSection) {
    observer.observe(metricsSection);
}

// ============ NAVBAR SCROLL EFFECT ============
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(15, 20, 25, 0.98)';
        navbar.style.boxShadow = '0 0 40px rgba(0, 212, 255, 0.3)';
    } else {
        navbar.style.background = 'rgba(15, 20, 25, 0.95)';
        navbar.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.2)';
    }
});

// ============ PARALLAX EFFECT ============
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrollPosition = window.pageYOffset;
    
    if (hero) {
        hero.style.backgroundPosition = `0 ${scrollPosition * 0.5}px`;
    }
});

// ============ RIPPLE EFFECT ON BUTTONS ============
document.querySelectorAll('.btn, .resource-btn, .contact-link').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple styles dynamically
const style = document.createElement('style');
style.textContent = `
    .btn, .resource-btn, .contact-link {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============ INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS ============
const fadeInElements = document.querySelectorAll('.feature-card, .metric-card, .tech-item, .result-item');

const fadeObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            fadeObserver.unobserve(entry.target);
        }
    });
}, fadeObserverOptions);

fadeInElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    fadeObserver.observe(el);
});

// ============ SCROLL TO TOP BUTTON ============
const createScrollToTopButton = () => {
    const button = document.createElement('button');
    button.innerHTML = '⬆';
    button.id = 'scrollToTop';
    button.style.cssText = `
        position: fixed;
        bottom: 40px;
        right: 40px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #00d4ff, #06d6a0);
        color: #000;
        border: 2px solid #00d4ff;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        display: none;
        z-index: 999;
        transition: all 0.3s ease;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    `;
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.2)';
        button.style.boxShadow = '0 0 40px rgba(0, 212, 255, 0.8)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.5)';
    });
};

createScrollToTopButton();

// ============ KEYBOARD NAVIGATION ============
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        window.scrollBy({ top: 200, behavior: 'smooth' });
    } else if (e.key === 'ArrowUp') {
        window.scrollBy({ top: -200, behavior: 'smooth' });
    }
});

// ============ SMOOTH SCROLL ON PAGE LOAD ============
window.addEventListener('load', () => {
    if (window.location.hash) {
        const element = document.querySelector(window.location.hash);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        }
    }
});

// ============ CONSOLE WELCOME MESSAGE ============
console.log('%c✨ Welcome to Manoj Basavaraju\'s Futuristic 3D Portfolio ✨', 'color: #00d4ff; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #00d4ff;');
console.log('%cBusiness Development & Analytics Specialist', 'color: #06d6a0; font-size: 14px; font-weight: bold;');
console.log('%c🚀 Space & Time Theme | 3D Rotating Cube | Advanced Animations', 'color: #ffd700; font-size: 13px;');
console.log('%c📧 Email: manojminzthemusician123@gmail.com', 'color: #a0a0a0; font-size: 12px;');
console.log('%c💼 LinkedIn: linkedin.com/in/manoj-basavaraju', 'color: #a0a0a0; font-size: 12px;');
console.log('%c💻 GitHub: github.com/ManojBasavaraju', 'color: #a0a0a0; font-size: 12px;');