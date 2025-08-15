// Centralised app constants and simple mock data

// Update with your family list (key is a stable user id/slug)
export const FAMILY_MEMBERS = {
  keagan: { id: 'keagan', name: 'Keagan', email: 'keagan@example.com' },
  emma:   { id: 'emma',   name: 'Emma',   email: 'emma@example.com' },
  liam:   { id: 'liam',   name: 'Liam',   email: 'liam@example.com' },
  aoife:  { id: 'aoife',  name: 'Aoife',  email: 'aoife@example.com' }
};

// Dates (set these how you like; they’re just front-end placeholders)
export const DRAW_DATE = new Date('2025-12-10T18:00:00');     // The draw happens at this time
export const CHRISTMAS_DATE = new Date('2025-12-25T00:00:00'); // Christmas day
export const IS_DRAW_COMPLETE = Date.now() >= DRAW_DATE.getTime();

// LocalStorage keys used in this mock
export const LS_KEYS = {
  CURRENT_USER: 'ss_current_user',
  WISHLISTS: 'ss_wishlists',         // { [userId]: WishlistItem[] }
  ASSIGNMENTS: 'ss_assignments'      // { [buyerId]: recipientUserId }
};

// Simple red/white theme shared in CSS via variables
export const THEME = {
  red: '#c1002d',
  redDark: '#990022',
  white: '#ffffff',
  snow: '#fff7f9',
  slate: '#222222',
  gray: '#f1f1f1',
};

