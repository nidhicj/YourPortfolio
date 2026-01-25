import Lenis from 'lenis';

export class ScrollHandler {
    constructor(camera) {
        this.camera = camera;
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        this.maxScroll = 5000; // Virtual scroll height
        document.body.style.height = `${this.maxScroll}px`;

        this.raf(0);
    }

    raf(time) {
        this.lenis.raf(time);
        requestAnimationFrame(this.raf.bind(this));
    }

    update() {
        // Map scroll position to Camera Z
        // Start at z=5, move towards negative Z
        const scrollPos = this.lenis.scroll;
        const zPosition = 5 - (scrollPos * 0.01); // Adjust speed factor
        this.camera.position.z = zPosition;
    }
}
