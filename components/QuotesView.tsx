
import React, { useState } from 'react';
import { Quote, Language, QuoteItem } from '../types';
import { Plus, Printer, Trash2, Edit, Check, X, FileText, Download } from 'lucide-react';
import { t } from '../utils/i18n';

interface QuotesViewProps {
  quotes: Quote[];
  language: Language;
  onUpdate: (quote: Quote) => void;
  onDelete: (id: string) => void;
  onCreate: (quote: Quote) => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({ quotes, language, onUpdate, onDelete, onCreate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Helper to calculate total
  const calculateTotal = (items: QuoteItem[]) => (items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const calculateTax = (items: QuoteItem[]) => (items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate/100)), 0);

  const handleCreateNew = () => {
      const newQuote: Quote = {
          id: Date.now().toString(),
          reference: `Q-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
          status: 'DRAFT',
          date: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
          company: {
              name: 'My SME Business',
              address: { street: '123 Business St', city: 'Paris', zip: '75001', country: 'France' },
              email: 'contact@mysme.com',
              phone: '+33 1 23 45 67 89',
              siret: '123 456 789 00012'
          },
          client: {
              name: '',
              address: { street: '', city: '', zip: '', country: '' }
          },
          items: [{ id: '1', description: 'Service A', quantity: 1, unitPrice: 0, taxRate: 20 }],
          terms: { paymentTerms: '30 days', notes: '' }
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

  const removeItem = (id: string) => {
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
          <div className="p-6 h-full overflow-y-auto bg-slate-50 print:bg-white print:p-0">
             {/* Toolbar - Hidden in Print */}
             <div className="flex justify-between items-center mb-6 print:hidden">
                 <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1">
                     <X size={20} /> {t('cancel', language)}
                 </button>
                 <div className="flex gap-2">
                     <button onClick={() => setPreviewMode(!previewMode)} className="px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg font-medium">
                         {previewMode ? t('edit', language) : t('preview', language)}
                     </button>
                     {previewMode && (
                        <button onClick={handlePrint} className="px-4 py-2 bg-slate-800 text-white rounded-lg flex items-center gap-2">
                             <Printer size={18} /> {t('print', language)}
                        </button>
                     )}
                     {!previewMode && (
                        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                             <Check size={18} /> {t('saveTemplate', language)}
                        </button>
                     )}
                 </div>
             </div>

             {/* Quote Document */}
             <div className="bg-white max-w-4xl mx-auto shadow-lg print:shadow-none rounded-xl overflow-hidden print:rounded-none">
                 {/* Header */}
                 <div className="p-8 md:p-12 border-b border-slate-100">
                     <div className="flex justify-between items-start">
                         <div>
                             <h1 className="text-3xl font-bold text-slate-900 mb-1">DEVIS</h1>
                             <p className="text-indigo-600 font-mono text-lg">{currentQuote.reference}</p>
                         </div>
                         <div className="text-right text-sm text-slate-500">
                             <p>{t('date', language)}: {currentQuote.date}</p>
                             <p>{t('validUntil', language)}: {currentQuote.validUntil}</p>
                         </div>
                     </div>
                 </div>

                 <div className="p-8 md:p-12 grid grid-cols-2 gap-12">
                     {/* Company Info */}
                     <div>
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('companyInfo', language)}</h3>
                         <div className="text-sm text-slate-700 space-y-1">
                             <p className="font-bold text-slate-900">{currentQuote.company.name}</p>
                             <p>{currentQuote.company.address.street}</p>
                             <p>{currentQuote.company.address.zip} {currentQuote.company.address.city}, {currentQuote.company.address.country}</p>
                             <p className="mt-2 text-slate-500">SIRET: {currentQuote.company.siret}</p>
                             <p className="text-slate-500">{currentQuote.company.email}</p>
                         </div>
                     </div>

                     {/* Client Info */}
                     <div>
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('clientInfo', language)}</h3>
                         {previewMode ? (
                             <div className="text-sm text-slate-700 space-y-1">
                                 <p className="font-bold text-slate-900">{currentQuote.client.name || 'Client Name'}</p>
                                 <p>{currentQuote.client.address.street || 'Address'}</p>
                                 <p>{currentQuote.client.address.zip} {currentQuote.client.address.city} {currentQuote.client.address.country}</p>
                             </div>
                         ) : (
                             <div className="space-y-2">
                                 <input 
                                     placeholder="Client Name"
                                     className="w-full p-2 border rounded text-sm"
                                     value={currentQuote.client.name}
                                     onChange={(e) => setCurrentQuote({...currentQuote, client: {...currentQuote.client, name: e.target.value}})}
                                 />
                                 <input 
                                     placeholder="Street"
                                     className="w-full p-2 border rounded text-sm"
                                     value={currentQuote.client.address.street}
                                     onChange={(e) => setCurrentQuote({...currentQuote, client: {...currentQuote.client, address: {...currentQuote.client.address, street: e.target.value}}})}
                                 />
                                 <div className="flex gap-2">
                                     <input 
                                         placeholder="City"
                                         className="w-full p-2 border rounded text-sm"
                                         value={currentQuote.client.address.city}
                                         onChange={(e) => setCurrentQuote({...currentQuote, client: {...currentQuote.client, address: {...currentQuote.client.address, city: e.target.value}}})}
                                     />
                                     <input 
                                         placeholder="Zip"
                                         className="w-24 p-2 border rounded text-sm"
                                         value={currentQuote.client.address.zip}
                                         onChange={(e) => setCurrentQuote({...currentQuote, client: {...currentQuote.client, address: {...currentQuote.client.address, zip: e.target.value}}})}
                                     />
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>

                 {/* Items Table */}
                 <div className="p-8 md:p-12">
                     <table className="w-full text-sm">
                         <thead>
                             <tr className="border-b border-slate-200 text-left text-slate-500">
                                 <th className="py-3 font-medium w-1/2">{t('description', language)}</th>
                                 <th className="py-3 font-medium text-center">{t('qty', language)}</th>
                                 <th className="py-3 font-medium text-right">{t('price', language)}</th>
                                 <th className="py-3 font-medium text-right">{t('total', language)}</th>
                                 {!previewMode && <th className="w-10"></th>}
                             </tr>
                         </thead>
                         <tbody className="text-slate-700">
                             {(currentQuote.items || []).map((item) => (
                                 <tr key={item.id} className="border-b border-slate-50">
                                     <td className="py-4">
                                         {previewMode ? item.description : (
                                             <input 
                                                className="w-full p-1 border rounded"
                                                value={item.description}
                                                onChange={(e) => {
                                                    const newItems = currentQuote.items.map(i => i.id === item.id ? {...i, description: e.target.value} : i);
                                                    setCurrentQuote({...currentQuote, items: newItems});
                                                }}
                                             />
                                         )}
                                     </td>
                                     <td className="py-4 text-center">
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
                                     <td className="py-4 text-right">
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
                                     <td className="py-4 text-right font-medium">€{(item.quantity * item.unitPrice).toFixed(2)}</td>
                                     {!previewMode && (
                                         <td className="text-center">
                                             <button onClick={() => removeItem(item.id)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16}/></button>
                                         </td>
                                     )}
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                     {!previewMode && (
                         <button onClick={addItem} className="mt-4 text-sm text-indigo-600 font-medium flex items-center gap-1">
                             <Plus size={16} /> {t('items', language)}
                         </button>
                     )}
                 </div>

                 {/* Totals */}
                 <div className="px-8 md:px-12 pb-12 flex justify-end">
                     <div className="w-64 space-y-2">
                         <div className="flex justify-between text-slate-500 text-sm">
                             <span>{t('subtotal', language)}</span>
                             <span>€{subtotal.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between text-slate-500 text-sm">
                             <span>{t('vat', language)}</span>
                             <span>€{tax.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between text-slate-900 font-bold text-lg pt-4 border-t border-slate-200">
                             <span>{t('totalTTC', language)}</span>
                             <span>€{total.toFixed(2)}</span>
                         </div>
                     </div>
                 </div>

                 {/* Footer Terms */}
                 <div className="bg-slate-50 p-8 md:p-12 text-xs text-slate-500 border-t border-slate-100">
                     <p className="font-bold mb-1">{t('terms', language)}</p>
                     <p className="mb-4">{t('paymentTerms', language)}: {currentQuote.terms.paymentTerms}</p>
                     <p className="mb-4 italic">{currentQuote.terms.notes}</p>
                     
                     <div className="mt-8 pt-8 border-t border-slate-200 flex justify-between">
                        <div className="w-1/3">
                            <p className="mb-12 font-bold">{t('bonPourAccord', language)}</p>
                            <div className="border-b border-slate-300 w-full"></div>
                            <p className="mt-1">Date & Signature</p>
                        </div>
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
