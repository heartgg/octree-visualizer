import * as THREE from 'three';
import { OrbitControls } from 'orbitcontrols';

const json = '[ { "x": 2, "y": 2, "z": 2 }, { "x": 1, "y": 1, "z": 1 }, { "x": 0, "y": 0, "z": 0 } ]';
const data = JSON.parse(json);

var cubeNum = 0;
const tolerance = .1;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.SphereGeometry(.1, 3, 2);
const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const cubes = [];

data.forEach(coord => {
    const cube = new THREE.Mesh( geometry, material );
    cube.position.add(new THREE.Vector3(1, 1, 1).randomDirection().multiplyScalar(10));
    scene.add(cube);
    cubes.push(cube);
});

camera.position.z = 5;

const controls = new OrbitControls( camera, renderer.domElement );

function animate() {

    const destination = new THREE.Vector3(data[cubeNum].x, data[cubeNum].y, data[cubeNum].z);

    if (destination.distanceTo(cubes[cubeNum].position) > tolerance) {
        requestAnimationFrame( animate );
    } else {
        cubeNum++;
        if (cubeNum + 1 <= cubes.length) requestAnimationFrame( animate );
    }

    cubes[cubeNum].position.lerp(destination, .01);

    renderer.render( scene, camera );
};

animate();