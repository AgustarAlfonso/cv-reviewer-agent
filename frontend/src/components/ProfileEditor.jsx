import React, { useState, useEffect } from 'react';

/**
 * Component for editing the user's Master Profile.
 * Provides dynamic forms to edit basic info, experiences, projects, and certificates.
 * 
 * @param {Object} props
 * @param {Object} props.initialProfile - The profile data to start with
 * @param {Function} props.onSave - Callback when save is clicked
 * @param {Function} props.onCancel - Callback to cancel editing
 * @param {boolean} props.isSaving - Whether currently saving
 * @returns {JSX.Element}
 */
const ProfileEditor = ({ initialProfile, onSave, onCancel, isSaving }) => {
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      basic_info: { ...profile.basic_info, [name]: value }
    });
  };

  // Generic array handlers
  const handleArrayChange = (field, index, key, value) => {
    const newArray = [...profile[field]];
    newArray[index][key] = value;
    setProfile({ ...profile, [field]: newArray });
  };

  const addArrayItem = (field, emptyItem) => {
    setProfile({ ...profile, [field]: [...profile[field], emptyItem] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = [...profile[field]];
    newArray.splice(index, 1);
    setProfile({ ...profile, [field]: newArray });
  };

  const handleTechnologyChange = (projectIndex, value) => {
    const techs = value.split(',').map(t => t.trim()).filter(t => t);
    handleArrayChange('projects', projectIndex, 'technologies', techs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      {/* Basic Info Section */}
      <section className="form-section">
        <h3>Basic Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={profile.basic_info.name} onChange={handleBasicInfoChange} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={profile.basic_info.email} onChange={handleBasicInfoChange} placeholder="john@example.com" />
          </div>
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="text" name="phone" value={profile.basic_info.phone} onChange={handleBasicInfoChange} placeholder="+62 812 3456 7890" />
        </div>
        <div className="form-group">
          <label>Professional Summary</label>
          <textarea name="summary" rows="3" value={profile.basic_info.summary} onChange={handleBasicInfoChange} placeholder="A brief summary of your career..."></textarea>
        </div>
      </section>

      {/* Experiences Section */}
      <section className="form-section">
        <div className="section-header">
          <h3>Work Experience</h3>
          <button type="button" className="add-btn" onClick={() => addArrayItem('experiences', { title: '', company: '', duration: '', description: '' })}>+ Add Experience</button>
        </div>
        {profile.experiences.map((exp, index) => (
          <div key={index} className="array-item-card">
            <button type="button" className="remove-btn" onClick={() => removeArrayItem('experiences', index)}>✕</button>
            <div className="form-row">
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" value={exp.title} onChange={(e) => handleArrayChange('experiences', index, 'title', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input type="text" value={exp.company} onChange={(e) => handleArrayChange('experiences', index, 'company', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input type="text" value={exp.duration} onChange={(e) => handleArrayChange('experiences', index, 'duration', e.target.value)} placeholder="e.g. Jan 2020 - Present" />
            </div>
            <div className="form-group">
              <label>Description (Responsibilities & Achievements)</label>
              <textarea rows="3" value={exp.description} onChange={(e) => handleArrayChange('experiences', index, 'description', e.target.value)} required></textarea>
            </div>
          </div>
        ))}
        {profile.experiences.length === 0 && <p className="empty-text">No experiences added yet.</p>}
      </section>

      {/* Projects Section */}
      <section className="form-section">
        <div className="section-header">
          <h3>Projects</h3>
          <button type="button" className="add-btn" onClick={() => addArrayItem('projects', { name: '', description: '', technologies: [] })}>+ Add Project</button>
        </div>
        {profile.projects.map((proj, index) => (
          <div key={index} className="array-item-card">
            <button type="button" className="remove-btn" onClick={() => removeArrayItem('projects', index)}>✕</button>
            <div className="form-group">
              <label>Project Name</label>
              <input type="text" value={proj.name} onChange={(e) => handleArrayChange('projects', index, 'name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="2" value={proj.description} onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)} required></textarea>
            </div>
            <div className="form-group">
              <label>Technologies (Comma separated)</label>
              <input type="text" value={(proj.technologies || []).join(', ')} onChange={(e) => handleTechnologyChange(index, e.target.value)} placeholder="React, Node.js, Python" />
            </div>
          </div>
        ))}
        {profile.projects.length === 0 && <p className="empty-text">No projects added yet.</p>}
      </section>

      {/* Certificates Section */}
      <section className="form-section">
        <div className="section-header">
          <h3>Certificates</h3>
          <button type="button" className="add-btn" onClick={() => addArrayItem('certificates', { name: '', issuer: '', date: '' })}>+ Add Certificate</button>
        </div>
        {profile.certificates.map((cert, index) => (
          <div key={index} className="array-item-card">
            <button type="button" className="remove-btn" onClick={() => removeArrayItem('certificates', index)}>✕</button>
            <div className="form-row">
              <div className="form-group">
                <label>Certificate Name</label>
                <input type="text" value={cert.name} onChange={(e) => handleArrayChange('certificates', index, 'name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Issuer</label>
                <input type="text" value={cert.issuer} onChange={(e) => handleArrayChange('certificates', index, 'issuer', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="text" value={cert.date} onChange={(e) => handleArrayChange('certificates', index, 'date', e.target.value)} placeholder="e.g. Aug 2023" />
            </div>
          </div>
        ))}
        {profile.certificates.length === 0 && <p className="empty-text">No certificates added yet.</p>}
      </section>

      <div className="form-actions" style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
        <button type="button" className="cancel-button" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
        <button type="submit" className="submit-button save-button" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditor;
