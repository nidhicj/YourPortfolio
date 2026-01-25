import * as THREE from 'three';

export class Corridor {
    constructor(scene) {
        this.scene = scene;
        this.length = 80; // Reduced length to match closer door spacing
        this.width = 4;
        this.height = 3;
        this.init();
    }

    init() {
        // Create procedural textures for better visual quality
        const floorTexture = this.createFloorTexture();
        const wallTexture = this.createWallTexture();

        // Floor with perspective grid pattern
        const floorGeometry = new THREE.PlaneGeometry(this.width, this.length, 20, 50);
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTexture,
            color: 0x475C7A, // Blue-gray
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.z = -this.length / 2 + 5;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(this.width, this.length, 20, 50);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: 0x475C7A, // Blue-gray (darker variation)
            roughness: 0.9
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = this.height;
        ceiling.position.z = -this.length / 2 + 5;
        this.scene.add(ceiling);

        // Walls with perspective
        const wallSegments = 30;
        const wallGeometry = new THREE.PlaneGeometry(this.length, this.height, wallSegments, 4);
        
        // Left Wall
        const leftWallMaterial = new THREE.MeshStandardMaterial({
            map: wallTexture,
            color: 0x685D79, // Muted purple
            roughness: 0.5,
            metalness: 0.1
        });
        const leftWall = new THREE.Mesh(wallGeometry, leftWallMaterial);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.x = -this.width / 2;
        leftWall.position.y = this.height / 2;
        leftWall.position.z = -this.length / 2 + 5;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);

        // Right Wall
        const rightWallMaterial = new THREE.MeshStandardMaterial({
            map: wallTexture,
            color: 0x685D79, // Muted purple
            roughness: 0.5,
            metalness: 0.1
        });
        const rightWall = new THREE.Mesh(wallGeometry, rightWallMaterial);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.x = this.width / 2;
        rightWall.position.y = this.height / 2;
        rightWall.position.z = -this.length / 2 + 5;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);

        // Add subtle wall panels/strips for depth perception
        this.addWallDetails(leftWall, 'left');
        this.addWallDetails(rightWall, 'right');
    }

    createFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Create perspective grid with new palette
        ctx.fillStyle = '#475C7A'; // Blue-gray
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(252, 187, 109, 0.2)'; // Warm peach
        ctx.lineWidth = 1;

        // Horizontal lines (perspective)
        for (let i = 0; i < 20; i++) {
            const y = (i / 20) * canvas.height;
            const width = canvas.width * (0.3 + (i / 20) * 0.7);
            const x = (canvas.width - width) / 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
            ctx.stroke();
        }

        // Vertical center line
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 3);
        return texture;
    }

    createWallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#685D79'; // Muted purple
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add subtle panel details
        ctx.strokeStyle = 'rgba(252, 187, 109, 0.1)'; // Warm peach
        ctx.lineWidth = 1;

        for (let i = 0; i < 30; i++) {
            const x = (i / 30) * canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 1);
        return texture;
    }

    addWallDetails(wall, side) {
        // Add subtle vertical strips for depth
        const stripGeometry = new THREE.PlaneGeometry(0.05, this.height);
        const stripMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            emissive: 0x000000,
            emissiveIntensity: 0
        });

        for (let i = 0; i < 5; i++) {
            const strip = new THREE.Mesh(stripGeometry, stripMaterial);
            const z = -this.length / 2 + 5 + (i * this.length / 5);
            strip.position.z = z - this.length / 2 + 5;
            strip.position.y = 0;
            
            if (side === 'left') {
                strip.position.x = -0.02;
                strip.rotation.y = Math.PI / 2;
            } else {
                strip.position.x = 0.02;
                strip.rotation.y = -Math.PI / 2;
            }
            
            wall.add(strip);
        }
    }
}
