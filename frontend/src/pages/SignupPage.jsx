import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SignupPage() {
  const { signup, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name too short';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const result = await signup({ name: form.name, email: form.email, password: form.password });
    if (result.success) {
      addToast('Account created successfully! 🎉', 'success');
      navigate('/');
    } else {
      addToast(result.message, 'error');
    }
  };

  const strength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const pw = strength();
  const pwLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][pw];
  const pwColor = ['', '#fc5c65', '#f7b731', '#45aaf2', '#43e97b', '#6c63ff'][pw];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🛍️ <span className="gradient-text">ShopX</span></Link>
          <h1>Create Account</h1>
          <p>Join thousands of happy shoppers</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              className={`form-control ${errors.name ? 'input-error' : ''}`}
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              autoComplete="name"
            />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              className={`form-control ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              autoComplete="email"
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-password"
                type={showPass ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'input-error' : ''}`}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                autoComplete="new-password"
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            {form.password && (
              <div className="pw-strength">
                <div className="pw-bars">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="pw-bar" style={{ background: i <= pw ? pwColor : undefined }} />
                  ))}
                </div>
                <span className="pw-label" style={{ color: pwColor }}>{pwLabel}</span>
              </div>
            )}
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <input
              id="signup-confirm"
              type={showPass ? 'text' : 'password'}
              className={`form-control ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading} id="signup-submit">
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating…</> : '✨ Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
