'use client';

import React, { useEffect, useRef } from 'react';

export default function HeroParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle types: leaves (green), seeds (earthy), light spots (sparkly)
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 15 + 5;
        this.speedY = -(Math.random() * 1.5 + 0.5);
        this.speedX = Math.random() * 1 - 0.5;
        this.wobble = Math.random() * 0.05;
        this.wobbleSpeed = Math.random() * 0.02 + 0.005;
        this.alpha = Math.random() * 0.4 + 0.1;
        
        // Define aesthetic color palettes: soft green, light yellow, forest green, warm cream
        const colors = [
          'rgba(22, 163, 74, ',  // primary green
          'rgba(187, 247, 208, ', // primary-light
          'rgba(202, 138, 4, ',  // yellow-600 secondary
          'rgba(120, 113, 108, ', // earth stone-500
        ];
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.02 - 0.01;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.beginPath();
        // Drawing beautiful organic leaf/seed shape
        ctx.ellipse(0, 0, this.size, this.size / 2.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = `${this.colorPrefix}${this.alpha})`;
        ctx.fill();
        
        // Draw center line of leaf
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.wobble) * 0.3;
        this.wobble += this.wobbleSpeed;
        this.rotation += this.rotationSpeed;

        // Fade out as it goes high
        if (this.y < canvas.height * 0.2) {
          this.alpha -= 0.002;
        }

        // Reset if offscreen or faded
        if (this.y < -50 || this.alpha <= 0 || this.x < -50 || this.x > canvas.width + 50) {
          this.reset();
        }
      }
    }

    // Create particles
    const initParticles = () => {
      particles = [];
      const count = Math.min(Math.floor(canvas.width / 25), 45); // Limit density for performance
      for (let i = 0; i < count; i++) {
        const p = new Particle();
        p.y = Math.random() * canvas.height; // Spread initially
        particles.push(p);
      }
    };

    initParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw subtle warm sun gradient at the bottom/center
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.8, 10,
        canvas.width / 2, canvas.height * 0.8, canvas.height * 0.6
      );
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.15)'); // yellow-100
      grad.addColorStop(0.5, 'rgba(240, 253, 244, 0.08)'); // green-50
      grad.addColorStop(1, 'rgba(250, 250, 249, 0)'); // bg stone-50
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-hidden"
    />
  );
}
