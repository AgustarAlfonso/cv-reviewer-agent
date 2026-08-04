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
        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phone" value={profile.basic_info.phone} onChange={handleBasicInfoChange} placeholder="+62 812 3456 7890" />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" value={profile.basic_info.location || ''} onChange={handleBasicInfoChange} placeholder="City, Country" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>GitHub (Optional)</label>
            <input type="url" name="github" value={profile.basic_info.github || ''} onChange={handleBasicInfoChange} placeholder="https://github.com/username" />
          </div>
          <div className="form-group">
            <label>LinkedIn (Optional)</label>
            <input type="url" name="linkedin" value={profile.basic_info.linkedin || ''} onChange={handleBasicInfoChange} placeholder="https://linkedin.com/in/username" />
          </div>
          <div className="form-group">
            <label>Portfolio (Optional)</label>
            <input type="url" name="portfolio" value={profile.basic_info.portfolio || ''} onChange={handleBasicInfoChange} placeholder="https://myportfolio.com" />
          </div>
        </div>
        <div className="form-group">
          <label>Professional Summary</label>
          <textarea name="summary" rows="3" value={profile.basic_info.summary} onChange={handleBasicInfoChange} placeholder="A brief summary of your career..."></textarea>
        </div>
      </section>

      {/* Education Section */}
      <section className="form-section">
        <div className="section-header">
          <h3>Education</h3>
          <button type="button" className="add-btn" onClick={() => addArrayItem('education', { institution: '', degree: '', duration: '', description: '' })}>+ Add Education</button>
        </div>
        {profile.education.map((edu, index) => (
          <div key={index} className="array-item-card">
            <button type="button" className="remove-btn" onClick={() => removeArrayItem('education', index)}>✕</button>
            <div className="form-row">
              <div className="form-group">
                <label>Institution</label>
                <input type="text" value={edu.institution} onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Degree</label>
                <input type="text" value={edu.degree} onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input type="text" value={edu.duration} onChange={(e) => handleArrayChange('education', index, 'duration', e.target.value)} placeholder="e.g. 2018 - 2022" />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea rows="3" value={edu.description} onChange={(e) => handleArrayChange('education', index, 'description', e.target.value)} placeholder="- Thesis on Machine Learning&#10;- Graduated with Honors"></textarea>
            </div>
          </div>
        ))}
        {profile.education.length === 0 && <p className="empty-text">No education added yet.</p>}
      </section>

      {/* Work Experiences Section */}
      <section className="form-section">
        <div className="section-header">
          <h3>Work Experience</h3>
          <button type="button" className="add-btn" onClick={() => addArrayItem('work_experience', { title: '', company: '', duration: '', description: '' })}>+ Add Experience</button>
        </div>
        {profile.work_experience.map((exp, index) => (
          <div key={index} className="array-item-card">
            <button type="button" className="remove-btn" onClick={() => removeArrayItem('work_experience', index)}>✕</button>
            <div className="form-row">
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" value={exp.title} onChange={(e) => handleArrayChange('work_experience', index, 'title', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input type="text" value={exp.company} onChange={(e) => handleArrayChange('work_experience', index, 'company', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input type="text" value={exp.duration} onChange={(e) => handleArrayChange('work_experience', index, 'duration', e.target.value)} placeholder="e.g. Jan 2020 - Present" />
            </div>
            <div className="form-group">
              <label>Description (Responsibilities & Achievements)</label>
              <textarea rows="4" value={exp.description} onChange={(e) => handleArrayChange('work_experience', index, 'description', e.target.value)} placeholder="- Led a team of 5 engineers&#10;- Increased revenue by 20%" required></textarea>
            </div>
          </div>
        ))}
        {profile.work_experience.length === 0 && <p className="empty-text">No work experiences added yet.</p>}
      </section>

      {/* Organization Experience Section */}
      <section className="form-section">
        <div className="section-header">
          <h3>Organization Experience</h3>
          <button type="button" className="add-btn" onClick={() => addArrayItem('org_experience', { role: '', organization: '', duration: '', description: '' })}>+ Add Org Experience</button>
        </div>
        {profile.org_experience.map((org, index) => (
          <div key={index} className="array-item-card">
            <button type="button" className="remove-btn" onClick={() => removeArrayItem('org_experience', index)}>✕</button>
            <div className="form-row">
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={org.role} onChange={(e) => handleArrayChange('org_experience', index, 'role', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Organization</label>
                <input type="text" value={org.organization} onChange={(e) => handleArrayChange('org_experience', index, 'organization', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input type="text" value={org.duration} onChange={(e) => handleArrayChange('org_experience', index, 'duration', e.target.value)} placeholder="e.g. 2021 - 2022" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="3" value={org.description} onChange={(e) => handleArrayChange('org_experience', index, 'description', e.target.value)} placeholder="- Organized annual tech conference&#10;- Managed budget of $5000" required></textarea>
            </div>
          </div>
        ))}
        {profile.org_experience.length === 0 && <p className="empty-text">No organization experiences added yet.</p>}
      </section>

      {/* Projects Section */}
      <section className="form-section">
        <div className="section-header">
          <h3>Projects</h3>
          <button type="button" className="add-btn" onClick={() => addArrayItem('projects', { name: '', description: '', technologies: [], link: '', repo: '' })}>+ Add Project</button>
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
              <textarea rows="3" value={proj.description} onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)} placeholder="- Developed a web app&#10;- Integrated payment gateway" required></textarea>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Demo Link (Optional)</label>
                <input type="url" value={proj.link} onChange={(e) => handleArrayChange('projects', index, 'link', e.target.value)} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Repository (Optional)</label>
                <input type="url" value={proj.repo} onChange={(e) => handleArrayChange('projects', index, 'repo', e.target.value)} placeholder="https://github.com/..." />
              </div>
            </div>
            <div className="form-group">
              <label>Technologies (Comma separated)</label>
              <input type="text" value={(proj.technologies || []).join(', ')} onChange={(e) => handleTechnologyChange(index, e.target.value)} placeholder="React, Node.js, Python" />
            </div>
          </div>
        ))}
        {profile.projects.length === 0 && <p className="empty-text">No projects added yet.</p>}
      </section>

      {/* Publications Section */}
      <section className="form-section">
        <div className="section-header">
          <h3>Publications</h3>
          <button type="button" className="add-btn" onClick={() => addArrayItem('publications', { title: '', publisher: '', date: '', link: '', description: '' })}>+ Add Publication</button>
        </div>
        {profile.publications.map((pub, index) => (
          <div key={index} className="array-item-card">
            <button type="button" className="remove-btn" onClick={() => removeArrayItem('publications', index)}>✕</button>
            <div className="form-row">
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={pub.title} onChange={(e) => handleArrayChange('publications', index, 'title', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Publisher/Journal</label>
                <input type="text" value={pub.publisher} onChange={(e) => handleArrayChange('publications', index, 'publisher', e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="text" value={pub.date} onChange={(e) => handleArrayChange('publications', index, 'date', e.target.value)} placeholder="e.g. 2023" />
              </div>
              <div className="form-group">
                <label>Link (Optional)</label>
                <input type="url" value={pub.link} onChange={(e) => handleArrayChange('publications', index, 'link', e.target.value)} placeholder="https://doi.org/..." />
              </div>
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea rows="3" value={pub.description} onChange={(e) => handleArrayChange('publications', index, 'description', e.target.value)} placeholder="- Published research on AI&#10;- Cited by 50+ papers"></textarea>
            </div>
          </div>
        ))}
        {profile.publications.length === 0 && <p className="empty-text">No publications added yet.</p>}
      </section>

      {/* Certificates Section */}
      <section className="form-section">
        <div className="section-header">
          <h3>Certificates</h3>
          <button type="button" className="add-btn" onClick={() => addArrayItem('certificates', { name: '', issuer: '', date: '', link: '' })}>+ Add Certificate</button>
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
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="text" value={cert.date} onChange={(e) => handleArrayChange('certificates', index, 'date', e.target.value)} placeholder="e.g. Aug 2023" />
              </div>
              <div className="form-group">
                <label>Credential URL (Optional)</label>
                <input type="url" value={cert.link} onChange={(e) => handleArrayChange('certificates', index, 'link', e.target.value)} placeholder="https://..." />
              </div>
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
