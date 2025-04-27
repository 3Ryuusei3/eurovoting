import { useRef, useEffect, useState } from 'react'
import { Heart, LightSource, HEART_PATH } from '@/types/Background'
import { colorPalette, baseHeartColor } from '@/constants';

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const heartsRef = useRef<Heart[]>([]);
  const lightsRef = useRef<LightSource[]>([]);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [isMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas 2D not supported');
      return;
    }

    const heartPath = new Path2D();
    const pathScale = 1;
    const pathOffsetX = -13; // Center the heart horizontally
    const pathOffsetY = -13; // Center the heart vertically

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

    let resizeTimeout: number | null = null;

    const resizeCanvas = () => {
      // Clear any pending resize
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout);
      }

      resizeTimeout = window.setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (Math.abs(canvas.width - width) > 10 || Math.abs(canvas.height - height) > 10) {
          setViewportSize({ width, height });
          canvas.width = width;
          canvas.height = height;

          createHearts();
          createLightSources();
        }
      }, 200);
    };

    const createHearts = () => {
      if (!canvas) return;

      const iconSize = isMobile ? 28 : 22;
      const columns = Math.ceil(canvas.width / iconSize);
      const rows = Math.ceil(canvas.height / iconSize);

      const newHearts: Heart[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const x = col * iconSize + iconSize / 2;
          const y = row * iconSize + iconSize / 2;

          newHearts.push({
            x,
            y,
            baseColor: baseHeartColor,
            currentColor: baseHeartColor,
            outlineColor: baseHeartColor,
            baseScale: 0.1,
            scale: 0.1,
            brightness: 0,
            secondaryBrightness: 0
          });
        }
      }

      heartsRef.current = newHearts;
    };

    const createLightSources = () => {
      if (!canvas) return;

      const numLightsPerColor = isMobile ? 5 : 10;
      const totalLights = numLightsPerColor * colorPalette.length;
      const newLights: LightSource[] = [];

      for (let i = 0; i < totalLights; i++) {
        const colorIndex = Math.floor(i / numLightsPerColor);
        const color = colorPalette[colorIndex % colorPalette.length];

        // Random position within the canvas
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        // Random target position for movement
        const targetX = Math.random() * canvas.width;
        const targetY = Math.random() * canvas.height;

        const radius = isMobile ? 175 : 400;

        newLights.push({
          x,
          y,
          color,
          radius,
          intensity: isMobile ? 0.7 : 1,
          velocityX: 0,
          velocityY: 0,
          targetX,
          targetY
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
          const speed = isMobile ? 0.045 : 0.09;
          light.velocityX = light.velocityX * 0.95 + (dx / distance) * speed;
          light.velocityY = light.velocityY * 0.95 + (dy / distance) * speed;

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
        heart.outlineColor = heart.baseColor;
        heart.brightness = 0;
        heart.secondaryBrightness = 0;

        // Variables to track the strongest and second strongest light influences
        let maxInfluence = 0;
        let secondMaxInfluence = 0;
        let dominantLightColor = '';
        let secondaryLightColor = '';

        // Store light influences to find the top two
        const influences: Array<{influence: number; color: string}> = [];

        // Check influence from each light
        for (let j = 0; j < lights.length; j++) {
          const light = lights[j];

          // Calculate distance from heart to light
          const dx = heart.x - light.x;
          const dy = heart.y - light.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // If within light radius, calculate and store influence
          if (distance < light.radius) {
            // Calculate influence (1 at center, 0 at radius)
            const influence = 1 - (distance / light.radius);

            // Store this light's influence and color
            influences.push({
              influence: influence,
              color: light.color
            });
          }
        }

        // Sort influences by strength (descending)
        influences.sort((a, b) => b.influence - a.influence);

        // Apply the strongest influence (if any)
        if (influences.length > 0) {
          maxInfluence = influences[0].influence;
          dominantLightColor = influences[0].color;

          const scaleIncrease = maxInfluence * 0.7 * 0.9;
          heart.scale = heart.baseScale + scaleIncrease;
          heart.brightness = maxInfluence * 0.9;
          heart.currentColor = dominantLightColor;

          // If there's a second light influence and it's a different color
          if (influences.length > 1 && influences[1].color !== dominantLightColor) {
            secondMaxInfluence = influences[1].influence;
            secondaryLightColor = influences[1].color;

            // Only consider secondary influence if it's significant enough compared to primary
            // This creates a more gradual blend when lights are close in influence
            const influenceRatio = secondMaxInfluence / maxInfluence;

            if (influenceRatio > 0.6) { // Secondary influence is at least 60% as strong as primary
              heart.outlineColor = secondaryLightColor;

              // Adjust secondary brightness based on the ratio of influences
              // This creates a more intertwined effect when influences are similar
              heart.secondaryBrightness = secondMaxInfluence * 0.9 * Math.min(influenceRatio, 1.0);

              // If influences are very close (within 20%), reduce primary brightness slightly
              // This helps maintain the circular shape of both light sources
              if (influenceRatio > 0.8) {
                heart.brightness *= 0.9;
              }
            } else {
              // For weaker secondary influences, still show outline but with reduced brightness
              heart.outlineColor = secondaryLightColor;
              heart.secondaryBrightness = secondMaxInfluence * 0.7;
            }
          }
        }
      }
    };

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

        // Use a brighter compositing mode for more vibrant colors
        ctx.globalCompositeOperation = heart.brightness > 0 ? 'lighter' : 'source-over';

        // Increase base opacity for better definition when not illuminated
        // Use higher opacity for illuminated hearts to make colors more vibrant
        ctx.globalAlpha = heart.brightness > 0 ? Math.min(heart.brightness * 1.3, 1.0) : 0.25;

        // Set up outline style based on light influences
        if (heart.secondaryBrightness > 0) {
          // If there's a secondary light influence, use its color for the outline
          ctx.strokeStyle = heart.outlineColor;

          // Adjust line width based on secondary brightness for more intertwined effect
          // Thicker lines when influences are more balanced
          const thicknessMultiplier = heart.secondaryBrightness / heart.brightness;
          ctx.lineWidth = 1.0 + (thicknessMultiplier > 0.8 ? 0.5 : 0);
        } else if (heart.brightness <= 0) {
          // If no light influence, use dark gray outline for definition
          ctx.strokeStyle = '#333333'; // Dark gray outline
          ctx.lineWidth = 0.5;         // Thin line
        }

        // Draw the heart
        ctx.fill(heartPath);

        // Draw the outline if needed
        if (heart.secondaryBrightness > 0 || heart.brightness <= 0) {
          // Apply outline opacity based on secondary brightness or fixed value
          if (heart.secondaryBrightness > 0) {
            // Use a slightly higher opacity for better visibility of secondary color
            // This helps maintain the circular shape of secondary light source
            const enhancedOpacity = Math.min(heart.secondaryBrightness * 1.2, 1.0);
            ctx.globalAlpha = enhancedOpacity;

            // Use additive blending for more vibrant color mixing at intersections
            ctx.globalCompositeOperation = 'lighter';
          }
          ctx.stroke(heartPath);
        }

        // Reset composite operation to default
        ctx.globalCompositeOperation = 'source-over';

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

      // Clean up any pending resize timeout
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout);
      }
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
