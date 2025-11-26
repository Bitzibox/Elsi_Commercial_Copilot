import React, { useState } from 'react';
import { ArtifactType } from '../types.js';
import { FileText, FileCheck, Table, Plus, Play } from 'lucide-react';
import { t } from '../utils/i18n.js';
import { generateArtifact } from '../services/geminiService.js';

export const DocumentsView = ({ 
  artifacts, templates, language, onGenerate, onAddTemplate, switchToChat 
}) => {
  const [activeTab, setActiveTab] = useState('generated');
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', prompt: '' });
  const [loadingId, setLoadingId] = useState(null);

  const handleCreateTemplate = () => {
    onAddTemplate({
      id: Date.now().toString(),
      name: newTemplate.name,
      description: 'Custom Template',
      prompt: newTemplate.prompt
    });
    setIsCreating(false);
    setNewTemplate({ name: '', prompt: '' });
  };

  const handleRunTemplate = async (template) => {
    setLoadingId(template.id);
    const artifact = await generateArtifact(template.prompt, ArtifactType.REPORT, language);
    onGenerate(artifact);
    setLoadingId(null);
    setActiveTab('generated');
  };

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      <header className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">{t('documentsTitle', language)}</h2>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('generated')}
          className={`pb-2 px-1 font-medium text-sm transition ${activeTab === 'generated' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
        >
          {t('generatedFiles', language)}
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          className={`pb-2 px-1 font-medium text-sm transition ${activeTab === 'templates' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
        >
          {t('templates', language)}
        </button>
      </div>

      {activeTab === 'generated' && (
        <>
          {artifacts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
                <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500">{t('noDocs', language)}</p>
                <button onClick={switchToChat} className="mt-4 px-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition">
                    {t('goToChat', language)}
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artifacts.map((art, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                {art.type === ArtifactType.QUOTE ? <FileCheck size={24}/> : <Table size={24}/>}
                            </div>
                            <span className="text-xs font-mono text-slate-400 uppercase">{art.type}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2 truncate">{art.title}</h3>
                        <pre className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded h-24 overflow-hidden">
                          {JSON.stringify(art.data, null, 2)}
                        </pre>
                    </div>
                ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add New Card */}
              <div 
                onClick={() => setIsCreating(true)}
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition min-h-[200px]"
              >
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-indigo-600">
                    <Plus size={24} />
                  </div>
                  <span className="font-semibold text-slate-600">{t('createTemplate', language)}</span>
              </div>

              {templates.map((tpl) => (
                <div key={tpl.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                   <h3 className="font-bold text-slate-800 mb-1">{tpl.name}</h3>
                   <p className="text-sm text-slate-500 mb-4 line-clamp-2">{tpl.prompt}</p>
                   <button 
                     onClick={() => handleRunTemplate(tpl)}
                     disabled={loadingId === tpl.id}
                     className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition"
                   >
                     {loadingId === tpl.id ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/> : <Play size={16}/>}
                     {t('generate', language)}
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Modal for Creating Template */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-4">{t('newReportTemplate', language)}</h3>
              <input 
                className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t('templateName', language)}
                value={newTemplate.name}
                onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
              />
              <textarea 
                className="w-full p-3 mb-4 border rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder={t('describeStructure', language)}
                value={newTemplate.prompt}
                onChange={e => setNewTemplate({...newTemplate, prompt: e.target.value})}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">{t('cancel', language)}</button>
                <button onClick={handleCreateTemplate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{t('saveTemplate', language)}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};