import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { useLang } from '../lib/langContext';
import Layout from '../components/Layout';
import api from '../lib/api';
import toast from 'react-hot-toast';

const SCHEDULE_TYPES = ['pickup','washing','delivery','maintenance'];
const TYPE_COLORS = { pickup: '#3B82F6', washing: '#8B5CF6', delivery: '#10B981', maintenance: '#F59E0B' };
const TYPE_ICONS = { pickup: '🚚', washing: '🫧', delivery: '📦', maintenance: '🔧' };

export default function Schedule() {
  const { user, loading } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const [schedules, setSchedules] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [form, setForm] = useState({ title: '', order_id: '', schedule_type: 'washing', scheduled_at: '', notes: '' });

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => { if (user) { loadSchedules(); api.get('/orders').then(r => setOrders(r.data.orders || [])); } }, [user, dateFilter]);

  const loadSchedules = async () => {
    const params = {};
    if (dateFilter) params.date = dateFilter;
    const { data } = await api.get('/schedules', { params });
    setSchedules(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/schedules', form);
      toast.success('Scheduled!');
      setShowModal(false);
      setForm({ title: '', order_id: '', schedule_type: 'washing', scheduled_at: '', notes: '' });
      loadSchedules();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const complete = async (id) => {
    await api.patch(`/schedules/${id}/complete`);
    toast.success('Marked complete');
    loadSchedules();
  };

  if (loading || !user) return null;

  const today = schedules.filter(s => {
    const d = new Date(s.scheduled_at).toDateString();
    return d === new Date().toDateString();
  });
  const upcoming = schedules.filter(s => new Date(s.scheduled_at) > new Date() && s.status !== 'completed');

  return (
    <Layout>
      <div className={`fade-in ${lang === 'km' ? 'lang-km' : ''}`}>
        <div className="page-header">
          <h1 className="page-title">📅 {t('schedule')}</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ {t('createSchedule')}</button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <input className="form-input" type="date" style={{ maxWidth: 200 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          {dateFilter && <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => setDateFilter('')}>Clear</button>}
        </div>

        {/* Today */}
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#1B6CA8' }}>📌 Today ({today.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 28 }}>
          {today.length === 0 ? (
            <div style={{ color: '#94A3B8', fontSize: 14, padding: '20px 0' }}>{t('noData')}</div>
          ) : today.map(s => (
            <ScheduleCard key={s.id} s={s} t={t} complete={complete} />
          ))}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📋 All Schedules ({schedules.length})</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>{t('title')}</th>
              <th>Order</th>
              <th>{t('scheduledAt')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map(s => (
              <tr key={s.id}>
                <td>
                  <span style={{ fontSize: 18 }}>{TYPE_ICONS[s.schedule_type]}</span>
                  <span style={{ marginLeft: 6, fontSize: 13, color: TYPE_COLORS[s.schedule_type], fontWeight: 600 }}>{s.schedule_type}</span>
                </td>
                <td style={{ fontWeight: 600 }}>{s.title}</td>
                <td style={{ color: '#1B6CA8', fontSize: 13 }}>{s.order_number || '-'}</td>
                <td style={{ fontSize: 13, color: '#64748B' }}>{new Date(s.scheduled_at).toLocaleString()}</td>
                <td>
                  <span className={`badge ${s.status === 'completed' ? 'badge-pass' : s.status === 'in_progress' ? 'badge-washing' : 'badge-pending'}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  {s.status !== 'completed' && (
                    <button className="btn-primary" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => complete(s.id)}>✓ Done</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700 }}>📅 {t('createSchedule')}</h2>
              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <label className="form-label">{t('title')}</label>
                    <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                  </div>
                  <div>
                    <label className="form-label">{t('scheduleType')}</label>
                    <select className="form-input" value={form.schedule_type} onChange={e => setForm({...form, schedule_type: e.target.value})}>
                      {SCHEDULE_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Order (optional)</label>
                    <select className="form-input" value={form.order_id} onChange={e => setForm({...form, order_id: e.target.value})}>
                      <option value="">None</option>
                      {orders.map(o => <option key={o.id} value={o.id}>{o.order_number}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">{t('scheduledAt')}</label>
                    <input className="form-input" type="datetime-local" value={form.scheduled_at} onChange={e => setForm({...form, scheduled_at: e.target.value})} required />
                  </div>
                  <div>
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

function ScheduleCard({ s, t, complete }) {
  const TYPE_COLORS = { pickup: '#3B82F6', washing: '#8B5CF6', delivery: '#10B981', maintenance: '#F59E0B' };
  const TYPE_ICONS = { pickup: '🚚', washing: '🫧', delivery: '📦', maintenance: '🔧' };
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${TYPE_COLORS[s.schedule_type]}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 24 }}>{TYPE_ICONS[s.schedule_type]}</div>
        <span className={`badge ${s.status === 'completed' ? 'badge-pass' : 'badge-pending'}`}>{s.status}</span>
      </div>
      <div style={{ fontWeight: 700, marginTop: 8 }}>{s.title}</div>
      {s.order_number && <div style={{ fontSize: 12, color: '#1B6CA8', marginTop: 4 }}>#{s.order_number}</div>}
      <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{new Date(s.scheduled_at).toLocaleTimeString()}</div>
      {s.status !== 'completed' && (
        <button className="btn-primary" style={{ marginTop: 12, fontSize: 12, padding: '6px 14px' }} onClick={() => complete(s.id)}>✓ Mark Done</button>
      )}
    </div>
  );
}
