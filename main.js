// ==========================================================================
// PORTFOLIO GALAXY — MAIN APPLICATION
// ==========================================================================

// --- LOADING SCREEN ---
const loadingScreen = document.getElementById('loading-screen');
const loaderStatus = document.getElementById('loader-status');

// Populate loading stars
(function populateLoaderStars() {
    const container = document.getElementById('loader-stars');
    for (let i = 0; i < 60; i++) {
        const star = document.createElement('div');
        star.className = 'loader-star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        star.style.width = star.style.height = (1 + Math.random() * 2) + 'px';
        container.appendChild(star);
    }
})();

// --- CUSTOM CURSOR ---
const cursorGlow = document.getElementById('cursor-glow');
const cursorDot = document.getElementById('cursor-dot');
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let cursorTargetX = cursorX;
let cursorTargetY = cursorY;

document.addEventListener('mousemove', (e) => {
    cursorTargetX = e.clientX;
    cursorTargetY = e.clientY;
    // Dot follows instantly
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
});

function updateCursor() {
    // Glow follows with smooth lag
    cursorX += (cursorTargetX - cursorX) * 0.12;
    cursorY += (cursorTargetY - cursorY) * 0.12;
    cursorGlow.style.left = cursorX + 'px';
    cursorGlow.style.top = cursorY + 'px';
    requestAnimationFrame(updateCursor);
}
updateCursor();

// Hover detection for cursor size change
document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.nav-item, .social-link, .glass-btn, .project-card, .skill-tag, a, button')) {
        cursorGlow.classList.add('hovering');
    } else {
        cursorGlow.classList.remove('hovering');
    }
});

// --- LOADING MANAGER ---
const loadManager = new THREE.LoadingManager();

const loadingMessages = [
    'Mapping star clusters...',
    'Calibrating warp drive...',
    'Rendering nebulae...',
    'Synchronizing orbits...',
    'Establishing comm links...',
    'Universe ready.'
];
let msgIndex = 0;
const msgInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % (loadingMessages.length - 1);
    if (loaderStatus) loaderStatus.textContent = loadingMessages[msgIndex];
}, 1200);

loadManager.onLoad = () => {
    clearInterval(msgInterval);
    if (loaderStatus) loaderStatus.textContent = loadingMessages[loadingMessages.length - 1];

    setTimeout(() => {
        loadingScreen.classList.add('loaded');
        // Start hero entrance after loading screen fades
        setTimeout(heroEntrance, 800);
    }, 600);
};

loadManager.onError = (url) => {
    console.warn('Error loading:', url);
};

// --- THREE.JS SETUP ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030108, 0.004); // Atmospheric depth fog

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

const canvas = document.querySelector('#bg-canvas');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;

// Post-Processing (Bloom)
const renderScene = new THREE.RenderPass(scene, camera);
const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.8,   // Stronger bloom
    0.5,   // radius
    0.7    // Lower threshold = more glow
);
const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Raycaster & Mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Parallax mouse tracking
let parallaxX = 0;
let parallaxY = 0;
let parallaxTargetX = 0;
let parallaxTargetY = 0;

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.4;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.addEventListener('start', () => {
    heroOverlay.classList.add('hidden');
});

// --- TEXTURES ---
const textureLoader = new THREE.TextureLoader(loadManager);
const textures = {
    sun: textureLoader.load('assets/sun.jpg'),
    earth: textureLoader.load('assets/earth.jpg'),
    jupiter: textureLoader.load('assets/jupiter.jpg'),
    mars: textureLoader.load('assets/mars.jpg')
};

const planets = [];
const moons = [];
const hitboxes = [];
const gltfLoader = new THREE.GLTFLoader(loadManager);

let currentTarget = null;
let currentMoonTarget = null;
let isExploring = false;
let isExploringMoon = false;

// DOM References
const uiContainer = document.getElementById('ui-container');
const heroOverlay = document.getElementById('hero-overlay');
const panelTitle = document.getElementById('panel-title');
const panelBody = document.getElementById('panel-body');
const backBtn = document.getElementById('back-btn');
const galaxyNav = document.getElementById('galaxy-nav');

// ==========================================================================
// 3D SCENE CONSTRUCTION
// ==========================================================================

