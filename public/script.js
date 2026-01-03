// script.js

class KYCValidator {
  constructor() {
    // Use environment-based URL (fallback to production)
    this.BASE_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : 'https://kyc-validation-api-production.up.railway.app';
    
    this.currentUser = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = [];
    
    this.init();
  }

  init() {
    this.setupThreeJS();
    this.setupEventListeners();
    this.animateLogin();
    this.animate();
  }

  // Three.js Background Setup
  setupThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    this.createParticles();
    this.camera.position.z = 5;
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  createParticles() {
    const geometry = new THREE.SphereGeometry(0.02, 8, 8);
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0x4CAF50, transparent: true, opacity: 0.6 }),
      new THREE.MeshBasicMaterial({ color: 0x2196F3, transparent: true, opacity: 0.6 }),
      new THREE.MeshBasicMaterial({ color: 0xFF9800, transparent: true, opacity: 0.6 }),
      new THREE.MeshBasicMaterial({ color: 0x9C27B0, transparent: true, opacity: 0.6 })
    ];

    for (let i = 0; i < 100; i++) {
      const material = materials[Math.floor(Math.random() * materials.length)];
      const particle = new THREE.Mesh(geometry, material);
      
      particle.position.x = (Math.random() - 0.5) * 20;
      particle.position.y = (Math.random() - 0.5) * 20;
      particle.position.z = (Math.random() - 0.5) * 20;
      
      particle.userData = {
        velocity: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        originalY: particle.position.y
      };
      
      this.particles.push(particle);
      this.scene.add(particle);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.particles.forEach((particle, index) => {
      particle.position.x += particle.userData.velocity.x;
      particle.position.y += particle.userData.velocity.y;
      particle.position.z += particle.userData.velocity.z;
      
      if (Math.abs(particle.position.x) > 10) particle.userData.velocity.x *= -1;
      if (Math.abs(particle.position.y) > 10) particle.userData.velocity.y *= -1;
      if (Math.abs(particle.position.z) > 10) particle.userData.velocity.z *= -1;
      
      particle.position.y += Math.sin(Date.now() * 0.001 + index) * 0.001;
      particle.rotation.x += 0.01;
      particle.rotation.y += 0.01;
    });
    
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animateLogin() {
    const loginContainer = document.querySelector('.login-container');
    const inputGroups = document.querySelectorAll('.input-group');
    const loginButton = document.querySelector('.login-btn');

    loginButton.style.opacity = 1;

    gsap.fromTo(loginContainer, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.3 }
    );

    gsap.from(inputGroups[0], {
      opacity: 0,
      y: 30,
      duration: 0.5,
      ease: "power2.out",
      delay: 0.8
    });

    gsap.from(inputGroups[1], {
      opacity: 0,
      y: 30,
      duration: 0.5,
      ease: "power2.out",
      delay: 1.3
    });

    gsap.from(loginButton, {
      opacity: 0,
      scale: 0.9,
      duration: 0.6,
      ease: "back.out(1.7)",
      delay: 1.8
    });
  }

  setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));
    
    document.getElementById('signupLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.switchToSignup();
    });
    
    document.getElementById('loginLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.switchToLogin();
    });
    
    document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.handleForgotPassword();
    });
    
    document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e));
    });
    
    document.getElementById('aadhaarForm').addEventListener('submit', (e) => this.handleAadhaarValidation(e));
    document.getElementById('panForm').addEventListener('submit', (e) => this.handlePanValidation(e));
    document.getElementById('bankForm').addEventListener('submit', (e) => this.handleBankValidation(e));
    
    document.querySelectorAll('input').forEach(input => {
      input.addEventListener('focus', (e) => this.animateInputFocus(e.target));
      input.addEventListener('blur', (e) => this.animateInputBlur(e.target));
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.querySelector('#loginForm .login-btn');
    const loginStatus = document.getElementById('loginStatus');
    
    loginStatus.classList.remove('show');
    
    if (!username || !password) {
      this.showStatus(loginStatus, '⚠️ Please fill in all fields', 'warning');
      return;
    }
    
    // Demo credentials - Replace with backend authentication
    const validCredentials = [
      { username: 'admin', password: 'admin123', role: 'Administrator' },
      { username: 'user', password: 'user123', role: 'User' },
      { username: 'demo', password: 'demo123', role: 'Demo User' }
    ];
    
    this.showLoading(loginBtn);
    this.showStatus(loginStatus, '🔄 Authenticating...', 'loading');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const user = validCredentials.find(cred => 
      cred.username === username && cred.password === password
    );
    
    this.hideLoading(loginBtn);
    
    if (user) {
      this.currentUser = user;
      this.showStatus(loginStatus, '✅ Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        this.switchToMainScreen();
      }, 1000);
    } else {
      this.showStatus(loginStatus, '❌ Invalid credentials. Try: admin/admin123, user/user123, or demo/demo123', 'error');
      
      gsap.to('.login-container', {
        x: [-10, 10, -10, 10, 0],
        duration: 0.4,
        ease: "power2.inOut"
      });
    }
  }

  async handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const signupBtn = document.querySelector('#signupForm .login-btn');
    const signupStatus = document.getElementById('signupStatus');
    
    signupStatus.classList.remove('show');
    
    if (!username || !email || !password || !confirmPassword) {
      this.showStatus(signupStatus, '⚠️ Please fill in all fields', 'warning');
      return;
    }
    
    if (password !== confirmPassword) {
      this.showStatus(signupStatus, '❌ Passwords do not match', 'error');
      return;
    }
    
    if (password.length < 6) {
      this.showStatus(signupStatus, '⚠️ Password must be at least 6 characters', 'warning');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showStatus(signupStatus, '⚠️ Please enter a valid email address', 'warning');
      return;
    }
    
    this.showLoading(signupBtn);
    this.showStatus(signupStatus, '🔄 Creating account...', 'loading');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.hideLoading(signupBtn);
    this.showStatus(signupStatus, '✅ Account created successfully! Please login.', 'success');
    
    setTimeout(() => {
      document.getElementById('signupForm').reset();
      this.switchToLogin();
    }, 2000);
  }

  handleForgotPassword() {
    const loginStatus = document.getElementById('loginStatus');
    this.showStatus(loginStatus, '📧 Password reset functionality will be available soon', 'warning');
  }

  switchToSignup() {
    gsap.to('#loginScreen', {
      opacity: 0,
      x: -50,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('signupScreen').classList.add('active');
        
        gsap.fromTo('#signupScreen', 
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
        );
        
        this.animateSignup();
      }
    });
  }

  switchToLogin() {
    gsap.to('#signupScreen', {
      opacity: 0,
      x: 50,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        document.getElementById('signupScreen').classList.remove('active');
        document.getElementById('loginScreen').classList.add('active');
        
        gsap.fromTo('#loginScreen', 
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
        );
        
        this.animateLogin();
      }
    });
  }

  animateSignup() {
    const signupContainer = document.querySelector('#signupScreen .login-container');
    
    gsap.fromTo(signupContainer, 
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
    );

    gsap.from('#signupScreen .input-group', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.3
    });

    gsap.from('#signupScreen .login-btn', {
      opacity: 0,
      scale: 0.9,
      duration: 0.6,
      ease: "back.out(1.7)",
      delay: 0.8
    });
  }

  handleLogout() {
    this.currentUser = null;
    
    gsap.to('#mainScreen', {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        document.getElementById('mainScreen').classList.remove('active');
        document.getElementById('loginScreen').classList.add('active');
        
        gsap.to('#loginScreen', {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power2.out"
        });
        
        document.getElementById('loginForm').reset();
        document.getElementById('loginStatus').classList.remove('show');
      }
    });
  }

  switchToMainScreen() {
    document.getElementById('welcomeUser').textContent = `Welcome, ${this.currentUser.username}!`;
    
    gsap.to('#loginScreen', {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');
        
        gsap.from('#mainScreen', {
          opacity: 0,
          scale: 0.9,
          duration: 0.8,
          ease: "power2.out"
        });
        
        this.animateMainScreen();
      }
    });
  }

  animateMainScreen() {
    gsap.from('.header', {
      y: -100,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    });
    
    gsap.from('.tab-btn', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.3
    });
    
    gsap.from('.validation-panel.active', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.5
    });
  }

  switchTab(e) {
    const tabName = e.target.closest('.tab-btn').dataset.tab;
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    e.target.closest('.tab-btn').classList.add('active');
    
    const currentPanel = document.querySelector('.validation-panel.active');
    const newPanel = document.getElementById(`${tabName}-panel`);
    
    if (currentPanel !== newPanel) {
      anime({
        targets: currentPanel,
        opacity: [1, 0],
        translateY: [0, -30],
        duration: 300,
        easing: 'easeInQuad',
        complete: () => {
          currentPanel.classList.remove('active');
          newPanel.classList.add('active');
          
          anime({
            targets: newPanel,
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 400,
            easing: 'easeOutQuad'
          });
        }
      });
    }
  }

  animateInputFocus(input) {
    gsap.to(input, {
      scale: 1.02,
      duration: 0.3,
      ease: "power2.out"
    });
    
    const highlight = input.nextElementSibling;
    if (highlight && highlight.classList.contains('input-highlight')) {
      gsap.to(highlight, {
        width: '100%',
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }

  animateInputBlur(input) {
    gsap.to(input, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
    
    const highlight = input.nextElementSibling;
    if (highlight && highlight.classList.contains('input-highlight')) {
      gsap.to(highlight, {
        width: '0%',
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }

  async handleAadhaarValidation(e) {
    e.preventDefault();

    const aadhaar = document.getElementById('aadhaar_number').value.trim();
    const userId = document.getElementById('aadhaar_user_id').value.trim();
    const statusEl = document.getElementById('aadhaarStatus');

    if (!aadhaar || !userId) {
      this.showStatus(statusEl, '⚠️ All fields are required', 'warning');
      return;
    }

    if (!/^\d{12}$/.test(aadhaar)) {
      this.showStatus(statusEl, '❌ Invalid Aadhaar number (must be 12 digits)', 'error');
      return;
    }

    await this.performValidation(
      '/validate-aadhaar',
      { aadhaar_number: aadhaar, user_id: userId },
      statusEl,
      document.getElementById('aadhaarResult'),
      document.querySelector('#aadhaarForm .validate-btn')
    );
  }

  async handlePanValidation(e) {
    e.preventDefault();

    const pan = document.getElementById('pan_number').value.trim();
    const userId = document.getElementById('pan_user_id').value.trim();
    const statusEl = document.getElementById('panStatus');

    if (!pan || !userId) {
      this.showStatus(statusEl, '⚠️ All fields are required', 'warning');
      return;
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase())) {
      this.showStatus(statusEl, '❌ Invalid PAN format (e.g., ABCDE1234F)', 'error');
      return;
    }

    await this.performValidation(
      '/validate-pan',
      { pan_number: pan.toUpperCase(), user_id: userId },
      statusEl,
      document.getElementById('panResult'),
      document.querySelector('#panForm .validate-btn')
    );
  }

  async handleBankValidation(e) {
    e.preventDefault();

    const account = document.getElementById('account_number').value.trim();
    const ifsc = document.getElementById('ifsc_code').value.trim().toUpperCase();
    const userId = document.getElementById('bank_user_id').value.trim();
    const statusEl = document.getElementById('bankStatus');

    if (!account || !ifsc || !userId) {
      this.showStatus(statusEl, '⚠️ All fields are required', 'warning');
      return;
    }

    if (!/^\d{9,18}$/.test(account)) {
      this.showStatus(statusEl, '❌ Invalid account number (9–18 digits)', 'error');
      return;
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      this.showStatus(statusEl, '❌ Invalid IFSC format (e.g., SBIN0001234)', 'error');
      return;
    }

    await this.performValidation(
      '/validate-bank',
      { account_number: account, ifsc_code: ifsc, user_id: userId },
      statusEl,
      document.getElementById('bankResult'),
      document.querySelector('#bankForm .validate-btn')
    );
  }

  async performValidation(endpoint, data, statusEl, resultEl, btnEl) {
    this.showLoading(btnEl);
    this.showStatus(statusEl, '⏳ Validating...', 'loading');
    resultEl.classList.remove('show');
    
    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      let result;

      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        const errorMessage = result.error || `Server error (${response.status})`;
        this.showStatus(statusEl, `❌ ${errorMessage}`, 'error');
        this.showResult(resultEl, JSON.stringify(result, null, 2));
        return;
      }

      this.showStatus(statusEl, '✅ Validation completed successfully!', 'success');
      this.showResult(resultEl, JSON.stringify(result.data || result, null, 2));
      this.animateSuccess(statusEl);

    } catch (error) {
      console.error('Validation error:', error);
      this.showStatus(statusEl, '❌ Unable to connect to server', 'error');
      this.showResult(resultEl, '');
    } finally {
      this.hideLoading(btnEl);
    }
  }

  showLoading(btnEl) {
    btnEl.classList.add('loading');
    btnEl.disabled = true;
  }

  hideLoading(btnEl) {
    btnEl.classList.remove('loading');
    btnEl.disabled = false;
  }

  showStatus(statusEl, message, type) {
    statusEl.className = `status ${type} show`;
    
    let icon = '';
    switch (type) {
      case 'success': icon = '✅'; break;
      case 'error': icon = '❌'; break;
      case 'loading': icon = '⏳'; break;
      case 'warning': icon = '⚠️'; break;
    }

    statusEl.innerHTML = `${icon} ${message}`;
    statusEl.style.opacity = '1';

    gsap.fromTo(statusEl, {
      y: 20,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    });
  }

  showResult(resultEl, content) {
    resultEl.textContent = content;
    resultEl.classList.add('show');
    
    gsap.from(resultEl, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      delay: 0.2
    });
  }

  animateSuccess(element) {
    gsap.to(element, {
      scale: 1.05,
      duration: 0.2,
      ease: "power2.out",
      yoyo: true,
      repeat: 1
    });
    
    this.createSuccessParticles(element);
  }

  createSuccessParticles(element) {
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: #4CAF50;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
      `;
      
      document.body.appendChild(particle);
      
      const angle = (i / 12) * Math.PI * 2;
      const distance = 100 + Math.random() * 50;
      
      anime({
        targets: particle,
        translateX: Math.cos(angle) * distance,
        translateY: Math.sin(angle) * distance,
        opacity: [1, 0],
        scale: [1, 0],
        duration: 1000 + Math.random() * 500,
        easing: 'easeOutQuad',
        complete: () => {
          document.body.removeChild(particle);
        }
      });
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new KYCValidator();
});

// Custom cursor effect
document.addEventListener('mousemove', (e) => {
  const cursor = document.querySelector('.cursor');
  if (!cursor) {
    const cursorEl = document.createElement('div');
    cursorEl.className = 'cursor';
    cursorEl.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, rgba(76,175,80,0.3) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference;
      transition: transform 0.1s ease;
    `;
    document.body.appendChild(cursorEl);
  }
  
  const cursorElement = document.querySelector('.cursor');
  cursorElement.style.left = e.clientX - 10 + 'px';
  cursorElement.style.top = e.clientY - 10 + 'px';
});

// Hover effects for interactive elements
document.addEventListener('DOMContentLoaded', () => {
  const interactiveElements = document.querySelectorAll('button, input, .tab-btn');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(el, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });
});
