import React from 'react';
import { Settings, Globe, Bell, Save, Building, Upload } from 'lucide-react';
import { t } from '../utils/i18n.js';

export const SettingsView = ({ settings, onUpdate }) => {
  const handleChange = (key, value) => {
    onUpdate({ ...settings, [key]: value });
  };

  const handleAlertChange = (key, value) => {
    onUpdate({
      ...settings,
      alerts: { ...settings.alerts, [key]: value }
    });
  };

  const handleProfileChange = (key, value) => {
      onUpdate({
          ...settings,
          businessProfile: { ...settings.businessProfile, [key]: value }
      });
  };

  const handleLogoUpload = (e) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              handleProfileChange('logo', reader.result);
          };
          reader.readAsDataURL(file);
      }
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
        {/* Company Profile & Branding */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Building size={20} />
            {t('companyProfile', settings.language)}
          </h3>
          
          <div className="flex flex-col md:flex-row gap-6">
              {/* Logo Upload */}
              <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                      {settings.businessProfile.logo ? (
                          <img src={settings.businessProfile.logo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                          <span className="text-xs text-slate-400 text-center p-2">No Logo</span>
                      )}
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 flex items-center gap-1 transition">
                      <Upload size={14} /> {t('uploadLogo', settings.language)}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
              </div>

              {/* Form Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Company Legal Name"
                    value={settings.businessProfile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                  <input 
                    placeholder={t('legalForm', settings.language)}
                    value={settings.businessProfile.legalForm || ''}
                    onChange={(e) => handleProfileChange('legalForm', e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                   <input 
                    placeholder={t('siret', settings.language)}
                    value={settings.businessProfile.siret}
                    onChange={(e) => handleProfileChange('siret', e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                  <input 
                    placeholder={t('vatNumber', settings.language)}
                    value={settings.businessProfile.vatNumber || ''}
                    onChange={(e) => handleProfileChange('vatNumber', e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                  <input 
                    placeholder="Address"
                    value={settings.businessProfile.address}
                    onChange={(e) => handleProfileChange('address', e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                  <input 
                    placeholder="City & Zip"
                    value={settings.businessProfile.city}
                    onChange={(e) => handleProfileChange('city', e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                   <input 
                    placeholder="Email"
                    value={settings.businessProfile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                   <input 
                    placeholder="Phone"
                    value={settings.businessProfile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
              </div>
          </div>
        </section>

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
                onChange={(e) => handleChange('language', e.target.value)}
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
                onChange={(e) => handleChange('voiceName', e.target.value)}
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