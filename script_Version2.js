// Interactive apology site logic: particles, typewriter, chord, confetti, rose, photo upload, secret code
(() => {
  // Canvas particles (floating hearts/petals)
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  window.addEventListener('resize', () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; });

  const particles = [];
  const colors = ['#ff6b81','#ff9aa2','#ffd1dc','#fff1f7','#ffd7e6'];

  function rand(min,max){ return min + Math.random()*(max-min); }

  function createParticle(){
    const p = {
      x: rand(0, W),
      y: H + rand(0, 200),
      vx: rand(-0.3, 0.3),
      vy: rand(-1.2, -0.2),
      size: rand(6, 28),
      rot: rand(0, Math.PI*2),
      srv: rand(0.003, 0.01),
      color: colors[Math.floor(Math.random()*colors.length)],
      shape: Math.random() < 0.45 ? 'heart' : 'petal'
    };
    particles.push(p);
  }
  for(let i=0;i<80;i++) createParticle();
  function drawHeart(x,y,s,fill){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(0);
    ctx.beginPath();
    const topCurveHeight = s * 0.3;
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(s * 0.5, -topCurveHeight, s * 1.2, s * 0.45, 0, s);
    ctx.bezierCurveTo(-s * 1.2, s * 0.45, -s * 0.5, -topCurveHeight, 0, s * 0.35);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
  }
  function drawPetal(x,y,s,fill,rot){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0,0,s*0.65,s,0,0,Math.PI*2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
  }

  function render(){
    ctx.clearRect(0,0,W,H);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx += Math.sin((p.y+performance.now()*0.0006))*0.002;
      p.rot += p.srv;
      if(p.y < -50 || p.x < -200 || p.x > W+200) {
        particles.splice(i,1);
        createParticle();
      } else {
        ctx.globalAlpha = 0.95;
        if(p.shape === 'heart') drawHeart(p.x, p.y, p.size*0.6, p.color);
        else drawPetal(p.x, p.y, p.size*0.75, p.color, p.rot);
      }
    });
    requestAnimationFrame(render);
  }
  render();

  // Simple WebAudio chord (play on button)
  let audioCtx = null;
  function playChord(){
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const master = audioCtx.createGain(); master.gain.value = 0.08; master.connect(audioCtx.destination);
    const freqs = [440, 550, 660]; // warm cluster
    freqs.forEach((f, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = f * (0.5 + Math.random()*0.08);
      g.gain.value = 0;
      o.connect(g); g.connect(master);
      o.start(now + i*0.02);
      g.gain.linearRampToValueAtTime(0.07, now + 0.05 + i*0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      o.stop(now + 3.5);
    });
  }

  // Confetti burst (hearts)
  function burstConfetti(){
    const layer = document.getElementById('confetti-layer');
    for(let i=0;i<26;i++){
      const el = document.createElement('div');
      el.className = 'conf';
      const size = 10 + Math.random()*18;
      el.style.width = el.style.height = size + 'px';
      el.style.position = 'fixed';
      el.style.left = (40 + Math.random()*20) + '%';
      el.style.top = '30%';
      el.style.background = colors[Math.floor(Math.random()*colors.length)];
      el.style.borderRadius = '4px';
      el.style.transform = `rotate(${Math.random()*360}deg)`;
      el.style.zIndex = 50;
      layer.appendChild(el);

      const endX = (Math.random()-0.5)*800;
      const endY = window.innerHeight + 300 + Math.random()*300;
      const dur = 1400 + Math.random()*1200;
      el.animate([
        { transform: `translate3d(0,0,0) rotate(0deg)`, opacity:1 },
        { transform: `translate3d(${endX}px, ${endY}px, 0) rotate(${Math.random()*720}deg)`, opacity:0.9 }
      ], { duration: dur, easing: 'cubic-bezier(.2,.7,.2,1)' });
      setTimeout(()=> el.remove(), dur + 200);
    }
  }

  // Rose send animation
  function sendRose(){
    const rose = document.createElement('div');
    rose.className = 'rose';
    rose.textContent = '🌹';
    document.body.appendChild(rose);
    const endY = window.innerHeight * 0.05;
    const startX = innerWidth*0.5 + (Math.random()-0.5)*200;
    rose.style.left = startX + 'px';
    rose.style.top = innerHeight + 'px';
    rose.animate([{ transform: `translateY(0) scale(1)` }, { transform: `translateY(-${window.innerHeight*0.9}px) scale(1.15)` }], {
      duration: 2200,
      easing: 'cubic-bezier(.2,.7,.2,1)'
    });
    setTimeout(()=> rose.remove(), 2400);
  }

  // Typewriter apology
  const revealBtn = document.getElementById('revealBtn');
  const typingEl = document.getElementById('typing');
  const apologyEl = document.getElementById('apology');
  const promises = [
    "Kashoo —",
    "I am sorry. I see how I hurt you and I am truly sorry for what I did.",
    "You are my priority. I want to learn, to grow, and to make things right.",
    "Please let me show you how much you mean to me."
  ];
  let typed = false;
  function typeText(lines, el, speed=28){
    return new Promise(resolve => {
      el.textContent = '';
      const text = lines.join('\n\n');
      let i=0;
      const t = setInterval(() => {
        i++;
        el.textContent = text.slice(0,i) + (i % 2 === 0 ? '_' : '');
        if(i >= text.length){
          clearInterval(t);
          el.textContent = text;
          resolve();
        }
      }, speed);
    });
  }

  revealBtn.addEventListener('click', async () => {
    if(typed) return;
    typed = true;
    revealBtn.disabled = true;
    revealBtn.textContent = 'Pouring my heart...';
    apologyEl.classList.remove('hidden');
    await typeText(promises, typingEl, 28);
    burstConfetti();
    playChord();
    revealBtn.textContent = 'Shared ♥';
  });

  // Play chord button
  const playBtn = document.getElementById('playChord');
  playBtn.addEventListener('click', () => {
    playChord();
    playBtn.setAttribute('aria-pressed', 'true');
    setTimeout(()=> playBtn.setAttribute('aria-pressed', 'false'), 1200);
  });

  // Rose button
  document.getElementById('roseBtn').addEventListener('click', () => {
    sendRose();
    playChord();
  });

  // File upload preview
  const fileInput = document.getElementById('fileInput');
  const photoPreview = document.getElementById('photoPreview');
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    photoPreview.innerHTML = '';
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Photo';
    photoPreview.appendChild(img);
    photoPreview.removeAttribute('aria-hidden');
  });

  // Forgive buttons
  document.getElementById('forgiveYes').addEventListener('click', () => {
    typingEl.textContent += '\n\nYou said yes — thank you. I will cherish every day.';
    burstConfetti();
    playChord();
  });
  document.getElementById('forgiveNo').addEventListener('click', () => {
    typingEl.textContent += '\n\nI understand. I will keep trying and give you space.';
    sendRose();
  });

  // Secret code input: if user types "kashoo" (case-insensitive), trigger a bigger celebration
  const codeInput = document.getElementById('codeInput');
  codeInput.addEventListener('input', () => {
    const v = (codeInput.value || '').trim().toLowerCase();
    if(v === 'kashoo' || v === 'love') {
      // big burst
      for(let i=0;i<3;i++) setTimeout(burstConfetti, i*250);
      playChord();
      // small fireworks (create many particles)
      for(let i=0;i<60;i++) setTimeout(createParticle, i*12);
      codeInput.value = '';
    }
  });

  // Gentle card tilt on mousemove
  const card = document.getElementById('card');
  window.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width;
    const my = (e.clientY - r.top) / r.height;
    const rx = (my - 0.5) * 6;
    const ry = (mx - 0.5) * -10;
    card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  });
  window.addEventListener('mouseleave', () => card.style.transform = '');

  // small helper to create particles externally
  window.createParticle = createParticle;
})();