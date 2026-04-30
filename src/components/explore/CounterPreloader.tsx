import { useEffect, useState, useRef } from "react";
import oneappLogo from "@/assets/oneapp-logo.png";

interface CounterPreloaderProps {
  onComplete: () => void;
}

export function CounterPreloader({ onComplete }: CounterPreloaderProps) {
  const [count, setCount] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Star background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles.length = 0;
      const particleCount = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.6 + 0.2,
        });
      }
    };

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Counter animation (1.5s = 1500ms)
  useEffect(() => {
    const duration = 1500;
    const steps = 100;
    const stepDuration = duration / steps;

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  // Exit animation when counter reaches 100
  useEffect(() => {
    if (count === 100) {
      const exitTimer = setTimeout(() => setIsExiting(true), 400);
      const completeTimer = setTimeout(() => onComplete(), 900);
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [count, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-all duration-500 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Star background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ background: "transparent" }}
      />

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col items-center gap-6 transition-all duration-500 ${
          isExiting ? "translate-y-[-30px] opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        {/* Logo + OneApp */}
        <div className="flex items-center gap-3">
          <img src={oneappLogo} alt="OneApp" className="w-10 h-10" />
          <span className="text-white text-2xl font-bold tracking-wider">OneApp</span>
        </div>

        {/* Progress Bar with Counter */}
        <div className="w-64 md:w-80 flex flex-col items-center gap-2">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75 ease-linear"
              style={{
                width: `${count}%`,
                background: "linear-gradient(90deg, #00F0FF, #00C4CC)",
              }}
            />
          </div>
          <span className="text-white/70 text-xs font-thin tracking-wide">
            {count}%
          </span>
        </div>

        {/* Subtext with blinking effect */}
        <p className="text-white/50 text-sm font-light tracking-wide animate-pulse">
          Greeting, welcome to <span className="text-cyan-400">OneApp</span>.
        </p>
      </div>
    </div>
  );
}
