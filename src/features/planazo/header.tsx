import {Link,useLocation,useNavigate} from '@tanstack/react-router';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {Compass,MapPin,ArrowUpRight,UserRound,Bookmark,Plus,LogOut,ChevronDown,ShieldCheck} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {supabase} from '@/integrations/supabase/client';
import {usePlanazo} from './context';
import {FREE_LIMIT} from './model';
import {useSubscription} from './use-subscription';

function UserMenu(){
  const {user,displayName,isAdmin}=usePlanazo();const {isPremium}=useSubscription();const navigate=useNavigate();const qc=useQueryClient();
  const count=useQuery({queryKey:['plan-count',user?.id],enabled:!!user,queryFn:async()=>{if(!user)return 0;const {count}=await supabase.from('itineraries').select('id',{count:'exact',head:true}).eq('user_id',user.id);return count??0;}});
  async function signOut(){await qc.cancelQueries();qc.clear();const {error}=await supabase.auth.signOut();if(error){toast.error('No se pudo cerrar sesión.');return;}toast.success('Sesión cerrada.');await navigate({to:'/'});}
  const initial=(displayName[0]??'?').toUpperCase();
  return <DropdownMenu><DropdownMenuTrigger asChild><button className="user-chip" aria-label={`Menú de ${displayName}`}><span className="user-avatar" aria-hidden="true">{initial}</span><span className="user-name">{displayName}</span><ChevronDown size={15} aria-hidden="true"/></button></DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-64"><DropdownMenuLabel><div className="font-bold">Hola, {displayName}</div><div className="text-xs font-normal text-muted-foreground break-all">{user?.email}</div></DropdownMenuLabel><DropdownMenuSeparator/>
  <DropdownMenuItem asChild><Link to="/cuenta"><UserRound/>Mi cuenta</Link></DropdownMenuItem>
  {isAdmin&&<DropdownMenuItem asChild><Link to="/admin"><ShieldCheck/>Administración</Link></DropdownMenuItem>}
  <DropdownMenuItem asChild><Link to="/mis-planes"><Bookmark/>Mis planes<span className="ml-auto text-xs text-muted-foreground">{isPremium?'Premium':<>{count.data??'–'} de {FREE_LIMIT}</>}</span></Link></DropdownMenuItem>
  <DropdownMenuItem asChild><Link to="/plan/nuevo"><Plus/>Crear plan</Link></DropdownMenuItem><DropdownMenuSeparator/>
  <DropdownMenuItem onSelect={()=>void signOut()}><LogOut/>Cerrar sesión</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
}
export function Header(){const {user,authReady}=usePlanazo();const path=useLocation().pathname;return <header className="site-header"><div className="page-width header-inner"><Link to="/" className="wordmark"><Compass aria-hidden="true"/>planazo<span className="logo-dot">.</span></Link><nav aria-label="Navegación principal"><Link to="/" className={path==='/'?'active':''}>Descubrir</Link><Link to="/explorar" className={path==="/explorar"?"active":""}>Explorar</Link><Link to="/mis-planes" className={path==='/mis-planes'?'active':''}>Mis planes</Link><Link to="/precios" className={path==='/precios'?'active':''}>Precios</Link></nav><div className="header-actions"><span className="location-label"><MapPin size={15}/> Provincia de Madrid</span>{!authReady?<span className="user-chip-skeleton" aria-hidden="true"/>:user?<UserMenu/>:<Button variant="outline" asChild><Link to="/cuenta"><UserRound/>Entrar<ArrowUpRight/></Link></Button>}</div></div></header>;}
export function Footer(){return <footer className="page-width site-footer"><Link to="/" className="wordmark"><Compass/>planazo.</Link><span>Los mejores planes empiezan con ganas.</span><span>Hecho para disfrutar Madrid · 2026</span></footer>;}
