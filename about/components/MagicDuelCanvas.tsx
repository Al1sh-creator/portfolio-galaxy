"use client";

import { useEffect, useRef } from "react";

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  isEmber: boolean;

  constructor(x: number, y: number, isVoldemort: boolean, isEmber: boolean = false) {
    this.x = x;
    this.y = y;
    this.isEmber = isEmber;
    
    if (this.isEmber) {
      // Ambient rising embers
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = -Math.random() * 3 - 1;
      this.color = `hsla(${Math.random() > 0.5 ? 30 : 10}, 100%, 60%, `;
      this.maxLife = Math.random() * 100 + 50;
      this.size = Math.random() * 3 + 1;
    } else {
      // Explosive velocity outward from collision
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      // Push Voldemort sparks left, Dumbledore sparks right
      if (isVoldemort) {
        this.vx -= Math.random() * 8;
        this.color = `hsla(120, 100%, ${Math.random() * 40 + 40}%, `;
      } else {
        this.vx += Math.random() * 8;
        this.color = `hsla(${Math.random() > 0.5 ? 210 : 45}, 100%, ${Math.random() * 40 + 50}%, `; // Blue or Gold
      }
      this.maxLife = Math.random() * 30 + 10;
      this.size = Math.random() * 5 + 2;
    }
    
    this.life = this.maxLife;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    if (this.isEmber) {
      this.vx += (Math.random() - 0.5) * 0.2; // drift
    } else {
      this.vx *= 0.95; // friction
      this.vy *= 0.95;
    }
    
    this.life--;
    if (!this.isEmber) this.size *= 0.92;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / this.maxLife;
    ctx.fillStyle = this.color + alpha + ")";
    ctx.shadowBlur = this.isEmber ? 10 : 20;
    ctx.shadowColor = this.color + "1)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

export default function MagicDuelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false }); // Optimize
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    let particles: Particle[] = [];
    let collisionOffset = 0;
    let collisionTarget = 0;
    let shake = 0;

    const drawLightning = (startX: number, startY: number, endX: number, endY: number, isGreen: boolean) => {
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      const segments = 15;
      let currX = startX;
      let currY = startY;

      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const targetX = startX + (endX - startX) * t;
        const targetY = startY + (endY - startY) * t;
        
        // Intense jaggedness
        const jitterX = (Math.random() - 0.5) * 80;
        const jitterY = (Math.random() - 0.5) * 80;

        currX = targetX + jitterX;
        currY = targetY + jitterY;

        ctx.lineTo(currX, currY);
      }
      ctx.lineTo(endX, endY);

      ctx.lineWidth = Math.random() * 6 + 2;
      ctx.strokeStyle = isGreen ? `hsla(120, 100%, 70%, ${Math.random() * 0.8 + 0.2})` : `hsla(210, 100%, 80%, ${Math.random() * 0.8 + 0.2})`;
      
      ctx.shadowBlur = 30;
      ctx.shadowColor = isGreen ? "#22c55e" : "#3b82f6";
      ctx.stroke();
      
      // Core lightning
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawEnergyBeam = (startX: number, startY: number, endX: number, endY: number, isGreen: boolean) => {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      // Thick wavy beam
      const cp1X = startX + (endX - startX) * 0.33;
      const cp1Y = startY + (Math.random() - 0.5) * 150;
      const cp2X = startX + (endX - startX) * 0.66;
      const cp2Y = endY + (Math.random() - 0.5) * 150;
      
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
      
      ctx.lineWidth = Math.random() * 30 + 15;
      ctx.strokeStyle = isGreen ? `hsla(120, 100%, 40%, 0.15)` : `hsla(45, 100%, 60%, 0.15)`; // Gold for Dumbledore
      ctx.stroke();

      ctx.lineWidth = Math.random() * 15 + 8;
      ctx.strokeStyle = isGreen ? `hsla(120, 100%, 60%, 0.4)` : `hsla(210, 100%, 70%, 0.4)`; // Blue inner
      ctx.stroke();
      
      // Blinding white core
      ctx.beginPath();
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
      ctx.lineWidth = Math.random() * 8 + 4;
      ctx.strokeStyle = "#ffffff";
      ctx.shadowBlur = 20;
      ctx.shadowColor = isGreen ? "#22c55e" : "#fcd34d";
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    let time = 0;

    const animate = () => {
      time++;
      
      // Deep abyss background with heavier fade to keep text readable
      ctx.fillStyle = "rgba(2, 4, 10, 0.4)";
      ctx.fillRect(0, 0, width, height);

      // Flash effect on impact shifts (reduced frequency and opacity)
      if (Math.random() > 0.98) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
        ctx.fillRect(0, 0, width, height);
      }

      // Camera Shake
      if (Math.random() > 0.8) shake = Math.random() * 10;
      const shakeX = (Math.random() - 0.5) * shake;
      const shakeY = (Math.random() - 0.5) * shake;
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Oscillate collision point
      if (time % 45 === 0) {
        collisionTarget = (Math.random() - 0.5) * 300;
      }
      collisionOffset += (collisionTarget - collisionOffset) * 0.08;

      // Push the duel slightly lower so it doesn't block the main Hero text
      const originVoldemortX = 0;
      const originVoldemortY = height * 0.6; 
      
      const originDumbledoreX = width;
      const originDumbledoreY = height * 0.8; 

      const collisionX = width / 2 + collisionOffset;
      const collisionY = height * 0.65 + Math.sin(time * 0.1) * 30;

      // Draw Voldemort's Beam
      drawEnergyBeam(originVoldemortX, originVoldemortY, collisionX, collisionY, true);
      drawLightning(originVoldemortX, originVoldemortY, collisionX, collisionY, true);
      drawLightning(originVoldemortX, originVoldemortY, collisionX, collisionY, true);
      drawLightning(originVoldemortX, originVoldemortY, collisionX, collisionY, true);

      // Draw Dumbledore's Beam
      drawEnergyBeam(originDumbledoreX, originDumbledoreY, collisionX, collisionY, false);
      drawLightning(originDumbledoreX, originDumbledoreY, collisionX, collisionY, false);
      drawLightning(originDumbledoreX, originDumbledoreY, collisionX, collisionY, false);

      // Intense Collision Core
      const coreSize = Math.random() * 40 + 50;
      const gradient = ctx.createRadialGradient(collisionX, collisionY, 0, collisionX, collisionY, coreSize * 2.5);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.1, Math.random() > 0.5 ? "#4ade80" : "#60a5fa"); // bright green or blue
      gradient.addColorStop(0.3, Math.random() > 0.5 ? "#166534" : "#1e3a8a"); // deep green or blue
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = "screen";
      ctx.beginPath();
      ctx.arc(collisionX, collisionY, coreSize * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over"; // reset

      // Spawn Explosion Particles
      for (let i = 0; i < 8; i++) {
        particles.push(new Particle(collisionX, collisionY, Math.random() > 0.5));
      }
      
      // Spawn Ambient Embers
      if (Math.random() > 0.5) {
        particles.push(new Particle(Math.random() * width, height + 10, false, true));
      }

      // Update and draw particles
      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      ctx.restore(); // restore camera shake
      shake *= 0.9; // decay shake

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ opacity: 0.4 }}
      />
      {/* Dark vignette to protect text legibility at edges and center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,4,10,0.8)_80%)]"></div>
    </div>
  );
}
