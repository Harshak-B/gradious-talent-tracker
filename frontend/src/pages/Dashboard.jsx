import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../api/api';
import { LoadingState, ErrorState } from '../components/States';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#2563eb', '#7c3aed', '#16a34a', '#d97706', '#dc2626'];

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="stat-label">{label}</span>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>
      <div className="stat-value" style={{ color: color || 'var(--gray-900)' }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getDashboardSummary();
      setData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  if (loading) return <LoadingState message="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={fetchSummary} />;
  if (!data) return null;

  const { counts, placementByDept, recentDrives, topPackages, placementRate } = data;

  const deptChartData = placementByDept.map((d) => ({
    dept: d._id,
    Total: d.total,
    Placed: d.placed,
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of placement activities at Gradious Training</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stat-grid">
        <StatCard label="Total Students" value={counts.totalStudents} icon="🎓" />
        <StatCard label="Placed" value={counts.placedStudents} sub={`${placementRate}% placement rate`} icon="✅" color="var(--success)" />
        <StatCard label="In Progress" value={counts.inProgressStudents} icon="🔄" color="var(--warning)" />
        <StatCard label="Not Placed" value={counts.notPlacedStudents} icon="⏳" color="var(--gray-500)" />
        <StatCard label="Companies" value={counts.totalCompanies} icon="🏢" />
        <StatCard label="Total Drives" value={counts.totalDrives} sub={`${counts.upcomingDrives} upcoming`} icon="📅" />
        <StatCard label="Interviews" value={counts.totalInterviews} icon="🗣️" />
        <StatCard label="Selected" value={counts.selectedOutcomes} icon="🏆" color="var(--success)" />
      </div>

      {/* Charts & Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Dept Chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">Placement by Department</span></div>
          <div className="card-body">
            {deptChartData.length === 0 ? (
              <p className="text-muted">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={deptChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="Total" fill="#dbeafe" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Placed" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Outcome Breakdown */}
        <div className="card">
          <div className="card-header"><span className="card-title">Outcome Breakdown</span></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Selected', value: counts.selectedOutcomes, color: 'var(--success)', bg: 'var(--success-light)' },
              { label: 'Pending', value: counts.pendingOutcomes, color: 'var(--warning)', bg: 'var(--warning-light)' },
              { label: 'Rejected', value: counts.rejectedOutcomes, color: 'var(--danger)', bg: 'var(--danger-light)' },
            ].map(({ label, value, color, bg }) => {
              const total = counts.selectedOutcomes + counts.pendingOutcomes + counts.rejectedOutcomes || 1;
              const pct = ((value / total) * 100).toFixed(0);
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color }}>{label}</span>
                    <span style={{ fontSize: '0.85rem', color }}>{value} ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--gray-100)' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: color, transition: 'width .5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Recent Drives */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Drives</span>
            <Link to="/drives" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Company</th><th>Role</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentDrives.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 24 }}>No drives yet</td></tr>
                ) : recentDrives.map((d) => (
                  <tr key={d._id}>
                    <td><strong>{d.company?.name ?? '—'}</strong></td>
                    <td className="text-muted">{d.role}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td className="text-muted">{new Date(d.driveDate).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Packages */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Packages 🏆</span>
            <Link to="/outcomes" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Student</th><th>Company</th><th>Package</th></tr>
              </thead>
              <tbody>
                {topPackages.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 24 }}>No offers yet</td></tr>
                ) : topPackages.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <strong>{o.student?.name ?? '—'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{o.student?.department}</div>
                    </td>
                    <td className="text-muted">{o.drive?.company?.name ?? '—'}</td>
                    <td><span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{o.offeredPackage} LPA</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Upcoming: 'badge-primary',
    Ongoing: 'badge-warning',
    Completed: 'badge-success',
    Cancelled: 'badge-danger',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}
