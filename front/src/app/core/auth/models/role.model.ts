// Frontend authorization is a UX convenience only — the backend remains the
// authoritative enforcement point for every one of these roles.
export type Role = 'CUSTOMER' | 'B2B_PARTNER' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN';

export const ROLE_AREA_MAP: Record<'account' | 'b2b' | 'admin', readonly Role[]> = {
  account: ['CUSTOMER'],
  b2b: ['B2B_PARTNER', 'AGENT'],
  admin: ['ADMIN', 'SUPER_ADMIN'],
};
