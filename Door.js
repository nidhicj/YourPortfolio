import * as THREE from 'three';
import gsap from 'gsap';

export class Door {
    constructor(scene, position, side, projectData) {
        this.scene = scene;
        this.position = position; // { x, y, z }
        this.side = side; // 'left' or 'right'
        this.projectData = projectData;
        this.mesh = null;
        this.isOpen = false;
        this.doorGroup = null;

        this.init();
    }

    init() {
        const width = 1.2;
        const height = 2.2;
        const depth = 0.08;

        // Create door group for easier manipulation
        this.doorGroup = new THREE.Group();
        this.doorGroup.position.set(this.position.x, this.position.y, this.position.z);

        // Main door panel
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: 0x685D79, // Muted purple
            metalness: 0.6,
            roughness: 0.3,
            emissive: 0x000000,
            emissiveIntensity: 0
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.doorGroup.add(this.mesh);

        // Door frame with accent color
        const frameWidth = width + 0.05;
        const frameHeight = height + 0.05;
        const frameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, depth + 0.01);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xD8737F, // Rose pink
            emissive: 0xD8737F,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.5
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = -depth / 2;
        this.doorGroup.add(frame);

        // Create door panel texture with project info (async)
        this.createDoorTexture().then((doorTexture) => {
            // Make panel match door size better with only small margin
            const panelGeometry = new THREE.PlaneGeometry(width - 0.05, height - 0.1);
            const panelMaterial = new THREE.MeshStandardMaterial({
                map: doorTexture,
                emissive: 0x000000,
                emissiveIntensity: 0
            });
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panel.position.z = depth / 2 + 0.01;
            this.doorGroup.add(panel);
        }).catch((error) => {
            // Log error but continue with fallback
            if (error.message) {
                // Only log if there's a meaningful error message
            }
            // Create fallback texture without icon
            const doorTexture = this.createFallbackTexture();
            const panelGeometry = new THREE.PlaneGeometry(width - 0.05, height - 0.1);
            const panelMaterial = new THREE.MeshStandardMaterial({
                map: doorTexture,
                emissive: 0x000000,
                emissiveIntensity: 0
            });
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panel.position.z = depth / 2 + 0.01;
            this.doorGroup.add(panel);
        });

        // Create project name label outside the door (above it)
        this.createNameLabel();

        // Angle the entire door group 45 degrees towards the viewer
        const angle = Math.PI / 4; // 45 degrees
        if (this.side === 'left') {
            this.doorGroup.rotation.y = angle;
        } else {
            this.doorGroup.rotation.y = -angle;
        }

        // Store reference for raycasting
        this.mesh.userData = { isDoor: true, door: this };
        this.doorGroup.userData = { isDoor: true, door: this };

