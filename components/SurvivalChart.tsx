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
import { SurvivalAnalysis } from '../types';
import { COLORS } from '../constants';

interface SurvivalChartProps {
  analysis: SurvivalAnalysis;
  geneSymbol: string;
  tumorType: string;
}

const SurvivalChart: React.FC<SurvivalChartProps> = ({ analysis, geneSymbol, tumorType }) => {
  // Filter data into two series for the lines
  const highExpData = analysis.data.filter(d => d.group === 'High Expression').sort((a, b) => a.time - b.time);
  const lowExpData = analysis.data.filter(d => d.group === 'Low Expression').sort((a, b) => a.time - b.time);

  const timePoints = Array.from(new Set(analysis.data.map((d) => d.time))).sort((a: number, b: number) => a - b);
  
  const chartData = timePoints.map(t => {
    const highPoint = highExpData.find(d => d.time === t);
    const lowPoint = lowExpData.find(d => d.time === t);
    return {
      time: t,
      High: highPoint?.survivalProb,
      Low: lowPoint?.survivalProb
    };
  });

  const handleDownloadSamples = () => {
    if (!analysis.samples || analysis.samples.length === 0) return;
    
    const headers = ["Sample_ID", "Tumor_Type", "Gene", "Expression_Level", "Group", "Survival_Months", "Vital_Status"];
    const rows = analysis.samples.map(s => [
      s.sampleId,
      tumorType,
      geneSymbol,
      s.expressionLevel.toFixed(4),
      s.group,
      s.survivalMonths.toFixed(1),
      s.status
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${tumorType}_${geneSymbol}_Clinical_Samples.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Kaplan-Meier Survival Analysis</h3>
            <p className="text-sm text-slate-500">Gene: <span className="font-bold text-slate-700">{geneSymbol}</span> in {tumorType}</p>
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

      {/* Clinical Sample Data Table */}
      {analysis.samples && analysis.samples.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800">Individual Sample Data (n={analysis.samples.length})</h3>
            <button 
              onClick={handleDownloadSamples}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Clinical CSV
            </button>
          </div>
          <div className="overflow-x-auto max-h-[300px]">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sample ID</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Expression</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Survival (Months)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {analysis.samples.map((sample) => (
                  <tr key={sample.sampleId} className="hover:bg-slate-50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-mono text-slate-700">{sample.sampleId}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-slate-600">{sample.expressionLevel.toFixed(2)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sample.group === 'High' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {sample.group}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-slate-600">{sample.survivalMonths.toFixed(1)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sample.status === 'LIVING' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                        {sample.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurvivalChart;