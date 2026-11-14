import {describe,expect,it} from 'vitest';
import {createClient} from '@supabase/supabase-js';
import {readFileSync} from 'node:fs';
const enabled=process.env['RUN_LIVE_RLS']==='1';
function clients(){
  const owner=JSON.parse(readFileSync(process.env['RLS_OWNER_SESSION_FILE']??'/tmp/browser/users/owner-session.json','utf8'));
  const other=JSON.parse(readFileSync(process.env['RLS_OTHER_SESSION_FILE']??'/root/.cache/lovable-auth/session.json','utf8'));
  const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
  if(!url||!key)throw new Error('Cloud configuration required');
  const client=(token?:string)=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,storageKey:`rls-test-${Math.random()}`},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);h.set('apikey',key);if(token)h.set('Authorization',`Bearer ${token}`);else h.delete('Authorization');return fetch(input,{...init,headers:h});}}});
  return {a:client(owner.session.access_token),b:client(other.session.access_token),anon:client(),owner:owner.user_id,other:other.user_id};
}
describe.skipIf(!enabled)('Live user RLS using two authorized sessions',()=>{
  it('owner reads existing private plans, another user cannot read them',async()=>{
    const {a,b}=clients();const own=await a.from('itineraries').select('id,user_id');expect(own.error).toBeNull();expect(own.data?.length).toBeGreaterThan(0);
    const ids=own.data?.map(p=>p.id)??[];const foreign=await b.from('itineraries').select('id').in('id',ids);expect(foreign.error).toBeNull();expect(foreign.data).toEqual([]);
    for(const table of ['itinerary_items','chat_messages']){const result=await b.from(table).select('id').in('itinerary_id',ids);expect(result.error).toBeNull();expect(result.data).toEqual([]);}
  });
  it('another user cannot read or edit the owner profile',async()=>{
    const {a,b}=clients();const own=await a.from('profiles').select('id,display_name').single();expect(own.error).toBeNull();expect(own.data).toBeTruthy();
    const foreign=await b.from('profiles').select('id').eq('id',own.data?.id);expect(foreign.data).toEqual([]);
    const update=await b.from('profiles').update({display_name:'No permitido'}).eq('id',own.data?.id).select('id');expect(update.error).toBeNull();expect(update.data).toEqual([]);
  });
  it('another user cannot update or delete the owner plan',async()=>{
    const {a,b}=clients();const own=await a.from('itineraries').select('id,title').limit(1).single();expect(own.error).toBeNull();
    const update=await b.from('itineraries').update({title:'No permitido'}).eq('id',own.data?.id).select('id');expect(update.error).toBeNull();expect(update.data).toEqual([]);
    const del=await b.from('itineraries').delete().eq('id',own.data?.id).select('id');expect(del.error).toBeNull();expect(del.data).toEqual([]);
    const read=await a.from('itineraries').select('title').eq('id',own.data?.id).single();expect(read.data?.title).toBe(own.data?.title);
  });
  it('profile plan tier cannot be elevated by its owner',async()=>{const {a}=clients();const row=await a.from('profiles').select('id').single();const result=await a.from('profiles').update({plan_tier:'premium'}).eq('id',row.data?.id);expect(result.error?.code).toBe('42501');});
  it('anonymous access cannot read private data but can read the catalog',async()=>{const {anon}=clients();for(const table of ['profiles','preferences','itineraries','itinerary_items','chat_messages','geocode_cache']){const result=await anon.from(table).select('*').limit(1);expect(result.error?.code).toBe('42501');}const catalog=await anon.from('places').select('id').limit(1);expect(catalog.error).toBeNull();expect(catalog.data?.length).toBe(1);});
  it('trigger functions cannot be invoked by visitors',async()=>{const {anon}=clients();for(const fn of ['new_profile','limit_saved_plans']){const result=await anon.rpc(fn);expect(result.error).toBeTruthy();}});
  it('another user cannot link plans to owner preferences',async()=>{
    const {a,b,owner,other}=clients();
    const pref=await a.from('preferences').insert({user_id:owner,companions:'familia'}).select('id').single();expect(pref.error).toBeNull();
    try{const linked=await b.from('itineraries').insert({user_id:other,title:'Prueba enlace denegado',preference_id:pref.data?.id}).select('id');
      if(linked.data?.length)await b.from('itineraries').delete().eq('id',linked.data[0]?.id);
      expect(linked.error?.code).toBe('42501');
    }finally{const cleanup=await a.from('preferences').delete().eq('id',pref.data?.id);expect(cleanup.error).toBeNull();}
  });
});
