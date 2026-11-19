
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const host = document.querySelector("#universe");
const loading = document.querySelector("#loading");

const scene = new THREE.Scene();
const universeLayer = new THREE.Group();
scene.add(universeLayer);
const solarSystemLayer = new THREE.Group();
solarSystemLayer.visible = false;
scene.add(solarSystemLayer);
let explorationMode = "universe";
scene.background = new THREE.Color(0x02040b);
scene.fog = new THREE.FogExp2(0x02040b, 0.00042);

const camera = new THREE.PerspectiveCamera(
    55, innerWidth / innerHeight, 0.1, 12000
);
camera.position.set(0, 185, 780);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.045;
controls.minDistance = 35;
controls.maxDistance = 4200;
controls.target.set(0, 0, 0);

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

raycaster.params.Points.threshold = 7;

const pickables = [];
const rotating = [];

let cameraMoving = false;
let cameraStart = new THREE.Vector3();
let cameraEnd = new THREE.Vector3();
let targetStart = new THREE.Vector3();
let targetEnd = new THREE.Vector3();
let cameraProgress = 0;
let paused = false;
let totalStars = 0;
let seed = 84721;

function rnd() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
}

const range = (a, b) => a + rnd() * (b - a);

// --------------------------------------------------
// DEEP SPACE STARFIELD
// --------------------------------------------------

function starfield() {
    const n = 36000;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);

    const palette = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xa9cfff),
        new THREE.Color(0xffd7b0)
    ];

    for (let i = 0; i < n; i++) {
        const r = range(900, 5200);
        const u = range(-1, 1);
        const t = range(0, Math.PI * 2);
        const q = Math.sqrt(1 - u * u);

        pos.set([
            r * q * Math.cos(t),
            r * u,
            r * q * Math.sin(t)
        ], i * 3);

        const c = palette[Math.floor(rnd() * 3)];
        const b = range(0.35, 1);

        col.set([c.r * b, c.g * b, c.b * b], i * 3);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));

    universeLayer.add(new THREE.Points(
        g,
        new THREE.PointsMaterial({
            size: 1.65,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.88,
            depthWrite: false
        })
    ));

    return n;
}

// --------------------------------------------------
// GALAXY GLOW TEXTURE
// --------------------------------------------------

function glow() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;

    const x = c.getContext("2d");
    const g = x.createRadialGradient(64, 64, 2, 64, 64, 64);

    g.addColorStop(0, "rgba(190,220,255,.75)");
    g.addColorStop(0.18, "rgba(100,160,255,.28)");
    g.addColorStop(0.48, "rgba(65,100,220,.08)");
    g.addColorStop(1, "rgba(20,40,100,0)");

    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(c);
}

const glowMap = glow();

// --------------------------------------------------
// GALAXY GENERATOR
// Three distinct galaxy structures
// --------------------------------------------------

