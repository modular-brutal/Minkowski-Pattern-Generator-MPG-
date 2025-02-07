import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import './App.css'
import { throttle, debounce } from 'lodash'

// Add this new constant at the top level
const RENDER_STYLES = {
  ASCII: 'ascii',
  PIXELS: 'pixels',
  DOTS: 'dots',
  LINES: 'lines',
  MATRIX: 'matrix',
  CIRCLES: 'circles',
  TRIANGLES: 'triangles',
  HEXAGONS: 'hexagons',
  GRADIENT: 'gradient',
  WIREFRAME: 'wireframe',
  ASCII_DENSE: 'ascii_dense',
  ASCII_BLOCKS: 'ascii_blocks',
  ASCII_SHADES: 'ascii_shades',
  PIXEL_BLOCKS: 'pixel_blocks',
  PIXEL_DITHERING: 'pixel_dithering',
  PIXEL_SCANLINES: 'pixel_scanlines',
}

// Add new color schemes
const COLOR_SCHEMES = {
  MATRIX: {
    name: 'Matrix',
    primary: '#00ff00',
    secondary: '#003300',
    glow: 'rgba(0, 255, 0, 0.2)'
  },
  CYBERPUNK: {
    name: 'Cyberpunk',
    primary: '#ff00ff',
    secondary: '#00ffff',
    glow: 'rgba(255, 0, 255, 0.2)'
  },
  FIRE: {
    name: 'Fire',
    primary: '#ff4400',
    secondary: '#ffaa00',
    glow: 'rgba(255, 68, 0, 0.2)'
  },
  OCEAN: {
    name: 'Ocean',
    primary: '#00ffff',
    secondary: '#0077ff',
    glow: 'rgba(0, 255, 255, 0.2)'
  },
  SUNSET: {
    name: 'Sunset',
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    glow: 'rgba(255, 107, 107, 0.2)'
  },
  NEON: {
    name: 'Neon',
    primary: '#7fff00',
    secondary: '#ff00ff',
    glow: 'rgba(127, 255, 0, 0.2)'
  },
  RETRO: {
    name: 'Retro',
    primary: '#ffcc00',
    secondary: '#ff6600',
    glow: 'rgba(255, 204, 0, 0.2)'
  },
  AURORA: {
    name: 'Aurora',
    primary: '#80ff80',
    secondary: '#8080ff',
    glow: 'rgba(128, 255, 128, 0.2)'
  },
  CUSTOM: {
    name: 'Custom',
    primary: '#00ff00',
    secondary: '#003300',
    glow: 'rgba(0, 255, 0, 0.2)'
  }
}

// Add to the top with other constants
const CYCLE_INTERVAL = 3000; // 3 seconds for smoother transitions

