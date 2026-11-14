import {createFileRoute,useNavigate,Link} from '@tanstack/react-router';
import {useState,useEffect,type FormEvent} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {Mail,LogOut,Check,UserRound,LockKeyhole} from 'lucide-react';
import {supabase} from '@/integrations/supabase/client';
import {usePlanazo,profileKey} from '@/features/planazo/context';
import {Header,Footer} from '@/features/planazo/header';
import {Button} from '@/components/ui/button';
import {SocialLogin} from '@/features/planazo/social-login';
import {authMessage,validPassword} from '@/features/planazo/auth-rules';
import {toast} from 'sonner';
import {useSubscription} from '@/features/planazo/use-subscription';
export const Route=createFileRoute('/cuenta')({head:()=>({meta:[{title:'Tu cuenta · Planazo'},{name:'description',content:'Crea tu cuenta, entra y guarda tus planes de Madrid.'},{property:'og:title',content:'Tu cuenta · Planazo'},{property:'og:description',content:'Tu perfil y tus próximos fines de semana en Madrid.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:Account});
function Account(){
  const {user,displayName}=usePlanazo();const {isPremium}=useSubscription();const navigate=useNavigate();const queryClient=useQueryClient();
  const [mode,setMode]=useState<'login'|'signup'|'magic'|'forgot'>('login');
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [name,setName]=useState('');
  const [sent,setSent]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  useEffect(()=>{let active=true;setName('');if(user)void supabase.from('profiles').select('display_name').eq('id',user.id).single().then(({data,error})=>{if(active){setName(data?.display_name??'');if(error)toast.error('No se pudo cargar el perfil.');}});return()=>{active=false;};},[user?.id]);
  function switchMode(next:typeof mode){setMode(next);setSent(false);setError('');setPassword('');}
  async function send(e:FormEvent){e.preventDefault();setError('');if((mode==='login'||mode==='signup')&&!validPassword(password)){setError('La contraseña debe tener al menos 8 caracteres.');return;}setBusy(true);
    try{
      if(mode==='signup'){const {error}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin,data:{display_name:name.trim()}}});if(error)throw error;setSent(true);}
      else if(mode==='login'){const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;setPassword('');}
      else if(mode==='magic'){const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin}});if(error)throw error;setSent(true);}
      else{const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/reset-password`});if(error)throw error;setSent(true);}
    }catch(e){setError(authMessage(e instanceof Error?e.message:''));}finally{setBusy(false);}
  }
  async function update(){if(!user)return;setBusy(true);try{const {data,error}=await supabase.from('profiles').update({display_name:name.trim(),home_city:'Madrid'}).eq('id',user.id).select('id').single();if(error||!data)throw error;toast.success('Perfil actualizado.');void queryClient.invalidateQueries({queryKey:profileKey(user.id)});}catch{toast.error('No se pudo guardar el perfil.');}finally{setBusy(false);}}
  async function signOut(){setBusy(true);await queryClient.cancelQueries();queryClient.clear();const {error}=await supabase.auth.signOut();if(error){toast.error('No se pudo cerrar sesión.');setBusy(false);return;}setEmail('');setPassword('');setName('');setSent(false);setBusy(false);await navigate({to:'/cuenta',replace:true});}
  return <><Header/><main className="page-width content-page"><div className="account-form">{user?<><UserRound className="text-primary mb-4"/><h1>Hola, {displayName}.</h1><p className="mb-2">Tu rincón en Planazo.</p><p className="break-words">{user.email}</p><label htmlFor="name">Nombre visible</label><input id="name" className="field-input" value={name} onChange={e=>setName(e.target.value)} maxLength={80}/><label>Tu provincia</label><p>Madrid</p><Button className="form-submit" disabled={busy} onClick={()=>void update()}><Check/>Guardar perfil</Button><Link to="/precios" className="premium-badge mt-6">{isPremium?'Premium · planes guardados sin límite':'Gratis · 3 planes · Descubre Premium por 4,99 €/mes'}</Link><Button variant="outline" className="form-submit" asChild><Link to="/mis-planes">Mis planes</Link></Button><Button variant="ghost" className="mt-5" disabled={busy} onClick={()=>void signOut()}><LogOut/>Cerrar sesión</Button></>:sent?<><Mail className="text-primary mb-4"/><h1>Revisa tu correo.</h1><p role="status">{mode==='signup'?'Confirma tu email para activar tu cuenta.':mode==='forgot'?'Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña.':'Recibirás un enlace para entrar en Planazo.'} Si no lo ves, comprueba la carpeta de spam.</p><Button variant="ghost" className="mt-5" onClick={()=>switchMode('login')}>Volver al acceso</Button></>:<>
    <LockKeyhole className="text-primary mb-4"/><h1>{mode==='signup'?'Crea tu cuenta.':mode==='forgot'?'Recupera tu acceso.':'Tus planazos, contigo.'}</h1>
    {(mode==='login'||mode==='signup')&&<div className="auth-tabs" role="tablist" aria-label="Acceso"><Button role="tab" aria-selected={mode==='login'} variant={mode==='login'?'secondary':'ghost'} onClick={()=>switchMode('login')}>Entrar</Button><Button role="tab" aria-selected={mode==='signup'} variant={mode==='signup'?'secondary':'ghost'} onClick={()=>switchMode('signup')}>Crear cuenta</Button></div>}
    <form onSubmit={send}>{mode==='signup'&&<><label htmlFor="signup-name">Nombre visible</label><input id="signup-name" className="field-input" autoComplete="nickname" maxLength={80} value={name} onChange={e=>setName(e.target.value)}/></>}<label htmlFor="email">Tu email</label><input id="email" required type="email" autoComplete="email" className="field-input" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>{(mode==='login'||mode==='signup')&&<><label htmlFor="password">Contraseña</label><input id="password" required type="password" minLength={8} autoComplete={mode==='signup'?'new-password':'current-password'} className="field-input" value={password} onChange={e=>setPassword(e.target.value)}/>{mode==='signup'&&<p>Mínimo 8 caracteres.</p>}</>}{error&&<p role="alert" className="text-destructive">{error}</p>}<Button className="form-submit" type="submit" disabled={busy}><Mail/>{busy?'Un momento…':mode==='signup'?'Crear cuenta':mode==='forgot'?'Enviar enlace de recuperación':mode==='magic'?'Enviarme un enlace':'Entrar'}</Button></form>
    <div className="auth-links">{mode==='login'?<><Button variant="link" onClick={()=>switchMode('forgot')}>¿Olvidaste tu contraseña?</Button><Button variant="link" onClick={()=>switchMode('magic')}>Entrar con enlace por email</Button></>:<Button variant="link" onClick={()=>switchMode('login')}>Volver al acceso</Button>}</div>
    {(mode==='login'||mode==='signup')&&<><div className="auth-divider">o</div><SocialLogin disabled={busy}/></>}<p>Gratis: hasta 3 planes guardados.</p>
  </>}</div></main><Footer/></>;
}
