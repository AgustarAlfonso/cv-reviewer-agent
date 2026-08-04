import React from 'react';

/**
 * Component for displaying the user's Master Profile in read-only mode.
 * 
 * @param {Object} props
 * @param {Object} props.profile - The profile data to display
 * @param {Function} props.onEdit - Callback to switch to edit mode
 * @returns {JSX.Element}
 */
const ProfileViewer = ({ profile, onEdit }) => {
  const { basic_info, experiences, projects, certificates } = profile;

  return (
    <div className="profile-viewer">
      <div className="viewer-header">
        <div className="viewer-basic-info">
          <h3>{basic_info.name || 'Anonymous User'}</h3>
          <p>
            {basic_info.email && <span>📧 {basic_info.email}</span>}
            {basic_info.phone && <span style={{marginLeft: '15px'}}>📱 {basic_info.phone}</span>}
          </p>
          {basic_info.summary && <p className="viewer-summary">{basic_info.summary}</p>}
        </div>
        <button className="edit-btn" onClick={onEdit}>✏️ Edit Profile</button>
      </div>

      <div className="viewer-section">
        <h4>Work Experience</h4>
        {experiences.length === 0 ? <p className="empty-text">No experiences added.</p> : null}
        <div className="viewer-list">
          {experiences.map((exp, idx) => (
            <div key={idx} className="viewer-card">
              <h5>{exp.title} <span className="company-name">at {exp.company}</span></h5>
              <span className="duration">{exp.duration}</span>
              <p className="description">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="viewer-section">
        <h4>Projects</h4>
        {projects.length === 0 ? <p className="empty-text">No projects added.</p> : null}
        <div className="viewer-list">
          {projects.map((proj, idx) => (
            <div key={idx} className="viewer-card">
              <h5>{proj.name}</h5>
              <p className="description">{proj.description}</p>
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="tags">
                  {proj.technologies.map((tech, i) => (
                    <span key={i} className="tag">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="viewer-section">
        <h4>Certificates</h4>
        {certificates.length === 0 ? <p className="empty-text">No certificates added.</p> : null}
        <div className="viewer-list">
          {certificates.map((cert, idx) => (
            <div key={idx} className="viewer-card">
              <h5>{cert.name}</h5>
              <p className="issuer">{cert.issuer} • {cert.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileViewer;
