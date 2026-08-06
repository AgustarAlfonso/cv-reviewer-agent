import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, FileText } from 'lucide-react';
import UploadForm from './components/UploadForm';
import AnalysisResults from './components/AnalysisResults';
import MasterProfile from './components/MasterProfile';
import CVGenerator from './components/CVGenerator';
import SuggestionPreviewModal from './components/SuggestionPreviewModal';
import { analyzeCV, applySuggestion, generatePreview } from './services/api';

/**
 * Main application component for CVSight.
 * Implements a luxury minimalist dark mode aesthetic with smooth transitions.
 * Manages the Apply Suggestion flow: click fix → preview before/after → download.
 */
function App() {
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer', 'profile', 'generator'
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Track the job description used in the last analysis (needed for apply-suggestion)
  const [lastJobDescription, setLastJobDescription] = useState('');

  // Apply Suggestion state
  const [applyingIndex, setApplyingIndex] = useState(null);
  const [applyingType, setApplyingType] = useState(null);
  const [previewData, setPreviewData] = useState(null); // { suggestion, originalCV, fixedCV }

  // Cached baseline CV — generated once per analysis, reused for all Fix clicks
  const baselineCVRef = useRef(null);

  const handleAnalyze = async (file, jobDescription) => {
    setIsLoading(true);
    setResult(null);
    setPreviewData(null);
    setLastJobDescription(jobDescription || '');
    baselineCVRef.current = null; // Reset baseline on new analysis
    
    try {
      const data = await analyzeCV(file, jobDescription);
      setResult(data);
    } catch (error) {
      alert(error.message || 'Failed to analyze CV.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles clicking the "Fix" button on a suggestion or profile recommendation.
   * 
   * On first click: generates a baseline CV via /generate/preview, then calls
   * /apply-suggestion with that baseline so Gemini can make targeted changes.
   * The baseline is cached for subsequent Fix clicks.
   *
   * @param {string} suggestionText - The suggestion text to apply.
   * @param {string} type - 'suggestion' or 'recommendation'.
   * @param {number} index - Index of the item in its list.
   */
  const handleApplySuggestion = async (suggestionText, type, index) => {
    // Debounce: don't allow if already applying
    if (applyingIndex !== null) return;

    setApplyingIndex(index);
    setApplyingType(type);

    try {
      // Step 1: Get baseline CV (generate once, cache for reuse)
      let baseline = baselineCVRef.current;
      if (!baseline) {
        baseline = await generatePreview(lastJobDescription, 'English');
        baselineCVRef.current = baseline;
      }

      // Step 2: Generate fixed CV with the suggestion applied
      const fixedCV = await applySuggestion(
        suggestionText,
        lastJobDescription,
        baseline, // Pass baseline so Gemini makes targeted changes
        'English'
      );

      setPreviewData({
        suggestion: suggestionText,
        originalCV: baseline,
        fixedCV: fixedCV,
      });
    } catch (error) {
      alert(error.message || 'Failed to apply suggestion.');
    } finally {
      setApplyingIndex(null);
      setApplyingType(null);
    }
  };

  const handleClosePreview = () => {
    setPreviewData(null);
  };

  const navItems = [
    { id: 'analyzer', label: 'Analyzer', icon: <Sparkles size={16} /> },
    { id: 'profile', label: 'Master Profile', icon: <User size={16} /> },
    { id: 'generator', label: 'Generator', icon: <FileText size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 font-sans selection:bg-brand-500 selection:text-white">
      {/* Floating Glass Pill Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="flex items-center gap-2 p-1.5 bg-dark-800/80 backdrop-blur-md border border-dark-700/50 rounded-full shadow-2xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${
                activeTab === item.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-brand-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area with Transitions */}
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'analyzer' && (
            <motion.div
              key="analyzer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center w-full"
            >
              <div className="text-center mb-16 max-w-3xl">
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                  Elevate your career <br /> with AI precision.
                </h1>
                <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed">
                  Upload your CV to check its ATS compatibility and get actionable, data-driven feedback to secure your next role.
                </p>
              </div>
              
              <div className="w-full max-w-4xl">
                <UploadForm onAnalyze={handleAnalyze} isLoading={isLoading} />
                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-16"
                  >
                    <AnalysisResults
                      result={result}
                      onApplySuggestion={handleApplySuggestion}
                      applyingIndex={applyingIndex}
                      applyingType={applyingType}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <MasterProfile />
            </motion.div>
          )}

          {activeTab === 'generator' && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <CVGenerator />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Suggestion Preview Modal */}
      <SuggestionPreviewModal
        isOpen={!!previewData}
        onClose={handleClosePreview}
        suggestion={previewData?.suggestion || ''}
        originalCV={previewData?.originalCV}
        fixedCV={previewData?.fixedCV}
      />
    </div>
  );
}

export default App;

