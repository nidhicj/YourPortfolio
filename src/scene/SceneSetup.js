import * as THREE from 'three';

export class SceneSetup {
    constructor() {
        this.container = document.getElementById('app');
        
        // Error handling: Check if container exists
        if (!this.container) {
            throw new Error('Container element #app not found. Please ensure the HTML structure is correct.');
        }
        
        // Check WebGL support
        if (!this.checkWebGLSupport()) {
            this.showWebGLError();
            return;
        }

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        // No fog — all placards must be visible simultaneously in the depth stack

        // Camera — wider FOV on portrait mobile so cards actually fill the screen
        const isMobile = () => window.innerWidth < 640;
        this.camera = new THREE.PerspectiveCamera(
            isMobile() ? 75 : 60,
            window.innerWidth / window.innerHeight,
            0.1,
            200
        );
        this.camera.position.z = 0;   // FIXED — cards move toward camera, not the other way
        this.camera.position.y = 1.6; // Eye level

        // Renderer
        try {
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            // Let native touch-scroll pass through the fixed canvas on iOS/Android
            this.renderer.domElement.style.touchAction = 'pan-y';
            this.container.appendChild(this.renderer.domElement);
        } catch (error) {
            console.error('Failed to create WebGL renderer:', error);
            this.showWebGLError();
            return;
        }

        // Resize Handler
        window.addEventListener('resize', this.onResize.bind(this));
    }
    
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
    
    showWebGLError() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                padding: 2rem;
                text-align: center;
                color: #ffffff;
                background: linear-gradient(135deg, #475C7A 0%, #685D79 50%, #AB6C82 100%);
            ">
                <h1 style="font-size: 2rem; margin-bottom: 1rem;">WebGL Not Supported</h1>
                <p style="font-size: 1.1rem; margin-bottom: 1rem; opacity: 0.9;">
                    Your browser doesn't support WebGL, which is required for this portfolio.
                </p>
                <p style="font-size: 0.9rem; opacity: 0.7;">
                    Please try updating your browser or use a modern browser like Chrome, Firefox, or Safari.
                </p>
            </div>
        `;
    }

    onResize() {
        const isMobile = window.innerWidth < 640;
        this.camera.fov    = isMobile ? 75 : 60;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}