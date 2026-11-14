import {describe,it,expect} from 'vitest';
import {requireAdminRole} from '@/features/planazo/admin-access';
describe('Admin server authorization',()=>{
  it('denies authenticated users without an admin role',async()=>{await expect(requireAdminRole(async()=>false)).rejects.toThrow('Acceso restringido');});
  it('allows a verified admin role',async()=>{await expect(requireAdminRole(async()=>true)).resolves.toBeUndefined();});
  it('does not authorize when role validation fails',async()=>{await expect(requireAdminRole(async()=>{throw new Error('unavailable');})).rejects.toThrow('unavailable');});
});