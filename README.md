# Portfolio Corridor - Immersive 3D Portfolio Website

An immersive 3D corridor portfolio website where users scroll through a cinematic corridor with angled doors representing portfolio projects.

## 🎨 Concept

This portfolio uses a unique navigation metaphor where **vertical scrolling = physically moving forward** down a 3D corridor. Each door is angled at 45 degrees toward the viewer and represents a project. As you scroll, you walk deeper into the corridor, experiencing parallax effects and perspective distortion.

## ✨ Features

- **3D Corridor Scene**: Built with Three.js, featuring perspective distortion and cinematic lighting
- **45° Angled Doors**: Doors on left/right walls, staggered as you progress
- **Scroll-Driven Animation**: GSAP ScrollTrigger for smooth, scroll-controlled camera movement
- **Interactive Doors**: Hover effects, click to open project details
- **Project Modals**: Beautiful detail views with project information
- **Cinematic Lighting**: Soft directional lights, spotlights, and shadows for depth
- **Procedural Textures**: Dynamically generated textures for walls and floors
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will start at `http://localhost:3000`

## 📁 Project Structure

```
Portfolio/
├── index.html              # Main HTML file
├── styles/
│   └── main.css           # Stylesheet
├── src/
│   └── main.js            # Main application entry point
├── assets/
│   ├── textures/          # Project images
│   └── door-icons/        # Door icons
├── SceneSetup.js          # Three.js scene initialization
├── Corridor.js            # Corridor geometry and materials
├── Door.js                # Door creation and interactions
├── Lights.js              # Lighting setup
├── interaction.js         # Mouse/touch interaction handler
├── scroll.js              # Scroll handling (legacy)
├── package.json
└── vite.config.js
```

## 🎮 Usage

1. **Scrolling**: Scroll down to move forward through the corridor
2. **Hover**: Move your mouse over doors to see them highlight
3. **Click**: Click on any door to view project details
4. **Modal**: Close project modals by clicking the X or outside the modal

## 🎨 Customization

### Adding Projects

Edit `src/main.js` and modify the `projects` array:

```javascript
const projects = [
    {
        id: 1,
        title: 'Your Project Name',
        description: 'Project description here...',
        tags: ['Tag1', 'Tag2'],
        link: 'https://your-project-link.com',
        image: '/assets/textures/project-1.jpg',
        icon: '/assets/door-icons/project-1.svg'
    },
    // ... more projects
];
```

### Styling

Modify `styles/main.css` to customize:
- Colors (currently using green/cyan theme: `#00ff88`, `#00ccff`)
- Modal appearance
- Loading screen
- Typography

### 3D Scene

Adjust in the respective files:
- **Corridor dimensions**: `Corridor.js` (length, width, height)
- **Door appearance**: `Door.js` (width, height, angle, materials)
- **Lighting**: `Lights.js` (intensity, colors, positions)
- **Camera**: `SceneSetup.js` (FOV, position)

### Generating Placeholder Assets

Placeholder images are referenced but not included. You can:

1. Add your own images to `assets/textures/` (800x600px recommended)
2. Add door icons to `assets/door-icons/` (256x256px SVG or PNG)
3. Or use the placeholder generator script (requires `canvas` package):

```bash
npm install canvas
node scripts/generate-assets.js
```

## 🌐 Deployment

### Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy:
   - Push to GitHub
   - Connect repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   npm run build
   vercel --prod
   ```

Or connect your GitHub repository directly in the Vercel dashboard.

### GitHub Pages

1. Build the project:
   ```bash
   npm run build
   ```

2. Update `vite.config.js`:
   ```javascript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   });
   ```

3. Deploy using GitHub Actions or manually copy `dist/` to `gh-pages` branch.

## 🔧 Technical Details

### Technologies

- **Three.js**: 3D graphics and WebGL rendering
- **GSAP**: Animation library (ScrollTrigger for scroll-driven animations)
- **Vite**: Build tool and dev server
- **ES6 Modules**: Modern JavaScript modules

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance

- Uses instanced rendering where possible
- Optimized shadows (2048x2048 shadow maps)
- Procedural textures reduce asset size
- Lazy loading for project images

## 📝 Optional Enhancements

Future improvements you can add:

1. **Audio**: Background ambient sound or spatial audio
   - Add audio toggle functionality
   - Implement Web Audio API for 3D spatial audio

2. **Particles**: Add particle effects (dust, light rays)
   ```javascript
   // Example: Add particle system in main.js
   import { ParticleSystem } from './src/3d/ParticleSystem.js';
   ```

3. **Post-Processing**: Add bloom, depth of field, color grading
   ```javascript
   import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
   ```

4. **Animation Library**: Animate camera shake, door opening sequences
   ```javascript
   // Use GSAP for complex sequences
   gsap.timeline().to(camera.position, { ... });
   ```

5. **Touch Gestures**: Enhanced mobile interactions
   ```javascript
   // Add swipe gestures for mobile
   import { TouchHandler } from './src/interactions/TouchHandler.js';
   ```

6. **Preloader**: Show loading progress for assets
   ```javascript
   import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
   ```

7. **Keyboard Navigation**: Arrow keys to navigate doors
   ```javascript
   window.addEventListener('keydown', handleKeyboard);
   ```

## 🐛 Troubleshooting

### Assets not loading
- Check file paths in `src/main.js`
- Ensure assets are in the correct directories
- Use relative paths starting with `./` or `/`

### Performance issues
- Reduce shadow map resolution in `Lights.js`
- Lower door count
- Reduce corridor length

### Scroll not working
- Ensure GSAP ScrollTrigger is properly initialized
- Check browser console for errors
- Verify body height is set correctly

## 📄 License

MIT License - feel free to use this for your own portfolio!

## 🙏 Credits

Built with Three.js and GSAP. Inspired by architectural visualization and gaming environments.



