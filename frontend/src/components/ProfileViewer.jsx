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
  const { 
    basic_info = {}, 
    education = [],
    work_experience = [],
    org_experience = [],
    projects = [], 
    publications = [],
    certificates = [] 
  } = profile || {};

  // Helper to render newline-separated string as a bulleted list
  const renderBullets = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 1 && !lines[0].trim().startsWith('-') && !lines[0].trim().startsWith('•')) {
      return <p className="description">{text}</p>;
    }
    return (
      <ul className="description-list">
        {lines.map((line, idx) => {
          // Remove leading bullet characters if present so we don't have double bullets
          const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
          return <li key={idx}>{cleanLine}</li>;
        })}
      </ul>
    );
  };

  return (
    <div className="profile-viewer">
      <div className="viewer-header">
        <div className="viewer-basic-info">
          <h3>{basic_info.name || 'Anonymous User'}</h3>
          <p>
            {basic_info.location && <span>📍 {basic_info.location}</span>}
            {basic_info.email && <span style={{marginLeft: '15px'}}>📧 {basic_info.email}</span>}
            {basic_info.phone && <span style={{marginLeft: '15px'}}>📱 {basic_info.phone}</span>}
          </p>
          <div className="viewer-social-links">
            {basic_info.github && <a href={basic_info.github} target="_blank" rel="noreferrer">GitHub</a>}
            {basic_info.linkedin && <a href={basic_info.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
            {basic_info.portfolio && <a href={basic_info.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
          </div>
          {basic_info.summary && <p className="viewer-summary">{basic_info.summary}</p>}
        </div>
        <button className="edit-btn" onClick={onEdit}>✏️ Edit Profile</button>
      </div>

      <div className="viewer-section">
        <h4>Education</h4>
        {education.length === 0 ? <p className="empty-text">No education added.</p> : null}
        <div className="viewer-list">
          {education.map((edu, idx) => (
            <div key={idx} className="viewer-card">
              <h5>{edu.institution} <span className="degree-name">- {edu.degree}</span></h5>
              <span className="duration">{edu.duration}</span>
              {renderBullets(edu.description)}
            </div>
          ))}
        </div>
      </div>

      <div className="viewer-section">
        <h4>Work Experience</h4>
        {work_experience.length === 0 ? <p className="empty-text">No work experiences added.</p> : null}
        <div className="viewer-list">
          {work_experience.map((exp, idx) => (
            <div key={idx} className="viewer-card">
              <h5>{exp.title} <span className="company-name">at {exp.company}</span></h5>
              <span className="duration">{exp.duration}</span>
              {renderBullets(exp.description)}
            </div>
          ))}
        </div>
      </div>

      <div className="viewer-section">
        <h4>Organization Experience</h4>
        {org_experience.length === 0 ? <p className="empty-text">No organization experiences added.</p> : null}
        <div className="viewer-list">
          {org_experience.map((org, idx) => (
            <div key={idx} className="viewer-card">
              <h5>{org.role} <span className="company-name">at {org.organization}</span></h5>
              <span className="duration">{org.duration}</span>
              {renderBullets(org.description)}
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
              <h5>
                {proj.name}
                {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="pub-link" title="Demo Link">🔗</a>}
                {proj.repo && <a href={proj.repo} target="_blank" rel="noreferrer" className="pub-link" title="Repository">💻</a>}
              </h5>
              {renderBullets(proj.description)}
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
        <h4>Publications</h4>
        {publications.length === 0 ? <p className="empty-text">No publications added.</p> : null}
        <div className="viewer-list">
          {publications.map((pub, idx) => (
            <div key={idx} className="viewer-card">
              <h5>
                {pub.title} 
                {pub.link && <a href={pub.link} target="_blank" rel="noreferrer" className="pub-link">🔗</a>}
              </h5>
              <span className="company-name">{pub.publisher} • {pub.date}</span>
              {renderBullets(pub.description)}
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
              <h5>
                {cert.name}
                {cert.link && <a href={cert.link} target="_blank" rel="noreferrer" className="pub-link" title="Credential URL">🔗</a>}
              </h5>
              <span className="issuer">{cert.issuer} • {cert.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileViewer;
