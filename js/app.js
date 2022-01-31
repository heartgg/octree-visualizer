"use strict";

import * as THREE from 'three';
import { OrbitControls } from 'orbitcontrols';
import { Octree } from './octree.js';

const data = [
    {x: 2, y: -2, z: 2},
    {x: -1, y: 1, z: 1},
    {x: 1, y: 1.5, z: -1},
    {x: -1.5, y: 2, z: 1},
    {x: 1.2, y: 1.3, z: -1}
];
const vectors = []

data.forEach(coord => {
    vectors.push(new THREE.Vector3(coord.x, coord.y, coord.z));
});

var pointNum = 0;
const tolerance = .01;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets up geometry and material for a 3D point object
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(new THREE.Vector3().toArray(), 3));
const material = new THREE.PointsMaterial( { size: 0.1 } );
const points = [];

// Creates a point for every destination and sets it randomly far away
for (let i = 0; i < data.length; i++) {
    const point = new THREE.Points(geometry, material);
    point.position.add(new THREE.Vector3(1, 1, 1).randomDirection().multiplyScalar(500));
    scene.add(point);
    points.push(point);
}

camera.position.z = 20;

const controls = new OrbitControls(camera, renderer.domElement);

const octree = new Octree(0, new THREE.Vector3(0, 0, 0), 16, scene);

function animate() {

    // Animate points coming in with lerp and then insert into Octree
    if (pointNum < points.length) {
        const destination = vectors[pointNum];
        if (destination.distanceTo(points[pointNum].position) > tolerance) {
            points[pointNum].position.lerp(destination, .1);
        } else if (pointNum + 1 <= points.length) {
            octree.insert(vectors[pointNum]);
            pointNum++;
        }
    }
    
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
};

animate();