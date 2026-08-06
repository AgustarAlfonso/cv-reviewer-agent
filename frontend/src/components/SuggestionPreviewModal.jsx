import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Zap, Loader2 } from 'lucide-react';
import { downloadCVFromJson, downloadCVPdfFromJson } from '../services/api';

/**
 * Modal overlay that displays a "Before vs After" preview of a CV
 * after applying a suggestion fix.
 *
 * Shows section-by-section comparison highlighting what changed,
 * with download options for the improved CV.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {string} props.suggestion - The suggestion text that was applied.
 * @param {Object|null} props.originalCV - The StructuredCV before the fix (optional).
 * @param {Object} props.fixedCV - The StructuredCV after the fix.
 */
const SuggestionPreviewModal = ({ isOpen, onClose, suggestion, originalCV, fixedCV }) => {
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!isOpen || !fixedCV) return null;

  /**
   * Downloads the fixed CV as DOCX with loading feedback.
   */
  const handleDownloadDocx = async () => {
    if (downloadingDocx) return;
    setDownloadingDocx(true);
    try {
      await downloadCVFromJson(fixedCV);
    } catch (error) {
      alert(error.message || 'Failed to download DOCX.');
    } finally {
      setDownloadingDocx(false);
    }
  };

  /**
   * Downloads the fixed CV as PDF with loading feedback.
   */
  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      await downloadCVPdfFromJson(fixedCV);
    } catch (error) {
      alert(error.message || 'Failed to download PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  /**
   * Compares two string values and returns whether they differ.
   * @param {string} a - Before value.
   * @param {string} b - After value.
   * @returns {boolean}
   */
  const isDifferent = (a, b) => {
    if (!a && !b) return false;
    return (a || '').trim() !== (b || '').trim();
  };

  /**
   * Renders a comparison row for a single text field.
   * Only shown if the values differ between before and after.
   */
  const ComparisonRow = ({ label, before, after }) => {
    if (!isDifferent(before, after)) return null;
    return (
      <div className="border border-dark-600 rounded-xl overflow-hidden">
        <div className="px-4 py-2 bg-dark-700/50 text-xs font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dark-600">
          {before != null && (
            <div className="p-4">
              <span className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2 block">Before</span>
              <p className="text-gray-400 text-sm font-light leading-relaxed whitespace-pre-wrap">{before}</p>
            </div>
          )}
          <div className="p-4">
            <span className="text-xs font-medium text-green-400 uppercase tracking-wider mb-2 block">
              {before != null ? 'After' : 'New'}
            </span>
            <p className="text-gray-200 text-sm font-light leading-relaxed whitespace-pre-wrap">{after}</p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Compares bullet lists and returns a row if different.
   */
  const BulletComparisonRow = ({ label, beforeBullets, afterBullets }) => {
    const beforeStr = (beforeBullets || []).join('\n');
    const afterStr = (afterBullets || []).join('\n');
    if (!isDifferent(beforeStr, afterStr)) return null;
    return (
      <div className="border border-dark-600 rounded-xl overflow-hidden">
        <div className="px-4 py-2 bg-dark-700/50 text-xs font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dark-600">
          {beforeBullets && beforeBullets.length > 0 && (
            <div className="p-4">
              <span className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2 block">Before</span>
              <ul className="space-y-1">
                {beforeBullets.map((b, i) => (
                  <li key={i} className="text-gray-400 text-sm font-light flex gap-2">
                    <span className="text-gray-500 shrink-0">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="p-4">
            <span className={`text-xs font-medium uppercase tracking-wider mb-2 block ${afterBullets && afterBullets.length > 0 ? 'text-green-400' : 'text-gray-500'}`}>
              {beforeBullets && beforeBullets.length > 0 ? (afterBullets && afterBullets.length > 0 ? 'After' : 'Deleted') : 'New'}
            </span>
            <ul className="space-y-1">
              {(afterBullets || []).map((b, i) => (
                <li key={i} className="text-gray-200 text-sm font-light flex gap-2">
                  <span className="text-green-400 shrink-0">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  /** Build the list of changes by comparing originalCV and fixedCV section by section. */
  const buildChanges = () => {
    const changes = [];

    // Summary
    changes.push(
      <ComparisonRow
        key="summary"
        label="Professional Summary"
        before={originalCV?.summary}
        after={fixedCV.summary}
      />
    );

    // Header fields
    const headerFields = ['name', 'headline', 'location', 'phone', 'email', 'portfolio', 'linkedin', 'github'];
    headerFields.forEach(field => {
      if (isDifferent(originalCV?.header?.[field], fixedCV.header?.[field])) {
        changes.push(
          <ComparisonRow
            key={`header-${field}`}
            label={`Header: ${field.charAt(0).toUpperCase() + field.slice(1)}`}
            before={originalCV?.header?.[field]}
            after={fixedCV.header?.[field]}
          />
        );
      }
    });

    // Skills comparison
    const beforeSkills = (originalCV?.skills || []).map(s => `${s.category}: ${s.items}`).join('\n');
    const afterSkills = (fixedCV.skills || []).map(s => `${s.category}: ${s.items}`).join('\n');
    if (isDifferent(beforeSkills, afterSkills)) {
      changes.push(
        <ComparisonRow
          key="skills"
          label="Skills"
          before={beforeSkills || undefined}
          after={afterSkills}
        />
      );
    }

    // Experience
    const fixedExp = fixedCV.experience || [];
    const origExp = originalCV?.experience || [];
    const matchedOrigExpIndices = new Set();

    fixedExp.forEach((exp, i) => {
      const origIndex = origExp.findIndex(o => o.role === exp.role && o.company === exp.company);
      let orig = null;
      if (origIndex !== -1) {
        orig = origExp[origIndex];
        matchedOrigExpIndices.add(origIndex);
      }

      const row = (
        <BulletComparisonRow
          key={`exp-fixed-${i}`}
          label={`Experience: ${exp.role} @ ${exp.company}`}
          beforeBullets={orig?.bullets}
          afterBullets={exp.bullets}
        />
      );
      if (row) changes.push(row);
    });

    origExp.forEach((orig, i) => {
      if (!matchedOrigExpIndices.has(i)) {
        const row = (
          <BulletComparisonRow
            key={`exp-orig-${i}`}
            label={`Experience: ${orig.role} @ ${orig.company}`}
            beforeBullets={orig.bullets}
            afterBullets={null}
          />
        );
        if (row) changes.push(row);
      }
    });

    // Projects
    const fixedProj = fixedCV.projects || [];
    const origProj = originalCV?.projects || [];
    const matchedOrigProjIndices = new Set();

    fixedProj.forEach((proj, i) => {
      const origIndex = origProj.findIndex(o => o.name === proj.name);
      let orig = null;
      if (origIndex !== -1) {
        orig = origProj[origIndex];
        matchedOrigProjIndices.add(origIndex);
      }

      const row = (
        <BulletComparisonRow
          key={`proj-fixed-${i}`}
          label={`Project: ${proj.name}`}
          beforeBullets={orig?.bullets}
          afterBullets={proj.bullets}
        />
      );
      if (row) changes.push(row);
    });

    origProj.forEach((orig, i) => {
      if (!matchedOrigProjIndices.has(i)) {
        const row = (
          <BulletComparisonRow
            key={`proj-orig-${i}`}
            label={`Project: ${orig.name}`}
            beforeBullets={orig.bullets}
            afterBullets={null}
          />
        );
        if (row) changes.push(row);
      }
    });

    // Certifications
    const beforeCerts = (originalCV?.certifications || []).map(c => `${c.name} — ${c.issuer}`).join('\n');
    const afterCerts = (fixedCV.certifications || []).map(c => `${c.name} — ${c.issuer}`).join('\n');
    if (isDifferent(beforeCerts, afterCerts)) {
      changes.push(
        <ComparisonRow
          key="certs"
          label="Certifications"
          before={beforeCerts || undefined}
          after={afterCerts}
        />
      );
    }

    // Education
    const formatEdu = (edu) => `${edu.institution} | ${edu.degree} | ${edu.duration} | ${edu.gpa}`;
    const beforeEdu = (originalCV?.education || []).map(formatEdu).join('\n\n');
    const afterEdu = (fixedCV.education || []).map(formatEdu).join('\n\n');
    if (isDifferent(beforeEdu, afterEdu)) {
      changes.push(
        <ComparisonRow
          key="education"
          label="Education"
          before={beforeEdu || undefined}
          after={afterEdu}
        />
      );
    }

    // Publications
    const beforePubs = (originalCV?.publications || []).map(p => p.citation).join('\n\n');
    const afterPubs = (fixedCV.publications || []).map(p => p.citation).join('\n\n');
    if (isDifferent(beforePubs, afterPubs)) {
      changes.push(
        <ComparisonRow
          key="pubs"
          label="Publications"
          before={beforePubs || undefined}
          after={afterPubs}
        />
      );
    }

    // Languages & Other Skills
    const beforeLang = originalCV?.languages_other;
    const afterLang = fixedCV.languages_other;
    if (isDifferent(beforeLang?.languages, afterLang?.languages)) {
      changes.push(
        <ComparisonRow
          key="lang"
          label="Languages"
          before={beforeLang?.languages || undefined}
          after={afterLang?.languages}
        />
      );
    }
    if (isDifferent(beforeLang?.other_skills, afterLang?.other_skills)) {
      changes.push(
        <ComparisonRow
          key="other_skills"
          label="Other Skills"
          before={beforeLang?.other_skills || undefined}
          after={afterLang?.other_skills}
        />
      );
    }

    // Filter out null entries (from components that returned null when unchanged)
    return changes.filter(Boolean);
  };

  const changeList = buildChanges();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-4xl max-h-[85vh] bg-dark-800 border border-dark-600 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-dark-600 flex items-start justify-between gap-4 shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-brand-400 mb-2">
                  <Zap size={16} />
                  <span className="text-xs font-semibold uppercase tracking-widest">Suggestion Applied</span>
                </div>
                <p className="text-gray-300 text-sm font-light leading-relaxed line-clamp-3">
                  &ldquo;{suggestion}&rdquo;
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-dark-700 text-gray-400 hover:text-white transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body: Changes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              {changeList.length > 0 ? (
                <>
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                    {changeList.length} section{changeList.length !== 1 ? 's' : ''} changed
                  </p>
                  {changeList}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-2">No visible differences detected.</p>
                  <p className="text-gray-500 text-sm">The fix may have applied subtle changes. You can still download the updated CV.</p>
                </div>
              )}
            </div>

            {/* Footer: Actions — relative z-10 ensures it stays above scrollable body */}
            <div className="relative z-10 p-6 border-t border-dark-600 bg-dark-800 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDownloadDocx}
                disabled={downloadingDocx}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-dark-700 text-gray-200 hover:bg-dark-600 hover:text-white transition-colors border border-dark-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingDocx ? (
                  <><Loader2 size={16} className="animate-spin" /> Downloading...</>
                ) : (
                  <><FileText size={16} /> Download DOCX</>
                )}
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-brand-600 text-white hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingPdf ? (
                  <><Loader2 size={16} className="animate-spin" /> Downloading...</>
                ) : (
                  <><Download size={16} /> Download PDF</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuggestionPreviewModal;
