import {it,expect} from 'vitest';import {suggestIndoor,heatWarning,nextWeekendDates,parseForecast} from '@/features/planazo/weather';
it('sugiere bajo techo desde 50 % de lluvia',()=>{expect(suggestIndoor(49)).toBe(false);expect(suggestIndoor(50)).toBe(true);});
it('avisa de calor desde 34 °C',()=>{expect(heatWarning(33.9)).toBe(false);expect(heatWarning(34)).toBe(true);});
it('calcula el próximo fin de semana',()=>{expect(nextWeekendDates(new Date(2026,10,12))).toEqual({sat:'2026-11-14',sun:'2026-11-15'});expect(nextWeekendDates(new Date(2026,10,15))).toEqual({sat:'2026-11-14',sun:'2026-11-15'});});
it('rechaza previsiones incompletas',()=>{expect(()=>parseForecast({daily:{}})).toThrow();});
