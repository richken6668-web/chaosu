export type DEMOThemeName = 'shopify' | 'headspace' | 'coinbase' | 'linear' | 'planhat' | 'stripe'

type DEMOThemeTokens = {
  label: string
  accent: string
  accentContrast: string
  bg: string
  surface: string
  surfaceStrong: string
  ink: string
  muted: string
  border: string
  alt: string
  danger: string
  radius: string
  bodyFont: string
  displayFont: string
}

export const DEMO_THEME_TOKENS: Record<DEMOThemeName, DEMOThemeTokens> = {
  shopify: {
    label: 'Shopify / Commerce', accent: '#000000', accentContrast: '#ffffff', bg: '#fbfbf5', surface: '#ffffff', surfaceStrong: '#1e2c31', ink: '#111318', muted: '#52525b', border: '#e4e4e7', alt: '#c1fbd4', danger: '#b42318', radius: '18px', bodyFont: 'Inter, sans-serif', displayFont: 'Neue Haas Grotesk, Inter, sans-serif',
  },
  headspace: {
    label: 'Headspace / Wellness', accent: '#0061ef', accentContrast: '#ffffff', bg: '#f9f4f2', surface: '#ffffff', surfaceStrong: '#3b197f', ink: '#2d2c2b', muted: '#5f5a56', border: '#e2ded9', alt: '#ffce00', danger: '#c2410c', radius: '26px', bodyFont: 'Apercu, Inter, sans-serif', displayFont: 'Apercu, Inter, sans-serif',
  },
  coinbase: {
    label: 'Coinbase / Security', accent: '#0052ff', accentContrast: '#ffffff', bg: '#f7f7f7', surface: '#ffffff', surfaceStrong: '#eef0f3', ink: '#0a0b0d', muted: '#5b616e', border: '#dee1e6', alt: '#05b169', danger: '#cf202f', radius: '24px', bodyFont: 'Coinbase Sans, Inter, sans-serif', displayFont: 'Coinbase Display, Inter, sans-serif',
  },
  linear: {
    label: 'Linear / SaaS', accent: '#5e6ad2', accentContrast: '#ffffff', bg: '#010102', surface: '#0f1011', surfaceStrong: '#18191a', ink: '#f7f8f8', muted: '#8a8f98', border: '#23252a', alt: '#27a644', danger: '#f87171', radius: '14px', bodyFont: 'Linear Text, Inter, sans-serif', displayFont: 'Linear Display, Inter, sans-serif',
  },
  planhat: {
    label: 'Planhat / Customer Ops', accent: '#121211', accentContrast: '#ffffff', bg: '#f6f6f8', surface: '#ffffff', surfaceStrong: '#f2f2f2', ink: '#121211', muted: '#666666', border: '#dedede', alt: '#22c55e', danger: '#dc2626', radius: '12px', bodyFont: 'Inter, sans-serif', displayFont: 'Inter, sans-serif',
  },
  stripe: {
    label: 'Stripe / Infrastructure', accent: '#533afd', accentContrast: '#ffffff', bg: '#f6f9fc', surface: '#ffffff', surfaceStrong: '#eef2ff', ink: '#0d253d', muted: '#64748d', border: '#e3e8ee', alt: '#ea2261', danger: '#c0265e', radius: '12px', bodyFont: 'SF Pro Display, Inter, sans-serif', displayFont: 'Sohne, Inter, sans-serif',
  },
}
