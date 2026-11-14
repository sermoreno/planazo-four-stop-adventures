import {afterAll,describe,expect,it} from 'vitest';
import postgres from 'postgres';
const url=process.env['SUPABASE_DB_URL'];
const sql=url?postgres(url,{max:1,prepare:false}):null;
const owner='48671d16-d2ad-4c58-9918-c21927c12951';
const other='eed0a79f-6f85-4db3-9257-65621b0581c9';
async function fixture(run:(tx:any,id:string,pref:string)=>Promise<void>,identity=owner,role='authenticated'){
  if(!sql)throw new Error('Database connection is required');
  // Every fixture and mutation is rolled back; existing account data is never changed permanently.
  const rollback=new Error('rollback fixture');
  try{await sql.begin(async tx=>{
    const [p]=await tx`insert into public.preferences(user_id,companions) values(${owner},'familia') returning id`;
    const [i]=await tx`insert into public.itineraries(user_id,title,preference_id) values(${owner},'Prueba temporal RLS',${p.id}) returning id`;
    await tx`insert into public.itinerary_items(itinerary_id,place_id) select ${i.id},id from public.places limit 1`;
    await tx`insert into public.chat_messages(itinerary_id,role,content) values(${i.id},'user','Prueba temporal')`;
    await tx`select set_config('request.jwt.claim.sub',${identity},true),set_config('request.jwt.claims',${JSON.stringify({sub:identity,role})},true)`;
    await tx.unsafe(`set local role ${role==='anon'?'anon':'authenticated'}`);
    await run(tx,String(i.id),String(p.id));throw rollback;
  });}catch(e){if(e!==rollback)throw e;}
}
afterAll(async()=>{await sql?.end();});
describe.skipIf(!url)('Live user RLS (rollback fixtures)',()=>{
  it('owner reads their plan, items, preferences and chat',async()=>fixture(async(tx,id,pref)=>{
    expect((await tx`select id from public.itineraries where id=${id}`).length).toBe(1);
    expect((await tx`select id from public.preferences where id=${pref}`).length).toBe(1);
    expect((await tx`select id from public.itinerary_items where itinerary_id=${id}`).length).toBe(1);
    expect((await tx`select id from public.chat_messages where itinerary_id=${id}`).length).toBe(1);
  }));
  it('another user cannot read owner data or profile',async()=>fixture(async(tx,id,pref)=>{
    expect((await tx`select id from public.itineraries where id=${id}`).length).toBe(0);
    expect((await tx`select id from public.preferences where id=${pref}`).length).toBe(0);
    expect((await tx`select id from public.itinerary_items where itinerary_id=${id}`).length).toBe(0);
    expect((await tx`select id from public.chat_messages where itinerary_id=${id}`).length).toBe(0);
    expect((await tx`select id from public.profiles where id=${owner}`).length).toBe(0);
  },other));
  it('another user cannot update or delete a plan',async()=>fixture(async(tx,id)=>{
    expect((await tx`update public.itineraries set title='No permitido' where id=${id} returning id`).length).toBe(0);
    expect((await tx`delete from public.itineraries where id=${id} returning id`).length).toBe(0);
  },other));
  it('owner can update display name but cannot elevate plan tier',async()=>fixture(async tx=>{
    expect((await tx`update public.profiles set display_name='Perfil temporal' where id=${owner} returning id`).length).toBe(1);
    await expect(tx.savepoint(async(s:any)=>{await s`update public.profiles set plan_tier='premium' where id=${owner}`;})).rejects.toMatchObject({code:'42501'});
  }));
  it('cannot create plans as another user',async()=>fixture(async tx=>{
    await expect(tx.savepoint(async(s:any)=>{await s`insert into public.itineraries(user_id,title) values(${other},'No permitido')`;})).rejects.toMatchObject({code:'42501'});
  }));
  it('cannot link a new plan to another user preferences',async()=>fixture(async(tx,_id,pref)=>{
    await expect(tx.savepoint(async(s:any)=>{await s`insert into public.itineraries(user_id,title,preference_id) values(${other},'No permitido',${pref})`;})).rejects.toMatchObject({code:'42501'});
  },other));
  it('anonymous callers cannot read private tables but can read catalog',async()=>fixture(async tx=>{
    await expect(tx.savepoint(async(s:any)=>{await s`select id from public.itineraries`;})).rejects.toMatchObject({code:'42501'});
    expect((await tx`select id from public.places limit 1`).length).toBe(1);
  },owner,'anon'));
  it('shared RPC hides private plans and exposes only an explicitly published slug',async()=>fixture(async(tx,id)=>{
    const [row]=await tx`select share_slug from public.itineraries where id=${id}`;
    expect((await tx`select public.read_shared_plan(${row.share_slug}) as plan`)[0].plan).toBeNull();
    await tx`update public.itineraries set is_public=true where id=${id}`;
    await tx`set local role anon`;
    const [shared]=await tx`select public.read_shared_plan(${row.share_slug}) as plan`;
    expect(shared.plan.title).toBe('Prueba temporal RLS');expect(shared.plan.user_id).toBeUndefined();
    expect((await tx`select public.read_shared_plan('invalid-slug') as plan`)[0].plan).toBeNull();
  }));
});