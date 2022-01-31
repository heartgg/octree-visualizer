"use strict";

import * as THREE from 'three';
import { OrbitControls } from 'orbitcontrols';

const centerMultiplier = {
    tLb: new THREE.Vector3(-1, -1, 1),
    tRb: new THREE.Vector3(-1, 1, 1),
    tLf: new THREE.Vector3(1, -1, 1),
    tRf: new THREE.Vector3(1, 1, 1),
    bLb: new THREE.Vector3(-1, -1, -1),
    bRb: new THREE.Vector3(-1, 1, -1),
    bLf: new THREE.Vector3(1, -1, -1),
    bRf: new THREE.Vector3(1, 1, -1)
}

class Octree {
    constructor (coord = 0, center = 0, size = 0) {
        this.coord = coord; // THREE.Vector3
        this.center = center; // THREE.Vector3
        this.size = size;
        this.nodes = {};

        const geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        const edges = new THREE.EdgesGeometry( geometry );
        this.cube = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
        this.cube.visible = false;
        this.cube.position.add(center);
        scene.add( this.cube );

        // if (this.coord !== 0) {
        //     for (const iterator in centerMultiplier) {
        //         this.nodes[iterator] = new Octree(0, new THREE.Vector3(this.size/4, this.size/4, this.size/4).multiply(centerMultiplier[iterator]), this.size/2);
        //     }
        // }
    }

    insert (coord) {
        if (Object.keys(this.nodes).length !== 0) {
            // code to insert into approperiate node
            const multiplier = new THREE.Vector3();
            multiplier.x = (coord.x > this.center.x ? 1 : -1);
            multiplier.y = (coord.y > this.center.y ? 1 : -1);
            multiplier.z = (coord.z > this.center.z ? 1 : -1);

            for (const iterator in centerMultiplier) {
                if (multiplier.equals(centerMultiplier[iterator])) {
                    this.nodes[iterator].insert(coord);
                    //console.log(iterator);
                }
            }
        } else if (this.coord === 0) {
            this.coord = coord;
            this.cube.visible = true;
        } else {
            console.log(this.coord);
            console.log(coord);
            this.addNodes();
            this.insert(this.coord);
            this.insert(coord);
        }
    }

    addNodes () {
        for (const iterator in centerMultiplier) {
            this.nodes[iterator] = new Octree(0, new THREE.Vector3(this.center.x, this.center.y, this.center.z).add(new THREE.Vector3(this.size/4, this.size/4, this.size/4).multiply(centerMultiplier[iterator])), this.size/2);
        }
    }
}

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

const octree = new Octree(0, new THREE.Vector3(0, 0, 0), 16);
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

// var geometry = new THREE.BoxGeometry( 5, 5, 5 );
// const edges = new THREE.EdgesGeometry( geometry );
// const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
// scene.add( line );

// var geom1 = new THREE.BoxGeometry( 2.5, 2.5, 2.5 );
// var edge = new THREE.EdgesGeometry( geom1 );
// var line1 = new THREE.LineSegments( edge, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
// line1.position.add(new THREE.Vector3(5/4, 5/4, 5/4));
// scene.add(line1);







// const topLeftBack = new THREE.Vector3(-1, -1, 1);
// const topRightBack = new THREE.Vector3(-1, 1, 1);
// const topLeftFront = new THREE.Vector3(1, -1, 1);
// const topRightFront = new THREE.Vector3(1, 1, 1);
// const bottomLeftBack = new THREE.Vector3(-1, -1, -1);
// const bottomRightBack = new THREE.Vector3(-1, 1, -1);
// const bottomLeftFront = new THREE.Vector3(1, -1, -1);
// const bottomRightFront = new THREE.Vector3(1, 1, -1);