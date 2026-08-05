import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCV } from '../services/api';
import { FileText, Wand2, CheckCircle2, AlertCircle } from 'lucide-react';

function CVGenerator() {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      await generateCV(jobDescription);
      setSuccessMessage('CV generated and downloaded successfully!');
    } catch (err) {
      setError(err.message || 'An error occurred while generating the CV.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative overflow-hidden rounded-[2.5rem] border border-dark-700 bg-dark-800/80 p-8 md:p-14"
      >
        {/* Decorative Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-600/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-dark-900 border border-dark-700 rounded-full flex items-center justify-center mb-8 shadow-2xl">
            <Wand2 className="w-10 h-10 text-brand-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">AI CV Generator</h2>
          <p className="text-gray-400 font-light text-lg max-w-2xl">
            Our AI will intelligently parse your Master Profile and weave the most impactful experiences together to perfectly match the target role.
          </p>
        </div>

        <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-950/50 border border-red-900/50 text-red-200 px-6 py-4 rounded-2xl flex items-center gap-4"
              >
                <AlertCircle className="shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-950/50 border border-green-900/50 text-green-200 px-6 py-4 rounded-2xl flex items-center gap-4"
              >
                <CheckCircle2 className="shrink-0" />
                <p className="text-sm font-medium">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <label htmlFor="job-description" className="block text-sm font-semibold uppercase tracking-widest text-gray-400 pl-2">
              Target Job Description
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here..."
              rows={6}
              className="w-full bg-dark-900/50 border border-dark-700 rounded-3xl p-6 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-none text-lg font-light leading-relaxed"
            />
          </div>

          <div className="pt-4 flex justify-center">
            <button 
              onClick={handleGenerate} 
              disabled={isLoading}
              className="relative overflow-hidden group bg-white text-dark-900 hover:bg-gray-100 rounded-full py-4 px-10 font-semibold text-lg flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                  Weaving your CV...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generate Tailored CV
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CVGenerator;
