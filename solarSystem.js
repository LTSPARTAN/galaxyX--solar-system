/**
 * 3D Solar System Simulation using Three.js
 * Features: Realistic planets, orbits, lighting, interactive controls
 */

class SolarSystem {
    constructor() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        // Animation and control states
        this.isAnimating = true;
        this.isDarkMode = true;
        this.clock = new THREE.Clock();
        
        // Debug animation state
        console.log('Solar System initialized, animation state:', this.isAnimating);
        
        // Force animation to start
        setTimeout(() => {
            console.log('Forcing animation check after 1 second...');
            if (!this.isAnimating) {
                console.log('Animation was paused, restarting...');
                this.isAnimating = true;
            }
        }, 1000);
        
        // Planet data with realistic relative sizes and orbital speeds
        this.planetData = {
            mercury: { name: 'Mercury', size: 0.38, distance: 15, speed: 4.74, color: 0x8C7853, rotationSpeed: 0.017 },
            venus: { name: 'Venus', size: 0.95, distance: 20, speed: 3.50, color: 0xFFC649, rotationSpeed: 0.004 },
            earth: { name: 'Earth', size: 1.0, distance: 25, speed: 2.98, color: 0x6B93D6, rotationSpeed: 1.0 },
            mars: { name: 'Mars', size: 0.53, distance: 32, speed: 2.41, color: 0xCD5C5C, rotationSpeed: 0.97 },
            jupiter: { name: 'Jupiter', size: 2.5, distance: 45, speed: 1.31, color: 0xD8CA9D, rotationSpeed: 2.4 },
            saturn: { name: 'Saturn', size: 2.1, distance: 60, speed: 0.97, color: 0xFAD5A5, rotationSpeed: 2.3 },
            uranus: { name: 'Uranus', size: 1.6, distance: 75, speed: 0.68, color: 0x4FD0E7, rotationSpeed: 1.4 },
            neptune: { name: 'Neptune', size: 1.55, distance: 90, speed: 0.54, color: 0x4B70DD, rotationSpeed: 1.5 }
        };
        
        // Storage for 3D objects
        this.planets = {};
        this.orbits = {};
        this.moons = {};
        this.asteroids = [];
        this.sun = null;
        this.saturnRings = null;
        
        // Mouse and interaction
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.hoveredPlanet = null;
        this.cameraTarget = new THREE.Vector3();
        this.originalCameraPosition = new THREE.Vector3();
        this.isZoomedIn = false;
        
