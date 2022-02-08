"use strict";

import * as THREE from 'three';
import { OrbitControls } from 'orbitcontrols';
import { Octree } from './octree.js';
import { sleep, csvToArray, max } from './utils.js';

// Sample data for an octree when users first see the website
var data = [
    {x: 2, y: -2, z: 2},
    {x: -1, y: 1, z: 1},
    {x: 1, y: 1.5, z: -1},
    {x: -1.5, y: 2, z: 1},
    {x: 1.2, y: 1.3, z: -1}
];

// SceneController singleton to avoid global variables where possible
// Controls most threejs camera and rendering
const SceneController = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    camera_pivot: new THREE.Object3D(),
    renderer: new THREE.WebGLRenderer(),
    controls: null,
    manualCam: false,
    manualAnim: false,
    
    // Sets up the rendering and camera for the scene
    setup: function () {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.scene.add(this.camera_pivot);
        this.camera_pivot.add(this.camera);
        this.positionCamera(0, 7 + max(data) * 2, 10 + max(data) * 2);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    },
    // Function to position camera in case of different coordinate data
    positionCamera: function (x, y, z) {
        this.camera.position.set(x, y, z);
        this.camera.lookAt(this.camera_pivot.position);
    },
    // Called every animation frame if manual cam is off
    rotateCamera: function (angle) {
        this.camera_pivot.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle);
    },
    manualCamera: function (bool) {
        this.manualCam = bool;
    },
    manualAnimation: function (bool) {
        this.manualAnim = bool;
    }
}

// OctreeController singleton to avoid global variables where possible
// Controls the octree and threejs objects
const OctreeController = {
    octree: undefined,
    cubeIds: {},
    vectors: [],
    points: [],
    pointSpawns: [],
    iteration: 0,
    animating: 0,
    pointGeometry: new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new THREE.Vector3().toArray(), 3)),
    pointMaterial: new THREE.PointsMaterial({ size: 0.1, color: new THREE.Color(0x34c9eb) }),

    // Initializes a new octree (and deletes the previous one if found)
    initOctree: async function (scene, data) {
        if (this.octree != undefined) await this.deleteOctree();
        this.octree = new Octree(0, new THREE.Vector3(0, 0, 0), max(data) * 2 + 3, scene);
        for (let i = 0; i < this.vectors.length; i++) {
            this.octree.insert(this.vectors[i], this.cubeIds[i]);
        }
    },
    // Maps passed coordinate data to the vectors array
    processData: function (data) {
        this.iteration = 0;
        this.vectors = [];
        data.forEach(coord => {
            if (isNaN(coord.x) || isNaN(coord.y) || isNaN(coord.z)) return;
            this.vectors.push(new THREE.Vector3(coord.x, coord.y, coord.z));
        });
    },
    // Initializes new set of point objects (and deletes the previous ones if found)
    initPoints: function (scene) {
        if (this.points.length != 0) this.deletePoints(scene);
        for (let i = 0; i < this.vectors.length; i++) {
            const point = new THREE.Points(this.pointGeometry, this.pointMaterial);
            this.pointSpawns.push(new THREE.Vector3(1, 1, 1).randomDirection().multiplyScalar(500))
            point.position.add(this.pointSpawns[i]);
            scene.add(point);
            this.points.push(point);
            this.cubeIds[i] = [];
        }
    },
    deletePoints: function (scene) {
        scene.remove(...this.points);
        this.pointSpawns = [];
        this.points = [];
    },
    deleteOctree: async function () {
        await this.octree.removeObjects3D();
        this.octree = undefined;
    },
    animateForward: function () {
        if (this.octree != undefined && this.iteration < this.points.length) {
            if (this.vectors[this.iteration].distanceTo(this.points[this.iteration].position) > .01) {
                this.points[this.iteration].position.lerp(this.vectors[this.iteration], .1);
            } else if (this.iteration + 1 <= this.points.length) {
                for (let i = 0; i < this.cubeIds[this.iteration].length; i++) {
                    SceneController.scene.getObjectById(OctreeController.cubeIds[OctreeController.iteration][i]).visible = true;
                }
                this.iteration++;
                this.setAnimating(0);
            }
        }
    },
    animateBackward: function () {
        if (this.octree != undefined && this.iteration >= 0) {
            if (this.points[this.iteration].position.distanceTo(this.pointSpawns[this.iteration]) > 100) {
                const currPos = new THREE.Vector3(this.points[this.iteration].position.x, this.points[this.iteration].position.y, this.points[this.iteration].position.z);
                this.points[this.iteration].position.add(currPos.sub(this.vectors[this.iteration]).multiplyScalar(0.1));
            } else if (this.iteration >= 0) {
                this.setAnimating(0);
            }
        }
    },
    setAnimating: function (state) {
        this.animating = state;
    }
}

// Initial setup from sample data
SceneController.setup();
OctreeController.processData(data);
OctreeController.initPoints(SceneController.scene);
OctreeController.initOctree(SceneController.scene, data);

// Event when the begin button is clicked
document.getElementById('begin').onclick = async function(e) {
    e.preventDefault();

    const input = document.getElementById("csvFile").files[0];
    if (input) {
        const reader = new FileReader();
        
        reader.onload = function (e) {
            const text = e.target.result;
            data = csvToArray(text);

            // If CSV data is provided, basically reset the whole scene
            OctreeController.processData(data);
            OctreeController.initPoints(SceneController.scene);
            OctreeController.initOctree(SceneController.scene, data);
            SceneController.positionCamera(0, 7 + max(data) * 2, 10 + max(data) * 2);
        };

        reader.readAsText(input);
    }

    // Hide overlay and stop cam rotation
    document.getElementById("overlay").style.opacity = 0;
    document.getElementById("controls").style.opacity = 1;
    await sleep(300);
    document.getElementById("overlay").style.display = "none";
    document.getElementById("controls").style.display = "block";
}

function animate() {
    if (OctreeController.animating === 1) OctreeController.animateForward();
    if (OctreeController.animating === -1) OctreeController.animateBackward();
    if (!SceneController.manualAnim) OctreeController.setAnimating(1);
    if (!SceneController.manualCam) SceneController.rotateCamera(0.005);
    SceneController.renderer.render(SceneController.scene, SceneController.camera);
    requestAnimationFrame(animate);
};

animate();

// When the left arrow button is clicked
document.getElementById('lbtn').onclick = function (e) {
    SceneController.manualAnimation(true);
    if (OctreeController.animating != 0) return;
    if (OctreeController.iteration != 0) OctreeController.iteration--;
    OctreeController.setAnimating(-1);
    // Make octree cubes invisible for that iteration
    for (let i = 0; i < OctreeController.cubeIds[OctreeController.iteration].length; i++) {
        SceneController.scene.getObjectById(OctreeController.cubeIds[OctreeController.iteration][i]).visible = false;
    }
}

// When the right button arrow is clicked
document.getElementById('rbtn').onclick = function (e) {
    SceneController.manualAnimation(true);
    if (OctreeController.animating != 0) return;
    if (OctreeController.iteration == OctreeController.points.length) return;
    OctreeController.setAnimating(1);
}

// When the two rotation arrow button is clicked
document.getElementById('camrot').onclick = function (e) {
    SceneController.manualCamera(!SceneController.manualCam);
}

// When the single rotation arrow is clicked
document.getElementById('auto').onclick = function (e) {
    SceneController.manualAnimation(false);
}