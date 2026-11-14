import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {useRouter} from '@tanstack/react-router';
import {useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import type {User} from '@supabase/supabase-js';
import {defaults,type Plan,type Preferences} from './model';
const Context=createContext<{preferences:Preferences;setPreferences:(p:Preferences)=>void;plan:Plan|null;setPlan:(p:Plan)=>void;user:User|null}>({preferences:defaults,setPreferences:()=>{},plan:null,setPlan:()=>{},user:null});
export function PlanazoProvider({children}:{children:ReactNode}){const router=useRouter();const queryClient=useQueryClient();const [preferences,setPreferences]=useState(defaults);const [plan,setPlanState]=useState<Plan|null>(null);const [user,setUser]=useState<User|null>(null);useEffect(()=>{const {data}=supabase.auth.onAuthStateChange((event,session)=>{setUser(session?.user??null);if(event==='SIGNED_OUT'){setPlanState(null);setPreferences(defaults);sessionStorage.removeItem('planazo-draft');queryClient.clear();}if(event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='USER_UPDATED'){void router.invalidate();if(event!=='SIGNED_OUT')void queryClient.invalidateQueries();}} );void supabase.auth.getUser().then(({data})=>setUser(data.user));const saved=sessionStorage.getItem('planazo-draft');if(saved)try{setPlanState(JSON.parse(saved));}catch{sessionStorage.removeItem('planazo-draft');}return ()=>data.subscription.unsubscribe();},[router,queryClient]);function setPlan(p:Plan){setPlanState(p);sessionStorage.setItem('planazo-draft',JSON.stringify(p));}return <Context.Provider value={{preferences,setPreferences,plan,setPlan,user}}>{children}</Context.Provider>;}
export const usePlanazo=()=>useContext(Context);
