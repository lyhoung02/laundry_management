import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { useLang } from '../lib/langContext';

const navItems = [
  { key: 'dashboard', href: '/dashboard', icon: '📊' },
  { key: 'orders', href: '/orders', icon: '🧺' },
  { key: 'inventory', href: '/inventory', icon: '📦' },
  { key: 'customers', href: '/customers', icon: '👥' },
  { key: 'schedule', href: '/schedule', icon: '📅' },
  { key: 'quality', href: '/quality', icon: '✅' },
  { key: 'reports', href: '/reports', icon: '📈' },
  { key: 'compliance', href: '/compliance', icon: '🔍' },
];

export default function Layout({ children }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLang();

  if (!user) return null;

  return (
    <div className={lang === 'km' ? 'lang-km' : ''}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '28px 24px 20px' }}>
          <div style={{ color: 'white', marginBottom: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>
              🫧 {t('appName')}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              {t('appTagline')}
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '12px 16px', margin: '0 12px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', marginBottom: 20 }}>
          <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{user.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'capitalize' }}>{user.role}</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0 12px' }}>
          {navItems.map(item => {
            const active = router.pathname.startsWith(item.href);
            return (
              <Link key={item.key} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 10, marginBottom: 4,
                  color: active ? 'white' : 'rgba(255,255,255,0.65)',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                  borderLeft: active ? '3px solid #00B4D8' : '3px solid transparent'
                }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {t(item.key)}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ position: 'absolute', bottom: 24, left: 12, right: 12 }}>
          {/* Language toggle */}
          <button onClick={toggleLang} style={{
            width: '100%', padding: '10px', borderRadius: 10,
            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
            cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            🌐 {lang === 'en' ? 'ភាសាខ្មែរ' : 'English'}
          </button>
          <button onClick={logout} style={{
            width: '100%', padding: '10px', borderRadius: 10,
            background: 'rgba(239,35,60,0.2)', border: 'none', color: '#ff8099',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            🚪 {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
