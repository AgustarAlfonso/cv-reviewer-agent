import React, { useState, useRef } from 'react';
import './UploadForm.css';

/**
 * Component for uploading a CV and inputting an optional job description.
 * Features drag-and-drop support.
 * 
 * @param {Object} props - Component props.
 * @param {Function} props.onAnalyze - Callback function triggered when the form is submitted.
 * @param {boolean} props.isLoading - Whether an analysis is currently in progress.
 * @returns {JSX.Element} The UploadForm component.
 */
const UploadForm = ({ onAnalyze, isLoading }) => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
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
      setError('A CV (PDF) is required.');
      return;
    }
    onAnalyze(file, jobDescription);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        setError('Please drop a valid PDF file.');
      } else {
        setError('');
        setFile(droppedFile);
        
        // Update the file input manually
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload CV</h2>
      <p className="subtitle">Let AI analyze your resume against ATS standards.</p>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div 
          className={`drop-zone ${file ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden-input"
          />
          {file ? (
            <div className="file-info">
              📄 <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
              <br />
              <span className="change-text">Click or drag to change file</span>
            </div>
          ) : (
            <div className="placeholder-text">
              <span className="icon">📂</span>
              <p>Drag & Drop your CV (PDF) here</p>
              <p>or <span>Browse files</span></p>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="jobDescription">Job Description (Optional)</label>
          <textarea
            id="jobDescription"
            rows="5"
            placeholder="Paste the job description here to check keyword compatibility..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          ></textarea>
        </div>

        <button type="submit" disabled={!file || isLoading} className="submit-button">
          {isLoading ? 'Analyzing...' : 'Analyze CV'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
