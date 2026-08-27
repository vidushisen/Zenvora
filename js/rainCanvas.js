/**
 * DeepFocus Animated Rain & Ambient Canvas Engine
 */

class RainCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.drops = [];
    this.splashes = [];
    this.particles = [];
    this.theme = 'cozy-rain';
    this.animationFrame = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initDrops();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  setTheme(themeName) {
    this.theme = themeName;
  }

  initDrops() {
    this.drops = [];
    this.particles = [];
    const count = Math.floor(this.width / 12);

    for (let i = 0; i < count; i++) {
      this.drops.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 12 + 8,
        opacity: Math.random() * 0.4 + 0.1
      });
    }

    // Ambient floating embers for fire/cyberpunk themes
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: -Math.random() * 0.8 - 0.2,
        opacity: Math.random() * 0.6 + 0.2
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.theme === 'cozy-rain' || this.theme === 'lofi-cafe') {
      this.drawRain();
    } else if (this.theme === 'midnight-forest' || this.theme === 'cyberpunk-neon') {
      this.drawParticles();
    }

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  drawRain() {
    this.ctx.lineWidth = 1.2;
    this.ctx.lineCap = 'round';

    this.drops.forEach(drop => {
      const color = this.theme === 'lofi-cafe' ? 'rgba(251, 191, 36, ' : 'rgba(147, 197, 253, ';
      this.ctx.strokeStyle = color + drop.opacity + ')';

      this.ctx.beginPath();
      this.ctx.moveTo(drop.x, drop.y);
      this.ctx.lineTo(drop.x - drop.length * 0.1, drop.y + drop.length);
      this.ctx.stroke();

      drop.y += drop.speed;
      drop.x -= drop.speed * 0.1;

      if (drop.y > this.height) {
        drop.y = -drop.length;
        drop.x = Math.random() * this.width;
      }
    });
  }

  drawParticles() {
    this.particles.forEach(p => {
      const color = this.theme === 'cyberpunk-neon' 
        ? `rgba(217, 70, 239, ${p.opacity})` 
        : `rgba(52, 211, 153, ${p.opacity})`;

      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y < 0) {
        p.y = this.height;
        p.x = Math.random() * this.width;
      }
    });
  }
}

// Global Canvas Instance
window.rainCanvas = null;
document.addEventListener('DOMContentLoaded', () => {
  window.rainCanvas = new RainCanvas('ambient-canvas');
});
