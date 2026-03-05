import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { useLang } from '../lib/langContext';
import Layout from '../components/Layout';
import api from '../lib/api';

const ACTION_ICONS = {
  ORDER_CREATED: '📋', STATUS_UPDATE: '🔄', QUALITY_CHECK: '🧪',
  DELIVERY: '🚚', DEFAULT: '📌'
};

export default function Compliance() {
  const { user, loading } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => { if (user) api.get('/compliance').then(r => setLogs(r.data)); }, [user]);

  if (loading || !user) return null;

  const filtered = logs.filter(l =>
    !search || l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    l.performed_by_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className={`fade-in ${lang === 'km' ? 'lang-km' : ''}`}>
        <div className="page-header">
          <h1 className="page-title">🔍 {t('compliance')}</h1>
        </div>

        <div style={{ marginBottom: 20 }}>
          <input className="form-input" style={{ maxWidth: 360 }} placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>📜 {t('auditTrail')} ({filtered.length} records)</h3>
          
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: '#E2E8F0' }} />
            
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94A3B8', padding: 40 }}>{t('noData')}</div>
            ) : filtered.map((log, i) => (
              <div key={log.id} style={{ display: 'flex', gap: 16, marginBottom: 20, position: 'relative' }}>
                {/* Icon dot */}
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: '#F0F4F8', border: '2px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0, zIndex: 1,
                  boxShadow: '0 0 0 4px #F8FAFC'
                }}>
                  {ACTION_ICONS[log.action] || ACTION_ICONS.DEFAULT}
                </div>
                
                {/* Content */}
                <div style={{ flex: 1, paddingTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{log.action}</span>
                      {log.order_number && <span style={{ marginLeft: 8, fontSize: 12, color: '#1B6CA8', background: '#EFF6FF', padding: '2px 8px', borderRadius: 10 }}>#{log.order_number}</span>}
                    </div>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{log.description}</div>
                  {log.performed_by_name && (
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>By: {log.performed_by_name}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