function gaussian() {
    // Box-Muller normal distribution, used for physically softer
    // stellar scatter than a uniform random distribution.
    const u = Math.max(rnd(), 1e-8);
    const v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function galaxy(o) {
    const group = new THREE.Group();
    group.position.set(...o.position);
    group.rotation.set(
        o.tilt,
        range(0, Math.PI * 2),
        range(-0.10, 0.10)
    );

    const warm = new THREE.Color(0xffd9ad);
    const neutral = new THREE.Color(0xe9efff);
    const young = new THREE.Color(0x9ecbff);
    const base = new THREE.Color(o.color);

    function makeCloud(count, sampler, materialSize, opacity = 0.96) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const sample = sampler();
            positions.set([sample.x, sample.y, sample.z], i * 3);

            const c = sample.color || neutral;
            const brightness = sample.brightness ?? range(0.62, 1.0);
            colors.set([
                c.r * brightness,
                c.g * brightness,
                c.b * brightness
            ], i * 3);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const points = new THREE.Points(
            geometry,
            new THREE.PointsMaterial({
                size: materialSize,
                sizeAttenuation: true,
                vertexColors: true,
                transparent: true,
                opacity,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );
        group.add(points);
    }

    function bulgeSample(flattening = 0.48, extent = 0.25) {
        const zDir = range(-1, 1);
        const angle = range(0, Math.PI * 2);
        const planar = Math.sqrt(1 - zDir * zDir);
        const r = Math.pow(rnd(), 0.72) * o.radius * extent;
        return {
            x: Math.cos(angle) * planar * r,
            y: zDir * r * flattening,
            z: Math.sin(angle) * planar * r,
            color: warm,
            brightness: range(0.68, 1.0)
        };
    }

    // A concentrated, older stellar bulge is common to disk galaxies.
    const hasBulge = ["spiral", "barred", "lenticular"].includes(o.kind);

    if (o.kind === "spiral" || o.kind === "barred") {
        const bulgeCount = Math.floor(o.stars * (o.kind === "barred" ? 0.23 : 0.19));
        const armCount = Math.floor(o.stars * 0.61);
        const diffuseCount = o.stars - bulgeCount - armCount;

        makeCloud(bulgeCount, () => bulgeSample(0.58, 0.23), 1.55, 0.98);

        if (o.kind === "barred") {
            const barCount = Math.floor(armCount * 0.13);
            makeCloud(barCount, () => ({
                x: gaussian() * o.radius * 0.17,
                y: gaussian() * 0.9,
                z: gaussian() * o.radius * 0.038,
                color: warm,
                brightness: range(0.72, 1.0)
            }), 1.5, 0.98);
            const remainingArmCount = armCount - barCount;
            makeCloud(remainingArmCount, () => {
                const arm = Math.floor(rnd() * o.arms);
                const r = o.radius * (0.07 + Math.pow(rnd(), 0.76) * 0.91);
                const angle = arm / o.arms * Math.PI * 2 + (r / o.radius) * 7.4;
                const spread = 1.15 + r * 0.022;
                const radialScatter = gaussian() * spread * 0.42;
                const tangentialScatter = gaussian() * spread * 1.15;
                const rr = r + radialScatter;
                const a = angle + tangentialScatter / Math.max(r, 8);
                const starColor = rnd() < 0.62 ? young : (rnd() < 0.5 ? neutral : warm);
                return {
                    x: Math.cos(a) * rr,
                    y: gaussian() * (0.65 + r * 0.009),
                    z: Math.sin(a) * rr,
                    color: starColor,
                    brightness: range(0.58, 1.0)
                };
            }, 1.42, 0.96);
        } else {
            makeCloud(armCount, () => {
                const arm = Math.floor(rnd() * o.arms);
                const r = o.radius * (0.06 + Math.pow(rnd(), 0.76) * 0.92);
                const angle = arm / o.arms * Math.PI * 2 + (r / o.radius) * 7.4;
                const spread = 1.2 + r * 0.024;
                const radialScatter = gaussian() * spread * 0.44;
                const tangentialScatter = gaussian() * spread * 1.18;
                const rr = r + radialScatter;
                const a = angle + tangentialScatter / Math.max(r, 8);
                const starColor = rnd() < 0.64 ? young : (rnd() < 0.52 ? neutral : warm);
                return {
                    x: Math.cos(a) * rr,
                    y: gaussian() * (0.65 + r * 0.009),
                    z: Math.sin(a) * rr,
                    color: starColor,
                    brightness: range(0.58, 1.0)
                };
            }, 1.42, 0.96);
        }

        // A faint inter-arm disk prevents the spiral from looking like
        // isolated pinwheel lines and gives it a continuous stellar disk.
        makeCloud(diffuseCount, () => {
            const a = range(0, Math.PI * 2);
            const r = Math.pow(rnd(), 0.72) * o.radius;
            return {
                x: Math.cos(a) * r,
                y: gaussian() * (0.5 + r * 0.008),
                z: Math.sin(a) * r,
                color: rnd() < 0.35 ? warm : neutral,
                brightness: range(0.28, 0.68)
            };
        }, 1.18, 0.62);

        // Narrow, subdued dust lanes trace the inner edges of the spiral arms.
        // They are deliberately subtle so they read as structure, not graphic lines.
        const dustMaterial = new THREE.MeshBasicMaterial({
            color: 0x111827,
            transparent: true,
            opacity: 0.38,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        for (let arm = 0; arm < o.arms; arm++) {
            const vertices = [];
            const indices = [];
            const steps = 90;
            for (let j = 0; j <= steps; j++) {
                const t = j / steps;
                const r = o.radius * (0.12 + t * 0.82);
                const a = arm / o.arms * Math.PI * 2 + (r / o.radius) * 7.4 - 0.045;
                const width = 0.7 + t * 0.9;
                const x = Math.cos(a) * r;
                const z = Math.sin(a) * r;
                const nx = -Math.sin(a);
                const nz = Math.cos(a);
                vertices.push(x + nx * width, 0.32, z + nz * width);
                vertices.push(x - nx * width, 0.32, z - nz * width);
                if (j < steps) {
                    const k = j * 2;
                    indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
                }
            }
            const dustGeometry = new THREE.BufferGeometry();
            dustGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
            dustGeometry.setIndex(indices);
            dustGeometry.computeVertexNormals();
            group.add(new THREE.Mesh(dustGeometry, dustMaterial));
        }
    }
    else if (o.kind === "elliptical") {
        makeCloud(o.stars, () => {
            const zDir = range(-1, 1);
            const angle = range(0, Math.PI * 2);
            const planar = Math.sqrt(1 - zDir * zDir);
            // Centrally concentrated spheroid, with a modest triaxial shape.
            const r = Math.pow(rnd(), 0.62) * o.radius;
            return {
                x: Math.cos(angle) * planar * r,
                y: zDir * r * 0.72,
                z: Math.sin(angle) * planar * r * 0.88,
                color: warm.clone().lerp(base, range(0.08, 0.34)),
                brightness: range(0.45, 0.92)
            };
        }, 1.42, 0.94);
    }
    else if (o.kind === "lenticular") {
        const bulgeCount = Math.floor(o.stars * 0.42);
        makeCloud(bulgeCount, () => bulgeSample(0.64, 0.34), 1.5, 0.98);
        makeCloud(o.stars - bulgeCount, () => {
            const a = range(0, Math.PI * 2);
            const r = Math.pow(rnd(), 0.76) * o.radius;
            return {
                x: Math.cos(a) * r,
                y: gaussian() * (0.48 + r * 0.006),
                z: Math.sin(a) * r,
                color: rnd() < 0.72 ? warm : neutral,
                brightness: range(0.42, 0.88)
            };
        }, 1.3, 0.9);
    }
    else if (o.kind === "irregular") {
        const clumps = [
            [-0.34, 0.12, 0.12], [0.28, -0.18, -0.24],
            [0.04, 0.29, 0.28], [-0.12, -0.23, -0.18],
            [0.34, 0.18, 0.04]
        ];
        makeCloud(o.stars, () => {
            const center = clumps[Math.floor(rnd() * clumps.length)];
            const spread = o.radius * range(0.045, 0.15);
            return {
                x: center[0] * o.radius + gaussian() * spread,
                y: center[1] * o.radius + gaussian() * spread * 0.75,
                z: center[2] * o.radius + gaussian() * spread,
                color: rnd() < 0.72 ? young : neutral,
                brightness: range(0.5, 1.0)
            };
        }, 1.5, 0.96);
    }

    // Compact, restrained core glow rather than a large featureless halo.
    const core = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowMap,
        color: o.color,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }));
    const coreSize = o.kind === "elliptical" ? o.radius * 0.48 : o.radius * 0.36;
    core.scale.set(coreSize, coreSize, 1);
    group.add(core);

    const innerCore = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowMap,
        color: 0xffe4c2,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }));
    innerCore.scale.set(coreSize * 0.42, coreSize * 0.42, 1);
    group.add(innerCore);

    const hit = new THREE.Mesh(
        new THREE.SphereGeometry(o.radius * 0.82, 16, 12),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.userData.data = o;
    group.add(hit);
    pickables.push(hit);

    universeLayer.add(group);
    rotating.push(group);
    totalStars += o.stars;
}

