import React, { useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Timeline from './components/Timeline';
import Projects from './components/Projects';
import AIAssistant from './components/AIAssistant';
import Footer from './components/Footer';

const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Mouse Parallax State
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
        // Calculate mouse position relative to center, normalized
        targetMouseX = (e.clientX - width / 2) * 0.05; 
        targetMouseY = (e.clientY - height / 2) * 0.05;
    };

    interface Star {
      x: number;
      y: number;
      z: number; // Depth (0.1 to 1)
      radius: number;
      baseAlpha: number;
      alpha: number;
      twinkleSpeed: number;
      hue: number;
    }

    interface ShootingStar {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
    }

    const stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    const starCount = 150; 

    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < starCount; i++) {
        const z = Math.random() * 0.8 + 0.2; // 0.2 to 1.0
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: z,
          radius: Math.random() * 1.5 * z,
          baseAlpha: Math.random() * 0.5 + 0.2,
          alpha: Math.random() * 0.5 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          hue: Math.random() * 40 + 200 // 200 (Blue) to 240 (Indigo)
        });
      }
    };

    const spawnShootingStar = () => {
        // Occasional shooting star
        if (Math.random() < 0.01) { 
            const startX = Math.random() * width;
            const startY = Math.random() * height * 0.5;
            shootingStars.push({
                x: startX,
                y: startY,
                vx: -(Math.random() * 10 + 5), // Move Left
                vy: (Math.random() * 5 + 2),   // Move Down
                life: 1.0,
                maxLife: 1.0
            });
        }
    };

    const draw = () => {
      // Smooth interpolation for parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen'; // Make things glow

      // Draw Static Stars
      stars.forEach(star => {
        // Twinkle Logic
        star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.005;
        const currentAlpha = Math.max(0.1, Math.min(1, star.baseAlpha + star.alpha * 0.2));

        // Parallax Position
        let x = star.x + (mouseX * star.z);
        let y = star.y + (mouseY * star.z);
        
        // Wrap for parallax edges (simple visual hack)
        // If it goes too far off screen, we could wrap it, 
        // but for subtle parallax, letting it drift a bit is fine.
        // Let's add constant slow drift to keep it alive
        x -= Date.now() * 0.002 * star.z;
        
        // Wrap x
        x = ((x % width) + width) % width;

        ctx.beginPath();
        const glow = ctx.createRadialGradient(x, y, 0, x, y, star.radius * 4);
        glow.addColorStop(0, `hsla(${star.hue}, 100%, 95%, ${currentAlpha})`);
        glow.addColorStop(0.5, `hsla(${star.hue}, 80%, 80%, ${currentAlpha * 0.3})`);
        glow.addColorStop(1, `hsla(${star.hue}, 80%, 80%, 0)`);
        
        ctx.fillStyle = glow;
        ctx.arc(x, y, star.radius * 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Shooting Stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        
        // Calculate trail
        const trailLen = 100 * s.life;
        const endX = s.x - s.vx * 2; // Head is ahead of x,y logic a bit visually
        const endY = s.y - s.vy * 2;

        const tailX = s.x + trailLen; // Since moving left, tail is to the right
        const tailY = s.y - (trailLen * (s.vy / Math.abs(s.vx)));

        const gradient = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 15, s.y - s.vy * 15);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 5, s.y - s.vy * 5); // Trail length relative to speed
        ctx.stroke();

        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.015;

        if (s.life <= 0 || s.x < -100 || s.y > height + 100) {
            shootingStars.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#020617] pointer-events-none">
        {/* Deep Atmospheric Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_#0f172a_50%,_#020617_100%)] opacity-90"></div>
        
        {/* Canvas Layer */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />
        
        {/* Floating Nebula Orbs (CSS Animation) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[35vw] h-[35vw] bg-blue-500/10 rounded-full blur-[120px] animate-float mix-blend-screen"></div>
        <div className="absolute top-[30%] right-[20%] w-[25vw] h-[25vw] bg-purple-500/10 rounded-full blur-[80px] animate-pulse mix-blend-screen" style={{ animationDuration: '6s' }}></div>
    </div>
  );
};

function App() {
  return (
    <div className="relative min-h-screen text-slate-200 selection:bg-accent/30 selection:text-white overflow-x-hidden font-sans">
      <StarryBackground />
      <Navbar />
      <main className="relative z-10 space-y-24 pb-24">
        <div id="about">
            <Hero />
        </div>
        <Skills />
        <Timeline />
        <Projects />
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
}

export default App;