// 1. ENHANCED STARFIELD — Multiple layers with varying sizes
function addStars() {
    const group = new THREE.Group();

    // Layer 1: Dense small stars
    const starCount1 = 6000;
    const geo1 = new THREE.BufferGeometry();
    const pos1 = new Float32Array(starCount1 * 3);
    const sizes1 = new Float32Array(starCount1);
    for (let i = 0; i < starCount1; i++) {
        pos1[i * 3] = (Math.random() - 0.5) * 300;
        pos1[i * 3 + 1] = (Math.random() - 0.5) * 300;
        pos1[i * 3 + 2] = (Math.random() - 0.5) * 300;
        sizes1[i] = Math.random() * 0.12 + 0.03;
    }
    geo1.setAttribute('position', new THREE.BufferAttribute(pos1, 3));
    const mat1 = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true
    });
    group.add(new THREE.Points(geo1, mat1));

    // Layer 2: Bright accent stars
    const starCount2 = 400;
    const geo2 = new THREE.BufferGeometry();
    const pos2 = new Float32Array(starCount2 * 3);
    const colors2 = new Float32Array(starCount2 * 3);
    const accentColors = [
        [0.0, 0.9, 1.0],   // cyan
        [0.96, 0.65, 0.14], // gold
        [0.66, 0.33, 0.97], // purple
        [1.0, 1.0, 1.0]    // white
    ];
    for (let i = 0; i < starCount2; i++) {
        pos2[i * 3] = (Math.random() - 0.5) * 250;
        pos2[i * 3 + 1] = (Math.random() - 0.5) * 250;
        pos2[i * 3 + 2] = (Math.random() - 0.5) * 250;
        const c = accentColors[Math.floor(Math.random() * accentColors.length)];
        colors2[i * 3] = c[0];
        colors2[i * 3 + 1] = c[1];
        colors2[i * 3 + 2] = c[2];
    }
    geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    geo2.setAttribute('color', new THREE.BufferAttribute(colors2, 3));
    const mat2 = new THREE.PointsMaterial({
        size: 0.25,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });
    group.add(new THREE.Points(geo2, mat2));

    scene.add(group);
    return group;
}
const stars = addStars();

// 2. NEBULA PARTICLES — Soft colored clouds for atmosphere
function addNebula() {
    const group = new THREE.Group();
    const nebulaCount = 150;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(nebulaCount * 3);
    const colors = new Float32Array(nebulaCount * 3);
    const nebulaColors = [
        [0.0, 0.5, 0.8],   // deep cyan
        [0.4, 0.1, 0.7],   // deep purple
        [0.1, 0.0, 0.3],   // dark violet
        [0.6, 0.2, 0.0],   // warm ember
    ];
    for (let i = 0; i < nebulaCount; i++) {
        // Clusters around the galaxy plane
        pos[i * 3] = (Math.random() - 0.5) * 200;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
        const c = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
        colors[i * 3] = c[0];
        colors[i * 3 + 1] = c[1];
        colors[i * 3 + 2] = c[2];
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
        size: 8,
        vertexColors: true,
        transparent: true,
        opacity: 0.06,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    group.add(new THREE.Points(geo, mat));
    scene.add(group);
    return group;
}
const nebula = addNebula();

// 3. THE SUN
const sunGeometry = new THREE.SphereGeometry(6, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
    map: textures.sun,
    color: 0xffffff
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Sun corona glow
const coronaGeo = new THREE.SphereGeometry(7.5, 32, 32);
const coronaMat = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide
});
scene.add(new THREE.Mesh(coronaGeo, coronaMat));

// Lights
const sunLight = new THREE.PointLight(0xfff0dd, 4, 300);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(50, 50, 50);
scene.add(dirLight);

