// Srinivasa Tiles — hand-authored line icon set (used inside .icon-badge wrappers)
const ICONS = {
  roof: `<svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7"/><path d="M5 10v9h14v-9"/><path d="M9 19v-5h6v5"/></svg>`,
  ceiling: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="6" rx="1"/><path d="M7 10v10M12 10v10M17 10v10"/></svg>`,
  jally: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`,
  ridge: `<svg viewBox="0 0 24 24"><path d="M4 18 12 6l8 12"/><path d="M8 18v-4h8v4"/></svg>`,
  leaf: `<svg viewBox="0 0 24 24"><path d="M5 21c9 0 14-5 14-14V5h-2C8 5 5 12 5 21Z"/><path d="M5 21c0-6 3-10 8-13"/></svg>`,
  heritage: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>`,
  shield: `<svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  truck: `<svg viewBox="0 0 24 24"><path d="M2 8h11v9H2z"/><path d="M13 11h4l4 3v3h-8z"/><circle cx="6" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/></svg>`,
  handshake: `<svg viewBox="0 0 24 24"><path d="m3 11 4-4 4 2 3-2 4 4"/><path d="M3 11v4l3 3 3-2 2 2 3-1 4-4"/></svg>`,
  scale: `<svg viewBox="0 0 24 24"><path d="M12 3v18M5 8h14M5 8l-3 6a3.5 3.5 0 0 0 7 0L6 8Z"/><path d="M19 8l-3 6a3.5 3.5 0 0 0 7 0l-4-6Z"/></svg>`,
  users: `<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="18" cy="9" r="2.6"/><path d="M15 13.3c2.9.4 5.5 2.9 5.5 6.7"/></svg>`,
  growth: `<svg viewBox="0 0 24 24"><path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/></svg>`,
  spark: `<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>`,
  quality: `<svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"/><path d="M9 12l2 2 4-4"/></svg>`,
  phone: `<svg viewBox="0 0 24 24"><path d="M6 3h3l1.5 4.5L8 9.5a12 12 0 0 0 6.5 6.5l2-2.5L21 15v3a2 2 0 0 1-2 2C10.7 20 4 13.3 4 5a2 2 0 0 1 2-2Z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`,
  pin: `<svg viewBox="0 0 24 24"><path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.4"/></svg>`,
  clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>`,
  globe: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 2.6 4.2 5.8 4.2 9s-1.4 6.4-4.2 9c-2.8-2.6-4.2-5.8-4.2-9s1.4-6.4 4.2-9Z"/></svg>`,
  download: `<svg viewBox="0 0 24 24"><path d="M12 3v13"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>`,
  menu: `<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><path d="m5 5 14 14M19 5 5 19"/></svg>`,
  layers: `<svg viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></svg>`,
  photo: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-4 4-3-3-6 6"/></svg>`,
  scroll: `<svg viewBox="0 0 24 24"><path d="M12 4v14"/><path d="m7 14 5 5 5-5"/></svg>`,
  building: `<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01"/></svg>`,
  whatsapp: `<svg viewBox="0 0 32 32"><path d="M16.02 4C9.4 4 4 9.4 4 16.02c0 2.24.6 4.34 1.66 6.15L4 28l6-1.6a11.9 11.9 0 0 0 6 1.62h.02c6.63 0 12.02-5.4 12.02-12.02C28.04 9.4 22.65 4 16.02 4Zm0 21.9a9.9 9.9 0 0 1-5.06-1.4l-.36-.22-3.56.95.95-3.47-.24-.36a9.86 9.86 0 0 1-1.53-5.36c0-5.46 4.44-9.9 9.9-9.9 2.65 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.46-4.5 9.86-10 9.86Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.74-1.63-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>`,
};

function iconBadge(name, opts) {
  opts = opts || {};
  const cls = ['icon-badge'];
  if (opts.size) cls.push(opts.size);
  if (opts.theme) cls.push(opts.theme);
  return `<span class="${cls.join(' ')}">${ICONS[name] || ''}</span>`;
}
