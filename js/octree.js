import * as THREE from 'three';

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

export class Octree {
    constructor (coord = 0, center = 0, size = 0, scene) {
        this.coord = coord; // THREE.Vector3
        this.center = center; // THREE.Vector3
        this.size = size;
        this.nodes = {};
        this.scene = scene;

        const geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        const edges = new THREE.EdgesGeometry(geometry);
        this.cube = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ));
        this.cube.visible = false;
        this.cube.position.add(center);
        this.scene.add(this.cube);
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
                }
            }
        } else if (this.coord === 0) {
            this.coord = coord;
            this.cube.visible = true;
        } else {
            this.addNodes();
            this.insert(this.coord);
            this.insert(coord);
        }
    }

    addNodes () {
        for (const iterator in centerMultiplier) {
            this.nodes[iterator] = new Octree(0, new THREE.Vector3(this.center.x, this.center.y, this.center.z).add(new THREE.Vector3(this.size/4, this.size/4, this.size/4).multiply(centerMultiplier[iterator])), this.size/2, this.scene);
        }
    }
}