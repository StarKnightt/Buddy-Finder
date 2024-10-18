// src/components/LanguageChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function LanguageChart({ languages }) {
  if (!languages || Object.keys(languages).length === 0) {
    return <div className="language-chart">No language data available</div>;
  }

  const data = Object.entries(languages).map(([name, value]) => ({ name, value }));

  return (
    <div className="language-chart">
      <h3>Top Languages</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LanguageChart;