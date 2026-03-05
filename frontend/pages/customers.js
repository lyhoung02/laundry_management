import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { useLang } from '../lib/langContext';
import Layout from '../components/Layout';
import api from '../lib/api';
import toast from 'react-hot-toast';

const TYPES = ['individual','business','healthcare','hospitality'];
const TYPE_ICONS = { individual: '👤', business: '🏢', healthcare: '🏥', hospitality: '🏨' };

export default function Customers() {
  const { user, loading } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', type: 'individual', notes: '' });

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => { if (user) loadCustomers(); }, [user]);

  const loadCustomers = async () => {
    const { data } = await api.get('/customers');
    setCustomers(data);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email||'', phone: c.phone||'', address: c.address||'', type: c.type, notes: c.notes||'' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/customers/${editing.id}`, form); toast.success('Updated!'); }
      else { await api.post('/customers', form); toast.success('Customer added!'); }
      setShowModal(false); setEditing(null);
      setForm({ name: '', email: '', phone: '', address: '', type: 'individual', notes: '' });
      loadCustomers();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete customer?')) return;
    await api.delete(`/customers/${id}`);
    toast.success('Deleted');
    loadCustomers();
  };

  if (loading || !user) return null;

  return (
    <Layout>
      <div className={`fade-in ${lang === 'km' ? 'lang-km' : ''}`}>
        <div className="page-header">
          <h1 className="page-title">👥 {t('customers')}</h1>
          <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ {t('addCustomer')}</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {customers.map(c => (
            <div key={c.id} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>{TYPE_ICONS[c.type] || '👤'}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                    <span className="badge" style={{ background: '#EDE9FE', color: '#5B21B6', marginTop: 4 }}>{c.type}</span>
                  </div>
                </div>
              </div>
              {c.email && <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>📧 {c.email}</div>}
              {c.phone && <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>📞 {c.phone}</div>}
              {c.address && <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>📍 {c.address}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => openEdit(c)}>{t('edit')}</button>
                <button className="btn-danger" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => handleDelete(c.id)}>{t('delete')}</button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700 }}>{editing ? t('edit') : t('addCustomer')}</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">{t('name')}</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="form-label">{t('email')}</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">{t('phone')}</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">{t('type')}</label>
                    <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      {TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">{t('address')}</label>
                    <input className="form-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
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
