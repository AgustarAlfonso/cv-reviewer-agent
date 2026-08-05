import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, ArrowRight, Sparkles } from 'lucide-react';

const UploadForm = ({ onAnalyze, isLoading }) => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        setFile(null);
      } else {
        setError('');
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError('A CV (PDF) is required for this option.');
      return;
    }
    onAnalyze(file, jobDescription);
  };

  const handleProfileAnalyze = () => {
    setError('');
    onAnalyze(null, jobDescription);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* Cinematic Drag and Drop Zone */}
        <motion.div 
          className={`relative overflow-hidden group cursor-pointer border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-colors duration-500 min-h-[320px] ${
            isDragging ? 'border-brand-500 bg-brand-900/20' : file ? 'border-gray-600 bg-dark-800/50' : 'border-gray-700 bg-dark-800/30 hover:border-gray-500 hover:bg-dark-800/80'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Animated background glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/0 via-brand-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div 
                key="has-file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center z-10"
              >
                <div className="w-20 h-20 mb-6 rounded-full bg-brand-900/50 flex items-center justify-center border border-brand-500/30">
                  <FileText className="w-10 h-10 text-brand-400" />
                </div>
                <h3 className="text-2xl font-display font-medium text-white mb-2">{file.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis</p>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">Click or drag to change file</span>
              </motion.div>
            ) : (
              <motion.div 
                key="no-file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center z-10"
              >
                <div className="w-20 h-20 mb-6 rounded-full bg-dark-700 flex items-center justify-center group-hover:bg-dark-600 transition-colors duration-500">
                  <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-brand-400' : 'text-gray-400 group-hover:text-white'} transition-colors duration-500`} />
                </div>
                <h3 className="text-2xl font-display font-medium text-white mb-2">Drop your CV here</h3>
                <p className="text-gray-400">PDF formats only. Maximum size 10MB.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="text-red-400 bg-red-950/30 border border-red-900/50 px-6 py-4 rounded-xl text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <label htmlFor="jobDescription" className="block text-sm font-medium tracking-wide text-gray-300 uppercase">
            Target Role Context
          </label>
          <textarea
            id="jobDescription"
            rows="4"
            className="w-full bg-dark-800 border border-dark-700 rounded-2xl px-6 py-5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-none font-light leading-relaxed"
            placeholder="Paste the job description or target role details here to evaluate keyword match..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <button 
            type="submit" 
            disabled={!file || isLoading} 
            className="relative overflow-hidden group bg-white text-dark-900 rounded-2xl py-5 px-8 font-medium text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            {isLoading && file ? (
              <span className="animate-pulse">Analyzing...</span>
            ) : (
              <>
                Analyze Document <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <button 
            type="button" 
            disabled={isLoading} 
            onClick={handleProfileAnalyze}
            className="relative overflow-hidden group bg-dark-800 border border-dark-700 text-white rounded-2xl py-5 px-8 font-medium text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 transition-colors"
          >
            {isLoading && !file ? (
              <span className="animate-pulse">Evaluating...</span>
            ) : (
              <>
                Analyze Master Profile <Sparkles className="w-5 h-5 text-brand-400" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
