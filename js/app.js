import * as THREE from 'three';
import { OrbitControls } from 'orbitcontrols';

const json = '[ { "x": 2, "y": 2, "z": 2 }, { "x": 1, "y": 1, "z": 1 }, { "x": 0, "y": 0, "z": 0 } ]';
const data = JSON.parse(json);

var cubeNum = 0;
const tolerance = .1;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const dotGeometry = new THREE.BufferGeometry();
dotGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute(new THREE.Vector3().toArray(), 3));
const dotMaterial = new THREE.PointsMaterial( { size: 0.1 } );
const cubes = [];

data.forEach(coord => {
    const cube = new THREE.Points(dotGeometry, dotMaterial);
    cube.position.add(new THREE.Vector3(1, 1, 1).randomDirection().multiplyScalar(10));
    scene.add(cube);
    cubes.push(cube);
});

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {

    const destination = new THREE.Vector3(data[cubeNum].x, data[cubeNum].y, data[cubeNum].z);

    if (destination.distanceTo(cubes[cubeNum].position) > tolerance) {
        cubes[cubeNum].position.lerp(destination, .01);
    } else if (cubeNum + 1 < cubes.length) {
        cubeNum++;
    }

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
};

animate();