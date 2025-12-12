import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ScatterChart, Scatter, Cell, ReferenceLine
} from 'recharts';
import { ComprehensiveAnalysisResult } from '../types';
import { COLORS } from '../constants';

// Reusing colors from constants but importing here to be safe
const THEME_COLORS = {
  primary: '#0f172a',
  success: '#10b981',
  danger: '#ef4444',
  bar: '#6366f1', // Indigo
  immune: '#ec4899', // Pink
};

interface DashboardProps {
  analysis: ComprehensiveAnalysisResult;
}

type TabType = 'survival' | 'clinical' | 'enrichment' | 'immune' | 'drugs';

const GeneAnalysisDashboard: React.FC<DashboardProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<TabType>('survival');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'survival', label: 'Survival', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg> },
    { id: 'clinical', label: 'Clinical', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: 'enrichment', label: 'GO/KEGG', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> },
    { id: 'immune', label: 'Immune', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    { id: 'drugs', label: 'Drugs', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> },
  ];

  // --- Render Functions ---

  const renderSurvival = () => {
    const { survival } = analysis;
    
    // Robust filtering: check for "High" or "Low" string inclusion to handle "High Expression" vs "High"
    const highExpData = survival.data.filter(d => d.group.includes('High')).sort((a, b) => a.time - b.time);
    const lowExpData = survival.data.filter(d => d.group.includes('Low')).sort((a, b) => a.time - b.time);
    
    // Create unique time points from all data
    const allTimePoints = new Set([...highExpData.map(d => d.time), ...lowExpData.map(d => d.time)]);
    const timePoints = Array.from(allTimePoints).sort((a, b) => a - b);
    
    const chartData = timePoints.map(t => {
      // Find the closest previous point if exact point doesn't exist (step function logic) or use exact match
      // For simplified KM plotting here, we just take the exact point match
      const highPoint = highExpData.find(d => d.time === t);
      const lowPoint = lowExpData.find(d => d.time === t);
      return {
        time: t,
        High: highPoint?.survivalProb,
        Low: lowPoint?.survivalProb
      };
    });

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-start">
          <div>
             <h3 className="text-lg font-bold text-slate-800">Kaplan-Meier Estimates</h3>
             <p className="text-sm text-slate-500">Log-Rank P: <span className="font-mono font-bold text-slate-900">{survival.pValLogRank.toExponential(3)}</span></p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 max-w-md">
            {survival.interpretation}
          </div>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" label={{ value: 'Time (Months)', position: 'insideBottom', offset: -10 }} />
              <YAxis label={{ value: 'Probability', angle: -90, position: 'insideLeft' }} domain={[0, 1]} />
              <Tooltip formatter={(val: number) => val?.toFixed(3)} />
              <Legend verticalAlign="top" />
              <Line type="stepAfter" dataKey="High" stroke={THEME_COLORS.danger} name="High Exp" strokeWidth={2} dot={false} connectNulls />
              <Line type="stepAfter" dataKey="Low" stroke={THEME_COLORS.success} name="Low Exp" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Samples Table */}
        <div className="overflow-hidden border border-slate-200 rounded-lg">
           <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-sm">Patient Samples (Preview)</div>
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-white">
                 <tr>
                   <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Sample ID</th>
                   <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Group</th>
                   <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Time (Mo)</th>
                   <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-200">
                 {survival.samples.slice(0, 5).map(s => (
                   <tr key={s.sampleId}>
                     <td className="px-4 py-2 text-xs font-mono">{s.sampleId}</td>
                     <td className="px-4 py-2 text-center text-xs">
                       <span className={`px-2 py-0.5 rounded-full ${s.group.includes('High') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{s.group}</span>
                     </td>
                     <td className="px-4 py-2 text-right text-xs">{s.survivalMonths.toFixed(1)}</td>
                     <td className="px-4 py-2 text-center text-xs">{s.status}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
             <div className="px-4 py-2 text-xs text-center text-slate-400 bg-slate-50">...and {survival.samples.length - 5} more rows</div>
           </div>
        </div>
      </div>
    );
  };

  const renderClinical = () => {
    // Flatten data for chart visualization of Stage
    const stageData = analysis.clinical.find(c => c.featureName.includes('Stage'))?.groups || [];

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4">Expression by Pathological Stage</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis label={{ value: 'Avg Expression', angle: -90, position: 'insideLeft' }} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="averageExpression" fill={THEME_COLORS.bar} radius={[4, 4, 0, 0]} name="Log2 CPM" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-slate-500 mt-2">P-Value: {analysis.clinical.find(c => c.featureName.includes('Stage'))?.pValue.toExponential(2)}</p>
          </div>
          
          <div className="space-y-4">
             {analysis.clinical.map((feat, idx) => (
               <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                 <div className="flex justify-between items-center mb-2">
                   <h5 className="font-semibold text-slate-700">{feat.featureName}</h5>
                   <span className={`text-xs px-2 py-1 rounded ${feat.pValue < 0.05 ? 'bg-red-100 text-red-700 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                     P = {feat.pValue.toExponential(3)}
                   </span>
                 </div>
                 <div className="space-y-2">
                   {feat.groups.map(g => (
                     <div key={g.name} className="flex justify-between text-sm">
                       <span className="text-slate-600">{g.name} (n={g.count})</span>
                       <span className="font-mono">{g.averageExpression.toFixed(2)}</span>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  };

  const renderEnrichment = () => {
    // Sort by count or significance
    const data = [...analysis.enrichment].sort((a, b) => a.pValue - b.pValue);

    return (
      <div className="animate-fade-in">
        <h3 className="text-lg font-bold text-slate-800 mb-4">GO Terms & KEGG Pathways</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="term" width={150} tick={{fontSize: 11}} />
                <Tooltip />
                <Bar dataKey="count" fill={THEME_COLORS.bar} radius={[0, 4, 4, 0]} barSize={20}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.category === 'KEGG' ? THEME_COLORS.danger : THEME_COLORS.bar} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Term</th>
                  <th className="px-3 py-2 text-right">Count</th>
                  <th className="px-3 py-2 text-right">P-Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map(item => (
                   <tr key={item.id}>
                     <td className="px-3 py-2 font-mono text-xs text-slate-500">{item.id}</td>
                     <td className="px-3 py-2 text-slate-700">{item.term}</td>
                     <td className="px-3 py-2 text-right">{item.count}</td>
                     <td className="px-3 py-2 text-right font-mono text-xs">{item.pValue.toExponential(2)}</td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderImmune = () => {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-slate-800">Immune Infiltration Correlation (Spearman)</h3>
           <p className="text-sm text-slate-500">Correlation with {analysis.geneSymbol} expression</p>
        </div>
        
        <div className="h-[350px] max-w-3xl mx-auto">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={analysis.immune} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[-1, 1]} tickCount={7} />
                <YAxis type="category" dataKey="cellType" width={140} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border border-slate-200 shadow-lg rounded text-sm">
                          <p className="font-bold">{data.cellType}</p>
                          <p>Rho: {data.correlation.toFixed(3)}</p>
                          <p>P: {data.pValue.toExponential(3)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={0} stroke="#94a3b8" />
                <Bar dataKey="correlation" barSize={20} radius={[4, 4, 4, 4]}>
                  {analysis.immune.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.correlation > 0 ? THEME_COLORS.danger : THEME_COLORS.success} />
                  ))}
                </Bar>
             </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-sm text-slate-500 mt-4">
          <span className="text-red-500 font-bold">Red</span> indicates positive correlation, <span className="text-green-500 font-bold">Green</span> indicates negative.
        </p>
      </div>
    );
  };

  const renderDrugs = () => {
    return (
      <div className="animate-fade-in space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Drug Sensitivity Analysis (GDSC/CTRP)</h3>
        <p className="text-sm text-slate-600 mb-4">Drugs where sensitivity (IC50) correlates significantly with {analysis.geneSymbol} expression.</p>
        
        <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Drug Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mechanism / Target</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Correlation (R)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">P-Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {analysis.drugs.map((drug) => (
                <tr key={drug.drugName} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-indigo-600">{drug.drugName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{drug.mechanism}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono">
                    <span className={drug.correlation < 0 ? 'text-green-600' : 'text-red-600'}>
                      {drug.correlation.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">{drug.pValue.toExponential(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
           <strong>Note:</strong> Negative correlation often implies that higher gene expression is associated with lower IC50 (higher drug sensitivity).
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{analysis.geneSymbol} Comprehensive Analysis</h2>
          <span className="text-sm text-slate-500">{analysis.tumorType}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="w-5 h-5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-6 flex-grow">
        {activeTab === 'survival' && renderSurvival()}
        {activeTab === 'clinical' && renderClinical()}
        {activeTab === 'enrichment' && renderEnrichment()}
        {activeTab === 'immune' && renderImmune()}
        {activeTab === 'drugs' && renderDrugs()}
      </div>
    </div>
  );
};

export default GeneAnalysisDashboard;
