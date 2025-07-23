# 3D Solar System Simulation

A fully interactive 3D Solar System simulation built with Three.js and vanilla JavaScript. Features realistic planet orbits, lighting, and comprehensive controls.

## Features

### Core Simulation
- **Realistic Solar System**: Sun at center with all 8 planets (Mercury to Neptune) in correct order
- **Accurate Scaling**: Planets sized relative to each other with realistic orbital distances
- **Dynamic Orbits**: Each planet orbits at different speeds based on real astronomical data
- **Axis Rotation**: All planets rotate on their own axis at different speeds
- **Realistic Lighting**: Point light from the Sun with shadows and ambient lighting

### Interactive Controls
- **Speed Control Panel**: Individual sliders to adjust each planet's orbital speed in real-time
- **Pause/Resume**: Toggle animation on/off
- **Camera Controls**: 
  - Mouse drag to rotate view around the solar system
  - Mouse wheel to zoom in/out
  - Click on any planet to focus camera on it (auto-returns after 3 seconds)
- **Tooltips**: Hover over planets to see their names
- **Light/Dark Mode**: Toggle between dark space theme and light UI theme

### Visual Features
- **Starfield Background**: 10,000 procedurally placed stars
- **Orbital Paths**: Subtle orbit lines for each planet
- **Smooth Animations**: 60fps performance with smooth camera transitions
- **Mobile Responsive**: Optimized for both desktop and mobile devices

## File Structure

```
galaxyX/
├── index.html          # Main HTML file with UI structure
│── solarSystem.js  # Main JavaScript simulation code
└── README.md           # This file
```

## How to Run

### Method 1: Local Web Server (Recommended)
1. Open a terminal/command prompt in the project directory
2. Start a local web server:
   - **Python 3**: `python -m http.server 8000`
   - **Python 2**: `python -m SimpleHTTPServer 8000`
   - **Node.js**: `npx http-server`
   - **PHP**: `php -S localhost:8000`
3. Open your browser and navigate to `http://localhost:8000`

### Method 2: Direct File Opening
1. Simply double-click `index.html` to open in your default browser
2. Note: Some browsers may have CORS restrictions with local files

## Controls Guide

### Mouse Controls
- **Left Click + Drag**: Rotate camera around the solar system
- **Mouse Wheel**: Zoom in/out
- **Click Planet**: Focus camera on specific planet
- **Click Empty Space**: Return to normal view (when zoomed in)

### UI Controls
- **Pause/Resume Button**: Stop/start all animations
- **Light/Dark Mode Button**: Toggle UI theme
- **Planet Speed Sliders**: Adjust individual planet orbital speeds (0x to 5x)
- **Speed Values**: Display current speed multiplier for each planet

### Keyboard Shortcuts
- **Spacebar**: Pause/Resume (when control panel is focused)

## Technical Details

### Technologies Used
- **Three.js r128**: 3D graphics library
- **Vanilla JavaScript**: No frameworks or dependencies
- **CSS3**: Responsive styling with backdrop filters
- **HTML5**: Semantic structure

### Performance Optimizations
- Efficient geometry reuse
- Optimized shadow mapping
- Smooth 60fps animations
- Mobile-responsive design
- Minimal DOM manipulation

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Planet Data

The simulation uses realistic relative data:

| Planet  | Relative Size | Orbital Distance | Orbital Speed | Rotation Speed |
|---------|---------------|------------------|---------------|----------------|
| Mercury | 0.38          | 15 units         | 4.74          | 0.017          |
| Venus   | 0.95          | 20 units         | 3.50          | 0.004          |
| Earth   | 1.0           | 25 units         | 2.98          | 1.0            |
| Mars    | 0.53          | 32 units         | 2.41          | 0.97           |
| Jupiter | 2.5           | 45 units         | 1.31          | 2.4            |
| Saturn  | 2.1           | 60 units         | 0.97          | 2.3            |
| Uranus  | 1.6           | 75 units         | 0.68          | 1.4            |
| Neptune | 1.55          | 90 units         | 0.54          | 1.5            |

## Customization

### Adding New Features
The code is modular and well-commented. Key areas for extension:

- **Planet Textures**: Replace `MeshLambertMaterial` with `MeshPhongMaterial` and add texture maps
- **Moons**: Add satellite objects to planets like Earth's moon
- **Asteroid Belt**: Create particle system between Mars and Jupiter
- **Comet Trails**: Add dynamic particle effects for comets

### Modifying Planet Properties
Edit the `planetData` object in `solarSystem.js`:

```javascript
this.planetData = {
    mercury: { 
        name: 'Mercury', 
        size: 0.38, 
        distance: 15, 
        speed: 4.74, 
        color: 0x8C7853, 
        rotationSpeed: 0.017 
    },
    // ... other planets
};
```

## Troubleshooting

### Common Issues

1. **Blank Screen**: Ensure you're running from a web server, not opening the file directly
2. **Poor Performance**: Try reducing the number of stars in `createStarField()`
3. **Controls Not Working**: Check browser console for JavaScript errors
4. **Mobile Issues**: Ensure viewport meta tag is present in HTML

### Performance Tips
- Close other browser tabs for better performance
- Use Chrome or Firefox for best WebGL performance
- On mobile, landscape orientation provides better experience

## Credits

Created with Three.js and modern web technologies. Planet data based on NASA astronomical measurements.
