import {createServerFn} from '@tanstack/react-start';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {requireAdminRole} from './admin-access';

export const getAdminAccess=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {data,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(error)throw new Error('No se pudieron comprobar los permisos.');
  return data===true;
});

export const getAdminProfile=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  await requireAdminRole(async()=>{
    const {data,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
    return !error && data===true;
  });
  const {data,error}=await context.supabase.from('profiles').select('display_name').eq('id',context.userId).single();
  if(error)throw new Error('No se pudo cargar el perfil administrador.');
  return {displayName:data.display_name,email:context.claims.email};
});