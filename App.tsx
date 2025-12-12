import React, { useState } from 'react';
import { TUMOR_TYPES, RNA_CATEGORIES } from './constants';
import { TumorType, RnaCategory, AnalysisState, DetailedAnalysisState } from './types';
import { fetchGlycoExpressionData, fetchComprehensiveAnalysis } from './services/geminiService';
import ExpressionChart from './components/ExpressionChart';
import GeneAnalysisDashboard from './components/GeneAnalysisDashboard';
import DataTable from './components/DataTable';

// Icons
const DnaIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

function App() {
  const [selectedTumor, setSelectedTumor] = useState<TumorType>(TUMOR_TYPES[0]);
  const [selectedCategory, setSelectedCategory] = useState<RnaCategory>(RNA_CATEGORIES[0]);
  
  const [expressionState, setExpressionState] = useState<AnalysisState>({
    loading: false,
    data: null,
    error: null,
  });

  const [detailedState, setDetailedState] = useState<DetailedAnalysisState>({
    loading: false,
    data: null,
    error: null,
  });

  const handleSearch = async () => {
    setExpressionState({ loading: true, data: null, error: null });
    setDetailedState({ loading: false, data: null, error: null }); 
    
    try {
      const data = await fetchGlycoExpressionData(selectedTumor.code, selectedCategory);
      setExpressionState({ loading: false, data, error: null });
    } catch (err) {
      setExpressionState({ loading: false, data: null, error: "Failed to fetch data. Please check your API key." });
    }
  };

  const handleDeepAnalyze = async (geneSymbol: string) => {
    setDetailedState({ loading: true, data: null, error: null });
    try {
      const data = await fetchComprehensiveAnalysis(geneSymbol, selectedTumor.code);
      setDetailedState({ loading: false, data, error: null });
      setTimeout(() => {
        const element = document.getElementById('deep-analysis-section');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setDetailedState({ loading: false, data: null, error: "Failed to perform comprehensive analysis." });
    }
  };

  const handleDownload = () => {
    if (!expressionState.data) return;

    // Define CSV headers
    const headers = [
      "GeneID", "Symbol", "Category", 
      "Tumor_Expression_Log2CPM", "Normal_Expression_Log2CPM", 
      "Log2FC", "P_Value", "FDR", 
      "Evidence", "Localization"
    ];

    // Map data to CSV rows
    const rows = expressionState.data.map(item => [
      item.geneId,
      item.symbol,
      item.category,
      item.tumorExpression.toFixed(4),
      item.normalExpression.toFixed(4),
      item.foldChange.toFixed(4),
      item.pValue.toExponential(4),
      item.fdr.toExponential(4),
      `"${item.evidence.replace(/"/g, '""')}"`, // Escape quotes for CSV
      `"${item.localization.replace(/"/g, '""')}"`
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `TCGA_${selectedTumor.code}_${selectedCategory}_GlycoRNA_Data.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md">
                <DnaIcon />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                GlycoAtlas TCGA
              </span>
            </div>
            <nav className="flex space-x-6">
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Home</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Documentation</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">About GlycoRNA</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Intro Section */}
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6">
            Glycosylated RNA Multi-Omics
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            A comprehensive platform integrating differential expression, clinical survival, 
            pathological correlation, immune infiltration, and drug sensitivity analysis for
            <span className="font-semibold text-indigo-600 mx-1">tRNA, YRNA, snRNA, and rRNA</span>.
          </p>
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 text-left text-sm text-slate-600 mx-auto max-w-3xl shadow-sm">
            <div className="flex gap-4">
               <div className="flex-shrink-0 pt-1">
                 <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
               <div>
                 <p className="font-semibold text-slate-800 mb-2 text-base">Analytical Modules:</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                   <li className="list-disc ml-4">Diff. Expression (Tumor vs Normal)</li>
                   <li className="list-disc ml-4">Clinical Pathological Features</li>
                   <li className="list-disc ml-4">Survival Analysis (Kaplan-Meier)</li>
                   <li className="list-disc ml-4">Immune Infiltration (CIBERSORT)</li>
                   <li className="list-disc ml-4">Functional Enrichment (GO/KEGG)</li>
                   <li className="list-disc ml-4">Drug Sensitivity Targets</li>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Filter / Search Bar */}
        <section className="bg-white rounded-2xl shadow-lg shadow-indigo-100 border border-slate-200 p-8 transform transition-all hover:shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tumor Type (TCGA)</label>
              <select 
                className="w-full rounded-lg border-slate-300 border px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-slate-50"
                value={selectedTumor.code}
                onChange={(e) => setSelectedTumor(TUMOR_TYPES.find(t => t.code === e.target.value) || TUMOR_TYPES[0])}
              >
                {TUMOR_TYPES.map(t => (
                  <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">RNA Category</label>
              <select 
                className="w-full rounded-lg border-slate-300 border px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-slate-50"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as RnaCategory)}
              >
                {RNA_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleSearch}
              disabled={expressionState.loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-95"
            >
              {expressionState.loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculating...
                </>
              ) : (
                <>
                  <SearchIcon />
                  Start Analysis
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Area */}
        {expressionState.error && (
           <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl relative shadow-sm" role="alert">
             <strong className="font-bold">Error: </strong>
             <span className="block sm:inline">{expressionState.error}</span>
           </div>
        )}

        {expressionState.data && (
          <div className="space-y-12 animate-fade-in">
            {/* Expression Chart */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
                 <h2 className="text-2xl font-bold text-slate-800">Differential Expression Analysis</h2>
                 <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium border border-slate-200">{selectedTumor.name}</span>
              </div>
              <ExpressionChart data={expressionState.data} />
            </section>

            {/* Expression Table */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
                 <div>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-slate-800">Candidate Discovery</h2>
                    </div>
                    <p className="text-slate-500 mt-2 ml-4 max-w-2xl">
                      Select a gene ("Survival" button) to perform detailed multi-omics analysis (Clinical, Immune, Pathways, Drugs).
                    </p>
                 </div>
                 <button 
                   onClick={handleDownload}
                   className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"
                 >
                   <DownloadIcon />
                   Download CSV
                 </button>
              </div>
              <DataTable data={expressionState.data} onAnalyze={handleDeepAnalyze} />
              
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 justify-end">
                <span>Raw data available at:</span>
                <a href="https://portal.gdc.cancer.gov/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium">
                  GDC Data Portal <ExternalLinkIcon/>
                </a>
              </div>
            </section>
          </div>
        )}

        {/* Detailed Analysis Section */}
        <div id="deep-analysis-section">
          {detailedState.loading && (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm border-dashed">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-b-indigo-300 rounded-full animate-spin animation-delay-500"></div>
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-800">Generating Multi-Omics Report</h3>
                <p className="text-slate-500 mt-2">Computing Survival, Clinical, Immune, and Drug correlations...</p>
             </div>
          )}

          {detailedState.data && (
            <section className="animate-slide-up">
               <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-800">Detailed Analysis Report</h2>
               </div>
               <GeneAnalysisDashboard analysis={detailedState.data} />
            </section>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 rounded text-white">
                  <DnaIcon />
                </div>
                <span className="font-bold text-slate-800">GlycoAtlas TCGA</span>
              </div>
              <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} Research Use Only. Simulated Data Environment.</p>
           </div>
        </div>
      </footer>
    </div>
  );
}

export default App;