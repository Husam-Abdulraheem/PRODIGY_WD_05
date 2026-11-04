/**
 * Dynamic Ambient Weather Canvas Engine
 * Renders lightweight, 60fps GPU-friendly weather particles (rain, snow, sunbeams, clouds, stars).
 * Respects prefers-reduced-motion and document visibility.
 */

export class WeatherCanvas {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.weatherType = 'clear'; // 'clear' | 'clouds' | 'rain' | 'snow' | 'thunder' | 'fog'
    this.isDay = true;
    this.animId = null;
    this.isRunning = false;
    this.isEnabled = true;
    this.lastTime = 0;
    this.lightningTimer = 0;
    this.flashOpacity = 0;

    this.checkReducedMotion();
    this.resize();

    window.addEventListener('resize', () => this.resize(), { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else if (this.isEnabled) {
        this.start();
      }
    });
  }

  checkReducedMotion() {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = media.matches;
    media.addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      if (this.reducedMotion) this.stop();
      else if (this.isEnabled) this.start();
    });
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.initParticles();
  }

  setWeather(category, isDay = true) {
    this.weatherType = category || 'clear';
    this.isDay = Boolean(isDay);
    this.initParticles();
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled || this.reducedMotion) {
      this.stop();
      this.clear();
    } else {
      this.start();
    }
  }

  clear() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  initParticles() {
    this.particles = [];
    if (!this.width || !this.height) return;

    const count = this.getParticleCount();

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  getParticleCount() {
    // Keep count modest for performance (< 100)
    switch (this.weatherType) {
      case 'rain': return Math.min(80, Math.floor(this.width / 16));
      case 'snow': return Math.min(60, Math.floor(this.width / 20));
      case 'thunder': return Math.min(90, Math.floor(this.width / 14));
      case 'clouds': return Math.min(18, Math.floor(this.width / 80));
      case 'fog': return 12;
      case 'clear':
        return this.isDay ? 25 : 65; // Stars or dust motes
      default: return 30;
    }
  }

  createParticle() {
    const w = this.width;
    const h = this.height;

    switch (this.weatherType) {
      case 'rain':
      case 'thunder':
        return {
          x: Math.random() * (w + 100) - 50,
          y: Math.random() * h,
          length: 12 + Math.random() * 16,
          speed: 16 + Math.random() * 10,
          thickness: 1 + Math.random() * 1.5,
          opacity: 0.2 + Math.random() * 0.4
        };

      case 'snow':
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 1.5 + Math.random() * 3,
          speedY: 0.8 + Math.random() * 1.6,
          speedX: Math.sin(Math.random() * Math.PI) * 0.8,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.03,
          opacity: 0.3 + Math.random() * 0.6
        };

      case 'clouds':
      case 'fog':
        return {
          x: Math.random() * (w + 200) - 100,
          y: (Math.random() * 0.6 + 0.1) * h,
          radius: 90 + Math.random() * 140,
          speedX: (0.15 + Math.random() * 0.25) * (Math.random() > 0.5 ? 1 : 1),
          opacity: 0.05 + Math.random() * 0.08
        };

      case 'clear':
      default:
        if (this.isDay) {
          // Warm glowing light motes
          return {
            x: Math.random() * w,
            y: Math.random() * h,
            radius: 1 + Math.random() * 2.5,
            speedY: -0.2 - Math.random() * 0.4,
            speedX: (Math.random() - 0.5) * 0.3,
            opacity: 0.15 + Math.random() * 0.35,
            pulse: Math.random() * Math.PI * 2
          };
        } else {
          // Night twinkling stars
          return {
            x: Math.random() * w,
            y: Math.random() * (h * 0.75),
            radius: 0.8 + Math.random() * 1.8,
            twinkleSpeed: 0.02 + Math.random() * 0.04,
            twinklePhase: Math.random() * Math.PI * 2,
            baseOpacity: 0.2 + Math.random() * 0.6
          };
        }
    }
  }

  start() {
    if (this.isRunning || this.reducedMotion || !this.isEnabled) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render weather category
    switch (this.weatherType) {
      case 'rain':
        this.renderRain();
        break;
      case 'thunder':
        this.renderThunder();
        break;
      case 'snow':
        this.renderSnow();
        break;
      case 'clouds':
      case 'fog':
        this.renderClouds();
        break;
      case 'clear':
      default:
        if (this.isDay) this.renderSunMotes();
        else this.renderStars();
        break;
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }

  renderRain() {
    this.ctx.strokeStyle = 'rgba(156, 196, 255, 0.5)';
    this.ctx.lineWidth = 1.2;

    for (const p of this.particles) {
      p.y += p.speed;
      p.x += p.speed * 0.25; // Slight angle

      if (p.y > this.height) {
        p.y = -p.length;
        p.x = Math.random() * (this.width + 100) - 50;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(p.x - p.length * 0.25, p.y + p.length);
      this.ctx.stroke();
    }
  }

  renderThunder() {
    this.renderRain();

    // Occasional lightning flash
    this.lightningTimer += 1;
    if (this.lightningTimer > 240 && Math.random() < 0.015) {
      this.flashOpacity = 0.45;
      this.lightningTimer = 0;
    }

    if (this.flashOpacity > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashOpacity})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.flashOpacity -= 0.03;
    }
  }

  renderSnow() {
    for (const p of this.particles) {
      p.wobble += p.wobbleSpeed;
      p.y += p.speedY;
      p.x += Math.sin(p.wobble) * 0.8 + p.speedX;

      if (p.y > this.height) {
        p.y = -10;
        p.x = Math.random() * this.width;
      }

      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  renderClouds() {
    for (const p of this.particles) {
      p.x += p.speedX;
      if (p.x - p.radius > this.width) {
        p.x = -p.radius;
      }

      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      const color = this.isDay ? '255, 255, 255' : '180, 200, 230';
      grad.addColorStop(0, `rgba(${color}, ${p.opacity})`);
      grad.addColorStop(1, `rgba(${color}, 0)`);

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  renderSunMotes() {
    for (const p of this.particles) {
      p.pulse += 0.03;
      p.y += p.speedY;
      p.x += p.speedX;

      if (p.y < 0) {
        p.y = this.height;
        p.x = Math.random() * this.width;
      }

      const currentOpacity = p.opacity * (0.7 + Math.sin(p.pulse) * 0.3);
      this.ctx.fillStyle = `rgba(255, 230, 160, ${currentOpacity})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  renderStars() {
    for (const p of this.particles) {
      p.twinklePhase += p.twinkleSpeed;
      const currentOpacity = p.baseOpacity * (0.6 + Math.sin(p.twinklePhase) * 0.4);

      this.ctx.fillStyle = `rgba(235, 245, 255, ${currentOpacity})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