// Add this at the top with other constants
const PATTERNS = {
  WAVE: { id: 0, name: 'Wave Pattern' },
  SPIRAL: { id: 1, name: 'Spiral' },
  CHECKERBOARD: { id: 2, name: 'Checkerboard' },
  RIPPLE: { id: 3, name: 'Ripple' },
  MAZE: { id: 4, name: 'Maze' },
  CELLULAR: { id: 5, name: 'Cellular' },
  INTERFERENCE: { id: 6, name: 'Interference' },
  FRACTAL: { id: 7, name: 'Fractal' },
  VORTEX: { id: 8, name: 'Vortex' },
  NOISE: { id: 9, name: 'Noise' },
  MANDELBROT: { id: 10, name: 'Mandelbrot' },
  VORONOI: { id: 11, name: 'Voronoi' },
  KALEIDOSCOPE: { id: 12, name: 'Kaleidoscope' }
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

function PlaybackControls({ isRunning, onPlayPause, onForward, onBackward }) {
  return (
    <div className="playback-controls">
      <button 
        className="control-button"
        onClick={onBackward}
        title="Step Backward"
      >
        ◀◀
      </button>
      <button 
        className="control-button play-pause"
        onClick={onPlayPause}
      >
        {isRunning ? '⏸' : '▶'}
      </button>
      <button 
        className="control-button"
        onClick={onForward}
        title="Step Forward"
      >
        ▶▶
      </button>
    </div>
  )
}

function FullscreenToggle({ isFullscreen, onToggle, className = '' }) {
  return (
    <button 
      className={`fullscreen-toggle ${className}`}
      onClick={onToggle}
      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
      {isFullscreen ? '⎋' : '⛶'}
    </button>
  )
}

function MinkowskiGrid({ p = 2, gridSize = 50, pattern = 0, renderStyle = RENDER_STYLES.ASCII, audioEnabled = false, isFullscreen, colorScheme }) {
  const canvasRef = useRef(null)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const audioRef = useRef(null)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const mouseTimerRef = useRef(null)

  // Move patterns array inside the component
  const patterns = [
    // 0: Original wave pattern
    (x, y, time, p, canvas) => {
      const [centerX, centerY] = scaleCoordinates(x, y, canvas)
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
    (x, y, time, p, canvas) => {
      const [centerX, centerY] = scaleCoordinates(x, y, canvas)
      const angle = Math.atan2(centerY, centerX)
      const dist = Math.sqrt(centerX*centerX + centerY*centerY)
      return Math.sin(dist/5 - angle*p + time/10)
    },
    // 2: Checkerboard wave
    (x, y, time, p, canvas) => {
      const [centerX, centerY] = scaleCoordinates(x, y, canvas)
      return Math.sin(x/2 + time/10) * Math.sin(y/2 + time/8) * 
             Math.sin(Math.pow((x+y)/10, p/2))
    },
    // 3: Ripple pattern
    (x, y, time, p, canvas) => {
      const [centerX, centerY] = scaleCoordinates(x, y, canvas)
      const dist = Math.sqrt(centerX*centerX + centerY*centerY)
      return Math.sin(dist/3 - time/5) * Math.pow(1/(dist+1), p/5)
    },
    // 4: Maze-like pattern
    (x, y, time, p, canvas) => {
      const [centerX, centerY] = scaleCoordinates(x, y, canvas)
      return Math.sin(x*p + Math.sin(y*p + time/10)) * 
             Math.cos(y*p + Math.cos(x*p + time/8))
    },
    // 5: Cellular pattern
    (x, y, time, p, canvas) => {
      const [centerX, centerY] = scaleCoordinates(x, y, canvas)
      return Math.sin(Math.floor(x/p)*p + Math.floor(y/p)*p + time/10)
    },
    // 6: Interference pattern
    (x, y, time, p, canvas) => {
      const [centerX, centerY] = scaleCoordinates(x, y, canvas)
      const wave1 = Math.sin((x+y)*p/10 + time/10)
      const wave2 = Math.cos((x-y)*p/10 + time/8)
      return (wave1 + wave2) / 2
    },
    // 7: Fractal-like pattern
    (x, y, time, p, canvas) => {
      const [centerX, centerY] = scaleCoordinates(x, y, canvas)
      const scale = p * 2
      return Math.sin(x/scale + Math.sin(y/scale + Math.sin(x/scale + time/10)))
    },
    // 8: Vortex pattern
    (x, y, time, p, canvas) => {
      const [centerX, centerY] = scaleCoordinates(x, y, canvas)
      const angle = Math.atan2(centerY, centerX)
      const dist = Math.pow(centerX*centerX + centerY*centerY, 1/p)
      return Math.sin(angle*p + dist/5 - time/10)
    },
    // 9: Noise pattern
    (x, y, time, p, canvas) => {
      const [centerX, centerY] = scaleCoordinates(x, y, canvas)
      return Math.sin(x*p + y*p + time/10) * 
             Math.cos(x*p - y*p + time/8) * 
             Math.sin(Math.sqrt(x*x + y*y)/10)
    },
    // 10: Mandelbrot-like pattern
    (x, y, time, p, canvas) => {
      const [centerX, centerY] = scaleCoordinates(x, y, canvas)
      let zx = centerX / 20
      let zy = centerY / 20
      let i = 0
      while (i < 10 && (zx*zx + zy*zy) < 4) {
        const xtemp = zx*zx - zy*zy + centerX/20
        zy = 2*zx*zy + centerY/20
        zx = xtemp
        i++
      }
      return Math.sin(i/2 + time/10)
    },
    // 11: Voronoi pattern
    (x, y, time, p, canvas) => {
      const points = Array.from({length: 5}, (_, i) => ({
        x: Math.sin(time/10 + i*2.4) * gridSize/3,
        y: Math.cos(time/8 + i*2.4) * gridSize/3
      }))
      const dists = points.map(point => 
        Math.pow(Math.pow(Math.abs(x - point.x), p) + 
                Math.pow(Math.abs(y - point.y), p), 1/p)
      )
      return Math.sin(Math.min(...dists)/2)
    },
    // 12: Kaleidoscope pattern
    (x, y, time, p, canvas) => {
      const [centerX, centerY] = scaleCoordinates(x, y, canvas)
      const angle = Math.atan2(centerY, centerX)
      const dist = Math.sqrt(centerX*centerX + centerY*centerY)
      const segments = 8
      const segmentAngle = (angle + Math.PI) % (2*Math.PI/segments)
      return Math.sin(segmentAngle*p + dist/5 + time/10)
    }
  ]

  // Update the canvas sizing effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (isFullscreen) {
      // In fullscreen, use full screen width and maintain aspect ratio
      canvas.width = window.innerWidth * 2 // 2x resolution
      canvas.height = window.innerWidth * 2 // Keep square aspect ratio
    } else {
      // In windowed mode, keep it standard
      canvas.width = 800
      canvas.height = 800
    }

    // Reset font size when dimensions change
    const cellSize = canvas.width / gridSize
    const ctx = canvas.getContext('2d')
    ctx.font = `${cellSize}px monospace`
  }, [isFullscreen, gridSize])

  // Update the scaleCoordinates function
  const scaleCoordinates = useCallback((x, y, canvas) => {
    const aspectRatio = canvas.width / canvas.height
    const scale = Math.min(canvas.width, canvas.height) / gridSize
    const centerX = (x - gridSize/2) * (aspectRatio > 1 ? aspectRatio : 1)
    const centerY = (y - gridSize/2) * (aspectRatio <= 1 ? 1/aspectRatio : 1)
    return [centerX, centerY]
  }, [gridSize])

  // Audio setup
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      
      analyser.fftSize = 256
      source.connect(analyser)
      
      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
      setAudioInitialized(true)
    } catch (err) {
      console.log('Audio input not available:', err)
      setAudioInitialized(false)
    }
  }

  // Initialize or cleanup audio based on audioEnabled prop
  useEffect(() => {
    if (audioEnabled && !audioInitialized) {
      initializeAudio()
    }
    return () => {
      if (analyserRef.current) {
        // Cleanup audio context if needed
      }
    }
  }, [audioEnabled])

  // Playback controls
  const handleForward = () => {
    setTime(t => t + 1)
  }

  const handleBackward = () => {
    setTime(t => t - 1)
  }

  // Animation loop with optional audio reactivity
  useEffect(() => {
    if (!isRunning) return
    
    let lastTime = performance.now()
    let animationFrame
    
    const animate = () => {
      const now = performance.now()
      const deltaTime = now - lastTime
      
      if (deltaTime >= 50) { // 20fps limit
        lastTime = now
        
        let timeIncrement = 1
        
        // Only use audio data if enabled and initialized
        if (audioEnabled && audioInitialized && analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current)
          const sum = dataArrayRef.current.reduce((a, b) => a + b, 0)
          timeIncrement = (sum / (dataArrayRef.current.length * 255)) * 2 // Normalize to 0-2
        }
        
        setTime(t => t + timeIncrement)
      }
      
      animationFrame = requestAnimationFrame(animate)
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isRunning, audioEnabled, audioInitialized])

  // Add new rendering functions
  const renderMethods = {
    [RENDER_STYLES.ASCII]: (ctx, x, y, value, cellSize) => {
      // Use interpolated color between primary and secondary
      ctx.fillStyle = getGradientColor(value, colorScheme)
      
      // Use different characters based on value
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
      const intensity = Math.max(0, Math.min(1, (value + 1) / 2)) // Normalize to 0-1
      ctx.fillStyle = getGradientColor(value, colorScheme)
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
      ctx.fillStyle = getGradientColor(value, colorScheme)
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
      ctx.strokeStyle = getGradientColor(value, colorScheme)
      ctx.stroke()
    },

    [RENDER_STYLES.MATRIX]: (ctx, x, y, value, cellSize) => {
      const chars = "01"
      const charIndex = Math.floor((value + 1) * chars.length/2)
      const char = chars[charIndex] || chars[0]
      ctx.fillStyle = getGradientColor(value, colorScheme)
      ctx.fillText(char, x * cellSize, y * cellSize + cellSize/2)
    },

    [RENDER_STYLES.CIRCLES]: (ctx, x, y, value, cellSize) => {
      const radius = cellSize * 0.4
      ctx.beginPath()
      ctx.arc(
        x * cellSize + cellSize/2,
        y * cellSize + cellSize/2,
        radius * Math.abs(value),
        0,
        Math.PI * 2
      )
      ctx.strokeStyle = getGradientColor(value, colorScheme)
      ctx.lineWidth = 2
      ctx.stroke()
    },

    [RENDER_STYLES.TRIANGLES]: (ctx, x, y, value, cellSize) => {
      const size = cellSize * 0.4 * Math.abs(value)
      const centerX = x * cellSize + cellSize/2
      const centerY = y * cellSize + cellSize/2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - size)
      ctx.lineTo(centerX + size, centerY + size)
      ctx.lineTo(centerX - size, centerY + size)
      ctx.closePath()
      ctx.fillStyle = getGradientColor(value, colorScheme)
      ctx.fill()
    },

    [RENDER_STYLES.HEXAGONS]: (ctx, x, y, value, cellSize) => {
      const size = cellSize * 0.4 * Math.abs(value)
      const centerX = x * cellSize + cellSize/2
      const centerY = y * cellSize + cellSize/2
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3
        const px = centerX + size * Math.cos(angle)
        const py = centerY + size * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.strokeStyle = getGradientColor(value, colorScheme)
      ctx.lineWidth = 2
      ctx.stroke()
    },

    [RENDER_STYLES.GRADIENT]: (ctx, x, y, value, cellSize) => {
      const gradient = ctx.createRadialGradient(
        x * cellSize + cellSize/2, y * cellSize + cellSize/2, 0,
        x * cellSize + cellSize/2, y * cellSize + cellSize/2, cellSize/2
      )
      const color = getGradientColor(value, colorScheme)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    },

    [RENDER_STYLES.WIREFRAME]: (ctx, x, y, value, cellSize) => {
      const height = cellSize * Math.abs(value)
      const centerX = x * cellSize + cellSize/2
      const centerY = y * cellSize + cellSize/2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX, centerY - height)
      ctx.strokeStyle = getGradientColor(value, colorScheme)
      ctx.lineWidth = 1
      ctx.stroke()
    },

    [RENDER_STYLES.ASCII_DENSE]: (ctx, x, y, value, cellSize) => {
      ctx.fillStyle = getGradientColor(value, colorScheme)
      const chars = ' .,:;=+*#@'  // More gradual ASCII shading
      const index = Math.floor(((value + 1) / 2) * (chars.length - 1))
      ctx.fillText(chars[index], x * cellSize, y * cellSize + cellSize/2)
    },

    [RENDER_STYLES.ASCII_BLOCKS]: (ctx, x, y, value, cellSize) => {
      ctx.fillStyle = getGradientColor(value, colorScheme)
      const chars = '▁▂▃▄▅▆▇█'  // Unicode block elements
      const index = Math.floor(((value + 1) / 2) * (chars.length - 1))
      ctx.fillText(chars[index], x * cellSize, y * cellSize + cellSize/2)
    },

    [RENDER_STYLES.ASCII_SHADES]: (ctx, x, y, value, cellSize) => {
      ctx.fillStyle = getGradientColor(value, colorScheme)
      const chars = '░▒▓█'  // Unicode shade blocks
      const index = Math.floor(((value + 1) / 2) * (chars.length - 1))
      ctx.fillText(chars[index], x * cellSize, y * cellSize + cellSize/2)
    },

    [RENDER_STYLES.PIXEL_BLOCKS]: (ctx, x, y, value, cellSize) => {
      const intensity = (value + 1) / 2 // normalize to 0-1
      const blockSize = cellSize / 3
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (intensity > (i * 3 + j) / 9) {
            ctx.fillStyle = getGradientColor(value, colorScheme)
            ctx.fillRect(
              x * cellSize + i * blockSize,
              y * cellSize + j * blockSize,
              blockSize - 1,
              blockSize - 1
            )
          }
        }
      }
    },

    [RENDER_STYLES.PIXEL_DITHERING]: (ctx, x, y, value, cellSize) => {
      const intensity = (value + 1) / 2 // normalize to 0-1
      const patterns = [
        [0, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 1],
        [1, 0, 1, 1],
        [1, 1, 1, 1]
      ]
      
      const patternIndex = Math.floor(intensity * (patterns.length - 1))
      const pattern = patterns[patternIndex]
      const dotSize = cellSize / 2
      
      ctx.fillStyle = getGradientColor(value, colorScheme)
      pattern.forEach((dot, i) => {
        if (dot) {
          ctx.fillRect(
            x * cellSize + (i % 2) * dotSize,
            y * cellSize + Math.floor(i / 2) * dotSize,
            dotSize - 1,
            dotSize - 1
          )
        }
      })
    },

    [RENDER_STYLES.PIXEL_SCANLINES]: (ctx, x, y, value, cellSize) => {
      const intensity = (value + 1) / 2 // normalize to 0-1
      ctx.fillStyle = getGradientColor(value, colorScheme)
      
      // Main pixel
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      
      // Scanlines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      if (Math.floor(y) % 2 === 0) {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize/2)
      }
    },
  }

  // Add color utility functions
  const getGradientColor = (value, scheme) => {
    const t = (value + 1) / 2 // normalize to 0-1
    const c1 = hexToRgb(scheme.primary)
    const c2 = hexToRgb(scheme.secondary)
    const r = Math.round(c1.r + (c2.r - c1.r) * t)
    const g = Math.round(c1.g + (c2.g - c1.g) * t)
    const b = Math.round(c1.b + (c2.b - c1.b) * t)
    const alpha = Math.max(0.2, Math.abs(value)) // Minimum opacity of 0.2
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Modify the render useEffect
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const cellSize = Math.min(canvas.width / gridSize, canvas.height / gridSize)
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Set up context based on render style
    if (renderStyle === RENDER_STYLES.ASCII || renderStyle === RENDER_STYLES.MATRIX) {
      ctx.font = `${cellSize}px monospace`
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'
    } else if (renderStyle === RENDER_STYLES.LINES) {
      ctx.lineWidth = 2
    }

    // Calculate the offset to center the grid
    const offsetX = (canvas.width - gridSize * cellSize) / 2
    const offsetY = (canvas.height - gridSize * cellSize) / 2
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const value = patterns[pattern](x, y, time, p, canvas)
        const screenX = offsetX + x * cellSize
        const screenY = offsetY + y * cellSize
        
        // Update render methods to use the new screen coordinates
        if (renderStyle === RENDER_STYLES.ASCII || renderStyle === RENDER_STYLES.MATRIX) {
          renderMethods[renderStyle](ctx, screenX/cellSize, screenY/cellSize, value, cellSize)
        } else {
          renderMethods[renderStyle](ctx, screenX/cellSize, screenY/cellSize, value, cellSize)
        }
      }
    }
  }, [time, p, gridSize, pattern, renderStyle, isFullscreen])

  // Update mouse movement tracking to be shared across components
  useEffect(() => {
    if (!isFullscreen) {
      setControlsVisible(true)
      return
    }

    const handleMouseMove = () => {
      setControlsVisible(true)
      clearTimeout(mouseTimerRef.current)
      mouseTimerRef.current = setTimeout(() => {
        setControlsVisible(false)
      }, 2000)
    }

    // Initial hide after 2 seconds
    const initialTimer = setTimeout(() => {
      setControlsVisible(false)
    }, 2000)

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(mouseTimerRef.current)
      clearTimeout(initialTimer)
    }
  }, [isFullscreen])

  return (
    <div className={`canvas-wrapper ${isFullscreen ? 'fullscreen' : 'square-ratio'}`}>
      <canvas 
        ref={canvasRef}
        style={{ 
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : '100%',
          imageRendering: isFullscreen ? 'pixelated' : 'auto' // Optional: for crisp pixels
        }}
        className="minkowski-canvas"
      />
      <div className={`controls-overlay ${controlsVisible || !isFullscreen ? 'visible' : ''}`}>
        <PlaybackControls 
          isRunning={isRunning}
          onPlayPause={() => setIsRunning(!isRunning)}
          onForward={handleForward}
          onBackward={handleBackward}
        />
      </div>
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
            <h2>Feature Overview</h2>
            <table className="features-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Description</th>
                  <th>Usage Tips</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pattern Type</td>
                  <td>Different mathematical algorithms for pattern generation</td>
                  <td>Try 'Fractal' with high P-values for complex shapes, 'Wave' for smooth animations</td>
                </tr>
                <tr>
                  <td>Grid Size</td>
                  <td>Resolution of the pattern (30x30 to 60x60)</td>
                  <td>Lower for better performance, higher for more detail</td>
                </tr>
                <tr>
                  <td>P-Value</td>
                  <td>Minkowski distance parameter affecting shape geometry</td>
                  <td>P=2 for circles, P&gt;4 for square-like patterns</td>
                </tr>
                <tr>
                  <td>Render Style</td>
                  <td>Visual representation method</td>
                  <td>ASCII for retro look, Pixels for clean visuals, Matrix for cyberpunk effect</td>
                </tr>
                <tr>
                  <td>Color Scheme</td>
                  <td>Predefined color combinations</td>
                  <td>Try 'Matrix' for classic green, 'Neon' for vibrant colors</td>
                </tr>
                <tr>
                  <td>Audio Reactivity</td>
                  <td>Pattern responds to microphone input</td>
                  <td>Best with music, affects animation speed and intensity</td>
                </tr>
                <tr>
                  <td>Auto Cycle</td>
                  <td>Automatically transitions between colors</td>
                  <td>Great for dynamic visuals and recordings</td>
                </tr>
                <tr>
                  <td>Randomize</td>
                  <td>Generates random combinations</td>
                  <td>Quick randomize or customize which parameters to randomize</td>
                </tr>
                <tr>
                  <td>Export</td>
                  <td>Save settings or record animations</td>
                  <td>Record button captures WebM video of the canvas</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>Mathematical Foundation</h2>
            <div className="math-section">
              <h3>Core Concepts</h3>
              <ul>
                <li><strong>Minkowski Distance (L<sub>p</sub> metric)</strong>: The foundation of pattern geometry</li>
                <li><strong>Wave Interference</strong>: Creates dynamic flow patterns</li>
                <li><strong>Polar Coordinates</strong>: Used for radial patterns</li>
                <li><strong>Cellular Automata</strong>: For emergent pattern behavior</li>
              </ul>

              <h3>Key Equations</h3>
              <div className="equation-block">
                <p>Minkowski Distance:</p>
                <code>d<sub>p</sub>(x,y) = (|x₁-x₂|<sup>p</sup> + |y₁-y₂|<sup>p</sup>)<sup>1/p</sup></code>
                <div className="equation-description">
                  Where p is the distance parameter that shapes the geometry:
                </div>
                <ul className="equation-list">
                  <li>p = 2: Euclidean distance (circles)</li>
                  <li>p = 1: Manhattan distance (diamonds)</li>
                  <li>p ≥ 2: Superellipses</li>
                </ul>
              </div>

              <div className="equation-block">
                <p>Wave Pattern Function:</p>
                <code>f(x,y,t) = sin(kx + ωt) &times; cos(ky + ωt)</code>
                <div className="equation-description">
                  Where:
                </div>
                <ul className="equation-list">
                  <li>k: Wave number (spatial frequency)</li>
                  <li>ω: Angular frequency (temporal)</li>
                  <li>t: Time parameter</li>
                </ul>
              </div>

              <h3>Pattern Algorithms</h3>
              <div className="algorithm-block">
                <h4>1. Wave Pattern</h4>
                <code>
                  value = sin(d/scale + time) * <br/>
                  cos(atan2(y,x) * p + time)
                </code>
                <p>Combines distance fields with angular components</p>
              </div>

              <div className="algorithm-block">
                <h4>2. Fractal Pattern</h4>
                <code>
                  z = z² + c <br/>
                  where c = complex(x,y)
                </code>
                <p>Based on the Mandelbrot set iteration formula</p>
              </div>

              <div className="algorithm-block">
                <h4>3. Interference Pattern</h4>
                <code>
                  sum = Σ(sin(d[i]/scale + time)) <br/>
                  for each point i in points[]
                </code>
                <p>Superposition of multiple wave sources</p>
              </div>
            </div>
          </section>

          <section>
            <h2>Creating Interesting Patterns</h2>
            
            <h3>Audio-Visual Combinations</h3>
            <ul>
              <li><strong>Cyberpunk Beat Visualizer:</strong> Matrix render style + Audio reactivity + Neon colors</li>
              <li><strong>Smooth Wave Dance:</strong> Wave pattern + Audio reactivity + Ocean colors + Gradient render</li>
              <li><strong>Digital Rain:</strong> Cellular pattern + Matrix render + Audio reactivity</li>
            </ul>

            <h3>Static Art Patterns</h3>
            <ul>
              <li><strong>Geometric Art:</strong> Fractal pattern + high P-value + Triangles render</li>
              <li><strong>Minimal Design:</strong> Interference pattern + Lines render + Monochrome colors</li>
              <li><strong>Complex Textures:</strong> Noise pattern + ASCII Dense + Custom colors</li>
            </ul>
          </section>

          <section>
            <h2>Recording Tips</h2>
            <ul>
              <li>Enable Auto Cycle for smooth color transitions</li>
              <li>Use Fullscreen mode for highest quality recordings</li>
              <li>Try different Grid Sizes based on your recording needs</li>
              <li>Combine Audio Reactivity with music for dynamic videos</li>
              <li>Recordings are saved in WebM format, can be converted to MP4</li>
            </ul>
          </section>

          <section>
            <h2>Performance Tips</h2>
            <ul>
              <li>Lower Grid Size for better performance</li>
              <li>Simple render styles (Pixels, Lines) are faster than complex ones</li>
              <li>Monitor FPS in the Performance Monitor</li>
              <li>Close other browser tabs for better recording performance</li>
            </ul>
          </section>

          <section>
            <h2>Keyboard Shortcuts</h2>
            <ul>
              <li><strong>ESC:</strong> Exit fullscreen</li>
              <li><strong>Space:</strong> Toggle settings panel</li>
              <li><strong>R:</strong> Quick randomize</li>
              <li><strong>F:</strong> Toggle fullscreen</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

// Add these helper functions at the top level
const hslToRgb = (h, s, l) => {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Add these utility functions at the top level
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)]

