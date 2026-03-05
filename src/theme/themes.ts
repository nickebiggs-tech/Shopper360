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
    logoWhite: '/logos/nostradata-white.svg',
    logoColor: '/logos/nostradata-color.svg',
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    heroLine1: 'Know your shoppers.',
    heroLine2: 'Grow your pharmacy.',
    heroSubtext: 'AI-powered insights into customer behaviour, basket composition, and retention opportunities.',
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
    logoWhite: '/logos/iqvia-white.svg',
    logoColor: '/logos/iqvia-color.svg',
    fontFamily: '"Arial", "Helvetica Neue", Helvetica, sans-serif',
    heroLine1: 'Consumer health intelligence.',
    heroLine2: 'Powered by data.',
    heroSubtext: 'Comprehensive shopper analytics across categories, brands, and market segments.',
    heroStats: [
      { label: 'Consumer Journeys', value: '12M+' },
      { label: 'Avg Basket', value: '$48.20' },
      { label: 'Categories', value: '350+' },
      { label: 'Market Coverage', value: '95%' },
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
    logoWhite: '/logos/cw-white.svg',
    logoColor: '/logos/cw-color.svg',
    fontFamily: '"Arial", "Helvetica Neue", Helvetica, sans-serif',
    heroLine1: '3 million shopper journeys.',
    heroLine2: 'One powerful platform.',
    heroSubtext: 'Deep insights into customer loyalty, basket composition, and competitive positioning across 500+ stores.',
    heroStats: [
      { label: 'Shopper Journeys', value: '3M+' },
      { label: 'Avg Basket', value: '$52.40' },
      { label: 'Categories', value: '200+' },
      { label: 'Stores Tracked', value: '500+' },
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
