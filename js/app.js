"use strict";

import * as THREE from 'three';
import { OrbitControls } from 'orbitcontrols';
import { Octree } from './octree.js';
import { sleep, csvToArray } from './utils.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var data = [
    {x: 2, y: -2, z: 2},
    {x: -1, y: 1, z: 1},
    {x: 1, y: 1.5, z: -1},
    {x: -1.5, y: 2, z: 1},
    {x: 1.2, y: 1.3, z: -1}
];

var vectors = []
var points = [];
var octree = new Octree(0, new THREE.Vector3(0, 0, 0), 16, scene);
var pointNum = 0;
const tolerance = .01;
var manualCam = false;

document.getElementById('begin').onclick = async function(e) {
    e.preventDefault();

    const input = document.getElementById("csvFile").files[0];
    if (input) {
        await octree.removeObjects3D();
        octree = null;
        removePoints();

        const reader = new FileReader();
        
        reader.onload = function (e) {
            const text = e.target.result;
            data = csvToArray(text);

            initPoints(data);
            initOctree();
        };

        reader.readAsText(input);
    }

    manualCam = true;
    document.getElementById("overlay").style.opacity = 0;
    await sleep(300);
    document.getElementById("overlay").style.display = "none";
}

// Sets up geometry and material for a 3D point object
const geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new THREE.Vector3().toArray(), 3));
const material = new THREE.PointsMaterial( { size: 0.1 } );

// Creates a point for every destination and sets it randomly far away
initPoints(data);
initOctree();

var camera_pivot = new THREE.Object3D();
var Y_AXIS = new THREE.Vector3( 0, 1, 0 );

scene.add( camera_pivot );
camera_pivot.add( camera );
camera.position.set( 0, 15, 25 );
camera.lookAt( camera_pivot.position );

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {

    // Animate points coming in with lerp and then insert into Octree
    if (pointNum < points.length && octree) {
        const destination = vectors[pointNum];
        if (destination.distanceTo(points[pointNum].position) > tolerance) {
            points[pointNum].position.lerp(destination, .1);
        } else if (pointNum + 1 <= points.length) {
            octree.insert(vectors[pointNum]);
            pointNum++;
        }
    }

    if (!manualCam) camera_pivot.rotateOnAxis( Y_AXIS, 0.005 );
    
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
};

animate();

function initOctree() {
    octree = new Octree(0, new THREE.Vector3(0, 0, 0), 16, scene);
}

function initPoints(data) {
    data.forEach(coord => {
        vectors.push(new THREE.Vector3(coord.x, coord.y, coord.z));
    });
    for (let i = 0; i < data.length; i++) {
        const point = new THREE.Points(geometry, material);
        point.position.add(new THREE.Vector3(1, 1, 1).randomDirection().multiplyScalar(500));
        scene.add(point);
        points.push(point);
    }
}

function removePoints(data) {
    scene.remove(...points);
    vectors = [];
    points = [];
    pointNum = 0;
}