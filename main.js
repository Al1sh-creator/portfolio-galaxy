// Scene Setup
const scene = new THREE.Scene();

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// Renderer Setup
const canvas = document.querySelector('#bg-canvas');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false, // Turn off antialias for post-processing compatibility
    alpha: true // Transparent background in case CSS has a gradient
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;

// Post-Processing (Bloom) Setup
const renderScene = new THREE.RenderPass(scene, camera);
const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,   // strength
    0.4,   // radius
    0.85   // threshold
);
const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Raycaster & Mouse for Interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// OrbitControls (Disabled mostly, just for debug or drag rotation)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// Hide hero on interaction
controls.addEventListener('start', () => {
    heroOverlay.classList.add('hidden');
});

// Variables
const textureLoader = new THREE.TextureLoader();
const textures = {
    sun: textureLoader.load('assets/sun.jpg'),
    earth: textureLoader.load('assets/earth.jpg'),
    jupiter: textureLoader.load('assets/jupiter.jpg'),
    mars: textureLoader.load('assets/mars.jpg')
};

const planets = [];
const moons = []; // Store hitboxes for moons

// Define the 6 Orbits
const planetData = {
    // 1. The Astronaut (About Me)
    about: { 
        model: 'assets/robot.glb', modelScale: 0.8, size: 2.5, distance: 15, speed: 0.005, angle: 0, 
        title: 'The Explorer (About)', 
        html: '<p>I am a creative developer charting the unknown regions of the web. My primary mission is to build highly immersive, interactive experiences.</p><br><p><strong>Status:</strong> Orbiting the Milky Way.</p>' 
    },
    // 2. Tech Stack (Skills)
    skills: { 
        texture: textures.jupiter, size: 3.5, distance: 25, speed: 0.003, angle: Math.PI / 3, 
        title: 'Tech Arsenal (Skills)', 
        html: '<div class="skill-tag">JavaScript / Three.js</div><div class="skill-tag">React / Next.js</div><div class="skill-tag">WebGL / Shaders</div><div class="skill-tag">Blender 3D</div>' 
    },
    // 3. Projects (Spaceship with Moons)
    projects: { 
        model: 'assets/ship.glb', modelScale: 0.1, size: 2.5, distance: 35, speed: 0.002, angle: Math.PI / 1.5, 
        title: 'Missions Database (Projects)', 
        html: '<p>Select a satellite to download mission logs.</p>',
        hasMoons: true, // Flag to trigger moon logic
        subProjects: [
            { title: 'Athenify', desc: 'AI Debate Platform built with Next.js', color: 0x00ffcc },
            { title: 'Harmonium', desc: 'Virtual Instrument App using Web Audio API', color: 0xff00cc },
            { title: 'Payment Tracker', desc: 'Financial dashboard and analytics', color: 0xccff00 }
        ]
    },
    // 4. Personal Blog (Earth - sharing thoughts with the world)
    blog: { 
        texture: textures.earth, size: 3, distance: 45, speed: 0.0025, angle: Math.PI, 
        title: 'Captain\'s Log (Blog)', 
        html: '<div class="project-card"><h3>How I Built This 3D Universe</h3><p>A deep dive into Three.js, Math.sin(), and spatial UI design. [Read More]</p></div><div class="project-card"><h3>The Future of WebGL</h3><p>Why flat websites are becoming obsolete. [Read More]</p></div>' 
    },
    // 5. Work Experience (Mars - the rocky terrain of past jobs)
    experience: { 
        texture: textures.mars, size: 2, distance: 55, speed: 0.0015, angle: Math.PI * 1.3, 
        title: 'Mission History (Experience)', 
        html: '<div class="project-card"><h3>Senior Frontend Engineer</h3><p>SpaceTech Industries | 2023 - Present</p></div><div class="project-card"><h3>Creative Dev Intern</h3><p>Nebula Corp | 2021 - 2023</p></div>' 
    },
    // 6. Contact (Glowing communication beacon)
    contact: { 
        color: 0x00ffff, size: 1.5, distance: 65, speed: 0.004, angle: Math.PI * 1.7, 
        title: 'Comm Link (Contact)', 
        html: '<p>Establish a direct subspace channel:</p><br><a href="mailto:hello@universe.com" style="color:#0ff; font-size: 1.2rem; text-decoration: none; border-bottom: 1px solid #0ff;">hello@space.dev</a><br><br><p>Social Networks:</p><div class="skill-tag">GitHub</div><div class="skill-tag">LinkedIn</div><div class="skill-tag">Twitter/X</div>' 
    }
};

