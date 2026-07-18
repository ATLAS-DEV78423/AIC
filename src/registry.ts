import { Registry } from './types.js';

export const REGISTRY: Registry = {
  // ── UI Components ──
  btn: {
    component: 'Button',
    importPath: '@/components/ui/button',
    defaultProps: { variant: 'default', size: 'default' },
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
};

export function createRegistry(): Registry {
  return { ...REGISTRY };
}
