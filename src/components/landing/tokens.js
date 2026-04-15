export const C = {
  white:   '#ffffff',
  bg:      '#f5f5f7',
  text:    '#1d1d1f',
  muted:   '#6e6e73',
  blue:    '#0071e3',
  blueHov: '#0055b3',
  border:  'rgba(0,0,0,0.08)',
  serif:   "'Instrument Serif', Georgia, serif",
  sans:    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

export const navLinks = [
  { label: 'Features',   path: '/features' },
  { label: 'Mobile App', path: '/mobile-app' },
  { label: 'Security',   path: '/security' },
  { label: 'FAQ',        path: '/faq' },
  { label: 'About',      path: '/about' },
  { label: 'Contact',    path: '/contact' },
];

export const footerCols = [
  {
    heading: 'Platform',
    links: [
      { label: 'Principal Portal', path: '/login' },
      { label: 'Teacher Portal',   path: '/login' },
      { label: 'Parent Portal',    path: '/login' },
      { label: 'Mobile App',       path: '/mobile-app' },
      { label: 'Reports',          path: '/features' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',    path: '/about' },
      { label: 'Security', path: '/security' },
      { label: 'FAQ',      path: '/faq' },
      { label: 'Contact',  path: '/contact' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Support',          path: '/public-support' },
      { label: 'Privacy Policy',   path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
    ],
  },
];
