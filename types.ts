
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  VOICE = 'VOICE',
  DOCUMENTS = 'DOCUMENTS',
  QUOTES = 'QUOTES',
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

// Detailed Company Profile for Settings
export interface CompanyProfile {
  name: string;
  legalForm?: string; // e.g. SAS, SARL
  capital?: string; // e.g. 10000
  address: string;
  city: string;
  zip: string;
  country: string;
  email: string;
  phone: string;
  siret: string;
  vatNumber?: string; // Numéro TVA
  logo?: string; // Base64 data URL
}

export interface AppSettings {
  language: Language;
  voiceName: VoiceName;
  alerts: AlertConfig;
  businessProfile: CompanyProfile;
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

// --- QUOTE TYPES ---

export interface Address {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface CompanyInfo extends CompanyProfile {}

export interface ClientInfo {
  name: string;
  address: Address;
  email?: string;
  phone?: string;
  deliveryAddress?: Address;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 20 for 20%
}

export interface Quote {
  id: string;
  reference: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  date: string; // ISO Date
  validUntil: string; // ISO Date
  
  // New Timeline Fields
  startDate?: string;
  duration?: string;
  
  company: CompanyInfo;
  client: ClientInfo;
  items: QuoteItem[];
  
  terms: {
    paymentTerms: string;
    notes?: string;
  };
}
