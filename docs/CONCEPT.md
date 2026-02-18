# Portfolio Corridor - Concept & Design

## 🎨 Design Philosophy

The Portfolio Corridor transforms traditional portfolio navigation into an immersive 3D experience. Instead of scrolling through flat cards or grids, users **walk through a corridor** where each project is represented by a door angled at 45 degrees.

## 📐 Visual Metaphor

### Navigation = Physical Movement

- **Vertical Scroll** → **Forward Movement** in 3D space
- As users scroll down, the camera moves forward (negative Z-axis)
- Perspective distortion creates depth illusion
- Parallax effects reinforce the feeling of movement

### Corridor Design

```
View from top:
─────────────────────────────
│                           │
│  ◢ Door  │  │  Door ◣    │
│         │  │  │          │
│  ◢ Door  │  │  Door ◣    │
│         │  │  │          │
│           │              │
└───────────────────────────┘
     ↑ User walks forward
```

### Door Orientation

Each door is angled at **45 degrees** (π/4 radians) toward the viewer:

- **Left wall doors**: Rotated +45° around Y-axis
- **Right wall doors**: Rotated -45° around Y-axis
- This ensures doors face the user as they approach
- Creates a sense of invitation to "open" and explore

## 🎬 Cinematic Elements

### Lighting

1. **Ambient Light**: Very low (0.08) for deep shadows
2. **Directional Light**: Blue moonlight from behind (-20Z)
3. **Spotlights**: Green accent lights alternating on walls
4. **Fill Light**: Cyan from front for detail visibility
5. **Rim Lights**: Subtle blue on wall edges

### Materials

- **Walls**: Dark gray (#222222) with subtle panel textures
- **Floor**: Darker (#111111) with perspective grid
- **Doors**: Metallic dark gray with neon green frames
- **Fog**: Exponential fog for depth (density 0.03)

### Camera Movement

- **Start Position**: Z = 8 (just outside corridor entrance)
- **End Position**: Z = -50 (deep inside corridor)
- **Eye Level**: Y = 1.6 (human eye height)
- **Parallax**: Subtle X/Y movement based on scroll progress
- **FOV**: 65° (slightly narrower for cinematic feel)

## 🚪 Door Interactions

### Visual States

1. **Default**: Dark gray with subtle green frame glow
2. **Hover**: Scales up 8%, slight rotation, increased emissive glow
3. **Aligned**: Bright green glow when camera is close (distance < 5)
4. **Click**: Opens animation + modal appears

### Door Details

- **Project Title**: Rendered on door panel texture
- **Project Number**: Displayed on bottom
- **Frame**: Neon green (#00ff88) with adjustable opacity
- **Panel**: Procedurally generated canvas texture

## 🎮 User Experience Flow

1. **Entry** (Scroll 0-10%)
   - User starts outside corridor
   - Loading screen fades
   - Instructions overlay (first visit only)
   - Camera begins forward movement

2. **Approach** (Scroll 10-30%)
   - First doors become visible
   - Spotlights illuminate the path
   - Perspective distortion intensifies

3. **Exploration** (Scroll 30-70%)
   - Multiple doors visible
   - Doors highlight as user aligns with them
   - Hover effects encourage interaction

4. **Deep Dive** (Scroll 70-100%)
   - Furthest doors visible
   - Fog effect increases
   - Corridor narrows in perspective

5. **Interaction**
   - Click door → Modal opens
   - Modal shows project details
   - Smooth animations throughout

## 🎨 Color Palette

### Primary Colors

- **Neon Green**: `#00ff88` - Door frames, accents
- **Cyan**: `#00ccff` - Fill light, gradients
- **Blue**: `#4455ff` - Moonlight, atmospheric
- **Dark Gray**: `#1a1a1a` - Door panels
- **Very Dark**: `#050505` - Background, ceiling

### Gradients

- **Loading Title**: Green → Cyan (`#00ff88` → `#00ccff`)
- **Modal Title**: Same gradient
- **Scroll Bar**: Green → Cyan
- **Buttons**: Green → Cyan background

## 📐 Technical Implementation

### 3D Scene Hierarchy

```
Scene
├── Corridor (Group)
│   ├── Floor (PlaneGeometry)
│   ├── Ceiling (PlaneGeometry)
│   ├── Left Wall (PlaneGeometry)
│   └── Right Wall (PlaneGeometry)
├── Lights (Multiple)
│   ├── Ambient Light
│   ├── Directional Lights (2)
│   ├── Spotlights (12+)
│   └── Rim Lights (2)
├── Doors (Group per door)
│   ├── Door Panel (BoxGeometry)
│   ├── Frame (BoxGeometry)
│   └── Panel Texture (CanvasTexture)
└── Fog (FogExp2)
```

### Scroll Integration

- **GSAP ScrollTrigger**: Maps scroll progress (0-1) to camera Z position
- **Virtual Scroll Height**: 8000px creates smooth scrolling
- **Scrub**: 1 second interpolation for smooth camera movement
- **Parallax**: Sine/cosine functions create subtle movement

### Performance Optimizations

- **Shadow Maps**: 2048x2048 for main light, 1024x1024 for spots
- **Procedural Textures**: Canvas-generated textures reduce asset size
- **Limited Geometry**: Simple planes and boxes
- **Culling**: Three.js automatic frustum culling
- **Reusable Materials**: Shared materials where possible

## 🚀 Future Enhancements

### Visual

- **Particle System**: Dust motes, light rays
- **Post-Processing**: Bloom, depth of field, color grading
- **Dynamic Shadows**: Real-time shadow updates
- **Animated Textures**: Time-based texture animation

### Interaction

- **Door Opening**: Animated door swing on click
- **Spatial Audio**: 3D audio when near doors
- **Keyboard Navigation**: Arrow keys to select doors
- **Touch Gestures**: Enhanced mobile interactions

### Content

- **Project Previews**: Video or animated previews in doors
- **Categories**: Door colors/types for project categories
- **Timeline**: Chronological ordering option
- **Search**: Filter doors by tags/technology

## 📊 Metrics to Track

- Scroll depth (how far users scroll)
- Door interaction rate (hover/click)
- Modal engagement (time spent)
- Performance (FPS, load time)
- User path (which doors they visit)

---

This concept transforms portfolio navigation from passive browsing to active exploration, making each project feel like a destination worth visiting.



