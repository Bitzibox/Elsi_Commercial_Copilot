
import { Language } from '../types';

type TranslationKey = 
  | 'dashboard' | 'chat' | 'voice' | 'documents' | 'settings'
  | 'welcome' | 'financialSnapshot' | 'revenue' | 'expenses'
  | 'netProfit' | 'forecast' | 'voiceMode' | 'listening'
  | 'speakNaturally' | 'tapToStart' | 'endSession' | 'startConversation'
  | 'documentsTitle' | 'noDocs' | 'settingsTitle' | 'language'
  | 'voiceSettingsLabel' | 'alertThresholds' | 'saveSettings' | 'minRevenue'
  | 'maxExpenses' | 'elsiSuggestion' | 'viewPlan' | 'generatedFiles'
  | 'templates' | 'createTemplate' | 'generate'
  | 'revenueVsExpenses' | 'aiForecastAccuracy' | 'generalPreferences'
  | 'newReportTemplate' | 'templateName' | 'describeStructure' | 'cancel'
  | 'saveTemplate' | 'goToChat' | 'notifications' | 'markAllRead'
  | 'noNewAlerts' | 'askElsi' | 'chatPlaceholder' | 'lowRevenueAlert'
  | 'highExpenseAlert' | 'revenueBelow' | 'expensesExceeded' | 'trendVsLastMonth';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    dashboard: 'Dashboard',
    chat: 'Chat with Elsi',
    voice: 'Voice Mode',
    documents: 'Documents',
    settings: 'Settings',
    welcome: 'Business Overview',
    financialSnapshot: 'Welcome back! Here is your financial snapshot.',
    revenue: 'Total Revenue',
    expenses: 'Expenses',
    netProfit: 'Net Profit',
    forecast: 'AI Forecast Accuracy',
    voiceMode: 'Voice Mode',
    listening: 'Elsi is Listening',
    speakNaturally: 'Speak naturally. I can analyze finances or take notes.',
    tapToStart: 'Tap the microphone to start a real-time conversation.',
    endSession: 'End Session',
    startConversation: 'Start Conversation',
    documentsTitle: 'Documents & Templates',
    noDocs: 'No documents generated yet.',
    settingsTitle: 'Settings',
    language: 'Language',
    voiceSettingsLabel: 'Elsi Voice',
    alertThresholds: 'Alert Thresholds',
    saveSettings: 'Save Settings',
    minRevenue: 'Min Monthly Revenue (€)',
    maxExpenses: 'Max Monthly Expenses (€)',
    elsiSuggestion: 'Elsi Suggestion',
    viewPlan: 'View Plan',
    generatedFiles: 'Generated Files',
    templates: 'Report Templates',
    createTemplate: 'New Template',
    generate: 'Generate',
    revenueVsExpenses: 'Revenue vs Expenses',
    aiForecastAccuracy: 'AI Forecast Accuracy',
    generalPreferences: 'General Preferences',
    newReportTemplate: 'New Report Template',
    templateName: 'Template Name',
    describeStructure: 'Describe structure (e.g., "1. Exec Summary...")',
    cancel: 'Cancel',
    saveTemplate: 'Save Template',
    goToChat: 'Go to Chat',
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    noNewAlerts: 'No new alerts',
    askElsi: 'Ask Elsi',
    chatPlaceholder: 'Ask Elsi about sales, create a quote...',
    lowRevenueAlert: 'Low Revenue Alert',
    highExpenseAlert: 'High Expense Alert',
    revenueBelow: 'Revenue is below threshold.',
    expensesExceeded: 'Expenses exceeded limit.',
    trendVsLastMonth: 'vs last month'
  },
  fr: {
    dashboard: 'Tableau de Bord',
    chat: 'Discuter avec Elsi',
    voice: 'Mode Vocal',
    documents: 'Documents',
    settings: 'Paramètres',
    welcome: 'Aperçu Commercial',
    financialSnapshot: 'Bon retour ! Voici votre bilan financier.',
    revenue: 'Revenus Totaux',
    expenses: 'Dépenses',
    netProfit: 'Bénéfice Net',
    forecast: 'Précision des Prévisions IA',
    voiceMode: 'Mode Vocal',
    listening: 'Elsi vous écoute',
    speakNaturally: 'Parlez naturellement. Je peux analyser vos finances.',
    tapToStart: 'Appuyez sur le micro pour démarrer la conversation.',
    endSession: 'Terminer la session',
    startConversation: 'Démarrer la conversation',
    documentsTitle: 'Documents & Modèles',
    noDocs: 'Aucun document généré pour le moment.',
    settingsTitle: 'Paramètres',
    language: 'Langue',
    voiceSettingsLabel: 'Voix d\'Elsi',
    alertThresholds: 'Seuils d\'alerte',
    saveSettings: 'Enregistrer',
    minRevenue: 'Revenu Mensuel Min (€)',
    maxExpenses: 'Dépenses Mensuelles Max (€)',
    elsiSuggestion: 'Suggestion d\'Elsi',
    viewPlan: 'Voir le plan',
    generatedFiles: 'Fichiers Générés',
    templates: 'Modèles de Rapport',
    createTemplate: 'Nouveau Modèle',
    generate: 'Générer',
    revenueVsExpenses: 'Revenus vs Dépenses',
    aiForecastAccuracy: 'Précision des Prévisions IA',
    generalPreferences: 'Préférences Générales',
    newReportTemplate: 'Nouveau Modèle',
    templateName: 'Nom du Modèle',
    describeStructure: 'Décrivez la structure (ex: "1. Résumé...")',
    cancel: 'Annuler',
    saveTemplate: 'Sauvegarder',
    goToChat: 'Aller au Chat',
    notifications: 'Notifications',
    markAllRead: 'Tout marquer comme lu',
    noNewAlerts: 'Aucune nouvelle alerte',
    askElsi: 'Demander à Elsi',
    chatPlaceholder: 'Demandez à Elsi à propos des ventes...',
    lowRevenueAlert: 'Alerte Revenus Faibles',
    highExpenseAlert: 'Alerte Dépenses Élevées',
    revenueBelow: 'Les revenus sont sous le seuil.',
    expensesExceeded: 'Les dépenses dépassent la limite.',
    trendVsLastMonth: 'vs mois dernier'
  }
};

export const t = (key: TranslationKey, lang: Language): string => {
  return translations[lang][key] || key;
};
