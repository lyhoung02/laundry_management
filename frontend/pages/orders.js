import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { useLang } from '../lib/langContext';
import Layout from '../components/Layout';
import api from '../lib/api';
import toast from 'react-hot-toast';

const STATUSES = ['pending','picked_up','washing','drying','folding','quality_check','ready','delivered','cancelled'];
const PRIORITIES = ['normal','high','urgent'];

export default function Orders() {
  const { user, loading } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    customer_id: '', priority: 'normal', pickup_date: '', delivery_date: '',
    total_weight: '', cost_per_pound: '2.5', special_instructions: '',
    items: [{ item_name: '', quantity: 1, wash_type: 'standard' }]
  });

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);

  const loadOrders = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get('/orders', { params });
      setOrders(data.orders || []);
    } catch (e) { toast.error('Failed to load orders'); }
    finally { setFetching(false); }
  };

  useEffect(() => { if (user) { api.get('/customers').then(r => setCustomers(r.data)); loadOrders(); } }, [user, statusFilter, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/orders', form);
      toast.success('Order created!');
      setShowModal(false);
      setForm({ customer_id: '', priority: 'normal', pickup_date: '', delivery_date: '', total_weight: '', cost_per_pound: '2.5', special_instructions: '', items: [{ item_name: '', quantity: 1, wash_type: 'standard' }] });
      loadOrders();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success('Status updated');
      loadOrders();
    } catch (e) { toast.error('Error'); }
  };

  if (loading || !user) return null;

  return (
    <Layout>
      <div className={`fade-in ${lang === 'km' ? 'lang-km' : ''}`}>
        <div className="page-header">
          <h1 className="page-title">🧺 {t('orders')}</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ {t('createOrder')}</button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input className="form-input" style={{ maxWidth: 260 }} placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-input" style={{ maxWidth: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">{t('all')} Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{t(s)}</option>)}
          </select>
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: 'auto' }} /></div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('orderNumber')}</th>
                  <th>{t('customer')}</th>
                  <th>{t('status')}</th>
                  <th>{t('priority')}</th>
                  <th>{t('weight')}</th>
                  <th>{t('totalCost')}</th>
                  <th>{t('deliveryDate')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94A3B8', padding: 40 }}>{t('noData')}</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: '#1B6CA8' }}>{o.order_number}</td>
                    <td>{o.customer_name || '-'}</td>
                    <td><span className={`badge badge-${o.status}`}>{t(o.status)}</span></td>
                    <td><span className={`badge badge-${o.priority}`}>{t(o.priority)}</span></td>
                    <td>{o.total_weight ? `${o.total_weight} kg` : '-'}</td>
                    <td style={{ fontWeight: 600 }}>${parseFloat(o.total_cost || 0).toFixed(2)}</td>
                    <td style={{ fontSize: 13, color: '#64748B' }}>{o.delivery_date ? new Date(o.delivery_date).toLocaleDateString() : '-'}</td>
                    <td>
                      <select
                        className="form-input"
                        style={{ fontSize: 12, padding: '4px 8px', width: 'auto' }}
                        value={o.status}
                        onChange={e => updateStatus(o.id, e.target.value)}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{t(s)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Order Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700 }}>📋 {t('createOrder')}</h2>
              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">{t('customer')}</label>
                    <select className="form-input" value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} required>
                      <option value="">-- Select --</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">{t('priority')}</label>
                    <select className="form-input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{t(p)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">{t('weight')}</label>
                    <input className="form-input" type="number" step="0.1" value={form.total_weight} onChange={e => setForm({...form, total_weight: e.target.value})} required />
                  </div>
                  <div>
                    <label className="form-label">{t('pickupDate')}</label>
                    <input className="form-input" type="datetime-local" value={form.pickup_date} onChange={e => setForm({...form, pickup_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">{t('deliveryDate')}</label>
                    <input className="form-input" type="datetime-local" value={form.delivery_date} onChange={e => setForm({...form, delivery_date: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">{t('specialInstructions')}</label>
                    <textarea className="form-input" rows={3} value={form.special_instructions} onChange={e => setForm({...form, special_instructions: e.target.value})} />
                  </div>
                </div>

                {/* Items */}
                <div style={{ margin: '16px 0' }}>
                  <label className="form-label">Items</label>
                  {form.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input className="form-input" placeholder="Item name" value={item.item_name} onChange={e => { const items=[...form.items]; items[i].item_name=e.target.value; setForm({...form,items}); }} />
                      <input className="form-input" type="number" style={{ maxWidth: 80 }} placeholder="Qty" value={item.quantity} onChange={e => { const items=[...form.items]; items[i].quantity=e.target.value; setForm({...form,items}); }} />
                      <select className="form-input" style={{ maxWidth: 130 }} value={item.wash_type} onChange={e => { const items=[...form.items]; items[i].wash_type=e.target.value; setForm({...form,items}); }}>
                        {['standard','delicate','heavy','sanitize','dry_clean'].map(w => <option key={w} value={w}>{t(w)}</option>)}
                      </select>
                    </div>
                  ))}
                  <button type="button" className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setForm({...form, items:[...form.items, {item_name:'',quantity:1,wash_type:'standard'}]})}>
                    + Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
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
