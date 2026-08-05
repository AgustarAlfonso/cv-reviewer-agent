import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePreview, downloadCVFromJson, downloadCVPdfFromJson } from '../services/api';
import { FileText, Wand2, CheckCircle2, AlertCircle, ArrowLeft, Download } from 'lucide-react';

function CVGenerator() {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleGeneratePreview = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const data = await generatePreview(jobDescription, language);
      setPreviewData(data);
    } catch (err) {
      setError(err.message || 'An error occurred while generating the CV preview.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!previewData) return;
    setIsDownloading(true);
    setError(null);
    
    try {
      await downloadCVFromJson(previewData);
      setSuccessMessage('CV DOCX generated and downloaded successfully!');
    } catch (err) {
      setError(err.message || 'An error occurred while downloading the CV.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewData) return;
    setIsDownloadingPdf(true);
    setError(null);
    
    try {
      await downloadCVPdfFromJson(previewData);
      setSuccessMessage('CV PDF generated and downloaded successfully!');
    } catch (err) {
      setError(err.message || 'An error occurred while downloading the CV PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative overflow-hidden rounded-[2.5rem] border border-dark-700 bg-dark-800/80 p-8 md:p-14"
      >
        {/* Decorative Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-600/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-dark-900 border border-dark-700 rounded-full flex items-center justify-center mb-8 shadow-2xl">
            <Wand2 className="w-10 h-10 text-brand-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">AI CV Generator</h2>
          <p className="text-gray-400 font-light text-lg max-w-2xl">
            {previewData 
              ? "Review your tailored CV before downloading."
              : "Our AI will intelligently parse your Master Profile and weave the most impactful experiences together to perfectly match the target role."}
          </p>
        </div>

        <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-950/50 border border-red-900/50 text-red-200 px-6 py-4 rounded-2xl flex items-center gap-4"
              >
                <AlertCircle className="shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-950/50 border border-green-900/50 text-green-200 px-6 py-4 rounded-2xl flex items-center gap-4"
              >
                <CheckCircle2 className="shrink-0" />
                <p className="text-sm font-medium">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!previewData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <label htmlFor="job-description" className="block text-sm font-semibold uppercase tracking-widest text-gray-400 pl-2">
                  Target Job Description
                </label>
                <textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description here..."
                  rows={6}
                  className="w-full bg-dark-900/50 border border-dark-700 rounded-3xl p-6 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-none text-lg font-light leading-relaxed"
                />
              </div>

              <div className="space-y-4">
                <label htmlFor="language-select" className="block text-sm font-semibold uppercase tracking-widest text-gray-400 pl-2">
                  CV Language
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-dark-900/50 border border-dark-700 rounded-3xl p-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-lg font-light cursor-pointer appearance-none"
                >
                  <option value="English">English</option>
                  <option value="Indonesian">Bahasa Indonesia</option>
                </select>
              </div>

              <div className="pt-4 flex justify-center">
                <button 
                  onClick={handleGeneratePreview} 
                  disabled={isLoading}
                  className="relative overflow-hidden group bg-white text-dark-900 hover:bg-gray-100 rounded-full py-4 px-10 font-semibold text-lg flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                      Weaving your CV...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Generate Preview
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-dark-900/60 border border-dark-700 rounded-3xl p-6 text-gray-300 max-h-[500px] overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center border-b border-dark-700 pb-4">
                    <h3 className="text-2xl font-bold text-white">{previewData.header?.name}</h3>
                    <p className="text-brand-400 font-medium">{previewData.header?.headline}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {previewData.header?.location} • {previewData.header?.phone} • {previewData.header?.email}
                    </p>
                  </div>
                  
                  {/* Summary */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2 uppercase tracking-wide text-sm border-b border-dark-700 pb-1">Professional Summary</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{previewData.summary}</p>
                  </div>

                  {/* Skills */}
                  {previewData.skills && previewData.skills.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2 uppercase tracking-wide text-sm border-b border-dark-700 pb-1">Skills</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        {previewData.skills.map((skill, idx) => (
                          <li key={idx}><strong>{skill.category}:</strong> {skill.items}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Experience */}
                  {previewData.experience && previewData.experience.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2 uppercase tracking-wide text-sm border-b border-dark-700 pb-1">Experience</h4>
                      <div className="space-y-4">
                        {previewData.experience.map((exp, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-semibold text-gray-200">{exp.role}</h5>
                              <span className="text-xs text-gray-500">{exp.duration}</span>
                            </div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm text-brand-400">{exp.company}</span>
                              <span className="text-xs text-gray-500">{exp.location}</span>
                            </div>
                            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
                              {exp.bullets.map((bullet, bIdx) => (
                                <li key={bIdx}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {previewData.projects && previewData.projects.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2 uppercase tracking-wide text-sm border-b border-dark-700 pb-1">Projects</h4>
                      <div className="space-y-4">
                        {previewData.projects.map((proj, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-semibold text-gray-200">{proj.name}</h5>
                            </div>
                            <div className="text-sm text-brand-400 mb-2">{proj.technologies}</div>
                            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
                              {proj.bullets.map((bullet, bIdx) => (
                                <li key={bIdx}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {previewData.education && previewData.education.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2 uppercase tracking-wide text-sm border-b border-dark-700 pb-1">Education</h4>
                      <div className="space-y-4">
                        {previewData.education.map((edu, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-semibold text-gray-200">{edu.degree}</h5>
                              <span className="text-xs text-gray-500">{edu.duration}</span>
                            </div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm text-brand-400">{edu.institution}</span>
                              <span className="text-xs text-gray-500">{edu.gpa}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Publications */}
                  {previewData.publications && previewData.publications.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2 uppercase tracking-wide text-sm border-b border-dark-700 pb-1">Publications</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-400 space-y-2">
                        {previewData.publications.map((pub, idx) => (
                          <li key={idx}>{pub.citation}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Certifications */}
                  {previewData.certifications && previewData.certifications.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2 uppercase tracking-wide text-sm border-b border-dark-700 pb-1">Certifications</h4>
                      <div className="space-y-3">
                        {previewData.certifications.map((cert, idx) => (
                          <div key={idx} className="flex justify-between items-start">
                            <span className="text-sm font-semibold text-gray-200">{cert.name}</span>
                            <span className="text-xs text-brand-400">{cert.issuer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages & Other Skills */}
                  {previewData.languages_other && (previewData.languages_other.languages || previewData.languages_other.other_skills) && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2 uppercase tracking-wide text-sm border-b border-dark-700 pb-1">Languages & Other</h4>
                      <div className="text-sm text-gray-400 space-y-1">
                        {previewData.languages_other.languages && (
                          <p><strong>Languages:</strong> {previewData.languages_other.languages}</p>
                        )}
                        {previewData.languages_other.other_skills && (
                          <p><strong>Other Skills:</strong> {previewData.languages_other.other_skills}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* End Preview Content */}
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-2">
                <button 
                  onClick={() => setPreviewData(null)} 
                  className="relative overflow-hidden group bg-transparent border border-dark-600 text-gray-300 hover:text-white hover:bg-dark-700 rounded-full py-3 px-8 font-semibold text-base flex items-center gap-3 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Edit
                </button>
                <button 
                  onClick={handleDownloadPdf} 
                  disabled={isDownloadingPdf || isDownloading}
                  className="relative overflow-hidden group bg-brand-600 text-white hover:bg-brand-500 rounded-full py-3 px-8 font-semibold text-base flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
                >
                  {isDownloadingPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download PDF
                    </>
                  )}
                </button>
                <button 
                  onClick={handleDownload} 
                  disabled={isDownloading || isDownloadingPdf}
                  className="relative overflow-hidden group bg-brand-600 text-white hover:bg-brand-500 rounded-full py-3 px-8 font-semibold text-base flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download DOCX
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}

export default CVGenerator;
