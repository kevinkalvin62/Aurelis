import { describe, expect, it } from 'vitest';
import { canAddOrganizationSong, canAdministerOrganization, isOrganizationLeader, organizationRoleLabel } from './permissions';

describe('organization permissions', () => {
  it('allows every registered member to add songs', () => {
    expect(canAddOrganizationSong('musician')).toBe(true);
    expect(canAddOrganizationSong('director')).toBe(true);
    expect(canAddOrganizationSong('guest')).toBe(false);
  });

  it('limits administration to owner and admin', () => {
    expect(canAdministerOrganization('owner')).toBe(true);
    expect(canAdministerOrganization('admin')).toBe(true);
    expect(canAdministerOrganization('director')).toBe(false);
    expect(canAdministerOrganization('musician')).toBe(false);
  });

  it('allows leaders to create and manage programs', () => {
    expect(isOrganizationLeader('owner')).toBe(true);
    expect(isOrganizationLeader('admin')).toBe(true);
    expect(isOrganizationLeader('director')).toBe(true);
    expect(isOrganizationLeader('musician')).toBe(false);
  });

  it('presents roles in Spanish', () => {
    expect(organizationRoleLabel('owner')).toBe('Propietario');
    expect(organizationRoleLabel('musician')).toBe('Músico');
  });
});
