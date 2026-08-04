import React, { useState, useEffect } from 'react';

/**
 * Component for reviewing and selecting imported profile data to merge.
 * 
 * @param {Object} props
 * @param {Object} props.importedProfile - The new data from JSON/PDF
 * @param {Function} props.onMerge - Callback when user confirms merge (passes selected arrays)
 * @param {Function} props.onCancel - Callback to cancel import
 * @returns {JSX.Element}
 */
const ImportReviewer = ({ importedProfile, onMerge, onCancel }) => {
  // We keep track of which items are selected to be merged.
  // By default, all items are selected.
  const [selectedExperiences, setSelectedExperiences] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedCertificates, setSelectedCertificates] = useState([]);

  useEffect(() => {
    if (importedProfile) {
      setSelectedExperiences(importedProfile.experiences ? importedProfile.experiences.map((_, i) => i) : []);
      setSelectedProjects(importedProfile.projects ? importedProfile.projects.map((_, i) => i) : []);
      setSelectedCertificates(importedProfile.certificates ? importedProfile.certificates.map((_, i) => i) : []);
    }
  }, [importedProfile]);

  if (!importedProfile) return null;

  const toggleSelection = (setter, selectedList, index) => {
    if (selectedList.includes(index)) {
      setter(selectedList.filter(i => i !== index));
    } else {
      setter([...selectedList, index]);
    }
  };

  const handleMerge = () => {
    const dataToMerge = {
      basic_info: importedProfile.basic_info, // We always merge basic info if present
      experiences: importedProfile.experiences.filter((_, i) => selectedExperiences.includes(i)),
      projects: importedProfile.projects.filter((_, i) => selectedProjects.includes(i)),
      certificates: importedProfile.certificates.filter((_, i) => selectedCertificates.includes(i))
    };
    onMerge(dataToMerge);
  };

  return (
    <div className="import-reviewer">
      <h3>Review Imported Data</h3>
      <p className="subtitle">Select the items you want to merge into your Master Profile. Your existing items will not be deleted.</p>
      
      {importedProfile.basic_info && (importedProfile.basic_info.name || importedProfile.basic_info.email) && (
        <div className="reviewer-section">
          <h4>Basic Information (Will be updated)</h4>
          <div className="reviewer-card readonly">
            <p><strong>Name:</strong> {importedProfile.basic_info.name}</p>
            <p><strong>Email:</strong> {importedProfile.basic_info.email}</p>
          </div>
        </div>
      )}

      <div className="reviewer-section">
        <h4>Work Experience ({importedProfile.experiences.length} found)</h4>
        {importedProfile.experiences.map((exp, idx) => (
          <label key={idx} className={`reviewer-card selectable ${selectedExperiences.includes(idx) ? 'selected' : ''}`}>
            <input 
              type="checkbox" 
              checked={selectedExperiences.includes(idx)} 
              onChange={() => toggleSelection(setSelectedExperiences, selectedExperiences, idx)} 
            />
            <div className="card-content">
              <h5>{exp.title} <span className="company-name">at {exp.company}</span></h5>
              <span className="duration">{exp.duration}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="reviewer-section">
        <h4>Projects ({importedProfile.projects.length} found)</h4>
        {importedProfile.projects.map((proj, idx) => (
          <label key={idx} className={`reviewer-card selectable ${selectedProjects.includes(idx) ? 'selected' : ''}`}>
            <input 
              type="checkbox" 
              checked={selectedProjects.includes(idx)} 
              onChange={() => toggleSelection(setSelectedProjects, selectedProjects, idx)} 
            />
            <div className="card-content">
              <h5>{proj.name}</h5>
              <p className="description-preview">{proj.description.substring(0, 80)}...</p>
            </div>
          </label>
        ))}
      </div>

      <div className="reviewer-section">
        <h4>Certificates ({importedProfile.certificates.length} found)</h4>
        {importedProfile.certificates.map((cert, idx) => (
          <label key={idx} className={`reviewer-card selectable ${selectedCertificates.includes(idx) ? 'selected' : ''}`}>
            <input 
              type="checkbox" 
              checked={selectedCertificates.includes(idx)} 
              onChange={() => toggleSelection(setSelectedCertificates, selectedCertificates, idx)} 
            />
            <div className="card-content">
              <h5>{cert.name}</h5>
              <p className="issuer">{cert.issuer} • {cert.date}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="form-actions" style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px'}}>
        <button type="button" className="cancel-button" onClick={onCancel}>
          Cancel Import
        </button>
        <button type="button" className="submit-button save-button" onClick={handleMerge}>
          Merge to Profile
        </button>
      </div>
    </div>
  );
};

export default ImportReviewer;
