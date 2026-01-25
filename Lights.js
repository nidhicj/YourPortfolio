import * as THREE from 'three';

export class Lights {
    constructor(scene) {
        this.scene = scene;
        this.spotlights = [];
        this.init();
    }

    init() {
        // Ambient Light (Low base visibility)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
        this.scene.add(ambientLight);

        // Main Directional Light (Warm lighting from behind)
        const dirLight = new THREE.DirectionalLight(0xFCBB6D, 0.5); // Warm peach
        dirLight.position.set(0, 8, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 150;
        dirLight.shadow.camera.left = -10;
        dirLight.shadow.camera.right = 10;
        dirLight.shadow.camera.top = 10;
        dirLight.shadow.camera.bottom = -10;
        dirLight.shadow.bias = -0.0001;
        this.scene.add(dirLight);

        // Fill Light from front (soft cool tone)
        const fillLight = new THREE.DirectionalLight(0x475C7A, 0.2); // Blue-gray
        fillLight.position.set(0, 5, -10);
        this.scene.add(fillLight);

        // Spotlights along the corridor for cinematic effect
        // Alternating on left and right with warm tones
        for (let z = 5; z > -150; z -= 12) {
            const side = (z % 24 === 5) ? -1 : 1; // Alternate sides
            const intensity = 1.5 + Math.random() * 0.5;
            // Alternate between warm peach and rose pink
            const lightColor = (z % 24 === 5) ? 0xFCBB6D : 0xD8737F;
            const spotLight = new THREE.SpotLight(
                lightColor,
                intensity,
                20,
                Math.PI / 5,
                0.4,
                1
            );
            spotLight.position.set(side * 1.5, 2.8, z);
            spotLight.target.position.set(0, 0, z);
            spotLight.castShadow = true;
            spotLight.shadow.mapSize.width = 1024;
            spotLight.shadow.mapSize.height = 1024;
            this.scene.add(spotLight);
            this.scene.add(spotLight.target);
            this.spotlights.push(spotLight);
        }

        // Subtle rim lights on walls
        const rimLightLeft = new THREE.DirectionalLight(0xAB6C82, 0.15); // Dusty rose
        rimLightLeft.position.set(-3, 2, 0);
        this.scene.add(rimLightLeft);

        const rimLightRight = new THREE.DirectionalLight(0xAB6C82, 0.15); // Dusty rose
        rimLightRight.position.set(3, 2, 0);
        this.scene.add(rimLightRight);
    }

    updateIntensity(cameraZ) {
        // Adjust spotlight intensity based on camera position
        this.spotlights.forEach((light, index) => {
            const lightZ = light.position.z;
            const distance = Math.abs(cameraZ - lightZ);
            const intensity = Math.max(0.3, 2 - distance / 10);
            light.intensity = intensity;
        });
    }
}
