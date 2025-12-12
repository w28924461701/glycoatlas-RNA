import React from 'react';
import { GlycoRnaExpression } from '../types';

interface DataTableProps {
  data: GlycoRnaExpression[];
  onAnalyze: (symbol: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, onAnalyze }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Symbol</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Localization</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Tumor (CPM)</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Normal (CPM)</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Log2FC</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider pl-8">Evidence</th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {data.map((row) => (
            <tr key={row.geneId} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-slate-900">{row.symbol}</div>
                <div className="text-xs text-slate-500">{row.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                   {row.localization}
                 </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-700">{row.tumorExpression.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-700">{row.normalExpression.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.foldChange > 0 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                  {row.foldChange > 0 ? '+' : ''}{row.foldChange.toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 pl-8 max-w-[200px] truncate" title={row.evidence}>
                {row.evidence}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button 
                  onClick={() => onAnalyze(row.symbol)}
                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors border border-indigo-200"
                >
                  Survival
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;