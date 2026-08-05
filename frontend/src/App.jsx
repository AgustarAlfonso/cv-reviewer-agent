import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, FileText } from 'lucide-react';
import UploadForm from './components/UploadForm';
import AnalysisResults from './components/AnalysisResults';
import MasterProfile from './components/MasterProfile';
import CVGenerator from './components/CVGenerator';
import { analyzeCV } from './services/api';

/**
 * Main application component for CVSight.
 * Implements a luxury minimalist dark mode aesthetic with smooth transitions.
 */
function App() {
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer', 'profile', 'generator'
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (file, jobDescription) => {
    setIsLoading(true);
    setResult(null); // Clear previous result
    
    try {
      const data = await analyzeCV(file, jobDescription);
      setResult(data);
    } catch (error) {
      alert(error.message || 'Failed to analyze CV.');
    } finally {
      setIsLoading(false);
    }
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
                    <AnalysisResults result={result} />
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
    </div>
  );
}

export default App;
