import * as THREE from 'three';

// Minimal ambient light — placards use MeshBasicMaterial so they
// don't respond to lights, but ambient light is needed for the scene
// background and any future lit objects.
export class Lights {
    constructor(scene) {
        const ambient = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(ambient);
    }
}