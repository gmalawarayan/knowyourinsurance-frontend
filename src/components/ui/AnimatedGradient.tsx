
import React, { useEffect, useRef } from "react";

interface AnimatedGradientProps {
  className?: string;
}

const AnimatedGradient: React.FC<AnimatedGradientProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const colors = [
      { r: 65, g: 105, b: 225, a: 0.5 },  // Royal Blue
      { r: 30, g: 144, b: 255, a: 0.5 },  // Dodger Blue
      { r: 0, g: 191, b: 255, a: 0.5 },   // Deep Sky Blue
    ];

    const blobs = Array.from({ length: 3 }, (_, i) => ({
      x: width * Math.random(),
      y: height * Math.random(),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.min(width, height) * (0.1 + Math.random() * 0.1),
      color: colors[i % colors.length],
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update blob positions
      blobs.forEach(blob => {
        blob.x += blob.vx;
        blob.y += blob.vy;
        
        // Bounce off edges
        if (blob.x < 0 || blob.x > width) blob.vx *= -1;
        if (blob.y < 0 || blob.y > height) blob.vy *= -1;
        
        // Ensure blobs stay within bounds
        blob.x = Math.max(0, Math.min(width, blob.x));
        blob.y = Math.max(0, Math.min(height, blob.y));
      });
      
      // Draw the gradient
      blobs.forEach(blob => {
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        
        gradient.addColorStop(0, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${blob.color.a})`);
        gradient.addColorStop(1, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 -z-10 w-full h-full opacity-60 mask-radial-faded ${className}`}
    />
  );
};

export default AnimatedGradient;
