document.addEventListener('DOMContentLoaded', () => {

  // ─── LOADING ───
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPct = document.getElementById('loader-pct');
  const loadTargets = [15, 30, 45, 55, 70, 82, 91, 97, 100];
  const loadDelays = [200, 300, 400, 500, 400, 500, 400, 500, 400];

  function advanceLoader(i) {
    if (i >= loadTargets.length) return;
    loaderBar.style.width = loadTargets[i] + '%';
    loaderPct.textContent = loadTargets[i] + '%';
    setTimeout(() => advanceLoader(i + 1), loadDelays[i]);
  }
  advanceLoader(0);

  window.addEventListener('load', () => {
    loaderBar.style.width = '100%';
    loaderPct.textContent = '100%';
    setTimeout(() => {
      loader.classList.add('loader-exit');
      setTimeout(() => loader.classList.add('hidden'), 900);
    }, 500);
    // Hide skeleton
    setTimeout(() => {
      document.getElementById('skeleton-overlay')?.classList.add('hidden');
    }, 1200);
  });

  // ─── CURSOR (disabled - using default) ───

  // ─── THEME TOGGLE ───
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ─── PARTICLES ───
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.4 + 0.05;
    }
    update() {
      this.x += this.speedX; this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(20, 157, 221, ${this.opacity})`;
      ctx.fill();
    }
  }

  const particleCount = Math.min(60, Math.floor(window.innerWidth * window.innerHeight / 20000));
  for (let i = 0; i < particleCount; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(20, 157, 221, ${0.04 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ─── SIDEBAR NAV ───
  const sections = document.querySelectorAll('.section');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const mainContent = document.getElementById('main-content');

  // Smooth scroll on click
  sidebarLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        document.querySelector('.sidebar.open')?.classList.remove('open');
      }
    });
  });

  // ─── DOT NAV ───
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      document.querySelector('.sidebar.open')?.classList.remove('open');
    });
  });

  // Combined scroll spy for sidebar + dots
  function updateActiveNav() {
    let current = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      if (mainContent.scrollTop >= top) current = section.getAttribute('id');
    });
    sidebarLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
    dots.forEach((dot) => {
      dot.classList.toggle('active', dot.dataset.target === current);
    });
  }
  mainContent.addEventListener('scroll', updateActiveNav);
  updateActiveNav();

  // ─── MOBILE TOGGLE ───
  const mobileToggle = document.getElementById('mobile-toggle');
  const sidebar = document.getElementById('sidebar');
  mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  // ─── REVEAL OBSERVER ───
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.reveal').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), i * 120);
        });
        // Trigger text reveal for .text-reveal elements
        entry.target.querySelectorAll('.text-reveal').forEach((el) => {
          if (!el.dataset.revealed) {
            el.dataset.revealed = 'true';
            const chars = el.textContent.trim().split('');
            el.textContent = '';
            chars.forEach((char, i) => {
              const span = document.createElement('span');
              span.className = 'text-reveal-char';
              span.textContent = char === ' ' ? '\u00A0' : char;
              span.style.animationDelay = i * 30 + 'ms';
              el.appendChild(span);
            });
          }
        });
      }
    });
  }, { root: mainContent, threshold: 0.1 });
  sections.forEach((section) => revealObserver.observe(section));

  // ─── TYPING EFFECT ───
  const typingEl = document.getElementById('typing-text');
  const phrases = [
    'Full-Stack Developer',
    'AI Automation Specialist',
    'Growth Engineer',
    'Tech Innovator',
    'Problem Solver'
  ];
  let phraseIndex = 0, charIndex = 0, isDeleting = false, typeSpeed = 80;

  function typeEffect() {
    const current = phrases[phraseIndex];
    if (!isDeleting) {
      typingEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) { isDeleting = true; typeSpeed = 2000; }
      else { typeSpeed = 60 + Math.random() * 60; }
    } else {
      typingEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; typeSpeed = 500; }
      else { typeSpeed = 30 + Math.random() * 40; }
    }
    setTimeout(typeEffect, typeSpeed);
  }
  typeEffect();

  // ─── COUNTERS ───
  const statNumbers = document.querySelectorAll('.hero-stat-num');
  let countersStarted = false;

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    statNumbers.forEach(stat => {
      const target = parseInt(stat.dataset.count);
      const step = Math.ceil(target / (2000 / 16));
      let current = 0;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        stat.textContent = current;
      }, 16);
    });
  }

  const homeSection = document.getElementById('home');

  const triggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.id === 'home') startCounters();
    });
  }, { root: mainContent, threshold: 0.3 });

  if (homeSection) triggerObserver.observe(homeSection);

  // ─── SCROLL PROGRESS ───
  const progressBar = document.getElementById('scroll-progress');
  mainContent.addEventListener('scroll', () => {
    const scrollTop = mainContent.scrollTop;
    const scrollHeight = mainContent.scrollHeight - mainContent.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    progressBar.style.setProperty('--scroll', progress + '%');
  });

  // ─── BACK TO TOP ───
  const backToTop = document.getElementById('back-to-top');
  mainContent.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', mainContent.scrollTop > 400);
  });
  backToTop.addEventListener('click', () => {
    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ─── CONTACT FORM ───
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn');
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-arrow-repeat" style="animation: spin 1s linear infinite"></i> Sending...';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = '<i class="bi bi-check-lg"></i> Sent!';
        btn.style.background = '#22c55e';
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
          btn.disabled = false;
          contactForm.reset();
        }, 3000);
      }, 2000);
    });
  }

  // ─── HERO REVEAL ───
  setTimeout(() => {
    document.querySelectorAll('.hero-section .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 150 + 800);
    });
  }, 800);

  // ─── MAGNETIC BUTTONS ───
  if (window.innerWidth > 768) {
    document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    // Service card mouse tracking for radial gradient
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }

  // ─── CHAT BOT ───
  const chatBtn = document.getElementById('chat-btn');
  const chatPanel = document.getElementById('chat-panel');
  const chatClose = document.getElementById('chat-close');
  const chatBody = document.getElementById('chat-body');
  const chatChips = document.getElementById('chat-chips');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');

  // Content data from content file
  const contentData = {
    personal: {
      name: 'Syed Muhammad Mudassir (Mudassir Faheem)',
      age: '19 years (Born: November 8, 2006)',
      location: 'Naw Abad, Lyari, Karachi, Pakistan',
      education: 'Student — Sindh Board Arts Group, Class XII',
    },
    skills: {
      frontend: 'React.js, Vue.js, Tailwind CSS',
      backend: 'PHP, Laravel, Node.js (MERN), MongoDB, Supabase',
      ai: 'Agentic AI, n8n, OpenAI API, Google AI Studio',
      tools: 'VS Code, GitHub, Vercel, Netlify, Railway, XAMPP',
      design: 'Dark themes, Glowing Neon Accents, Glassmorphism, Canva, Photoshop',
    },
    projects: 'Integravity (autonomous AI platform), Text-to-Speech SaaS (ElevenLabs), AI Barber Agent (appointment automation), Custom ERP/CRM/Hospital systems',
    agency: 'Ran ZenK — a full-stack agency managing frontend, backend, and AI/ML developers.',
    experience: [
      'Saylani Mass IT Training (SMIT) — Modern Web App Development (Dec 2025)',
      'Vortex Tech — Web Development Internship (July 2026)',
      'CodeAlpha — Online Frontend Development Internship',
      'Hackathons: Coral-bean, Gemini 3, Codegeist 2025, AI Seekho 2026, Aptech Vision 2025',
    ],
    interests: 'Free Fire (mobile game), Audio tools (voice changers, soundboards, music licensing)',
    contact: 'muhammadmudassir33322@gmail.com | +92 336 7177912',
  };

  const chipQuestions = [
    { label: 'Who are you?', keywords: ['who', 'name', 'about', 'mudassir'] },
    { label: 'What skills?', keywords: ['skill', 'tech', 'know', 'stack'] },
    { label: 'What projects?', keywords: ['project', 'built', 'made', 'create'] },
    { label: 'Experience?', keywords: ['experience', 'intern', 'certif', 'learn'] },
    { label: 'About ZenK?', keywords: ['zenk', 'agency', 'company'] },
    { label: 'Interests?', keywords: ['game', 'interest', 'hobby', 'free fire'] },
    { label: 'Contact?', keywords: ['contact', 'email', 'phone', 'reach'] },
  ];

  function appendMessage(text, role) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.innerHTML = '<div class="chat-msg-bubble">' + text + '</div>';
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function showTyping(callback) {
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = 'chat-typing';
    div.innerHTML = '<div class="chat-msg-bubble"><span class="typing-dots"><span>.</span><span>.</span><span>.</span></span></div>';
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    setTimeout(() => {
      div.remove();
      callback();
    }, 500 + Math.random() * 300);
  }

  function getAnswer(input) {
    const txt = input.toLowerCase();
    if (txt.match(/who|name|about|mudassir|tell me about/)) {
      return `<b>Syed Muhammad Mudassir</b><br>Location: ${contentData.personal.location}<br>Age: ${contentData.personal.age}<br>Education: ${contentData.personal.education}`;
    }
    if (txt.match(/skill|tech|know|stack|what can you|expertise/)) {
      return `<b>Tech Stack</b><br>Frontend: ${contentData.skills.frontend}<br>Backend: ${contentData.skills.backend}<br>AI: ${contentData.skills.ai}<br>Tools: ${contentData.skills.tools}<br>Design: ${contentData.skills.design}`;
    }
    if (txt.match(/project|built|made|create|build|developed/)) {
      return `<b>Major Projects</b><br>${contentData.projects}`;
    }
    if (txt.match(/experience|intern|certif|learn|train|hackathon/)) {
      let exp = '<b>Experience & Learning</b><br>';
      contentData.experience.forEach(e => { exp += '• ' + e + '<br>'; });
      return exp;
    }
    if (txt.match(/zenk|agency|company|studio/)) {
      return `<b>Agency</b><br>${contentData.agency}`;
    }
    if (txt.match(/game|interest|hobby|free fire|audio|play/)) {
      return `<b>Interests</b><br>${contentData.interests}`;
    }
    if (txt.match(/contact|email|phone|reach|call|mail/)) {
      return `<b>Contact</b><br>Email: ${contentData.contact.replace(' | ', '<br>Phone: ')}`;
    }
    return 'I only know about Mudassir. Try one of the questions above!';
  }

  function handleMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    appendMessage(trimmed, 'user');
    chatInput.value = '';
    showTyping(() => {
      const answer = getAnswer(trimmed);
      appendMessage(answer, 'bot');
    });
  }

  // Render chips
  chipQuestions.forEach((q) => {
    const chip = document.createElement('button');
    chip.className = 'chat-chip';
    chip.textContent = q.label;
    chip.addEventListener('click', () => handleMessage(q.label));
    chatChips.appendChild(chip);
  });

  // Toggle
  chatBtn.addEventListener('click', () => {
    chatPanel.classList.toggle('open');
    if (chatPanel.classList.contains('open')) chatInput.focus();
  });
  chatClose.addEventListener('click', () => chatPanel.classList.remove('open'));

  // Send
  chatSend.addEventListener('click', () => handleMessage(chatInput.value));
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleMessage(chatInput.value);
  });

  // Typing dots CSS
  const style = document.createElement('style');
  style.textContent = `
    .typing-dots span { animation: dotBlink 1.4s infinite; font-weight: 700; font-size: 18px; line-height: 0; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dotBlink { 0%,60%,100% { opacity: 0.2; } 30% { opacity: 1; } }
  `;
  document.head.appendChild(style);

});

// ─── VIEW MORE TOGGLE ───
function toggleProjects() {
  const extras = document.querySelectorAll('.project-extra');
  const btn = document.querySelector('.btn-view-more');
  const isHidden = extras[0] && !extras[0].classList.contains('show');
  extras.forEach(el => el.classList.toggle('show', isHidden));
  if (btn) {
    btn.innerHTML = isHidden
      ? 'Show Less <i class="bi bi-chevron-up"></i>'
      : 'View All <span class="view-count">(+2)</span> <i class="bi bi-chevron-down"></i>';
  }
}
