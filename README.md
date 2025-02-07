# React Terminal UI Template

A modern, terminal-inspired React template with a sleek control panel layout and dark/light theme support.

## Features

- 🎨 Dark/Light theme support
- 📊 Built-in performance monitor
- 🎯 Responsive layout with control panel
- 💻 Terminal-inspired design
- 🔧 Customizable UI components
- 📱 Mobile-friendly
- ⚡ Built with Vite

## Layout Structure

```
┌─────────────────────────────────────────┐
│ App                                     │
├───────────────┬─────────────────────────┤
│ Control Panel │                         │
│ ┌───────────┐ │                         │
│ │  Title    │ │                         │
│ ├───────────┤ │                         │
│ │ Controls  │ │      Main Content       │
│ │           │ │         Area            │
│ ├───────────┤ │                         │
│ │Performance│ │                         │
│ │ Monitor   │ │                         │
│ └───────────┘ │                         │
└───────────────┴─────────────────────────┘
```

## Getting Started

1. Clone this template:
   ```bash
   git clone [your-template-url]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Customization

### Themes
The template includes a complete theme system with CSS variables. Modify the theme colors in `src/App.css`:

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --accent-color: #00ff00;
  /* ... other variables */
}
```

### Components
- `ThemeToggle`: Dark/Light mode switch
- `AppTitle`: Customizable title with version
- `PerformanceMonitor`: Real-time performance stats

### Control Panel
The control panel is designed to be easily extensible. Add new controls by creating new sections:

```jsx
<div className="control-section">
  <label>Your Control</label>
  {/* Your control content */}
</div>
```

## Styling Classes

- `.control-panel`: Main sidebar panel
- `.control-section`: Individual control groups
- `.button-group`: Horizontal button layouts
- `.canvas-container`: Main content area
- `.theme-toggle`: Theme switch button
- `.app-title`: Application title

## Performance

The template includes a built-in performance monitor that tracks:
- FPS (Frames Per Second)
- Memory Usage
- Frame Time

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT License - Feel free to use this template for any project.

## Credits

Created by Luis Rapp - February 2024 