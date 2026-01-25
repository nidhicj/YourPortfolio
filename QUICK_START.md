# Quick Start Guide

Get your Portfolio Corridor website up and running in minutes!

## 🚀 Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser to http://localhost:3000
```

That's it! The site should load and you can scroll to walk through the corridor.

## 📁 Project Files Overview

### Core Files

- `index.html` - Main HTML structure
- `styles/main.css` - All styling
- `src/main.js` - Main application logic

### 3D Scene Components

- `SceneSetup.js` - Three.js scene, camera, renderer setup
- `Corridor.js` - Corridor geometry (walls, floor, ceiling)
- `Door.js` - Door creation with 45° angle
- `Lights.js` - Cinematic lighting setup
- `interaction.js` - Mouse/touch interaction handler

### Configuration

- `package.json` - Dependencies and scripts
- `vite.config.js` - Vite build configuration
- `netlify.toml` - Netlify deployment config
- `vercel.json` - Vercel deployment config

### Documentation

- `README.md` - Full documentation
- `CONCEPT.md` - Design concept and philosophy
- `DEPLOYMENT.md` - Deployment instructions
- `assets/README.md` - Asset requirements

## 🎨 Customizing Your Projects

Edit `src/main.js` and find the `projects` array (around line 12):

```javascript
const projects = [
    {
        id: 1,
        title: 'Your Project Title',
        description: 'Your project description here...',
        tags: ['Tag1', 'Tag2', 'Tag3'],
        link: 'https://your-project-link.com',
        image: './assets/textures/project-1.jpg',
        icon: './assets/door-icons/project-1.svg'
    },
    // Add more projects...
];
```

## 🖼️ Adding Project Images

1. Add images to `assets/textures/`:
   - Name them: `project-1.jpg`, `project-2.jpg`, etc.
   - Recommended size: 800x600px

2. Add icons to `assets/door-icons/` (optional):
   - Name them: `project-1.svg`, `project-2.svg`, etc.
   - Recommended size: 256x256px

Or use placeholder images from:
- https://via.placeholder.com/800x600
- https://picsum.photos/800/600

## 🎨 Styling Customization

Edit `styles/main.css` to customize:

- **Colors**: Search for `#00ff88` (green) and `#00ccff` (cyan) to change theme
- **Fonts**: Change `font-family` in body selector
- **Modal**: Customize `.modal-content` styles
- **Loading Screen**: Edit `.loading-screen` styles

## 🏗️ Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## 📦 Deploy

### Netlify (Easiest)

1. Build: `npm run build`
2. Drag `dist/` folder to Netlify dashboard
3. Done! Your site is live.

Or connect GitHub repo - Netlify will auto-deploy on push.

### Vercel

```bash
npm install -g vercel
npm run build
vercel --prod
```

See `DEPLOYMENT.md` for more details.

## 🐛 Troubleshooting

### Blank Screen?

- Check browser console for errors
- Ensure you ran `npm install`
- Verify `npm run dev` started successfully

### Doors Not Clickable?

- Check that interaction handler is initialized
- Verify door userData is set correctly
- Check browser console for errors

### Assets Not Loading?

- Verify paths start with `./` (relative)
- Check assets are in correct folders
- Clear browser cache

### Performance Issues?

- Reduce shadow map resolution in `Lights.js`
- Lower number of doors
- Reduce corridor length in `Corridor.js`

## 📚 Next Steps

1. ✅ Customize projects in `src/main.js`
2. ✅ Add your project images
3. ✅ Customize colors/styling
4. ✅ Test on mobile devices
5. ✅ Deploy to Netlify/Vercel

## 💡 Tips

- Start with 3-4 projects to test
- Use placeholder images initially
- Test scroll on different devices
- Keep project titles short (2-3 words)
- Use descriptive tags for filtering later

## 🎯 What's Next?

See `README.md` for:
- Advanced customization
- Optional enhancements
- Performance optimization
- Technical details

Happy building! 🚀



