
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppMode, Message, ArtifactType, GeneratedArtifact, AppSettings, Alert, ReportTemplate, Quote } from './types';
import { Dashboard } from './components/Dashboard';
import { SettingsView } from './components/SettingsView';
import { DocumentsView } from './components/DocumentsView';
import { QuotesView } from './components/QuotesView';
import { useLiveSession } from './services/liveService';
import { sendMessageToElsi, generateArtifact, getChatSession } from './services/geminiService';
import { t } from './utils/i18n';
import { 
    LayoutDashboard, 
    MessageSquare, 
    Mic, 
    FileText, 
    Send, 
    Menu, 
    X, 
    Sparkles, 
    Settings,
    Bell,
    FileCheck,
    Table,
    ChevronRight,
    AlertCircle,
    ScrollText
} from 'lucide-react';

const App: React.FC = () => {
  // Global State
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [settings, setSettings] = useState<AppSettings>({
      language: 'en',
      voiceName: 'Kore',
      alerts: { minRevenue: 3000, maxExpenses: 5000, inventoryThreshold: 10 },
      businessProfile: {
          name: 'My SME Business',
          legalForm: 'SAS',
          capital: '€10,000',
          address: '123 Business St',
          city: 'Paris',
          zip: '75001',
          country: 'France',
          email: 'contact@mysme.com',
          phone: '+33 1 23 45 67 89',
          siret: '123 456 789 00012',
          vatNumber: 'FR 12 3456789'
      }
  });

  // Data State
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'system', text: 'Hello! I am Elsi, your commercial copilot. How can I assist you today?', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([
      { id: 't1', name: 'Weekly Sales', description: 'Weekly breakdown', prompt: 'Create a weekly sales report with Executive Summary, Key Metrics, and Risks.' }
  ]);
  
  // Quotes State
  const [quotes, setQuotes] = useState<Quote[]>([]);
  
  // Alerts System
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  // Monitor Metrics (Mock Logic)
  useEffect(() => {
     // Mock check every 30s or on setting change
     const checkMetrics = () => {
         const newAlerts: Alert[] = [];
         const currentRevenue = 4000; 
         const currentExpenses = 2400;
         const lang = settings.language;

         if (currentRevenue < settings.alerts.minRevenue) {
             const title = t('lowRevenueAlert', lang);
             const msg = `${t('revenueBelow', lang)} (€${currentRevenue} < €${settings.alerts.minRevenue})`;
             newAlerts.push({ id: Date.now()+'1', title, message: msg, type: 'warning', read: false, timestamp: new Date() });
         }
         if (currentExpenses > settings.alerts.maxExpenses) {
             const title = t('highExpenseAlert', lang);
             const msg = `${t('expensesExceeded', lang)} (€${currentExpenses} > €${settings.alerts.maxExpenses})`;
             newAlerts.push({ id: Date.now()+'2', title, message: msg, type: 'warning', read: false, timestamp: new Date() });
         }
         
         if (newAlerts.length > 0) {
             setAlerts(prev => {
                 const existingIds = new Set(prev.map(a => a.title)); 
                 const unique = newAlerts.filter(a => !existingIds.has(a.title));
                 return [...unique, ...prev];
             });
         }
     };
     
     checkMetrics();
     const interval = setInterval(checkMetrics, 60000);
     return () => clearInterval(interval);
  }, [settings.alerts, settings.language]);

  const unreadAlerts = alerts.filter(a => !a.read).length;

  // Chat Auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  // --- TOOL EXECUTION LOGIC ---
  const handleToolCalls = useCallback(async (functionCalls: any[]) => {
      const responses = [];
      for (const call of functionCalls) {
          console.log("Executing tool:", call.name, call.args);
          let result = {};
          
          if (call.name === 'create_quote') {
              const { clientName, items, validDays, startDate, duration, paymentTerms } = call.args;

              // VALIDATION: Fail if no items or no client
              if (!clientName || !items || !Array.isArray(items) || items.length === 0) {
                 result = { 
                     error: true, 
                     message: "MISSING INFO. Do NOT create the quote. Ask the user for the Client Name and at least one Item (Description, Price)." 
                 };
              } else {
                  const newQuote: Quote = {
                      id: Date.now().toString(),
                      reference: `Q-${new Date().getFullYear()}-${String(quotes.length + 101)}`, 
                      status: 'DRAFT',
                      date: new Date().toISOString().split('T')[0],
                      validUntil: new Date(Date.now() + (validDays || 30)*86400000).toISOString().split('T')[0],
                      startDate: startDate || new Date().toISOString().split('T')[0],
                      duration: duration || 'TBD',
                      company: settings.businessProfile, // Use Global Business Profile
                      client: {
                          name: clientName,
                          address: { street: '', city: call.args.clientCity || '', zip: '', country: '' }
                      },
                      items: items.map((i: any, idx: number) => ({
                          id: idx.toString(),
                          description: i.description || 'Item',
                          quantity: i.quantity || 1,
                          unitPrice: i.unitPrice || 0,
                          taxRate: 20
                      })),
                      terms: { 
                          paymentTerms: paymentTerms || '30 Days Net', 
                          notes: 'Generated by Elsi' 
                      }
                  };
                  setQuotes(prev => [...prev, newQuote]);
                  result = { success: true, message: `Quote ${newQuote.reference} created for ${clientName}. Total items: ${newQuote.items.length}.`, quoteId: newQuote.id };
                  // Switch to quotes view to show the result
                  setMode(AppMode.QUOTES);
              }
          } else if (call.name === 'list_quotes') {
              result = { quotes: quotes.map(q => ({ id: q.id, ref: q.reference, client: q.client.name, total: q.items.reduce((s,i)=>s+i.quantity*i.unitPrice,0) })) };
          } else if (call.name === 'delete_quote') {
              const ref = call.args.referenceId;
              const before = quotes.length;
              const filtered = quotes.filter(q => q.reference !== ref);
              if (filtered.length < before) {
                  setQuotes(filtered);
                  result = { success: true, message: `Quote ${ref} deleted.` };
              } else {
                  result = { success: false, message: "Quote not found." };
              }
          } else if (call.name === 'update_business_info') {
              // Update settings locally
              setSettings(prev => ({
                  ...prev,
                  businessProfile: { ...prev.businessProfile, ...call.args }
              }));
              result = { success: true, message: "Business profile updated successfully." };
          }

          responses.push({
              id: call.id,
              name: call.name,
              response: { result }
          });
      }
      return responses;
  }, [quotes, settings.businessProfile]);

  // Voice Session
  const { isConnected, isConnecting, volume, connect, disconnect, error } = useLiveSession(handleToolCalls);

  // Mode switching handler
  const switchMode = (newMode: AppMode) => {
      setMode(newMode);
      setIsSidebarOpen(false);
      
      // Handle Voice Connection
      if (newMode === AppMode.VOICE && !isConnected) {
          connect(settings.voiceName, settings.language);
      } else if (newMode !== AppMode.VOICE && isConnected) {
          disconnect();
      }
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    
    const loadingId = 'loading-' + Date.now();
    setMessages(prev => [...prev, { id: loadingId, role: 'model', text: '', timestamp: new Date(), isThinking: true }]);

    try {
        const response = await sendMessageToElsi(userMsg.text, settings.language);
        let responseText = response.text || '';
        
        // Handle Tool Calls for Text Chat
        const toolCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);
        
        if (toolCalls && toolCalls.length > 0) {
            // Execute tools locally
            const functionResponses = await handleToolCalls(toolCalls);
            
            // Send results back to model to get final text response
            const chat = getChatSession(settings.language);
            const finalResponse = await chat.sendMessage(functionResponses);
            responseText = finalResponse.text || "Action completed.";
        }

        setMessages(prev => prev.map(m => 
            m.id === loadingId 
            ? { ...m, text: responseText, isThinking: false } 
            : m
        ));
    } catch (e) {
        console.error(e);
        setMessages(prev => prev.map(m => 
            m.id === loadingId 
            ? { ...m, text: "I encountered an error processing your request.", isThinking: false } 
            : m
        ));
    }
  };

  const handleAskAboutAlert = (alert: Alert) => {
      setShowAlerts(false);
      switchMode(AppMode.CHAT);
      handleSendMessage(`Analyze this alert: ${alert.title} - ${alert.message}. What should I do?`);
  };

  // --- Render Components ---

  const renderNav = () => (
    <nav className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                    <Sparkles size={18} className="text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">ElsyvIA</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                <X size={24} />
            </button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-2">
            <NavButton icon={<LayoutDashboard size={20} />} label={t('dashboard', settings.language)} active={mode === AppMode.DASHBOARD} onClick={() => switchMode(AppMode.DASHBOARD)} />
            <NavButton icon={<ScrollText size={20} />} label={t('quotes', settings.language)} active={mode === AppMode.QUOTES} onClick={() => switchMode(AppMode.QUOTES)} />
            <NavButton icon={<MessageSquare size={20} />} label={t('chat', settings.language)} active={mode === AppMode.CHAT} onClick={() => switchMode(AppMode.CHAT)} />
            <NavButton icon={<Mic size={20} />} label={t('voice', settings.language)} active={mode === AppMode.VOICE} onClick={() => switchMode(AppMode.VOICE)} />
            <NavButton icon={<FileText size={20} />} label={t('documents', settings.language)} active={mode === AppMode.DOCUMENTS} onClick={() => switchMode(AppMode.DOCUMENTS)} />
            <NavButton icon={<Settings size={20} />} label={t('settings', settings.language)} active={mode === AppMode.SETTINGS} onClick={() => switchMode(AppMode.SETTINGS)} />
        </div>

        <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-slate-700 overflow-hidden bg-slate-800 flex items-center justify-center text-slate-400">
                    {settings.businessProfile.logo ? <img src={settings.businessProfile.logo} className="w-full h-full object-cover"/> : <Settings size={20}/>}
                </div>
                <div>
                    <p className="text-sm font-medium truncate w-32">{settings.businessProfile.name}</p>
                    <p className="text-xs text-slate-400">Pro Plan</p>
                </div>
            </div>
        </div>
    </nav>
  );

  const renderChat = () => (
    <div className="flex flex-col h-full bg-white relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}>
                        {msg.role === 'system' && <div className="text-xs font-bold text-indigo-500 mb-1 uppercase tracking-wider">Elsi</div>}
                        <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                            {msg.text}
                            {msg.isThinking && <span className="animate-pulse ml-1">...</span>}
                        </p>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 backdrop-blur-lg bg-opacity-90">
            <div className="flex gap-2 max-w-4xl mx-auto">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t('chatPlaceholder', settings.language)}
                    className="flex-1 px-4 py-3 bg-slate-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 rounded-xl outline-none transition-all"
                />
                <button 
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim()}
                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-indigo-200"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    </div>
  );

  const renderVoice = () => (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
          
          <div className="z-10 flex flex-col items-center space-y-8">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isConnected ? 'bg-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}>
                {isConnecting ? (
                     <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <Mic size={48} className={`transition-transform duration-200 ${isConnected ? 'scale-110' : 'opacity-50'}`} style={{ transform: `scale(${1 + volume})` }}/>
                )}
            </div>
            
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{isConnected ? t('listening', settings.language) : t('voiceMode', settings.language)}</h2>
                <p className="text-slate-400 max-w-xs">{isConnected ? t('speakNaturally', settings.language) : t('tapToStart', settings.language)}</p>
                {error && <p className="text-rose-400 text-sm mt-2">{error}</p>}
            </div>

            <button 
                onClick={() => isConnected ? disconnect() : connect(settings.voiceName, settings.language)}
                className={`px-8 py-3 rounded-full font-semibold transition-all ${
                    isConnected 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                    : 'bg-white text-slate-900 hover:bg-indigo-50'
                }`}
            >
                {isConnected ? t('endSession', settings.language) : t('startConversation', settings.language)}
            </button>
          </div>
      </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {renderNav()}
      
      {/* Mobile Header & Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
         <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
             <div className="flex items-center gap-3 md:hidden">
                 <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
                    <Menu size={24} />
                 </button>
                 <span className="font-bold text-slate-800">ElsyvIA</span>
             </div>
             
             {/* Desktop Title / Spacer */}
             <div className="hidden md:block font-bold text-lg text-slate-700 ml-4">
                 {t(mode.toLowerCase() as any, settings.language) || 'ElsyvIA'}
             </div>

             {/* Notification Center */}
             <div className="relative">
                 <button 
                    onClick={() => setShowAlerts(!showAlerts)}
                    className="p-2 rounded-full hover:bg-slate-100 relative text-slate-600"
                 >
                     <Bell size={20} />
                     {unreadAlerts > 0 && (
                         <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></span>
                     )}
                 </button>

                 {showAlerts && (
                     <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                         <div className="p-3 border-b border-slate-50 bg-slate-50 font-medium text-slate-600 flex justify-between items-center">
                             <span>{t('notifications', settings.language)}</span>
                             {alerts.length > 0 && (
                                 <button 
                                    onClick={() => setAlerts(alerts.map(a => ({...a, read: true})))} 
                                    className="text-xs text-indigo-600 hover:text-indigo-700"
                                 >
                                     {t('markAllRead', settings.language)}
                                 </button>
                             )}
                         </div>
                         <div className="max-h-80 overflow-y-auto">
                             {alerts.length === 0 ? (
                                 <div className="p-8 text-center text-slate-400 text-sm">{t('noNewAlerts', settings.language)}</div>
                             ) : (
                                 alerts.map(alert => (
                                     <div key={alert.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition ${!alert.read ? 'bg-indigo-50/30' : ''}`}>
                                         <div className="flex items-start gap-3">
                                             <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0"/>
                                             <div>
                                                 <h4 className="text-sm font-semibold text-slate-800">{alert.title}</h4>
                                                 <p className="text-xs text-slate-500 mt-1">{alert.message}</p>
                                                 <button 
                                                    onClick={() => handleAskAboutAlert(alert)}
                                                    className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                                 >
                                                     {t('askElsi', settings.language)} <ChevronRight size={12}/>
                                                 </button>
                                             </div>
                                         </div>
                                     </div>
                                 ))
                             )}
                         </div>
                     </div>
                 )}
             </div>
         </div>

         {/* Main Content Area */}
         <main className="flex-1 overflow-hidden relative">
            {mode === AppMode.DASHBOARD && <Dashboard language={settings.language} />}
            {mode === AppMode.CHAT && renderChat()}
            {mode === AppMode.VOICE && renderVoice()}
            {mode === AppMode.DOCUMENTS && (
                <DocumentsView 
                    artifacts={artifacts}
                    templates={templates}
                    language={settings.language}
                    onGenerate={(art) => setArtifacts([art, ...artifacts])}
                    onAddTemplate={(tpl) => setTemplates([...templates, tpl])}
                    switchToChat={() => switchMode(AppMode.CHAT)}
                />
            )}
            {mode === AppMode.QUOTES && (
                <QuotesView 
                    quotes={quotes}
                    language={settings.language}
                    onCreate={(q) => { 
                        // Inject business profile on creation
                        setQuotes([...quotes, { ...q, company: settings.businessProfile }]) 
                    }}
                    onUpdate={(q) => setQuotes(quotes.map(old => old.id === q.id ? q : old))}
                    onDelete={(id) => setQuotes(quotes.filter(q => q.id !== id))}
                />
            )}
            {mode === AppMode.SETTINGS && (
                <SettingsView settings={settings} onUpdate={setSettings} />
            )}
         </main>
      </div>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            active 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

export default App;
