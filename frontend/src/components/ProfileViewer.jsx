import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, MapPin, Mail, Phone, Globe, Briefcase, GraduationCap, Award, BookOpen, Code, Users, Sparkles } from 'lucide-react';

const GithubIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.18-.34 6.52-1.6 6.52-7.09a5.5 5.5 0 0 0-1.5-3.8 5.4 5.4 0 0 0-.15-3.8s-1.2-.38-3.9 1.44a13.9 13.9 0 0 0-7 0c-2.7-1.82-3.9-1.44-3.9-1.44a5.4 5.4 0 0 0-.15 3.8 5.5 5.5 0 0 0-1.5 3.8c0 5.49 3.34 6.75 6.52 7.09a4.8 4.8 0 0 0-1 3.03v4"></path>
    <path d="M9 20c-5 1.5-5-2.5-7-3"></path>
  </svg>
);

const LinkedinIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

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

  const renderBullets = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 1 && !lines[0].trim().startsWith('-') && !lines[0].trim().startsWith('•')) {
      return <p className="text-gray-400 font-light leading-relaxed mt-4">{text}</p>;
    }
    return (
      <ul className="mt-4 space-y-2">
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
          return (
            <li key={idx} className="flex gap-3 text-gray-300 font-light">
              <span className="text-brand-500 mt-1 shrink-0">•</span>
              <span className="leading-relaxed">{cleanLine}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  const SectionHeader = ({ title, icon: Icon }) => (
    <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3 border-b border-dark-700 pb-4">
      <Icon size={20} className="text-brand-400" />
      {title}
    </h3>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-12 pb-12">
      
      {/* Basic Info Hero Card */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl border border-dark-700 bg-dark-800/50 p-8 md:p-12 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{basic_info.name || 'Anonymous User'}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
              {basic_info.location && <span className="flex items-center gap-1.5"><MapPin size={16} /> {basic_info.location}</span>}
              {basic_info.email && <span className="flex items-center gap-1.5"><Mail size={16} /> {basic_info.email}</span>}
              {basic_info.phone && <span className="flex items-center gap-1.5"><Phone size={16} /> {basic_info.phone}</span>}
            </div>
          </div>
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 bg-white text-dark-900 px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors shrink-0"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-8 relative z-10">
          {basic_info.github && (
            <a href={basic_info.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-dark-900 border border-dark-600 rounded-full text-sm hover:border-brand-500 hover:text-brand-400 transition-colors">
              <GithubIcon size={16} /> GitHub
            </a>
          )}
          {basic_info.linkedin && (
            <a href={basic_info.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-dark-900 border border-dark-600 rounded-full text-sm hover:border-brand-500 hover:text-brand-400 transition-colors">
              <LinkedinIcon size={16} /> LinkedIn
            </a>
          )}
          {basic_info.portfolio && (
            <a href={basic_info.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-dark-900 border border-dark-600 rounded-full text-sm hover:border-brand-500 hover:text-brand-400 transition-colors">
              <Globe size={16} /> Portfolio
            </a>
          )}
        </div>

        {basic_info.summary && (
          <div className="relative z-10 border-t border-dark-700/50 pt-8">
            <p className="text-gray-300 font-light leading-relaxed text-lg max-w-4xl">{basic_info.summary}</p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-12">
          {/* Work Experience */}
          <motion.div variants={itemVariants}>
            <SectionHeader title="Work Experience" icon={Briefcase} />
            {work_experience.length === 0 ? (
              <p className="text-gray-500 italic">No work experiences added.</p>
            ) : (
              <div className="space-y-8">
                {work_experience.map((exp, idx) => (
                  <div key={idx} className="group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2 mb-2">
                      <h4 className="text-xl font-display text-white font-medium group-hover:text-brand-400 transition-colors">{exp.title}</h4>
                      <span className="text-sm font-mono text-gray-500 bg-dark-800 px-3 py-1 rounded-md">{exp.duration}</span>
                    </div>
                    <p className="text-brand-300 font-medium mb-4">{exp.company}</p>
                    {renderBullets(exp.description)}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Education */}
          <motion.div variants={itemVariants}>
            <SectionHeader title="Education" icon={GraduationCap} />
            {education.length === 0 ? (
              <p className="text-gray-500 italic">No education added.</p>
            ) : (
              <div className="space-y-8">
                {education.map((edu, idx) => (
                  <div key={idx} className="group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2 mb-2">
                      <h4 className="text-xl font-display text-white font-medium group-hover:text-brand-400 transition-colors">{edu.institution}</h4>
                      <span className="text-sm font-mono text-gray-500 bg-dark-800 px-3 py-1 rounded-md">{edu.duration}</span>
                    </div>
                    <p className="text-brand-300 font-medium mb-4">{edu.degree}</p>
                    {renderBullets(edu.description)}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Projects */}
          <motion.div variants={itemVariants}>
            <SectionHeader title="Projects" icon={Code} />
            {projects.length === 0 ? (
              <p className="text-gray-500 italic">No projects added.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {projects.map((proj, idx) => (
                  <div key={idx} className="bg-dark-800/30 border border-dark-700 p-6 rounded-2xl hover:border-brand-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-display text-white font-medium">{proj.name}</h4>
                      <div className="flex gap-2">
                        {proj.repo && <a href={proj.repo} target="_blank" rel="noreferrer" className="p-2 bg-dark-900 rounded-full hover:text-brand-400 transition-colors"><GithubIcon size={16} /></a>}
                        {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="p-2 bg-dark-900 rounded-full hover:text-brand-400 transition-colors"><Globe size={16} /></a>}
                      </div>
                    </div>
                    <div className="mb-6">{renderBullets(proj.description)}</div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {proj.technologies.map((tech, i) => (
                          <span key={i} className="text-xs font-medium px-2.5 py-1 bg-dark-900 border border-dark-600 rounded-md text-gray-300">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          
          {/* Organization Experience */}
          <motion.div variants={itemVariants}>
            <SectionHeader title="Organizations" icon={Users} />
            {org_experience.length === 0 ? (
              <p className="text-gray-500 italic">No organization experiences added.</p>
            ) : (
              <div className="space-y-8">
                {org_experience.map((org, idx) => (
                  <div key={idx} className="group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2 mb-2">
                      <h4 className="text-xl font-display text-white font-medium group-hover:text-brand-400 transition-colors">{org.role}</h4>
                      <span className="text-sm font-mono text-gray-500 bg-dark-800 px-3 py-1 rounded-md">{org.duration}</span>
                    </div>
                    <p className="text-brand-300 font-medium mb-4">{org.organization}</p>
                    {renderBullets(org.description)}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-12">
          {/* Skills */}
          <motion.div variants={itemVariants}>
            <SectionHeader title="Skills" icon={Sparkles} />
            {(!profile.skills || profile.skills.length === 0) ? (
              <p className="text-gray-500 italic">No skills added.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-dark-800 border border-dark-700 hover:border-brand-500 rounded-lg text-sm text-gray-200 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Certificates */}
          <motion.div variants={itemVariants}>
            <SectionHeader title="Certifications" icon={Award} />
            {certificates.length === 0 ? (
              <p className="text-gray-500 italic">No certificates added.</p>
            ) : (
              <div className="space-y-6">
                {certificates.map((cert, idx) => (
                  <div key={idx} className="border-l-2 border-dark-600 pl-4 hover:border-brand-500 transition-colors">
                    <h5 className="text-white font-medium mb-1 flex items-center gap-2">
                      {cert.name}
                      {cert.link && <a href={cert.link} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-brand-400"><Globe size={14} /></a>}
                    </h5>
                    <p className="text-sm text-gray-400 mb-2">{cert.issuer} • {cert.date}</p>
                    {cert.skills && cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cert.skills.map((skill, i) => (
                          <span key={i} className="text-xs bg-dark-800 text-gray-400 px-2 py-0.5 rounded">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Publications */}
          <motion.div variants={itemVariants}>
            <SectionHeader title="Publications" icon={BookOpen} />
            {publications.length === 0 ? (
              <p className="text-gray-500 italic">No publications added.</p>
            ) : (
              <div className="space-y-6">
                {publications.map((pub, idx) => (
                  <div key={idx} className="border-l-2 border-dark-600 pl-4 hover:border-brand-500 transition-colors">
                    <h5 className="text-white font-medium mb-1 flex items-center gap-2">
                      {pub.title}
                      {pub.link && <a href={pub.link} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-brand-400"><Globe size={14} /></a>}
                    </h5>
                    <p className="text-sm text-gray-400 mb-2">{pub.publisher} • {pub.date}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};

export default ProfileViewer;
