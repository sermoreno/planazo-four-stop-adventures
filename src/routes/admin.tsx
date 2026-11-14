import {createFileRoute,Link} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';
import {ShieldCheck,ShieldAlert} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Header,Footer} from '@/features/planazo/header';
import {usePlanazo} from '@/features/planazo/context';
import {getAdminProfile} from '@/features/planazo/admin.functions';

export const Route=createFileRoute('/admin')({
  head:()=>({meta:[{title:'Administración · Planazo'},{name:'description',content:'Acceso exclusivo al perfil administrador de Planazo.'},{property:'og:title',content:'Administración · Planazo'},{property:'og:description',content:'Área de administración de Planazo.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex,nofollow'}]}),
  component:Admin,
});

function Admin(){
  const {user,authReady,isAdmin}=usePlanazo();
  const profile=useQuery({queryKey:['admin-profile',user?.id],enabled:authReady&&!!user&&isAdmin,queryFn:()=>getAdminProfile()});
  return <><Header/><main className="page-width content-page"><div className="account-form">
    {!authReady?<p role="status">Comprobando acceso…</p>:!user?<><ShieldAlert className="text-muted-foreground mb-4"/><h1>Administración.</h1><Button asChild className="mt-6"><Link to="/cuenta">Entrar</Link></Button></>:!isAdmin?<><ShieldAlert className="text-muted-foreground mb-4"/><h1>Acceso restringido.</h1><p>Tu cuenta no tiene permisos de administración.</p><Button asChild variant="outline" className="mt-6"><Link to="/">Volver a descubrir</Link></Button></>:profile.isPending?<p role="status">Cargando perfil administrador…</p>:profile.isError?<p role="alert">No se pudo comprobar el acceso de administrador.</p>:<><ShieldCheck className="text-primary mb-4"/><h1>Administración.</h1><p className="font-semibold">{profile.data.displayName||'Administrador'}</p><p className="break-words">{String(profile.data.email??'')}</p><p className="text-primary font-semibold mt-4">Perfil de administrador</p><Button asChild variant="outline" className="mt-6"><Link to="/cuenta">Mi cuenta</Link></Button></>}
  </div></main><Footer/></>;
}