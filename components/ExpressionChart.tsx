import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { GlycoRnaExpression } from '../types';
import { COLORS } from '../constants';

interface ExpressionChartProps {
  data: GlycoRnaExpression[];
}

const ExpressionChart: React.FC<ExpressionChartProps> = ({ data }) => {
  // Transform data for the chart: We want to show Tumor vs Normal side-by-side
  const chartData = data.slice(0, 10).map(item => ({
    name: item.symbol,
    Tumor: item.tumorExpression,
    Normal: item.normalExpression,
    pValue: item.pValue,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px]">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Differential Expression (Log2 CPM)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{fill: '#64748b'}} />
          <YAxis label={{ value: 'Expression (Log2 CPM)', angle: -90, position: 'insideLeft', fill: '#64748b' }} tick={{fill: '#64748b'}} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{fill: '#f1f5f9'}}
          />
          <Legend />
          <Bar dataKey="Normal" fill={COLORS.normal} radius={[4, 4, 0, 0]} name="Normal Tissue" />
          <Bar dataKey="Tumor" fill={COLORS.tumor} radius={[4, 4, 0, 0]} name="Tumor Tissue" />
          <ReferenceLine y={0} stroke="#000" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpressionChart;