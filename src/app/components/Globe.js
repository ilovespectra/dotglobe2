

import { useEffect, useRef, useState } from 'react';

const Globe = () => {
  const canvasRef = useRef(null);
  const velocityRef = useRef(0); // To store the momentum velocity
  const scrollYRef = useRef(0); // Ref to keep track of scroll position
  const animationRef = useRef(null);
  const rippleOffsetRef = useRef(0); // To track the ripple animation over time

  // State for mouse position
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const dotSize = 4;
    const gap = 22;
    const radius = (Math.min(canvas.width, canvas.height) / 2 - 100) * 2;

   // Function to draw ellipse (dots)
const drawEllipse = (x, y, rx, ry, color = 'rgba(255, 255, 255, 0.8)', shadow = '') => {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
  ctx.fillStyle = color; // Set the color of the dot
  ctx.shadowBlur = shadow ? 20 : 0; // Increase the shadow for more glow effect
  ctx.shadowColor = shadow ? 'rgba(255, 255, 255, 0.8)' : 'transparent'; // Set the shadow color (for the glow effect)
  ctx.fill();
};


    // Function to simulate the wavy, rippling effect on the globe
const drawRipplingEffect = (x, y, distanceFromCenter) => {
  // Set oscillation speed for smooth transition between values (slower)
  const oscillationSpeed = 0.0000000000000000000000001; // Slow down the oscillation speed for a more relaxed effect

  // Update rippleOffsetRef for continuous, smooth oscillation
  rippleOffsetRef.current += oscillationSpeed;

  // Oscillate rippleStrength between 5 and 15 (so it's more subtle)
  const rippleStrength = 5 + (Math.sin(rippleOffsetRef.current) * 5 + 5); // Range between 5 and 15
  
  // Oscillate rippleFrequency between 0.2 and 0.5 (so it doesn't oscillate too rapidly)
  const rippleFrequency = 0.2 + (Math.sin(rippleOffsetRef.current) * 0.001 + 0.05); // Range between 0.2 and 0.5
  
  // Calculate the wave effect using the oscillated values
  const wave = Math.sin(rippleOffsetRef.current + distanceFromCenter * rippleFrequency) * rippleStrength;
  return wave;
};


    // Handle mouse movement
    const handleMouseMove = (event) => {
      const { clientX, clientY } = event;
      setMousePosition({ x: clientX, y: clientY });
    };

    // Function to draw the globe and apply gravity to dots based on mouse position
    const drawGlobe = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scrollFactor = Math.min(scrollYRef.current / 1000, 2); // Extended range for smoother transition

      // Iterate through latitudinal sections
      for (let y = -radius; y <= radius; y += gap) {
        const latitudeFactor = (y + radius) / (2 * radius);
        const distanceFromEquator = Math.abs(0.5 - latitudeFactor);

        // Cascading spread effect
        const spreadEffect = scrollFactor * (1 - distanceFromEquator) ** 3 * 800;
        const verticalEffect = scrollFactor * (1 - latitudeFactor) ** 3 * 600;

        // Apply stronger spread near the center
        for (let x = -radius; x <= radius; x += gap) {
          const distance = Math.sqrt(x * x + y * y);
          if (distance > radius) continue;

          // Calculate the distance from the center
          const centerDistance = Math.sqrt(x * x + y * y);
          const centerSpreadFactor = Math.pow(1 - centerDistance / radius, 1);

          let adjustedSpreadEffect = spreadEffect * centerSpreadFactor;
          let adjustedVerticalEffect = verticalEffect * centerSpreadFactor;

          const perspective = Math.sqrt(1 - (distance / radius) ** 2);
          let dotX = centerX + x * perspective;
          let dotY = centerY + y * perspective;

          // Apply dynamic spread effects
          dotX += x > 0 ? adjustedSpreadEffect : -adjustedSpreadEffect;
          dotY += y < 0 ? -adjustedVerticalEffect : adjustedVerticalEffect;

          // Apply ripple effect to simulate ocean-like motion
          const ripple = drawRipplingEffect(x, y, distance);
          dotX += ripple;
          dotY += ripple;

          // Calculate distance to the mouse
          const dx = mousePosition.x - dotX;
          const dy = mousePosition.y - dotY;
          const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
          
          // Apply gravity effect (closer dots get pulled more)
          const gravityEffect = Math.min(30 / distanceToMouse, 0.2); // Max pull effect

          dotX += gravityEffect * dx; // Pull the dot in the x direction
          dotY += gravityEffect * dy; // Pull the dot in the y direction

          // Adjust dot size based on perspective
          const rx = dotSize * (1 - perspective * 0.6);
          const ry = dotSize * perspective;

          // Glimmer effect: add a subtle white shadow for the gravity-impacted dots
          const glimmerEffect = gravityEffect > 0.1 ? 10 : 0; // Apply shadow only if gravity is strong enough

          drawEllipse(dotX, dotY, rx, ry, 'rgba(255, 255, 255, 0.8)', glimmerEffect);
        }
      }
    };

    // Animation loop
    const animate = () => {
      scrollYRef.current -= velocityRef.current;
      if (Math.abs(velocityRef.current) < 0.01) velocityRef.current = 0;
      velocityRef.current *= 0.95;

      rippleOffsetRef.current += 0.008;

      drawGlobe();
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawGlobe();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const handleWheel = (event) => {
      velocityRef.current -= event.deltaY * 0.5;
    };

    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mousePosition]); // Re-run animation when mouse position changes

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
};

export default Globe;
