import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function MetricsOverview({ user }) {
  const data = [
    { name: 'Followers', value: user.followers },
    { name: 'Following', value: user.following },
    { name: 'Public Repos', value: user.public_repos },
  ];

  return (
    <div className="metrics">
      <h3>User Metrics</h3>
      <BarChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </div>
  );
}

export default MetricsOverview;