const getRandomValue = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const RANDOMIZABLE_SETTINGS = {
  PATTERN: 'pattern',
  RENDER_STYLE: 'renderStyle',
  COLOR_SCHEME: 'colorScheme',
  P_VALUE: 'pValue',
  GRID_SIZE: 'gridSize'
}

// Add this new component for the random settings modal
function RandomSettingsModal({ isOpen, onClose, settings, onToggle, onRandomize }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="random-settings-modal" onClick={e => e.stopPropagation()}>
        <h3>Randomize Settings</h3>
        <div className="random-settings-options">
          {Object.entries(RANDOMIZABLE_SETTINGS).map(([key, value]) => (
            <label key={key} className="random-option">
              <input
                type="checkbox"
                checked={settings[value]}
                onChange={() => onToggle(value)}
              />
              {key.replace(/_/g, ' ')}
            </label>
          ))}
        </div>
        <div className="random-settings-buttons">
          <button onClick={onRandomize}>Randomize Selected</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Add this debounce function near the top of your App component
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

function App() {
  const [theme, setTheme] = useState('dark')
  const [p, setP] = useState(2)
  const [gridSize, setGridSize] = useState(50)
  const [pattern, setPattern] = useState(0)
  const [isDocOpen, setIsDocOpen] = useState(false)
  const [renderStyle, setRenderStyle] = useState(RENDER_STYLES.ASCII)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlPanelVisible, setControlPanelVisible] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const mouseTimerRef = useRef(null)
  const [colorScheme, setColorScheme] = useState(COLOR_SCHEMES.MATRIX)
  const [customColors, setCustomColors] = useState({
    primary: '#00ff00',
    secondary: '#003300'
  })
  const [cycleColors, setCycleColors] = useState(false)
  const [hue, setHue] = useState(Math.random());
  const [randomSettings, setRandomSettings] = useState({
    pattern: true,
    renderStyle: true,
    colorScheme: true,
    pValue: true,
    gridSize: true
  });
  const [isRandomSettingsOpen, setIsRandomSettingsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } catch (err) {
        console.log('Error attempting to enable fullscreen:', err)
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }, [])

  // Handle ESC key and fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Move mouse tracking to App level to control all UI elements
  useEffect(() => {
    if (!isFullscreen) {
      setControlsVisible(true)
      return
    }

    const handleMouseMove = () => {
      setControlsVisible(true)
      clearTimeout(mouseTimerRef.current)
      mouseTimerRef.current = setTimeout(() => {
        setControlsVisible(false)
      }, 2000)
    }

    // Initial hide after 2 seconds
    const initialTimer = setTimeout(() => {
      setControlsVisible(false)
    }, 2000)

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(mouseTimerRef.current)
      clearTimeout(initialTimer)
    }
  }, [isFullscreen])

  // Update the color picker handlers
  const handleColorChange = (type, value) => {
    setCustomColors(prev => {
      const newColors = {
        ...prev,
        [type]: value
      };
      
      // Update color scheme immediately when using custom colors
      setColorScheme({
        ...colorScheme,
        primary: newColors.primary,
        secondary: newColors.secondary,
        glow: `rgba(${hexToRgb(newColors.primary).r}, ${hexToRgb(newColors.primary).g}, ${hexToRgb(newColors.primary).b}, 0.2)`
      });
      
      return newColors;
    });
  };

  // Add this helper function if not already present
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Replace the color cycling effect with this new one
  useEffect(() => {
    if (!cycleColors) return;
    
    const interval = setInterval(() => {
      setHue(h => (h + 0.001) % 1); // Very small increment for smooth transition
    }, 16); // 60fps
    
    return () => clearInterval(interval);
  }, [cycleColors]);

  // Update color scheme based on hue
  useEffect(() => {
    if (!cycleColors) return;
    
    const primary = hslToRgb(hue, 1, 0.5);
    const complementary = hslToRgb((hue + 0.5) % 1, 1, 0.3);
    
    setColorScheme({
      name: 'Animated',
      primary: rgbToHex(primary.r, primary.g, primary.b),
      secondary: rgbToHex(complementary.r, complementary.g, complementary.b),
      glow: `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.2)`
    });
  }, [hue, cycleColors]);

  // Update the randomize function with better safeguards and performance optimizations
  const randomizeSettings = useDebounce(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const newSettings = {};
      
      // Limit grid size based on device performance
      if (randomSettings.gridSize) {
        // Start with smaller sizes to prevent overload
        const sizes = [20, 30, 40, 50];
        newSettings.gridSize = getRandomElement(sizes);
      }
      
      // Randomize pattern first
      if (randomSettings.pattern) {
        // Exclude complex patterns when grid size is large
        const safePatterns = Object.values(PATTERNS)
          .filter(p => !(gridSize > 40 && p.name.includes('Fractal')));
        newSettings.pattern = getRandomElement(safePatterns).id;
      }
      
      // Limit P-value range based on grid size
      if (randomSettings.pValue) {
        const maxP = gridSize > 40 ? 4 : 6;
        const pValues = [2, 2.5, 3, 3.5, 4].filter(p => p <= maxP);
        newSettings.pValue = getRandomElement(pValues);
      }
      
      // Safe render styles based on grid size
      if (randomSettings.renderStyle) {
        const safeStyles = Object.values(RENDER_STYLES)
          .filter(style => !(gridSize > 40 && 
            (style === RENDER_STYLES.ASCII_DENSE || 
             style === RENDER_STYLES.PIXEL_DITHERING)));
        newSettings.renderStyle = getRandomElement(safeStyles);
      }
      
      // Color schemes are relatively lightweight
      if (randomSettings.colorScheme) {
        const schemes = Object.values(COLOR_SCHEMES).filter(s => s.name !== 'Custom');
        const newScheme = getRandomElement(schemes);
        newSettings.colorScheme = newScheme;
      }

      // Batch all updates together
      requestAnimationFrame(() => {
        if (newSettings.colorScheme) {
          setColorScheme(newSettings.colorScheme);
        }
        if (newSettings.pattern !== undefined) {
          setPattern(newSettings.pattern);
        }
        if (newSettings.gridSize !== undefined) {
          setGridSize(newSettings.gridSize);
        }
        if (newSettings.pValue !== undefined) {
          setP(newSettings.pValue);
        }
        if (newSettings.renderStyle !== undefined) {
          setRenderStyle(newSettings.renderStyle);
        }
        
        // Add a small delay before clearing loading state
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      });

    } catch (error) {
      console.error('Error during randomization:', error);
      setIsLoading(false);
    }
  }, 800); // Increased debounce time

  // Add initialization effect
  useEffect(() => {
    randomizeSettings(); // Randomize everything on first load
  }, []);

  // Add this function in the App component
  const exportSettings = () => {
    const settings = {
      theme,
      p,
      gridSize,
      pattern,
      renderStyle,
      audioEnabled,
      colorScheme: {
        name: colorScheme.name,
        primary: colorScheme.primary,
        secondary: colorScheme.secondary
      },
      customColors,
      cycleColors
    }

    const settingsString = JSON.stringify(settings, null, 2)
    const blob = new Blob([settingsString], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.download = 'pattern-generator-settings.txt'
    link.href = url
    link.click()
    
    URL.revokeObjectURL(url)
  }

  // Update the recording functions with optimizations
  const startRecording = () => {
    const canvas = document.querySelector('.minkowski-canvas');
    
    // Lower the frame rate and use more efficient codec settings
    const stream = canvas.captureStream(24); // Reduced from 30 to 24 FPS
    
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8', // Using VP8 instead of VP9 for better performance
      videoBitsPerSecond: 1500000, // Reduced bitrate to 1.5 Mbps
    });

    // Use chunks array with initial capacity
    chunksRef.current = new Array();

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      // Use window.requestIdleCallback for non-critical processing
      window.requestIdleCallback(() => {
        const blob = new Blob(chunksRef.current, { 
          type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pattern-${Date.now()}.webm`;
        link.click();
        URL.revokeObjectURL(url);
        chunksRef.current = [];
      });
    };

    // Record in larger time slices
    mediaRecorderRef.current.start(1000); // Record in 1-second chunks
    setIsRecording(true);
  };

  // Add this effect to optimize performance during recording
  useEffect(() => {
    if (isRecording) {
      // Disable some expensive features during recording
      if (cycleColors) setCycleColors(false);
      if (audioEnabled) setAudioEnabled(false);
    }
  }, [isRecording]);

  // Add the handleColorSchemeChange function
  const handleColorSchemeChange = (e) => {
    const scheme = Object.values(COLOR_SCHEMES).find(s => s.name === e.target.value);
    if (scheme) {
      if (scheme.name === 'Custom') {
        // When switching to custom, use the current custom colors
        setColorScheme({
          ...scheme,
          primary: customColors.primary,
          secondary: customColors.secondary,
          glow: `rgba(${hexToRgb(customColors.primary).r}, ${hexToRgb(customColors.primary).g}, ${hexToRgb(customColors.primary).b}, 0.2)`
        });
      } else {
        setColorScheme(scheme);
      }
    }
  };

  // Add back the stopRecording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className={`app ${isFullscreen ? 'fullscreen' : ''}`}>
      <button 
        className={`settings-toggle ${isFullscreen && !controlsVisible ? 'hidden' : ''}`}
        onClick={() => setControlPanelVisible(!controlPanelVisible)}
        title={controlPanelVisible ? "Hide Settings" : "Show Settings"}
      >
        ⚛
      </button>

      <div className={`floating-control-panel ${controlPanelVisible ? 'visible' : ''}`}>
        <div className="panel-header">
          <AppTitle text="Pattern Generator" version="1.0" />
          <button className="close-panel" onClick={() => setControlPanelVisible(false)}>
            ×
          </button>
        </div>
        
        <div className="panel-content">
          <div className="controls-grid">
            {/* Pattern Type */}
            <div className="control-section">
              <label>Pattern Type</label>
              <select className="select-control" value={pattern} onChange={(e) => setPattern(Number(e.target.value))}>
                {Object.values(PATTERNS).map(({ id, name }) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            {/* Grid Size */}
            <div className="control-section">
              <label>Grid Size</label>
              <select 
                className="select-control" 
                value={gridSize} 
                onChange={(e) => setGridSize(Number(e.target.value))}
              >
                <option value="20">20×20 (Fast)</option>
                <option value="30">30×30</option>
                <option value="40">40×40</option>
                <option value="50">50×50</option>
                <option value="60">60×60</option>
                <option value="70">70×70</option>
                <option value="80">80×80 (High Detail)</option>
              </select>
            </div>

            {/* P-Value */}
            <div className="control-section">
              <label>P-Value</label>
              <select className="select-control" value={p} onChange={(e) => setP(Number(e.target.value))}>
                <option value="2">P = 2 (Circle)</option>
                <option value="2.5">P = 2.5</option>
                <option value="3">P = 3</option>
                <option value="3.5">P = 3.5</option>
                <option value="4">P = 4</option>
                <option value="4.5">P = 4.5</option>
                <option value="5">P = 5</option>
                <option value="6">P = 6</option>
              </select>
            </div>

            {/* Render Style */}
            <div className="control-section">
              <label>Render Style</label>
              <select className="select-control" value={renderStyle} onChange={(e) => setRenderStyle(e.target.value)}>
                <option value={RENDER_STYLES.ASCII}>ASCII Art</option>
                <option value={RENDER_STYLES.ASCII_DENSE}>ASCII Dense</option>
                <option value={RENDER_STYLES.ASCII_BLOCKS}>ASCII Blocks</option>
                <option value={RENDER_STYLES.ASCII_SHADES}>ASCII Shades</option>
                <option value={RENDER_STYLES.PIXELS}>Pixels</option>
                <option value={RENDER_STYLES.PIXEL_BLOCKS}>Pixel Blocks</option>
                <option value={RENDER_STYLES.PIXEL_DITHERING}>Pixel Dithering</option>
                <option value={RENDER_STYLES.PIXEL_SCANLINES}>Pixel Scanlines</option>
                <option value={RENDER_STYLES.DOTS}>Dots</option>
                <option value={RENDER_STYLES.LINES}>Lines</option>
                <option value={RENDER_STYLES.MATRIX}>Matrix</option>
                <option value={RENDER_STYLES.CIRCLES}>Circles</option>
                <option value={RENDER_STYLES.TRIANGLES}>Triangles</option>
                <option value={RENDER_STYLES.HEXAGONS}>Hexagons</option>
                <option value={RENDER_STYLES.GRADIENT}>Gradient</option>
                <option value={RENDER_STYLES.WIREFRAME}>Wireframe</option>
              </select>
            </div>

            {/* Color Scheme */}
            <div className="control-section">
              <label>Color Scheme</label>
              <select className="select-control" value={colorScheme.name} onChange={handleColorSchemeChange}>
                {Object.values(COLOR_SCHEMES).map(scheme => (
                  <option key={scheme.name} value={scheme.name}>{scheme.name}</option>
                ))}
              </select>
              {colorScheme.name === 'Custom' && (
                <div className="color-pickers">
                  <div className="color-picker">
                    <label>Primary</label>
                    <input 
                      type="color" 
                      value={customColors.primary} 
                      onChange={(e) => handleColorChange('primary', e.target.value)} 
                    />
                  </div>
                  <div className="color-picker">
                    <label>Secondary</label>
                    <input 
                      type="color" 
                      value={customColors.secondary} 
                      onChange={(e) => handleColorChange('secondary', e.target.value)} 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Display Mode */}
            <div className="control-section">
              <label>Display Mode</label>
              <div className="toggle-wrapper">
                <button className={`toggle-button ${isFullscreen ? 'active' : ''}`} onClick={toggleFullscreen}>
                  {isFullscreen ? 'EXIT' : 'FULLSCREEN'}
                </button>
              </div>
            </div>

            {/* Audio Reactivity */}
            <div className="control-section">
              <label>Audio Reactivity</label>
              <div className="toggle-wrapper">
                <button className={`toggle-button ${audioEnabled ? 'active' : ''}`} onClick={() => setAudioEnabled(!audioEnabled)}>
                  {audioEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Auto Cycle */}
            <div className="control-section">
              <label>Auto Cycle</label>
              <div className="toggle-wrapper">
                <button className={`toggle-button ${cycleColors ? 'active' : ''}`} onClick={() => setCycleColors(!cycleColors)}>
                  {cycleColors ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Randomize */}
            <div className="control-section">
              <label>Randomize</label>
              <div className="random-controls">
                <button className="random-button settings" onClick={() => setIsRandomSettingsOpen(true)}>Settings</button>
                <button 
                  className={`random-button quick ${isLoading ? 'loading' : ''}`} 
                  onClick={() => !isLoading && randomizeSettings()}
                  disabled={isLoading}
                >
                  {isLoading ? '...' : '↻'}
                </button>
              </div>
            </div>

            {/* Export */}
            <div className="control-section">
              <label>Export</label>
              <div className="settings-buttons">
                <button className="settings-button export" onClick={exportSettings}>Settings</button>
                <button className={`settings-button record ${isRecording ? 'recording' : ''}`} onClick={isRecording ? stopRecording : startRecording}></button>
              </div>
            </div>

            {/* Performance Monitor */}
            <div className="control-section">
              <PerformanceMonitor />
            </div>
          </div>
          
          <div className="doc-section">
            <button className="doc-button" onClick={() => setIsDocOpen(true)}>
              Documentation
            </button>
          </div>
        </div>
      </div>

      <div className="canvas-container">
        <MinkowskiGrid 
          p={p} 
          gridSize={gridSize} 
          pattern={pattern}
          renderStyle={renderStyle}
          audioEnabled={audioEnabled}
          isFullscreen={isFullscreen}
          controlsVisible={controlsVisible}
          colorScheme={colorScheme}
        />
        <FullscreenToggle 
          isFullscreen={isFullscreen}
          onToggle={toggleFullscreen}
          className={isFullscreen && !controlsVisible ? 'hidden' : ''}
        />
      </div>

      <DocumentationModal 
        isOpen={isDocOpen}
        onClose={() => setIsDocOpen(false)}
      />

      <RandomSettingsModal
        isOpen={isRandomSettingsOpen}
        onClose={() => setIsRandomSettingsOpen(false)}
        settings={randomSettings}
        onToggle={(setting) => {
          setRandomSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
          }));
        }}
        onRandomize={() => {
          randomizeSettings();
          setIsRandomSettingsOpen(false);
        }}
      />
    </div>
  )
}

export default App 