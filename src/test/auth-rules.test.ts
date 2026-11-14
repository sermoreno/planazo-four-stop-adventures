import {describe,it,expect} from 'vitest';
import {validPassword} from '@/features/planazo/auth-rules';
describe('Account passwords',()=>{it('requires at least eight characters',()=>{expect(validPassword('1234567')).toBe(false);expect(validPassword('12345678')).toBe(true);});});