// 4. SHOOTING STARS
const shootingStars = [];
function createShootingStar() {
    const geo = new THREE.CylinderGeometry(0, 0.15, 6, 3);
    const mat = new THREE.MeshBasicMaterial({
        color: 0xeeffff,
        transparent: true,
        opacity: 0.7
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 100 + 50,
        (Math.random() - 0.5) * 200 - 100
    );
    mesh.rotation.z = Math.PI / 4;
    mesh.rotation.x = Math.PI / 4;
    mesh.userData = {
        speed: Math.random() * 2 + 1,
        resetZ: mesh.position.z,
        resetY: mesh.position.y,
        resetX: mesh.position.x
    };
    scene.add(mesh);
    shootingStars.push(mesh);
}
for (let i = 0; i < 5; i++) createShootingStar();

// 5. PLANETS — Orbit data
const planetData = {
    about: {
        model: 'assets/robot.glb', modelScale: 0.8, size: 2.5, distance: 15, speed: 0.005, angle: 0,
        id: 'about',
        title: 'The Astronaut (About Me)',
        html: '<p>Warping to the Arcane Laboratory...</p>'
    },
    skills: {
        texture: textures.jupiter, size: 3.5, distance: 25, speed: 0.003, angle: Math.PI / 3,
        title: 'Tech Arsenal (Skills)',
        html: '<div class="skill-tag">JavaScript / Three.js</div><div class="skill-tag">React / Next.js</div><div class="skill-tag">WebGL / Shaders</div><div class="skill-tag">Blender 3D</div>'
    },
    projects: {
        model: 'assets/ship.glb', modelScale: 0.1, size: 2.5, distance: 35, speed: 0.002, angle: Math.PI / 1.5,
        title: 'Missions Database (Projects)',
        html: '<p>Select a satellite to download mission logs.</p>',
        hasMoons: true,
        subProjects: [
            { title: 'Athenify', desc: 'AI Debate Platform built with Next.js', color: 0x00ffcc },
            { title: 'Harmonium', desc: 'Virtual Instrument App using Web Audio API', color: 0xff00cc },
            { title: 'Payment Tracker', desc: 'Financial dashboard and analytics', color: 0xccff00 }
        ]
    },
    blog: {
        texture: textures.earth, size: 3, distance: 45, speed: 0.0025, angle: Math.PI,
        title: 'Captain\'s Log (Blog)',
        html: '<div class="project-card"><h3>How I Built This 3D Universe</h3><p>A deep dive into Three.js, Math.sin(), and spatial UI design. [Read More]</p></div><div class="project-card"><h3>The Future of WebGL</h3><p>Why flat websites are becoming obsolete. [Read More]</p></div>'
    },
    experience: {
        texture: textures.mars, size: 2, distance: 55, speed: 0.0015, angle: Math.PI * 1.3,
        title: 'Mission History (Experience)',
        html: '<div class="project-card"><h3>Senior Frontend Engineer</h3><p>SpaceTech Industries | 2023 - Present</p></div><div class="project-card"><h3>Creative Dev Intern</h3><p>Nebula Corp | 2021 - 2023</p></div>'
    },
    contact: {
        color: 0x00ffff, size: 1.5, distance: 65, speed: 0.004, angle: Math.PI * 1.7,
        title: 'Comm Link (Contact)',
        html: '<p>Establish a direct subspace channel:</p><br><a href="mailto:hello@universe.com" style="color:#00e5ff; font-size: 1.2rem; text-decoration: none; border-bottom: 1px solid #00e5ff;">hello@space.dev</a><br><br><p>Social Networks:</p><div class="skill-tag">GitHub</div><div class="skill-tag">LinkedIn</div><div class="skill-tag">Twitter/X</div>'
    }
};

// Build planet objects
for (const key in planetData) {
    const pData = planetData[key];
    const planetGroup = new THREE.Group();
    planetGroup.userData = { id: key, ...pData };

    // Hitbox
    const hitboxGeo = new THREE.SphereGeometry(pData.size * 1.2, 16, 16);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    hitbox.userData.parentGroup = planetGroup;
    planetGroup.add(hitbox);
    hitboxes.push(hitbox);

    if (pData.model) {
        gltfLoader.load(pData.model, (gltf) => {
            const model = gltf.scene;
            model.scale.set(pData.modelScale, pData.modelScale, pData.modelScale);
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            planetGroup.add(model);
        });
    } else {
        const geo = new THREE.SphereGeometry(pData.size, 32, 32);
        const matParams = { shininess: 15 };
        if (pData.texture) matParams.map = pData.texture;
        else matParams.color = pData.color;
        const mat = new THREE.MeshPhongMaterial(matParams);
        planetGroup.add(new THREE.Mesh(geo, mat));
    }

    // Orbit ring with subtle glow
    const ringGeo = new THREE.RingGeometry(pData.distance - 0.08, pData.distance + 0.08, 128);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x6644aa,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide
    });
    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = Math.PI / 2;
    scene.add(orbitRing);

    // Label
    const label = document.createElement('div');
    label.className = 'planet-label hidden';
    label.innerText = pData.title;
    document.getElementById('labels-container').appendChild(label);
    planetGroup.userData.labelEl = label;

    // Moon logic
    if (pData.hasMoons) {
        planetGroup.userData.moons = [];
        pData.subProjects.forEach((proj, index) => {
            const moonGroup = new THREE.Group();
            const moonGeo = new THREE.DodecahedronGeometry(0.5, 1);
            const moonMat = new THREE.MeshPhongMaterial({ color: proj.color, shininess: 50 });
            moonGroup.add(new THREE.Mesh(moonGeo, moonMat));

            const mHitboxGeo = new THREE.SphereGeometry(0.8, 16, 16);
            const mHitboxMat = new THREE.MeshBasicMaterial({ visible: false });
            const mHitbox = new THREE.Mesh(mHitboxGeo, mHitboxMat);
            mHitbox.userData = { isMoon: true, parentGroup: moonGroup, parentPlanet: planetGroup, title: proj.title, desc: proj.desc };
            moonGroup.add(mHitbox);
            moons.push(mHitbox);

            moonGroup.userData = {
                angle: (Math.PI * 2 / pData.subProjects.length) * index,
                distance: pData.size + 3,
                speed: 0.02 + (Math.random() * 0.01),
                yOffset: (Math.random() - 0.5) * 2
            };

            const mLabel = document.createElement('div');
            mLabel.className = 'planet-label hidden';
            mLabel.style.fontSize = '0.7rem';
            mLabel.style.border = `1px solid #${proj.color.toString(16).padStart(6, '0')}`;
            mLabel.innerText = proj.title;
            document.getElementById('labels-container').appendChild(mLabel);
            moonGroup.userData.labelEl = mLabel;

            planetGroup.userData.moons.push(moonGroup);
            planetGroup.add(moonGroup);
        });
    }

    planets.push(planetGroup);
    scene.add(planetGroup);
}