const hitboxes = []; // For raycasting main planets
const gltfLoader = new THREE.GLTFLoader();

let currentTarget = null;
let currentMoonTarget = null;
let isExploring = false;
let isExploringMoon = false;

// Helpers
const uiContainer = document.getElementById('ui-container');
const heroOverlay = document.getElementById('hero-overlay');
const panelTitle = document.getElementById('panel-title');
const panelBody = document.getElementById('panel-body');
const backBtn = document.getElementById('back-btn');

// --- 3D OBJECTS ---

// 1. Particle Galaxy (Starfield)
function addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const posArray = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
        // Spread stars in a wide disc (like a galaxy)
        posArray[i] = (Math.random() - 0.5) * 200;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });

    const starMesh = new THREE.Points(starGeometry, starMaterial);
    scene.add(starMesh);
    return starMesh;
}
const stars = addStars();

// 2. The Sun (Center)
const sunGeometry = new THREE.SphereGeometry(6, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ 
    map: textures.sun,
    color: 0xffffff // White base color so texture shows cleanly
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Add glowing point light at center
const sunLight = new THREE.PointLight(0xffffff, 4, 300);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Brighten the ambient light significantly
scene.add(ambientLight);

// Add an overall directional light so the dark sides of planets are still clearly visible
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 50, 50);
scene.add(dirLight);

// 2.5 Shooting Stars
const shootingStars = [];
function createShootingStar() {
    const geo = new THREE.CylinderGeometry(0, 0.2, 5, 3);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    
    // Random starting positions far out
    mesh.position.set(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 100 + 50, // Start higher up
        (Math.random() - 0.5) * 200 - 100 // Mostly in the background
    );
    
    // Angle them to shoot diagonally down and left
    mesh.rotation.z = Math.PI / 4;
    mesh.rotation.x = Math.PI / 4;
    
    // Assign random speed
    mesh.userData = {
        speed: Math.random() * 2 + 1,
        resetZ: mesh.position.z,
        resetY: mesh.position.y,
        resetX: mesh.position.x
    };
    
    scene.add(mesh);
    shootingStars.push(mesh);
}

// Create a few shooting stars
for (let i = 0; i < 5; i++) {
    createShootingStar();
}

