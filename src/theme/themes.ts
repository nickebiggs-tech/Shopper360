const BASE = import.meta.env.BASE_URL

export interface HeroStat {
  label: string
  value: string
}

export interface Livery {
  id: string
  name: string
  tagline: string
  logoText: string
  logoShort: string
  logoWhite: string
  logoColor: string
  fontFamily: string
  heroLine1: string
  heroLine2: string
  heroSubtext: string
  heroFeatureStat?: { value: string; label: string }
  heroStats: HeroStat[]
  colors: Record<string, string>
}

export const LIVERIES: Record<string, Livery> = {
  nostradata: {
    id: 'nostradata',
    name: 'NostraData',
    tagline: 'Shopper Intelligence',
    logoText: 'Shopper360',
    logoShort: 'S3',
    logoWhite: `${BASE}logos/nostradata-white.svg`,
    logoColor: `${BASE}logos/nostradata-color.svg`,
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    heroLine1: 'See the full journey.',
    heroLine2: 'Shape every visit.',
    heroSubtext: 'AI-powered shopper intelligence from first visit to loyal customer. Insights that drive action for pharmacies and their supplier partners.',
    heroStats: [
      { label: 'Active Shoppers', value: '450K+' },
      { label: 'Avg Basket', value: '$43.80' },
      { label: 'Retention Rate', value: '72.4%' },
      { label: 'Categories', value: '200+' },
    ],
    colors: {
      'theme-primary': '#0A8BA8',
      'theme-primary-light': '#0FB5D4',
      'theme-primary-foreground': '#FFFFFF',
      'theme-accent': '#10B39B',
      'theme-accent-foreground': '#FFFFFF',
      'theme-ring': '#0A8BA8',
      'theme-sidebar-from': '#0F172A',
      'theme-sidebar-to': '#1E293B',
      'theme-hero-from': '#0F172A',
      'theme-hero-mid': '#0A8BA8',
      'theme-hero-to': '#10B39B',
      'theme-chart-1': '#0A8BA8',
      'theme-chart-2': '#10B39B',
      'theme-chart-3': '#F59E0B',
      'theme-chart-4': '#EF4444',
      'theme-chart-5': '#8B5CF6',
      'theme-seg-power': '#10B981',
      'theme-seg-regular': '#3B82F6',
      'theme-seg-occasional': '#F59E0B',
      'theme-seg-new': '#8B5CF6',
      'theme-seg-atrisk': '#EF4444',
    },
  },
  iqvia: {
    id: 'iqvia',
    name: 'IQVIA Consumer Health',
    tagline: 'Consumer Health Intelligence',
    logoText: 'Shopper360',
    logoShort: 'IQ',
    logoWhite: `${BASE}logos/iqvia-white.svg`,
    logoColor: `${BASE}logos/iqvia-color.svg`,
    fontFamily: '"Arial", "Helvetica Neue", Helvetica, sans-serif',
    heroLine1: 'The complete shopper journey.',
    heroLine2: 'Powered by IQVIA data.',
    heroSubtext: 'Map every step from discovery to purchase. Actionable intelligence for retailers and supplier partners.',
    heroFeatureStat: { value: '12M+', label: 'consumer health journeys — powering smarter decisions for every partner' },
    heroStats: [
      { label: 'Brands Tracked', value: '2,500+' },
      { label: 'Categories', value: '350+' },
      { label: 'Market Coverage', value: '95%' },
      { label: 'Retail Partners', value: '1,200+' },
    ],
    colors: {
      'theme-primary': '#00A3E0',
      'theme-primary-light': '#33B8E8',
      'theme-primary-foreground': '#FFFFFF',
      'theme-accent': '#00D4AA',
      'theme-accent-foreground': '#FFFFFF',
      'theme-ring': '#00A3E0',
      'theme-sidebar-from': '#0C2340',
      'theme-sidebar-to': '#1A365D',
      'theme-hero-from': '#0C2340',
      'theme-hero-mid': '#00A3E0',
      'theme-hero-to': '#00D4AA',
      'theme-chart-1': '#00A3E0',
      'theme-chart-2': '#00D4AA',
      'theme-chart-3': '#F59E0B',
      'theme-chart-4': '#EF4444',
      'theme-chart-5': '#8B5CF6',
      'theme-seg-power': '#00D4AA',
      'theme-seg-regular': '#00A3E0',
      'theme-seg-occasional': '#F59E0B',
      'theme-seg-new': '#8B5CF6',
      'theme-seg-atrisk': '#EF4444',
    },
  },
  chemistwarehouse: {
    id: 'chemistwarehouse',
    name: 'Chemist Warehouse',
    tagline: 'Shopper Intelligence',
    logoText: 'Shopper360',
    logoShort: 'CW',
    logoWhite: `${BASE}logos/cw-white.svg`,
    logoColor: `${BASE}logos/cw-color.svg`,
    fontFamily: '"Arial", "Helvetica Neue", Helvetica, sans-serif',
    heroLine1: 'The Shopper360 journey',
    heroLine2: 'begins here.',
    heroSubtext: '3.2 million unique shoppers. One platform. Actionable intelligence for Chemist Warehouse and every supplier who partners with us.',
    heroFeatureStat: { value: '3.2M+', label: 'unique shoppers across 500+ stores — the richest shopper journey data in Australian pharmacy' },
    heroStats: [
      { label: 'Shopper Journeys', value: '18M+' },
      { label: 'Supplier Partners', value: '120+' },
      { label: 'Categories', value: '200+' },
      { label: 'Stores', value: '500+' },
    ],
    colors: {
      'theme-primary': '#E30019',
      'theme-primary-light': '#FF1A33',
      'theme-primary-foreground': '#FFFFFF',
      'theme-accent': '#FFCC00',
      'theme-accent-foreground': '#1A1A1A',
      'theme-ring': '#E30019',
      'theme-sidebar-from': '#1A1A1A',
      'theme-sidebar-to': '#2D2D2D',
      'theme-hero-from': '#1A1A1A',
      'theme-hero-mid': '#E30019',
      'theme-hero-to': '#8B0010',
      'theme-chart-1': '#E30019',
      'theme-chart-2': '#FFCC00',
      'theme-chart-3': '#3B82F6',
      'theme-chart-4': '#10B981',
      'theme-chart-5': '#8B5CF6',
      'theme-seg-power': '#10B981',
      'theme-seg-regular': '#3B82F6',
      'theme-seg-occasional': '#FFCC00',
      'theme-seg-new': '#8B5CF6',
      'theme-seg-atrisk': '#E30019',
    },
  },
}
