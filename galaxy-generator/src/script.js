import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy Generation
 */
const params = {
    count: 100_000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.02,
    randomnessPower: 3,
    insideColour: "#ff6903",
    outsideColour: "#ff6903",
};

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
    if (geometry) geometry.dispose();
    if (material) material.dispose();
    if (points) scene.remove(points);

    geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(params.count * 3);
    const colours = new Float32Array(params.count * 3);

    const colourInside = new THREE.Color(params.insideColour);
    const colourOutside = new THREE.Color(params.outsideColour);

    for (let i = 0; i < params.count; i++) {
        const i3 = i * 3;

        // Positions
        const radius = Math.random() * params.radius;
        const spinAngle = radius * params.spin;
        const branchAngle =
            ((i % params.branches) / params.branches) * Math.PI * 2;

        const randomX =
            (Math.random() - 0.5) *
            Math.random() ** params.randomnessPower *
            params.randomness *
            2;
        const randomY =
            (Math.random() - 0.5) *
            Math.random() ** params.randomnessPower *
            params.randomness *
            2;
        const randomZ =
            (Math.random() - 0.5) *
            Math.random() ** params.randomnessPower *
            params.randomness *
            2;

        positions[i3 + 0] =
            Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] =
            Math.sin(branchAngle + spinAngle) * radius + randomZ;

        // Colour
        const mixedColour = colourInside.clone();
        mixedColour.lerp(colourOutside, radius / params.radius);
        colours[i3 + 0] = mixedColour.r;
        colours[i3 + 1] = mixedColour.g;
        colours[i3 + 2] = mixedColour.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));

    /**
     * Material
     */
    material = new THREE.PointsMaterial({
        size: params.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });

    /**
     * Points
     */
    points = new THREE.Points(geometry, material);
    scene.add(points);
};

generateGalaxy();

gui.add(params, "count")
    .min(100)
    .max(1_000_000)
    .step(100)
    .onFinishChange(generateGalaxy);
gui.add(params, "size")
    .min(0.001)
    .max(0.1)
    .step(0.001)
    .onFinishChange(generateGalaxy);
gui.add(params, "radius")
    .min(0.01)
    .max(20)
    .step(0.01)
    .onFinishChange(generateGalaxy);
gui.add(params, "branches")
    .min(2)
    .max(20)
    .step(1)
    .onFinishChange(generateGalaxy);
gui.add(params, "spin")
    .min(-5)
    .max(5)
    .step(0.001)
    .onFinishChange(generateGalaxy);
gui.add(params, "randomness")
    .min(0)
    .max(2)
    .step(0.01)
    .onFinishChange(generateGalaxy);
gui.add(params, "randomnessPower")
    .min(1)
    .max(10)
    .step(0.01)
    .onFinishChange(generateGalaxy);
gui.addColor(params, "insideColour").onFinishChange(generateGalaxy);
gui.addColor(params, "outsideColour").onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100,
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
