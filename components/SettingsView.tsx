
import React from 'react';
import { AppSettings, Language, VoiceName } from '../types';
import { Settings, Globe, Mic, Bell, Save } from 'lucide-react';
import { t } from '../utils/i18n';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate }) => {
  const handleChange = (key: keyof AppSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const handleAlertChange = (key: string, value: number) => {
    onUpdate({
      ...settings,
      alerts: { ...settings.alerts, [key]: value }
    });
  };

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto bg-slate-50">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Settings className="text-indigo-600" size={32} />
          {t('settingsTitle', settings.language)}
        </h2>
      </header>

      <div className="max-w-3xl space-y-6">
        {/* Language & Voice */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Globe size={20} />
            {t('generalPreferences', settings.language)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{t('language', settings.language)}</label>
              <select 
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value as Language)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{t('voiceSettingsLabel', settings.language)}</label>
              <select 
                value={settings.voiceName}
                onChange={(e) => handleChange('voiceName', e.target.value as VoiceName)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Kore">Elsi (Female - Kore)</option>
                <option value="Puck">Elsi (Male - Puck)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Alert Thresholds */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Bell size={20} />
            {t('alertThresholds', settings.language)}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{t('minRevenue', settings.language)}</label>
              <input 
                type="number"
                value={settings.alerts.minRevenue}
                onChange={(e) => handleAlertChange('minRevenue', parseInt(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{t('maxExpenses', settings.language)}</label>
              <input 
                type="number"
                value={settings.alerts.maxExpenses}
                onChange={(e) => handleAlertChange('maxExpenses', parseInt(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </section>

        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition shadow-lg shadow-indigo-200">
            <Save size={18} />
            {t('saveSettings', settings.language)}
        </button>
      </div>
    </div>
  );
};