// 3. Create Planets
for (const key in planetData) {
    const pData = planetData[key];
    
    // Create base group for the planet/model
    const planetGroup = new THREE.Group();
    planetGroup.userData = { id: key, ...pData };

    // Create an invisible hitbox for raycasting
    const hitboxGeo = new THREE.SphereGeometry(pData.size * 1.2, 16, 16);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false }); // Invisible
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    hitbox.userData.parentGroup = planetGroup;
    planetGroup.add(hitbox);
    hitboxes.push(hitbox);
    
    if (pData.model) {
        // Load custom GLB model
        gltfLoader.load(pData.model, (gltf) => {
            const model = gltf.scene;
            model.scale.set(pData.modelScale, pData.modelScale, pData.modelScale);
            // Center the model roughly
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            
            planetGroup.add(model);
        });
    } else {
        // Create standard Planet Sphere
        const geo = new THREE.SphereGeometry(pData.size, 32, 32);
        const matParams = { shininess: 15 };
        if (pData.texture) {
            matParams.map = pData.texture;
        } else {
            matParams.color = pData.color;
        }
        const mat = new THREE.MeshPhongMaterial(matParams);
        const visualSphere = new THREE.Mesh(geo, mat);
        planetGroup.add(visualSphere);
    }
    
    // Add Ring (Atmosphere / Orbit Path indicator)
    const ringGeo = new THREE.RingGeometry(pData.distance - 0.1, pData.distance + 0.1, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = Math.PI / 2;
    scene.add(orbitRing);

    // Create HTML Label
    const label = document.createElement('div');
    label.className = 'planet-label hidden'; // Hide initially
    label.innerText = pData.title;
    document.getElementById('labels-container').appendChild(label);
    planetGroup.userData.labelEl = label;
    
    // --- MOON LOGIC ---
    if (pData.hasMoons) {
        planetGroup.userData.moons = [];
        pData.subProjects.forEach((proj, index) => {
            const moonGroup = new THREE.Group();
            
            // Moon visual
            const moonGeo = new THREE.DodecahedronGeometry(0.5, 1);
            const moonMat = new THREE.MeshPhongMaterial({ color: proj.color, shininess: 50 });
            const moonMesh = new THREE.Mesh(moonGeo, moonMat);
            moonGroup.add(moonMesh);
            
            // Moon hitbox
            const mHitboxGeo = new THREE.SphereGeometry(0.8, 16, 16);
            const mHitboxMat = new THREE.MeshBasicMaterial({ visible: false });
            const mHitbox = new THREE.Mesh(mHitboxGeo, mHitboxMat);
            mHitbox.userData = { isMoon: true, parentGroup: moonGroup, parentPlanet: planetGroup, title: proj.title, desc: proj.desc };
            moonGroup.add(mHitbox);
            moons.push(mHitbox);
            
            // State
            moonGroup.userData = {
                angle: (Math.PI * 2 / pData.subProjects.length) * index,
                distance: pData.size + 3,
                speed: 0.02 + (Math.random() * 0.01),
                yOffset: (Math.random() - 0.5) * 2
            };
            
            // Add Label for Moon
            const mLabel = document.createElement('div');
            mLabel.className = 'planet-label hidden';
            mLabel.style.fontSize = '0.7rem';
            mLabel.style.border = `1px solid #${proj.color.toString(16).padStart(6, '0')}`;
            mLabel.innerText = proj.title;
            document.getElementById('labels-container').appendChild(mLabel);
            moonGroup.userData.labelEl = mLabel;

            planetGroup.userData.moons.push(moonGroup);
            planetGroup.add(moonGroup); // Add moon as child of planet
        });
    }

    planets.push(planetGroup);
    scene.add(planetGroup);
}

// --- INTERACTION ---

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('touchstart', (event) => {
    if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
}, { passive: true });

window.addEventListener('click', (event) => {
    if (event.clientX !== undefined) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    raycaster.setFromCamera(mouse, camera);

    // If exploring the projects planet, check moons first
    if (isExploring && currentTarget && currentTarget.userData.hasMoons) {
        const moonIntersects = raycaster.intersectObjects(moons);
        if (moonIntersects.length > 0) {
            const clickedMoonHitbox = moonIntersects[0].object;
            flyToMoon(clickedMoonHitbox);
            return;
        }
    }

    if (isExploring) return; // Prevent clicking planets while panel is open

    const intersects = raycaster.intersectObjects(hitboxes);

    if (intersects.length > 0) {
        const clickedPlanetGroup = intersects[0].object.userData.parentGroup;
        flyToPlanet(clickedPlanetGroup);
    }
});

backBtn.addEventListener('click', () => {
    returnToGalaxy();
});

