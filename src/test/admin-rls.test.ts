import {describe,it,expect} from 'vitest';
import {createClient} from '@supabase/supabase-js';
import {readFileSync} from 'node:fs';
const enabled=process.env['RUN_LIVE_ADMIN_RLS']==='1';
function client(file:string){
  const session=JSON.parse(readFileSync(file,'utf8'));
  const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
  if(!url||!key)throw new Error('Cloud configuration required');
  return {id:session.user_id,token:session.session.access_token,client:createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,storageKey:`admin-test-${session.user_id}`},global:{fetch:(input,init)=>{const headers=new Headers(init?.headers);headers.set('apikey',key);headers.set('Authorization',`Bearer ${session.session.access_token}`);return fetch(input,{...init,headers});}}})};
}
describe.skipIf(!enabled)('Restricted administrator RLS',()=>{
  it('grants admin to the verified sermoreno@gmail.com account',async()=>{
    const {client:admin,id,token}=client('/tmp/browser/admin/admin-session.json');
    const user=await admin.auth.getUser(token);expect(user.error).toBeNull();expect(user.data.user?.email).toBe('sermoreno@gmail.com');expect(user.data.user?.email_confirmed_at).toBeTruthy();
    const role=await admin.rpc('has_role',{_user_id:id,_role:'admin'});expect(role.error).toBeNull();expect(role.data).toBe(true);
  });
  it('denies admin to another account and prevents self-promotion',async()=>{
    const {client:other,id}=client('/root/.cache/lovable-auth/session.json');
    const role=await other.rpc('has_role',{_user_id:id,_role:'admin'});expect(role.error).toBeNull();expect(role.data).toBe(false);
    const insert=await other.from('user_roles').insert({user_id:id,role:'admin'});expect(insert.error?.code).toBe('42501');
    const forged=await other.rpc('has_role',{_user_id:'eed0a79f-6f85-4db3-9257-65621b0581c9',_role:'admin'});expect(forged.data).toBe(false);
  });
});