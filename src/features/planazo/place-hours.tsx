import {Clock,ExternalLink} from 'lucide-react';
import type {Place} from './model';
import {getPublishedHours} from './hours';

export function PlaceHours({place}:{place:Place}){
  const hours=getPublishedHours(place);
  return <div className="my-3 min-w-0 space-y-1 text-xs leading-relaxed text-muted-foreground" aria-label={`Horarios de ${place.name}`}>
    <div className="flex items-center gap-1.5 font-semibold text-foreground"><Clock size={13}/>{hours.status==='unconfirmed'?'Horario pendiente de confirmar':hours.status==='calendar'?'Horario según fecha':'Apertura y cierre'}</div>
    {hours.periods.map(period=><div key={period.label}><span className="font-medium">{period.label}: </span>{period.hours}</div>)}
    {hours.status==='unconfirmed'&&<p>Verano e invierno: no hay horas contrastadas.</p>}
    {hours.note&&<p>{hours.note}</p>}
    <a className="inline-flex items-center gap-1 underline underline-offset-2" href={hours.source} target="_blank" rel="noreferrer">{hours.status==='unconfirmed'?'Consultar web del lugar':'Fuente oficial'}<ExternalLink size={11}/></a>
    {hours.checked_on&&<span className="block">Consultado: {hours.checked_on.split('-').reverse().join('/')} · Puede haber cierres excepcionales.</span>}
  </div>;
}