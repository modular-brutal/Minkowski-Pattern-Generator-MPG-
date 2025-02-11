# Minkowski Pattern Generator (MPG)

An interactive web application for generating and visualizing mathematical patterns based on Minkowski distance metrics. Create beautiful, dynamic visualizations with customizable parameters and real-time audio reactivity.

## Features

- Multiple pattern types based on Minkowski metrics
  - Wave interference patterns
  - Fractal geometries
  - Dynamic flow fields
- Mathematical foundations
  - Minkowski distance (L<sub>p</sub> metric)
  - Superellipse geometries
  - Wave interference equations
- Visualization options
  - Adjustable grid size (20×20 to 80×80)
  - P-value control (2.0 to 6.0)
  - Multiple render styles (ASCII, Pixels, Matrix)
- Interactive features
  - Audio reactivity
  - Color scheme customization
  - Auto-cycling colors
  - Fullscreen mode
  - Pattern recording
  - Settings export/import

## Tech Stack

- React
- Vite
- Canvas API
- Web Audio API

## Getting Started

1. Clone the repository
```bash
git clone [your-repo-url]
```

2. Install dependencies
```bash
npm install
```

3. Run development server
```bash
npm run dev
```

## Usage

### Controls
- Adjust p-value to change pattern geometry
- Modify grid size for different resolutions
- Select different pattern types and render styles
- Toggle audio reactivity for music visualization
- Use auto-cycle for dynamic color transitions

### Keyboard Shortcuts
- 'F': Toggle fullscreen
- 'Space': Show/hide controls
- 'R': Quick randomize
- 'ESC': Exit fullscreen

## Mathematical Background

The core of MPG is based on the Minkowski distance metric:

```
d(x,y) = (|x₁-x₂|ᵖ + |y₁-y₂|ᵖ)^(1/p)
```

Where:
- p = 2: Euclidean distance (circles)
- p = 1: Manhattan distance (diamonds)
- p > 2: Superellipses

## License

MIT

## Credits

Created by Luis Rapp - February 2024 