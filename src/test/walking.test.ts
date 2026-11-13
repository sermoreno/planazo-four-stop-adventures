import {it,expect} from 'vitest';import {parseWalkingRoute,WALKING_ENDPOINT} from '@/features/planazo/walking';
it('usa el servicio con perfil peatonal, no el servidor de coche',()=>{expect(WALKING_ENDPOINT).toBe('https://routing.openstreetmap.de/routed-foot/route/v1/foot/');});
it('convierte segundos de trayecto peatonal a minutos y coordenadas',()=>{const route=parseWalkingRoute({code:'Ok',routes:[{distance:1002.1,duration:801.7,legs:[{distance:1002.1,duration:801.7}],geometry:{coordinates:[[-3.726,40.425],[-3.7235,40.4295]]}}]});expect(route.minutes).toEqual([14]);expect(route.coordinates[0]).toEqual([40.425,-3.726]);});
it('rechaza rutas incompletas',()=>{expect(()=>parseWalkingRoute({code:'Ok',routes:[]})).toThrow();});
