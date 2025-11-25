
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  VOICE = 'VOICE',
  DOCUMENTS = 'DOCUMENTS',
  SETTINGS = 'SETTINGS'
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
  artifact?: GeneratedArtifact;
}

export enum ArtifactType {
  QUOTE = 'QUOTE',
  ACTION_PLAN = 'ACTION_PLAN',
  TABLE = 'TABLE',
  REPORT = 'REPORT'
}

export interface GeneratedArtifact {
  type: ArtifactType;
  title: string;
  data: any; // Flexible data structure based on type
}

export interface SalesData {
  month: string;
  revenue: number;
  expenses: number;
  forecast: number;
}

export interface BusinessMetric {
  label: string;
  value: string;
  trend: number; // percentage
  positive: boolean;
}

export type Language = 'en' | 'fr';
export type VoiceName = 'Kore' | 'Puck'; // Kore (Female), Puck (Male)

export interface AlertConfig {
  minRevenue: number;
  maxExpenses: number;
  inventoryThreshold: number;
}

export interface AppSettings {
  language: Language;
  voiceName: VoiceName;
  alerts: AlertConfig;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  read: boolean;
  timestamp: Date;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
}
