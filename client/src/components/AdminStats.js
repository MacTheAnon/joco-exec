import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

const AdminStats = ({ bookings }) => {
  
  // 1. DATA PROCESSING: Group revenue by date
  const chartData = useMemo(() => {
    const groups = bookings.reduce((acc, b) => {
      const date = b.date; // e.g., "2026-01-15"
      if (!acc[date]) acc[date] = { date, revenue: 0, count: 0 };
      acc[date].revenue += (b.amount / 100);
      acc[date].count += 1;
      return acc;
    }, {});

    return Object.values(groups).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [bookings]);

  // 2. SUMMARY TOTALS
  const totalRevenue = chartData.reduce((sum, day) => sum + day.revenue, 0);
  const totalBookings = bookings.length;
  const unclaimedJobs = bookings.filter(b => !b.driver).length;

  return (
    <div style={statsContainer}>
      
      {/* KEY METRIC CARDS */}
      <div style={gridStyle}>
        <div style={cardStyle}>
          <p style={labelStyle}>Total Revenue</p>
          <h2 style={valueStyle}>${totalRevenue.toFixed(2)}</h2>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>Total Trips</p>
          <h2 style={valueStyle}>{totalBookings}</h2>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>Unclaimed Jobs</p>
          <h2 style={{...valueStyle, color: unclaimedJobs > 0 ? '#ff4444' : '#C5A059'}}>
            {unclaimedJobs}
          </h2>
        </div>
      </div>

      {/* REVENUE CHART */}
      <div style={chartWrapper}>
        <h3 style={chartTitle}>Revenue Trends</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: '#111', border: '1px solid #C5A059', color: '#fff' }}
                itemStyle={{ color: '#C5A059' }}
              />
              <Bar dataKey="revenue" fill="#C5A059" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const statsContainer = { marginTop: '30px' };

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr 1fr',
  gap: '15px',
  marginBottom: '30px'
};

const cardStyle = {
  background: '#0f0f0f',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #222',
  textAlign: 'center'
};

const labelStyle = { color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' };
const valueStyle = { color: '#C5A059', margin: 0, fontSize: '1.8rem' };

const chartWrapper = {
  background: '#0f0f0f',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #222'
};

const chartTitle = { color: '#fff', fontSize: '1rem', marginBottom: '20px', fontWeight: '400' };

export default AdminStats;