// ==========================================================================
// HERO ENTRANCE ANIMATION
// ==========================================================================

function heroEntrance() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Greeting
    tl.to('.hero-greeting', { opacity: 1, y: 0, duration: 0.8 }, 0.1);

    // Name — letter by letter stagger
    const nameEl = document.getElementById('hero-name');
    const nameText = nameEl.querySelector('.highlight-name');
    const letters = nameText.textContent.split('');
    nameText.innerHTML = letters.map(l => `<span class="letter">${l}</span>`).join('');
    nameEl.style.opacity = 1;

    tl.to('.hero-name .letter', {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(1.7)'
    }, 0.5);

    // Scripts
    tl.to('.hero-scripts', { opacity: 1, y: 0, duration: 0.6 }, 1.0);

    // Role typewriter
    tl.to('.hero-role', { opacity: 1, y: 0, duration: 0.5 }, 1.2);
    tl.add(() => startTypewriter(), 1.5);

    // Noble meaning
    tl.to('.noble-meaning', { opacity: 1, y: 0, duration: 0.8 }, 1.6);

    // Social links
    tl.to('.hero-socials', { opacity: 1, y: 0, duration: 0.6 }, 2.0);

    // Cue
    tl.to('.hero-cue', { opacity: 1, y: 0, duration: 0.6 }, 2.3);

    // Navigation bar slides up
    tl.add(() => galaxyNav.classList.add('visible'), 2.5);
}

// ==========================================================================
// TYPEWRITER EFFECT
// ==========================================================================

const roles = [
    'Creative Developer',
    '3D Web Engineer',
    'Polymathic Explorer',
    'WebGL Enthusiast',
    'Student & Builder'
];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const roleTextEl = document.getElementById('role-text');

function startTypewriter() {
    typewriterTick();
}

