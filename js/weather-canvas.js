/**
 * Dynamic Ambient Weather Canvas Engine
 * Renders high-fidelity, GPU-friendly weather visuals (animated sun with rotating rays,
 * glowing crescent moon with starfield & shooting stars, volumetric drifting clouds,
 * angled rain streaks with expanding splash ripples, jagged branching lightning,
 * fluttering snowflakes, and rolling atmospheric mist).
 *
 * Fully adaptive to both Light and Dark themes.
 * Respects prefers-reduced-motion and document visibility.
 */

export class WeatherCanvas {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.ripples = [];
    this.clouds = [];
    this.shootingStars = [];
    this.weatherType = 'clear'; // 'clear' | 'clouds' | 'rain' | 'snow' | 'thunder' | 'fog'
    this.isDay = true;
    this.theme = this.detectCurrentTheme();
    this.animId = null;
    this.isRunning = false;
    this.isEnabled = true;
    this.tick = 0;
    this.sunRayAngle = 0;
    this.lightningTimer = 0;
    this.lightningBolt = null;
    this.flashOpacity = 0;
    this.meteorTimer = 0;

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

  detectCurrentTheme() {
    if (typeof document === 'undefined') return 'light';
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta && (meta.content === 'light' || meta.content === 'dark')) return meta.content;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
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

  setTheme(theme) {
    this.theme = (theme === 'light' || theme === 'dark') ? theme : this.detectCurrentTheme();
  }

  setWeather(category, isDay = true, theme = null) {
    this.weatherType = category || 'clear';
    this.isDay = Boolean(isDay);
    if (theme) {
      this.theme = theme;
    } else {
      this.theme = this.detectCurrentTheme();
    }
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
    this.ripples = [];
    this.clouds = [];
    this.shootingStars = [];
    this.lightningBolt = null;
    this.flashOpacity = 0;
    if (!this.width || !this.height) return;

    const w = this.width;
    const h = this.height;

    switch (this.weatherType) {
      case 'rain':
      case 'thunder': {
        const rainCount = Math.min(85, Math.max(35, Math.floor(w / 18)));
        for (let i = 0; i < rainCount; i++) {
          this.particles.push({
            x: Math.random() * (w + 120) - 60,
            y: Math.random() * h,
            length: 16 + Math.random() * 20,
            speed: 18 + Math.random() * 12,
            thickness: 1.2 + Math.random() * 1.2,
            opacity: 0.25 + Math.random() * 0.45
          });
        }
        break;
      }

      case 'snow': {
        const snowCount = Math.min(75, Math.max(30, Math.floor(w / 20)));
        for (let i = 0; i < snowCount; i++) {
          const depth = Math.random(); // 0: background, 1: foreground
          this.particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            radius: depth > 0.8 ? (4 + Math.random() * 2.5) : (1.2 + Math.random() * 2.5),
            speedY: depth > 0.8 ? (1.5 + Math.random() * 1.5) : (0.7 + Math.random() * 1.1),
            speedX: (Math.random() - 0.5) * 0.5,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.015 + Math.random() * 0.03,
            opacity: depth > 0.8 ? (0.45 + Math.random() * 0.3) : (0.3 + Math.random() * 0.5),
            depth
          });
        }
        break;
      }

      case 'clouds': {
        // Multi-puff volumetric cloud clusters drifting horizontally
        const clusterCount = Math.min(5, Math.max(3, Math.floor(w / 320)));
        for (let c = 0; c < clusterCount; c++) {
          const baseX = (w / clusterCount) * c + (Math.random() * 80 - 40);
          const baseY = (0.08 + Math.random() * 0.35) * h;
          const puffCount = 5 + Math.floor(Math.random() * 4);
          const puffs = [];
          for (let p = 0; p < puffCount; p++) {
            puffs.push({
              offsetX: (p - puffCount / 2) * (35 + Math.random() * 20),
              offsetY: (Math.random() - 0.5) * 24,
              radius: 65 + Math.random() * 55,
              opacity: 0.18 + Math.random() * 0.15
            });
          }
          this.clouds.push({
            x: baseX,
            y: baseY,
            speedX: 0.18 + Math.random() * 0.22,
            puffs
          });
        }
        break;
      }

