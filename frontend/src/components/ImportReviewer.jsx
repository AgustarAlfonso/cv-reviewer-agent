import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Combine, Layers } from 'lucide-react';

const ImportReviewer = ({ importedProfile, onMerge, onCancel }) => {
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
      basic_info: importedProfile.basic_info,
      education: importedProfile.education.filter((_, i) => selectedEducation.includes(i)),
      work_experience: importedProfile.work_experience.filter((_, i) => selectedWorkExp.includes(i)),
      org_experience: importedProfile.org_experience.filter((_, i) => selectedOrgExp.includes(i)),
      projects: importedProfile.projects.filter((_, i) => selectedProjects.includes(i)),
      publications: importedProfile.publications.filter((_, i) => selectedPublications.includes(i)),
      certificates: importedProfile.certificates.filter((_, i) => selectedCertificates.includes(i)),
      skills: importedProfile.skills || []
    };
    onMerge(dataToMerge);
  };

  const SelectableCard = ({ title, subtitle, isSelected, onToggle, children }) => (
    <label className={`
      relative block cursor-pointer rounded-2xl border p-5 transition-all overflow-hidden
      ${isSelected ? 'bg-brand-900/20 border-brand-500' : 'bg-dark-900 border-dark-700 hover:border-dark-500'}
    `}>
      <input 
        type="checkbox" 
        className="sr-only" 
        checked={isSelected} 
        onChange={onToggle} 
      />
      <div className="flex items-start gap-4">
        <div className={`
          shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors mt-0.5
          ${isSelected ? 'bg-brand-500 text-white' : 'border border-dark-600 bg-dark-800'}
        `}>
          {isSelected && <Check size={14} strokeWidth={3} />}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-display font-medium text-white mb-1 truncate">{title}</h5>
          {subtitle && <p className="text-sm text-gray-400 mb-2 truncate">{subtitle}</p>}
          <div className="text-sm text-gray-300 font-light mt-2 line-clamp-2">
            {children}
          </div>
        </div>
      </div>
    </label>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto pb-24"
    >
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 shadow-xl mb-6">
          <Layers className="text-brand-400 w-8 h-8" />
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Review Imported Data</h2>
        <p className="text-gray-400 font-light">Select the items you want to merge into your Master Profile. Your existing items will be preserved safely.</p>
      </div>

      <div className="space-y-10">
        
        {importedProfile.basic_info && (importedProfile.basic_info.name || importedProfile.basic_info.email) && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4 flex justify-between items-center">
              <span>Basic Information</span>
              <span className="text-xs bg-dark-800 px-2 py-1 rounded text-gray-400">Will be updated</span>
            </h4>
            <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="text-gray-500 text-sm block">Name</span> <span className="text-white">{importedProfile.basic_info.name}</span></div>
                <div><span className="text-gray-500 text-sm block">Email</span> <span className="text-white">{importedProfile.basic_info.email}</span></div>
                {importedProfile.basic_info.location && <div><span className="text-gray-500 text-sm block">Location</span> <span className="text-white">{importedProfile.basic_info.location}</span></div>}
              </div>
            </div>
          </div>
        )}

        {importedProfile.skills && importedProfile.skills.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4 flex justify-between items-center">
              <span>Skills</span>
              <span className="text-xs bg-dark-800 px-2 py-1 rounded text-gray-400">Will be merged</span>
            </h4>
            <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
              <div className="flex flex-wrap gap-2">
                {importedProfile.skills.map((skill, idx) => (
                  <span key={idx} className="bg-dark-800 border border-dark-700 text-gray-300 px-3 py-1 rounded-lg text-sm">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {importedProfile.education?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Education ({importedProfile.education.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {importedProfile.education.map((edu, idx) => (
                <SelectableCard key={idx} title={edu.institution} subtitle={`${edu.degree} (${edu.duration})`} isSelected={selectedEducation.includes(idx)} onToggle={() => toggleSelection(setSelectedEducation, selectedEducation, idx)}>
                  {edu.description}
                </SelectableCard>
              ))}
            </div>
          </div>
        )}

        {importedProfile.work_experience?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Work Experience ({importedProfile.work_experience.length})</h4>
            <div className="grid grid-cols-1 gap-4">
              {importedProfile.work_experience.map((exp, idx) => (
                <SelectableCard key={idx} title={exp.title} subtitle={`${exp.company} • ${exp.duration}`} isSelected={selectedWorkExp.includes(idx)} onToggle={() => toggleSelection(setSelectedWorkExp, selectedWorkExp, idx)}>
                  {exp.description}
                </SelectableCard>
              ))}
            </div>
          </div>
        )}

        {importedProfile.org_experience?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Organization Experience ({importedProfile.org_experience.length})</h4>
            <div className="grid grid-cols-1 gap-4">
              {importedProfile.org_experience.map((org, idx) => (
                <SelectableCard key={idx} title={org.role} subtitle={`${org.organization} • ${org.duration}`} isSelected={selectedOrgExp.includes(idx)} onToggle={() => toggleSelection(setSelectedOrgExp, selectedOrgExp, idx)}>
                  {org.description}
                </SelectableCard>
              ))}
            </div>
          </div>
        )}

        {importedProfile.projects?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Projects ({importedProfile.projects.length})</h4>
            <div className="grid grid-cols-1 gap-4">
              {importedProfile.projects.map((proj, idx) => (
                <SelectableCard key={idx} title={proj.name} isSelected={selectedProjects.includes(idx)} onToggle={() => toggleSelection(setSelectedProjects, selectedProjects, idx)}>
                  {proj.description}
                </SelectableCard>
              ))}
            </div>
          </div>
        )}

        {importedProfile.publications?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Publications ({importedProfile.publications.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {importedProfile.publications.map((pub, idx) => (
                <SelectableCard key={idx} title={pub.title} subtitle={`${pub.publisher} • ${pub.date}`} isSelected={selectedPublications.includes(idx)} onToggle={() => toggleSelection(setSelectedPublications, selectedPublications, idx)} />
              ))}
            </div>
          </div>
        )}

        {importedProfile.certificates?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Certificates ({importedProfile.certificates.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {importedProfile.certificates.map((cert, idx) => (
                <SelectableCard key={idx} title={cert.name} subtitle={`${cert.issuer} • ${cert.date}`} isSelected={selectedCertificates.includes(idx)} onToggle={() => toggleSelection(setSelectedCertificates, selectedCertificates, idx)} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-dark-900/80 backdrop-blur-xl border-t border-dark-700 z-50 flex justify-center">
        <div className="w-full max-w-4xl flex justify-between items-center px-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-gray-300 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X size={18} /> Cancel Import
          </button>
          <button 
            type="button" 
            onClick={handleMerge}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg shadow-brand-500/25"
          >
            <Combine size={18} /> Merge Selected to Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ImportReviewer;