function typewriterTick() {
    const currentRole = roles[roleIndex];

    if (!isDeleting) {
        roleTextEl.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentRole.length) {
            isDeleting = true;
            setTimeout(typewriterTick, 2000); // Pause before deleting
            return;
        }
        setTimeout(typewriterTick, 70 + Math.random() * 40);
    } else {
        roleTextEl.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(typewriterTick, 400);
            return;
        }
        setTimeout(typewriterTick, 35);
    }
}

// ==========================================================================
// NAVIGATION BAR
// ==========================================================================

const planetMap = {};
planets.forEach(p => {
    planetMap[p.userData.id] = p;
});

// Wait for planets array to be populated, then bind
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const planetId = btn.dataset.planet;
        // Re-lookup since planetMap uses ids from userData
        const target = planets.find(p => p.userData.id === planetId);
        if (target) {
            flyToPlanet(target);
            // Update active state
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    });
});

// ==========================================================================
// INTERACTION
// ==========================================================================

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Parallax target
    parallaxTargetX = (event.clientX / window.innerWidth - 0.5) * 2;
    parallaxTargetY = (event.clientY / window.innerHeight - 0.5) * 2;
});

let touchStartX = 0;
let touchStartY = 0;

window.addEventListener('pointerdown', (event) => {
    touchStartX = event.clientX;
    touchStartY = event.clientY;
});

window.addEventListener('pointerup', (event) => {
    const dx = event.clientX - touchStartX;
    const dy = event.clientY - touchStartY;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (isExploring && currentTarget && currentTarget.userData.hasMoons) {
        const moonIntersects = raycaster.intersectObjects(moons);
        if (moonIntersects.length > 0) {
            flyToMoon(moonIntersects[0].object);
            return;
        }
    }

    if (isExploring) return;

    const intersects = raycaster.intersectObjects(hitboxes);
    if (intersects.length > 0) {
        const clickedPlanetGroup = intersects[0].object.userData.parentGroup;
        flyToPlanet(clickedPlanetGroup);
    }
});

backBtn.addEventListener('click', () => {
    returnToGalaxy();
});

// ==========================================================================
// FLY-TO ANIMATIONS
// ==========================================================================

function flyToPlanet(planet) {
    isExploring = true;
    currentTarget = planet;
    controls.autoRotate = false;

    const offset = new THREE.Vector3(0, planet.userData.size + 2, planet.userData.size * 3);
    const targetPos = planet.position.clone().add(offset);

    heroOverlay.classList.add('hidden');
    galaxyNav.classList.add('nav-hidden');

    // --- WARP TO ABOUT (Arcane Laboratory) ---
    if (planet.userData.id === 'about') {
        const warpOverlay = document.createElement('div');
        warpOverlay.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0;z-index:9999;pointer-events:none;transition:opacity 1s ease-in;';
        document.body.appendChild(warpOverlay);
        gsap.to(camera.position, {
            x: targetPos.x, y: targetPos.y, z: targetPos.z - 2, duration: 1.5, ease: 'power3.in',
            onUpdate: () => camera.lookAt(planet.position),
            onComplete: () => {
                warpOverlay.style.opacity = '1';
                setTimeout(() => {
                    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                    window.location.href = isLocal ? 'http://localhost:3003' : 'https://about-me-kohl-xi.vercel.app/';
                }, 1000);
            }
        });
        return;
    }

    // --- WARP TO PROJECTS ---
    if (planet.userData.title === 'Missions Database (Projects)') {
        const warpOverlay = document.createElement('div');
        warpOverlay.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0;z-index:9999;pointer-events:none;transition:opacity 1s ease-in;';
        document.body.appendChild(warpOverlay);
        gsap.to(camera.position, {
            x: targetPos.x, y: targetPos.y, z: targetPos.z - 2, duration: 1.5, ease: 'power3.in',
            onUpdate: () => camera.lookAt(planet.position),
            onComplete: () => {
                warpOverlay.style.opacity = '1';
                setTimeout(() => {
                    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                    window.location.href = isLocal ? 'http://localhost:3001' : 'https://projects-red-phi.vercel.app/';
                }, 1000);
            }
        });
        return;
    }

    // --- WARP TO BLOG ---
    if (planet.userData.title === 'Captain\'s Log (Blog)') {
        const warpOverlay = document.createElement('div');
        warpOverlay.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0;z-index:9999;pointer-events:none;transition:opacity 1s ease-in;';
        document.body.appendChild(warpOverlay);
        gsap.to(camera.position, {
            x: targetPos.x, y: targetPos.y, z: targetPos.z - 2, duration: 1.5, ease: 'power3.in',
            onUpdate: () => camera.lookAt(planet.position),
            onComplete: () => {
                warpOverlay.style.opacity = '1';
                setTimeout(() => {
                    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                    window.location.href = isLocal ? 'http://localhost:3000' : 'https://blog-six-beta-13.vercel.app/';
                }, 1000);
            }
        });
        return;
    }

    // Standard fly-to
    gsap.to(camera.position, {
        x: targetPos.x, y: targetPos.y, z: targetPos.z,
        duration: 1.5, ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(planet.position),
        onComplete: () => {
            panelTitle.innerText = planet.userData.title;
            panelBody.innerHTML = planet.userData.html;
            uiContainer.classList.remove('hidden');
        }
    });
}

