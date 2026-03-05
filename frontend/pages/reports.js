import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { useLang } from '../lib/langContext';
import Layout from '../components/Layout';
import api from '../lib/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Reports() {
  const { user, loading } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate()-30); return d.toISOString().split('T')[0]; });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => { if (user) api.get('/reports/analytics', { params: { from, to } }).then(r => setData(r.data)); }, [user, from, to]);

  if (loading || !user) return null;

  const COLORS = ['#1B6CA8','#00B4D8','#8B5CF6','#F59E0B','#10B981'];

  return (
    <Layout>
      <div className={`fade-in ${lang === 'km' ? 'lang-km' : ''}`}>
        <div className="page-header">
          <h1 className="page-title">📈 {t('reports')}</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input className="form-input" type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 150 }} />
            <span style={{ color: '#94A3B8' }}>→</span>
            <input className="form-input" type="date" value={to} onChange={e => setTo(e.target.value)} style={{ width: 150 }} />
          </div>
        </div>

        {/* KPIs */}
        {data?.kpis && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: t('avgTurnaround'), value: data.kpis.avg_turnaround_hours ? `${parseFloat(data.kpis.avg_turnaround_hours).toFixed(1)}h` : 'N/A', icon: '⏱️', color: '#1B6CA8' },
              { label: t('avgCostPerKg'), value: data.kpis.avg_cost_per_pound ? `$${parseFloat(data.kpis.avg_cost_per_pound).toFixed(2)}` : 'N/A', icon: '💵', color: '#F77F00' },
              { label: t('completionRate'), value: data.kpis.completion_rate ? `${parseFloat(data.kpis.completion_rate).toFixed(1)}%` : 'N/A', icon: '✅', color: '#10B981' },
              { label: t('totalWeight'), value: data.kpis.total_weight_processed ? `${parseFloat(data.kpis.total_weight_processed).toFixed(0)} kg` : '0 kg', icon: '⚖️', color: '#8B5CF6' },
            ].map((kpi, i) => (
              <div key={i} className="stat-card">
                <span style={{ fontSize: 24 }}>{kpi.icon}</span>
                <div style={{ fontSize: 26, fontWeight: 700, color: kpi.color, marginTop: 8 }}>{kpi.value}</div>
                <div style={{ fontSize: 13, color: '#64748B' }}>{kpi.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="stat-card">
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data?.dailyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`$${parseFloat(v).toFixed(2)}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#1B6CA8" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="stat-card">
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>{t('topCustomers')}</h3>
            {data?.topCustomers?.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{c.orders} orders</div>
                </div>
                <div style={{ fontWeight: 700, color: '#10B981' }}>${parseFloat(c.revenue).toFixed(0)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="stat-card">
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Daily Orders</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.dailyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#00B4D8" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="stat-card">
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Wash Types</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data?.washTypes || []} dataKey="count" nameKey="wash_type" cx="50%" cy="50%" outerRadius={80} label={e => e.wash_type}>
                  {(data?.washTypes || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
