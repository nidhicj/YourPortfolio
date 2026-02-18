# Assets Directory

This directory contains textures and icons for the portfolio projects.

## Required Assets

### Textures (`textures/`)
- **Format**: JPG or PNG
- **Recommended Size**: 800x600px
- **Files**: `project-1.jpg`, `project-2.jpg`, ..., `project-6.jpg`

Each image represents a project screenshot or preview.

### Door Icons (`door-icons/`)
- **Format**: SVG or PNG
- **Recommended Size**: 256x256px
- **Files**: `project-1.svg`, `project-2.svg`, ..., `project-6.svg`

Icons displayed on the door panels (optional, currently generated procedurally).

## Placeholder Generation

If you don't have images yet, you can:

1. Use placeholder services:
   - https://via.placeholder.com/800x600
   - https://picsum.photos/800/600

2. Use the generation script (requires Node.js and canvas package):
   ```bash
   npm install canvas
   node scripts/generate-assets.js
   ```

3. Create simple colored placeholders using any image editor

## Adding Your Own Assets

Simply replace the placeholder files with your own project images and icons. The file names should match the pattern:
- `project-{id}.jpg` for textures
- `project-{id}.svg` for icons (optional)

Where `{id}` is the project ID (1, 2, 3, etc.).

