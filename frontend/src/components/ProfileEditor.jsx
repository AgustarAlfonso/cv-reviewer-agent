import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Plus, Trash2, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-semibold uppercase tracking-widest text-gray-400 pl-1">{label}</label>
    <input 
      className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-dark-600"
      {...props} 
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-semibold uppercase tracking-widest text-gray-400 pl-1">{label}</label>
    <textarea 
      className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-y min-h-[100px] placeholder-dark-600"
      {...props} 
    />
  </div>
);

const Section = ({ title, children, onAdd, addLabel, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!isOpen) setIsOpen(true);
    setIsAdding(true);
    setTimeout(() => {
      onAdd();
      setIsAdding(false);
    }, 200);
  };

  return (
    <details 
      className="group border border-dark-700 bg-dark-800/50 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden" 
      open={isOpen}
      onToggle={(e) => setIsOpen(e.target.open)}
    >
      <summary className="flex items-center justify-between p-6 cursor-pointer select-none">
        <div className="flex items-center gap-4">
          <ChevronDown className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" />
          <h3 className="text-xl font-display font-medium text-white">{title}</h3>
        </div>
        {onAdd && (
          <button 
            type="button" 
            onClick={handleAdd}
            disabled={isAdding}
            className="flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-brand-300 bg-brand-900/20 hover:bg-brand-900/40 px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100 disabled:cursor-wait"
          >
            {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {addLabel}
          </button>
        )}
      </summary>
      <div className="p-6 pt-0 border-t border-dark-700/50 flex flex-col gap-6">
        {children}
      </div>
    </details>
  );
};

