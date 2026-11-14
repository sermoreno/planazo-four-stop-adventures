import {useQuery} from '@tanstack/react-query';
import {CloudRain,Sun} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {MADRID,forecastQuery,nextWeekendDates,dayForecast,describe,suggestIndoor,heatWarning,hourAt,RAIN_THRESHOLD} from './weather';
import type {Preferences,Slot} from './model';
const label=(d:string)=>new Date(`${d}T12:00`).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'short'});
export function WeekendWeather({prefs,onRain}:{prefs:Preferences;onRain:(v:boolean)=>void}){
  const {data}=useQuery(forecastQuery(MADRID.lat,MADRID.lng));if(!data)return null;
  const {sat,sun}=nextWeekendDates(new Date());const days=[dayForecast(data,sat),dayForecast(data,sun)].filter(d=>d!==null);if(!days.length)return null;
  const chosen=prefs.day==='Sábado'?[days[0]]:prefs.day==='Domingo'?[days[1]]:days;const rainy=chosen.some(d=>d&&suggestIndoor(d.rain));
  return <section className="weather-card" aria-label="Previsión del fin de semana"><div className="weather-days">{days.map(d=>{const w=describe(d.code);return <div key={d.date}><span className="capitalize">{label(d.date)}</span><b>{w.icon} {d.max}° / {d.min}°</b><small>{w.text} · lluvia {d.rain} %</small></div>;})}</div>{rainy&&<div className="weather-alert"><CloudRain size={16}/><span>Parece que lloverá: ¿preparamos un plan bajo techo?</span><Button type="button" size="sm" variant={prefs.rain?'default':'outline'} onClick={()=>onRain(!prefs.rain)}>{prefs.rain?'Plan bajo techo activado':'Sí, bajo techo'}</Button></div>}<small className="weather-source">Previsión: Open-Meteo</small></section>;
}
export function PlanWeather({slots,prefs,onRain}:{slots:Slot[];prefs:Preferences;onRain?:()=>void}){
  const lat=slots.length?slots.reduce((s,x)=>s+x.place.lat,0)/slots.length:MADRID.lat;const lng=slots.length?slots.reduce((s,x)=>s+x.place.lng,0)/slots.length:MADRID.lng;
  const {data}=useQuery(forecastQuery(lat,lng));if(!data)return null;const {sat,sun}=nextWeekendDates(new Date());const date=prefs.day==='Domingo'?sun:sat;const day=dayForecast(data,date);if(!day)return null;const w=describe(day.code);const warn=suggestIndoor(day.rain)||heatWarning(day.max);
  return <section className="weather-card" aria-label="Tiempo del plan"><div className="weather-head"><b>{w.icon} <span className="capitalize">{label(date)}</span> · {day.max}° / {day.min}° · lluvia {day.rain} %</b></div><ul className="weather-hours">{slots.map((s,i)=>{const h=hourAt(data,date,s.start_time);return h?<li key={`${s.place.id}-${i}`}>{s.start_time} · {s.place.name} · <b>{h.temp}°</b>{h.rain>=RAIN_THRESHOLD?` · lluvia ${h.rain} %`:''}</li>:null;})}</ul>{warn&&!prefs.rain&&<div className="weather-alert">{heatWarning(day.max)?<Sun size={16}/>:<CloudRain size={16}/>}<span>{heatWarning(day.max)?'Hará mucho calor: mejor lugares bajo techo en las horas centrales.':'Probable lluvia: te recomendamos el plan de lluvia.'}</span>{onRain&&<Button size="sm" variant="outline" onClick={onRain}><CloudRain/>Plan de lluvia</Button>}</div>}<small className="weather-source">Previsión: Open-Meteo</small></section>;
}

