import React, { useState } from 'react';
import { TUMOR_TYPES, RNA_CATEGORIES, COLORS } from './constants';
import { TumorType, RnaCategory, AnalysisState, SurvivalState } from './types';
import { fetchGlycoExpressionData, fetchSurvivalAnalysis } from './services/geminiService';
import ExpressionChart from './components/ExpressionChart';
import SurvivalChart from './components/SurvivalChart';
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

function App() {
  const [selectedTumor, setSelectedTumor] = useState<TumorType>(TUMOR_TYPES[0]);
  const [selectedCategory, setSelectedCategory] = useState<RnaCategory>(RNA_CATEGORIES[0]);
  
  const [expressionState, setExpressionState] = useState<AnalysisState>({
    loading: false,
    data: null,
    error: null,
  });

  const [survivalState, setSurvivalState] = useState<SurvivalState>({
    loading: false,
    data: null,
    error: null,
  });

  const handleSearch = async () => {
    setExpressionState({ loading: true, data: null, error: null });
    setSurvivalState({ loading: false, data: null, error: null }); // Reset survival on new search
    
    try {
      const data = await fetchGlycoExpressionData(selectedTumor.code, selectedCategory);
      setExpressionState({ loading: false, data, error: null });
    } catch (err) {
      setExpressionState({ loading: false, data: null, error: "Failed to fetch data. Please check your API key." });
    }
  };

  const handleSurvivalAnalyze = async (geneSymbol: string) => {
    setSurvivalState({ loading: true, data: null, error: null });
    try {
      const data = await fetchSurvivalAnalysis(geneSymbol, selectedTumor.code);
      setSurvivalState({ loading: false, data, error: null });
      // Scroll to survival section
      const element = document.getElementById('survival-section');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setSurvivalState({ loading: false, data: null, error: "Failed to perform survival analysis." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <DnaIcon />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                GlycoAtlas TCGA
              </span>
            </div>
            <nav className="flex space-x-4">
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Home</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Documentation</a>
              <a href="http://www.glycornadb.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">GlycoRNA DB ↗</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro Section */}
        <section className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Explore Glycosylated RNA in Human Cancers
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            A comprehensive web platform for analyzing differential expression and clinical survival correlations of 
            <span className="font-semibold text-indigo-600 mx-1">tRNA, YRNA, snRNA, rRNA, and snoRNA</span> 
            across 33 TCGA tumor types.
          </p>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left text-sm text-blue-800 mx-auto max-w-2xl">
            <div className="flex gap-3">
               <div className="flex-shrink-0 pt-0.5">
                 <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
               <div>
                 <p className="font-semibold mb-1">Methodology & Data Sources</p>
                 <ul className="list-disc pl-4 space-y-1">
                   <li>
                     <strong>Candidate Selection:</strong> Target RNAs are filtered based on validated entries in <a href="http://www.glycornadb.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">GlycoRNA DB</a> and seminal literature (Flynn et al., 2021).
                   </li>
                   <li>
                     <strong>Expression Data:</strong> Candidates are mapped to TCGA RNA-seq datasets to analyze tumor vs. normal differential expression.
                   </li>
                 </ul>
               </div>
            </div>
          </div>
        </section>

        {/* Filter / Search Bar */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tumor Type (TCGA)</label>
              <select 
                className="w-full rounded-lg border-slate-300 border px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-shadow"
                value={selectedTumor.code}
                onChange={(e) => setSelectedTumor(TUMOR_TYPES.find(t => t.code === e.target.value) || TUMOR_TYPES[0])}
              >
                {TUMOR_TYPES.map(t => (
                  <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">RNA Category</label>
              <select 
                className="w-full rounded-lg border-slate-300 border px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-shadow"
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {expressionState.loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <SearchIcon />
                  Analyze Expression
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Area */}
        {expressionState.error && (
           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
             <strong className="font-bold">Error: </strong>
             <span className="block sm:inline">{expressionState.error}</span>
           </div>
        )}

        {expressionState.data && (
          <div className="space-y-8 animate-fade-in">
            {/* Expression Chart */}
            <section>
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-bold text-slate-800">Differential Expression Analysis</h2>
                 <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">{selectedTumor.name} ({selectedTumor.code})</span>
              </div>
              <ExpressionChart data={expressionState.data} />
            </section>

            {/* Expression Table */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Validated GlycoRNA Candidates</h2>
              <DataTable data={expressionState.data} onAnalyze={handleSurvivalAnalyze} />
            </section>
          </div>
        )}

        {/* Survival Section */}
        <div id="survival-section">
          {survivalState.loading && (
             <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm border-dashed">
                <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-600 font-medium">Calculating Kaplan-Meier statistics...</p>
             </div>
          )}

          {survivalState.data && (
            <section className="animate-fade-in">
               <h2 className="text-xl font-bold text-slate-800 mb-4">Clinical Correlation & Survival</h2>
               <SurvivalChart analysis={survivalState.data} />
            </section>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GlycoAtlas TCGA. For Research Use Only.</p>
          <p className="mt-2">
            Expression data sourced from TCGA via GDC Portal (Simulated). 
            GlycoRNA candidates verified against <a href="http://www.glycornadb.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">GlycoRNA DB</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;