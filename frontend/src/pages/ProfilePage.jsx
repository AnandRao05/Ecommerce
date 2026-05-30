import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      addToast('Passwords do not match', 'warning');
      return;
    }
    if (form.password && form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'warning');
      return;
    }
    setLoading(true);
    const payload = { name: form.name, email: form.email };
    if (form.password) payload.password = form.password;

    const result = await updateProfile(payload);
    setLoading(false);

    if (result.success) {
      addToast('Profile updated successfully!', 'success');
      setForm(f => ({ ...f, password: '', confirmPassword: '' }));
    } else {
      addToast(result.message || 'Update failed', 'error');
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="page-header">
          <h1>👤 My Profile</h1>
          <p>Update your account details</p>
        </div>

        <div className="card">
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.8rem', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user?.email}</div>
              <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-info'}`} style={{ marginTop: 4 }}>
                {user?.role === 'admin' ? '⚡ Admin' : '👤 User'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="form-group">
              <label>Full Name</label>
              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                id="profile-name"
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email Address</label>
              <input
                className="form-control"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                id="profile-email"
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem 0', padding: '1.5rem 0 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, margin: 0 }}>Change Password</label>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowPass(p => !p)}>
                  {showPass ? 'Hide' : 'Change Password'}
                </button>
              </div>

              {showPass && (
                <>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      className="form-control"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 6 characters"
                      id="profile-password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      className="form-control"
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat new password"
                      id="profile-confirm-password"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
              id="save-profile"
            >
              {loading ? '💾 Saving…' : '💾 Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
