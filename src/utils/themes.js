/**
 * Theme System for Alchemist's Compass
 * Comprehensive design system with multiple themes
 */

export const themes = {
  // Dashboard Theme - Blue/Cyan
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Modern blue/cyan (default)',
    bg: {
      primary: '#000000',
      secondary: '#111827',
      tertiary: '#1f2937',
      input: '#0a0a0a'
    },
    border: {
      default: '#1f2937',
      hover: '#374151',
      active: '#3b82f6'
    },
    text: {
      primary: '#ffffff',
      secondary: '#9ca3af',
      tertiary: '#6b7280'
    },
    accent: {
      primary: '#3b82f6',
      secondary: '#06b6d4',
      tertiary: '#8b5cf6'
    },
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      secondary: 'linear-gradient(135deg, #06b6d4, #22c55e)'
    },
    shadow: {
      card: '0 4px 12px rgba(0,0,0,0.5)',
      cardInverted: '0 -4px 12px rgba(0,0,0,0.5)',
      button: '0 2px 8px rgba(0,0,0,0.4)',
      accent: '0 4px 12px rgba(59,130,246,0.5)',
      accentAlt: '0 4px 12px rgba(6,182,212,0.5)',
      badge: '0 4px 12px rgba(59,130,246,0.6)',
      subtle: '0 2px 4px rgba(0,0,0,0.3)'
    }
  },

  // Ember Theme - Dark Gray/Pink/Red
  ember: {
    id: 'ember',
    name: 'Ember',
    description: 'Dark gray with pink/red accents',
    bg: {
      primary: '#0f0f0f',
      secondary: '#1a1a1a',
      tertiary: '#262626',
      input: '#0d0d0d'
    },
    border: {
      default: '#2a2a2a',
      hover: '#3a3a3a',
      active: '#ec4899'
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#a3a3a3',
      tertiary: '#737373'
    },
    accent: {
      primary: '#ec4899',
      secondary: '#f43f5e',
      tertiary: '#fb7185'
    },
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#dc2626'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #ec4899, #f43f5e)',
      secondary: 'linear-gradient(135deg, #f43f5e, #fb7185)'
    },
    shadow: {
      card: '0 4px 16px rgba(0,0,0,0.6)',
      cardInverted: '0 -4px 16px rgba(0,0,0,0.6)',
      button: '0 2px 8px rgba(0,0,0,0.5)',
      accent: '0 4px 16px rgba(236,72,153,0.4)',
      accentAlt: '0 4px 16px rgba(244,63,94,0.4)',
      badge: '0 4px 16px rgba(236,72,153,0.5)',
      subtle: '0 2px 6px rgba(0,0,0,0.4)'
    }
  },

  // Neon Theme - Vibrant Purple/Pink
  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Vibrant purple/pink neon',
    bg: {
      primary: '#0a0a0f',
      secondary: '#15151f',
      tertiary: '#1f1f2a',
      input: '#0d0d12'
    },
    border: {
      default: '#2a2a3a',
      hover: '#3a3a4a',
      active: '#a855f7'
    },
    text: {
      primary: '#faf5ff',
      secondary: '#c4b5fd',
      tertiary: '#9333ea'
    },
    accent: {
      primary: '#a855f7',
      secondary: '#d946ef',
      tertiary: '#ec4899'
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#f43f5e'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #a855f7, #d946ef)',
      secondary: 'linear-gradient(135deg, #d946ef, #ec4899)'
    },
    shadow: {
      card: '0 4px 20px rgba(168,85,247,0.15)',
      cardInverted: '0 -4px 20px rgba(168,85,247,0.15)',
      button: '0 2px 10px rgba(168,85,247,0.2)',
      accent: '0 4px 20px rgba(168,85,247,0.5)',
      accentAlt: '0 4px 20px rgba(217,70,239,0.5)',
      badge: '0 4px 20px rgba(168,85,247,0.6)',
      subtle: '0 2px 8px rgba(168,85,247,0.2)'
    }
  },

  // Forest Theme - Green/Emerald
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Calm green/emerald',
    bg: {
      primary: '#0a0f0a',
      secondary: '#0f1a0f',
      tertiary: '#1a261a',
      input: '#0d120d'
    },
    border: {
      default: '#1a2a1a',
      hover: '#2a3a2a',
      active: '#10b981'
    },
    text: {
      primary: '#f0fdf4',
      secondary: '#86efac',
      tertiary: '#4ade80'
    },
    accent: {
      primary: '#10b981',
      secondary: '#22c55e',
      tertiary: '#34d399'
    },
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #10b981, #22c55e)',
      secondary: 'linear-gradient(135deg, #22c55e, #34d399)'
    },
    shadow: {
      card: '0 4px 16px rgba(16,185,129,0.1)',
      cardInverted: '0 -4px 16px rgba(16,185,129,0.1)',
      button: '0 2px 8px rgba(16,185,129,0.15)',
      accent: '0 4px 16px rgba(16,185,129,0.4)',
      accentAlt: '0 4px 16px rgba(34,197,94,0.4)',
      badge: '0 4px 16px rgba(16,185,129,0.5)',
      subtle: '0 2px 6px rgba(16,185,129,0.15)'
    }
  }
};

/**
 * Apply theme to the application
 */
export function applyTheme(themeId) {
  const theme = themes[themeId] || themes.dashboard;
  const root = document.documentElement;

  // Apply CSS custom properties
  Object.entries(theme.bg).forEach(([key, value]) => {
    root.style.setProperty(`--bg-${key}`, value);
  });

  Object.entries(theme.border).forEach(([key, value]) => {
    root.style.setProperty(`--border-${key}`, value);
  });

  Object.entries(theme.text).forEach(([key, value]) => {
    root.style.setProperty(`--text-${key}`, value);
  });

  Object.entries(theme.accent).forEach(([key, value]) => {
    root.style.setProperty(`--accent-${key}`, value);
  });

  // Set body background
  document.body.style.backgroundColor = theme.bg.primary;
  document.body.style.color = theme.text.primary;

  return theme;
}

export default themes;