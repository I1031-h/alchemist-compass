/**
 * Theme System for Alchemist's Compass
 * Supports multiple UI design patterns
 */

export const themes = {
  // Current Linear/Vercel style
  linear: {
    id: 'linear',
    name: 'Linear',
    description: 'モダン・洗練系（現在）',
    colors: {
      bg: {
        primary: '#000000',
        secondary: '#0f172a',
        tertiary: '#1e293b',
        card: 'rgba(15, 23, 42, 0.6)',
      },
      border: {
        default: '#334155',
        hover: '#475569',
        active: 'rgba(34, 211, 238, 0.3)',
      },
      accent: {
        cyan: '#22d3ee',
        blue: '#60a5fa',
        violet: '#a78bfa',
        emerald: '#34d399',
      },
      text: {
        primary: '#f1f5f9',
        secondary: '#94a3b8',
        tertiary: '#64748b',
      },
    },
    effects: {
      gradient: 'linear-gradient(to right, #22d3ee, #a78bfa)',
      backdropBlur: 'blur(20px)',
      borderRadius: '0.5rem',
    },
  },

  // Image 2 style - Systematic/Professional
  systematic: {
    id: 'systematic',
    name: 'Systematic',
    description: 'システマティック・開発ツール系',
    colors: {
      bg: {
        primary: '#1a2332',
        secondary: '#243447',
        tertiary: '#2d3e52',
        card: 'rgba(36, 52, 71, 0.8)',
      },
      border: {
        default: '#3d4f66',
        hover: '#4a5d7a',
        active: 'rgba(255, 107, 107, 0.4)',
      },
      accent: {
        coral: '#ff6b6b',
        orange: '#ff8787',
        blue: '#4dabf7',
        cyan: '#22d3ee',
      },
      text: {
        primary: '#e9ecef',
        secondary: '#adb5bd',
        tertiary: '#868e96',
      },
    },
    effects: {
      gradient: 'linear-gradient(to right, #ff6b6b, #ff8787)',
      backdropBlur: 'blur(10px)',
      borderRadius: '0.375rem',
    },
  },

  // Image 3 style - Minimal/Clean
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'ミニマル・機能重視',
    colors: {
      bg: {
        primary: '#2c3e50',
        secondary: '#34495e',
        tertiary: '#3d556b',
        card: 'rgba(52, 73, 94, 0.9)',
      },
      border: {
        default: '#4a6278',
        hover: '#5a7290',
        active: 'rgba(0, 217, 255, 0.4)',
      },
      accent: {
        cyan: '#00d9ff',
        white: '#ffffff',
        blue: '#5dade2',
        green: '#48c9b0',
      },
      text: {
        primary: '#ecf0f1',
        secondary: '#bdc3c7',
        tertiary: '#95a5a6',
      },
    },
    effects: {
      gradient: 'linear-gradient(to right, #00d9ff, #5dade2)',
      backdropBlur: 'blur(5px)',
      borderRadius: '0.25rem',
    },
  },
};

/**
 * Get theme by ID
 */
export function getTheme(themeId) {
  return themes[themeId] || themes.linear;
}

/**
 * Get all theme options for selector
 */
export function getThemeOptions() {
  return Object.values(themes).map(theme => ({
    value: theme.id,
    label: theme.name,
    description: theme.description,
  }));
}

/**
 * Apply theme to CSS variables
 */
export function applyTheme(themeId) {
  const theme = getTheme(themeId);
  const root = document.documentElement;

  // Background colors
  root.style.setProperty('--bg-primary', theme.colors.bg.primary);
  root.style.setProperty('--bg-secondary', theme.colors.bg.secondary);
  root.style.setProperty('--bg-tertiary', theme.colors.bg.tertiary);
  root.style.setProperty('--bg-card', theme.colors.bg.card);

  // Border colors
  root.style.setProperty('--border-default', theme.colors.border.default);
  root.style.setProperty('--border-hover', theme.colors.border.hover);
  root.style.setProperty('--border-active', theme.colors.border.active);

  // Accent colors
  const accentKeys = Object.keys(theme.colors.accent);
  accentKeys.forEach(key => {
    root.style.setProperty(`--accent-${key}`, theme.colors.accent[key]);
  });

  // Text colors
  root.style.setProperty('--text-primary', theme.colors.text.primary);
  root.style.setProperty('--text-secondary', theme.colors.text.secondary);
  root.style.setProperty('--text-tertiary', theme.colors.text.tertiary);

  // Effects
  root.style.setProperty('--gradient', theme.effects.gradient);
  root.style.setProperty('--backdrop-blur', theme.effects.backdropBlur);
  root.style.setProperty('--border-radius', theme.effects.borderRadius);
}