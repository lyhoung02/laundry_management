import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { useLang } from '../lib/langContext';
import Layout from '../components/Layout';
import api from '../lib/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STATUS_COLORS = {
  pending: '#F59E0B', washing: '#3B82F6', drying: '#0EA5E9',
  folding: '#8B5CF6', quality_check: '#EAB308', ready: '#10B981',
  delivered: '#059669', cancelled: '#EF4444', picked_up: '#06B6D4'
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      api.get('/dashboard/stats').then(r => setData(r.data)).finally(() => setFetching(false));
    }
  }, [user]);

  if (loading || !user) return null;

  const statCards = data ? [
    { label: t('totalOrders'), value: data.orderStats.total_orders, icon: '🧺', color: '#0F4C75', sub: `+${data.orderStats.today_orders} ${t('todayOrders')}` },
    { label: t('pendingOrders'), value: data.orderStats.pending, icon: '⏳', color: '#F59E0B' },
    { label: t('inProgress'), value: data.orderStats.in_progress, icon: '⚙️', color: '#3B82F6' },
    { label: t('delivered'), value: data.orderStats.delivered, icon: '✅', color: '#10B981' },
    { label: t('todayRevenue'), value: `$${parseFloat(data.orderStats.today_revenue || 0).toFixed(2)}`, icon: '💰', color: '#F77F00' },
    { label: t('totalCustomers'), value: data.customerStats.total, icon: '👥', color: '#8B5CF6' },
    { label: t('lowStock'), value: data.inventoryStats.low_stock, icon: '⚠️', color: '#EF4444' },
    { label: t('totalRevenue'), value: `$${parseFloat(data.orderStats.total_revenue || 0).toFixed(2)}`, icon: '📊', color: '#06B6D4' },
  ] : [];

  const pieData = data?.ordersByStatus?.map(s => ({ name: s.status, value: parseInt(s.count), color: STATUS_COLORS[s.status] || '#94A3B8' })) || [];

  return (
    <Layout>
      <div className={`fade-in ${lang === 'km' ? 'lang-km' : ''}`}>
        <div className="page-header">
          <div>
            <h1 className="page-title">👋 {t('dashboard')}</h1>
            <p style={{ color: '#64748B', margin: 0, fontSize: 14 }}>{new Date().toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Stat grid */}
        {fetching ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
              {statCards.map((card, i) => (
                <div key={i} className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginBottom: 8 }}>{card.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
                      {card.sub && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{card.sub}</div>}
                    </div>
                    <span style={{ fontSize: 28 }}>{card.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
              {/* Revenue chart */}
              <div className="stat-card">
                <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>{t('weeklyRevenue')}</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data?.weeklyRevenue || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={v => v?.slice(5)} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[6,6,0,0]} />
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1B6CA8" />
                        <stop offset="100%" stopColor="#00B4D8" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart */}
              <div className="stat-card">
                <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>{t('orders')} by Status</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {pieData.slice(0, 4).map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                      <span style={{ color: '#64748B' }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent orders */}
            <div className="stat-card">
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>{t('recentOrders')}</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('orderNumber')}</th>
                    <th>{t('customer')}</th>
                    <th>{t('status')}</th>
                    <th>{t('priority')}</th>
                    <th>{t('totalCost')}</th>
                    <th>{t('createdAt')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentOrders?.map(order => (
                    <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => router.push('/orders')}>
                      <td style={{ fontWeight: 600, color: '#1B6CA8' }}>{order.order_number}</td>
                      <td>{order.customer_name || '-'}</td>
                      <td><span className={`badge badge-${order.status}`}>{t(order.status)}</span></td>
                      <td><span className={`badge badge-${order.priority}`}>{t(order.priority)}</span></td>
                      <td style={{ fontWeight: 600 }}>${parseFloat(order.total_cost || 0).toFixed(2)}</td>
                      <td style={{ color: '#94A3B8', fontSize: 13 }}>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
