import type { OrganizationRole } from '@/types/domain';

export function isOrganizationLeader(role?: OrganizationRole): boolean {
  return role === 'owner' || role === 'admin' || role === 'director';
}

export function canAdministerOrganization(role?: OrganizationRole): boolean {
  return role === 'owner' || role === 'admin';
}

export function canAddOrganizationSong(role?: OrganizationRole): boolean {
  return role !== undefined && role !== 'guest';
}

export function organizationRoleLabel(role?: OrganizationRole): string {
  if (role === 'owner') return 'Propietario';
  if (role === 'admin') return 'Administrador';
  if (role === 'director') return 'Líder';
  if (role === 'musician') return 'Músico';
  return 'Miembro';
}
