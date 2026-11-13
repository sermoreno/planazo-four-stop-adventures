import {describe,it,expect} from 'vitest';
import {groupByZone,isRestaurant,canWalk,nearestWalk,type Place} from '@/features/planazo/model';
const p=(id:string,zone:string,lat:number,lng:number,category='cultura')=>({id,name:id,neighborhood:zone,lat,lng,category} as unknown as Place);
describe('zonas',()=>{
 it('agrupa por zona con centro medio',()=>{const z=groupByZone([p('a','Centro',40,-3),p('b','Centro',40.2,-3.2),p('c','Aranjuez',40.03,-3.6)]);expect(z[0]?.name).toBe('Centro');expect(z[0]?.lat).toBeCloseTo(40.1);});
 it('gastronomía cuenta como restaurante',()=>{expect(isRestaurant(p('a','C',0,0,'gastronomía'))).toBe(true);expect(isRestaurant(p('a','C',0,0,'naturaleza'))).toBe(false);});
 it('no ofrece ruta a pie a más de 8 km',()=>{expect(canWalk(p('a','C',40.4168,-3.7038),p('b','E',40.589,-4.147))).toBe(false);});
 it('paseo de zona excluye lugares lejanos',()=>{expect(nearestWalk([p('a','C',40.4168,-3.7038),p('b','C',40.42,-3.70),p('c','C',40.9,-3.9)]).map(x=>x.id)).toEqual(['a','b']);});
});
