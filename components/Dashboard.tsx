
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { SalesData, BusinessMetric, Language } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase } from 'lucide-react';
import { t } from '../utils/i18n';

const mockData: SalesData[] = [
  { month: 'Jan', revenue: 4000, expenses: 2400, forecast: 4200 },
  { month: 'Feb', revenue: 3000, expenses: 1398, forecast: 3200 },
  { month: 'Mar', revenue: 9800, expenses: 2800, forecast: 9000 },
  { month: 'Apr', revenue: 6780, expenses: 3908, forecast: 7000 },
  { month: 'May', revenue: 8890, expenses: 4800, forecast: 8500 },
  { month: 'Jun', revenue: 10390, expenses: 5800, forecast: 11000 },
];

interface DashboardProps {
  language: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ language }) => {
  const mockMetrics: BusinessMetric[] = [
    { label: t('revenue', language), value: '€42,860', trend: 12.5, positive: true },
    { label: t('expenses', language), value: '€21,106', trend: -2.3, positive: true },
    { label: t('netProfit', language), value: '€21,754', trend: 18.2, positive: true },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 h-full overflow-y-auto pb-24">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">{t('welcome', language)}</h1>
        <p className="text-slate-500">{t('financialSnapshot', language)}</p>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockMetrics.map((metric, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{metric.value}</h3>
              <div className={`flex items-center mt-2 text-sm ${metric.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {metric.positive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                <span>{Math.abs(metric.trend)}% {t('trendVsLastMonth', language)}</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-indigo-600">
               {idx === 0 ? <DollarSign /> : idx === 1 ? <Briefcase /> : <Users />}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80 min-h-[320px] w-full">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('revenueVsExpenses', language)}</h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={0} fill="transparent" />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80 min-h-[320px] w-full">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('aiForecastAccuracy', language)}</h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none' }}/>
                <Bar dataKey="revenue" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="forecast" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl text-white flex items-center justify-between">
          <div>
              <h3 className="font-bold text-lg">{t('elsiSuggestion', language)}</h3>
              <p className="text-indigo-100 text-sm opacity-90">Revenue is up 12% in June. Consider re-investing surplus into Q3 marketing inventory.</p>
          </div>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium backdrop-blur-sm transition">
              {t('viewPlan', language)}
          </button>
      </div>
    </div>
  );
};
