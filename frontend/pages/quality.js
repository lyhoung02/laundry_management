import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { useLang } from '../lib/langContext';
import Layout from '../components/Layout';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Quality() {
  const { user, loading } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const [checks, setChecks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ order_id: '', temperature: '', detergent_used: '', wash_cycle: '', result: 'pass', notes: '' });

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => {
    if (user) {
      api.get('/quality').then(r => setChecks(r.data));
      api.get('/orders').then(r => setOrders(r.data.orders || []));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/quality', form);
      toast.success('QC recorded!');
      setShowModal(false);
      setForm({ order_id: '', temperature: '', detergent_used: '', wash_cycle: '', result: 'pass', notes: '' });
      api.get('/quality').then(r => setChecks(r.data));
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  if (loading || !user) return null;

  const passRate = checks.length ? Math.round(checks.filter(c => c.result === 'pass').length / checks.length * 100) : 0;

  return (
    <Layout>
      <div className={`fade-in ${lang === 'km' ? 'lang-km' : ''}`}>
        <div className="page-header">
          <h1 className="page-title">✅ {t('quality')}</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ {t('addQCRecord')}</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#10B981' }}>{passRate}%</div>
            <div style={{ color: '#64748B', fontSize: 14 }}>Pass Rate</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#1B6CA8' }}>{checks.length}</div>
            <div style={{ color: '#64748B', fontSize: 14 }}>Total Checks</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#EF4444' }}>{checks.filter(c => c.result === 'fail').length}</div>
            <div style={{ color: '#64748B', fontSize: 14 }}>Failed</div>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>{t('temperature')}</th>
              <th>{t('detergent')}</th>
              <th>{t('washCycle')}</th>
              <th>{t('result')}</th>
              <th>Checked By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {checks.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94A3B8', padding: 40 }}>{t('noData')}</td></tr>
            ) : checks.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600, color: '#1B6CA8' }}>{c.order_number || `#${c.order_id}`}</td>
                <td>{c.temperature ? `${c.temperature}°C` : '-'}</td>
                <td>{c.detergent_used || '-'}</td>
                <td>{c.wash_cycle || '-'}</td>
                <td><span className={`badge badge-${c.result}`}>{t(c.result)}</span></td>
                <td style={{ fontSize: 13 }}>{c.checked_by_name || '-'}</td>
                <td style={{ fontSize: 13, color: '#94A3B8' }}>{new Date(c.checked_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700 }}>🧪 {t('addQCRecord')}</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Order</label>
                    <select className="form-input" value={form.order_id} onChange={e => setForm({...form, order_id: e.target.value})} required>
                      <option value="">-- Select Order --</option>
                      {orders.map(o => <option key={o.id} value={o.id}>{o.order_number} - {o.customer_name || 'Unknown'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">{t('temperature')}</label>
                    <input className="form-input" type="number" step="0.1" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">{t('detergent')}</label>
                    <input className="form-input" value={form.detergent_used} onChange={e => setForm({...form, detergent_used: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">{t('washCycle')}</label>
                    <input className="form-input" value={form.wash_cycle} onChange={e => setForm({...form, wash_cycle: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">{t('result')}</label>
                    <select className="form-input" value={form.result} onChange={e => setForm({...form, result: e.target.value})}>
                      <option value="pass">{t('pass')}</option>
                      <option value="fail">{t('fail')}</option>
                      <option value="reprocess">{t('reprocess')}</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">{t('notes')}</label>
                    <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>{t('cancel')}</button>
                  <button type="submit" className="btn-primary">{t('save')}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
