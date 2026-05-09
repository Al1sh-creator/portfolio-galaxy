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
  isPensieve: boolean;

  constructor(x: number, y: number, isVoldemort: boolean, isEmber: boolean = false, isPensieve: boolean = false) {
    this.x = x;
    this.y = y;
    this.isEmber = isEmber;
    this.isPensieve = isPensieve;
    
    if (this.isPensieve) {
      // Swirling memory particles
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.color = `hsla(210, 100%, 80%, `; // Silver/Blue
      this.maxLife = Math.random() * 200 + 100;
      this.size = Math.random() * 2 + 0.5;
    } else if (this.isEmber) {
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

  update(mouse: { x: number; y: number }, pensievePullX: number, pensievePullY: number) {
    if (this.isPensieve) {
      // Swirl around a center point
      const dx = pensievePullX - this.x;
      const dy = pensievePullY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Gentle spiral
      this.vx += (dx / dist) * 0.05 + (dy / dist) * 0.02;
      this.vy += (dy / dist) * 0.05 - (dx / dist) * 0.02;
      
      this.vx *= 0.98;
      this.vy *= 0.98;
    } else if (this.isEmber) {
      this.vx += (Math.random() - 0.5) * 0.2; // drift
    } else {
      this.vx *= 0.95; // friction
      this.vy *= 0.95;
    }

    this.x += this.vx;
    this.y += this.vy;
    
    this.life--;
    if (!this.isEmber && !this.isPensieve) this.size *= 0.92;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / this.maxLife;
    ctx.fillStyle = this.color + (this.isPensieve ? alpha * 0.5 : alpha) + ")";
    ctx.shadowBlur = this.isEmber || this.isPensieve ? 10 : 20;
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

    let mouse = { x: width / 2, y: height / 2 };
    let scrollY = 0;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    let particles: Particle[] = [];
    let collisionOffset = 0;
    let collisionTarget = 0;
    let shake = 0;
    
    // Smooth mouse follower for beam gravity
    let gravityTarget = { x: width / 2, y: height / 2 };

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
      
      // Thick wavy beam with gravity influence
      const cp1X = startX + (endX - startX) * 0.33 + (gravityTarget.x - endX) * 0.2;
      const cp1Y = startY + (Math.random() - 0.5) * 150 + (gravityTarget.y - endY) * 0.2;
      const cp2X = startX + (endX - startX) * 0.66 + (gravityTarget.x - endX) * 0.2;
      const cp2Y = endY + (Math.random() - 0.5) * 150 + (gravityTarget.y - endY) * 0.2;
      
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
      
      // Determine if we are in Pensieve mode (user has scrolled down past hero)
      // Hero is approx 100vh. We start blending into Pensieve mode after 300px
      const pensieveFactor = Math.min(1, Math.max(0, (scrollY - 300) / 500));
      
      // Smooth gravity targeting
      gravityTarget.x += (mouse.x - gravityTarget.x) * 0.05;
      gravityTarget.y += (mouse.y - gravityTarget.y) * 0.05;

      // Deep abyss background with heavier fade to keep text readable
      ctx.fillStyle = `rgba(2, 4, 10, ${0.4 + pensieveFactor * 0.4})`; // Darker when scrolled
      ctx.fillRect(0, 0, width, height);

      // Camera Shake based on duel intensity (diminishes in Pensieve mode)
      if (Math.random() > 0.8 && pensieveFactor < 0.5) shake = Math.random() * 10 * (1 - pensieveFactor);
      const shakeX = (Math.random() - 0.5) * shake;
      const shakeY = (Math.random() - 0.5) * shake;
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Duel collision logic
      if (time % 45 === 0) {
        collisionTarget = (Math.random() - 0.5) * 300;
      }
      collisionOffset += (collisionTarget - collisionOffset) * 0.08;

      // Base positions
      const originVoldemortX = 0;
      const originVoldemortY = height * 0.6; 
      const originDumbledoreX = width;
      const originDumbledoreY = height * 0.8; 

      // Collision point gravitates toward mouse slightly
      const collisionX = width / 2 + collisionOffset + (gravityTarget.x - width / 2) * 0.3;
      const collisionY = height * 0.65 + Math.sin(time * 0.1) * 30 + (gravityTarget.y - height / 2) * 0.3;

      if (pensieveFactor < 1) {
        // We are still showing the duel (partially or fully)
        ctx.globalAlpha = 1 - pensieveFactor;

        // Flash effect
        if (Math.random() > 0.98) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
          ctx.fillRect(0, 0, width, height);
        }

        // Draw Beams
        drawEnergyBeam(originVoldemortX, originVoldemortY, collisionX, collisionY, true);
        drawLightning(originVoldemortX, originVoldemortY, collisionX, collisionY, true);
        drawLightning(originVoldemortX, originVoldemortY, collisionX, collisionY, true);

        drawEnergyBeam(originDumbledoreX, originDumbledoreY, collisionX, collisionY, false);
        drawLightning(originDumbledoreX, originDumbledoreY, collisionX, collisionY, false);
        drawLightning(originDumbledoreX, originDumbledoreY, collisionX, collisionY, false);

        // Collision Core
        const coreSize = Math.random() * 40 + 50;
        const gradient = ctx.createRadialGradient(collisionX, collisionY, 0, collisionX, collisionY, coreSize * 2.5);
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.1, Math.random() > 0.5 ? "#4ade80" : "#60a5fa");
        gradient.addColorStop(0.3, Math.random() > 0.5 ? "#166534" : "#1e3a8a");
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = "screen";
        ctx.beginPath();
        ctx.arc(collisionX, collisionY, coreSize * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over"; // reset

        // Spawn Explosion Particles
        if (pensieveFactor < 0.5) {
          for (let i = 0; i < 4; i++) {
            particles.push(new Particle(collisionX, collisionY, Math.random() > 0.5));
          }
        }
        ctx.globalAlpha = 1;
      }

      // Pensieve Mode (Swirling silver particles)
      if (pensieveFactor > 0) {
        if (Math.random() < pensieveFactor * 0.5) {
          // Spawn Pensieve threads near the mouse or screen center
          const spawnX = Math.random() * width;
          const spawnY = Math.random() * height;
          particles.push(new Particle(spawnX, spawnY, false, false, true));
        }
      } else {
        // Spawn Ambient Embers for the duel
        if (Math.random() > 0.5) {
          particles.push(new Particle(Math.random() * width, height + 10, false, true));
        }
      }

      // Update and draw particles
      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        p.update(gravityTarget, width / 2, height / 2 + scrollY * 0.2); // Pass scroll parallax down to pensieve
        p.draw(ctx);
      });

      ctx.restore(); // restore camera shake
      shake *= 0.9; // decay shake

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
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
