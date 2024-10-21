// components/DataStats.tsx
import React from 'react';
import { OverviewData } from '../types/types';

interface DataStatsProps {
  data: OverviewData;
}

const DataStats: React.FC<DataStatsProps> = ({ data }) => {
  const stats = [
    { label: 'Users', value: data.userCount },
    { label: 'Creative Activities', value: data.creativeActivityCount },
    { label: 'Traditions', value: data.traditionCount },
    { label: 'Public Policies', value: data.publicPolicyCount },
    { label: 'Ethnic Groups', value: data.ethnicGroupCount },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">{stat.label}</h3>
          <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DataStats;