function flyToMoon(moonHitbox) {
    isExploringMoon = true;
    currentMoonTarget = moonHitbox.userData.parentGroup;
    uiContainer.classList.add('hidden');

    const targetPos = new THREE.Vector3();
    currentMoonTarget.getWorldPosition(targetPos);
    const offset = new THREE.Vector3(0, 1.5, 4);
    const camPos = targetPos.clone().add(offset);

    gsap.to(camera.position, {
        x: camPos.x, y: camPos.y, z: camPos.z,
        duration: 1.0, ease: 'power2.out',
        onUpdate: () => camera.lookAt(targetPos),
        onComplete: () => {
            panelTitle.innerText = moonHitbox.userData.title;
            panelBody.innerHTML = `<div class="project-card"><h3>${moonHitbox.userData.title}</h3><p>${moonHitbox.userData.desc}</p></div>`;
            uiContainer.classList.remove('hidden');
        }
    });
}

function returnToGalaxy() {
    uiContainer.classList.add('hidden');

    if (isExploringMoon) {
        isExploringMoon = false;
        currentMoonTarget = null;
        flyToPlanet(currentTarget);
        return;
    }

    // Clear nav active states
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    gsap.to(camera.position, {
        x: 0, y: 20, z: 70,
        duration: 1.5, ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0, 0, 0),
        onComplete: () => {
            isExploring = false;
            currentTarget = null;
            controls.autoRotate = true;
            controls.target.set(0, 0, 0);
            heroOverlay.classList.remove('hidden');
            galaxyNav.classList.remove('nav-hidden');
            galaxyNav.classList.add('visible');
        }
    });
}

