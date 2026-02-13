import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SceneSetup } from '../SceneSetup.js';
import { Corridor } from '../Corridor.js';
import { Door } from '../Door.js';
import { Lights } from '../Lights.js';
import { InteractionHandler } from '../interaction.js';
import { projects } from './data/projects.js';

gsap.registerPlugin(ScrollTrigger);

// Normalize project data to ensure all required fields have safe defaults
function normalizeProject(project) {
    return {
        id: project.id ?? 0,
        title: project.title ?? 'Untitled Project',
        description: project.description ?? '—',
        tags: Array.isArray(project.tags) ? project.tags : [],
        link: project.link ?? '#',
        image: project.image ?? '',
        icon: project.icon ?? null,
        date: project.date ?? null,
        role: project.role ?? null
    };
}

class PortfolioApp {
    constructor() {
        this.sceneSetup = new SceneSetup();
        this.corridor = null;
        this.doors = [];
        this.interactionHandler = null;
        this.currentScrollProgress = 0;
        this.maxDepth = -120;
        this.cameraStartZ = 8;
        this.cameraEndZ = -50; // Will be updated after doors are created
        this.hasEnteredCorridor = false; // Track if user has entered corridor
        
        this.init();
    }

    init() {
        // Set up virtual scroll height
        this.setupScroll();
        
        // Build 3D scene
        this.corridor = new Corridor(this.sceneSetup.scene);
        this.lights = new Lights(this.sceneSetup.scene);
        
        // Create doors
        this.createDoors();
        
        // Set up interactions
        this.interactionHandler = new InteractionHandler(
            this.sceneSetup.scene,
            this.sceneSetup.camera
        );
        
        // Set up UI
        this.setupUI();
        
        // Animate
        this.animate();
        
        // Handle loading
        this.handleLoading();
    }

