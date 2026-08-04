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
  const [selectedEducation, setSelectedEducation] = useState([]);
  const [selectedWorkExp, setSelectedWorkExp] = useState([]);
  const [selectedOrgExp, setSelectedOrgExp] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [selectedCertificates, setSelectedCertificates] = useState([]);

  useEffect(() => {
    if (importedProfile) {
      setSelectedEducation(importedProfile.education ? importedProfile.education.map((_, i) => i) : []);
      setSelectedWorkExp(importedProfile.work_experience ? importedProfile.work_experience.map((_, i) => i) : []);
      setSelectedOrgExp(importedProfile.org_experience ? importedProfile.org_experience.map((_, i) => i) : []);
      setSelectedProjects(importedProfile.projects ? importedProfile.projects.map((_, i) => i) : []);
      setSelectedPublications(importedProfile.publications ? importedProfile.publications.map((_, i) => i) : []);
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
      education: importedProfile.education.filter((_, i) => selectedEducation.includes(i)),
      work_experience: importedProfile.work_experience.filter((_, i) => selectedWorkExp.includes(i)),
      org_experience: importedProfile.org_experience.filter((_, i) => selectedOrgExp.includes(i)),
      projects: importedProfile.projects.filter((_, i) => selectedProjects.includes(i)),
      publications: importedProfile.publications.filter((_, i) => selectedPublications.includes(i)),
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
            {importedProfile.basic_info.location && <p><strong>Location:</strong> {importedProfile.basic_info.location}</p>}
          </div>
        </div>
      )}

      <div className="reviewer-section">
        <h4>Education ({importedProfile.education.length} found)</h4>
        {importedProfile.education.map((edu, idx) => (
          <label key={idx} className={`reviewer-card selectable ${selectedEducation.includes(idx) ? 'selected' : ''}`}>
            <input 
              type="checkbox" 
              checked={selectedEducation.includes(idx)} 
              onChange={() => toggleSelection(setSelectedEducation, selectedEducation, idx)} 
            />
            <div className="card-content">
              <h5>{edu.institution}</h5>
              <span className="duration">{edu.degree} ({edu.duration})</span>
            </div>
          </label>
        ))}
      </div>

      <div className="reviewer-section">
        <h4>Work Experience ({importedProfile.work_experience.length} found)</h4>
        {importedProfile.work_experience.map((exp, idx) => (
          <label key={idx} className={`reviewer-card selectable ${selectedWorkExp.includes(idx) ? 'selected' : ''}`}>
            <input 
              type="checkbox" 
              checked={selectedWorkExp.includes(idx)} 
              onChange={() => toggleSelection(setSelectedWorkExp, selectedWorkExp, idx)} 
            />
            <div className="card-content">
              <h5>{exp.title} <span className="company-name">at {exp.company}</span></h5>
              <span className="duration">{exp.duration}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="reviewer-section">
        <h4>Organization Experience ({importedProfile.org_experience.length} found)</h4>
        {importedProfile.org_experience.map((org, idx) => (
          <label key={idx} className={`reviewer-card selectable ${selectedOrgExp.includes(idx) ? 'selected' : ''}`}>
            <input 
              type="checkbox" 
              checked={selectedOrgExp.includes(idx)} 
              onChange={() => toggleSelection(setSelectedOrgExp, selectedOrgExp, idx)} 
            />
            <div className="card-content">
              <h5>{org.role} <span className="company-name">at {org.organization}</span></h5>
              <span className="duration">{org.duration}</span>
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
        <h4>Publications ({importedProfile.publications.length} found)</h4>
        {importedProfile.publications.map((pub, idx) => (
          <label key={idx} className={`reviewer-card selectable ${selectedPublications.includes(idx) ? 'selected' : ''}`}>
            <input 
              type="checkbox" 
              checked={selectedPublications.includes(idx)} 
              onChange={() => toggleSelection(setSelectedPublications, selectedPublications, idx)} 
            />
            <div className="card-content">
              <h5>{pub.title}</h5>
              <p className="description-preview">{pub.publisher} • {pub.date}</p>
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
