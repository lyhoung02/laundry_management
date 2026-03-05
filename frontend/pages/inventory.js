import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { useLang } from '../lib/langContext';
import Layout from '../components/Layout';
import api from '../lib/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['linen','uniform','towel','healthcare','other'];
const CONDITIONS = ['good','worn','damaged','retired'];

export default function Inventory() {
  const { user, loading } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [catFilter, setCatFilter] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [form, setForm] = useState({ name:'', category:'linen', rfid_tag:'', quantity:0, min_quantity:10, unit:'piece', customer_id:'', condition_status:'good', notes:'' });

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);

  const loadItems = async () => {
    const params = {};
    if (catFilter) params.category = catFilter;
    if (lowStock) params.low_stock = 'true';
    const { data } = await api.get('/inventory', { params });
    setItems(data);
  };

  useEffect(() => { if (user) { loadItems(); api.get('/customers').then(r => setCustomers(r.data)); } }, [user, catFilter, lowStock]);

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, category: item.category, rfid_tag: item.rfid_tag||'', quantity: item.quantity, min_quantity: item.min_quantity, unit: item.unit, customer_id: item.customer_id||'', condition_status: item.condition_status, notes: item.notes||'' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/inventory/${editing.id}`, form); toast.success('Updated!'); }
      else { await api.post('/inventory', form); toast.success('Item added!'); }
      setShowModal(false); setEditing(null);
      setForm({ name:'', category:'linen', rfid_tag:'', quantity:0, min_quantity:10, unit:'piece', customer_id:'', condition_status:'good', notes:'' });
      loadItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/inventory/${id}`);
    toast.success('Deleted');
    loadItems();
  };

  if (loading || !user) return null;

  return (
    <Layout>
      <div className={`fade-in ${lang === 'km' ? 'lang-km' : ''}`}>
        <div className="page-header">
          <h1 className="page-title">📦 {t('inventory')}</h1>
          <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ {t('addItem')}</button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-input" style={{ maxWidth: 180 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">{t('all')} {t('category')}</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{t(c)}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748B', cursor: 'pointer' }}>
            <input type="checkbox" checked={lowStock} onChange={e => setLowStock(e.target.checked)} />
            ⚠️ {t('lowStock')} only
          </label>
          <div style={{ marginLeft: 'auto', fontSize: 14, color: '#64748B' }}>
            {items.length} items | {items.filter(i => i.quantity <= i.min_quantity).length} low stock
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>{t('itemName')}</th>
              <th>{t('category')}</th>
              <th>{t('rfidTag')}</th>
              <th>{t('quantity')}</th>
              <th>{t('minQuantity')}</th>
              <th>{t('condition')}</th>
              <th>{t('customer')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94A3B8', padding: 40 }}>{t('noData')}</td></tr>
            ) : items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td><span className="badge" style={{ background: '#EDE9FE', color: '#5B21B6' }}>{t(item.category)}</span></td>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748B' }}>{item.rfid_tag || '-'}</td>
                <td>
                  <span style={{ fontWeight: 700, color: item.quantity <= item.min_quantity ? '#EF4444' : '#10B981' }}>
                    {item.quantity}
                  </span>
                  {item.quantity <= item.min_quantity && <span style={{ marginLeft: 6 }}>⚠️</span>}
                </td>
                <td style={{ color: '#64748B' }}>{item.min_quantity}</td>
                <td>
                  <span className={`badge ${item.condition_status === 'good' ? 'badge-pass' : item.condition_status === 'worn' ? 'badge-pending' : 'badge-fail'}`}>
                    {item.condition_status}
                  </span>
                </td>
                <td style={{ fontSize: 13 }}>{item.customer_name || '-'}</td>
                <td>
                  <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 12px', marginRight: 6 }} onClick={() => openEdit(item)}>{t('edit')}</button>
                  <button className="btn-danger" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => handleDelete(item.id)}>{t('delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700 }}>{editing ? t('edit') : t('addItem')}</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">{t('itemName')}</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="form-label">{t('category')}</label>
                    <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{t(c)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">{t('rfidTag')}</label>
                    <input className="form-input" value={form.rfid_tag} onChange={e => setForm({...form, rfid_tag: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">{t('quantity')}</label>
                    <input className="form-input" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">{t('minQuantity')}</label>
                    <input className="form-input" type="number" value={form.min_quantity} onChange={e => setForm({...form, min_quantity: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">{t('condition')}</label>
                    <select className="form-input" value={form.condition_status} onChange={e => setForm({...form, condition_status: e.target.value})}>
                      {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">{t('customer')}</label>
                    <select className="form-input" value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})}>
                      <option value="">None</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
