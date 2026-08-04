import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile, extractProfileFromCV } from '../services/api';
import ProfileViewer from './ProfileViewer';
import ProfileEditor from './ProfileEditor';
import ImportReviewer from './ImportReviewer';
import './MasterProfile.css';

/**
 * Main container for managing the user's Master Profile.
 * Orchestrates View, Edit, and Import Review modes.
 * 
 * @returns {JSX.Element}
 */
const MasterProfile = () => {
  const [profile, setProfile] = useState({
    basic_info: { name: '', email: '', phone: '', location: '', summary: '', github: '', linkedin: '', portfolio: '' },
    skills: [],
    education: [],
    work_experience: [],
    org_experience: [],
    projects: [],
    publications: [],
    certificates: []
  });
  
  // modes: 'view', 'edit', 'import-review'
  const [mode, setMode] = useState('view');
  const [importedProfile, setImportedProfile] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile({
        basic_info: data.basic_info || { name: '', email: '', phone: '', location: '', summary: '', github: '', linkedin: '', portfolio: '' },
        skills: data.skills || [],
        education: data.education || [],
        work_experience: data.work_experience || data.experiences || [],
        org_experience: data.org_experience || [],
        projects: data.projects || [],
        publications: data.publications || [],
        certificates: data.certificates || []
      });
    } catch (error) {
      console.error(error);
      setMessage('Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (updatedProfile) => {
    setIsSaving(true);
    setMessage('');

    // Auto-aggregate skills from projects and certificates
    const projectTechs = (updatedProfile.projects || []).flatMap(p => p.technologies || []);
    const certSkills = (updatedProfile.certificates || []).flatMap(c => c.skills || []);
    const currentSkills = updatedProfile.skills || [];
    
    updatedProfile.skills = Array.from(new Set([...currentSkills, ...projectTechs, ...certSkills])).filter(s => s.trim() !== '');

    try {
      await updateProfile(updatedProfile);
      setProfile(updatedProfile);
      setMessage('Profile saved successfully!');
      setMode('view');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const processImportedData = (data) => {
    const formattedData = {
      basic_info: data.basic_info || { name: '', email: '', phone: '', location: '', summary: '', github: '', linkedin: '', portfolio: '' },
      skills: data.skills || [],
      education: (data.education || []).map(edu => ({
        institution: edu.institution || '',
        degree: edu.degree || '',
        duration: edu.duration || edu.period || '',
        description: Array.isArray(edu.description) ? edu.description.join('\n') : (edu.description || '')
      })),
      work_experience: (data.work_experience || data.experiences || []).map(exp => ({
        title: exp.title || exp.role || '',
        company: exp.company || '',
        duration: exp.duration || exp.period || '',
        description: Array.isArray(exp.description) ? exp.description.join('\n') : (exp.description || '')
      })),
      org_experience: (data.org_experience || []).map(org => ({
        role: org.role || '',
        organization: org.organization || '',
        duration: org.duration || org.period || '',
        description: Array.isArray(org.description) ? org.description.join('\n') : (org.description || '')
      })),
      projects: (data.projects || []).map(proj => ({
        name: proj.name || proj.title || '',
        description: proj.description || proj.desc || '',
        technologies: proj.technologies || proj.tags || [],
        link: proj.link || proj.demoUrl || '',
        repo: proj.repo || proj.repoUrl || ''
      })),
      publications: (data.publications || []).map(pub => ({
        title: pub.title || '',
        publisher: pub.publisher || pub.journal || '',
        date: pub.date || '',
        link: pub.link || pub.url || '',
        description: Array.isArray(pub.description) ? pub.description.join('\n') : (pub.description || '')
      })),
      certificates: (data.certificates || []).map(cert => ({
        name: cert.name || cert.title || '',
        issuer: cert.issuer || '',
        date: cert.date || cert.issued || '',
        link: cert.link || cert.credentialUrl || '',
        skills: cert.skills || cert.technologies || []
      }))
    };
    setImportedProfile(formattedData);
    setMode('import-review');
    setMessage('Please select which imported items to add to your profile.');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setMessage('');

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Check if it's already in the new MasterProfile schema
        if (data.education !== undefined || data.org_experience !== undefined) {
          processImportedData(data);
        } else {
          // Legacy format or generic JSON, let AI map it
          const aiData = await extractProfileFromCV(file);
          processImportedData(aiData);
        }
      } else if (file.name.endsWith('.pdf')) {
        const data = await extractProfileFromCV(file);
        processImportedData(data);
      } else {
        setMessage('Unsupported file type. Please upload a .json or .pdf file.');
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Failed to import profile.');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const mergeArrays = (existingArr, newArr, keyFields) => {
    const merged = [...existingArr];
    newArr.forEach(newItem => {
      // Check if an item with matching key fields already exists
      const isDuplicate = existingArr.some(existingItem => 
        keyFields.every(key => 
          String(existingItem[key] || '').toLowerCase().trim() === String(newItem[key] || '').toLowerCase().trim()
        )
      );
      if (!isDuplicate) {
        merged.push(newItem);
      }
    });
    return merged;
  };

  const handleMergeImport = (dataToMerge) => {
    // Smart merge with duplicate prevention
    const mergedProfile = {
      basic_info: {
        name: dataToMerge.basic_info.name || profile.basic_info.name,
        email: dataToMerge.basic_info.email || profile.basic_info.email,
        phone: dataToMerge.basic_info.phone || profile.basic_info.phone,
        location: dataToMerge.basic_info.location || profile.basic_info.location,
        summary: dataToMerge.basic_info.summary || profile.basic_info.summary,
        github: dataToMerge.basic_info.github || profile.basic_info.github,
        linkedin: dataToMerge.basic_info.linkedin || profile.basic_info.linkedin,
        portfolio: dataToMerge.basic_info.portfolio || profile.basic_info.portfolio
      },
      skills: Array.from(new Set([...(profile.skills || []), ...(dataToMerge.skills || [])])),
      education: mergeArrays(profile.education, dataToMerge.education, ['institution', 'degree']),
      work_experience: mergeArrays(profile.work_experience, dataToMerge.work_experience, ['company', 'title']),
      org_experience: mergeArrays(profile.org_experience, dataToMerge.org_experience, ['organization', 'role']),
      projects: mergeArrays(profile.projects, dataToMerge.projects, ['name']),
      publications: mergeArrays(profile.publications, dataToMerge.publications, ['title']),
      certificates: mergeArrays(profile.certificates, dataToMerge.certificates, ['name'])
    };
    
    // Automatically save merged profile
    handleSaveProfile(mergedProfile);
  };

  if (isLoading) return <div className="profile-container">Loading Profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header-actions">
        <div>
          <h2>Master Profile</h2>
          <p className="subtitle">Store your complete background here. CVSight will use this to suggest tailoring your CV.</p>
        </div>
        
        {/* Only show import button if not in review mode */}
        {mode !== 'import-review' && (
          <div className="import-section">
            <input 
              type="file" 
              accept=".json,.pdf" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            <button 
              type="button" 
              className="import-button" 
              onClick={handleImportClick}
              disabled={isImporting}
            >
              {isImporting ? 'Importing...' : '📥 Import Profile (JSON/PDF)'}
            </button>
          </div>
        )}
      </div>
      
      {message && <div className={`message ${message.includes('Failed') || message.includes('Unsupported') ? 'error' : 'success'}`}>{message}</div>}

      <div className="profile-content">
        {mode === 'view' && (
          <ProfileViewer 
            profile={profile} 
            onEdit={() => { setMessage(''); setMode('edit'); }} 
          />
        )}

        {mode === 'edit' && (
          <ProfileEditor 
            initialProfile={profile}
            onSave={handleSaveProfile}
            onCancel={() => { setMode('view'); setMessage(''); }}
            isSaving={isSaving}
          />
        )}

        {mode === 'import-review' && (
          <ImportReviewer 
            importedProfile={importedProfile}
            onMerge={handleMergeImport}
            onCancel={() => { setMode('view'); setImportedProfile(null); setMessage(''); }}
          />
        )}
      </div>
    </div>
  );
};

export default MasterProfile;
