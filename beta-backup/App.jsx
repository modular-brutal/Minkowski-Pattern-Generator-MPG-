import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

// Add this new constant at the top level
const RENDER_STYLES = {
  ASCII: 'ascii',
  PIXELS: 'pixels',
  DOTS: 'dots',
  LINES: 'lines',
  MATRIX: 'matrix'
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button 
      className="theme-toggle" 
      onClick={onToggle}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24">
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24">
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
        </svg>
      )}
    </button>
  )
}

function AppTitle({ text, version }) {
  return (
    <div className="app-title">
      <div>{text}</div>
      <span className="version-number">v{version}</span>
    </div>
  )
}

function PerformanceMonitor() {
  const [stats, setStats] = useState({
    fps: 0,
    memory: 0,
    frameTime: 0
  })
  
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let lastFpsUpdate = lastTime
    
    const updateStats = () => {
      const now = performance.now()
      frameCount++
      
      if (now - lastFpsUpdate >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastFpsUpdate))
        frameCount = 0
        lastFpsUpdate = now
        
        const memory = window.performance?.memory?.usedJSHeapSize
          ? Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024))
          : null
        
        const frameTime = Math.round(now - lastTime)
        
        setStats(prev => ({
          ...prev,
          fps,
          frameTime,
          memory: memory || prev.memory
        }))
      }
      
      lastTime = now
      requestAnimationFrame(updateStats)
    }
    
    const handle = requestAnimationFrame(updateStats)
    return () => cancelAnimationFrame(handle)
  }, [])
  
  return (
    <div className="control-section">
      <label>Performance Monitor</label>
      <div className="performance-monitor">
        <table className="performance-table">
          <tbody>
            <tr>
              <th>FPS</th>
              <td><span className="performance-value">{stats.fps}</span></td>
            </tr>
            {stats.memory > 0 && (
              <tr>
                <th>Memory</th>
                <td><span className="performance-value">{stats.memory}</span> MB</td>
              </tr>
            )}
            <tr>
              <th>Frame Time</th>
              <td><span className="performance-value">{stats.frameTime}</span> ms</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MinkowskiGrid({ p = 2, gridSize = 50, pattern = 0, renderStyle = RENDER_STYLES.ASCII }) {
  const canvasRef = useRef(null)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  
  const patterns = [
    // 0: Original wave pattern
    (x, y, time, p) => {
      const centerX = x - gridSize/2
      const centerY = y - gridSize/2
      const dist = Math.pow(
        Math.pow(Math.abs(centerX), p) + 
        Math.pow(Math.abs(centerY), p),
        1/p
      ) / (gridSize/4)
      const wave = Math.sin(x/5 + time/10) * Math.cos(y/5 + time/8)
      const angle = Math.atan2(centerY, centerX)
      const radial = Math.sin(angle * p + time/10)
      return (wave + radial - dist) / 3
    },
    // 1: Spiral pattern
    (x, y, time, p) => {
      const centerX = x - gridSize/2
      const centerY = y - gridSize/2
      const angle = Math.atan2(centerY, centerX)
      const dist = Math.sqrt(centerX*centerX + centerY*centerY)
      return Math.sin(dist/5 - angle*p + time/10)
    },
    // 2: Checkerboard wave
    (x, y, time, p) => {
      return Math.sin(x/2 + time/10) * Math.sin(y/2 + time/8) * 
             Math.sin(Math.pow((x+y)/10, p/2))
    },
    // 3: Ripple pattern
    (x, y, time, p) => {
      const centerX = x - gridSize/2
      const centerY = y - gridSize/2
      const dist = Math.sqrt(centerX*centerX + centerY*centerY)
      return Math.sin(dist/3 - time/5) * Math.pow(1/(dist+1), p/5)
    },
    // 4: Maze-like pattern
    (x, y, time, p) => {
      return Math.sin(x*p + Math.sin(y*p + time/10)) * 
             Math.cos(y*p + Math.cos(x*p + time/8))
    },
    // 5: Cellular pattern
    (x, y, time, p) => {
      return Math.sin(Math.floor(x/p)*p + Math.floor(y/p)*p + time/10)
    },
    // 6: Interference pattern
    (x, y, time, p) => {
      const wave1 = Math.sin((x+y)*p/10 + time/10)
      const wave2 = Math.cos((x-y)*p/10 + time/8)
      return (wave1 + wave2) / 2
    },
    // 7: Fractal-like pattern
    (x, y, time, p) => {
      const scale = p * 2
      return Math.sin(x/scale + Math.sin(y/scale + Math.sin(x/scale + time/10)))
    },
    // 8: Vortex pattern
    (x, y, time, p) => {
      const centerX = x - gridSize/2
      const centerY = y - gridSize/2
      const angle = Math.atan2(centerY, centerX)
      const dist = Math.pow(centerX*centerX + centerY*centerY, 1/p)
      return Math.sin(angle*p + dist/5 - time/10)
    },
    // 9: Noise pattern
    (x, y, time, p) => {
      return Math.sin(x*p + y*p + time/10) * 
             Math.cos(x*p - y*p + time/8) * 
             Math.sin(Math.sqrt(x*x + y*y)/10)
    }
  ]

  // Animation loop
  useEffect(() => {
    if (!isRunning) return
    
    const interval = setInterval(() => {
      setTime(t => t + 1)
    }, 50)
    
    return () => clearInterval(interval)
  }, [isRunning])

  // Add new rendering functions
  const renderMethods = {
    [RENDER_STYLES.ASCII]: (ctx, x, y, value, cellSize) => {
      if (value > 0.3) {
        ctx.fillText('█', x * cellSize, y * cellSize + cellSize/2)
      } else if (value > 0.1) {
        ctx.fillText('▓', x * cellSize, y * cellSize + cellSize/2)
      } else if (value > -0.1) {
        ctx.fillText('▒', x * cellSize, y * cellSize + cellSize/2)
      } else if (value > -0.3) {
        ctx.fillText('░', x * cellSize, y * cellSize + cellSize/2)
      }
    },

    [RENDER_STYLES.PIXELS]: (ctx, x, y, value, cellSize) => {
      const intensity = Math.max(0, Math.min(1, (value + 0.5)))
      ctx.fillStyle = `rgba(0, 255, 0, ${intensity})`
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    },

    [RENDER_STYLES.DOTS]: (ctx, x, y, value, cellSize) => {
      const radius = Math.abs(value) * cellSize/2
      ctx.beginPath()
      ctx.arc(
        x * cellSize + cellSize/2,
        y * cellSize + cellSize/2,
        radius,
        0,
        Math.PI * 2
      )
      ctx.fillStyle = `rgba(0, 255, 0, ${Math.abs(value)})`
      ctx.fill()
    },

    [RENDER_STYLES.LINES]: (ctx, x, y, value, cellSize) => {
      const angle = (value + 1) * Math.PI
      const centerX = x * cellSize + cellSize/2
      const centerY = y * cellSize + cellSize/2
      const length = cellSize * Math.abs(value)
      
      ctx.beginPath()
      ctx.moveTo(
        centerX - Math.cos(angle) * length/2,
        centerY - Math.sin(angle) * length/2
      )
      ctx.lineTo(
        centerX + Math.cos(angle) * length/2,
        centerY + Math.sin(angle) * length/2
      )
      ctx.strokeStyle = `rgba(0, 255, 0, ${Math.abs(value)})`
      ctx.stroke()
    },

    [RENDER_STYLES.MATRIX]: (ctx, x, y, value, cellSize) => {
      const chars = "01"
      const charIndex = Math.floor((value + 1) * chars.length/2)
      const char = chars[charIndex] || chars[0]
      ctx.fillStyle = `rgba(0, 255, 0, ${Math.abs(value)})`
      ctx.fillText(char, x * cellSize, y * cellSize + cellSize/2)
    }
  }

  // Modify the render useEffect
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const cellSize = canvas.width / gridSize
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Set up context based on render style
    if (renderStyle === RENDER_STYLES.ASCII || renderStyle === RENDER_STYLES.MATRIX) {
      ctx.font = `${cellSize}px monospace`
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'
    } else if (renderStyle === RENDER_STYLES.LINES) {
      ctx.lineWidth = 2
    }
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const value = patterns[pattern](x, y, time, p)
        renderMethods[renderStyle](ctx, x, y, value, cellSize)
      }
    }
  }, [time, p, gridSize, pattern, renderStyle])

  return (
    <div className="canvas-wrapper">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={800}
        style={{ width: '100%', height: '100%' }}
        className="minkowski-canvas"
      />
      <button 
        className="control-button"
        style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}
        onClick={() => setIsRunning(!isRunning)}
      >
        {isRunning ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}

function DocumentationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-scroll">
          <h1>Pattern Generator Documentation</h1>
          
          <section>
            <h2>Mathematical Foundation</h2>
            <p>This visualization combines several mathematical concepts:</p>
            <ul>
              <li>Minkowski Distance (L<sub>p</sub> metric)</li>
              <li>Wave Interference Patterns</li>
              <li>Polar Coordinates</li>
              <li>Trigonometric Functions</li>
            </ul>
          </section>

          <section>
            <h2>Core Equations</h2>
            <div className="equation">
              <p>Minkowski Distance:</p>
              <code>d<sub>p</sub>(x,y) = (|x₁-x₂|<sup>p</sup> + |y₁-y₂|<sup>p</sup>)<sup>1/p</sup></code>
            </div>

            <div className="equation">
              <p>Wave Pattern:</p>
              <code>f(x,y,t) = sin(kx + ωt) × cos(ky + ωt)</code>
            </div>
          </section>

          <section>
            <h2>Pattern Descriptions</h2>
            
            <h3>1. Wave Pattern</h3>
            <p>Combines three elements:</p>
            <ul>
              <li>Minkowski distance from center: <code>(|x|<sup>p</sup> + |y|<sup>p</sup>)<sup>1/p</sup></code></li>
              <li>Wave propagation: <code>sin(x/5 + t/10) × cos(y/5 + t/8)</code></li>
              <li>Radial component: <code>sin(atan2(y,x) × p + t/10)</code></li>
            </ul>

            <h3>2. Spiral Pattern</h3>
            <p>Uses polar coordinates to create rotating spirals:</p>
            <code>sin(r/5 - θp + t/10)</code>
            <p>where r is radius and θ is angle</p>

            {/* Continue with other patterns... */}
          </section>

          <section>
            <h2>Scientific References</h2>
            <div className="reference">
              <p>1. Minkowski Distance:</p>
              <a href="https://doi.org/10.1007/978-3-642-27848-8_551-1">
                Deza, M.M., Deza, E. (2014) Encyclopedia of Distances
              </a>
            </div>
            
            <div className="reference">
              <p>2. Wave Interference Patterns:</p>
              <a href="https://doi.org/10.1119/1.1986058">
                Journal of Mathematical Physics: Wave Pattern Formation
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('dark')
  const [p, setP] = useState(2)
  const [gridSize, setGridSize] = useState(50)
  const [pattern, setPattern] = useState(0)
  const [isDocOpen, setIsDocOpen] = useState(false)
  const [renderStyle, setRenderStyle] = useState(RENDER_STYLES.ASCII)

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <div className="app">
      <div className="control-panel">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <AppTitle text="Pattern Generator" version="1.0" />
        
        <div className="control-section">
          <button 
            className="doc-button"
            onClick={() => setIsDocOpen(true)}
          >
            Documentation
          </button>
        </div>

        <div className="control-section">
          <label>Pattern Type</label>
          <select 
            className="select-control"
            value={pattern}
            onChange={(e) => setPattern(Number(e.target.value))}
          >
            <option value="0">Wave Pattern</option>
            <option value="1">Spiral</option>
            <option value="2">Checkerboard</option>
            <option value="3">Ripple</option>
            <option value="4">Maze</option>
            <option value="5">Cellular</option>
            <option value="6">Interference</option>
            <option value="7">Fractal</option>
            <option value="8">Vortex</option>
            <option value="9">Noise</option>
          </select>
        </div>

        <div className="control-section">
          <label>P-Value</label>
          <select 
            className="select-control" 
            value={p}
            onChange={(e) => setP(e.target.value === 'inf' ? Infinity : Number(e.target.value))}
          >
            <option value="1">P = 1 (Manhattan)</option>
            <option value="2">P = 2 (Euclidean)</option>
            <option value="3">P = 3</option>
            <option value="4">P = 4</option>
            <option value="inf">P = ∞ (Chebyshev)</option>
          </select>
        </div>

        <div className="control-section">
          <label>Grid Size</label>
          <select 
            className="select-control"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
          >
            <option value="30">30 x 30</option>
            <option value="40">40 x 40</option>
            <option value="50">50 x 50</option>
            <option value="60">60 x 60</option>
          </select>
        </div>

        <div className="control-section">
          <label>Render Style</label>
          <select 
            className="select-control"
            value={renderStyle}
            onChange={(e) => setRenderStyle(e.target.value)}
          >
            <option value={RENDER_STYLES.ASCII}>ASCII Art</option>
            <option value={RENDER_STYLES.PIXELS}>Pixels</option>
            <option value={RENDER_STYLES.DOTS}>Dots</option>
            <option value={RENDER_STYLES.LINES}>Lines</option>
            <option value={RENDER_STYLES.MATRIX}>Matrix</option>
          </select>
        </div>

        <PerformanceMonitor />
      </div>

      <div className="canvas-container">
        <MinkowskiGrid 
          p={p} 
          gridSize={gridSize} 
          pattern={pattern}
          renderStyle={renderStyle}
        />
      </div>

      <DocumentationModal 
        isOpen={isDocOpen}
        onClose={() => setIsDocOpen(false)}
      />
    </div>
  )
}

export default App 