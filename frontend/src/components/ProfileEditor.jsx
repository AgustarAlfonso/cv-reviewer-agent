import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Plus, Trash2, ChevronDown } from 'lucide-react';

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

  const Section = ({ title, children, onAdd, addLabel }) => {
    return (
      <details className="group border border-dark-700 bg-dark-800/50 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden" open>
        <summary className="flex items-center justify-between p-6 cursor-pointer select-none">
          <div className="flex items-center gap-4">
            <ChevronDown className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" />
            <h3 className="text-xl font-display font-medium text-white">{title}</h3>
          </div>
          {onAdd && (
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); onAdd(); }}
              className="flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-brand-300 bg-brand-900/20 px-4 py-2 rounded-full transition-colors"
            >
              <Plus size={16} /> {addLabel}
            </button>
          )}
        </summary>
        <div className="p-6 pt-0 border-t border-dark-700/50 flex flex-col gap-6">
          {children}
        </div>
      </details>
    );
  };

  const ArrayItemCard = ({ onRemove, children }) => (
    <div className="relative bg-dark-900/50 border border-dark-700 rounded-xl p-6 group/card hover:border-dark-600 transition-colors">
      <button 
        type="button" 
        onClick={onRemove}
        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-950/30 rounded-full transition-colors opacity-0 group-hover/card:opacity-100 focus:opacity-100"
      >
        <Trash2 size={18} />
      </button>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6 pb-24">
      {/* Sticky Action Bar */}
      <div className="sticky top-6 z-40 bg-dark-800/90 backdrop-blur-xl border border-dark-700 rounded-2xl p-4 flex justify-between items-center shadow-2xl">
        <h2 className="text-xl font-display font-medium text-white ml-2">Edit Profile</h2>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-gray-300 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <X size={18} /> Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-full font-medium transition-colors"
          >
            {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information">
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
          <ArrayItemCard key={index} onRemove={() => removeArrayItem('education', index)}>
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
          <ArrayItemCard key={index} onRemove={() => removeArrayItem('work_experience', index)}>
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
          <ArrayItemCard key={index} onRemove={() => removeArrayItem('org_experience', index)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Role" value={org.role} onChange={(e) => handleArrayChange('org_experience', index, 'role', e.target.value)} required />
              <Input label="Organization" value={org.organization} onChange={(e) => handleArrayChange('org_experience', index, 'organization', e.target.value)} required />
              <div className="md:col-span-2">
                <Input label="Duration" value={org.duration} onChange={(e) => handleArrayChange('org_experience', index, 'duration', e.target.value)} placeholder="e.g. 2021 - 2022" />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Description" value={org.description} onChange={(e) => handleArrayChange('org_experience', index, 'description', e.target.value)} required />
              </div>
            </div>
          </ArrayItemCard>
        ))}
        {profile.org_experience.length === 0 && <p className="text-gray-500 italic">No organization experiences added yet.</p>}
      </Section>

      {/* Projects */}
      <Section title="Projects" onAdd={() => addArrayItem('projects', { name: '', description: '', technologies: [], link: '', repo: '' })} addLabel="Add Project">
        {profile.projects.map((proj, index) => (
          <ArrayItemCard key={index} onRemove={() => removeArrayItem('projects', index)}>
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
                <Textarea label="Description" value={proj.description} onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)} required />
              </div>
            </div>
          </ArrayItemCard>
        ))}
        {profile.projects.length === 0 && <p className="text-gray-500 italic">No projects added yet.</p>}
      </Section>

      {/* Publications */}
      <Section title="Publications" onAdd={() => addArrayItem('publications', { title: '', publisher: '', date: '', link: '', description: '' })} addLabel="Add Publication">
        {profile.publications.map((pub, index) => (
          <ArrayItemCard key={index} onRemove={() => removeArrayItem('publications', index)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Title" value={pub.title} onChange={(e) => handleArrayChange('publications', index, 'title', e.target.value)} required />
              <Input label="Publisher/Journal" value={pub.publisher} onChange={(e) => handleArrayChange('publications', index, 'publisher', e.target.value)} required />
              <Input label="Date" value={pub.date} onChange={(e) => handleArrayChange('publications', index, 'date', e.target.value)} placeholder="e.g. 2023" />
              <Input label="Link (Optional)" type="url" value={pub.link} onChange={(e) => handleArrayChange('publications', index, 'link', e.target.value)} />
              <div className="md:col-span-2">
                <Textarea label="Description (Optional)" value={pub.description} onChange={(e) => handleArrayChange('publications', index, 'description', e.target.value)} />
              </div>
            </div>
          </ArrayItemCard>
        ))}
        {profile.publications.length === 0 && <p className="text-gray-500 italic">No publications added yet.</p>}
      </Section>

      {/* Certificates */}
      <Section title="Certificates" onAdd={() => addArrayItem('certificates', { name: '', issuer: '', date: '', link: '', skills: [] })} addLabel="Add Certificate">
        {profile.certificates.map((cert, index) => (
          <ArrayItemCard key={index} onRemove={() => removeArrayItem('certificates', index)}>
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

    </form>
  );
};

export default ProfileEditor;
