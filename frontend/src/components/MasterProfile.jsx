import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile, updateProfile, extractProfileFromCV } from '../services/api';
import ProfileViewer from './ProfileViewer';
import ProfileEditor from './ProfileEditor';
import ImportReviewer from './ImportReviewer';
import { Download, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
      setMessage({ text: 'Failed to load profile.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (updatedProfile) => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    // Auto-aggregate skills
    const projectTechs = (updatedProfile.projects || []).flatMap(p => p.technologies || []);
    const certSkills = (updatedProfile.certificates || []).flatMap(c => c.skills || []);
    const currentSkills = updatedProfile.skills || [];
    
    updatedProfile.skills = Array.from(new Set([...currentSkills, ...projectTechs, ...certSkills])).filter(s => s.trim() !== '');

    try {
      await updateProfile(updatedProfile);
      setProfile(updatedProfile);
      setMessage({ text: 'Profile saved successfully!', type: 'success' });
      setMode('view');
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to save profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const processImportedData = (data) => {
    // Formatting logic (kept identical)
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
    setMessage({ text: 'Please select which imported items to add to your profile.', type: 'info' });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setMessage({ text: '', type: '' });

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.education !== undefined || data.org_experience !== undefined) {
          processImportedData(data);
        } else {
          const aiData = await extractProfileFromCV(file);
          processImportedData(aiData);
        }
      } else if (file.name.endsWith('.pdf')) {
        const data = await extractProfileFromCV(file);
        processImportedData(data);
      } else {
        setMessage({ text: 'Unsupported file type. Please upload a .json or .pdf file.', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: error.message || 'Failed to import profile.', type: 'error' });
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const mergeArrays = (existingArr, newArr, keyFields) => {
    const merged = [...existingArr];
    newArr.forEach(newItem => {
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
    const mergedProfile = {
      basic_info: { ...profile.basic_info, ...dataToMerge.basic_info },
      skills: Array.from(new Set([...(profile.skills || []), ...(dataToMerge.skills || [])])),
      education: mergeArrays(profile.education, dataToMerge.education, ['institution', 'degree']),
      work_experience: mergeArrays(profile.work_experience, dataToMerge.work_experience, ['company', 'title']),
      org_experience: mergeArrays(profile.org_experience, dataToMerge.org_experience, ['organization', 'role']),
      projects: mergeArrays(profile.projects, dataToMerge.projects, ['name']),
      publications: mergeArrays(profile.publications, dataToMerge.publications, ['title']),
      certificates: mergeArrays(profile.certificates, dataToMerge.certificates, ['name'])
    };
    handleSaveProfile(mergedProfile);
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">Master Profile</h2>
          <p className="text-gray-400 font-light text-lg">Centralize your background. AI uses this data to tailor your CV automatically.</p>
        </div>
        
        {mode !== 'import-review' && (
          <div>
            <input 
              type="file" 
              accept=".json,.pdf" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <button 
              type="button" 
              onClick={handleImportClick}
              disabled={isImporting}
              className="group relative overflow-hidden bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isImporting ? (
                <span className="animate-pulse">Importing Data...</span>
              ) : (
                <>
                  <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  Import JSON / PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-8 p-4 rounded-2xl flex items-center gap-3 ${
              message.type === 'error' ? 'bg-red-950/50 border border-red-900/50 text-red-200' : 'bg-green-950/50 border border-green-900/50 text-green-200'
            }`}
          >
            {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Areas */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {mode === 'view' && (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfileViewer profile={profile} onEdit={() => { setMessage({ text: '', type: '' }); setMode('edit'); }} />
            </motion.div>
          )}

          {mode === 'edit' && (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfileEditor 
                initialProfile={profile}
                onSave={handleSaveProfile}
                onCancel={() => { setMode('view'); setMessage({ text: '', type: '' }); }}
                isSaving={isSaving}
              />
            </motion.div>
          )}

          {mode === 'import-review' && (
            <motion.div key="import" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ImportReviewer 
                importedProfile={importedProfile}
                onMerge={handleMergeImport}
                onCancel={() => { setMode('view'); setImportedProfile(null); setMessage({ text: '', type: '' }); }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MasterProfile;
