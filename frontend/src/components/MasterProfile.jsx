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
    basic_info: { name: '', email: '', phone: '', summary: '' },
    experiences: [],
    projects: [],
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
        basic_info: data.basic_info || { name: '', email: '', phone: '', summary: '' },
        experiences: data.experiences || [],
        projects: data.projects || [],
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
      basic_info: data.basic_info || { name: '', email: '', phone: '', summary: '' },
      experiences: (data.experiences || []).map(exp => ({
        title: exp.title || exp.role || '',
        company: exp.company || '',
        duration: exp.duration || exp.period || '',
        description: Array.isArray(exp.description) ? exp.description.join('\n') : (exp.description || '')
      })),
      projects: (data.projects || []).map(proj => ({
        name: proj.name || proj.title || '',
        description: proj.description || proj.desc || '',
        technologies: proj.technologies || proj.tags || []
      })),
      certificates: (data.certificates || []).map(cert => ({
        name: cert.name || cert.title || '',
        issuer: cert.issuer || '',
        date: cert.date || cert.issued || ''
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
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            processImportedData(data);
          } catch (err) {
            setMessage('Failed to parse JSON file.');
          }
        };
        reader.readAsText(file);
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

  const handleMergeImport = (dataToMerge) => {
    // Smart merge
    const mergedProfile = {
      basic_info: {
        name: dataToMerge.basic_info.name || profile.basic_info.name,
        email: dataToMerge.basic_info.email || profile.basic_info.email,
        phone: dataToMerge.basic_info.phone || profile.basic_info.phone,
        summary: dataToMerge.basic_info.summary || profile.basic_info.summary
      },
      experiences: [...profile.experiences, ...dataToMerge.experiences],
      projects: [...profile.projects, ...dataToMerge.projects],
      certificates: [...profile.certificates, ...dataToMerge.certificates]
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
