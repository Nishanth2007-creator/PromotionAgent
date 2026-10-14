import React from 'react';
import { 
  FileText, 
  Sparkles, 
  Mail, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Award, 
  Users 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Template } from '../../types';

export const TemplatesView: React.FC = () => {
  const { templates, loadTemplateIntoStudio } = useApp();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Event Promotion Templates</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated, high-conversion frameworks tailored for college hackathons, technical symposiums, and workshops.
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                  {tpl.category}
                </span>
                <span className="text-xs text-slate-500 font-medium capitalize">
                  Default: <strong>{tpl.defaultTone}</strong>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {tpl.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {tpl.description}
              </p>

              {/* Sample snippet preview */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Subject: {tpl.sampleEmailSubject}</span>
                </div>
                <p className="text-slate-500 text-[11px] line-clamp-3 font-mono leading-relaxed">
                  {tpl.sampleEmailBody}
                </p>
              </div>
            </div>

            <button
              onClick={() => loadTemplateIntoStudio(tpl)}
              className="w-full py-2.5 px-4 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Customize in AI Message Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
