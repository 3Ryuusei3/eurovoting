import { useRef, useEffect, useState } from 'react'

// Heart shape SVG path data
const HEART_PATH = "M26 7.78c0 9.36-12.09 14.56-13.65 19.16-.17.49-.6.33-.73.13C9.67 24.1 0 22.14 0 12.59c0-7.4 5.15-9.7 6.99-9.7 2.28 0 4.19 1.34 4.73 2.58C13.71 2.05 17 0 19.79 0S26 2.53 26 7.78z";

// Define heart type
interface Heart {
  x: number;
  y: number;
  baseColor: string;    // Original color (will be black)
  currentColor: string; // Current color (affected by lights)
  baseScale: number;    // Base scale without light influence
  scale: number;        // Current scale with light influence
  brightness: number;   // Current brightness from light influence (0-1)
}

// Define light source type
interface LightSource {
  x: number;
  y: number;
  color: string;
  radius: number;     // Radius of influence
  intensity: number;  // Max intensity at center
  velocityX: number;  // Movement in X direction
  velocityY: number;  // Movement in Y direction
  targetX: number;    // Target X position
  targetY: number;    // Target Y position
}

// Background component using Canvas 2D for simplicity and reliability
export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const heartsRef = useRef<Heart[]>([]);
  const lightsRef = useRef<LightSource[]>([]);
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

    // Base color for hearts (black)
    const baseHeartColor = '#000000';

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
      // Create light sources
      createLightSources();
    };

    // Create hearts data
    const createHearts = () => {
      if (!canvas) return;

      const iconSize = 22; // Reduced from 30 to make hearts closer together
      const columns = Math.ceil(canvas.width / iconSize);
      const rows = Math.ceil(canvas.height / iconSize);

      const newHearts: Heart[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          // Calculate position in grid
          const x = col * iconSize + iconSize / 2;
          const y = row * iconSize + iconSize / 2;

          newHearts.push({
            x,
            y,
            baseColor: baseHeartColor,       // Black base color
            currentColor: baseHeartColor,    // Initial color is black
            baseScale: 0.1,                  // Minimum scale
            scale: 0.1,                      // Current scale (will be affected by lights)
            brightness: 0                    // Initial brightness (no light influence)
          });
        }
      }

      heartsRef.current = newHearts;
    };

    // Create light sources
    const createLightSources = () => {
      if (!canvas) return;

      const numLightsPerColor = 4; // Two lights for each color
      const totalLights = numLightsPerColor * colorPalette.length;
      const newLights: LightSource[] = [];

      for (let i = 0; i < totalLights; i++) {
        // Each light gets a color from the palette (2 lights per color)
        const colorIndex = Math.floor(i / numLightsPerColor);
        const color = colorPalette[colorIndex % colorPalette.length];

        // Random position within the canvas
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        // Random target position for movement
        const targetX = Math.random() * canvas.width;
        const targetY = Math.random() * canvas.height;

        newLights.push({
          x,
          y,
          color,
          radius: 450,           // Radius of influence
          intensity: 0.9,        // Max intensity
          velocityX: 0,          // Initial velocity
          velocityY: 0,          // Initial velocity
          targetX,               // Target X position
          targetY                // Target Y position
        });
      }

      lightsRef.current = newLights;
    };

    // Update light positions
    const updateLights = () => {
      const lights = lightsRef.current;

      for (let i = 0; i < lights.length; i++) {
        const light = lights[i];

        // Calculate direction to target
        const dx = light.targetX - light.x;
        const dy = light.targetY - light.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If close to target, pick a new target
        if (distance < 10) {
          light.targetX = Math.random() * canvas.width;
          light.targetY = Math.random() * canvas.height;
        } else {
          // Move towards target with easing (slower speed)
          const speed = 0.13; // Reduced from 0.5 for slower movement
          light.velocityX = light.velocityX * 0.95 + (dx / distance) * speed;
          light.velocityY = light.velocityY * 0.95 + (dy / distance) * speed;

          // Update position
          light.x += light.velocityX;
          light.y += light.velocityY;
        }
      }
    };

    // Calculate heart scale and color based on light proximity
    const updateHeartScales = () => {
      const hearts = heartsRef.current;
      const lights = lightsRef.current;

      for (let i = 0; i < hearts.length; i++) {
        const heart = hearts[i];

        // Reset scale and color to base values
        heart.scale = heart.baseScale;
        heart.currentColor = heart.baseColor;
        heart.brightness = 0;

        // Variables to track the strongest light influence
        let maxInfluence = 0;
        let dominantLightColor = '';

        // Check influence from each light
        for (let j = 0; j < lights.length; j++) {
          const light = lights[j];

          // Calculate distance from heart to light
          const dx = heart.x - light.x;
          const dy = heart.y - light.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // If within light radius, apply light influence
          if (distance < light.radius) {
            // Calculate influence (1 at center, 0 at radius)
            const influence = 1 - (distance / light.radius);

            // If this light has stronger influence than previous ones
            if (influence > maxInfluence) {
              maxInfluence = influence;
              dominantLightColor = light.color;

              // Apply influence to scale (max scale is 0.8)
              const scaleIncrease = influence * 0.7 * light.intensity;
              heart.scale = Math.max(heart.scale, heart.baseScale + scaleIncrease);

              // Set brightness based on influence
              heart.brightness = influence * light.intensity;
            }
          }
        }

        // If any light is influencing this heart, set its color
        if (maxInfluence > 0) {
          heart.currentColor = dominantLightColor;
        }
      }
    };

    // We don't need to draw the lights themselves anymore
    // as they will only affect the hearts

    // Animation loop
    const render = () => {
      if (!ctx || !canvas) return;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update light positions with time factor for smooth movement
      updateLights();

      // Update heart scales and colors based on light proximity
      updateHeartScales();

      // Draw hearts
      const hearts = heartsRef.current;

      for (let i = 0; i < hearts.length; i++) {
        const heart = hearts[i];

        // Draw heart
        ctx.save();
        // Move to the heart position
        ctx.translate(heart.x, heart.y);
        // Apply scaling (heart is already centered around origin)
        ctx.scale(heart.scale, heart.scale);
        // Set fill style and opacity based on current color and brightness
        ctx.fillStyle = heart.currentColor;
        ctx.globalAlpha = heart.brightness > 0 ? heart.brightness : 0.1; // Slight visibility when not illuminated
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
