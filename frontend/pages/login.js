import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { useLang } from '../lib/langContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@laundry.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={lang === 'km' ? 'lang-km' : ''} style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F4C75 0%, #1B6CA8 40%, #00B4D8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: -150, left: -80, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div style={{ width: '100%', maxWidth: 440, padding: '0 24px', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🫧</div>
          <h1 style={{ color: 'white', fontSize: 30, fontWeight: 700, margin: 0 }}>{t('loginTitle')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8, fontSize: 15 }}>{t('loginSubtitle')}</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 24, padding: 36, boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">{t('emailAddress')}</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label className="form-label">{t('password')}</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }} disabled={loading}>
              {loading ? '...' : t('signIn')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#94A3B8' }}>
            Default: admin@laundry.com / password
          </div>
        </div>

        {/* Language toggle */}
        <button onClick={toggleLang} style={{ display: 'block', margin: '20px auto 0', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '10px 24px', borderRadius: 20, cursor: 'pointer', fontSize: 14 }}>
          🌐 {lang === 'en' ? 'ភាសាខ្មែរ' : 'English'}
        </button>
      </div>
    </div>
  );
}
