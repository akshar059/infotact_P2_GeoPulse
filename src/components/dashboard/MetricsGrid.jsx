import React from 'react';

const MetricsGrid = () => {
  const placeholderMetrics = [
    { id: 1, title: 'Total Footfall Pings', value: '--', trend: 'Awaiting spatial data' },
    { id: 2, title: 'Avg Dwell Time', value: '-- min', trend: 'Awaiting spatial data' },
    { id: 3, title: 'Active Store Catchments', value: '--', trend: '500m radius configured' },
    { id: 4, title: 'Visitor Overlap Rate', value: '--%', trend: 'Cannibalization metric' }
  ];

  return (
    <div className="metrics-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', padding: '16px' }}>
      {placeholderMetrics.map((metric) => (
        <div key={metric.id} className="metric-card" style={{ padding: '16px', borderRadius: '8px', border: '1px solid #2d3748', backgroundColor: '#1a202c', color: '#fff' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#a0aec0' }}>{metric.title}</h4>
          <p style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold' }}>{metric.value}</p>
          <span style={{ fontSize: '12px', color: '#718096' }}>{metric.trend}</span>
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid;
