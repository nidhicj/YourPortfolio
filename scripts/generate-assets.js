// Script to generate placeholder textures and assets
// Run with: node scripts/generate-assets.js

import { writeFileSync } from 'fs';
import { createCanvas } from 'canvas';

// Note: This requires the 'canvas' npm package
// Install with: npm install canvas

const canvas = require('canvas').createCanvas;

function generateProjectImage(id, width = 800, height = 600) {
    const canv = createCanvas(width, height);
    const ctx = canv.getContext('2d');

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    const colors = [
        ['#1a0033', '#330066'],
        ['#003366', '#006699'],
        ['#660033', '#990066'],
        ['#336600', '#669900'],
        ['#663300', '#996600'],
        ['#330066', '#6600cc']
    ];
    
    const [color1, color2] = colors[id % colors.length];
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add project number
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Project ${id}`, width / 2, height / 2);

    // Add grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    return canv.toBuffer('image/jpeg');
}

function generateDoorIcon(id, size = 256) {
    const canv = createCanvas(size, size);
    const ctx = canv.getContext('2d');

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, size, size);

    // Icon border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, size - 40, size - 40);

    // Project number
    ctx.fillStyle = '#00ff88';
    ctx.font = `bold ${size / 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(id.toString(), size / 2, size / 2);

    return canv.toBuffer('image/png');
}

// Generate assets
for (let i = 1; i <= 6; i++) {
    try {
        const projectImage = generateProjectImage(i);
        writeFileSync(`./assets/textures/project-${i}.jpg`, projectImage);
        console.log(`Generated project-${i}.jpg`);

        const doorIcon = generateDoorIcon(i);
        writeFileSync(`./assets/door-icons/project-${i}.svg`, doorIcon);
        console.log(`Generated project-${i}.svg`);
    } catch (error) {
        console.error(`Error generating assets for project ${i}:`, error.message);
        console.log('Note: Canvas package may not be installed. Using placeholder URLs instead.');
    }
}

console.log('Asset generation complete!');



