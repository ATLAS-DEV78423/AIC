import { Registry } from './types.js';

export const REGISTRY: Registry = {
  // ── UI Components ──
  btn: {
    component: 'Button',
    importPath: '@/components/ui/button',
    defaultProps: { variant: 'default', size: 'default' },
    defaultContent: 'Button',
    variantProps: {
      pri: { variant: 'primary' },
      sec: { variant: 'secondary' },
      gh: { variant: 'ghost' },
      out: { variant: 'outline' },
      lg: { size: 'lg' },
      sm: { size: 'sm' },
      r: { className: 'self-end' },
    },
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
    variantProps: {},
    modifiers: {},
  },
  bge: {
    component: 'Badge',
    importPath: '@/components/ui/badge',
    defaultProps: {},
    variantProps: {
      subtle: { variant: 'secondary' },
      pri: { variant: 'default' },
    },
    modifiers: {
      subtle: { prop: 'variant', value: 'secondary' },
    },
  },
  ava: {
    component: 'Avatar',
    importPath: '@/components/ui/avatar',
    defaultProps: {},
    variantProps: {
      sm: { className: 'h-8 w-8' },
      lg: { className: 'h-12 w-12' },
    },
    modifiers: {},
  },
  inp: {
    component: 'Input',
    importPath: '@/components/ui/input',
    defaultProps: { type: 'text' },
    variantProps: {
      txt: { type: 'text' },
      pwd: { type: 'password' },
      eml: { type: 'email' },
    },
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
    variantProps: {},
    modifiers: {},
  },
  quote: {
    component: 'Blockquote',
    importPath: '@/components/typography/blockquote',
    defaultProps: {},
    variantProps: {},
    modifiers: {},
  },

  // ── Layout Components ──
  nav: {
    component: 'Navbar',
    importPath: '@/components/layout/navbar',
    defaultProps: {},
    variantProps: {
      gls: { className: 'backdrop-blur-md bg-white/10 border-b' },
      fix: { className: 'fixed top-0 left-0 right-0 z-50 px-4 py-3' },
      dk: { className: 'dark bg-slate-900 text-white' },
    },
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
    variantProps: {
      dk: { className: 'dark bg-slate-900 text-white' },
      hero: { className: 'min-h-screen flex items-center' },
      feat: { className: 'py-24' },
    },
    modifiers: {
      dk: { className: 'dark bg-slate-900 text-white' },
      hero: { className: 'min-h-screen flex items-center' },
    },
  },
  stk: {
    component: 'Stack',
    importPath: '@/components/layout/stack',
    defaultProps: { direction: 'column' },
    variantProps: {
      v: { direction: 'column' },
      h: { direction: 'row' },
      ctr: { className: 'items-center justify-center' },
    },
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
    variantProps: {},
    modifiers: {},
  },
  cnt: {
    component: 'Container',
    importPath: '@/components/layout/container',
    defaultProps: {},
    variantProps: {
      mx: { className: 'max-w-7xl mx-auto' },
    },
    modifiers: { mx: { className: 'max-w-7xl mx-auto' } },
  },

  // ── Typography ──
  txt: {
    component: 'Text',
    importPath: '@/components/typography/text',
    defaultProps: { as: 'p' },
    defaultContent: 'Text',
    variantProps: {
      h1: { as: 'h1' },
      h2: { as: 'h2' },
      h3: { as: 'h3' },
      p: { as: 'p' },
      sub: { className: 'text-muted-foreground' },
      cen: { className: 'text-center' },
      xl: { className: 'text-xl' },
    },
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
    variantProps: {},
    modifiers: {},
  },
  h2: {
    component: 'Heading2',
    importPath: '@/components/typography/heading',
    defaultProps: { level: 2 },
    variantProps: {},
    modifiers: {},
  },
  h3: {
    component: 'Heading3',
    importPath: '@/components/typography/heading',
    defaultProps: { level: 3 },
    variantProps: {},
    modifiers: {},
  },
  lnk: {
    component: 'Link',
    importPath: 'next/link',
    defaultProps: {},
    variantProps: {},
    modifiers: {},
  },
  code: {
    component: 'Code',
    importPath: '@/components/typography/code',
    defaultProps: {},
    variantProps: {},
    modifiers: {},
  },

  // ── Media ──
  img: {
    component: 'Image',
    importPath: 'next/image',
    defaultProps: { alt: '' },
    variantProps: {
      rnd: { className: 'rounded-lg' },
      full: { className: 'w-full h-full object-cover' },
    },
    modifiers: {
      rnd: { className: 'rounded-lg' },
    },
  },
  icon: {
    component: 'Icon',
    importPath: 'lucide-react',
    defaultProps: { size: 24 },
    variantProps: {},
    modifiers: {},
  },

  // ── Phase 1: Enhanced Registry ──
  hero: {
    component: 'HeroSection',
    importPath: '@/components/layout/hero-section',
    defaultProps: {},
    variantProps: {
      cen: { className: 'text-center items-center' },
      left: { className: 'text-left items-start' },
      dk: { className: 'bg-slate-900 text-white' },
    },
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
    variantProps: {
      '3': { columns: 3 },
      '2': { columns: 2 },
      '4': { columns: 4 },
    },
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
    variantProps: {
      cen: { className: 'text-center' },
      dk: { className: 'bg-slate-900 text-white' },
      lg: { className: 'py-24 px-8' },
    },
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
    variantProps: {
      dk: { className: 'bg-slate-900 text-white' },
      cen: { className: 'text-center' },
      sm: { className: 'py-8 text-sm' },
    },
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
    variantProps: {},
    modifiers: {},
  },
  lst: {
    component: 'List',
    importPath: '@/components/ui/list',
    defaultProps: { as: 'ul' },
    variantProps: {
      ul: { as: 'ul' },
      ol: { as: 'ol' },
    },
    modifiers: {
      ul: { prop: 'as', value: 'ul' },
      ol: { prop: 'as', value: 'ol' },
    },
  },
  div: {
    component: 'Divider',
    importPath: '@/components/ui/divider',
    defaultProps: {},
    variantProps: {
      sm: { className: 'my-4' },
      lg: { className: 'my-12' },
    },
    modifiers: {
      sm: { className: 'my-4' },
      lg: { className: 'my-12' },
    },
  },
  spn: {
    component: 'Spinner',
    importPath: '@/components/ui/spinner',
    defaultProps: { size: 'default' },
    variantProps: {
      sm: { size: 'sm' },
      lg: { size: 'lg' },
      col: { className: 'text-current' },
    },
    modifiers: {
      sm: { prop: 'size', value: 'sm' },
      lg: { prop: 'size', value: 'lg' },
      col: { className: 'text-current' },
    },
  },

  // ── Phase 2: Form Components ──
  frm: {
    component: 'Form',
    importPath: '@/components/ui/form',
    defaultProps: { method: 'POST' },
    variantProps: {},
    modifiers: {},
  },
  lbl: {
    component: 'Label',
    importPath: '@/components/ui/label',
    defaultProps: {},
    variantProps: {},
    modifiers: {},
  },
  txa: {
    component: 'Textarea',
    importPath: '@/components/ui/textarea',
    defaultProps: { rows: 4 },
    variantProps: {
      sm: { rows: 2 },
      lg: { rows: 8 },
    },
    modifiers: {
      sm: { prop: 'rows', value: 2 },
      lg: { prop: 'rows', value: 8 },
    },
  },
  chk: {
    component: 'Checkbox',
    importPath: '@/components/ui/checkbox',
    defaultProps: {},
    variantProps: {},
    modifiers: {},
  },
  swt: {
    component: 'Switch',
    importPath: '@/components/ui/switch',
    defaultProps: {},
    variantProps: {
      sm: { className: 'h-4 w-8' },
      lg: { className: 'h-6 w-12' },
    },
    modifiers: {
      sm: { className: 'h-4 w-8' },
      lg: { className: 'h-6 w-12' },
    },
  },
  rad: {
    component: 'RadioGroup',
    importPath: '@/components/ui/radio-group',
    defaultProps: {},
    variantProps: {
      h: { direction: 'row' },
      v: { direction: 'column' },
    },
    modifiers: {
      h: { prop: 'direction', value: 'row' },
      v: { prop: 'direction', value: 'column' },
    },
  },
};

export function createRegistry(): Registry {
  return { ...REGISTRY };
}

/** Merge multiple registries (later override earlier at the entry level). */
export function mergeRegistries(...registries: Registry[]): Registry {
  return Object.assign({}, ...registries);
}