const ArrayItemCard = ({ onRemove, children, autoFocus }) => {
  const cardRef = React.useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  React.useEffect(() => {
    if (autoFocus && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [autoFocus]);

  return (
    <>
      <motion.div 
        ref={cardRef}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative bg-dark-900/50 border border-dark-700 rounded-xl p-6 group/card hover:border-dark-600 transition-colors"
      >
        <button 
          type="button" 
          onClick={() => setShowDeleteModal(true)}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-950/30 rounded-full transition-colors opacity-0 group-hover/card:opacity-100 focus:opacity-100"
        >
          <Trash2 size={18} />
        </button>
        <div className="flex flex-col gap-4">
          {children}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-dark-800 border border-dark-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-950/30 text-red-500 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-display font-medium text-white mb-2">Hapus Bagian Ini?</h3>
            <p className="text-gray-400 text-sm mb-6">Apakah Anda yakin ingin menghapus bagian ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 w-full">
              <button 
                type="button" 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl font-medium text-gray-300 bg-dark-700 hover:bg-dark-600 transition-colors"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowDeleteModal(false);
                  onRemove();
                }}
                className="flex-1 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

const ProfileEditor = ({ initialProfile, onSave, onCancel, isSaving }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [justAdded, setJustAdded] = useState(null);

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

  const handleArrayChange = (field, index, key, value) => {
    const newArray = [...profile[field]];
    newArray[index][key] = value;
    setProfile({ ...profile, [field]: newArray });
  };

  const addArrayItem = (field, emptyItem) => {
    const newIndex = profile[field].length;
    setProfile({ ...profile, [field]: [...profile[field], emptyItem] });
    setJustAdded({ field, index: newIndex });
  };

  const removeArrayItem = (field, index) => {
    const newArray = [...profile[field]];
    newArray.splice(index, 1);
    setProfile({ ...profile, [field]: newArray });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const profileToSave = { ...profile };
    
    if (profileToSave.skillsString !== undefined) {
      profileToSave.skills = profileToSave.skillsString.split(',').map(s => s.trim()).filter(s => s);
      delete profileToSave.skillsString;
    }

    if (profileToSave.projects) {
      profileToSave.projects = profileToSave.projects.map(proj => {
        const p = { ...proj };
        if (p.technologiesString !== undefined) {
          p.technologies = p.technologiesString.split(',').map(t => t.trim()).filter(t => t);
          delete p.technologiesString;
        }
        return p;
      });
    }

    if (profileToSave.certificates) {
      profileToSave.certificates = profileToSave.certificates.map(cert => {
        const c = { ...cert };
        if (c.skillsString !== undefined) {
          c.skills = c.skillsString.split(',').map(s => s.trim()).filter(s => s);
          delete c.skillsString;
        }
        return c;
      });
    }

    onSave(profileToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6 pb-24">
      {/* Basic Info */}
      <Section title="Basic Information" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Name" name="name" value={profile.basic_info.name} onChange={handleBasicInfoChange} placeholder="John Doe" required />
          <Input label="Email" type="email" name="email" value={profile.basic_info.email} onChange={handleBasicInfoChange} placeholder="john@example.com" />
          <Input label="Phone" name="phone" value={profile.basic_info.phone} onChange={handleBasicInfoChange} placeholder="+1 234 567 890" />
          <Input label="Location" name="location" value={profile.basic_info.location || ''} onChange={handleBasicInfoChange} placeholder="City, Country" />
          <Input label="GitHub (Optional)" type="url" name="github" value={profile.basic_info.github || ''} onChange={handleBasicInfoChange} placeholder="https://github.com/..." />
          <Input label="LinkedIn (Optional)" type="url" name="linkedin" value={profile.basic_info.linkedin || ''} onChange={handleBasicInfoChange} placeholder="https://linkedin.com/in/..." />
          <div className="md:col-span-2">
            <Input label="Portfolio (Optional)" type="url" name="portfolio" value={profile.basic_info.portfolio || ''} onChange={handleBasicInfoChange} placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <Textarea label="Professional Summary" name="summary" value={profile.basic_info.summary} onChange={handleBasicInfoChange} placeholder="A brief summary of your career..." />
          </div>
        </div>
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <Textarea 
          label="Your Skills (Comma separated)" 
          value={profile.skillsString !== undefined ? profile.skillsString : (profile.skills || []).join(', ')} 
          onChange={(e) => setProfile({ ...profile, skillsString: e.target.value })} 
          placeholder="React.js, JavaScript, Python, Communication..." 
        />
      </Section>

      {/* Education */}
      <Section title="Education" onAdd={() => addArrayItem('education', { institution: '', degree: '', duration: '', description: '' })} addLabel="Add Education">
        {profile.education.map((edu, index) => (
          <ArrayItemCard key={index} onRemove={() => removeArrayItem('education', index)} autoFocus={justAdded?.field === 'education' && justAdded?.index === index}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Institution" value={edu.institution} onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)} required />
              <Input label="Degree" value={edu.degree} onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)} required />
              <div className="md:col-span-2">
                <Input label="Duration" value={edu.duration} onChange={(e) => handleArrayChange('education', index, 'duration', e.target.value)} placeholder="e.g. 2018 - 2022" />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Description (Optional)" value={edu.description} onChange={(e) => handleArrayChange('education', index, 'description', e.target.value)} placeholder="- Graduated with Honors" />
              </div>
            </div>
          </ArrayItemCard>
        ))}
        {profile.education.length === 0 && <p className="text-gray-500 italic">No education added yet.</p>}
      </Section>

      {/* Work Experience */}
      <Section title="Work Experience" onAdd={() => addArrayItem('work_experience', { title: '', company: '', duration: '', description: '' })} addLabel="Add Experience">
        {profile.work_experience.map((exp, index) => (
          <ArrayItemCard key={index} onRemove={() => removeArrayItem('work_experience', index)} autoFocus={justAdded?.field === 'work_experience' && justAdded?.index === index}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Job Title" value={exp.title} onChange={(e) => handleArrayChange('work_experience', index, 'title', e.target.value)} required />
              <Input label="Company" value={exp.company} onChange={(e) => handleArrayChange('work_experience', index, 'company', e.target.value)} required />
              <div className="md:col-span-2">
                <Input label="Duration" value={exp.duration} onChange={(e) => handleArrayChange('work_experience', index, 'duration', e.target.value)} placeholder="e.g. Jan 2020 - Present" />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Responsibilities & Achievements" value={exp.description} onChange={(e) => handleArrayChange('work_experience', index, 'description', e.target.value)} placeholder="- Led a team of 5 engineers&#10;- Increased revenue by 20%" required />
              </div>
            </div>
          </ArrayItemCard>
        ))}
        {profile.work_experience.length === 0 && <p className="text-gray-500 italic">No work experiences added yet.</p>}
      </Section>

      {/* Organization Experience */}
      <Section title="Organization Experience" onAdd={() => addArrayItem('org_experience', { role: '', organization: '', duration: '', description: '' })} addLabel="Add Org Exp">
        {profile.org_experience.map((org, index) => (
          <ArrayItemCard key={index} onRemove={() => removeArrayItem('org_experience', index)} autoFocus={justAdded?.field === 'org_experience' && justAdded?.index === index}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Role" value={org.role} onChange={(e) => handleArrayChange('org_experience', index, 'role', e.target.value)} required />
              <Input label="Organization" value={org.organization} onChange={(e) => handleArrayChange('org_experience', index, 'organization', e.target.value)} required />
              <div className="md:col-span-2">
                <Input label="Duration" value={org.duration} onChange={(e) => handleArrayChange('org_experience', index, 'duration', e.target.value)} placeholder="e.g. 2021 - 2022" />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Description" value={org.description} onChange={(e) => handleArrayChange('org_experience', index, 'description', e.target.value)} placeholder="- Organized annual tech conference&#10;- Managed a team of 10 volunteers" required />
              </div>
            </div>
          </ArrayItemCard>
        ))}
        {profile.org_experience.length === 0 && <p className="text-gray-500 italic">No organization experiences added yet.</p>}
      </Section>

      {/* Projects */}
      <Section title="Projects" onAdd={() => addArrayItem('projects', { name: '', description: '', technologies: [], link: '', repo: '' })} addLabel="Add Project">
        {profile.projects.map((proj, index) => (
          <ArrayItemCard key={index} onRemove={() => removeArrayItem('projects', index)} autoFocus={justAdded?.field === 'projects' && justAdded?.index === index}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="Project Name" value={proj.name} onChange={(e) => handleArrayChange('projects', index, 'name', e.target.value)} required />
              </div>
              <Input label="Demo Link (Optional)" type="url" value={proj.link} onChange={(e) => handleArrayChange('projects', index, 'link', e.target.value)} />
              <Input label="Repository (Optional)" type="url" value={proj.repo} onChange={(e) => handleArrayChange('projects', index, 'repo', e.target.value)} />
              <div className="md:col-span-2">
                <Input label="Technologies (Comma separated)" value={proj.technologiesString !== undefined ? proj.technologiesString : (proj.technologies || []).join(', ')} onChange={(e) => handleArrayChange('projects', index, 'technologiesString', e.target.value)} placeholder="React, Node.js" />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Description" value={proj.description} onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)} placeholder="- Developed a full-stack web application&#10;- Integrated third-party payment gateway" required />
              </div>
            </div>
          </ArrayItemCard>
        ))}
        {profile.projects.length === 0 && <p className="text-gray-500 italic">No projects added yet.</p>}
      </Section>

      {/* Publications */}
      <Section title="Publications" onAdd={() => addArrayItem('publications', { title: '', publisher: '', date: '', link: '', description: '' })} addLabel="Add Publication">
        {profile.publications.map((pub, index) => (
          <ArrayItemCard key={index} onRemove={() => removeArrayItem('publications', index)} autoFocus={justAdded?.field === 'publications' && justAdded?.index === index}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Title" value={pub.title} onChange={(e) => handleArrayChange('publications', index, 'title', e.target.value)} required />
              <Input label="Publisher/Journal" value={pub.publisher} onChange={(e) => handleArrayChange('publications', index, 'publisher', e.target.value)} required />
              <Input label="Date" value={pub.date} onChange={(e) => handleArrayChange('publications', index, 'date', e.target.value)} placeholder="e.g. 2023" />
              <Input label="Link (Optional)" type="url" value={pub.link} onChange={(e) => handleArrayChange('publications', index, 'link', e.target.value)} />
              <div className="md:col-span-2">
                <Textarea label="Description (Optional)" value={pub.description} onChange={(e) => handleArrayChange('publications', index, 'description', e.target.value)} placeholder="A brief summary of the paper's topic..." />
              </div>
            </div>
          </ArrayItemCard>
        ))}
        {profile.publications.length === 0 && <p className="text-gray-500 italic">No publications added yet.</p>}
      </Section>

      {/* Certificates */}
      <Section title="Certificates" onAdd={() => addArrayItem('certificates', { name: '', issuer: '', date: '', link: '', skills: [] })} addLabel="Add Certificate">
        {profile.certificates.map((cert, index) => (
          <ArrayItemCard key={index} onRemove={() => removeArrayItem('certificates', index)} autoFocus={justAdded?.field === 'certificates' && justAdded?.index === index}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Certificate Name" value={cert.name} onChange={(e) => handleArrayChange('certificates', index, 'name', e.target.value)} required />
              <Input label="Issuer" value={cert.issuer} onChange={(e) => handleArrayChange('certificates', index, 'issuer', e.target.value)} required />
              <Input label="Date" value={cert.date} onChange={(e) => handleArrayChange('certificates', index, 'date', e.target.value)} placeholder="e.g. Aug 2023" />
              <Input label="Credential URL (Optional)" type="url" value={cert.link} onChange={(e) => handleArrayChange('certificates', index, 'link', e.target.value)} />
              <div className="md:col-span-2">
                <Input label="Skills/Technologies (Comma separated)" value={cert.skillsString !== undefined ? cert.skillsString : (cert.skills || []).join(', ')} onChange={(e) => handleArrayChange('certificates', index, 'skillsString', e.target.value)} placeholder="React, Prompt Engineering" />
              </div>
            </div>
          </ArrayItemCard>
        ))}
        {profile.certificates.length === 0 && <p className="text-gray-500 italic">No certificates added yet.</p>}
      </Section>

      {/* Sticky Action Bar (Bottom) */}
      <div className="sticky bottom-6 z-40 bg-dark-800/90 backdrop-blur-xl border border-dark-700 rounded-2xl p-4 flex justify-between items-center shadow-2xl mt-8">
        <h2 className="text-xl font-display font-medium text-white ml-2">Edit Profile</h2>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-gray-300 hover:text-white hover:bg-dark-700 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <X size={18} /> Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-full font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/30 disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span className="animate-pulse">Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileEditor;