// Animation Functions
function flyToPlanet(planet) {
    isExploring = true;
    currentTarget = planet;
    
    // Stop rotation
    controls.autoRotate = false;
    
    // Calculate new camera position (slightly offset from planet)
    const offset = new THREE.Vector3(0, planet.userData.size + 2, planet.userData.size * 3);
    const targetPos = planet.position.clone().add(offset);

    // Hide Hero, Show Overlays
    heroOverlay.classList.add('hidden');
    
    // --- WARP TO PROJECTS LOGIC ---
    if (planet.userData.title === 'Missions Database (Projects)') {
        const warpOverlay = document.createElement('div');
        warpOverlay.style.position = 'fixed';
        warpOverlay.style.top = '0';
        warpOverlay.style.left = '0';
        warpOverlay.style.width = '100vw';
        warpOverlay.style.height = '100vh';
        warpOverlay.style.backgroundColor = '#ffffff';
        warpOverlay.style.opacity = '0';
        warpOverlay.style.zIndex = '9999';
        warpOverlay.style.pointerEvents = 'none';
        warpOverlay.style.transition = 'opacity 1s ease-in';
        document.body.appendChild(warpOverlay);

        gsap.to(camera.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z - 2, 
            duration: 1.5,
            ease: "power3.in",
            onUpdate: () => {
                camera.lookAt(planet.position);
            },
            onComplete: () => {
                warpOverlay.style.opacity = '1';
                setTimeout(() => {
                    const isLocal = window.location.hostname === 'localhost';
                    window.location.href = isLocal ? 'http://localhost:3001' : 'https://projects-red-phi.vercel.app/'; // Link to Projects Vault
                }, 1000);
            }
        });
        return; 
    }

    // --- WARP TO BLOG LOGIC ---
    if (planet.userData.title === 'Captain\'s Log (Blog)') {
        // Create full screen white overlay dynamically
        const warpOverlay = document.createElement('div');
        warpOverlay.style.position = 'fixed';
        warpOverlay.style.top = '0';
        warpOverlay.style.left = '0';
        warpOverlay.style.width = '100vw';
        warpOverlay.style.height = '100vh';
        warpOverlay.style.backgroundColor = '#ffffff';
        warpOverlay.style.opacity = '0';
        warpOverlay.style.zIndex = '9999';
        warpOverlay.style.pointerEvents = 'none';
        warpOverlay.style.transition = 'opacity 1s ease-in';
        document.body.appendChild(warpOverlay);

        gsap.to(camera.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z - 2, // Go closer than normal
            duration: 1.5,
            ease: "power3.in",
            onUpdate: () => {
                camera.lookAt(planet.position);
            },
            onComplete: () => {
                // Trigger white out
                warpOverlay.style.opacity = '1';
                setTimeout(() => {
                    const isLocal = window.location.hostname === 'localhost';
                    window.location.href = isLocal ? 'http://localhost:3000' : 'https://blog-six-beta-13.vercel.app/'; // Link to Next.js Blog
                }, 1000);
            }
        });
        return; // Don't execute standard UI popup
    }

    // GSAP Animation to move camera
    gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
            camera.lookAt(planet.position);
        },
        onComplete: () => {
            // Populate UI
            panelTitle.innerText = planet.userData.title;
            panelBody.innerHTML = planet.userData.html;
            uiContainer.classList.remove('hidden');
        }
    });
}

function flyToMoon(moonHitbox) {
    isExploringMoon = true;
    currentMoonTarget = moonHitbox.userData.parentGroup;
    const parentPlanet = moonHitbox.userData.parentPlanet;

    uiContainer.classList.add('hidden'); // Hide planet panel

    // We need to calculate world position since moon is a child
    const targetPos = new THREE.Vector3();
    currentMoonTarget.getWorldPosition(targetPos);
    
    // Offset camera slightly from moon
    const offset = new THREE.Vector3(0, 1.5, 4);
    const camPos = targetPos.clone().add(offset);
    
    gsap.to(camera.position, {
        x: camPos.x,
        y: camPos.y,
        z: camPos.z,
        duration: 1.0,
        ease: "power2.out",
        onUpdate: () => {
            camera.lookAt(targetPos);
        },
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
        // Return to Planet view first
        isExploringMoon = false;
        currentMoonTarget = null;
        flyToPlanet(currentTarget);
        return;
    }
    
    // Animate camera back
    gsap.to(camera.position, {
        x: 0,
        y: 20, /* Slightly above */
        z: 70,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
            camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
            isExploring = false;
            currentTarget = null;
            controls.autoRotate = true;
            controls.target.set(0, 0, 0);
            heroOverlay.classList.remove('hidden');
        }
    });
}


