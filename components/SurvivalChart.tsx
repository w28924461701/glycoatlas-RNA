import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { SurvivalAnalysisResult } from '../types';
import { COLORS } from '../constants';

interface SurvivalChartProps {
  analysis: SurvivalAnalysisResult;
}

const SurvivalChart: React.FC<SurvivalChartProps> = ({ analysis }) => {
  // Filter data into two series for the lines
  const highExpData = analysis.data.filter(d => d.group === 'High Expression').sort((a, b) => a.time - b.time);
  const lowExpData = analysis.data.filter(d => d.group === 'Low Expression').sort((a, b) => a.time - b.time);

  // We need to merge them based on time to plotting multiple lines on one X-axis easier, 
  // or we can just pass the raw data if we structure it right. 
  // For Recharts multiple lines, it's best to have an array of objects like { time, high: prob1, low: prob2 }
  // Since timepoints might differ, we'll do a simple mapping for the demo visualization or use Scatter, 
  // but let's try to normalize for the LineChart.
  
  // A simplified approach for Recharts stepped lines:
  // Create a unified time axis
  const timePoints = Array.from(new Set(analysis.data.map((d) => d.time))).sort((a: number, b: number) => a - b);
  
  const chartData = timePoints.map(t => {
    const highPoint = highExpData.find(d => d.time === t);
    const lowPoint = lowExpData.find(d => d.time === t);
    // Carry forward previous value if point doesn't exist at exactly this time (step logic)
    // For this demo, the AI generates aligned points usually, so we'll just take values.
    return {
      time: t,
      High: highPoint?.survivalProb,
      Low: lowPoint?.survivalProb
    };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-6">
        <div>
           <h3 className="text-lg font-semibold text-slate-800">Kaplan-Meier Survival Analysis</h3>
           <p className="text-sm text-slate-500">Gene: <span className="font-bold text-slate-700">{analysis.geneSymbol}</span> in {analysis.tumorType}</p>
        </div>
        <div className="text-right text-sm">
            <div className="font-medium text-slate-700">Log-Rank P: <span className={analysis.pValLogRank < 0.05 ? "text-red-600 font-bold" : "text-slate-600"}>{analysis.pValLogRank.toExponential(3)}</span></div>
            <div className="font-medium text-slate-700">HR: {analysis.hazardRatio.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              type="number" 
              label={{ value: 'Time (Months)', position: 'insideBottom', offset: -10, fill: '#64748b' }} 
              domain={[0, 'dataMax']}
              tick={{fill: '#64748b'}}
            />
            <YAxis 
              label={{ value: 'Survival Probability', angle: -90, position: 'insideLeft', fill: '#64748b' }} 
              domain={[0, 1]} 
              tick={{fill: '#64748b'}}
            />
            <Tooltip 
              formatter={(value: number) => value ? value.toFixed(3) : '-'}
              labelFormatter={(label) => `Time: ${label} months`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line 
              type="stepAfter" 
              dataKey="High" 
              stroke={COLORS.danger} 
              strokeWidth={2} 
              name="High Expression" 
              dot={false}
              connectNulls
            />
            <Line 
              type="stepAfter" 
              dataKey="Low" 
              stroke={COLORS.success} 
              strokeWidth={2} 
              name="Low Expression" 
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
        <strong>Interpretation:</strong> {analysis.interpretation}
      </div>
    </div>
  );
};

export default SurvivalChart;