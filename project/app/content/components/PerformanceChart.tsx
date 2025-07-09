import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceDataItem {
  date: string;
  views: number;
  likes?: number;
  comments?: number;
}

interface PerformanceChartProps {
  performanceData: PerformanceDataItem[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ performanceData }) => (
  <div className="bg-white rounded shadow p-4 mb-6">
    <div className="font-semibold mb-2">Performance (Views, Likes, Comments Over Time)</div>
    {performanceData && performanceData.length > 0 ? (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={performanceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="views" stroke="#2563eb" name="Views" />
          <Line type="monotone" dataKey="likes" stroke="#22c55e" name="Likes" />
          <Line type="monotone" dataKey="comments" stroke="#a21caf" name="Comments" />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-40 flex items-center justify-center text-gray-400">
        Chart Placeholder
      </div>
    )}
  </div>
);

export default PerformanceChart; 