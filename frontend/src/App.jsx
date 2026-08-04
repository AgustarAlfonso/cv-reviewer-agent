import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import AnalysisResults from './components/AnalysisResults';
import { analyzeCV } from './services/api';

function App() {
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

  return (
    <div>
      <h1>CVSight</h1>
      <p className="app-description">
        AI-Powered Resume Analyzer. Upload your CV to check its ATS compatibility and get actionable feedback.
      </p>
      
      <UploadForm onAnalyze={handleAnalyze} isLoading={isLoading} />
      <AnalysisResults result={result} />
    </div>
  );
}

export default App;