// --------------------------------------------------
// NEBULA CLOUDS
// --------------------------------------------------

function nebula(p, s, c, opacity) {
    const m = new THREE.SpriteMaterial({
        map: glowMap,
        color: c,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const o = new THREE.Sprite(m);

    o.position.set(...p);
    o.scale.set(s, s * 0.72, 1);

    universeLayer.add(o);
}

// --------------------------------------------------
// UNIVERSE DATA
// --------------------------------------------------

totalStars += starfield();

const galaxies = [

    {
        name: "Milky Way",
        type: "Barred spiral galaxy",
        kind: "barred",
        position: [0, 0, 0],
        radius: 125,
        arms: 4,
        color: 0x9bbcff,
        stars: 14000,
        tilt: 0.16
    },

    {
        name: "Andromeda analogue",
        type: "Spiral galaxy",
        kind: "spiral",
        position: [330, 85, -240],
        radius: 155,
        arms: 5,
        color: 0xffc99c,
        stars: 11500,
        tilt: -0.42
    },

    {
        name: "Triangulum analogue",
        type: "Spiral galaxy",
        kind: "spiral",
        position: [-350, -80, -180],
        radius: 82,
        arms: 3,
        color: 0x9fe0ff,
        stars: 5200,
        tilt: 0.62
    },

    {
        name: "Sombrero analogue",
        type: "Lenticular galaxy",
        kind: "lenticular",
        position: [170, -190, 370],
        radius: 105,
        arms: 0,
        color: 0xffd7a5,
        stars: 6800,
        tilt: 1.1
    },

    {
        name: "Whirlpool analogue",
        type: "Grand-design spiral galaxy",
        kind: "spiral",
        position: [-420, 190, 330],
        radius: 118,
        arms: 4,
        color: 0xb4a7ff,
        stars: 7600,
        tilt: -0.8
    },

    {
        name: "Distant elliptical",
        type: "Elliptical galaxy",
        kind: "elliptical",
        position: [620, 220, 180],
        radius: 95,
        arms: 0,
        color: 0xffbca1,
        stars: 4800,
        tilt: 0.3
    },

    {
        name: "Blue compact galaxy",
        type: "Compact irregular galaxy",
        kind: "irregular",
        position: [-620, -230, 80],
        radius: 58,
        arms: 0,
        color: 0x83d8ff,
        stars: 3100,
        tilt: 0.9
    },

    {
        name: "Faint spiral",
        type: "Spiral galaxy",
        kind: "spiral",
        position: [40, 340, -650],
        radius: 90,
        arms: 3,
        color: 0xc6b6ff,
        stars: 4300,
        tilt: -0.2
    }

];

galaxies.forEach(galaxy);

// --------------------------------------------------
// NEBULA DISTRIBUTION
// --------------------------------------------------

nebula([-190, 40, 100], 360, 0x3154b8, 0.045);
nebula([280, 90, -80], 320, 0x7c3b9e, 0.04);
nebula([-380, -40, -280], 280, 0x286e9b, 0.035);
nebula([120, -240, 250], 250, 0x9a563b, 0.03);

// --------------------------------------------------
// SOLAR SYSTEM MODE — FIRST SCIENTIFIC MILESTONE
// Distances are compressed for visibility; AU values are
// shown in the data and orbital periods are in Earth years.
// --------------------------------------------------

const solarPlanets = [
    { name: "Mercury", au: 0.387, period: 0.241, radius: 0.42, color: 0xaaa49b, eccentricity: 0.2056 },
    { name: "Venus",   au: 0.723, period: 0.615, radius: 0.72, color: 0xd9b477, eccentricity: 0.0068 },
    { name: "Earth",   au: 1.000, period: 1.000, radius: 0.76, color: 0x3988df, eccentricity: 0.0167 },
    { name: "Mars",    au: 1.524, period: 1.881, radius: 0.58, color: 0xc76543, eccentricity: 0.0934 },
    { name: "Jupiter", au: 5.203, period: 11.86, radius: 3.1, color: 0xc99b70, eccentricity: 0.0489 },
    { name: "Saturn",  au: 9.537, period: 29.46, radius: 2.55, color: 0xd8c18e, eccentricity: 0.0565 },
    { name: "Uranus",  au: 19.19, period: 84.01, radius: 1.55, color: 0x8bd8df, eccentricity: 0.0472 },
    { name: "Neptune", au: 30.07, period: 164.8, radius: 1.5, color: 0x426de0, eccentricity: 0.0086 }
];

const AU_SCALE = 18;
const planetMeshes = [];

function makeOrbitLine(radius, eccentricity) {
    const points = [];
    for (let i = 0; i <= 256; i++) {
        const a = (i / 256) * Math.PI * 2;
        const r = radius * (1 - eccentricity * eccentricity) /
            (1 + eccentricity * Math.cos(a));
        points.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
            color: 0x54708f,
            transparent: true,
            opacity: 0.38
        })
    );
    solarSystemLayer.add(line);
}

