import * as THREE from 'three';

export class InteractionHandler {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredDoor = null;

        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('click', this.onClick.bind(this));
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onClick(event) {
        // Only handle clicks if a door is hovered AND click is not on UI elements
        const target = event.target;
        const isUIClick = target.closest('.modal') || 
                         target.closest('button') || 
                         target.closest('a') ||
                         target.closest('#landingPage');
        
        if (this.hoveredDoor && !isUIClick) {
            event.preventDefault();
            event.stopPropagation();
            this.hoveredDoor.onClick();
        }
    }

    update() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Find intersections with doors
        // We need to traverse to find meshes with userData.isDoor
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        let foundDoor = null;

        for (const intersect of intersects) {
            // Check if the object or its parent is a door
            let obj = intersect.object;
            while (obj) {
                if (obj.userData && obj.userData.isDoor) {
                    foundDoor = obj.userData.door;
                    break;
                }
                obj = obj.parent;
            }
            if (foundDoor) break;
        }

        if (foundDoor !== this.hoveredDoor) {
            if (this.hoveredDoor) this.hoveredDoor.onHover(false);
            this.hoveredDoor = foundDoor;
            if (this.hoveredDoor) this.hoveredDoor.onHover(true);
        }
    }
}
