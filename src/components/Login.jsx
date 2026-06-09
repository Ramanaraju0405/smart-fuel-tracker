import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../utils/storage';

const FUEL_FACTS = [
  'Track every drop, maximize every rupee.',
  'Real-time stock. Real-time profits.',
  'From pump to profit — all in one place.',
  'Smart vendors track smart. Start today.',
  'Your fuel business, fully in control.',
];

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: -(Math.random() * 0.5 + 0.15),
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${p.opacity})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
};

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', username: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [factIdx, setFactIdx] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setFactIdx(i => (i + 1) % FUEL_FACTS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validateLogin = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const validateRegister = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'Minimum 3 characters';
    else if (storage.findUser(form.username)) e.username = 'Username already taken';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (!form.confirm) e.confirm = 'Please confirm password';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const handleLogin = async () => {
    const e = validateLogin();
    if (Object.keys(e).length) { setErrors(e); triggerShake(); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const user = storage.findUser(form.username);
    if (!user || user.password !== form.password) {
      setErrors({ password: 'Invalid username or password' });
      setLoading(false);
      triggerShake();
      return;
    }
    storage.setCurrentUser({ id: user.id, name: user.name, username: user.username });
    setLoading(false);
    onLogin({ id: user.id, name: user.name, username: user.username });
  };

  const handleRegister = async () => {
    const e = validateRegister();
    if (Object.keys(e).length) { setErrors(e); triggerShake(); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const user = { id: `user-${Date.now()}`, name: form.name.trim(), username: form.username.trim(), password: form.password };
    storage.saveUser(user);
    storage.setCurrentUser({ id: user.id, name: user.name, username: user.username });
    setLoading(false);
    onLogin({ id: user.id, name: user.name, username: user.username });
  };

  const switchMode = (m) => {
    setMode(m); setErrors({});
    setForm({ name: '', username: '', password: '', confirm: '' });
    setShowPass(false); setShowConfirm(false);
  };

  return (
    <div className="login-page">
      {/* Animated BG */}
      <div className="login-bg">
        <div className="login-bg-grid" />
        <ParticleCanvas />
        <div className="login-bg-glow login-bg-glow-1" />
        <div className="login-bg-glow login-bg-glow-2" />
        <div className="login-bg-glow login-bg-glow-3" />
      </div>

      <div className="login-layout">
        {/* Left Panel — Branding */}
        <div className="login-brand-panel">
          <div className="brand-content">
            <div className="brand-logo-wrap">
              <div className="brand-logo-ring" />
              <div className="brand-logo-inner">⛽</div>
            </div>
            <h1 className="brand-title">Smart Fuel<br /><span className="brand-accent">Sales Tracker</span></h1>
            <p className="brand-desc">Professional inventory &amp; revenue management for modern fuel vendors.</p>

            <div className="brand-fact-wrap">
              <div className="brand-fact-bar" />
              <p className="brand-fact" key={factIdx}>{FUEL_FACTS[factIdx]}</p>
            </div>

            <div className="brand-features">
              {[
                { icon: '📊', label: 'Live Dashboard' },
                { icon: '💰', label: 'Profit Analytics' },
                { icon: '📄', label: 'PDF Reports' },
                { icon: '📥', label: 'CSV Export' },
                { icon: '📈', label: 'Trends & Charts' },
                { icon: '🌙', label: 'Dark / Light' },
              ].map(f => (
                <div className="brand-feat-chip" key={f.label}>
                  <span>{f.icon}</span><span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="login-form-panel">
          <div className={`login-card ${shake ? 'shake' : ''}`}>

            {/* Tab switcher */}
            <div className="login-tabs">
              <button className={`login-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>
                Sign In
              </button>
              <button className={`login-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')}>
                Create Account
              </button>
              <div className={`login-tab-indicator ${mode === 'register' ? 'right' : 'left'}`} />
            </div>

            <div className="login-form-body">
              {mode === 'login' ? (
                <>
                  <div className="login-welcome">
                    <h2>Welcome back 👋</h2>
                    <p>Sign in to your fuel tracker account</p>
                  </div>

                  <div className="lf-group">
                    <label>Username</label>
                    <div className={`lf-input-wrap ${errors.username ? 'error' : form.username ? 'filled' : ''}`}>
                      <span className="lf-icon">👤</span>
                      <input type="text" placeholder="Enter your username"
                        value={form.username} onChange={e => set('username', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()} autoComplete="username" />
                    </div>
                    {errors.username && <span className="lf-error">⚠ {errors.username}</span>}
                  </div>

                  <div className="lf-group">
                    <label>Password</label>
                    <div className={`lf-input-wrap ${errors.password ? 'error' : form.password ? 'filled' : ''}`}>
                      <span className="lf-icon">🔒</span>
                      <input type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                        value={form.password} onChange={e => set('password', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()} autoComplete="current-password" />
                      <button className="lf-eye" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.password && <span className="lf-error">⚠ {errors.password}</span>}
                  </div>

                  <button className="login-btn" onClick={handleLogin} disabled={loading}>
                    {loading ? <span className="login-spinner" /> : '⚡ Sign In'}
                  </button>

                  <p className="login-switch-hint">
                    Don't have an account?{' '}
                    <button className="login-link" onClick={() => switchMode('register')}>Create one free</button>
                  </p>
                </>
              ) : (
                <>
                  <div className="login-welcome">
                    <h2>Get started 🚀</h2>
                    <p>Create your free fuel tracker account</p>
                  </div>

                  <div className="lf-group">
                    <label>Full Name</label>
                    <div className={`lf-input-wrap ${errors.name ? 'error' : form.name ? 'filled' : ''}`}>
                      <span className="lf-icon">✏️</span>
                      <input type="text" placeholder="e.g. Ravi Kumar"
                        value={form.name} onChange={e => set('name', e.target.value)} />
                    </div>
                    {errors.name && <span className="lf-error">⚠ {errors.name}</span>}
                  </div>

                  <div className="lf-group">
                    <label>Username</label>
                    <div className={`lf-input-wrap ${errors.username ? 'error' : form.username ? 'filled' : ''}`}>
                      <span className="lf-icon">👤</span>
                      <input type="text" placeholder="Choose a username"
                        value={form.username} onChange={e => set('username', e.target.value)} autoComplete="username" />
                    </div>
                    {errors.username && <span className="lf-error">⚠ {errors.username}</span>}
                  </div>

                  <div className="lf-row">
                    <div className="lf-group">
                      <label>Password</label>
                      <div className={`lf-input-wrap ${errors.password ? 'error' : form.password ? 'filled' : ''}`}>
                        <span className="lf-icon">🔒</span>
                        <input type={showPass ? 'text' : 'password'} placeholder="Min 6 chars"
                          value={form.password} onChange={e => set('password', e.target.value)} autoComplete="new-password" />
                        <button className="lf-eye" onClick={() => setShowPass(p => !p)} tabIndex={-1}>{showPass ? '🙈' : '👁️'}</button>
                      </div>
                      {errors.password && <span className="lf-error">⚠ {errors.password}</span>}
                    </div>

                    <div className="lf-group">
                      <label>Confirm</label>
                      <div className={`lf-input-wrap ${errors.confirm ? 'error' : form.confirm ? 'filled' : ''}`}>
                        <span className="lf-icon">🔑</span>
                        <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter"
                          value={form.confirm} onChange={e => set('confirm', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleRegister()} autoComplete="new-password" />
                        <button className="lf-eye" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>{showConfirm ? '🙈' : '👁️'}</button>
                      </div>
                      {errors.confirm && <span className="lf-error">⚠ {errors.confirm}</span>}
                    </div>
                  </div>

                  {form.password && (
                    <div className="password-strength">
                      <div className="ps-label">Password strength</div>
                      <div className="ps-bars">
                        {[1, 2, 3, 4].map(n => {
                          const strength = form.password.length >= 10 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 4
                            : form.password.length >= 8 ? 3
                            : form.password.length >= 6 ? 2 : 1;
                          return <div key={n} className={`ps-bar ${n <= strength ? `ps-${strength}` : ''}`} />;
                        })}
                      </div>
                      <span className="ps-text">
                        {form.password.length < 6 ? 'Weak' : form.password.length < 8 ? 'Fair' : form.password.length < 10 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  )}

                  <button className="login-btn" onClick={handleRegister} disabled={loading}>
                    {loading ? <span className="login-spinner" /> : '🚀 Create Account'}
                  </button>

                  <p className="login-switch-hint">
                    Already have an account?{' '}
                    <button className="login-link" onClick={() => switchMode('login')}>Sign in</button>
                  </p>
                </>
              )}
            </div>
          </div>

          <p className="login-footer">Smart Fuel Sales Tracker · Data stored locally on your device</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
