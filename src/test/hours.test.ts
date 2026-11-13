import {describe,it,expect} from 'vitest';
import {getPublishedHours} from '@/features/planazo/hours';
describe('Horarios publicados',()=>{
  it('no presenta el horario de muestra de 10 a 20 como un horario real',()=>{
    expect(getPublishedHours({opening_hours:{sat:[10,20],sun:[10,20]},external_url:'https://www.esmadrid.com'}).status).toBe('unconfirmed');
  });
  it('conserva el cierre a medianoche del Retiro en verano y a las 22 en invierno',()=>{
    const hours=getPublishedHours({external_url:null,opening_hours:{published:{status:'published',source:'https://www.esmadrid.com/informacion-turistica/parque-del-retiro',periods:[{label:'Verano · abril–septiembre',hours:'Todos los días · 06:00–00:00 (medianoche)'},{label:'Invierno · octubre–marzo',hours:'Todos los días · 06:00–22:00'}]}}});
    expect(hours.periods[0]?.hours).toBe('Todos los días · 06:00–00:00 (medianoche)');
    expect(hours.periods[1]?.hours).toBe('Todos los días · 06:00–22:00');
  });
  it('no inventa horas fijas para calendarios variables como Faunia',()=>{
    const hours=getPublishedHours({external_url:null,opening_hours:{published:{status:'calendar',source:'https://www.faunia.es/horarios-y-precios/horarios',periods:[]}}});
    expect(hours.status).toBe('calendar');expect(hours.periods).toHaveLength(0);
  });
});