// --- MAIN LOOP ---

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Rotate starfield slowly
    stars.rotation.y = time * 0.05;
    
    // Rotate Sun
    sun.rotation.y = time * 0.2;
    sun.rotation.x = time * 0.1;

    // Animate Shooting Stars
    shootingStars.forEach(star => {
        star.position.x -= star.userData.speed;
        star.position.y -= star.userData.speed;
        star.position.z += star.userData.speed / 2; // Move slightly towards camera
        
        // Reset if it goes out of bounds
        if (star.position.y < -100 || star.position.x < -150) {
            star.position.set(
                (Math.random() - 0.5) * 300 + 100, // Offset to right
                (Math.random() - 0.5) * 100 + 100, // Offset top
                (Math.random() - 0.5) * 200 - 100
            );
            star.userData.speed = Math.random() * 2 + 1; // New speed
        }
    });

    // Orbit Planets
    planets.forEach(p => {
        const data = p.userData;
        // Only orbit if we aren't currently exploring it, or maybe keep orbiting slightly
        data.angle += data.speed;
        
        // Calculate orbit position
        p.position.x = Math.cos(data.angle) * data.distance;
        p.position.z = Math.sin(data.angle) * data.distance;
        
        // Rotate planet on its axis
        p.rotation.y += 0.01;

        // Update Moons if any
        if (data.hasMoons) {
            p.userData.moons.forEach(m => {
                m.userData.angle += m.userData.speed;
                m.position.x = Math.cos(m.userData.angle) * m.userData.distance;
                m.position.y = m.userData.yOffset; // Slight tilt
                m.position.z = Math.sin(m.userData.angle) * m.userData.distance;
                m.rotation.y += 0.05;
                m.rotation.z += 0.02;

                // Moon Labels
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

        // If we are exploring this planet (and NOT a moon), attach camera
        if (isExploring && currentTarget === p && !isExploringMoon) {
            const offset = new THREE.Vector3(0, data.size + 2, data.size * 3);
            camera.position.x = p.position.x + offset.x; 
            camera.position.y = p.position.y + offset.y;
            camera.position.z = p.position.z + offset.z;
            camera.lookAt(p.position);
        } else if (isExploringMoon && currentTarget === p && currentMoonTarget) {
            // If exploring moon, we need camera to track the moving moon
            const worldPos = new THREE.Vector3();
            currentMoonTarget.getWorldPosition(worldPos);
            const offset = new THREE.Vector3(0, 1.5, 4);
            camera.position.x = worldPos.x + offset.x;
            camera.position.y = worldPos.y + offset.y;
            camera.position.z = worldPos.z + offset.z;
            camera.lookAt(worldPos);
        }

        // Update 2D Label positions (Planet)
        if (!isExploring) {
            const vector = p.position.clone();
            vector.project(camera);
            
            // Check if planet is behind camera
            if (vector.z > 1) {
                p.userData.labelEl.classList.add('hidden');
            } else {
                const x = (vector.x * .5 + .5) * window.innerWidth;
                const y = (vector.y * -.5 + .5) * window.innerHeight;
                p.userData.labelEl.classList.remove('hidden');
                p.userData.labelEl.style.left = `${x}px`;
                p.userData.labelEl.style.top = `${y - 40}px`; // Display above planet
            }
        } else {
            p.userData.labelEl.classList.add('hidden'); // Hide all labels when exploring
        }
    });

    if (!isExploring) {
        controls.update(); // handles auto-rotate when in galaxy view
    }

    // Hover effect (change cursor if over planet or moons)
    raycaster.setFromCamera(mouse, camera);
    
    // Check moons first if exploring projects
    if (isExploring && currentTarget && currentTarget.userData.hasMoons && !isExploringMoon) {
        const moonIntersects = raycaster.intersectObjects(moons);
        if (moonIntersects.length > 0) {
            document.body.style.cursor = 'pointer';
            const mHitbox = moonIntersects[0].object;
            const mGroup = mHitbox.userData.parentGroup;
            gsap.to(mGroup.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.2 });
            return;
        } else {
            // Reset moon scales
            currentTarget.userData.moons.forEach(m => {
                gsap.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
            });
        }
    }

    const intersects = raycaster.intersectObjects(hitboxes);
    if (intersects.length > 0 && !isExploring) {
        document.body.style.cursor = 'pointer';
        // Add a slight scale up to hovered planet group
        const group = intersects[0].object.userData.parentGroup;
        gsap.to(group.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.2 });
    } else {
        document.body.style.cursor = 'default';
        planets.forEach(p => {
            if (p !== currentTarget) {
                gsap.to(p.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
            }
        });
    }

    // Render using post-processing composer instead of standard renderer
    composer.render();
}

// Initial positioning animation
camera.position.set(0, 100, 200); // Start far out
gsap.to(camera.position, {
    x: 0,
    y: 20,
    z: 70,
    duration: 3,
    ease: "power3.out",
    onUpdate: () => camera.lookAt(0,0,0)
});

animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
