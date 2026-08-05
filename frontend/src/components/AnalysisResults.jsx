import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Sparkles, TrendingUp, Key, ListChecks } from 'lucide-react';

const AnalysisResults = ({ result }) => {
  if (!result) return null;

  const { ats_score, missing_keywords, section_feedback, suggestions, profile_recommendations } = result;

  // Determine score details
  let scoreColor = 'text-red-500';
  let bgGlow = 'bg-red-500/10';
  let Icon = XCircle;
  let scoreMessage = "Significant updates needed to pass ATS filters.";
  
  if (ats_score >= 75) {
    scoreColor = 'text-green-400';
    bgGlow = 'bg-green-400/10';
    Icon = CheckCircle;
    scoreMessage = "Great job! Your CV is well-optimized for this role.";
  } else if (ats_score >= 50) {
    scoreColor = 'text-yellow-400';
    bgGlow = 'bg-yellow-400/10';
    Icon = AlertTriangle;
    scoreMessage = "Good effort, but there's room for improvement.";
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min"
    >
      {/* SCORE CARD (Bento Span 1) */}
      <motion.div variants={itemVariants} className={`col-span-1 md:col-span-1 rounded-3xl border border-dark-700 bg-dark-800/80 p-8 flex flex-col justify-between relative overflow-hidden group`}>
        <div className={`absolute -right-10 -top-10 w-40 h-40 blur-3xl rounded-full ${bgGlow} transition-opacity duration-700 opacity-50 group-hover:opacity-100`} />
        <div>
          <div className="flex items-center gap-3 text-gray-400 mb-8">
            <TrendingUp size={20} />
            <h3 className="text-sm font-semibold uppercase tracking-widest">ATS Score</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-7xl font-display font-bold ${scoreColor} tracking-tighter`}>{ats_score}</span>
            <span className="text-2xl text-gray-500 font-medium">/ 100</span>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-dark-700/50">
          <p className="text-gray-300 font-light flex gap-3 items-start">
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${scoreColor}`} />
            <span>{scoreMessage}</span>
          </p>
        </div>
      </motion.div>

      {/* MISSING KEYWORDS (Bento Span 2) */}
      {missing_keywords && missing_keywords.length > 0 && (
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 rounded-3xl border border-dark-700 bg-dark-800/80 p-8 flex flex-col group">
          <div className="flex items-center gap-3 text-gray-400 mb-6">
            <Key size={20} />
            <h3 className="text-sm font-semibold uppercase tracking-widest">Missing Keywords</h3>
          </div>
          <p className="text-gray-400 text-sm mb-6 max-w-md">Incorporate these naturally into your CV to align with the job description.</p>
          <div className="flex flex-wrap gap-2.5 mt-auto">
            {missing_keywords.map((keyword, index) => (
              <span 
                key={index} 
                className="px-4 py-2 bg-dark-900 border border-dark-600 rounded-full text-gray-200 text-sm font-medium hover:border-brand-500 hover:text-white transition-colors cursor-default"
              >
                {keyword}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* SECTION FEEDBACK (Bento Span Full) */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-3 rounded-3xl border border-dark-700 bg-dark-800/80 p-8">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-3">
          <ListChecks size={20} />
          Section Feedback
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-dark-700">
          <div className="pt-6 md:pt-0">
            <h4 className="text-white font-display text-xl mb-3">Summary</h4>
            <p className="text-gray-400 font-light leading-relaxed">{section_feedback?.summary || "No feedback provided."}</p>
          </div>
          <div className="pt-6 md:pt-0 md:pl-12">
            <h4 className="text-white font-display text-xl mb-3">Experience</h4>
            <p className="text-gray-400 font-light leading-relaxed">{section_feedback?.experience || "No feedback provided."}</p>
          </div>
          <div className="pt-6 md:pt-0 md:pl-12">
            <h4 className="text-white font-display text-xl mb-3">Skills</h4>
            <p className="text-gray-400 font-light leading-relaxed">{section_feedback?.skills || "No feedback provided."}</p>
          </div>
        </div>
      </motion.div>

      {/* SUGGESTIONS (Bento Span 1 or 2 depending on if Profile Recs exist) */}
      {suggestions && suggestions.length > 0 && (
        <motion.div variants={itemVariants} className={`rounded-3xl border border-dark-700 bg-dark-800/80 p-8 ${profile_recommendations?.length > 0 ? 'col-span-1 md:col-span-1' : 'col-span-1 md:col-span-3'}`}>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6">Actionable Steps</h3>
          <ul className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex gap-3 text-gray-300 font-light">
                <span className="text-brand-500 mt-1 shrink-0">•</span>
                <span className="leading-relaxed">{suggestion}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* MASTER PROFILE RECS (Bento Span 2) */}
      {profile_recommendations && profile_recommendations.length > 0 && (
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 rounded-3xl border border-brand-500/30 bg-brand-900/10 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={120} />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-3 relative z-10">
            <Sparkles size={20} />
            Master Profile Match
          </h3>
          <p className="text-gray-400 text-sm mb-6 relative z-10 max-w-md">We found these gems in your Master Profile that perfectly match the job requirements.</p>
          <ul className="space-y-4 relative z-10">
            {profile_recommendations.map((rec, index) => (
              <li key={index} className="flex gap-3 text-gray-200 bg-dark-900/50 p-4 rounded-xl border border-brand-500/20 backdrop-blur-sm">
                <span className="text-brand-400 shrink-0 mt-0.5">↳</span>
                <span className="font-light leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnalysisResults;
