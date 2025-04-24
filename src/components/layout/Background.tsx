import { useRef, useEffect, useState } from 'react'

// Heart shape SVG path data
const HEART_PATH = "M26 7.78c0 9.36-12.09 14.56-13.65 19.16-.17.49-.6.33-.73.13C9.67 24.1 0 22.14 0 12.59c0-7.4 5.15-9.7 6.99-9.7 2.28 0 4.19 1.34 4.73 2.58C13.71 2.05 17 0 19.79 0S26 2.53 26 7.78z";

// Define heart type
interface Heart {
  x: number;
  y: number;
  color: string; // Store the color as a string
  phase: number;
  scale: number;
}

// Background component using Canvas 2D for simplicity and reliability
export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const heartsRef = useRef<Heart[]>([]);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Initialize canvas and set up the animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    // Get 2D context
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas 2D not supported');
      return;
    }

    // Color palette
    const colorPalette = ['#07dde5', '#f70000', '#F944EC'];

    // Create heart path once - centered around origin
    const heartPath = new Path2D();
    // Scale and center the heart path
    const pathScale = 1;
    const pathOffsetX = -13; // Center the heart horizontally
    const pathOffsetY = -13; // Center the heart vertically

    // Create a temporary canvas to measure the heart
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      // Create a transformation matrix to center the heart
      tempCtx.translate(pathOffsetX, pathOffsetY);
      tempCtx.scale(pathScale, pathScale);

      // Add the heart path
      const originalPath = new Path2D(HEART_PATH);
      tempCtx.stroke(originalPath);

      // Get the transformation matrix
      const matrix = tempCtx.getTransform();

      // Apply the transformation to our path
      heartPath.addPath(originalPath, matrix);
    } else {
      // Fallback if tempCtx is not available
      heartPath.addPath(new Path2D(HEART_PATH));
    }

    // Set canvas size to match viewport (not container)
    const resizeCanvas = () => {
      // Use viewport dimensions instead of container dimensions
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Update state for positioning
      setViewportSize({ width, height });

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Create hearts when canvas is resized
      createHearts();
    };

    // Create hearts data
    const createHearts = () => {
      if (!canvas) return;

      const iconSize = 30; // Same as original
      const columns = Math.ceil(canvas.width / iconSize);
      const rows = Math.ceil(canvas.height / iconSize);

      const newHearts: Heart[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          // Calculate position in grid
          const x = col * iconSize + iconSize / 2;
          const y = row * iconSize + iconSize / 2;

          // Random color from palette
          const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

          // Random phase for animation (0-1)
          const phase = Math.random();

          newHearts.push({
            x,
            y,
            color,
            phase,
            scale: 0.1 // Initial scale
          });
        }
      }

      heartsRef.current = newHearts;
    };

    // Animation loop
    const render = (time: number) => {
      if (!ctx || !canvas) return;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw hearts
      const hearts = heartsRef.current;

      for (let i = 0; i < hearts.length; i++) {
        const heart = hearts[i];

        // Calculate current scale based on time and phase
        const scaleT = (time * 0.0001 + heart.phase) % 1; // 10 second cycle

        // Scale animation: 0.1 -> 0.8 -> 0.1
        heart.scale = 0.1 + Math.sin(scaleT * Math.PI) * 0.7;

        // Draw heart
        ctx.save();
        // Move to the heart position
        ctx.translate(heart.x, heart.y);
        // Apply scaling (heart is already centered around origin)
        ctx.scale(heart.scale, heart.scale);
        // Set fill style and opacity
        ctx.fillStyle = heart.color;
        ctx.globalAlpha = 0.7;
        // Draw the heart
        ctx.fill(heartPath);
        ctx.restore();
      }

      // Request next frame
      animationRef.current = requestAnimationFrame(render);
    };

    // Initialize
    resizeCanvas();

    // Listen for window resize, not just container resize
    window.addEventListener('resize', resizeCanvas);

    // Start animation
    animationRef.current = requestAnimationFrame(render);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0"
        style={{
          pointerEvents: 'none',
          width: `${viewportSize.width}px`,
          height: `${viewportSize.height}px`,
          zIndex: 0
        }}
      />
    </div>
  );
}