        this.scene.add(this.doorGroup);
    }

    createNameLabel() {
        // Create canvas texture for project name
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size - long and thin for the edge
        // Door depth is 0.08. We want high res text.
        // Let's say 100px width corresponds to 0.08m depth.
        // Then height corresponds to door height (2.2m).
        // Ratio: 2.2 / 0.08 = 27.5.
        // If width is 100, height should be 2750.

        const resolution = 200; // pixels per unit approx
        const canvasWidth = 128; // Slightly wider than needed to avoid clipping
        // Match aspect ratio of geometry (0.08 x 2.0 = 1:25)
        // 128 * 25 = 3200
        const canvasHeight = 3200;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Background - Dark to match the reference
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add a colored strip on the side like in the reference
        // For right door, strip should be on the other side?
        // Let's keep it simple for now, strip at bottom of text (left of canvas)
        ctx.fillStyle = '#D8737F'; // Rose pink accent
        ctx.fillRect(0, 0, 10, canvas.height);

        // Text configuration
        const fontSize = 80;
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glow effect
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 10;

        // Rotate context to draw vertical text
        // We want text to read from top to bottom
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(this.projectData.title || 'Untitled Project', 0, 0);
        ctx.restore();

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace; // Ensure correct color space

        // Create mesh
        // The label should cover the side edge of the door
        // Door dimensions: width=1.2, height=2.2, depth=0.08
        const geometry = new THREE.PlaneGeometry(0.08, 2.0); // Slightly shorter than full height

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            emissive: 0xffffff,
            emissiveMap: texture,
            emissiveIntensity: 0.2,
            roughness: 0.4,
            metalness: 0.6,
            side: THREE.DoubleSide // Visible from both sides if needed, though mostly one
        });

        const labelMesh = new THREE.Mesh(geometry, material);

        // Position on the edge
        // Left door: Right edge (x = +width/2)
        // Right door: Left edge (x = -width/2)
        const doorWidth = 1.2;
        const xOffset = this.side === 'left' ? doorWidth / 2 + 0.001 : -doorWidth / 2 - 0.001;

        labelMesh.position.set(xOffset, 0, 0);

        // Rotate to face outward
        // Side faces are in YZ plane. Normal is X.
        // PlaneGeometry is in XY plane. Normal is Z.
        // Rotate Y 90 deg -> Normal X.
        // For right door (negative X side), we want normal to be -X, so rotate -90 deg.
        labelMesh.rotation.y = this.side === 'left' ? Math.PI / 2 : -Math.PI / 2;

        // Add to door mesh so it moves with the door
        this.mesh.add(labelMesh);
        this.nameLabel = labelMesh;
    }

    async createDoorTexture() {
        // Match canvas aspect ratio to door panel (width:height ≈ 1.15:2.2 ≈ 0.52)
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 900; // Taller canvas to match door proportions better
        const ctx = canvas.getContext('2d');

        // Background with new color palette (darker for better text contrast)
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#475C7A'); // Blue-gray
        gradient.addColorStop(1, '#685D79'); // Muted purple
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load and draw icon if available
        let iconImage = null;
        if (this.projectData.icon) {
            try {
                iconImage = await this.loadImage(this.projectData.icon);
            } catch (error) {
                // Silently continue without icon - door will still display correctly
                iconImage = null;
            }
        }

        // Draw icon in center area if available
        if (iconImage) {
            const iconSize = 180; // Larger icon since no title on door
            const iconX = (canvas.width - iconSize) / 2;
            const iconY = (canvas.height - iconSize) / 2 - 50; // Center icon vertically
            ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);
        }

        // Project name is now displayed outside door, so only show decorative elements on door
        // Add subtle decorative frame
        ctx.strokeStyle = 'rgba(252, 187, 109, 0.4)'; // Warm peach border
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Add project number at bottom with more padding
        ctx.fillStyle = '#FCBB6D'; // Warm peach
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`#${this.projectData.id ?? 0}`, canvas.width / 2, canvas.height - 40);

        const texture = new THREE.CanvasTexture(canvas);
        texture.flipY = false; // Ensure correct orientation
        return texture;
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => {
                // If icon fails, continue without it
                // Silently fail - icon is optional
                resolve(null);
            };
            img.src = src;
        });
    }

    createFallbackTexture() {
        // Fallback texture without icon
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 900;
        const ctx = canvas.getContext('2d');

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#475C7A');
        gradient.addColorStop(1, '#685D79');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Project name is displayed outside door, so only decorative elements on door
        // Add subtle decorative frame
        ctx.strokeStyle = 'rgba(252, 187, 109, 0.4)';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Project number
        ctx.fillStyle = '#FCBB6D';
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`#${this.projectData.id ?? 0}`, canvas.width / 2, canvas.height - 40);

        const texture = new THREE.CanvasTexture(canvas);
        texture.flipY = false;
        return texture;
    }

    onHover(isHovering) {
        if (!this.doorGroup) return;

        gsap.to(this.doorGroup.scale, {
            x: isHovering ? 1.08 : 1,
            y: isHovering ? 1.08 : 1,
            z: isHovering ? 1.08 : 1,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Slight rotation on hover
        const baseAngle = this.side === 'left' ? Math.PI / 4 : -Math.PI / 4;
        gsap.to(this.doorGroup.rotation, {
            y: isHovering ? baseAngle + 0.05 : baseAngle,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Increase emissive glow
        const materials = this.doorGroup.children.map(child => child.material).filter(Boolean);
        materials.forEach(material => {
            if (material.emissive) {
                gsap.to(material, {
                    emissiveIntensity: isHovering ? 0.6 : (material === this.mesh.material ? 0 : 0.3),
                    duration: 0.3
                });
            }
        });
    }

    onClick() {
        // Animate door opening like a real door (rotating around edge)
        if (this.doorGroup && !this.isOpen) {
            this.isOpen = true;
            const baseAngle = this.side === 'left' ? Math.PI / 4 : -Math.PI / 4;

            // Create door interior/backdrop when opening
            if (!this.doorInterior) {
                this.createDoorInterior();
            }

            // Animate door panel rotation around its edge
            // Left doors rotate to reveal interior, right doors rotate opposite
            const openRotation = this.side === 'left' ? Math.PI / 2 : -Math.PI / 2;

            gsap.to(this.mesh.rotation, {
                y: this.mesh.rotation.y + openRotation,
                duration: 0.8,
                ease: 'power2.inOut'
            });

            gsap.to(this.doorGroup.rotation, {
                y: baseAngle,
                duration: 0.8,
                ease: 'power2.inOut',
                onComplete: () => {
                    // Show interior when fully open
                    if (this.doorInterior) {
                        this.doorInterior.visible = true;
                        gsap.to(this.doorInterior.material, {
                            opacity: 0.9,
                            duration: 0.5
                        });
                    }
                }
            });
        } else if (this.isOpen) {
            // Close door
            this.closeDoor();
        }

        // Trigger global event
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('door-click', { detail: this.projectData }));
        }, 400);
    }

    closeDoor() {
        if (!this.doorGroup || !this.isOpen) return;

        this.isOpen = false;
        const baseAngle = this.side === 'left' ? Math.PI / 4 : -Math.PI / 4;
        const openRotation = this.side === 'left' ? Math.PI / 2 : -Math.PI / 2;

        // Hide interior first
        if (this.doorInterior) {
            gsap.to(this.doorInterior.material, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    this.doorInterior.visible = false;
                }
            });
        }

        // Close door panel
        gsap.to(this.mesh.rotation, {
            y: this.mesh.rotation.y - openRotation,
            duration: 0.8,
            ease: 'power2.inOut'
        });
    }

    createDoorInterior() {
        // Create a simple interior space visible when door opens (inspired by school corridor)
        const interiorGeometry = new THREE.PlaneGeometry(2, 2.5);
        const interiorMaterial = new THREE.MeshStandardMaterial({
            color: 0xAB6C82, // Dusty rose
            emissive: 0xFCBB6D, // Warm peach glow
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0
        });

        this.doorInterior = new THREE.Mesh(interiorGeometry, interiorMaterial);

        // Position interior behind door (slightly inside)
        const offsetX = this.side === 'left' ? -0.3 : 0.3;
        this.doorInterior.position.set(offsetX, 0, -0.1);
        this.doorInterior.rotation.y = this.side === 'left' ? -Math.PI / 2 : Math.PI / 2;
        this.doorInterior.visible = false;

        this.doorGroup.add(this.doorInterior);
    }
}