function buildSolarSystem() {
    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(5.5, 48, 32),
        new THREE.MeshStandardMaterial({
            color: 0xffc45c,
            emissive: 0xff8a18,
            emissiveIntensity: 2.2,
            roughness: 1
        })
    );
    solarSystemLayer.add(sun);

    const sunlight = new THREE.PointLight(0xffffff, 2600, 1800, 1.35);
    solarSystemLayer.add(sunlight);

    const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowMap,
        color: 0xffa52e,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }));
    sunGlow.scale.set(34, 34, 1);
    solarSystemLayer.add(sunGlow);

    solarPlanets.forEach((data, index) => {
        const orbitRadius = data.au * AU_SCALE;
        makeOrbitLine(orbitRadius, data.eccentricity);

        const pivot = new THREE.Group();
        solarSystemLayer.add(pivot);

        const planet = new THREE.Mesh(
            new THREE.SphereGeometry(data.radius, 32, 24),
            new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.88,
                metalness: 0.02
            })
        );
        planet.position.set(orbitRadius, 0, 0);
        planet.userData.planetData = data;
        pivot.add(planet);

        if (data.name === "Saturn") {
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(3.2, 5.1, 64),
                new THREE.MeshStandardMaterial({
                    color: 0xcbb98e,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.78,
                    roughness: 1
                })
            );
            ring.rotation.x = -Math.PI / 2.25;
            planet.add(ring);
        }

        planetMeshes.push({ pivot, planet, data, angle: index * 0.72 });
    });
}

