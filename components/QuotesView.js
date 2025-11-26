import React, { useState } from 'react';
import { Plus, Printer, Trash2, Edit, Check, X, FileText, Calendar } from 'lucide-react';
import { t } from '../utils/i18n.js';

export const QuotesView = ({ quotes, language, onUpdate, onDelete, onCreate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Helper to calculate total
  const calculateTotal = (items) => (items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const calculateTax = (items) => (items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate/100)), 0);

  const handleCreateNew = () => {
      const newQuote = {
          id: Date.now().toString(),
          reference: `Q-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
          status: 'DRAFT',
          date: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
          company: {
              name: '',
              address: '',
              city: '',
              zip: '',
              country: '',
              email: '',
              phone: '',
              siret: ''
          },
          client: {
              name: '',
              address: { street: '', city: '', zip: '', country: '' }
          },
          items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 20 }],
          terms: { paymentTerms: '30% deposit', notes: '' }
      };
      setCurrentQuote(newQuote);
      setIsEditing(true);
      setPreviewMode(false);
  };

  const handleSave = () => {
      if (!currentQuote) return;
      if (quotes.find(q => q.id === currentQuote.id)) {
          onUpdate(currentQuote);
      } else {
          onCreate(currentQuote);
      }
      setIsEditing(false);
      setCurrentQuote(null);
  };

  const addItem = () => {
      if (!currentQuote) return;
      setCurrentQuote({
          ...currentQuote,
          items: [...(currentQuote.items || []), { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, taxRate: 20 }]
      });
  };

  const removeItem = (id) => {
      if (!currentQuote) return;
      setCurrentQuote({
          ...currentQuote,
          items: currentQuote.items.filter(i => i.id !== id)
      });
  };

  const handlePrint = () => {
      window.print();
  };

  // --- RENDER PREVIEW / EDIT MODE ---
  if (isEditing && currentQuote) {
      const subtotal = calculateTotal(currentQuote.items);
      const tax = calculateTax(currentQuote.items);
      const total = subtotal + tax;

      return (
          <div className="p-6 h-full overflow-y-auto bg-slate-100 print:bg-white print:p-0">
             {/* Toolbar - Hidden in Print */}
             <div className="flex justify-between items-center mb-6 print:hidden max-w-5xl mx-auto">
                 <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1">
                     <X size={20} /> {t('cancel', language)}
                 </button>
                 <div className="flex gap-2">
                     <button onClick={() => setPreviewMode(!previewMode)} className="px-4 py-2 text-indigo-600 bg-white border border-indigo-100 rounded-lg font-medium shadow-sm">
                         {previewMode ? t('edit', language) : t('preview', language)}
                     </button>
                     {previewMode && (
                        <button onClick={handlePrint} className="px-4 py-2 bg-slate-800 text-white rounded-lg flex items-center gap-2 shadow-lg hover:bg-slate-900 transition">
                             <Printer size={18} /> {t('print', language)}
                        </button>
                     )}
                     {!previewMode && (
                        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition">
                             <Check size={18} /> {t('saveTemplate', language)}
                        </button>
                     )}
                 </div>
             </div>

             {/* Quote Document A4-like */}
             <div className="bg-white max-w-[210mm] mx-auto shadow-xl print:shadow-none print:max-w-none min-h-[297mm] flex flex-col relative">
                 {/* Top Band Decoration */}
                 <div className="h-2 w-full bg-indigo-600 print:bg-indigo-600"></div>

                 {/* Header Section */}
                 <div className="p-8 md:p-12 pb-6">
                     <div className="flex justify-between items-start">
                         <div className="flex items-start gap-4">
                             {/* Logo Placeholder */}
                             {currentQuote.company.logo ? (
                                 <img src={currentQuote.company.logo} alt="Logo" className="h-20 w-auto object-contain" />
                             ) : (
                                <div className="h-16 w-16 bg-slate-100 rounded flex items-center justify-center text-slate-300 font-bold">LOGO</div>
                             )}
                             
                             <div className="text-sm text-slate-600">
                                 <p className="font-bold text-slate-900 text-lg">{currentQuote.company.name || 'Company Name'}</p>
                                 <p>{currentQuote.company.address}</p>
                                 <p>{currentQuote.company.zip} {currentQuote.company.city}</p>
                                 <p>{currentQuote.company.email}</p>
                                 <p>{currentQuote.company.phone}</p>
                             </div>
                         </div>
                         <div className="text-right">
                             <h1 className="text-4xl font-bold text-slate-900 tracking-tight">DEVIS</h1>
                             <p className="text-indigo-600 font-mono text-xl mt-1">{currentQuote.reference}</p>
                             <div className="mt-4 text-sm text-slate-500 space-y-1">
                                 <p><span className="font-medium text-slate-700">{t('date', language)}:</span> {currentQuote.date}</p>
                                 <p><span className="font-medium text-slate-700">{t('validUntil', language)}:</span> {currentQuote.validUntil}</p>
                             </div>
                         </div>
                     </div>
                 </div>

                 <hr className="mx-12 border-slate-100" />

                 {/* Client Info Section */}
                 <div className="p-8 md:p-12 grid grid-cols-2 gap-12">
                     {/* Quote Specifics */}
                     <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Details</h3>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 flex items-center gap-2"><Calendar size={14}/> {t('startDate', language)}</span>
                                {previewMode ? (
                                    <span className="font-medium text-slate-900">{currentQuote.startDate || '-'}</span>
                                ) : (
                                    <input type="date" value={currentQuote.startDate || ''} onChange={e => setCurrentQuote({...currentQuote, startDate: e.target.value})} className="bg-white border rounded px-2 py-1" />
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">{t('duration', language)}</span>
                                {previewMode ? (
                                    <span className="font-medium text-slate-900">{currentQuote.duration || '-'}</span>
                                ) : (
                                    <input value={currentQuote.duration || ''} onChange={e => setCurrentQuote({...currentQuote, duration: e.target.value})} className="bg-white border rounded px-2 py-1 w-24" placeholder="e.g 2 weeks" />
                                )}
                            </div>
                        </div>
                     </div>

                     {/* Client Address */}
                     <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                         <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">{t('clientInfo', language)}</h3>
                         {previewMode ? (
                             <div className="text-sm text-slate-700 space-y-1">
                                 <p className="font-bold text-slate-900 text-lg">{currentQuote.client.name || 'Client Name'}</p>
                                 <p>{currentQuote.client.address.street || 'Address'}</p>
                                 <p>{currentQuote.client.address.zip} {currentQuote.client.address.city} {currentQuote.client.address.country}</p>
                             </div>
                         ) : (
                             <div className="space-y-2">
                                 <input 
                                     placeholder="Client Name / Company"
                                     className="w-full p-2 border border-indigo-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                     value={currentQuote.client.name}
                                     onChange={(e) => setCurrentQuote({...currentQuote, client: {...currentQuote.client, name: e.target.value}})}
                                 />
                                 <input 
                                     placeholder="Street Address"
                                     className="w-full p-2 border border-indigo-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                     value={currentQuote.client.address.street}
                                     onChange={(e) => setCurrentQuote({...currentQuote, client: {...currentQuote.client, address: {...currentQuote.client.address, street: e.target.value}}})}
                                 />
                                 <div className="flex gap-2">
                                     <input 
                                         placeholder="Zip"
                                         className="w-24 p-2 border border-indigo-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                         value={currentQuote.client.address.zip}
                                         onChange={(e) => setCurrentQuote({...currentQuote, client: {...currentQuote.client, address: {...currentQuote.client.address, zip: e.target.value}}})}
                                     />
                                     <input 
                                         placeholder="City"
                                         className="w-full p-2 border border-indigo-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                         value={currentQuote.client.address.city}
                                         onChange={(e) => setCurrentQuote({...currentQuote, client: {...currentQuote.client, address: {...currentQuote.client.address, city: e.target.value}}})}
                                     />
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>

                 {/* Items Table */}
                 <div className="px-8 md:px-12 flex-1">
                     <table className="w-full text-sm">
                         <thead>
                             <tr className="border-b-2 border-slate-900 text-left text-slate-900 uppercase tracking-wide text-xs">
                                 <th className="py-3 font-bold w-1/2">{t('description', language)}</th>
                                 <th className="py-3 font-bold text-center">{t('qty', language)}</th>
                                 <th className="py-3 font-bold text-right">{t('price', language)}</th>
                                 <th className="py-3 font-bold text-right">{t('total', language)}</th>
                                 {!previewMode && <th className="w-10"></th>}
                             </tr>
                         </thead>
                         <tbody className="text-slate-700">
                             {(currentQuote.items || []).map((item) => (
                                 <tr key={item.id} className="border-b border-slate-100 group">
                                     <td className="py-4 align-top">
                                         {previewMode ? (
                                             <span className="font-medium text-slate-800">{item.description}</span>
                                         ) : (
                                             <textarea 
                                                className="w-full p-1 border rounded resize-none"
                                                rows={2}
                                                value={item.description}
                                                onChange={(e) => {
                                                    const newItems = currentQuote.items.map(i => i.id === item.id ? {...i, description: e.target.value} : i);
                                                    setCurrentQuote({...currentQuote, items: newItems});
                                                }}
                                             />
                                         )}
                                     </td>
                                     <td className="py-4 text-center align-top">
                                         {previewMode ? item.quantity : (
                                             <input 
                                                type="number"
                                                className="w-16 p-1 border rounded text-center"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const newItems = currentQuote.items.map(i => i.id === item.id ? {...i, quantity: parseInt(e.target.value)} : i);
                                                    setCurrentQuote({...currentQuote, items: newItems});
                                                }}
                                             />
                                         )}
                                     </td>
                                     <td className="py-4 text-right align-top">
                                         {previewMode ? `€${item.unitPrice.toFixed(2)}` : (
                                             <input 
                                                type="number"
                                                className="w-24 p-1 border rounded text-right ml-auto"
                                                value={item.unitPrice}
                                                onChange={(e) => {
                                                    const newItems = currentQuote.items.map(i => i.id === item.id ? {...i, unitPrice: parseFloat(e.target.value)} : i);
                                                    setCurrentQuote({...currentQuote, items: newItems});
                                                }}
                                             />
                                         )}
                                     </td>
                                     <td className="py-4 text-right font-medium align-top">€{(item.quantity * item.unitPrice).toFixed(2)}</td>
                                     {!previewMode && (
                                         <td className="text-center align-top pt-4">
                                             <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-500 transition"><Trash2 size={16}/></button>
                                         </td>
                                     )}
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                     {!previewMode && (
                         <button onClick={addItem} className="mt-4 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 hover:bg-indigo-100 transition">
                             <Plus size={16} /> {t('items', language)}
                         </button>
                     )}
                 </div>

                 {/* Totals Section */}
                 <div className="px-8 md:px-12 py-8 flex justify-end">
                     <div className="w-72 bg-slate-50 p-6 rounded-lg border border-slate-100">
                         <div className="flex justify-between text-slate-500 text-sm mb-2">
                             <span>{t('subtotal', language)}</span>
                             <span className="font-medium">€{subtotal.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between text-slate-500 text-sm mb-4">
                             <span>{t('vat', language)}</span>
                             <span className="font-medium">€{tax.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between text-slate-900 font-bold text-xl pt-4 border-t border-slate-200">
                             <span>{t('totalTTC', language)}</span>
                             <span>€{total.toFixed(2)}</span>
                         </div>
                     </div>
                 </div>

                 {/* Footer Terms & Legal */}
                 <div className="mt-auto">
                     <div className="px-8 md:px-12 pb-8 flex gap-8">
                        <div className="flex-1 text-sm text-slate-600">
                            <p className="font-bold mb-2">{t('terms', language)}</p>
                            <p className="mb-2"><span className="font-medium text-slate-800">{t('paymentTerms', language)}:</span> {currentQuote.terms.paymentTerms}</p>
                            <p className="italic text-slate-500">{currentQuote.terms.notes}</p>
                        </div>
                        <div className="w-1/3 border-l-2 border-slate-100 pl-8">
                             <p className="font-bold text-sm text-slate-900 mb-8">{t('bonPourAccord', language)}</p>
                             <div className="h-16 border border-dashed border-slate-300 rounded bg-slate-50/50 mb-2"></div>
                             <p className="text-xs text-slate-400 text-right">Date & Signature</p>
                        </div>
                     </div>

                     {/* Legal Footer Band */}
                     <div className="bg-slate-900 text-slate-400 text-[10px] p-4 text-center">
                         <p>{currentQuote.company.name} • {currentQuote.company.legalForm} au capital de {currentQuote.company.capital}</p>
                         <p>{t('legalFooter', language)} {currentQuote.company.siret} • TVA: {currentQuote.company.vatNumber}</p>
                     </div>
                 </div>
             </div>
          </div>
      );
  }

  // --- LIST VIEW ---
  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      <header className="mb-8 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">{t('quotesTitle', language)}</h2>
        <button onClick={handleCreateNew} className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
            <Plus size={20} />
            {t('newQuote', language)}
        </button>
      </header>

      {quotes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
            <FileText className="mx-auto text-slate-300 mb-4" size={64} />
            <h3 className="text-xl font-medium text-slate-700">{t('noQuotes', language)}</h3>
            <p className="text-slate-400 mt-2 max-w-sm mx-auto">Use the button above or ask Elsi: "Create a quote for Client X"</p>
          </div>
      ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                      <tr>
                          <th className="p-4 font-medium">{t('quoteReference', language)}</th>
                          <th className="p-4 font-medium">{t('client', language)}</th>
                          <th className="p-4 font-medium hidden md:table-cell">{t('date', language)}</th>
                          <th className="p-4 font-medium hidden md:table-cell">{t('status', language)}</th>
                          <th className="p-4 font-medium text-right">{t('amount', language)}</th>
                          <th className="p-4 font-medium text-right">{t('actions', language)}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {quotes.map(quote => (
                          <tr key={quote.id} className="hover:bg-indigo-50/30 transition">
                              <td className="p-4 font-mono text-indigo-600 font-medium">{quote.reference}</td>
                              <td className="p-4 font-medium text-slate-800">{quote.client.name || 'Untitled Client'}</td>
                              <td className="p-4 text-slate-500 text-sm hidden md:table-cell">{quote.date}</td>
                              <td className="p-4 hidden md:table-cell">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                      quote.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-600' :
                                      quote.status === 'SENT' ? 'bg-blue-100 text-blue-600' :
                                      'bg-slate-100 text-slate-500'
                                  }`}>
                                      {quote.status}
                                  </span>
                              </td>
                              <td className="p-4 text-right font-bold text-slate-700">
                                  €{(calculateTotal(quote.items) + calculateTax(quote.items)).toFixed(2)}
                              </td>
                              <td className="p-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => { setCurrentQuote(quote); setIsEditing(true); setPreviewMode(true); }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                        title={t('preview', language)}
                                    >
                                        <FileText size={18} />
                                    </button>
                                    <button 
                                        onClick={() => { setCurrentQuote(quote); setIsEditing(true); setPreviewMode(false); }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                        title={t('edit', language)}
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(quote.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                        title={t('delete', language)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}
    </div>
  );
};