    setupScroll() {
        // Create virtual scroll height - reduced for easier navigation
        const scrollHeight = 3000; // pixels (reduced from 8000)
        document.body.style.height = `${scrollHeight}px`;
        
        // Initial camera position at start of corridor
        // Scroll will be set after landing page is dismissed
        this.currentScrollProgress = 0;
        this.updateCameraPosition();
        
        // Prevent scrolling while landing page is visible
        // document.body.style.overflow = 'hidden';
        
        // Set up ScrollTrigger - reversed so scroll up moves forward
        ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            onUpdate: (self) => {
                // Reverse progress: 0 at bottom (start), 1 at top (end)
                // This makes scrolling up move forward into corridor
                this.currentScrollProgress = self.progress;
                this.updateCameraPosition();
                this.updateDoors();
                // Update scroll indicator with reversed progress
                this.updateScrollIndicator(this.currentScrollProgress);
                this.updateLandingTransition(this.currentScrollProgress);
            }
        });
    }

    

    updateCameraPosition() {
        // eased progress for camera motion only
        const p = this.easeInOutCubic(this.currentScrollProgress);

        // Use eased progress for forward movement
        const z = gsap.utils.interpolate(
            this.cameraStartZ,
            this.cameraEndZ,
            p
        );

        // Subtle parallax driven by eased progress
        const parallaxX = Math.sin(p * Math.PI * 2) * 0.1;
        const parallaxY = Math.cos(p * Math.PI * 2) * 0.05;

        gsap.to(this.sceneSetup.camera.position, {
            z,
            x: parallaxX,
            y: 1.6 + parallaxY,
            duration: 0.1,
            ease: 'none'
        });
    }


    createDoors() {
        // Create doors staggered on left and right walls
        const doorSpacing = 8; // Reduced from 15 for closer doors
        const doorHeight = 1.1;
        const wallWidth = 2;
        
        projects.forEach((project, index) => {
            const z = -doorSpacing * (index + 1);
            const side = index % 2 === 0 ? 'left' : 'right';
            const x = side === 'left' ? -wallWidth : wallWidth;
            
            // Normalize project data before passing to Door
            const normalizedProject = normalizeProject(project);
            
            const door = new Door(
                this.sceneSetup.scene,
                { x, y: doorHeight, z },
                side,
                normalizedProject
            );
            
            // Store visibility progress for animation
            door.visibilityProgress = 0;
            
            this.doors.push(door);
        });
        
        // Adjust camera end position to match last door
        const lastDoorZ = -doorSpacing * projects.length;
        this.cameraEndZ = lastDoorZ - 5; // Stop 5 units past last door
    }

    updateDoors() {
        // Calculate which doors should be visible/active based on camera position
        const cameraZ = this.sceneSetup.camera.position.z;
        
        this.doors.forEach((door, index) => {
            const doorZ = door.position.z;
            const distance = Math.abs(cameraZ - doorZ);
            
            // Door becomes active when camera is close (adjusted for closer doors)
            const activationDistance = 6; // Reduced from 10
            const visibilityProgress = Math.max(0, 1 - distance / activationDistance);
            door.visibilityProgress = visibilityProgress;
            
            // Highlight door when aligned (reduced distance for closer doors)
            if (distance < 3.5) { // Reduced from 5
                this.highlightDoor(door, true);
            } else {
                this.highlightDoor(door, false);
            }
        });
    }

    updateLandingTransition(progress) {
        const landing = document.getElementById('landingPage');
        const left = document.getElementById('landingLeft');
        const right = document.getElementById('landingRight');
        const vignette = document.getElementById('vignetteOverlay');

        if (!landing || !left || !right) return;

        console.log("landing progress", progress);

        const clamp01 = (v) => Math.max(0, Math.min(1, v));

        const A_END = 0.18;
        const B_END = 0.34;
        const REVEAL_START = 0.04;

        // Phase A: lateral exit
        const tA = clamp01(progress / A_END);

        const exitDistance = window.innerWidth * 1.05;
        gsap.set(left, { x: -exitDistance * tA });
        gsap.set(right, { x: exitDistance * tA });

        // Phase B: fade + blur + vignette
        const tB = clamp01((progress - REVEAL_START) / (B_END - REVEAL_START));

        const blurPx = 10;
        const scaleStart = 1;
        const scaleEnd = 0.96; // subtle, cinematic

        const scale = scaleStart - (scaleStart - scaleEnd) * tB;

        gsap.set(landing, {
        opacity: 1 - tB,
        filter: `blur(${blurPx * tB}px)`,
        transform: `scale(${scale})`
        });


        landing.style.pointerEvents = (tB > 0.98) ? 'none' : 'auto';

        if (vignette) {
            const max = 0.85;
            gsap.set(vignette, { opacity: max * tB });
        }

        const hint = document.getElementById('scrollHint');
        if (hint) gsap.set(hint, { opacity: clamp01(1 - progress / 0.08) });
    }



    highlightDoor(door, highlight) {
        if (!door.mesh) return;
        
        const material = door.mesh.material;
        
        if (highlight) {
            gsap.to(material, {
                emissiveIntensity: 0.3,
                duration: 0.3
            });
            
            // Add glow effect
            if (!door.glowMesh) {
                const glowGeometry = door.mesh.geometry.clone();
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: 0xD8737F, // Rose pink
                    transparent: true,
                    opacity: 0.3
                });
                door.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
                door.glowMesh.scale.multiplyScalar(1.1);
                door.mesh.add(door.glowMesh);
            }
            
            gsap.to(door.glowMesh.material, {
                opacity: 0.4,
                duration: 0.3
            });
        } else {
            gsap.to(material, {
                emissiveIntensity: 0,
                duration: 0.3
            });
            
            if (door.glowMesh) {
                gsap.to(door.glowMesh.material, {
                    opacity: 0,
                    duration: 0.3
                });
            }
        }
    }

    setupUI() {
        // Project modal
        const modal = document.getElementById('projectModal');
        const modalClose = document.getElementById('modalClose');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalImage = document.getElementById('modalImage');
        const modalTags = document.getElementById('modalTags');
        const modalLink = document.getElementById('modalLink');
        
        window.addEventListener('door-click', (e) => {
            // Normalize project data to ensure safe defaults
            const project = normalizeProject(e.detail);
            
            modalTitle.textContent = project.title;
            
            // Build description with role and date if available
            let descriptionHTML = project.description;
            if (project.role || project.date) {
                descriptionHTML = '';
                if (project.role) {
                    descriptionHTML += `<p class="modal-role"><strong>Role:</strong> ${project.role}</p>`;
                }
                if (project.date) {
                    descriptionHTML += `<p class="modal-date"><strong>Year:</strong> ${project.date}</p>`;
                }
                descriptionHTML += `<p class="modal-description-text">${project.description}</p>`;
            }
            modalDescription.innerHTML = descriptionHTML;
            
            // Only set background image if image path is provided
            if (project.image) {
                modalImage.style.backgroundImage = `url(${project.image})`;
            } else {
                modalImage.style.backgroundImage = 'none';
            }
            
            modalLink.href = project.link;
            
            // Handle dead links gracefully
            if (project.link === '#' || !project.link) {
                modalLink.style.pointerEvents = 'none';
                modalLink.style.opacity = '0.5';
                modalLink.textContent = 'Project Link Coming Soon';
            } else {
                modalLink.style.pointerEvents = 'auto';
                modalLink.style.opacity = '1';
                modalLink.textContent = 'View Project →';
            }
            
            modalTags.innerHTML = '';
            // tags is guaranteed to be an array from normalizeProject
            project.tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.textContent = tag;
                modalTags.appendChild(tagEl);
            });
            
            modal.classList.add('active');
        });
        
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        // Instructions overlay - Remove if exists (we have landing page now)
        const instructionsOverlay = document.getElementById('instructionsOverlay');
        if (instructionsOverlay) {
            instructionsOverlay.classList.add('hidden');
        }
        
        // Navigation home button
        // const navHome = document.getElementById('navHome');
        // if (navHome) {
        //     navHome.addEventListener('click', () => {
        //         // Hide modal if open
        //         modal.classList.remove('active');
                
        //         // Show landing page
        //         const landingPage = document.getElementById('landingPage');
        //         if (landingPage) {
        //             landingPage.classList.remove('hidden');
        //         }
                
        //         // Scroll to top
        //         window.scrollTo({
        //             top: 0,
        //             behavior: 'smooth'
        //         });
        //     });
        // }
        
        // Audio toggle (placeholder)
        const audioToggle = document.getElementById('audioToggle');
        let audioMuted = true;
        
        audioToggle.addEventListener('click', () => {
            audioMuted = !audioMuted;
            audioToggle.classList.toggle('muted', audioMuted);
            // Audio implementation would go here
        });
    }

    updateScrollIndicator(progress) {
        const scrollBar = document.querySelector('.scroll-bar');
        if (scrollBar) {
            scrollBar.style.width = `${progress * 100}%`;
        }
    }

    handleLoading() {
        const landingPage = document.getElementById('landingPage');
        const enterButton = document.getElementById('enterButton');
        
        // Show landing page initially
        if (landingPage) {
            landingPage.classList.remove('hidden');
        }
        
        // Handle enter button click (optional, kept for compatibility)
        if (enterButton) {
            enterButton.addEventListener('click', () => {
                this.enterCorridor();
            });
        }
        
        // Also allow Enter key to proceed
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && landingPage && !landingPage.classList.contains('hidden') && !this.hasEnteredCorridor) {
                this.enterCorridor();
            }
        });
        
        // Handle scroll wheel to enter corridor
        // window.addEventListener('wheel', (e) => {
        //     if (!this.hasEnteredCorridor && landingPage && !landingPage.classList.contains('hidden')) {
        //         // Only trigger on scroll down (deltaY > 0)
        //         if (e.deltaY > 10) {
        //             e.preventDefault();
        //             this.enterCorridor();
        //         }
        //     }
        // }, { passive: false });
    }

    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    
    enterCorridor() {
        // Prevent multiple calls
        if (this.hasEnteredCorridor) return;
        this.hasEnteredCorridor = true;
        
        const landingPage = document.getElementById('landingPage');
        const scrollHint = document.getElementById('scrollHint');
        
        if (landingPage) {
            // Hide scroll hint if it exists
            if (scrollHint) {
                scrollHint.classList.add('hidden');
            }
            
            // Fade out landing page
            landingPage.classList.add('hidden');
            
            // Enable scrolling
            document.body.style.overflow = '';
            
            // Wait for transition, then scroll to bottom to start corridor journey
            setTimeout(() => {
                // const scrollHeight = document.body.scrollHeight;
                // Start corridor journey at the top (no teleport)
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Ensure camera is at start position
                this.currentScrollProgress = 0;
                this.updateCameraPosition();
                
                // Force ScrollTrigger refresh after scroll
                setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 100);
            }, 800);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update interaction handler
        if (this.interactionHandler) {
            this.interactionHandler.update();
        }
        
        // Update lights based on camera position
        if (this.lights) {
            this.lights.updateIntensity(this.sceneSetup.camera.position.z);
        }
        
        // Render scene
        this.sceneSetup.render();
    }

}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            new PortfolioApp();
        } catch (error) {
            console.error('Failed to initialize portfolio app:', error);
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = `
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
                        <h1 style="font-size: 2rem; margin-bottom: 1rem;">Initialization Error</h1>
                        <p style="font-size: 1.1rem; opacity: 0.9;">Failed to load portfolio. Please refresh the page.</p>
                    </div>
                `;
            }
        }
    });
} else {
    try {
        new PortfolioApp();
    } catch (error) {
        console.error('Failed to initialize portfolio app:', error);
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
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
                    <h1 style="font-size: 2rem; margin-bottom: 1rem;">Initialization Error</h1>
                    <p style="font-size: 1.1rem; opacity: 0.9;">Failed to load portfolio. Please refresh the page.</p>
                </div>
            `;
        }
    }
}