buildSolarSystem();

function enterSolarSystem() {
    explorationMode = "solar";
    document.body.classList.add("solar-mode");
    universeLayer.visible = false;
    solarSystemLayer.visible = true;
    document.querySelector("#enter-system").hidden = true;
    document.querySelector("#universe-view").hidden = false;
    document.querySelector(".intro small").textContent = "PLANETARY EXPLORATION";
    document.querySelector("h1").innerHTML = "Explore the<br><em>Solar System.</em>";
    document.querySelector(".intro p").textContent =
        "Explore the Sun and eight planets. Orbital distances are compressed for visibility; displayed AU values retain their astronomical meaning.";
    document.querySelector("#galaxy-count").textContent = "08";
    document.querySelector("#star-count").textContent = "1";
    document.querySelector("#name").textContent = "Solar System";
    document.querySelector("#class").textContent = "Planetary system";
    document.querySelector("#status").textContent = "Active";
    document.querySelector("#description").textContent =
        "Eight planets orbit the Sun. The orbital paths use approximate eccentricities; planet sizes and distances are visually adjusted for exploration.";
    cameraStart.copy(camera.position);
    targetStart.copy(controls.target);
    // Elevated cinematic angle: keeps the full outer planetary orbit in view.
    cameraEnd.set(0, 1350, 1850);
    targetEnd.set(0, 0, 0);
    cameraProgress = 0;
    cameraMoving = true;
    controls.minDistance = 12;
    controls.maxDistance = 4200;
}

// --------------------------------------------------
// INFORMATION PANEL
// --------------------------------------------------

document.querySelector("#galaxy-count").textContent =
    String(galaxies.length).padStart(2, "0");

document.querySelector("#star-count").textContent =
    Math.round(totalStars / 1000) + "K";


function select(o) {

    document.querySelector("#name").textContent = o.name;
    document.querySelector("#class").textContent = o.type;
    document.querySelector("#status").textContent = "Detected";

    document.querySelector("#enter-system").hidden =
        !(o.name === "Milky Way" && explorationMode === "universe");

    document.querySelector("#description").textContent =
        `Procedural ${o.type.toLowerCase()} model with approximately ${o.stars.toLocaleString()} rendered star particles. Display radius: ${o.radius} simulation units.`;

    const destination = new THREE.Vector3(...o.position);

    const direction = new THREE.Vector3(0.3, 0.25, 1).normalize();

    cameraStart.copy(camera.position);
    targetStart.copy(controls.target);

    targetEnd.copy(destination);

    cameraEnd.copy(
        destination.clone().add(
            direction.multiplyScalar(o.radius * 3.2)
        )
    );

    cameraProgress = 0;
    cameraMoving = true;
}