        this.init();
    }
    
    init() {
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.createStarField();
        this.createSun();
        this.createPlanets();
        this.setupControls();
        this.setupEventListeners();
        this.createUI();
        this.animate();
        
        // Hide loading screen
        document.getElementById('loading').style.display = 'none';
    }
    
    createMoon(planet, name, size, distance, speed, color) {
        const moonGeometry = new THREE.SphereGeometry(size, 32, 32);
        const moonMaterial = new THREE.MeshLambertMaterial({ color: color });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        
        moon.castShadow = true;
        moon.receiveShadow = true;
        moon.userData = {
            name: name,
            isPlanet: false,
            isMoon: true,
            parent: planet,
            distance: distance,
            speed: speed,
            angle: Math.random() * Math.PI * 2
        };
        
        const moonKey = `${planet.userData.name.toLowerCase()}_${name}`;
        this.moons[moonKey] = moon;
        this.scene.add(moon);
    }
    
    createSaturnRings(planet, planetSize) {
        const ringGeometry = new THREE.RingGeometry(planetSize + 0.5, planetSize + 1.5, 64);
        const ringMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xaaaaaa,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        rings.rotation.z = Math.PI / 6; // Slight tilt
        
        planet.add(rings);
        this.saturnRings = rings;
    }
    
    createAsteroidBelt() {
        const asteroidCount = 100; // Reduced count for better visibility
        const beltInnerRadius = 38; // Between Mars (32) and Jupiter (45)
        const beltOuterRadius = 43;
        
        for (let i = 0; i < asteroidCount; i++) {
            const asteroidGeometry = new THREE.DodecahedronGeometry(Math.random() * 0.15 + 0.05, 0); // Smaller asteroids
            const asteroidMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(0.1, 0.3, Math.random() * 0.3 + 0.2),
                transparent: true,
                opacity: 0.8 // Slightly transparent
            });
            
            const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
            
            const distance = beltInnerRadius + Math.random() * (beltOuterRadius - beltInnerRadius);
            const angle = Math.random() * Math.PI * 2;
            const height = (Math.random() - 0.5) * 1; // Reduced height variation
            
            asteroid.position.set(
                Math.cos(angle) * distance,
                height,
                Math.sin(angle) * distance
            );
            
            asteroid.userData = {
                name: `Asteroid ${i}`,
                isPlanet: false,
                isAsteroid: true,
                angle: angle,
                distance: distance,
                speed: Math.random() * 0.3 + 0.1, // Slower movement
                rotationSpeed: Math.random() * 0.05 + 0.02
            };
            
            asteroid.castShadow = false; // Disable shadows to reduce visual clutter
            asteroid.receiveShadow = true;
            
            this.asteroids.push(asteroid);
            this.scene.add(asteroid);
        }
    }
    
    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }
    
    setupCamera() {
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);
        this.originalCameraPosition.copy(this.camera.position);
    }
    
    setupLights() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
        
        // Point light from the sun (brighter)
        this.sunLight = new THREE.PointLight(0xffffff, 3.5, 1500);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 4096;
        this.sunLight.shadow.mapSize.height = 4096;
        this.scene.add(this.sunLight);
    }
    
    createStarField() {
        // Create spiral galaxy background like the reference image
        const galaxyGeometry = new THREE.PlaneGeometry(1000, 1000, 128, 128);
        const galaxyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector2(1000, 1000) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec2 resolution;
                varying vec2 vUv;
                
                float noise(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                void main() {
                    vec2 center = vec2(0.5, 0.5);
                    vec2 pos = vUv - center;
                    float dist = length(pos);
                    float angle = atan(pos.y, pos.x);
                    
                    // Create spiral arms
                    float spiral1 = sin(angle * 2.0 + dist * 15.0 - time * 0.5) * 0.5 + 0.5;
                    float spiral2 = sin(angle * 2.0 + dist * 15.0 + 3.14159 - time * 0.5) * 0.5 + 0.5;
                    float spiralPattern = max(spiral1, spiral2);
                    
                    // Galaxy fade from center
                    float galaxyFade = 1.0 - smoothstep(0.0, 0.6, dist);
                    float centerGlow = 1.0 - smoothstep(0.0, 0.1, dist);
                    
                    // Color mixing for galaxy arms
                    vec3 centerColor = vec3(1.0, 0.8, 0.4); // Warm center
                    vec3 armColor = vec3(0.4, 0.6, 1.0);    // Blue arms
                    vec3 spaceColor = vec3(0.05, 0.05, 0.15); // Dark space
                    
                    vec3 color = mix(spaceColor, armColor, spiralPattern * galaxyFade);
                    color = mix(color, centerColor, centerGlow);
                    
                    // Add some noise for texture
                    float noiseValue = noise(vUv * 50.0 + time * 0.1) * 0.1;
                    color += noiseValue;
                    
                    gl_FragColor = vec4(color, galaxyFade * 0.6);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        this.galaxyBackground = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
        this.galaxyBackground.rotation.x = -Math.PI / 2;
        this.galaxyBackground.position.y = -50;
        this.scene.add(this.galaxyBackground);
        
        // Add a second layer for depth
        const galaxyGeometry2 = new THREE.PlaneGeometry(800, 800, 64, 64);
        const galaxyMaterial2 = galaxyMaterial.clone();
        galaxyMaterial2.uniforms.time = { value: 0 };
        
        this.galaxyBackground2 = new THREE.Mesh(galaxyGeometry2, galaxyMaterial2);
        this.galaxyBackground2.rotation.x = -Math.PI / 2;
        this.galaxyBackground2.position.y = -45;
        this.scene.add(this.galaxyBackground2);
        
        // Enhanced star field with varying sizes and colors
        const starsGeometry = new THREE.BufferGeometry();
        const starsVertices = [];
        const starsColors = [];
        const starsSizes = [];
        
        for (let i = 0; i < 15000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
            
            // Vary star colors (white, blue, yellow, red)
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                starsColors.push(1, 1, 1); // White
            } else if (colorChoice < 0.85) {
                starsColors.push(0.8, 0.8, 1); // Blue
            } else if (colorChoice < 0.95) {
                starsColors.push(1, 1, 0.8); // Yellow
            } else {
                starsColors.push(1, 0.8, 0.8); // Red
            }
            
            starsSizes.push(Math.random() * 2 + 0.5);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
        starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starsSizes, 1));
        
        const starsMaterial = new THREE.PointsMaterial({ 
            vertexColors: true,
            sizeAttenuation: false
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }
    
    createSun() {
        // Main sun body with enhanced brightness
        const sunGeometry = new THREE.SphereGeometry(3, 64, 64);
        const sunMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            emissive: 0xffaa00,
            emissiveIntensity: 1.2
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.userData = { name: 'Sun', isPlanet: false };
        
        // Add sun glow/aura effect with rays
        const glowGeometry = new THREE.SphereGeometry(4.5, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                glowColor: { value: new THREE.Color(0xffaa00) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec2 vUv;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 glowColor;
                varying vec3 vNormal;
                varying vec2 vUv;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    
                    // Add animated rays
                    float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
                    float rays = sin(angle * 8.0 + time * 2.0) * 0.3 + 0.7;
                    intensity *= rays;
                    
                    intensity += sin(time * 3.0) * 0.1;
                    gl_FragColor = vec4(glowColor, intensity * 0.8);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        this.sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sun.add(this.sunGlow);
        
        // Add sun rays as separate geometry
        const rayGeometry = new THREE.PlaneGeometry(20, 20);
        const rayMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                sunColor: { value: new THREE.Color(0xffaa00) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 sunColor;
                varying vec2 vUv;
                void main() {
                    vec2 center = vec2(0.5, 0.5);
                    vec2 pos = vUv - center;
                    float dist = length(pos);
                    float angle = atan(pos.y, pos.x);
                    
                    // Create rotating rays
                    float rays = 0.0;
                    for(int i = 0; i < 8; i++) {
                        float rayAngle = float(i) * 0.785398 + time * 0.5; // 45 degrees apart
                        float rayIntensity = max(0.0, cos(angle - rayAngle));
                        rayIntensity = pow(rayIntensity, 20.0);
                        rays += rayIntensity;
                    }
                    
                    float fade = 1.0 - smoothstep(0.0, 0.5, dist);
                    float alpha = rays * fade * 0.3;
                    
                    gl_FragColor = vec4(sunColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        
        this.sunRays = new THREE.Mesh(rayGeometry, rayMaterial);
        this.sunRays.position.set(0, 0, 0);
        this.scene.add(this.sunRays);
        
        this.scene.add(this.sun);
    }
    
    createPlanets() {
        Object.keys(this.planetData).forEach(planetKey => {
            const data = this.planetData[planetKey];
            
            // Create realistic planet geometry with more detail
            const geometry = new THREE.SphereGeometry(data.size, 64, 64);
            
            // Create procedural surface texture for realism
            const material = new THREE.MeshPhongMaterial({ 
                color: data.color,
                shininess: planetKey === 'venus' ? 100 : 30,
                specular: planetKey === 'earth' ? 0x111111 : 0x000000
            });
            
            // Add surface roughness using displacement
            if (planetKey !== 'venus') { // Venus is smooth due to thick atmosphere
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = 256;
                const ctx = canvas.getContext('2d');
                const imageData = ctx.createImageData(256, 256);
                
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const noise = Math.random() * 50 + 100;
                    imageData.data[i] = noise;     // R
                    imageData.data[i + 1] = noise; // G
                    imageData.data[i + 2] = noise; // B
                    imageData.data[i + 3] = 255;   // A
                }
                
                ctx.putImageData(imageData, 0, 0);
                const texture = new THREE.CanvasTexture(canvas);
                material.bumpMap = texture;
                material.bumpScale = planetKey === 'mars' ? 0.3 : 0.1;
            }
            
            const planet = new THREE.Mesh(geometry, material);
            planet.position.x = data.distance;
            planet.castShadow = true;
            planet.receiveShadow = true;
            const initialAngle = Math.random() * Math.PI * 2;
            planet.userData = { 
                name: data.name, 
                isPlanet: true,
                originalDistance: data.distance,
                angle: initialAngle,
                orbitSpeed: data.speed,
                baseSpeed: data.speed,
                startTime: 0, // Will be set when animation starts
                angleOffset: initialAngle, // Fixed offset to prevent jumps
                lastSpeedMultiplier: 1.0
            };
            
            // Set initial position
            planet.position.x = Math.cos(initialAngle) * data.distance;
            planet.position.z = Math.sin(initialAngle) * data.distance;
            planet.position.y = 0;
            
            // Create enhanced orbit line with glow effect
            const orbitGeometry = new THREE.RingGeometry(data.distance - 0.05, data.distance + 0.05, 128);
            const orbitMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(0x4488ff) }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 color;
                    varying vec2 vUv;
                    void main() {
                        vec2 center = vec2(0.5, 0.5);
                        float dist = distance(vUv, center);
                        float ring = 1.0 - smoothstep(0.48, 0.52, dist);
                        float pulse = sin(time * 2.0) * 0.3 + 0.7;
                        gl_FragColor = vec4(color, ring * pulse * 0.4);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            
            this.planets[planetKey] = planet;
            this.orbits[planetKey] = orbit;
            
            this.scene.add(planet);
            this.scene.add(orbit);
            
            // Add moons to specific planets
            if (planetKey === 'earth') {
                this.createMoon(planet, 'moon', 0.27, 4, 0.5, 0x888888);
            } else if (planetKey === 'saturn') {
                this.createSaturnRings(planet, data.size);
                this.createMoon(planet, 'titan', 0.4, 6, 0.3, 0xccaa88);
                this.createMoon(planet, 'enceladus', 0.15, 4.5, 0.8, 0xffffff);
            }
        });
        
        this.createAsteroidBelt();
    }
    
    setupControls() {
        // Simple mouse controls for camera
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;
        
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (isMouseDown && !this.isZoomedIn) {
                const deltaX = event.clientX - mouseX;
                const deltaY = event.clientY - mouseY;
                
                // Rotate camera around the scene
                const spherical = new THREE.Spherical();
                spherical.setFromVector3(this.camera.position);
                spherical.theta -= deltaX * 0.01;
                spherical.phi += deltaY * 0.01;
                spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
                
                this.camera.position.setFromSpherical(spherical);
                this.camera.lookAt(0, 0, 0);
                
                mouseX = event.clientX;
                mouseY = event.clientY;
            }
            
            // Update mouse position for raycasting
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Zoom with mouse wheel
        this.renderer.domElement.addEventListener('wheel', (event) => {
            if (!this.isZoomedIn) {
                const zoomSpeed = 0.1;
                const direction = event.deltaY > 0 ? 1 : -1;
                
                this.camera.position.multiplyScalar(1 + direction * zoomSpeed);
                
                // Limit zoom
                const distance = this.camera.position.length();
                if (distance < 20) this.camera.position.normalize().multiplyScalar(20);
                if (distance > 500) this.camera.position.normalize().multiplyScalar(500);
            }
        });
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Planet click detection
        this.renderer.domElement.addEventListener('click', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(Object.values(this.planets));
            
            if (intersects.length > 0) {
                const clickedPlanet = intersects[0].object;
                this.focusOnPlanet(clickedPlanet);
            } else if (this.isZoomedIn) {
                this.resetCamera();
            }
        });
        
        // Hover detection for tooltips
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects([...Object.values(this.planets), this.sun]);
            
            if (intersects.length > 0) {
                const hoveredObject = intersects[0].object;
                this.showTooltip(hoveredObject.userData.name, event.clientX, event.clientY);
                this.renderer.domElement.style.cursor = 'pointer';
                this.hoveredPlanet = hoveredObject;
            } else {
                this.hideTooltip();
                this.renderer.domElement.style.cursor = 'default';
                this.hoveredPlanet = null;
            }
        });
    }
    
    createUI() {
        const planetControlsContainer = document.getElementById('planet-controls');
        
        Object.keys(this.planetData).forEach(planetKey => {
            const data = this.planetData[planetKey];
            
            const controlDiv = document.createElement('div');
            controlDiv.className = 'planet-control';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'planet-name';
            nameSpan.textContent = data.name;
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'speed-slider';
            slider.min = '0';
            slider.max = '3';
            slider.step = '0.05';
            slider.value = '1';
            slider.id = `${planetKey}-speed`;
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'speed-value';
            valueSpan.textContent = '1.0x';
            valueSpan.id = `${planetKey}-value`;
            
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueSpan.textContent = `${value.toFixed(1)}x`;
                this.planetData[planetKey].currentSpeedMultiplier = value;
            });
            
            // Initialize speed multiplier
            this.planetData[planetKey].currentSpeedMultiplier = 1.0;
            
            controlDiv.appendChild(nameSpan);
            controlDiv.appendChild(slider);
            controlDiv.appendChild(valueSpan);
            planetControlsContainer.appendChild(controlDiv);
        });
        
        // Pause/Resume button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.isAnimating = !this.isAnimating;
            document.getElementById('pause-btn').textContent = this.isAnimating ? 'Pause' : 'Resume';
        });
        
        // Theme toggle button
        document.getElementById('theme-btn').addEventListener('click', () => {
            this.isDarkMode = !this.isDarkMode;
            document.body.classList.toggle('light-mode');
            document.getElementById('theme-btn').textContent = this.isDarkMode ? 'Light Mode' : 'Dark Mode';
        });
    }
    
    focusOnPlanet(planet) {
        if (this.isZoomedIn) return;
        
        this.isZoomedIn = true;
        const targetPosition = planet.position.clone();
        targetPosition.y += 10;
        targetPosition.z += 15;
        
        // Smooth camera transition
        const startPosition = this.camera.position.clone();
        const startTime = Date.now();
        const duration = 2000; // 2 seconds
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            
            this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            this.camera.lookAt(planet.position);
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            } else {
                // Auto return to normal view after 3 seconds
                setTimeout(() => {
                    if (this.isZoomedIn) this.resetCamera();
                }, 3000);
            }
        };
        
        animateCamera();
    }
    
    resetCamera() {
        if (!this.isZoomedIn) return;
        
        this.isZoomedIn = false;
        const startPosition = this.camera.position.clone();
        const startTime = Date.now();
        const duration = 1500;
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, this.originalCameraPosition, easeProgress);
            this.camera.lookAt(0, 0, 0);
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
    }
    
    showTooltip(text, x, y) {
        const tooltip = document.getElementById('tooltip');
        tooltip.textContent = text;
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y - 30}px`;
        tooltip.style.opacity = '1';
    }
    
    hideTooltip() {
        document.getElementById('tooltip').style.opacity = '0';
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        
        // Debug: Log animation state occasionally
        if (Math.random() < 0.001) {
            console.log('Animation running, time:', time.toFixed(2), 'isAnimating:', this.isAnimating);
        }
        
        if (this.isAnimating) {
            const deltaTime = this.clock.getDelta();
            
            // Update galaxy background animation
            if (this.galaxyBackground) {
                this.galaxyBackground.material.uniforms.time.value = time;
                this.galaxyBackground.rotation.z += deltaTime * 0.005;
            }
            if (this.galaxyBackground2) {
                this.galaxyBackground2.material.uniforms.time.value = time * 0.7;
                this.galaxyBackground2.rotation.z -= deltaTime * 0.003;
            }
            
            // Update orbit glow animations
            Object.keys(this.orbits).forEach(planetKey => {
                const orbit = this.orbits[planetKey];
                if (orbit.material.uniforms) {
                    orbit.material.uniforms.time.value = time;
                }
            });
            
            // Update sun glow and rays animation
            if (this.sunGlow) {
                this.sunGlow.material.uniforms.time.value = time;
            }
            if (this.sunRays) {
                this.sunRays.material.uniforms.time.value = time;
                this.sunRays.rotation.z += deltaTime * 0.1; // Slow rotation
            }
            
            // Rotate sun
            this.sun.rotation.y += deltaTime * 0.5;
            
            // Simple, guaranteed planetary motion
            Object.keys(this.planetData).forEach(planetKey => {
                const data = this.planetData[planetKey];
                const planet = this.planets[planetKey];
                
                if (!planet) {
                    console.error(`Planet ${planetKey} not found!`);
                    return;
                }
                
                // Initialize start time if not set
                if (planet.userData.startTime === 0) {
                    planet.userData.startTime = time;
                }
                
                // Get speed multiplier from the correct source
                const speedMultiplier = this.planetData[planetKey].currentSpeedMultiplier || 1.0;
                if (Math.abs(speedMultiplier - planet.userData.lastSpeedMultiplier) > 0.01) {
                    // Calculate current position angle
                    const currentAngle = Math.atan2(planet.position.z, planet.position.x);
                    // Adjust offset to maintain current position
                    const expectedAngle = (time - planet.userData.startTime) * 0.2 * (data.speed / 4.74) * speedMultiplier + planet.userData.angleOffset;
                    planet.userData.angleOffset += currentAngle - expectedAngle;
                    planet.userData.lastSpeedMultiplier = speedMultiplier;
                }
                
                // Calculate angle with offset (no jumps)
                const elapsedTime = time - planet.userData.startTime;
                const baseOrbitSpeed = 0.2; // Base orbital speed
                const relativeSpeed = data.speed / 4.74; // Relative to Mercury's speed
                const angle = elapsedTime * baseOrbitSpeed * relativeSpeed * speedMultiplier + planet.userData.angleOffset;
                
                // Update position
                planet.position.x = Math.cos(angle) * data.distance;
                planet.position.z = Math.sin(angle) * data.distance;
                planet.position.y = 0;
                
                // Rotate planet on its axis
                planet.rotation.y += deltaTime * data.rotationSpeed * speedMultiplier;
                
                // Store angle for reference
                planet.userData.angle = angle;
                
                // Debug for Mercury only
                if (planetKey === 'mercury' && Math.floor(time) % 2 === 0 && Math.random() < 0.01) {
                    console.log(`Mercury: speed=${this.planetData[planetKey].currentSpeedMultiplier.toFixed(2)}x, angle=${angle.toFixed(2)}, pos=(${planet.position.x.toFixed(1)}, ${planet.position.z.toFixed(1)})`);
                }
            });
            
            // Update moons
            Object.keys(this.moons).forEach(moonKey => {
                const moon = this.moons[moonKey];
                const parent = moon.userData.parent;
                
                moon.userData.angle += deltaTime * moon.userData.speed;
                const x = Math.cos(moon.userData.angle) * moon.userData.distance;
                const z = Math.sin(moon.userData.angle) * moon.userData.distance;
                
                moon.position.set(
                    parent.position.x + x,
                    parent.position.y,
                    parent.position.z + z
                );
                
                moon.rotation.y += deltaTime * 0.5;
            });
            
            // Update asteroids with slower, more subtle movement
            this.asteroids.forEach(asteroid => {
                asteroid.userData.angle += deltaTime * asteroid.userData.speed * 0.05;
                asteroid.position.x = Math.cos(asteroid.userData.angle) * asteroid.userData.distance;
                asteroid.position.z = Math.sin(asteroid.userData.angle) * asteroid.userData.distance;
                
                asteroid.rotation.x += deltaTime * asteroid.userData.rotationSpeed;
                asteroid.rotation.y += deltaTime * asteroid.userData.rotationSpeed * 0.7;
                asteroid.rotation.z += deltaTime * asteroid.userData.rotationSpeed * 0.5;
            });
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the solar system when the page loads
window.addEventListener('load', () => {
    new SolarSystem();
});