      case 'fog': {
        const bandCount = 6;
        for (let i = 0; i < bandCount; i++) {
          this.particles.push({
            y: (0.15 + (i / bandCount) * 0.7) * h,
            speedX: (0.2 + Math.random() * 0.3) * (i % 2 === 0 ? 1 : -1),
            offset: Math.random() * Math.PI * 2,
            height: 90 + Math.random() * 80,
            opacity: 0.12 + Math.random() * 0.12
          });
        }
        break;
      }

      case 'clear':
      default: {
        if (this.isDay) {
          // Warm golden floating solar motes
          const moteCount = Math.min(32, Math.max(16, Math.floor(w / 50)));
          for (let i = 0; i < moteCount; i++) {
            this.particles.push({
              x: Math.random() * w,
              y: Math.random() * h,
              radius: 1.2 + Math.random() * 2.8,
              speedY: -0.25 - Math.random() * 0.45,
              speedX: (Math.random() - 0.5) * 0.35,
              opacity: 0.2 + Math.random() * 0.45,
              pulse: Math.random() * Math.PI * 2
            });
          }
        } else {
          // Twinkling celestial stars
          const starCount = Math.min(85, Math.max(40, Math.floor(w / 18)));
          for (let i = 0; i < starCount; i++) {
            this.particles.push({
              x: Math.random() * w,
              y: Math.random() * (h * 0.8),
              radius: 0.8 + Math.random() * 1.8,
              twinkleSpeed: 0.02 + Math.random() * 0.04,
              twinklePhase: Math.random() * Math.PI * 2,
              baseOpacity: 0.3 + Math.random() * 0.6,
              hasSpikes: Math.random() > 0.85
            });
          }
        }
        break;
      }
    }
  }

  start() {
    if (this.isRunning || this.reducedMotion || !this.isEnabled) return;
    this.isRunning = true;
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
    this.tick += 1;
    this.clear();

    switch (this.weatherType) {
      case 'clear':
        if (this.isDay) {
          this.renderSun();
          this.renderSunMotes();
        } else {
          this.renderMoon();
          this.renderStars();
          this.renderShootingStars();
        }
        break;

      case 'clouds':
        if (this.isDay) {
          this.renderDiffusedSun();
        } else {
          this.renderDiffusedMoon();
        }
        this.renderClouds();
        break;

      case 'rain':
        this.renderRain();
        this.renderRipples();
        break;

      case 'thunder':
        this.renderThunder();
        this.renderRain();
        this.renderRipples();
        break;

      case 'snow':
        this.renderSnow();
        break;

      case 'fog':
        this.renderFog();
        break;

      default:
        if (this.isDay) this.renderSun();
        else this.renderMoon();
        break;
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }

  /* -------------------------------------------------------------
   * SUN RENDERING (Sunny / Clear Day)
   * Displays glowing sun core, pulsating corona, rotating radiant rays,
   * and floating golden ambient solar dust.
   * ------------------------------------------------------------- */
  renderSun() {
    const isDark = this.theme === 'dark';
    const ctx = this.ctx;

    // Position sun elegantly in upper-right atmospheric area
    const sunX = Math.max(100, Math.min(this.width - 120, this.width * 0.82));
    const sunY = Math.max(85, Math.min(160, this.height * 0.16));
    const baseR = Math.min(50, Math.max(34, Math.min(this.width, this.height) * 0.055));

    this.sunRayAngle += 0.0025;

    // 1. Broad atmospheric solar warmth gradient
    const outerRadius = baseR * 4.6;
    const outerGrad = ctx.createRadialGradient(sunX, sunY, baseR * 0.4, sunX, sunY, outerRadius);
    if (isDark) {
      outerGrad.addColorStop(0, 'rgba(255, 175, 40, 0.22)');
      outerGrad.addColorStop(0.5, 'rgba(245, 130, 10, 0.08)');
      outerGrad.addColorStop(1, 'rgba(245, 130, 10, 0)');
    } else {
      outerGrad.addColorStop(0, 'rgba(255, 205, 55, 0.28)');
      outerGrad.addColorStop(0.5, 'rgba(255, 170, 20, 0.12)');
      outerGrad.addColorStop(1, 'rgba(255, 170, 20, 0)');
    }
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Rotating radiant sunbeams (12 distinct tapering flares)
    const rayCount = 12;
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(this.sunRayAngle);

    for (let i = 0; i < rayCount; i++) {
      const angle = (i * Math.PI * 2) / rayCount;
      const pulse = Math.sin(this.tick * 0.04 + i * 0.8) * (baseR * 0.25);
      const rayLen = baseR * 1.75 + pulse;
      const rayWidth = baseR * 0.22;

      ctx.save();
      ctx.rotate(angle);
      const rayGrad = ctx.createLinearGradient(0, 0, 0, rayLen);
      if (isDark) {
        rayGrad.addColorStop(0, 'rgba(255, 200, 60, 0.32)');
        rayGrad.addColorStop(0.6, 'rgba(255, 160, 30, 0.15)');
        rayGrad.addColorStop(1, 'rgba(255, 140, 0, 0)');
      } else {
        rayGrad.addColorStop(0, 'rgba(255, 215, 80, 0.45)');
        rayGrad.addColorStop(0.6, 'rgba(255, 180, 30, 0.22)');
        rayGrad.addColorStop(1, 'rgba(255, 160, 0, 0)');
      }

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(-rayWidth * 0.5, baseR * 0.85);
      ctx.lineTo(0, rayLen);
      ctx.lineTo(rayWidth * 0.5, baseR * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // 3. Pulsating secondary corona halo
    const coronaR = baseR * (1.28 + Math.sin(this.tick * 0.035) * 0.06);
    const coronaGrad = ctx.createRadialGradient(sunX, sunY, baseR * 0.8, sunX, sunY, coronaR);
    if (isDark) {
      coronaGrad.addColorStop(0, 'rgba(255, 190, 50, 0.5)');
      coronaGrad.addColorStop(1, 'rgba(255, 140, 10, 0)');
    } else {
      coronaGrad.addColorStop(0, 'rgba(255, 220, 90, 0.6)');
      coronaGrad.addColorStop(1, 'rgba(255, 180, 20, 0)');
    }
    ctx.fillStyle = coronaGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, coronaR, 0, Math.PI * 2);
    ctx.fill();

    // 4. Luminous sun core sphere
    const coreGrad = ctx.createRadialGradient(
      sunX - baseR * 0.2,
      sunY - baseR * 0.2,
      baseR * 0.1,
      sunX,
      sunY,
      baseR
    );
    if (isDark) {
      coreGrad.addColorStop(0, 'rgba(255, 255, 240, 0.98)');
      coreGrad.addColorStop(0.4, 'rgba(255, 215, 80, 0.95)');
      coreGrad.addColorStop(1, 'rgba(245, 140, 10, 0.9)');
    } else {
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      coreGrad.addColorStop(0.35, 'rgba(255, 235, 120, 0.98)');
      coreGrad.addColorStop(1, 'rgba(245, 158, 11, 0.92)');
    }
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, baseR, 0, Math.PI * 2);
    ctx.fill();
  }

  renderSunMotes() {
    const isDark = this.theme === 'dark';
    const ctx = this.ctx;

    for (const p of this.particles) {
      p.pulse += 0.025;
      p.y += p.speedY;
      p.x += p.speedX;

      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;

      const alpha = p.opacity * (0.65 + Math.sin(p.pulse) * 0.35);
      const color = isDark ? `rgba(251, 191, 36, ${alpha})` : `rgba(245, 158, 11, ${alpha * 0.9})`;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* -------------------------------------------------------------
   * MOON & STARFIELD RENDERING (Clear Night)
   * Displays luminous crescent moon with silver aura, twinkling starfield,
   * and occasional atmospheric shooting stars.
   * ------------------------------------------------------------- */
  renderMoon() {
    const isDark = this.theme === 'dark';
    const ctx = this.ctx;

    const moonX = Math.max(100, Math.min(this.width - 120, this.width * 0.82));
    const moonY = Math.max(85, Math.min(160, this.height * 0.16));
    const r = Math.min(44, Math.max(28, Math.min(this.width, this.height) * 0.048));

    // 1. Soft lunar atmospheric aura
    const haloR = r * 3.4;
    const haloGrad = ctx.createRadialGradient(moonX, moonY, r * 0.4, moonX, moonY, haloR);
    if (isDark) {
      haloGrad.addColorStop(0, 'rgba(195, 220, 255, 0.24)');
      haloGrad.addColorStop(0.5, 'rgba(147, 197, 253, 0.08)');
      haloGrad.addColorStop(1, 'rgba(147, 197, 253, 0)');
    } else {
      haloGrad.addColorStop(0, 'rgba(125, 160, 215, 0.22)');
      haloGrad.addColorStop(0.5, 'rgba(125, 160, 215, 0.06)');
      haloGrad.addColorStop(1, 'rgba(125, 160, 215, 0)');
    }
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, haloR, 0, Math.PI * 2);
    ctx.fill();

    // 2. Crescent Moon Geometry (Outer disc masked with inner crescent shadow)
    ctx.save();
    ctx.beginPath();
    ctx.arc(moonX, moonY, r, 0, Math.PI * 2);

    // Inner pearl-silver gradient for moon body
    const moonGrad = ctx.createRadialGradient(
      moonX - r * 0.3,
      moonY - r * 0.3,
      r * 0.2,
      moonX,
      moonY,
      r
    );
    if (isDark) {
      moonGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      moonGrad.addColorStop(0.6, 'rgba(224, 242, 254, 0.95)');
      moonGrad.addColorStop(1, 'rgba(186, 215, 255, 0.9)');
    } else {
      moonGrad.addColorStop(0, 'rgba(240, 246, 255, 0.98)');
      moonGrad.addColorStop(0.6, 'rgba(203, 222, 245, 0.95)');
      moonGrad.addColorStop(1, 'rgba(165, 195, 235, 0.9)');
    }
    ctx.fillStyle = moonGrad;
    ctx.fill();

    // Cut away inner disc to form elegant crescent
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(moonX + r * 0.44, moonY - r * 0.16, r * 0.88, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fill();
    ctx.restore();

    // Subtle edge glow on the lit crescent edge
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(147, 197, 253, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(moonX, moonY, r, 0.6 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  renderStars() {
    const isDark = this.theme === 'dark';
    const ctx = this.ctx;

    for (const p of this.particles) {
      p.twinklePhase += p.twinkleSpeed;
      const alpha = p.baseOpacity * (0.35 + Math.sin(p.twinklePhase) * 0.65);

      if (isDark) {
        ctx.fillStyle = `rgba(240, 248, 255, ${Math.min(1, alpha * 1.1)})`;
      } else {
        // Visible contrast against light theme background
        ctx.fillStyle = `rgba(70, 95, 145, ${Math.min(0.85, alpha * 0.75)})`;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Delicate 4-point cross diffraction for prominent stars
      if (p.hasSpikes && alpha > 0.6) {
        ctx.save();
        ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${alpha * 0.4})` : `rgba(70, 95, 145, ${alpha * 0.35})`;
        ctx.lineWidth = 0.8;
        const arm = p.radius * 2.8;
        ctx.beginPath();
        ctx.moveTo(p.x - arm, p.y);
        ctx.lineTo(p.x + arm, p.y);
        ctx.moveTo(p.x, p.y - arm);
        ctx.lineTo(p.x, p.y + arm);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  renderShootingStars() {
    const ctx = this.ctx;
    this.meteorTimer += 1;

    // Trigger meteor every ~260 frames (~4.5s)
    if (this.meteorTimer > 240 && Math.random() < 0.02 && this.shootingStars.length === 0) {
      this.shootingStars.push({
        x: Math.random() * (this.width * 0.7),
        y: Math.random() * (this.height * 0.35),
        length: 70 + Math.random() * 50,
        speedX: 13 + Math.random() * 6,
        speedY: 6 + Math.random() * 4,
        opacity: 0.95
      });
      this.meteorTimer = 0;
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const m = this.shootingStars[i];
      m.x += m.speedX;
      m.y += m.speedY;
      m.opacity -= 0.024;

      if (m.opacity <= 0 || m.x > this.width || m.y > this.height) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      const grad = ctx.createLinearGradient(
        m.x,
        m.y,
        m.x - m.length * 0.9,
        m.y - m.length * 0.45
      );
      const isDark = this.theme === 'dark';
      if (isDark) {
        grad.addColorStop(0, `rgba(255, 255, 255, ${m.opacity})`);
        grad.addColorStop(1, 'rgba(147, 197, 253, 0)');
      } else {
        grad.addColorStop(0, `rgba(96, 135, 200, ${m.opacity})`);
        grad.addColorStop(1, 'rgba(96, 135, 200, 0)');
      }

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.length * 0.9, m.y - m.length * 0.45);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* -------------------------------------------------------------
   * DIFFUSED CELESTIAL BODIES (For Cloudy Skies)
   * ------------------------------------------------------------- */
  renderDiffusedSun() {
    const isDark = this.theme === 'dark';
    const ctx = this.ctx;
    const sunX = Math.max(100, Math.min(this.width - 120, this.width * 0.82));
    const sunY = Math.max(85, Math.min(160, this.height * 0.16));
    const r = Math.min(42, Math.max(28, Math.min(this.width, this.height) * 0.05));

    const grad = ctx.createRadialGradient(sunX, sunY, r * 0.2, sunX, sunY, r * 2.8);
    if (isDark) {
      grad.addColorStop(0, 'rgba(255, 200, 70, 0.4)');
      grad.addColorStop(1, 'rgba(255, 160, 20, 0)');
    } else {
      grad.addColorStop(0, 'rgba(255, 215, 80, 0.55)');
      grad.addColorStop(1, 'rgba(255, 180, 20, 0)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, r * 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  renderDiffusedMoon() {
    const isDark = this.theme === 'dark';
    const ctx = this.ctx;
    const moonX = Math.max(100, Math.min(this.width - 120, this.width * 0.82));
    const moonY = Math.max(85, Math.min(160, this.height * 0.16));
    const r = Math.min(38, Math.max(24, Math.min(this.width, this.height) * 0.045));

    const grad = ctx.createRadialGradient(moonX, moonY, r * 0.2, moonX, moonY, r * 2.5);
    if (isDark) {
      grad.addColorStop(0, 'rgba(210, 230, 255, 0.35)');
      grad.addColorStop(1, 'rgba(147, 197, 253, 0)');
    } else {
      grad.addColorStop(0, 'rgba(160, 190, 235, 0.3)');
      grad.addColorStop(1, 'rgba(160, 190, 235, 0)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, r * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /* -------------------------------------------------------------
   * CLOUD RENDERING (Cloudy / Overcast)
   * Multi-lobed drifting cloud masses with volumetric shading.
   * ------------------------------------------------------------- */
  renderClouds() {
    const isDark = this.theme === 'dark';
    const ctx = this.ctx;

    for (const c of this.clouds) {
      c.x += c.speedX;
      if (c.x - 250 > this.width) {
        c.x = -250;
      }

      for (const p of c.puffs) {
        const puffX = c.x + p.offsetX;
        const puffY = c.y + p.offsetY;

        const grad = ctx.createRadialGradient(puffX, puffY, 0, puffX, puffY, p.radius);
        if (isDark) {
          grad.addColorStop(0, `rgba(45, 60, 85, ${p.opacity * 1.2})`);
          grad.addColorStop(0.7, `rgba(30, 42, 60, ${p.opacity * 0.7})`);
          grad.addColorStop(1, 'rgba(30, 42, 60, 0)');
        } else {
          grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity * 1.3})`);
          grad.addColorStop(0.7, `rgba(235, 242, 250, ${p.opacity * 0.7})`);
          grad.addColorStop(1, 'rgba(235, 242, 250, 0)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(puffX, puffY, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* -------------------------------------------------------------
   * RAIN & WATER SPLASH RIPPLES
   * Angled falling streaks with expanding ground puddles/ripples.
   * ------------------------------------------------------------- */
  renderRain() {
    const isDark = this.theme === 'dark';
    const ctx = this.ctx;

    ctx.save();
    ctx.lineWidth = 1.3;
    const strokeColor = isDark ? 'rgba(147, 197, 253, 0.65)' : 'rgba(37, 99, 235, 0.52)';
    ctx.strokeStyle = strokeColor;

    for (const p of this.particles) {
      p.y += p.speed;
      p.x += p.speed * 0.22; // Natural angled fall

      // Trigger splash ripple near ground
      if (p.y > this.height - 70 && Math.random() < 0.08 && this.ripples.length < 24) {
        this.ripples.push({
          x: p.x,
          y: Math.min(this.height - 10, p.y + (Math.random() * 40 - 20)),
          radius: 1.5,
          maxRadius: 12 + Math.random() * 10,
          opacity: 0.55
        });
      }

      if (p.y > this.height + 20) {
        p.y = -p.length - 10;
        p.x = Math.random() * (this.width + 120) - 60;
      }

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.length * 0.22, p.y + p.length);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderRipples() {
    const isDark = this.theme === 'dark';
    const ctx = this.ctx;

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 0.65;
      r.opacity -= 0.028;

      if (r.opacity <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.strokeStyle = isDark
        ? `rgba(186, 215, 255, ${r.opacity})`
        : `rgba(37, 99, 235, ${r.opacity * 0.8})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Draw concentric expanding ground ellipse
      ctx.ellipse(r.x, r.y, r.radius * 2.2, r.radius * 0.75, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* -------------------------------------------------------------
   * THUNDERSTORM (Storm Clouds, Lightning Bolts & Ambient Flash)
   * ------------------------------------------------------------- */
  renderThunder() {
    const isDark = this.theme === 'dark';
    const ctx = this.ctx;

    // Trigger intermittent realistic lightning bolt
    this.lightningTimer += 1;
    if (this.lightningTimer > 200 && Math.random() < 0.02 && !this.lightningBolt) {
      this.lightningBolt = this.generateLightningBolt();
      this.flashOpacity = 0.52;
      this.lightningTimer = 0;
    }

    // Screen ambient illumination flash
    if (this.flashOpacity > 0) {
      ctx.save();
      const flashColor = isDark
        ? `rgba(230, 240, 255, ${this.flashOpacity})`
        : `rgba(255, 255, 255, ${this.flashOpacity * 0.85})`;
      ctx.fillStyle = flashColor;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
      this.flashOpacity -= 0.04;
    }

    // Render jagged branching bolt
    if (this.lightningBolt) {
      ctx.save();
      const boltColor = isDark ? 'rgba(216, 180, 254, 0.95)' : 'rgba(124, 58, 237, 0.9)';
      ctx.strokeStyle = boltColor;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = isDark ? '#c084fc' : '#7c3aed';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      for (let i = 0; i < this.lightningBolt.segments.length; i++) {
        const seg = this.lightningBolt.segments[i];
        if (i === 0) ctx.moveTo(seg.x, seg.y);
        else ctx.lineTo(seg.x, seg.y);
      }
      ctx.stroke();

      // Render secondary branch
      if (this.lightningBolt.branch) {
        ctx.beginPath();
        for (let i = 0; i < this.lightningBolt.branch.length; i++) {
          const seg = this.lightningBolt.branch[i];
          if (i === 0) ctx.moveTo(seg.x, seg.y);
          else ctx.lineTo(seg.x, seg.y);
        }
        ctx.stroke();
      }

      ctx.restore();

      this.lightningBolt.framesLeft -= 1;
      if (this.lightningBolt.framesLeft <= 0) {
        this.lightningBolt = null;
      }
    }
  }

  generateLightningBolt() {
    const startX = this.width * (0.2 + Math.random() * 0.6);
    let curX = startX;
    let curY = 0;
    const targetY = this.height * (0.55 + Math.random() * 0.35);
    const segments = [{ x: curX, y: curY }];
    let branch = null;

    while (curY < targetY) {
      curY += 18 + Math.random() * 24;
      curX += (Math.random() - 0.5) * 38;
      segments.push({ x: curX, y: curY });

      // Spawn single subsidiary branch
      if (!branch && curY > targetY * 0.35 && Math.random() < 0.45) {
        let bX = curX;
        let bY = curY;
        branch = [{ x: bX, y: bY }];
        for (let b = 0; b < 4; b++) {
          bY += 14 + Math.random() * 16;
          bX += (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 20);
          branch.push({ x: bX, y: bY });
        }
      }
    }

    return {
      segments,
      branch,
      framesLeft: 4 + Math.floor(Math.random() * 3)
    };
  }

  /* -------------------------------------------------------------
   * SNOW RENDERING (Snow / Sleet)
   * Multi-depth fluttering snowflakes with sinusoidal sway.
   * ------------------------------------------------------------- */
  renderSnow() {
    const isDark = this.theme === 'dark';
    const ctx = this.ctx;

    for (const p of this.particles) {
      p.wobble += p.wobbleSpeed;
      p.y += p.speedY;
      p.x += Math.sin(p.wobble) * 0.8 + p.speedX;

      if (p.y > this.height + 10) {
        p.y = -10;
        p.x = Math.random() * this.width;
      }
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;

      let fill;
      if (isDark) {
        fill = `rgba(255, 255, 255, ${p.opacity})`;
      } else {
        // High visibility with cool icy-blue core for light theme
        fill = `rgba(165, 198, 238, ${Math.min(1, p.opacity * 1.25)})`;
      }

      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Soft rim outline for foreground snowflakes in light mode
      if (!isDark && p.depth > 0.8) {
        ctx.strokeStyle = `rgba(96, 165, 250, ${p.opacity * 0.8})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  /* -------------------------------------------------------------
   * FOG / MIST RENDERING
   * Multi-tiered undulating horizontal fog banks.
   * ------------------------------------------------------------- */
  renderFog() {
    const isDark = this.theme === 'dark';
    const ctx = this.ctx;

    for (const p of this.particles) {
      p.offset += 0.008;
      const waveY = p.y + Math.sin(p.offset) * 16;

      const grad = ctx.createLinearGradient(0, waveY - p.height * 0.5, 0, waveY + p.height * 0.5);
      if (isDark) {
        grad.addColorStop(0, 'rgba(45, 60, 85, 0)');
        grad.addColorStop(0.5, `rgba(45, 60, 85, ${p.opacity})`);
        grad.addColorStop(1, 'rgba(45, 60, 85, 0)');
      } else {
        grad.addColorStop(0, 'rgba(215, 226, 240, 0)');
        grad.addColorStop(0.5, `rgba(215, 226, 240, ${p.opacity * 1.2})`);
        grad.addColorStop(1, 'rgba(215, 226, 240, 0)');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, waveY - p.height * 0.5, this.width, p.height);
    }
  }
}
