import { Registry } from './types.js';

// ── Tailwind-Native Registry (default) ──
// Components render as native HTML tags + Tailwind utility classes.
// Modifier chains compose class strings — no import paths needed.
export const REGISTRY: Registry = {
  // ── UI Components ──
  btn: {
    component: 'button',
    importPath: '',
    defaultProps: { type: 'button' },
    defaultContent: 'Button',
    modifiers: {
      pri: { className: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors inline-flex items-center justify-center font-medium h-10 px-4 py-2 rounded-md text-sm' },
      sec: { className: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 transition-colors inline-flex items-center justify-center font-medium h-10 px-4 py-2 rounded-md text-sm' },
      gh: { className: 'bg-transparent hover:bg-gray-100 text-gray-700 transition-colors inline-flex items-center justify-center font-medium h-10 px-4 py-2 rounded-md text-sm' },
      out: { className: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors inline-flex items-center justify-center font-medium h-10 px-4 py-2 rounded-md text-sm' },
      lg: { className: 'h-12 px-8 text-base rounded-lg' },
      sm: { className: 'h-8 px-3 text-xs rounded-md' },
      r: { className: 'rounded-full px-6' },
    },
  },
  card: {
    component: 'div',
    importPath: '',
    defaultProps: {},
    modifiers: {
      out: { className: 'rounded-lg border border-gray-200 bg-white shadow-sm' },
      sm: { className: 'p-4' },
      lg: { className: 'p-8' },
      int: { className: 'bg-white shadow-md rounded-xl' },
    },
  },
  bge: {
    component: 'span',
    importPath: '',
    defaultProps: {},
    modifiers: {
      subtle: { className: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600' },
      pri: { className: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-600 text-white' },
    },
  },
  ava: {
    component: 'span',
    importPath: '',
    defaultProps: {},
    modifiers: {
      sm: { className: 'relative inline-flex items-center justify-center rounded-full bg-gray-200 h-8 w-8' },
      md: { className: 'relative inline-flex items-center justify-center rounded-full bg-gray-200 h-10 w-10' },
      lg: { className: 'relative inline-flex items-center justify-center rounded-full bg-gray-200 h-12 w-12' },
    },
  },
  inp: {
    component: 'input',
    importPath: '',
    defaultProps: { type: 'text' },
    modifiers: {
      txt: { prop: 'type', value: 'text' },
      pwd: { prop: 'type', value: 'password' },
      eml: { prop: 'type', value: 'email' },
      num: { prop: 'type', value: 'number' },
    },
  },
  sel: {
    component: 'select',
    importPath: '',
    defaultProps: {},
    modifiers: {},
  },
  quote: {
    component: 'blockquote',
    importPath: '',
    defaultProps: {},
    modifiers: {},
  },

  // ── Layout Components ──
  nav: {
    component: 'nav',
    importPath: '',
    defaultProps: {},
    modifiers: {
      gls: { className: 'backdrop-blur-md bg-white/10 border-b' },
      fix: { className: 'fixed top-0 left-0 right-0 z-50 px-4 py-3' },
      dk: { className: 'bg-gray-900 text-white' },
      sticky: { className: 'sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b' },
    },
  },
  sec: {
    component: 'section',
    importPath: '',
    defaultProps: {},
    modifiers: {
      dk: { className: 'bg-gray-900 text-white' },
      hero: { className: 'min-h-screen flex items-center' },
    },
  },
  stk: {
    component: 'div',
    importPath: '',
    defaultProps: {},
    modifiers: {
      v: { className: 'flex flex-col' },
      h: { className: 'flex flex-row' },
      ctr: { className: 'items-center justify-center' },
      wrap: { className: 'flex-wrap' },
      gap: { className: 'gap-4' },
      gap2: { className: 'gap-8' },
    },
  },
  grd: {
    component: 'div',
    importPath: '',
    defaultProps: {},
    modifiers: {
      '2': { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
      '3': { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
      '4': { className: 'grid grid-cols-2 lg:grid-cols-4 gap-6' },
    },
  },
  cnt: {
    component: 'div',
    importPath: '',
    defaultProps: {},
    modifiers: {
      mx: { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
      sm: { className: 'max-w-3xl mx-auto px-4' },
      lg: { className: 'max-w-screen-xl mx-auto px-4' },
    },
  },
  txt: {
    component: 'p',
    importPath: '',
    defaultProps: {},
    defaultContent: 'Text',
    modifiers: {
      h1: { className: 'text-3xl font-bold tracking-tight sm:text-4xl' },
      h2: { className: 'text-2xl font-semibold tracking-tight' },
      h3: { className: 'text-xl font-semibold' },
      p: { className: 'text-base leading-7' },
      sub: { className: 'text-sm text-gray-500' },
      cen: { className: 'text-center' },
      xl: { className: 'text-lg' },
      muted: { className: 'text-gray-500' },
      bold: { className: 'font-bold' },
    },
  },
  h1: {
    component: 'h1',
    importPath: '',
    defaultProps: {},
    modifiers: {},
  },
  h2: {
    component: 'h2',
    importPath: '',
    defaultProps: {},
    modifiers: {},
  },
  h3: {
    component: 'h3',
    importPath: '',
    defaultProps: {},
    modifiers: {},
  },
  lnk: {
    component: 'a',
    importPath: '',
    defaultProps: {},
    modifiers: {
      pri: { className: 'text-blue-600 hover:text-blue-800 underline underline-offset-4' },
      sec: { className: 'text-gray-600 hover:text-gray-900 underline underline-offset-4' },
      nav: { className: 'text-sm font-medium hover:text-blue-600 transition-colors' },
    },
  },
  code: {
    component: 'code',
    importPath: '',
    defaultProps: {},
    modifiers: {
      block: { className: 'block bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto' },
      inline: { className: 'bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono' },
    },
  },

  // ── Media ──
  img: {
    component: 'img',
    importPath: '',
    defaultProps: { alt: '' },
    modifiers: {
      rnd: { className: 'rounded-lg' },
      full: { className: 'w-full h-full object-cover' },
      circle: { className: 'rounded-full' },
      shadow: { className: 'shadow-lg' },
    },
  },
  icon: {
    component: 'span',
    importPath: '',
    defaultProps: {},
    modifiers: {
      sm: { className: 'inline-block h-4 w-4' },
      md: { className: 'inline-block h-5 w-5' },
      lg: { className: 'inline-block h-6 w-6' },
    },
  },

  // ── Page Sections ──
  hero: {
    component: 'section',
    importPath: '',
    defaultProps: {},
    modifiers: {
      cen: { className: 'w-full py-20 md:py-32 flex flex-col items-center text-center px-4' },
      left: { className: 'w-full py-20 md:py-32 px-4' },
      dk: { className: 'bg-gray-900 text-white' },
    },
  },
  feat: {
    component: 'section',
    importPath: '',
    defaultProps: {},
    modifiers: {
      '3': { className: 'w-full py-16 grid grid-cols-1 md:grid-cols-3 gap-8' },
      '2': { className: 'w-full py-16 grid grid-cols-1 md:grid-cols-2 gap-8' },
      '4': { className: 'w-full py-16 grid grid-cols-2 lg:grid-cols-4 gap-6' },
    },
  },
  cta: {
    component: 'section',
    importPath: '',
    defaultProps: {},
    modifiers: {
      cen: { className: 'w-full py-16 md:py-24 text-center px-4' },
      dk: { className: 'bg-gray-900 text-white' },
      lg: { className: 'py-24 px-8' },
    },
  },
  ft: {
    component: 'footer',
    importPath: '',
    defaultProps: {},
    modifiers: {
      dk: { className: 'bg-gray-900 text-white' },
      cen: { className: 'text-center' },
      sm: { className: 'py-8 text-sm' },
    },
  },

  // ── Misc ──
  tab: {
    component: 'div',
    importPath: '',
    defaultProps: {},
    modifiers: {
      h: { className: 'flex space-x-1 rounded-lg bg-gray-100 p-1' },
      v: { className: 'flex flex-col space-y-1' },
    },
  },
  lst: {
    component: 'ul',
    importPath: '',
    defaultProps: {},
    modifiers: {
      ul: { className: 'list-disc pl-6 space-y-2' },
      ol: { className: 'list-decimal pl-6 space-y-2' },
      none: { className: 'list-none p-0' },
      inline: { className: 'flex flex-wrap gap-2' },
    },
  },
  div: {
    component: 'hr',
    importPath: '',
    defaultProps: {},
    modifiers: {
      sm: { className: 'my-4 border-gray-200' },
      lg: { className: 'my-12 border-gray-200' },
    },
  },
  spn: {
    component: 'span',
    importPath: '',
    defaultProps: {},
    modifiers: {
      sm: { className: 'inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600' },
      lg: { className: 'inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600' },
      col: { className: 'text-current' },
    },
  },

  // ── Form Components ──
  frm: {
    component: 'form',
    importPath: '',
    defaultProps: { method: 'POST' },
    modifiers: {},
  },
  lbl: {
    component: 'label',
    importPath: '',
    defaultProps: {},
    modifiers: {
      sm: { className: 'text-sm font-medium leading-none' },
    },
  },
  txa: {
    component: 'textarea',
    importPath: '',
    defaultProps: { rows: 4 },
    modifiers: {
      sm: { prop: 'rows', value: 2 },
      lg: { prop: 'rows', value: 8 },
    },
  },
  chk: {
    component: 'input',
    importPath: '',
    defaultProps: { type: 'checkbox' },
    modifiers: {},
  },
  swt: {
    component: 'button',
    importPath: '',
    defaultProps: { role: 'switch', type: 'button' },
    modifiers: {
      sm: { className: 'h-4 w-8 rounded-full bg-gray-300 data-[state=checked]:bg-blue-600 transition-colors' },
      lg: { className: 'h-6 w-12 rounded-full bg-gray-300 data-[state=checked]:bg-blue-600 transition-colors' },
    },
  },
  rad: {
    component: 'div',
    importPath: '',
    defaultProps: {},
    modifiers: {
      h: { className: 'flex items-center space-x-4' },
      v: { className: 'flex flex-col space-y-3' },
    },
  },
};

// ── Component-Library Registry (legacy) ──
// Used via --lib flag or when explicitly passed to compile().
// Each entry references a React component import path.
export const REGISTRY_LIB: Registry = {
  btn: {
    component: 'Button',
    importPath: '@/components/ui/button',
    defaultProps: { variant: 'default', size: 'default' },
    defaultContent: 'Button',
    modifiers: {
      pri: { prop: 'variant', value: 'primary' },
      sec: { prop: 'variant', value: 'secondary' },
      gh: { prop: 'variant', value: 'ghost' },
      out: { prop: 'variant', value: 'outline' },
      lg: { prop: 'size', value: 'lg' },
      sm: { prop: 'size', value: 'sm' },
      r: { className: 'self-end' },
    },
  },
  card: {
    component: 'Card',
    importPath: '@/components/ui/card',
    defaultProps: {},
    modifiers: {},
  },
  bge: {
    component: 'Badge',
    importPath: '@/components/ui/badge',
    defaultProps: {},
    modifiers: {
      subtle: { prop: 'variant', value: 'secondary' },
    },
  },
  ava: {
    component: 'Avatar',
    importPath: '@/components/ui/avatar',
    defaultProps: {},
    modifiers: {},
  },
  inp: {
    component: 'Input',
    importPath: '@/components/ui/input',
    defaultProps: { type: 'text' },
    modifiers: {
      txt: { prop: 'type', value: 'text' },
      pwd: { prop: 'type', value: 'password' },
      eml: { prop: 'type', value: 'email' },
    },
  },
  sel: {
    component: 'Select',
    importPath: '@/components/ui/select',
    defaultProps: {},
    modifiers: {},
  },
  quote: {
    component: 'Blockquote',
    importPath: '@/components/typography/blockquote',
    defaultProps: {},
    modifiers: {},
  },
  nav: {
    component: 'Navbar',
    importPath: '@/components/layout/navbar',
    defaultProps: {},
    modifiers: {
      gls: { className: 'backdrop-blur-md bg-white/10 border-b' },
      fix: { className: 'fixed top-0 left-0 right-0 z-50 px-4 py-3' },
      dk: { className: 'dark bg-slate-900 text-white' },
    },
  },
  sec: {
    component: 'Section',
    importPath: '@/components/layout/section',
    defaultProps: {},
    modifiers: {
      dk: { className: 'dark bg-slate-900 text-white' },
      hero: { className: 'min-h-screen flex items-center' },
    },
  },
  stk: {
    component: 'Stack',
    importPath: '@/components/layout/stack',
    defaultProps: { direction: 'column' },
    modifiers: {
      v: { prop: 'direction', value: 'column' },
      h: { prop: 'direction', value: 'row' },
      ctr: { className: 'items-center justify-center' },
    },
  },
  grd: {
    component: 'Grid',
    importPath: '@/components/layout/grid',
    defaultProps: {},
    modifiers: {},
  },
  cnt: {
    component: 'Container',
    importPath: '@/components/layout/container',
    defaultProps: {},
    modifiers: { mx: { className: 'max-w-7xl mx-auto' } },
  },
  txt: {
    component: 'Text',
    importPath: '@/components/typography/text',
    defaultProps: { as: 'p' },
    defaultContent: 'Text',
    modifiers: {
      h1: { prop: 'as', value: 'h1' },
      h2: { prop: 'as', value: 'h2' },
      p: { prop: 'as', value: 'p' },
      sub: { className: 'text-muted-foreground' },
      cen: { className: 'text-center' },
      xl: { className: 'text-xl' },
    },
  },
  h1: {
    component: 'Heading1',
    importPath: '@/components/typography/heading',
    defaultProps: { level: 1 },
    modifiers: {},
  },
  h2: {
    component: 'Heading2',
    importPath: '@/components/typography/heading',
    defaultProps: { level: 2 },
    modifiers: {},
  },
  h3: {
    component: 'Heading3',
    importPath: '@/components/typography/heading',
    defaultProps: { level: 3 },
    modifiers: {},
  },
  lnk: {
    component: 'Link',
    importPath: 'next/link',
    defaultProps: {},
    modifiers: {},
  },
  code: {
    component: 'Code',
    importPath: '@/components/typography/code',
    defaultProps: {},
    modifiers: {},
  },
  img: {
    component: 'Image',
    importPath: 'next/image',
    defaultProps: { alt: '' },
    modifiers: {
      rnd: { className: 'rounded-lg' },
    },
  },
  icon: {
    component: 'Icon',
    importPath: 'lucide-react',
    defaultProps: { size: 24 },
    modifiers: {},
  },
  hero: {
    component: 'HeroSection',
    importPath: '@/components/layout/hero-section',
    defaultProps: {},
    modifiers: {
      cen: { className: 'text-center items-center' },
      left: { className: 'text-left items-start' },
      dk: { className: 'bg-slate-900 text-white' },
    },
  },
  feat: {
    component: 'FeatureGrid',
    importPath: '@/components/layout/feature-grid',
    defaultProps: { columns: 3 },
    modifiers: {
      '3': { prop: 'columns', value: 3 },
      '2': { prop: 'columns', value: 2 },
      '4': { prop: 'columns', value: 4 },
    },
  },
  cta: {
    component: 'CallToAction',
    importPath: '@/components/layout/cta-section',
    defaultProps: {},
    modifiers: {
      cen: { className: 'text-center' },
      dk: { className: 'bg-slate-900 text-white' },
      lg: { className: 'py-24 px-8' },
    },
  },
  ft: {
    component: 'Footer',
    importPath: '@/components/layout/footer',
    defaultProps: {},
    modifiers: {
      dk: { className: 'bg-slate-900 text-white' },
      cen: { className: 'text-center' },
      sm: { className: 'py-8 text-sm' },
    },
  },
  tab: {
    component: 'Tabs',
    importPath: '@/components/ui/tabs',
    defaultProps: {},
    modifiers: {},
  },
  lst: {
    component: 'List',
    importPath: '@/components/ui/list',
    defaultProps: { as: 'ul' },
    modifiers: {
      ul: { prop: 'as', value: 'ul' },
      ol: { prop: 'as', value: 'ol' },
    },
  },
  div: {
    component: 'Divider',
    importPath: '@/components/ui/divider',
    defaultProps: {},
    modifiers: {
      sm: { className: 'my-4' },
      lg: { className: 'my-12' },
    },
  },
  spn: {
    component: 'Spinner',
    importPath: '@/components/ui/spinner',
    defaultProps: { size: 'default' },
    modifiers: {
      sm: { prop: 'size', value: 'sm' },
      lg: { prop: 'size', value: 'lg' },
      col: { className: 'text-current' },
    },
  },
  frm: {
    component: 'Form',
    importPath: '@/components/ui/form',
    defaultProps: { method: 'POST' },
    modifiers: {},
  },
  lbl: {
    component: 'Label',
    importPath: '@/components/ui/label',
    defaultProps: {},
    modifiers: {},
  },
  txa: {
    component: 'Textarea',
    importPath: '@/components/ui/textarea',
    defaultProps: { rows: 4 },
    modifiers: {
      sm: { prop: 'rows', value: 2 },
      lg: { prop: 'rows', value: 8 },
    },
  },
  chk: {
    component: 'Checkbox',
    importPath: '@/components/ui/checkbox',
    defaultProps: {},
    modifiers: {},
  },
  swt: {
    component: 'Switch',
    importPath: '@/components/ui/switch',
    defaultProps: {},
    modifiers: {
      sm: { className: 'h-4 w-8' },
      lg: { className: 'h-6 w-12' },
    },
  },
  rad: {
    component: 'RadioGroup',
    importPath: '@/components/ui/radio-group',
    defaultProps: {},
    modifiers: {
      h: { prop: 'direction', value: 'row' },
      v: { prop: 'direction', value: 'column' },
    },
  },
};

/** Merge multiple registries (later override earlier at the entry level). */
export function mergeRegistries(...registries: Registry[]): Registry {
  return Object.assign({}, ...registries);
}