// --------------------------------------------------
// GALAXY SELECTION
// --------------------------------------------------

renderer.domElement.addEventListener("click", e => {

    pointer.x = e.clientX / innerWidth * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(pickables);

    if (hits.length) {
        select(hits[0].object.userData.data);
    }

});

// --------------------------------------------------
// SIMULATION CONTROLS
// --------------------------------------------------

document.querySelector("#pause").onclick = e => {

    paused = !paused;

    e.currentTarget.textContent = paused
        ? "▶ Resume simulation"
        : "Ⅱ Pause simulation";

    document.querySelector("#status").textContent =
        paused ? "Paused" : "Active";

};


function returnToUniverse() {

    explorationMode = "universe";
    document.body.classList.remove("solar-mode");
    solarSystemLayer.visible = false;
    universeLayer.visible = true;

    document.querySelector("#enter-system").hidden = true;
    document.querySelector("#universe-view").hidden = false;
    document.querySelector(".intro small").textContent = "DEEP SPACE EXPLORATION";
    document.querySelector("h1").innerHTML = "Explore the<br><em>known universe.</em>";
    document.querySelector(".intro p").textContent =
        "A procedural 3D cosmic field containing distant galaxies, stars and nebula-like structures.";

    cameraStart.copy(camera.position);
    targetStart.copy(controls.target);
    cameraEnd.set(0, 185, 780);
    targetEnd.set(0, 0, 0);
    cameraProgress = 0;
    cameraMoving = true;

    controls.minDistance = 35;
    controls.maxDistance = 4200;

    document.querySelector("#name").textContent = "Observable Universe";
    document.querySelector("#class").textContent = "Universe model";
    document.querySelector("#status").textContent = paused ? "Paused" : "Active";
    document.querySelector("#description").textContent =
        "Explore the full simulated cosmic field containing galaxies, stars and nebula-like structures.";
}

document.querySelector("#enter-system").onclick = enterSolarSystem;

document.querySelector("#reset").onclick = returnToUniverse;

document.querySelector("#universe-view").onclick = returnToUniverse;


// --------------------------------------------------
// ANIMATION LOOP
// --------------------------------------------------

function animate() {

    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.05);

    if (cameraMoving) {

    cameraProgress += dt * 0.7;

    const t = Math.min(cameraProgress, 1);

    // Smooth easing
    const smooth = t * t * (3 - 2 * t);

    camera.position.lerpVectors(
        cameraStart,
        cameraEnd,
        smooth
    );

    controls.target.lerpVectors(
        targetStart,
        targetEnd,
        smooth
    );

    if (t >= 1) {
        cameraMoving = false;
    }
}

    if (!paused && explorationMode === "solar") {
        // Time is accelerated for visibility; relative orbital periods are preserved.
        const simulationRate = 0.12;
        planetMeshes.forEach(item => {
            item.angle += dt * simulationRate * (Math.PI * 2 / item.data.period);
            const e = item.data.eccentricity;
            const a = item.data.au * AU_SCALE;
            const r = a * (1 - e * e) / (1 + e * Math.cos(item.angle));
            item.pivot.rotation.y = 0;
            item.planet.position.set(
                Math.cos(item.angle) * r,
                0,
                Math.sin(item.angle) * r
            );
            item.planet.rotation.y += dt * 0.35;
        });
    }

    if (!paused && explorationMode === "universe") {
        rotating.forEach((g, i) => {
            g.rotation.y += dt * (i === 0 ? 0.0018 : 0.0007);
        });
    }

    controls.update();
    renderer.render(scene, camera);

}

animate();

// --------------------------------------------------
// WINDOW RESIZE
// --------------------------------------------------

addEventListener("resize", () => {

    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(innerWidth, innerHeight);

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

});

// --------------------------------------------------
// LOADING SCREEN
// --------------------------------------------------

loading.classList.add("hidden");

setTimeout(() => loading.remove(), 700);
