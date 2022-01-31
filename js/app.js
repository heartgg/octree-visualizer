"use strict";

import * as THREE from 'three';
import { OrbitControls } from 'orbitcontrols';
import { Octree } from './octree.js';

const json = '[ { "x": 2, "y": -2, "z": 2 }, { "x": -1, "y": 1, "z": 1 }, { "x": 1, "y": 1.5, "z": -1 }, { "x": 1.2, "y": 1.3, "z": -1 } ]';
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

var cubeNum = 0;
const tolerance = .01;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const dotGeometry = new THREE.BufferGeometry();
dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new THREE.Vector3().toArray(), 3));
const dotMaterial = new THREE.PointsMaterial( { size: 0.1 } );
const cubes = [];

data.forEach(coord => {
    const cube = new THREE.Points(dotGeometry, dotMaterial);
    cube.position.add(new THREE.Vector3(1, 1, 1).randomDirection().multiplyScalar(10));
    scene.add(cube);
    cubes.push(cube);
});

camera.position.z = 20;

const controls = new OrbitControls(camera, renderer.domElement);

const octree = new Octree(0, new THREE.Vector3(0, 0, 0), 16, scene);
octree.insert(vectors[0]);
octree.insert(vectors[1]);
octree.insert(vectors[2]);
octree.insert(vectors[3]);
octree.insert(vectors[4]);

function animate() {

    const destination = vectors[cubeNum];

    if (destination.distanceTo(cubes[cubeNum].position) > tolerance) {
        cubes[cubeNum].position.lerp(destination, .1);
    } else if (cubeNum + 1 < cubes.length) {
        cubeNum++;
    }

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
};

animate();