// ==========================================================================
// ANIMATION LOOP
// ==========================================================================

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Parallax — smooth follow
    parallaxX += (parallaxTargetX - parallaxX) * 0.03;
    parallaxY += (parallaxTargetY - parallaxY) * 0.03;

    // Star layers subtle rotation + parallax
    stars.rotation.y = time * 0.03;
    stars.rotation.x = parallaxY * 0.02;

    // Nebula drift
    nebula.rotation.y = time * 0.01;
    nebula.rotation.x = time * 0.005;

    // Sun
    sun.rotation.y = time * 0.2;
    sun.rotation.x = time * 0.1;

    // Shooting Stars
    shootingStars.forEach(star => {
        star.position.x -= star.userData.speed;
        star.position.y -= star.userData.speed;
        star.position.z += star.userData.speed / 2;
        if (star.position.y < -100 || star.position.x < -150) {
            star.position.set(
                (Math.random() - 0.5) * 300 + 100,
                (Math.random() - 0.5) * 100 + 100,
                (Math.random() - 0.5) * 200 - 100
            );
            star.userData.speed = Math.random() * 2 + 1;
        }
    });

    // Orbit Planets
    planets.forEach(p => {
        const data = p.userData;
        data.angle += data.speed;
        p.position.x = Math.cos(data.angle) * data.distance;
        p.position.z = Math.sin(data.angle) * data.distance;
        p.rotation.y += 0.01;

        // Moons
        if (data.hasMoons) {
            p.userData.moons.forEach(m => {
                m.userData.angle += m.userData.speed;
                m.position.x = Math.cos(m.userData.angle) * m.userData.distance;
                m.position.y = m.userData.yOffset;
                m.position.z = Math.sin(m.userData.angle) * m.userData.distance;
                m.rotation.y += 0.05;
                m.rotation.z += 0.02;

                // Moon labels
                if (isExploring && currentTarget === p && !isExploringMoon) {
                    const worldPos = new THREE.Vector3();
                    m.getWorldPosition(worldPos);
                    const vector = worldPos.project(camera);
                    if (vector.z > 1) {
                        m.userData.labelEl.classList.add('hidden');
                    } else {
                        const x = (vector.x * .5 + .5) * window.innerWidth;
                        const y = (vector.y * -.5 + .5) * window.innerHeight;
                        m.userData.labelEl.classList.remove('hidden');
                        m.userData.labelEl.style.left = `${x}px`;
                        m.userData.labelEl.style.top = `${y - 30}px`;
                    }
                } else {
                    m.userData.labelEl.classList.add('hidden');
                }
            });
        }

        // Camera tracking when exploring
        if (isExploring && currentTarget === p && !isExploringMoon) {
            const offset = new THREE.Vector3(0, data.size + 2, data.size * 3);
            camera.position.x = p.position.x + offset.x;
            camera.position.y = p.position.y + offset.y;
            camera.position.z = p.position.z + offset.z;
            camera.lookAt(p.position);
        } else if (isExploringMoon && currentTarget === p && currentMoonTarget) {
            const worldPos = new THREE.Vector3();
            currentMoonTarget.getWorldPosition(worldPos);
            const offset = new THREE.Vector3(0, 1.5, 4);
            camera.position.x = worldPos.x + offset.x;
            camera.position.y = worldPos.y + offset.y;
            camera.position.z = worldPos.z + offset.z;
            camera.lookAt(worldPos);
        }

        // Planet labels
        if (!isExploring) {
            const vector = p.position.clone();
            vector.project(camera);
            if (vector.z > 1) {
                p.userData.labelEl.classList.add('hidden');
            } else {
                const x = (vector.x * .5 + .5) * window.innerWidth;
                const y = (vector.y * -.5 + .5) * window.innerHeight;
                p.userData.labelEl.classList.remove('hidden');
                p.userData.labelEl.style.left = `${x}px`;
                p.userData.labelEl.style.top = `${y - 40}px`;
            }
        } else {
            p.userData.labelEl.classList.add('hidden');
        }
    });

    if (!isExploring) {
        // Apply subtle parallax offset to camera
        camera.position.x += parallaxX * 0.3;
        camera.position.y += parallaxY * 0.15;
        controls.update();
    }

    // Hover effects
    raycaster.setFromCamera(mouse, camera);

    if (isExploring && currentTarget && currentTarget.userData.hasMoons && !isExploringMoon) {
        const moonIntersects = raycaster.intersectObjects(moons);
        if (moonIntersects.length > 0) {
            document.body.style.cursor = 'none';
            cursorGlow.classList.add('hovering');
            const mGroup = moonIntersects[0].object.userData.parentGroup;
            gsap.to(mGroup.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.2 });
        } else {
            cursorGlow.classList.remove('hovering');
            currentTarget.userData.moons.forEach(m => {
                gsap.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
            });
        }
    }

    const intersects = raycaster.intersectObjects(hitboxes);
    if (intersects.length > 0 && !isExploring) {
        cursorGlow.classList.add('hovering');
        const group = intersects[0].object.userData.parentGroup;
        gsap.to(group.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.2 });
    } else if (!isExploring) {
        cursorGlow.classList.remove('hovering');
        planets.forEach(p => {
            if (p !== currentTarget) {
                gsap.to(p.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
            }
        });
    }

    composer.render();
}

// --- INITIAL CAMERA ANIMATION ---
camera.position.set(0, 100, 200);
gsap.to(camera.position, {
    x: 0, y: 20, z: 70,
    duration: 3, ease: 'power3.out',
    onUpdate: () => camera.lookAt(0, 0, 0)
});

animate();

// --- RESIZE HANDLER ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
