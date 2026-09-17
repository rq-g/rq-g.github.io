
document.addEventListener('DOMContentLoaded', function() {
  const firstScreen = document.querySelector('.first-screen');
  if (!firstScreen) return;

  firstScreen.addEventListener('click', function(e) {
    createSplash(e.clientX, e.clientY);
  });

  function createSplash(x, y) {
    const container = document.createElement('div');
    container.className = 'wave-click-effect';
    container.style.left = x + 'px';
    container.style.top = y + 'px';

    // 1. 冠状水滴 - 从中心向上向外抛射
    for (let i = 0; i < 8; i++) {
      const droplet = document.createElement('div');
      droplet.className = 'splash-droplet';
      const angle = -Math.PI / 2 + (i - 3.5) * 0.28 + (Math.random() - 0.5) * 0.15;
      const speed = 80 + Math.random() * 60;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      droplet.style.setProperty('--dx', dx + 'px');
      droplet.style.setProperty('--dy', dy + 'px');
      droplet.style.animationDelay = (0.08 + Math.random() * 0.05) + 's';
      const size = 4 + Math.random() * 5;
      droplet.style.width = size + 'px';
      droplet.style.height = (size * 1.3) + 'px';
      container.appendChild(droplet);
    }

    // 4. 两侧飞溅水滴 - 模拟浪花向两侧散开
    for (let i = 0; i < 14; i++) {
      const droplet = document.createElement('div');
      droplet.className = 'splash-droplet-side';
      const side = i % 2 === 0 ? 1 : -1;
      const angle = -Math.PI / 2 + side * (0.4 + Math.random() * 0.8);
      const speed = 30 + Math.random() * 70;
      const dx = Math.cos(angle) * speed * side;
      const dy = Math.sin(angle) * speed;
      droplet.style.setProperty('--dx', dx + 'px');
      droplet.style.setProperty('--dy', dy + 'px');
      droplet.style.animationDelay = (0.1 + Math.random() * 0.15) + 's';
      const size = 2 + Math.random() * 4;
      droplet.style.width = size + 'px';
      droplet.style.height = (size * 1.2) + 'px';
      container.appendChild(droplet);
    }

    // 5. 底部水面涟漪
    for (let i = 0; i < 3; i++) {
      const ripple = document.createElement('div');
      ripple.className = 'splash-ripple';
      ripple.style.animationDelay = (i * 0.2) + 's';
      container.appendChild(ripple);
    }

    // 6. 细小水雾粒子
    for (let i = 0; i < 20; i++) {
      const mist = document.createElement('div');
      mist.className = 'splash-mist';
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 60;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - Math.random() * 40;
      mist.style.setProperty('--dx', dx + 'px');
      mist.style.setProperty('--dy', dy + 'px');
      mist.style.animationDelay = (0.05 + Math.random() * 0.2) + 's';
      const size = 1.5 + Math.random() * 2.5;
      mist.style.width = size + 'px';
      mist.style.height = size + 'px';
      container.appendChild(mist);
    }

    firstScreen.appendChild(container);

    setTimeout(() => {
      container.remove();
    }, 1800);
  }
});
